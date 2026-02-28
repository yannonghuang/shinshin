const fs = require("fs");
const path = require("path");
const multer = require("multer");
const util = require("util");

const db = require("../models");
const Artifact = db.artifacts;
const Case = db.cases;

const ARTIFACT_TYPES = ["doc", "pdf", "video", "audio"];

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

exports.create = async (req, res) => {
  try {
    await uploadSingle(req, res);

    const caseId = Number(req.params.caseId);
    const { description, category, type } = req.body;

    if (!Number.isInteger(caseId) || caseId <= 0) {
      return res.status(422).send({ message: "案例 ID 无效。" });
    }
    if (!ARTIFACT_TYPES.includes(type)) {
      return res.status(422).send({ message: "附件类型无效，必须是 doc/pdf/video/audio。" });
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
      type,
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
      type: req.body.type !== undefined ? req.body.type : artifact.type,
    };

    if (!ARTIFACT_TYPES.includes(payload.type)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(422).send({ message: "附件类型无效，必须是 doc/pdf/video/audio。" });
    }

    const oldPath = artifact.attachmentPath;
    if (req.file) {
      payload.attachmentPath = path.resolve(req.file.path);
      payload.attachmentName = req.file.originalname;
      payload.attachmentMime = req.file.mimetype;
      payload.attachmentSize = req.file.size;
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
