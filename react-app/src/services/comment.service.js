import http from "../http-common";
import authHeader from './auth-header';

class CommentDataService {

  getAll2(data) {
    return http.post("/comments/all", data, { headers: authHeader() });
  }

  getAll(params) {
    return http.get("/comments", { params }, { headers: authHeader() });
      /**
    return http.get("/comments", {
        params: { params } ,
        headers: authHeader()
      }
    );
    */
  }

/**
  getAll() {
    return http.get("/comments", { headers: authHeader() });
  }
*/

  get(id) {
    return http.get(`/comments/${id}`, { headers: authHeader() });
  }

  getContent(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.get(`/commentsContent/${id}`, {
        headers: {
          'x-access-token':  (user && user.accessToken) ? user.accessToken : null
        },
        responseType: 'arraybuffer'
      });
  }

  getDocCategories() {
    return http.get(`/comments/categories`, { headers: authHeader() });
  }

  getCount(id) {
    return http.get(`/commentsCount/${id}`, { headers: authHeader() });
  }

  create(data) {
    return http.post("/comments", data, { headers: authHeader() });
  }

  update(id, data) {
    return http.put(`/comments/${id}`, data, { headers: authHeader() });
  }

  delete(id) {
    return http.delete(`/comments/${id}`, { headers: authHeader() });
  }

  deleteAll() {
    return http.delete(`/comments`, { headers: authHeader() });
  }

  findByTitle(title) {
    return http.get(`/comments?title=${title}`, { headers: authHeader() });
  }
}

export default new CommentDataService();
