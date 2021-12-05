import http from "../http-common";
import authHeader from './auth-header';

class DocumentDataService {

  getAll2(data) {
    return http.post("/documents/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/documents", { params }, { headers: authHeader() });
      /**
    return http.get("/documents", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/documents", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/documents/${id}`, { headers: authHeader() });
  }

  getContent(id) {
    return http.get(`/documentsContent/${id}`, { headers: authHeader() });
  }

  getDocCategories() {
    return http.get(`/documents/categories`, { headers: authHeader() });
  }

  getCount(id) {
    return http.get(`/documentsCount/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/documents", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/documents/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/documents/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/documents`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/documents?title=${title}`, { headers: authHeader() });
  }
}

export default new DocumentDataService();
