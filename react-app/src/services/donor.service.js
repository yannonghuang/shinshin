import http from "../http-common";
import authHeader from './auth-header';

class DonorDataService {

  getAll2(data) {
    return http.post("/donors/all", data/*, { headers: authHeader() }*/);
  }

  getAll(params) {
    return http.get("/donors", { params }, { headers: authHeader() });
  }

  getAll() {
    return http.get("/donors", { headers: authHeader() });
  }

  get(id) {
    return http.get(`/donors/${id}`/*, { headers: authHeader() }*/);
  }

  create(data) {
    return http.post("/donors", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/donors/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/donors/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/donors`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/donors?title=${title}`, { headers: authHeader() });
  }

  getPhoto(id) {
    return http.get(`/donorPhoto/${id}`, { headers: authHeader() });
  }

  updatePhoto(id, data) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/single-donor-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        }
    });
  }

}

export default new DonorDataService();
