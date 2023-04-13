import http from "../http-common";
import authHeader from './auth-header';

class ProjectDataService {

  getAll2(data) {
    return http.post("/projects/all", data/*, { headers: authHeader() }*/);
  }

  getAllByCategories(data) {
    return http.post("/projects/allByCategories", data/*, { headers: authHeader() }*/);
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

  getCategories() {
    return http.get("/projects/categories", { headers: authHeader() });
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

  exportCSV = (obj, mapper, translator = null) => {

    const render = (item) => {
      if (item === true) return '是';
      if (item === false) return '否';

      return ((item || item === 0)
        ? typeof item === 'string'
          ? item.replace(/(\r\n|\n|\r)/gm, "").replace(/,/gm, "，") // As ',' is used as a delimited, use chinese comma '，' in texts
          : item
        : ''
      );
    }

/**
    const SAVE_translate = (header, dataIndex) => {
      if (!translator || !translator.header || !translator.dictionary ||
        translator.header !== header) return dataIndex;

      return translator.dictionary[dataIndex];
    }
*/

    const translate = (header, dataIndex) => {
      if (!translator || !translator.header || !translator.translate ||
        translator.header !== header) return dataIndex;

      return translator.translate(dataIndex);
    }

    const EMPTY_OBJECTS = new Map();

    const flatten = (obj, path = '', newline = true) => {
      if (obj === null || obj.length === 0) {
        let empty = '';
        if (EMPTY_OBJECTS.get(path)) {
          for (var i = 0; i < EMPTY_OBJECTS.get(path).split(',').length - 1; i++) empty += ',';
          //for (var i = 0; i < EMPTY_OBJECTS.get(path) - 1; i++) empty += ',';
          return {hh: '', header: EMPTY_OBJECTS.get(path), body: empty};
        }
        //return {hh: '', header: empty, body: empty}
      }

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

        //if (!EMPTY_OBJECTS.get(path) || EMPTY_OBJECTS.get(path) < body.split(',').length)
          //EMPTY_OBJECTS.set(path, body.split(',').length);

        if (!EMPTY_OBJECTS.get(path) || EMPTY_OBJECTS.get(path).split(',').length < header.split(',').length)
          EMPTY_OBJECTS.set(path, header);

        return {hh: '', header: header, body: body};
      }
    }

    let csv = flatten(obj); // build EMPTY_OBJECTS
    csv = flatten(obj);

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
      if (!line || line.trim().length === 0) return "";

      const column = line.split(',');
      //if (column.length == 0)
        //return "";

      var result = "";
      for (var i = 0; i < index.length; i++)
        result = result + (header
                            ? mapper[index[i].mapper].Header
                            //: column[index[i].data]
                            : translate(mapper[index[i].mapper].Header, render(column[index[i].data]))
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


  PROJECT_CATEGORIES_ID = [
    {id: 0, name: "未分类"},
    {id: 1, name: "新建校"},
    {id: 2, name: "设施改善"},
    {id: 3, name: "欣美乡村学校"},
    {id: 4, name: "信息化教学设备"},
    {id: 5, name: "图书项目"},
    {id: 6, name: "在线培训"},
    {id: 7, name: "暑期教师培训"},
    {id: 8, name: "校长培训"},
    {id: 9, name: "阅读教育"},
    {id: 10, name: "项目式学习-美化校园"},
    {id: 11, name: "乡土教育"},
    {id: 12, name: "读书月活动"},
    {id: 13, name: "美术园活动"},
    {id: 14, name: "编程活动"},
    {id: 15, name: "小心愿活动"},
    {id: 17, name: "欣乐成长"},
    // additional categories go here...
    {id: 18, name: "空中互动"},
    {id: 16, name: "其它"},
  ];

  getCategory = (pCategoryId) => {
    for (var i = 0; i < this.PROJECT_CATEGORIES_ID.length; i++)
      if (this.PROJECT_CATEGORIES_ID[i].id == pCategoryId)
        return this.PROJECT_CATEGORIES_ID[i].name;

    return "无";
  }

  getIndex = (pCategoryId) => {
    let result = 0;
    for (var i = 0; i < this.PROJECT_CATEGORIES_ID.length; i++)
      if (this.PROJECT_CATEGORIES_ID[i].id === pCategoryId)
        return result;
      else
        result++;

    return 0;
  }

  PROJECT_CATEGORIES = Array.from(
    this.PROJECT_CATEGORIES_ID,
    (option) => option.name
  );


/**
  OLD_PROJECT_CATEGORIES = [
  "未选",
  "TeachersTraing(师资培训)",
  "E-Learning(电子教学)",
  "Literacy Programs(图书计划)",
  "University Outreach(大学生实践)",
  "Construction(建校计划)",
  "Facility Improvement(设施改善)",
  "Principal Training(校长培训)",
  "2016扬帆合作项目",
  "Student Activity (学生活动)",
  "General Program (通用项目)",
  "Model Rural Schools (欣美乡村学校)",
  "美化校园项目"
  ];

  PROJECT_CATEGORIES = [
    "未分类",
    "新建校",
    "设施改善",
    "欣美乡村学校",
    "信息化教学设备",
    "图书项目",
    "在线培训",
    "暑期教师培训",
    "校长培训",
    "阅读教育",
    "项目式学习-美化校园",
    "乡土教育",
    "读书月活动",
    "美术园活动",
    "编程活动",
    "小心愿活动",
    "欣乐成长",
    "其它",
  ];
*/

}

export default new ProjectDataService();
