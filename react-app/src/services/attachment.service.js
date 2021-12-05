import http from "../http-common";
import authHeader from './auth-header';

class AttachmentDataService {

  getAll2(data) {
    return http.post("/attachments/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/attachments", { params }, { headers: authHeader() });
      /**
    return http.get("/attachments", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/attachments", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/attachments/${id}`, { headers: authHeader() });
  }

  getContent(id) {
    return http.get(`/attachmentsContent/${id}`, { headers: authHeader() });
  }

  getCount(id) {
    return http.get(`/attachmentsCount/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/attachments", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/attachments/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/attachments/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/attachments`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/attachments?title=${title}`, { headers: authHeader() });
  }
}

export default new AttachmentDataService();
