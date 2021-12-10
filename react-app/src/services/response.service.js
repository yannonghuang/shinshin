import http from "../http-common";
import authHeader from './auth-header';

class ResponseDataService {

  getAll2(data) {
    return http.post("/responses/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/responses", { params }, { headers: authHeader() });
      /**
    return http.get("/responses", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/responses", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/responses/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/responses", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/responses/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/responses/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/responses`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/responses?title=${title}`, { headers: authHeader() });
  }

  uploadAttachments(id, data, onUploadProgress) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/attachments-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        },
        onUploadProgress,
    });
  }
}

export default new ResponseDataService();
