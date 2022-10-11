import http from "../http-common";
import authHeader from './auth-header';

class DonationDataService {

  getAll2(data) {
    return http.post("/donations/all", data/*, { headers: authHeader() }*/);
  }

  getAll(params) {
    return http.get("/donations", { params }, { headers: authHeader() });
  }

  getAll() {
    return http.get("/donations", { headers: authHeader() });
  }

  get(id) {
    return http.get(`/donations/${id}`/*, { headers: authHeader() }*/);
  }

  create(data) {
    return http.post("/donations", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/donations/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/donations/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/donations`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/donations?title=${title}`, { headers: authHeader() });
  }

  getPhoto(id) {
    return http.get(`/donationPhoto/${id}`, { headers: authHeader() });
  }

  updatePhoto(id, data) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/single-donation-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        }
    });
  }

}

export default new DonationDataService();
