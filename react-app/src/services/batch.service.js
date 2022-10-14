import http from "../http-common";
import authHeader from './auth-header';

class BatchlDataService {

  batch(data, onUploadProgress) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/batch-upload`, data, {
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
