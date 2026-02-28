import http from "../http-common";
import authHeader from "./auth-header";

class CaseDataService {
  getAll(params) {
    return http.get("/cases", { params, headers: authHeader() });
  }

  get(id) {
    return http.get(`/cases/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/cases", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/cases/${id}`, data, { headers: authHeader() });
  }

  delete(id, confirmCascade = false) {
    return http.delete(`/cases/${id}?confirmCascade=${confirmCascade ? "true" : "false"}`, {
      headers: authHeader(),
    });
  }
}

export default new CaseDataService();
