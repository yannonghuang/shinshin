import http from "../http-common";
import authHeader from './auth-header';

class QuestionaireDataService {

  getAll2(data) {
    return http.post("/questionaires/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/questionaires", { params }, { headers: authHeader() });
      /**
    return http.get("/questionaires", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/questionaires", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/questionaires/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/questionaires", data, { headers: authHeader() });
  }

  createV(data) {
    return http.post("/questionairesV", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/questionaires/${id}`, data, { headers: authHeader() });
  }

  copy(id) {
    return http.get(`/questionairesCopy/${id}`, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/questionaires/${id}`, { headers: authHeader() });
  }

  publish(id) {
    return http.get(`/questionairesPublish/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/questionaires`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/questionaires?title=${title}`, { headers: authHeader() });
  }
}

export default new QuestionaireDataService();
