import http from "../http-common";
import authHeader from './auth-header';

class FormDataService {

  getAll2(data) {
    return http.post("/forms/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/forms", { params }, { headers: authHeader() });
      /**
    return http.get("/forms", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/forms", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/forms/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/forms", data, { headers: authHeader() });
  }

  createV(data) {
    return http.post("/formsV", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/forms/${id}`, data, { headers: authHeader() });
  }

  copy(id) {
    return http.get(`/formsCopy/${id}`, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/forms/${id}`, { headers: authHeader() });
  }

  publish(id) {
    return http.get(`/formsPublish/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/forms`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/forms?title=${title}`, { headers: authHeader() });
  }
}

export default new FormDataService();
