import http from "../http-common";
import authHeader from './auth-header';

class BatchlDataService {

  batch(type, source, data, onUploadProgress) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/batch-upload?type=${type}&source=${source}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        },
        onUploadProgress
    });
  }


}

export default new BatchlDataService();
