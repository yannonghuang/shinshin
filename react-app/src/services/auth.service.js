import axios from "axios";
import authHeader from './auth-header';
const API_URL = "http://localhost:8080/api/auth/";

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "signin", {
        username,
        password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password, roles, schoolId) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password,
      roles,
      schoolId
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getRoles() {
    return axios.get(API_URL + "roles");
  }

  getAll2(data) {
    return axios.post(API_URL + "users", data, { headers: authHeader() });
  }

  delete(id) {
    return axios.delete(API_URL + "users/" + `${id}`, { headers: authHeader() });
  }

  get(id) {
    return axios.get(API_URL + "users/" + `${id}`, { headers: authHeader() });
  }


  update(id, data) {
    return axios.put(API_URL + "users/update/" + `${id}`, data, { headers: authHeader() });
  }

}

export default new AuthService();
