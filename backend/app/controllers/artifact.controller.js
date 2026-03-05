const fs = require("fs");
const path = require("path");
const os = require("os");
const childProcess = require("child_process");
const multer = require("multer");
const util = require("util");

const db = require("../models");
const Artifact = db.artifacts;
const Case = db.cases;

const ARTIFACT_CATEGORIES = ["图片", "视频", "课程材料"];
const BULK_MAX_ZIP_BYTES = Number(process.env.CASE_BULK_ZIP_MAX_BYTES || 1024 * 1024 * 1024); // 1GB default
const BULK_MAX_FILE_BYTES = Number(process.env.CASE_BULK_FILE_MAX_BYTES || 512 * 1024 * 1024); // 512MB default
const BULK_DB_BATCH_SIZE = Number(process.env.CASE_BULK_DB_BATCH_SIZE || 100);
const BULK_SKIPPED_REPORT_LIMIT = Number(process.env.CASE_BULK_SKIPPED_REPORT_LIMIT || 200);

const mustConfirm = (value) => value === true || value === "true" || value === "1";

const getCaseDirectory = (caseId) => {
  const dir = path.join(`${__dirname}/../../upload`, "Case", `${caseId}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const caseId = req.params.caseId || req.body.caseId;
    cb(null, getCaseDirectory(caseId));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadSingle = util.promisify(multer({ storage }).single("file"));
const uploadBulkZip = util.promisify(
  multer({
    storage,
    limits: { fileSize: BULK_MAX_ZIP_BYTES },
  }).single("file")
);

const inferArtifactType = (filename = "") => {
  const ext = path.extname(filename).toLowerCase().replace(/^\./, "");
  return ext || "bin";
};

const inferMime = (filename = "") => {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg"].includes(ext)) return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".pdf") return "application/pdf";
  if ([".mp4", ".m4v"].includes(ext)) return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".ogg") return "audio/ogg";
  return "application/octet-stream";
};

const listFilesRecursively = (rootDir) => {
  const files = [];
  if (!fs.existsSync(rootDir)) return files;

  const walk = (currentDir) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else files.push(fullPath);
    }
  };

  walk(rootDir);
  return files;
};

const moveFileAtomic = (fromPath, toPath) => {
  try {
    fs.renameSync(fromPath, toPath);
  } catch (e) {
    if (e && e.code === "EXDEV") {
      fs.copyFileSync(fromPath, toPath);
      fs.unlinkSync(fromPath);
      return;
    }
    throw e;
  }
};

const resolveCategoryFromPathParts = (parts) => {
  for (let i = 0; i < parts.length; i += 1) {
    if (ARTIFACT_CATEGORIES.includes(parts[i])) {
      return { category: parts[i], categoryIndex: i };
    }
  }
  return { category: null, categoryIndex: -1 };
};

exports.create = async (req, res) => {
  try {
    await uploadSingle(req, res);

    const caseId = Number(req.params.caseId);
    const { description, category } = req.body;

    if (!Number.isInteger(caseId) || caseId <= 0) {
      return res.status(422).send({ message: "案例 ID 无效。" });
    }
    if (!ARTIFACT_CATEGORIES.includes(category)) {
      return res.status(422).send({ message: "附件分类无效，必须是 图片/视频/课程材料。" });
    }
    if (!req.file) {
      return res.status(422).send({ message: "请上传附件文件。" });
    }

    const c = await Case.findByPk(caseId);
    if (!c) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).send({ message: "案例不存在。" });
    }

    const data = await Artifact.create({
      caseId,
      description,
      category,
      type: inferArtifactType(req.file.originalname),
      attachmentPath: path.resolve(req.file.path),
      attachmentName: req.file.originalname,
      attachmentMime: req.file.mimetype,
      attachmentSize: req.file.size,
    });

    return res.send(data);
  } catch (err) {
    return res.status(500).send({
      message: err.message || "创建附件时发生错误。",
    });
  }
};

exports.bulkCreateFromZip = async (req, res) => {
  let uploadedZipPath = null;
  let extractDir = null;
  const createdFilePaths = [];
  const skipped = [];

  try {
    await uploadBulkZip(req, res);

    const caseId = Number(req.params.caseId);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(422).send({ message: "案例 ID 无效。" });
    }
    if (!req.file) {
      return res.status(422).send({ message: "请上传 zip 文件。" });
    }

    uploadedZipPath = req.file.path;
    if (path.extname(req.file.originalname || "").toLowerCase() !== ".zip") {
      if (fs.existsSync(uploadedZipPath)) fs.unlinkSync(uploadedZipPath);
      return res.status(422).send({ message: "仅支持 .zip 文件。" });
    }

    const c = await Case.findByPk(caseId);
    if (!c) {
      if (fs.existsSync(uploadedZipPath)) fs.unlinkSync(uploadedZipPath);
      return res.status(404).send({ message: "案例不存在。" });
    }

    extractDir = fs.mkdtempSync(path.join(getCaseDirectory(caseId), "bulkzip-"));
    try {
      childProcess.execFileSync("unzip", ["-qq", uploadedZipPath, "-d", extractDir], { stdio: "pipe" });
    } catch (e) {
      if (fs.existsSync(uploadedZipPath)) fs.unlinkSync(uploadedZipPath);
      if (extractDir && fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
      return res.status(422).send({ message: "zip 解压失败，请确认文件格式正确。" });
    }

    const extractedFiles = listFilesRecursively(extractDir);
    const pendingRows = [];

    const flushPendingRows = async () => {
      if (pendingRows.length === 0) return { created: 0 };
      let created = 0;
      try {
        await Artifact.bulkCreate(
          pendingRows.map((r) => ({
            caseId: r.caseId,
            description: r.description,
            category: r.category,
            type: r.type,
            attachmentPath: r.attachmentPath,
            attachmentName: r.attachmentName,
            attachmentMime: r.attachmentMime,
            attachmentSize: r.attachmentSize,
          }))
        );
        created = pendingRows.length;
      } catch (e) {
        // Fall back to row-by-row to isolate bad rows without failing whole import.
        for (const row of pendingRows) {
          try {
            await Artifact.create({
              caseId: row.caseId,
              description: row.description,
              category: row.category,
              type: row.type,
              attachmentPath: row.attachmentPath,
              attachmentName: row.attachmentName,
              attachmentMime: row.attachmentMime,
              attachmentSize: row.attachmentSize,
            });
            created += 1;
          } catch (singleErr) {
            skipped.push({ path: row.sourcePath, reason: `数据库写入失败: ${singleErr.message}` });
            try {
              if (fs.existsSync(row.attachmentPath)) fs.unlinkSync(row.attachmentPath);
            } catch (removeErr) {
              console.error("删除失败文件失败:", row.attachmentPath, removeErr.message);
            }
          }
        }
      } finally {
        pendingRows.length = 0;
      }
      return { created };
    };

    let createdCount = 0;
    for (const extractedFilePath of extractedFiles) {
      const normalizedName = path.relative(extractDir, extractedFilePath).replace(/\\/g, "/");
      const parts = normalizedName.split("/").filter(Boolean);
      if (parts.length < 1) {
        skipped.push({ path: normalizedName, reason: "路径无效。" });
        continue;
      }
      if (parts[0] === "__MACOSX") continue;
      if (parts.some((x) => x === ".DS_Store")) continue;

      const { category, categoryIndex } = resolveCategoryFromPathParts(parts);
      if (!category) {
        skipped.push({ path: normalizedName, reason: "不支持的分类目录。" });
        continue;
      }
      if (categoryIndex >= parts.length - 1) {
        skipped.push({ path: normalizedName, reason: "分类目录下未找到文件。" });
        continue;
      }

      const originalName = path.basename(extractedFilePath);
      const safeOriginalName = path.basename(originalName);
      if (!safeOriginalName) {
        skipped.push({ path: normalizedName, reason: "文件名无效。" });
        continue;
      }

      const st = fs.statSync(extractedFilePath);
      if (st.size > BULK_MAX_FILE_BYTES) {
        skipped.push({ path: normalizedName, reason: `文件过大，超过 ${BULK_MAX_FILE_BYTES} bytes。` });
        continue;
      }

      const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeOriginalName}`;
      const targetPath = path.join(getCaseDirectory(caseId), storedName);
      moveFileAtomic(extractedFilePath, targetPath);
      createdFilePaths.push(targetPath);

      pendingRows.push({
        sourcePath: normalizedName,
        caseId,
        description: "",
        category,
        type: inferArtifactType(safeOriginalName),
        attachmentPath: path.resolve(targetPath),
        attachmentName: safeOriginalName,
        attachmentMime: inferMime(safeOriginalName),
        attachmentSize: st.size,
      });

      if (pendingRows.length >= BULK_DB_BATCH_SIZE) {
        const batchResult = await flushPendingRows();
        createdCount += batchResult.created;
      }
    }

    const finalBatchResult = await flushPendingRows();
    createdCount += finalBatchResult.created;

    if (uploadedZipPath && fs.existsSync(uploadedZipPath)) fs.unlinkSync(uploadedZipPath);
    if (extractDir && fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });

    return res.send({
      message: "批量导入完成。",
      createdCount,
      skippedCount: skipped.length,
      skipped: skipped.slice(0, BULK_SKIPPED_REPORT_LIMIT),
      skippedTruncated: skipped.length > BULK_SKIPPED_REPORT_LIMIT,
    });
  } catch (err) {
    for (const p of createdFilePaths) {
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch (removeErr) {
        console.error("异常回滚时删除文件失败:", p, removeErr.message);
      }
    }
    if (uploadedZipPath && fs.existsSync(uploadedZipPath)) {
      try {
        fs.unlinkSync(uploadedZipPath);
      } catch (e) {
        console.error("删除上传的 zip 失败:", uploadedZipPath, e.message);
      }
    }
    if (extractDir && fs.existsSync(extractDir)) {
      try {
        fs.rmSync(extractDir, { recursive: true, force: true });
      } catch (e) {
        console.error("删除解压目录失败:", extractDir, e.message);
      }
    }
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(422).send({
        message: `zip 文件过大，超过 ${BULK_MAX_ZIP_BYTES} bytes。`,
      });
    }
    return res.status(500).send({
      message: err.message || "批量导入附件时发生错误。",
    });
  }
};

exports.findByCase = async (req, res) => {
  try {
    const caseId = Number(req.params.caseId);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      return res.status(422).send({ message: "案例 ID 无效。" });
    }

    const data = await Artifact.findAll({
      where: { caseId },
      order: [["id", "DESC"]],
    });
    return res.send(data);
  } catch (err) {
    return res.status(500).send({
      message: err.message || "查询附件列表时发生错误。",
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const data = await Artifact.findByPk(req.params.id);
    if (!data) {
      return res.status(404).send({ message: `未找到附件 id=${req.params.id}。` });
    }
    return res.send(data);
  } catch (err) {
    return res.status(500).send({
      message: err.message || `查询附件 id=${req.params.id} 时发生错误。`,
    });
  }
};

exports.download = async (req, res) => {
  try {
    const data = await Artifact.findByPk(req.params.id);
    if (!data) {
      return res.status(404).send({ message: `未找到附件 id=${req.params.id}。` });
    }
    if (!fs.existsSync(data.attachmentPath)) {
      return res.status(404).send({ message: "附件文件不存在。" });
    }

    return res.download(data.attachmentPath, data.attachmentName);
  } catch (err) {
    return res.status(500).send({
      message: err.message || `下载附件 id=${req.params.id} 时发生错误。`,
    });
  }
};

exports.downloadByCase = async (req, res) => {
  let tmpRootDir = null;
  let stagingDir = null;
  let zipPath = null;

  try {
    const caseId = Number(req.params.caseId);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      return res.status(422).send({ message: "案例 ID 无效。" });
    }

    const c = await Case.findByPk(caseId);
    if (!c) {
      return res.status(404).send({ message: "案例不存在。" });
    }

    const artifacts = await Artifact.findAll({
      where: { caseId },
      attributes: ["id", "category", "attachmentName", "attachmentPath"],
      order: [["id", "ASC"]],
    });

    if (!artifacts || artifacts.length === 0) {
      return res.status(404).send({ message: "该案例暂无可下载附件。" });
    }

    tmpRootDir = fs.mkdtempSync(path.join(os.tmpdir(), `case-${caseId}-artifacts-`));
    stagingDir = path.join(tmpRootDir, "files");
    fs.mkdirSync(stagingDir, { recursive: true });

    let stagedCount = 0;
    for (const artifact of artifacts) {
      if (!artifact.attachmentPath || !fs.existsSync(artifact.attachmentPath)) continue;
      const safeName = path.basename(artifact.attachmentName || `artifact-${artifact.id}`);
      const folderName = ARTIFACT_CATEGORIES.includes(artifact.category) ? artifact.category : "未分类";
      const folderPath = path.join(stagingDir, folderName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const stagedName = `${artifact.id}-${safeName}`;
      const stagedPath = path.join(folderPath, stagedName);
      fs.copyFileSync(artifact.attachmentPath, stagedPath);
      stagedCount += 1;
    }

    if (stagedCount === 0) {
      return res.status(404).send({ message: "附件文件不存在或已丢失，无法打包下载。" });
    }

    zipPath = path.join(tmpRootDir, `case-${caseId}-artifacts.zip`);
    childProcess.execFileSync("zip", ["-q", "-r", zipPath, "."], {
      cwd: stagingDir,
      stdio: "pipe",
    });

    res.download(zipPath, `case-${caseId}-artifacts.zip`, (err) => {
      if (err) {
        console.error("批量下载 zip 响应失败:", err.message);
      }
      if (tmpRootDir && fs.existsSync(tmpRootDir)) {
        try {
          fs.rmSync(tmpRootDir, { recursive: true, force: true });
        } catch (e) {
          console.error("删除批量下载临时目录失败:", tmpRootDir, e.message);
        }
      }
    });
  } catch (err) {
    if (tmpRootDir && fs.existsSync(tmpRootDir)) {
      try {
        fs.rmSync(tmpRootDir, { recursive: true, force: true });
      } catch (e) {
        console.error("异常时删除批量下载临时目录失败:", tmpRootDir, e.message);
      }
    }
    return res.status(500).send({
      message: err.message || "批量下载附件时发生错误。",
    });
  }
};

exports.update = async (req, res) => {
  try {
    await uploadSingle(req, res);
    const id = req.params.id;
    const artifact = await Artifact.findByPk(id);
    if (!artifact) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).send({ message: `未找到附件 id=${id}。` });
    }

    const payload = {
      description: req.body.description !== undefined ? req.body.description : artifact.description,
      category: req.body.category !== undefined ? req.body.category : artifact.category,
      type: artifact.type,
    };

    if (!ARTIFACT_CATEGORIES.includes(payload.category)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(422).send({ message: "附件分类无效，必须是 图片/视频/课程材料。" });
    }

    const oldPath = artifact.attachmentPath;
    if (req.file) {
      payload.attachmentPath = path.resolve(req.file.path);
      payload.attachmentName = req.file.originalname;
      payload.attachmentMime = req.file.mimetype;
      payload.attachmentSize = req.file.size;
      payload.type = inferArtifactType(req.file.originalname);
    }

    await Artifact.update(payload, { where: { id } });

    if (req.file && oldPath && fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (e) {
        console.error("删除旧附件文件失败:", oldPath, e.message);
      }
    }

    return res.send({ message: "附件更新成功。" });
  } catch (err) {
    return res.status(500).send({
      message: err.message || `更新附件 id=${req.params.id} 时发生错误。`,
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  if (!mustConfirm(req.query.confirmDelete)) {
    return res.status(400).send({
      message: "危险操作：将永久删除该附件。请使用 confirmDelete=true 重新提交。",
    });
  }

  try {
    const data = await Artifact.findByPk(id);
    if (!data) {
      return res.status(404).send({ message: `未找到附件 id=${id}。` });
    }

    await Artifact.destroy({ where: { id } });

    if (data.attachmentPath && fs.existsSync(data.attachmentPath)) {
      try {
        fs.unlinkSync(data.attachmentPath);
      } catch (e) {
        console.error("删除附件文件失败:", data.attachmentPath, e.message);
      }
    }

    return res.send({ message: "附件删除成功。" });
  } catch (err) {
    return res.status(500).send({
      message: err.message || `删除附件 id=${id} 时发生错误。`,
    });
  }
};
