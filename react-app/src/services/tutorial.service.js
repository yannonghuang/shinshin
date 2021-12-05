import http from "../http-common";
import authHeader from './auth-header';

class TutorialDataService {

  getAll2(data) {
    return http.post("/tutorials/all", data, { headers: authHeader() });
  }


  getAll(params) {
    return http.get("/tutorials", { params }, { headers: authHeader() });
  }

      /**
    return http.get("/tutorials", {
        params: { params } ,
        headers: authHeader()
      }
    );

  }

    */
  getAll() {
    return http.get("/tutorials", { headers: authHeader() });
  }


  get(id) {
    return http.get(`/tutorials/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/tutorials", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/tutorials/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/tutorials/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/tutorials`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/tutorials?title=${title}`, { headers: authHeader() });
  }
}

export default new TutorialDataService();
