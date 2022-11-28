import http from "../http-common";
import authHeader from './auth-header';

class MaterialDataService {

  getAll2(data) {
    return http.post("/materials/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/materials", { params }, { headers: authHeader() });
  }

  get(id) {
    return http.get(`/materials/${id}`, { headers: authHeader() });
  }

  getContent(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.get(`/materialsContent/${id}`, {
        headers: {
          'x-access-token':  (user && user.accessToken) ? user.accessToken : null
        },
        responseType: 'arraybuffer'
      });
  }

  getDocCategories() {
    return http.get(`/materials/categories`, { headers: authHeader() });
  }

  getCount(id) {
    return http.get(`/materialsCount/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/materials", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/materials/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/materials/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/materials`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/materials?title=${title}`, { headers: authHeader() });
  }
}

export default new MaterialDataService();
