import React, { useCallback, useEffect, useRef, useState } from "react";
import mammoth from "mammoth/mammoth.browser";
import ArtifactDataService from "../services/artifact.service";
import CaseDataService from "../services/case.service";
import AuthService from "../services/auth.service";
import "./case-management.css";

const ARTIFACT_CATEGORIES = ["图片", "视频", "课程材料"];

const defaultArtifactForm = {
  description: "",
  category: "图片",
  file: null,
};

const CaseDetail = (props) => {
  const caseId = props.match.params.id;
  const [caseData, setCaseData] = useState(null);
  const [artifactForm, setArtifactForm] = useState(defaultArtifactForm);
  const [bulkZipFile, setBulkZipFile] = useState(null);
  const [editingArtifactId, setEditingArtifactId] = useState(null);
  const [editingArtifactForm, setEditingArtifactForm] = useState(defaultArtifactForm);
  const [previewArtifact, setPreviewArtifact] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewMime, setPreviewMime] = useState("");
  const [previewDocxHtml, setPreviewDocxHtml] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("图片");
  const [artifactUploadProgress, setArtifactUploadProgress] = useState(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(null);
  const [isUploadingArtifact, setIsUploadingArtifact] = useState(false);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState(null);
  const [isLoadingCase, setIsLoadingCase] = useState(true);
  const [message, setMessage] = useState("");
  const [dragUploadCategory, setDragUploadCategory] = useState("");
  const [pendingCategoryFiles, setPendingCategoryFiles] = useState([]);
  const categoryFileInputRef = useRef(null);
  const canEdit = AuthService.isVolunteer();
  const goBackToCases = () => props.history.push("/cases");

  const normalizeCategory = (value) => (ARTIFACT_CATEGORIES.includes(value) ? value : "图片");

  const retrieveCase = useCallback(async () => {
    setIsLoadingCase(true);
    try {
      const resp = await CaseDataService.get(caseId);
      setCaseData(resp.data);
    } catch (e) {
      console.log(e);
      setCaseData(null);
      setMessage(e?.response?.data?.message || "加载案例详情失败。");
    } finally {
      setIsLoadingCase(false);
    }
  }, [caseId]);

  useEffect(() => {
    retrieveCase();
  }, [retrieveCase]);

  const onArtifactChange = (e) => {
    const { name, value } = e.target;
    setArtifactForm((prev) => ({ ...prev, [name]: value }));
  };

  const onArtifactFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setArtifactForm((prev) => ({ ...prev, file }));
  };

  const uploadArtifact = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (!artifactForm.file) {
        setMessage("请先选择文件。");
        return;
      }
      const formData = new FormData();
      formData.append("description", artifactForm.description || "");
      formData.append("category", artifactForm.category || "");
      formData.append("file", artifactForm.file);
      setIsUploadingArtifact(true);
      setArtifactUploadProgress(0);
      await ArtifactDataService.create(caseId, formData, (event) => {
        if (!event || !event.total) return;
        const percent = Math.min(100, Math.round((event.loaded * 100) / event.total));
        setArtifactUploadProgress(percent);
      });
      setArtifactForm(defaultArtifactForm);
      setArtifactUploadProgress(100);
      setMessage("附件上传成功。");
      retrieveCase();
    } catch (err) {
      setMessage(err?.response?.data?.message || "上传失败。");
    } finally {
      setIsUploadingArtifact(false);
      setTimeout(() => setArtifactUploadProgress(null), 600);
    }
  };

  const uploadCategoryFiles = async (files, category) => {
    if (!files || files.length === 0) {
      setMessage("请先选择或拖入文件。");
      return;
    }

    setMessage("");
    setIsUploadingArtifact(true);
    setArtifactUploadProgress(0);
    try {
      for (let index = 0; index < files.length; index += 1) {
        const formData = new FormData();
        formData.append("description", "");
        formData.append("category", category);
        formData.append("file", files[index]);
        await ArtifactDataService.create(caseId, formData);
        setArtifactUploadProgress(Math.round(((index + 1) * 100) / files.length));
      }
      setPendingCategoryFiles([]);
      if (categoryFileInputRef.current) {
        categoryFileInputRef.current.value = "";
      }
      setMessage(`已上传 ${files.length} 个文件到 ${category}。`);
      retrieveCase();
    } catch (err) {
      setMessage(err?.response?.data?.message || "分类上传失败。");
    } finally {
      setIsUploadingArtifact(false);
      setDragUploadCategory("");
      setTimeout(() => setArtifactUploadProgress(null), 600);
    }
  };

  const onCategoryFilesPicked = (e) => {
    const files = Array.from(e.target.files || []);
    setPendingCategoryFiles(files);
    if (files.length > 0) {
      setMessage(`已选择 ${files.length} 个文件，请点击下面的分类文件夹上传。`);
    }
  };

  const openCategoryFilePicker = () => {
    if (!isUploadingArtifact && categoryFileInputRef.current) {
      categoryFileInputRef.current.click();
    }
  };

  const onCategoryFolderDragOver = (category) => (e) => {
    e.preventDefault();
    if (!isUploadingArtifact) {
      setDragUploadCategory(category);
    }
  };

  const onCategoryFolderDragLeave = (category) => () => {
    if (dragUploadCategory === category) {
      setDragUploadCategory("");
    }
  };

  const onCategoryFolderDrop = (category) => async (e) => {
    e.preventDefault();
    setDragUploadCategory("");
    if (isUploadingArtifact) return;
    const files = Array.from(e.dataTransfer?.files || []);
    await uploadCategoryFiles(files, category);
  };

  const onBulkZipChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setBulkZipFile(file);
  };

  const uploadBulkZip = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (!bulkZipFile) {
        setMessage("请先选择 zip 文件。");
        return;
      }
      const formData = new FormData();
      formData.append("file", bulkZipFile);
      setIsUploadingBulk(true);
      setBulkUploadProgress(0);
      const resp = await ArtifactDataService.bulkCreate(caseId, formData, (event) => {
        if (!event || !event.total) return;
        const percent = Math.min(100, Math.round((event.loaded * 100) / event.total));
        setBulkUploadProgress(percent);
      });
      const created = resp?.data?.createdCount || 0;
      const skipped = resp?.data?.skippedCount || 0;
      setBulkUploadProgress(100);
      setMessage(`批量导入完成：成功 ${created}，跳过 ${skipped}。`);
      setBulkZipFile(null);
      retrieveCase();
    } catch (err) {
      setMessage(err?.response?.data?.message || "批量导入失败。");
    } finally {
      setIsUploadingBulk(false);
      setTimeout(() => setBulkUploadProgress(null), 800);
    }
  };

  const downloadArtifact = async (artifact) => {
    try {
      const resp = await ArtifactDataService.download(artifact.id);
      const url = window.URL.createObjectURL(
        new Blob([resp.data], { type: artifact.attachmentMime || "application/octet-stream" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", artifact.attachmentName || `artifact-${artifact.id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.log(e);
      setMessage("下载失败。");
    }
  };

  const downloadAllArtifacts = async () => {
    try {
      setMessage("");
      setIsDownloadingBulk(true);
      setBulkDownloadProgress(0);
      const resp = await ArtifactDataService.downloadByCase(caseId, (event) => {
        if (!event) return;
        if (event.total) {
          const percent = Math.min(100, Math.round((event.loaded * 100) / event.total));
          setBulkDownloadProgress(percent);
        }
      });
      const bytes = new Uint8Array(resp.data || []);
      const isZipSignature =
        bytes.length >= 4 &&
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
        (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08);

      if (!isZipSignature) {
        let serverMessage = "批量下载失败：返回内容不是有效 zip。";
        try {
          const text = new TextDecoder("utf-8").decode(bytes);
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed && parsed.message) {
              serverMessage = parsed.message;
            } else {
              serverMessage = text.slice(0, 200);
            }
          }
        } catch (e) {
          // Keep default message.
        }
        throw new Error(serverMessage);
      }

      setBulkDownloadProgress(100);
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `case-${caseId}-artifacts.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("附件打包下载已完成。");
    } catch (err) {
      setMessage(err?.message || err?.response?.data?.message || "批量下载失败。");
    } finally {
      setIsDownloadingBulk(false);
      setTimeout(() => setBulkDownloadProgress(null), 800);
    }
  };

  const previewArtifactContent = async (artifact) => {
    try {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      setPreviewDocxHtml("");
      const resp = await ArtifactDataService.download(artifact.id);
      const mime = artifact.attachmentMime || "application/octet-stream";
      const ext = (artifact.attachmentName || "").toLowerCase().split(".").pop();
      if (
        ext === "docx" ||
        mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.convertToHtml({ arrayBuffer: resp.data });
        setPreviewArtifact(artifact);
        setPreviewMime("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        setPreviewDocxHtml(result.value || "<p>文档内容为空。</p>");
        setPreviewUrl("");
        return;
      }

      const url = window.URL.createObjectURL(new Blob([resp.data], { type: mime }));
      setPreviewArtifact(artifact);
      setPreviewMime(mime);
      setPreviewUrl(url);
    } catch (e) {
      console.log(e);
      setMessage("预览失败。若为 .doc 文件，请使用下载。");
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewArtifact(null);
    setPreviewUrl("");
    setPreviewMime("");
    setPreviewDocxHtml("");
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const deleteArtifact = async (artifact) => {
    const ok = window.confirm("此操作将永久删除该附件，且无法撤销。确定继续吗？");
    if (!ok) return;
    try {
      await ArtifactDataService.delete(artifact.id, true);
      setMessage("附件删除成功。");
      retrieveCase();
    } catch (err) {
      setMessage(err?.response?.data?.message || "删除失败。");
    }
  };

  const startEditArtifact = (artifact) => {
    setEditingArtifactId(artifact.id);
    setEditingArtifactForm({
      description: artifact.description || "",
      category: normalizeCategory(artifact.category),
      file: null,
    });
  };

  const cancelEditArtifact = () => {
    setEditingArtifactId(null);
    setEditingArtifactForm(defaultArtifactForm);
  };

  const onEditArtifactChange = (e) => {
    const { name, value } = e.target;
    setEditingArtifactForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditArtifactFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setEditingArtifactForm((prev) => ({ ...prev, file }));
  };

  const updateArtifact = async (artifactId) => {
    try {
      const formData = new FormData();
      formData.append("description", editingArtifactForm.description || "");
      formData.append("category", editingArtifactForm.category || "");
      if (editingArtifactForm.file) {
        formData.append("file", editingArtifactForm.file);
      }

      await ArtifactDataService.update(artifactId, formData);
      setMessage("附件更新成功。");
      cancelEditArtifact();
      retrieveCase();
    } catch (err) {
      setMessage(err?.response?.data?.message || "更新失败。");
    }
  };

  const artifacts = caseData?.artifacts || caseData?.Artifacts || [];
  const filteredArtifacts = artifacts.filter(
    (artifact) => normalizeCategory(artifact.category) === selectedCategory
  );
  const primarySchool = caseData?.school || (caseData?.schools && caseData.schools[0]) || null;
  const primarySchoolId = caseData?.schoolId || (primarySchool ? primarySchool.id : null);

  if (isLoadingCase) {
    return <div className="container cm-page"><div className="cm-empty">加载中...</div></div>;
  }

  if (!caseData) {
    return (
      <div className="container cm-page">
        <div className="alert alert-danger py-2 mb-0">{message || "加载案例详情失败。"}</div>
      </div>
    );
  }

  return (
    <div className="container cm-page">
      <div className="cm-hero">
        <div className="mb-2">
          <button type="button" className="btn btn-primary" onClick={goBackToCases}>
            返回
          </button>
        </div>
        <h4 className="cm-title">案例详情 #{caseData.id}</h4>
        <p className="cm-subtitle">查看案例基础信息与关联附件。</p>
      </div>

      <div className="cm-card">
        <div><b>年份：</b>{caseData.year || "-"}</div>
        <div><b>描述：</b>{caseData.description}</div>
        <div>
          <b>课程：</b>{caseData.course || caseData.field || "-"}
        </div>
        <div>
          <b>类型：</b>{caseData.category || caseData.topic || "-"}
        </div>
        <div>
          <b>关联学校：</b>
          {primarySchool && primarySchoolId ? (
            <a href={`/schoolsView/${primarySchoolId}`} target="_blank" rel="noopener noreferrer">
              {`${primarySchool.code}-${primarySchool.name}`}
            </a>
          ) : primarySchool ? (
            `${primarySchool.code}-${primarySchool.name}`
          ) : (
            "无"
          )}
        </div>
      </div>

      {canEdit && <div className="cm-card">
        <div className="card-body">
          <h6 className="card-title mb-2">批量上传 zip</h6>
          <p className="text-muted mb-2">
            zip 内需包含 3 个子目录：图片、视频、课程材料。
          </p>
          <form onSubmit={uploadBulkZip}>
            <div className="form-row">
              <div className="form-group col-md-9">
                <input
                  className="form-control"
                  type="file"
                  accept=".zip,application/zip"
                  onChange={onBulkZipChange}
                  disabled={isUploadingBulk}
                />
              </div>
              <div className="form-group col-md-3">
                <button className="btn btn-primary btn-block" type="submit" disabled={isUploadingBulk}>
                  {isUploadingBulk ? "导入中..." : "批量导入"}
                </button>
              </div>
            </div>
            {bulkUploadProgress !== null && (
              <div className="cm-progress-wrap">
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                    role="progressbar"
                    style={{ width: `${bulkUploadProgress}%` }}
                    aria-valuenow={bulkUploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {bulkUploadProgress}%
                  </div>
                </div>
                {isUploadingBulk && bulkUploadProgress === 100 && (
                  <small className="text-muted d-block mt-1">文件已上传，正在服务器处理 zip，请稍候...</small>
                )}
              </div>
            )}
          </form>

          <hr />
          <h6 className="card-title">单个文件上传</h6>
          <form onSubmit={uploadArtifact}>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label>分类</label>
                <select className="form-control" name="category" value={artifactForm.category} onChange={onArtifactChange}>
                  {ARTIFACT_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-3">
                <label>描述</label>
                <input className="form-control" name="description" value={artifactForm.description} onChange={onArtifactChange} />
              </div>
              <div className="form-group col-md-3">
                <label>文件</label>
                <input
                  className="form-control"
                  type="file"
                  onChange={onArtifactFileChange}
                  required
                  disabled={isUploadingArtifact}
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={isUploadingArtifact}>
              {isUploadingArtifact ? "上传中..." : "上传"}
            </button>
            {artifactUploadProgress !== null && (
              <div className="cm-progress-wrap mt-2">
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${artifactUploadProgress}%` }}
                    aria-valuenow={artifactUploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {artifactUploadProgress}%
                  </div>
                </div>
              </div>
            )}
          </form>

          <hr />
          <h6 className="card-title">按类别（图片、视频、课程材料）多文件上传</h6>
          <p className="text-muted mb-2">
            选择多个文件后点击类别文件夹上传，或直接把文件拖到对应类别文件夹。
          </p>
          <input
            ref={categoryFileInputRef}
            type="file"
            multiple
            className="d-none"
            onChange={onCategoryFilesPicked}
            disabled={isUploadingArtifact}
          />
          <div className="cm-upload-toolbar">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={openCategoryFilePicker}
              disabled={isUploadingArtifact}
            >
              选择文件
            </button>
            <span className="text-muted">
              {pendingCategoryFiles.length > 0 ? `已选 ${pendingCategoryFiles.length} 个文件` : "未选择文件"}
            </span>
          </div>
          <div className="cm-folder-row">
            {ARTIFACT_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`cm-folder-btn cm-drop-folder ${dragUploadCategory === category ? "is-dragover" : ""}`}
                onClick={() => uploadCategoryFiles(pendingCategoryFiles, category)}
                onDragOver={onCategoryFolderDragOver(category)}
                onDragEnter={onCategoryFolderDragOver(category)}
                onDragLeave={onCategoryFolderDragLeave(category)}
                onDrop={onCategoryFolderDrop(category)}
                disabled={isUploadingArtifact}
              >
                {category}
                <span className="cm-folder-hint">拖拽到这里，或点击上传已选文件</span>
              </button>
            ))}
          </div>
        </div>
      </div>}

      {message && <div className="alert alert-info py-2">{message}</div>}

      <div className="cm-card">
        <div className="cm-folder-row">
          <button
            type="button"
            className="btn btn btn-primary mr-2"
            onClick={downloadAllArtifacts}
            disabled={isDownloadingBulk}
          >

            {isDownloadingBulk ? "打包中..." : "下载全部附件"}
          </button>
          {bulkDownloadProgress !== null && (
            <div className="cm-progress-wrap w-100 mt-2">
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                  role="progressbar"
                  style={{ width: `${bulkDownloadProgress}%` }}
                  aria-valuenow={bulkDownloadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {bulkDownloadProgress}%
                </div>
              </div>
            </div>
          )}
          {ARTIFACT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`cm-folder-btn ${selectedCategory === category ? "is-active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="cm-table-wrap">
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            {/*<th>ID</th>*/}
            <th>文件名</th>
            <th>类型</th>
            <th>分类</th>
            <th>描述</th>
            <th>大小(bytes)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredArtifacts.map((artifact) => (
            <tr key={artifact.id}>
              {/*<td>{artifact.id}</td>*/}
              <td>{artifact.attachmentName}</td>
              <td>
                {artifact.type}
              </td>
              <td>
                {editingArtifactId === artifact.id ? (
                  <select
                    className="form-control form-control-sm"
                    name="category"
                    value={editingArtifactForm.category}
                    onChange={onEditArtifactChange}
                  >
                    {ARTIFACT_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                ) : (
                  normalizeCategory(artifact.category)
                )}
              </td>
              <td>
                {editingArtifactId === artifact.id ? (
                  <input
                    className="form-control form-control-sm"
                    name="description"
                    value={editingArtifactForm.description}
                    onChange={onEditArtifactChange}
                  />
                ) : (
                  artifact.description
                )}
              </td>
              <td>{artifact.attachmentSize}</td>
              <td>
                <button className="btn btn-link p-0 mr-2" onClick={() => previewArtifactContent(artifact)}>
                  预览
                </button>
                <button className="btn btn-link p-0 mr-2" onClick={() => downloadArtifact(artifact)}>
                  下载
                </button>
                {canEdit && editingArtifactId === artifact.id ? (
                  <>
                    <input className="form-control form-control-sm mb-1" type="file" onChange={onEditArtifactFileChange} />
                    <button className="btn btn-link p-0 mr-2" onClick={() => updateArtifact(artifact.id)}>
                      保存
                    </button>
                    <button className="btn btn-link p-0 mr-2" onClick={cancelEditArtifact}>
                      取消
                    </button>
                  </>
                ) : canEdit ? (
                  <>
                    <button className="btn btn-link p-0 mr-2" onClick={() => startEditArtifact(artifact)}>
                      编辑
                    </button>
                    <button className="btn btn-link p-0 text-danger" onClick={() => deleteArtifact(artifact)}>
                      删除
                    </button>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
          {filteredArtifacts.length === 0 && (
            <tr>
              <td colSpan="7" className="cm-empty">当前分类暂无附件</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {previewArtifact && (previewUrl || previewDocxHtml) && (
        <div className="cm-card mt-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">附件预览：{previewArtifact.attachmentName}</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={closePreview}>
                关闭预览
              </button>
            </div>

            {previewMime.startsWith("image/") && (
              <img src={previewUrl} alt="artifact-preview" style={{ maxWidth: "100%" }} />
            )}
            {previewMime.includes("pdf") && (
              <iframe title="artifact-pdf-preview" src={previewUrl} style={{ width: "100%", height: "600px" }} />
            )}
            {previewMime.startsWith("video/") && (
              <video controls src={previewUrl} style={{ width: "100%" }} />
            )}
            {previewMime.startsWith("audio/") && (
              <audio controls src={previewUrl} style={{ width: "100%" }} />
            )}
            {previewMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <div className="cm-docx-preview border rounded p-3 bg-white">
                <div dangerouslySetInnerHTML={{ __html: previewDocxHtml }} />
              </div>
            )}
            {!previewMime.startsWith("image/") &&
              !previewMime.includes("pdf") &&
              !previewMime.startsWith("video/") &&
              !previewMime.startsWith("audio/") &&
              previewMime !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                <div>
                  当前文件类型不支持内嵌预览，请使用下载。
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
