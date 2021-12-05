import http from "../http-common";
import authHeader from './auth-header';

class ProjectDataService {

  getAll2(data) {
    return http.post("/projects/all", data, { headers: authHeader() });
  }


  getAll(params) {
    return http.get("/projects", { params }, { headers: authHeader() });
  }

      /**
    return http.get("/projects", {
        params: { params } ,
        headers: authHeader()
      }
    );

  }

    */
  getAll() {
    return http.get("/projects", { headers: authHeader() });
  }

  getRegions() {
    return http.get("/projects/regions", { headers: authHeader() });
  }

  getStatuses() {
    return http.get("/projectsStatuses", { headers: authHeader() });
  }

  get(id) {
    return http.get(`/projects/${id}`, { headers: authHeader() });
  }

  getPhoto(id) {
    return http.get(`/projectPhoto/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/projects", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/projects/${id}`, data, { headers: authHeader() });
  }

  updatePhoto(id, data) {
    return http.post(`/single-project-upload/${id}`, data, {
        headers: [
            'content-type': 'multipart/form-data',
            authHeader()
        ]
    });
  }

  uploadDossiers(id, data) {
    return http.post(`/dossiers-upload/${id}`, data, {
        headers: [
            'content-type': 'multipart/form-data',
            authHeader()
        ]
    });
  }

  delete(id) {
    return http.delete(`/projects/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/projects`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/projects?title=${title}`, { headers: authHeader() });
  }

  getAllSimple() {
    return http.get("/projectsSimple", { headers: authHeader() });
  }
}

export default new ProjectDataService();
