import http from "../http-common";
import authHeader from "./auth-header";

class CourseDataService {
  getAll(params) {
    return http.get("/courses", { params, headers: authHeader() });
  }

  get(id) {
    return http.get(`/courses/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/courses", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/courses/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/courses/${id}`, { headers: authHeader() });
  }
}

export default new CourseDataService();
