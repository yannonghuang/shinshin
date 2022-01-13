import http from "../http-common";
import authHeader from './auth-header';

class SchoolDataService {

  getAll2(data) {
    return http.post("/schools/all", data, { headers: authHeader() });
  }


  getAll(params) {
    return http.get("/schools", { params }, { headers: authHeader() });
  }

      /**
    return http.get("/schools", {
        params: { params } ,
        headers: authHeader()
      }
    );

  }

    */
  getAll() {
    return http.get("/schools", { headers: authHeader() });
  }

  getRegions() {
    return http.get("/schools/regions", { headers: authHeader() });
  }

  getCountsByRegion() {
    return http.get("/schools/countsByRegion", { headers: authHeader() });
  }


  getStages() {
    return http.get("/schools/stages", { headers: authHeader() });
  }

  getStatuses() {
    return http.get("/schools/statuses", { headers: authHeader() });
  }

  getRequests() {
    return http.get("/schools/requests", { headers: authHeader() });
  }

  getCategories() {
    return http.get("/schools/categories", { headers: authHeader() });
  }

  get(id) {
    return http.get(`/schools/${id}`, { headers: authHeader() });
  }

  getPhoto(id) {
    return http.get(`/schoolPhoto/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/schools", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/schools/${id}`, data, { headers: authHeader() });
  }

  updatePhoto(id, data) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/single-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        }
    });
  }

  uploadDocuments(id, data) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/documents-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        }
    });
  }

  delete(id) {
    return http.delete(`/schools/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/schools`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/schools?title=${title}`, { headers: authHeader() });
  }

  getAllSimple() {
    return http.get("/schoolsSimple", { headers: authHeader() });
  }

//

  reduce = (bigObj, smallObj) => {
    var result = {};
    Object.keys(smallObj).forEach(key => {
      result = Object.assign(result, {[key]: bigObj[key]});
    });
    return result;
  }

}

export default new SchoolDataService();
