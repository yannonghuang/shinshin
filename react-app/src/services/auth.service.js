import axios from "axios";
import authHeader from './auth-header';
const API_URL = "/api/auth/";
//const API_URL = "http://localhost:8080/api/auth/";

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "signin", {
        username,
        password
      });

/**
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
*/
  }

  reset(email, password) {
    return axios
      .post(API_URL + "reset", {
        email,
        password
      });
/*
      .then(response => {
        return response.data;
      })
      .catch(err => {
      });
*/
  }

  findByEmail(email, emailVerified = false) {
    return axios
      .post(API_URL + "findByEmail", {
        email,
        emailVerified
      });
  }

  logout() {
    if (!localStorage.getItem('user')) return;

    const username = JSON.parse(localStorage.getItem('user')).username;
    localStorage.removeItem("user");

    return axios
      .post(API_URL + "signout", {
        username,
      })
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
      });
  }

  register(username, email, password, roles, schoolId,
              chineseName, phone, wechat, startAt, title) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password,
      roles,
      schoolId,
      chineseName,
      phone,
      wechat,
      startAt,
      title
    });
  }

  createContactOnly(data) {
    return axios.post(API_URL + "createContactOnly", data, { headers: authHeader() });
  }

  updateContactOnly(id, data) {
    return axios.put(API_URL + "users/updateContactOnly/" + `${id}`, data, { headers: authHeader() });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isValid() {
    if (!localStorage.getItem('user'))
      return false;

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user.thisLogin || !user.validity)
        return true;

    return (user.thisLogin + user.validity) > Math.floor(Date.now()/1000);
  }

  isLogin() {
    return this.getCurrentUser();
  }

  isAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && !user.schoolId && user.roles.includes("ROLE_ADMIN");
  }

  isVolunteer() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && !user.schoolId;
  }

  isSchoolUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.schoolId;
  }

  getRoles() {
    return axios.get(API_URL + "roles");
  }

  getAll2(data) {
    return axios.post(API_URL + "users", data, { headers: authHeader() });
  }

  getAllSimple(data) {
    return axios.post(API_URL + "usersSimple", data, { headers: authHeader() });
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

  getUserTitles() {
    return axios.get(API_URL + "userTitles");
  }
}

export default new AuthService();
