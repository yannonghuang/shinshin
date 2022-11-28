import http from "../http-common";
import authHeader from './auth-header';

class AwardDataService {

  getAll2(data) {
    return http.post("/awards/all", data/*, { headers: authHeader() }*/);
  }

  getAllByCategories(data) {
    return http.post("/awards/allByCategories", data/*, { headers: authHeader() }*/);
  }

  getAll(params) {
    return http.get("/awards", { params }, { headers: authHeader() });
  }

  getAll() {
    return http.get("/awards", { headers: authHeader() });
  }

  getRegions() {
    return http.get("/awards/regions", { headers: authHeader() });
  }

  getCategories() {
    return http.get("/awards/categories", { headers: authHeader() });
  }

  getTypes() {
    return http.get("/award/types", { headers: authHeader() });
  }

  get(id) {
    return http.get(`/awards/${id}`/*, { headers: authHeader() }*/);
  }


  getPhoto(id) {
    return http.get(`/awardPhoto/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/awards", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/awards/${id}`, data, { headers: authHeader() });
  }

  updatePhoto(id, data) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/single-award-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        }
    });
  }

  uploadMaterials(id, data, onUploadProgress) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/materials-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        },
        onUploadProgress
    });
  }

  delete(id) {
    return http.delete(`/awards/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/awards`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/awards?title=${title}`, { headers: authHeader() });
  }

  getAllSimple() {
    return http.get("/awardsSimple", { headers: authHeader() });
  }

}

export default new AwardDataService();
