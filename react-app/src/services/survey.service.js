import http from "../http-common";
import authHeader from './auth-header';

class SurveyDataService {

  getAll2(data) {
    return http.post("/surveys/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/surveys", { params }, { headers: authHeader() });
      /**
    return http.get("/surveys", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/surveys", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/surveys/${id}`/*, { headers: authHeader() }*/);
  }

  getContent(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.get(`/surveysContent/${id}`, {
        headers: {
          'x-access-token':  (user && user.accessToken) ? user.accessToken : null
        },
        responseType: 'arraybuffer'
      });
  }

  getDocCategories() {
    return http.get(`/surveys/categories`, { headers: authHeader() });
  }

  getCount(id) {
    return http.get(`/surveysCount/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/surveys", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/surveys/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/surveys/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/surveys`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/surveys?title=${title}`, { headers: authHeader() });
  }
}

export default new SurveyDataService();
