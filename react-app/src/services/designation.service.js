import http from "../http-common";
import authHeader from './auth-header';

class DesignationDataService {

  getAll2(data) {
    return http.post("/designations/all", data/*, { headers: authHeader() }*/);
  }

  getAll(params) {
    return http.get("/designations", { params }, { headers: authHeader() });
  }

  getAll() {
    return http.get("/designations", { headers: authHeader() });
  }

  get(id) {
    return http.get(`/designations/${id}`/*, { headers: authHeader() }*/);
  }

  create(data) {
    return http.post("/designations", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/designations/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/designations/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/designations`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/designations?title=${title}`, { headers: authHeader() });
  }

  getPhoto(id) {
    return http.get(`/designationPhoto/${id}`, { headers: authHeader() });
  }

  updatePhoto(id, data) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/single-designation-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        }
    });
  }

}

export default new DesignationDataService();
