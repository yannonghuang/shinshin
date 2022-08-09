import http from "../http-common";
import authHeader from './auth-header';

class ProjectDataService {

  getAll2(data) {
    return http.post("/projects/all", data/*, { headers: authHeader() }*/);
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
    return http.get(`/projects/${id}`/*, { headers: authHeader() }*/);
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
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/single-project-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        }
    });
  }

  uploadDossiers(id, data, onUploadProgress) {
    const user = JSON.parse(localStorage.getItem('user'));
    return http.post(`/dossiers-upload/${id}`, data, {
        headers: {
            'content-type': 'multipart/form-data',
            'x-access-token':  (user && user.accessToken) ? user.accessToken : null
            //authHeader()
        },
        onUploadProgress
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

  toCSV = (obj, mapper, path = '', newline = true) => {
    const translate = (column) => {
      if (mapper) {
        for (var i = 0; i < mapper.length; i++) {
          if (column === mapper[i].accessor)
            return mapper[i].Header;
        }
      }
      return null;
    }

    if (!(obj instanceof Object)) {
      const p = path.substring(0, path.lastIndexOf('.')); // drop the last "."
      //return {header: translate(p), body: (obj ? obj.trim() : '')};
      return {header: translate(p), body: (obj ? obj : '')};
    }

    if (obj instanceof Array) {
      var body = '';
      var header = '';
      for (var i = 0; i < obj.length; i++) {
        const result = this.toCSV(obj[i], mapper, path, false);
        body = body + result.body + (newline ? '\n' : '');
        if (!header.endsWith('\n'))
          header = header + result.header + (newline ? '\n' : '');
      }
      return {header: header, body: body};
    }

    if (obj instanceof Object) {
      var body = '';
      var header = '';
      Object.keys(obj).forEach(key => {
        const result = this.toCSV(obj[key], mapper, path + key + '.', false);
        if (result.header) {
          body = body + result.body + ',';
          if (!header.endsWith('\n'))
            header = header + result.header + ',';
        }
      });
      body = body.substring(0, body.lastIndexOf(',')); // drop last ', '
      header = header.substring(0, header.lastIndexOf(',')); // drop last ', '
      return {header: header, body: body};
    }
  }

  exportCSV = (obj, mapper) => {

    const render = (item) => {
      if (item === true) return '是';
      if (item === false) return '否';

      return (item
        ? typeof item === 'string'
          ? item.replace(/(\r\n|\n|\r)/gm, "").replace(/,/gm, "，") // As ',' is used as a delimited, use chinese comma '，' in texts
          : item
        : ''
      );
    }

    const flatten = (obj, path = '', newline = true) => {
      if (!(obj instanceof Object)) {
        const p = path.substring(0, path.lastIndexOf('.')); // drop the last "."
        return {hh: '', header: p, body: render(obj)};
        //return {hh: '', header: p, body: (obj ? obj : '')};
      }

      if (obj instanceof Array) {
        var body = '';
        var header = '';
        var hh = '';
        for (var i = 0; i < obj.length; i++) {
          const result = flatten(obj[i], path, false);
          body = body + result.body + (newline ? '\n' : '');
          header = header + result.header + (newline ? '\n' : '');
          if (header.endsWith('\n')) {
            hh = (header.length > hh.length) ? header : hh;
            header = '';
          }
        }
        return {hh: hh, header: header, body: body};
      }

      if (obj instanceof Object) {
        var body = '';
        var header = '';
        Object.keys(obj).forEach(key => {
          const result = flatten(obj[key], path + key + '.', false);
          body = body + result.body + ',';
          header = header + result.header + ',';
        });
        body = body.substring(0, body.lastIndexOf(',')); // drop last ','
        header = header.substring(0, header.lastIndexOf(',')); // drop last ','
        return {hh: '', header: header, body: body};
      }
    }

    const csv = flatten(obj);

    const header = csv.hh.trim().split(',');

    // build index
    const index = [];
    for (var i = 0; i < mapper.length; i++) {
      for (var j = 0; j < header.length; j++)
          if ((header[j].endsWith('name') && mapper[i].accessor === header[j]) ||
            (!header[j].endsWith('name') && header[j].endsWith(mapper[i].accessor)))
            // rather ugly, name & school.name prevent checking with endsWith
            index.push({mapper: i, data: j}); //index.push(j);
    }

    const order = (line, header = false) => {
      if (!line || line.trim().length == 0) return "";

      const column = line.split(',');
      //if (column.length == 0)
        //return "";

      var result = "";
      for (var i = 0; i < index.length; i++)
        result = result + (header
                            ? mapper[index[i].mapper].Header
                            //: column[index[i].data]
                            : render(column[index[i].data])
                          ) + ',';

      result = result.substring(0, result.lastIndexOf(',')) + '\n';

      return result;
    }

    const body = csv.body.split('\n');
    var newBody = "";
    for (var i = 0; i < body.length; i++) {
      newBody = newBody + order(body[i]);

    }

    const newHeader = order(csv.hh, true);
    return (newHeader + newBody);
  }

}

export default new ProjectDataService();
