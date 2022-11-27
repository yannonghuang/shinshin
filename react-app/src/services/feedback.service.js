import http from "../http-common";
import authHeader from './auth-header';

class FeedbackDataService {

  getAll2(data) {
    return http.post("/feedbacks/all", data /*, { headers: authHeader() } */);
  }

  getAll(params) {
    return http.get("/feedbacks", { params }, { headers: authHeader() });
      /**
    return http.get("/feedbacks", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/feedbacks", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/feedbacks/${id}` /*, { headers: authHeader() } */);
  }

  create(data) {
    return http.post("/feedbacks", data /*, { headers: authHeader() }*/);
  }

  update(id, data) {
    return http.put(`/feedbacks/${id}`, data /*, { headers: authHeader() } */);
  }

  delete(id) {
    return http.delete(`/feedbacks/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/feedbacks`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/feedbacks?title=${title}`, { headers: authHeader() });
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

export default new FeedbackDataService();
