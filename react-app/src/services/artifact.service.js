import http from "../http-common";
import authHeader from "./auth-header";

class ArtifactDataService {
  getByCase(caseId) {
    return http.get(`/cases/${caseId}/artifacts`, { headers: authHeader() });
  }

  get(id) {
    return http.get(`/artifacts/${id}`, { headers: authHeader() });
  }

  downloadByCase(caseId, onDownloadProgress) {
    const user = JSON.parse(localStorage.getItem("user"));
    return http.get(`/cases/${caseId}/artifacts/download`, {
      headers: {
        "x-access-token": user && user.accessToken ? user.accessToken : null,
      },
      responseType: "arraybuffer",
      onDownloadProgress,
    });
  }

  download(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    return http.get(`/artifacts/${id}/download`, {
      headers: {
        "x-access-token": user && user.accessToken ? user.accessToken : null,
      },
      responseType: "arraybuffer",
    });
  }

  create(caseId, formData, onUploadProgress) {
    const user = JSON.parse(localStorage.getItem("user"));
    return http.post(`/cases/${caseId}/artifacts`, formData, {
      headers: {
        "content-type": "multipart/form-data",
        "x-access-token": user && user.accessToken ? user.accessToken : null,
      },
      onUploadProgress,
    });
  }

  bulkCreate(caseId, formData, onUploadProgress) {
    const user = JSON.parse(localStorage.getItem("user"));
    return http.post(`/cases/${caseId}/artifacts/bulk`, formData, {
      headers: {
        "content-type": "multipart/form-data",
        "x-access-token": user && user.accessToken ? user.accessToken : null,
      },
      onUploadProgress,
    });
  }

  update(id, formData) {
    const user = JSON.parse(localStorage.getItem("user"));
    return http.put(`/artifacts/${id}`, formData, {
      headers: {
        "content-type": "multipart/form-data",
        "x-access-token": user && user.accessToken ? user.accessToken : null,
      },
    });
  }

  delete(id, confirmDelete = false) {
    return http.delete(`/artifacts/${id}?confirmDelete=${confirmDelete ? "true" : "false"}`, {
      headers: authHeader(),
    });
  }
}

export default new ArtifactDataService();
