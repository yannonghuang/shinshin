import axios from "axios";
import http from "../http-common";
import AuthService from "./auth.service";

// When the backend rejects our token (expired / invalid JWT -> 401), clear the
// stale session and send the user to the login page instead of leaving them on
// a page that silently fails.
let redirecting = false;

const onResponseError = (error) => {
  const response = error && error.response;
  const config = (error && error.config) || {};
  const sentToken = config.headers && config.headers['x-access-token'];

  // only react to requests that carried a token; /auth/signin also returns 401
  // for a bad password and must not trigger a redirect
  if (response && response.status === 401 && sentToken && !redirecting) {
    redirecting = true;
    AuthService.logout();
    window.location.href = '/login';
  }

  return Promise.reject(error);
};

axios.interceptors.response.use(response => response, onResponseError);
http.interceptors.response.use(response => response, onResponseError);
