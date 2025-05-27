import http from "../http-common";
import authHeader from './auth-header';

class GeoDataService {

  upload(data, filename) {
    return http.post(`/geo/upload/${filename}`, data /*, { headers: authHeader() }*/);
  }

  download(filename) {
    return http.get(`/geo/download/${filename}` /*, { headers: authHeader() }*/);
  }  

}

export default new GeoDataService();
