import React, { useCallback, useEffect, useState } from "react";
import ArtifactDataService from "../services/artifact.service";
import CaseDataService from "../services/case.service";
import AuthService from "../services/auth.service";
import "./case-management.css";

const defaultArtifactForm = {
  description: "",
  category: "",
  type: "doc",
  file: null,
};

const CaseDetail = (props) => {
  const caseId = props.match.params.id;
  const [caseData, setCaseData] = useState(null);
  const [artifactForm, setArtifactForm] = useState(defaultArtifactForm);
  const [editingArtifactId, setEditingArtifactId] = useState(null);
  const [editingArtifactForm, setEditingArtifactForm] = useState(defaultArtifactForm);
  const [previewArtifact, setPreviewArtifact] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewMime, setPreviewMime] = useState("");
  const [message, setMessage] = useState("");
  const canEdit = AuthService.isVolunteer();

  const retrieveCase = useCallback(async () => {
    try {
      const resp = await CaseDataService.get(caseId);
      setCaseData(resp.data);
    } catch (e) {
      console.log(e);
      setMessage("加载案例详情失败。");
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
      formData.append("type", artifactForm.type);
      formData.append("file", artifactForm.file);
      await ArtifactDataService.create(caseId, formData);
      setArtifactForm(defaultArtifactForm);
      setMessage("附件上传成功。");
      retrieveCase();
    } catch (err) {
      setMessage(err?.response?.data?.message || "上传失败。");
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

  const previewArtifactContent = async (artifact) => {
    try {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      const resp = await ArtifactDataService.download(artifact.id);
      const mime = artifact.attachmentMime || "application/octet-stream";
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: mime }));
      setPreviewArtifact(artifact);
      setPreviewMime(mime);
      setPreviewUrl(url);
    } catch (e) {
      console.log(e);
      setMessage("预览失败。");
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewArtifact(null);
    setPreviewUrl("");
    setPreviewMime("");
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
      category: artifact.category || "",
      type: artifact.type || "doc",
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
      formData.append("type", editingArtifactForm.type || "doc");
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

  if (!caseData) {
    return <div className="container cm-page"><div className="cm-empty">加载中...</div></div>;
  }

  return (
    <div className="container cm-page">
      <div className="cm-hero">
        <h4 className="cm-title">案例详情 #{caseData.id}</h4>
        <p className="cm-subtitle">查看案例基础信息与关联附件。</p>
      </div>

      <div className="cm-card">
        <div><b>描述：</b>{caseData.description}</div>
        <div>
          <b>课程：</b>
          {caseData.course ? `${caseData.course.title} (${caseData.course.category || "-"} / ${caseData.course.subcategory || "-"})` : "-"}
        </div>
        <div>
          <b>关联学校：</b>
          {caseData.school
            ? `${caseData.school.code}-${caseData.school.name}`
            : caseData.schools && caseData.schools[0]
              ? `${caseData.schools[0].code}-${caseData.schools[0].name}`
              : "无"}
        </div>
      </div>

      {canEdit && <div className="cm-card">
        <div className="card-body">
          <h6 className="card-title">上传附件</h6>
          <form onSubmit={uploadArtifact}>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label>类型</label>
                <select className="form-control" name="type" value={artifactForm.type} onChange={onArtifactChange}>
                  <option value="doc">doc</option>
                  <option value="pdf">pdf</option>
                  <option value="video">video</option>
                  <option value="audio">audio</option>
                </select>
              </div>
              <div className="form-group col-md-3">
                <label>分类</label>
                <input className="form-control" name="category" value={artifactForm.category} onChange={onArtifactChange} />
              </div>
              <div className="form-group col-md-3">
                <label>描述</label>
                <input className="form-control" name="description" value={artifactForm.description} onChange={onArtifactChange} />
              </div>
              <div className="form-group col-md-3">
                <label>文件</label>
                <input className="form-control" type="file" onChange={onArtifactFileChange} required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">上传</button>
          </form>
        </div>
      </div>}

      {message && <div className="alert alert-info py-2">{message}</div>}

      <div className="cm-table-wrap">
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>文件名</th>
            <th>类型</th>
            <th>分类</th>
            <th>描述</th>
            <th>大小(bytes)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {(caseData.artifacts || []).map((artifact) => (
            <tr key={artifact.id}>
              <td>{artifact.id}</td>
              <td>{artifact.attachmentName}</td>
              <td>
                {editingArtifactId === artifact.id ? (
                  <select
                    className="form-control form-control-sm"
                    name="type"
                    value={editingArtifactForm.type}
                    onChange={onEditArtifactChange}
                  >
                    <option value="doc">doc</option>
                    <option value="pdf">pdf</option>
                    <option value="video">video</option>
                    <option value="audio">audio</option>
                  </select>
                ) : (
                  artifact.type
                )}
              </td>
              <td>
                {editingArtifactId === artifact.id ? (
                  <input
                    className="form-control form-control-sm"
                    name="category"
                    value={editingArtifactForm.category}
                    onChange={onEditArtifactChange}
                  />
                ) : (
                  artifact.category
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
                ) : (
                  <span className="text-muted">只读</span>
                )}
              </td>
            </tr>
          ))}
          {(caseData.artifacts || []).length === 0 && (
            <tr>
              <td colSpan="7" className="cm-empty">暂无附件</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {previewArtifact && previewUrl && (
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
            {!previewMime.startsWith("image/") &&
              !previewMime.includes("pdf") &&
              !previewMime.startsWith("video/") &&
              !previewMime.startsWith("audio/") && (
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
