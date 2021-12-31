import http from "../http-common";
import authHeader from './auth-header';

class LogDataService {

  getAll2(data) {
    return http.post("/logs/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/logs", { params }, { headers: authHeader() });
      /**
    return http.get("/logs", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/logs", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/logs/${id}`, { headers: authHeader() });
  }

  getContent(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.get(`/logsContent/${id}`, {
        headers: {
          'x-access-token':  (user && user.accessToken) ? user.accessToken : null
        },
        responseType: 'arraybuffer'
      });
  }

  getDocCategories() {
    return http.get(`/logs/categories`, { headers: authHeader() });
  }

  getCount(id) {
    return http.get(`/logsCount/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/logs", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/logs/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/logs/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/logs`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/logs?title=${title}`, { headers: authHeader() });
  }
}

export default new LogDataService();
