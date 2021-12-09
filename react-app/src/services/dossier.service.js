import http from "../http-common";
import authHeader from './auth-header';

class DossierDataService {

  getAll2(data) {
    return http.post("/dossiers/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/dossiers", { params }, { headers: authHeader() });
      /**
    return http.get("/dossiers", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/dossiers", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/dossiers/${id}`, { headers: authHeader() });
  }

  getContent(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.get(`/dossiersContent/${id}`, {
        headers: {
          'x-access-token':  (user && user.accessToken) ? user.accessToken : null
        },
        responseType: 'arraybuffer'
      });
  }

  getDocCategories() {
    return http.get(`/dossiers/categories`, { headers: authHeader() });
  }

  getCount(id) {
    return http.get(`/dossiersCount/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/dossiers", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/dossiers/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/dossiers/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/dossiers`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/dossiers?title=${title}`, { headers: authHeader() });
  }
}

export default new DossierDataService();
