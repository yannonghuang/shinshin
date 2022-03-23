//import React, { Component } from "react";
import React, { Component, createRef } from "react"; //For react component
//import 'bootstrap/dist/css/bootstrap.min.css';
//import {Tabs, Tab} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Divider from '@material-ui/core/Divider';
import Select from 'react-select';

import AuthService from "./../services/auth.service";
import UserDataService from "../services/auth.service";
import Survey from './survey.component.js';
import CommentsList from './comments-list.component.js';
import ProjectsList from './projects-list.component.js';
import ResponsesList from './responses-list.component.js';
import DocumentsList from './documents-list.component.js';
import SchoolDataService from "../services/school.service";
import SurveyDataService from "../services/survey.service";
import DocumentDataService from "../services/document.service";
//import SchoolDetails from './collapsible-school.component';
import defaultPhoto from '../defaultPhoto.jpg';

import YearPicker from 'react-single-year-picker';

export default class School extends Component {
  constructor(props) {
    super(props);

    this.onChangeGenerics = this.onChangeGenerics.bind(this);

    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangeYPStartAt = this.onChangeYPStartAt.bind(this);
    this.onChangeLastVisit = this.onChangeLastVisit.bind(this);
    this.onChangeYPLastVisit = this.onChangeYPLastVisit.bind(this);

    this.onChangePrincipalId = this.onChangePrincipalId.bind(this);
    this.onChangeContactId = this.onChangeContactId.bind(this);

    this.getSchool = this.getSchool.bind(this);
    this.getSchoolPhoto = this.getSchoolPhoto.bind(this);

    this.updateSchool = this.updateSchool.bind(this);
    this.updatePhoto = this.updatePhoto.bind(this);
    this.deleteSchool = this.deleteSchool.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onChangeDocFiles = this.onChangeDocFiles.bind(this);

    this.saveSchool = this.saveSchool.bind(this);
    this.newSchool = this.newSchool.bind(this);

    this.state = {
      currentSchool: {
        id: null,
        name: "",
        code: "",

        photo: null,
        file: null, // for photo
        docFiles: [],
        docCategory: "",

        startAt: null,
        lastVisit: null,
        donor: null,
        stage: "",

        status: "",
        request: "",
        category: "",
        principal: "",
        principalCell: null,
        principalWechat: null,
        contact: "",
        contactCell: null,
        contactWechat: null,
        schoolBoard: null,
        schoolBoardRegisteredName: null,
        region: "",
        city: "",
        county: "",
        community: "",
        address: "",
        phone: "",
        email: "",
        studentsCount: 0,
        teachersCount: 0,
        description: "",
        principalId: null,
        contactId: null,
        xr: false,
      },

      newschool: true,
      readonly: true,
      regions: [],
      docCategories: [],

      users: [],

      stages: [],
      statuses: [],
      requests: [],
      categories: [],

      message: "",
      submitted: false,
      pastedPhotoType: null,
    };

    this.surveyRef = createRef();
  }

  async componentDidMount() {
    const newschool = window.location.pathname.includes('add');
    this.setState({newschool: newschool});
    this.setState({readonly: window.location.pathname.includes('View')});

    const schoolId = this.props.match? this.props.match.params.id : this.props.id;
    if (!newschool) {
      await this.getSchool(schoolId);
      await this.getSchoolPhoto(schoolId);
    }

    this.getRegions();
    this.getDocCategories();

    this.getCategories();
    this.getRequests();
    this.getStatuses();
    this.getStages();
    this.getUsers(schoolId);

    this.init();
  }

  init() {
    document.onpaste = async (pasteEvent) => {
      pasteEvent.preventDefault();

      var items = pasteEvent.clipboardData.items;

      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
          var blob = items[i].getAsFile();
          const type = items[i].type;
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = async () => {
            await this.setState(prevState => ({
              currentSchool: {
                ...prevState.currentSchool,
                photo: reader.result
              },
              pastedPhotoType: type
            }));

            document.getElementById('schoolPhoto').src = reader.result;
            return;
          }

        }
      }
    };

  }

  convert(users) {
    const result = [];
    if (users) {
    for (var i = 0; i < users.length; i++) {
      result.push({value: users[i].id,
        label: users[i].chineseName });
    }
    return result;
    }
  }

  display(userId) {
    if (this.state.users) {
      for (var i = 0; i < this.state.users.length; i++) {
        if (this.state.users[i].value == userId)
          return this.state.users[i];
      }
      return [];
    }
  }

  displayName(userId) {
    if (this.state.users) {
      for (var i = 0; i < this.state.users.length; i++) {
        if (this.state.users[i].value == userId)
          return this.state.users[i].label ? this.state.users[i].label : '中文名';
      }
      return '';
    }
  }

  getUsers(schoolId) {
    //UserDataService.getAll2({schoolId: this.state.currentSchool.id})
    UserDataService.getAllSimple({schoolId: schoolId})
      .then(response => {
        this.setState({
          users: this.convert(response.data)
        });

        console.log(response);
      })
      .catch(e => {
        //alert(JSON.stringify(e))
        console.log(e);
      });
  }

  getCategories() {
    SchoolDataService.getCategories()
      .then(response => {
        this.setState({
          categories: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getRequests() {
    SchoolDataService.getRequests_ss()
      .then(response => {
        this.setState({
          requests: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getStatuses() {
    SchoolDataService.getStatuses_ss()
      .then(response => {
        this.setState({
          statuses: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getStages() {
    SchoolDataService.getStages()
      .then(response => {
        this.setState({
          stages: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getRegions() {
    SchoolDataService.getRegions()
      .then(response => {
        this.setState({
          regions: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getDocCategories() {
    DocumentDataService.getDocCategories()
      .then(response => {
        this.setState({
          docCategories: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  onChangePrincipalId(e) {
    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        principalId: e.value //.target.value
      }
    }));
  }

  onChangeContactId(e) {
    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        contactId: e.value //.target.value
      }
    }));
  }

  onChangeGenerics(e) {
    const name = e.target.name;
    const type = e.target.type;
    const value = (type === "checkbox") ? e.target.checked : e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        [name]: value
      }
    }));
  }

  onChangeStartAt(e) {
    const startAt = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          startAt: startAt
        }
      };
    });
  }


  onChangeYPStartAt(e) {
    const startAt = e; //.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          startAt: startAt
        }
      };
    });
  }

  onChangeLastVisit(e) {
    const lastVisit = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          lastVisit: lastVisit
        }
      };
    });
  }

  onChangeYPLastVisit(e) {
    const lastVisit = e; //.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          lastVisit: lastVisit
        }
      };
    });
  }

  async getSchool(schoolId) {
    const {
      id,
      photo,
      file,
      docFiles,
      docCategory,
      ...base} = this.state.currentSchool;

    try {
      let rSchool = await SchoolDataService.get(schoolId);
      let rSurvey = await SurveyDataService.get(schoolId);

      const {id, ...rSurveyButId} = rSurvey.data;
      let x = {...base, ...rSchool.data, ...rSurveyButId};
      let y = SchoolDataService.reduce(x, base);

      await this.setState({
        currentSchool: {
          ...y,
          id: schoolId
        }
      });

    } catch (err) {
      alert(err.message);
    };

  }

  getSchoolPhoto(id) {
    SchoolDataService.getPhoto(id)
      .then(response => {
        var imageURL = 'data:image/png;base64,' +
            new Buffer(response.data.data.photo, 'binary').toString('base64');

        this.setState(prevState => ({
              currentSchool: {
                ...prevState.currentSchool,
                photo: imageURL
              }
            }));

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newSchool() {
  this.setState(prevState => ({
    currentSchool: {
      ...prevState.currentSchool,
      id: null,
      name: "",
      code: "",
      description: "",
      principal: "",
      photo: null,
      file: null,
      region: "",
      address: "",
      phone: "",
      email: "",
      studentsCount: 0,
      teachersCount: 0,
      docFiles: [],
      docCategory: "",

      stage: "",
      status: "",
      request: "",
      category: "",
      },

      submitted: false
    }));

  }

  saveSchool() {
  const {
    id,
    photo,
    file,
    docFiles,
    docCategory,
    startAt,
    lastVisit,
    ...others} = this.state.currentSchool;

  const dataSchool = {
      ...others,
      startAt: startAt ? (startAt + '-01-01') : null,
      lastVisit: lastVisit ? (lastVisit + '-01-01') : null,
    };

    SchoolDataService.create(dataSchool)
      .then(response => {

        const dataSurvey = {
          ...others,
          startAt: startAt ? (startAt + '-01-01') : null,
          lastVisit: lastVisit ? (lastVisit + '-01-01') : null,
          schoolId: response.data.id
        };

        SurveyDataService.create(dataSurvey)
        .then(r => {
           this.setState(prevState => ({
             currentSchool: {
               ...prevState.currentSchool,
               id: response.data.id,
             },
             message: "学校信息成功提交!",
             submitted: true
           }));
        })
        .catch(err => {
          const resMessage =
            (err.response &&
            err.response.data &&
            err.response.data.message) ||
            err.message ||
            err.toString();

          this.setState({
            message: "学校信息保存失败! " + resMessage
          });
        })

        if (this.state.currentSchool.file || this.state.pastedPhotoType) { // photo, followed by docs
          this.updatePhoto();
        } else {
          if (this.state.currentSchool.docFiles) // docs
            this.uploadDocuments();
        }

        console.log(response.data);
      })
      .catch(e => {
        const resMessage =
          (e.response &&
            e.response.data &&
            e.response.data.message) ||
          e.message ||
          e.toString();

        this.setState({
          message: "学校信息保存失败! " + resMessage
        });
        console.log(e);
      });
  }

  updateSchool() {
    if (this.surveyRef.current) this.surveyRef.current.updateSurvey();

    const {
      id,
      photo,
      file,
      docFiles,
      docCategory,
      startAt,
      lastVisit,
      ...others} = this.state.currentSchool;

    const dataSchool = {
        ...others,
        startAt: startAt ? (startAt + '-01-01') : null,
        lastVisit: lastVisit ? (lastVisit + '-01-01') : null,
      };

    const dataSurvey = {
        ...others,
        startAt: startAt ? (startAt + '-01-01') : null,
        lastVisit: lastVisit ? (lastVisit + '-01-01') : null,
        schoolId: this.state.currentSchool.id
      };

    SchoolDataService.update(
      this.state.currentSchool.id,
      dataSchool)
      .then(response => {
        console.log(response.data);

        SurveyDataService.update(
          this.state.currentSchool.id,
          dataSurvey)
        .then (r => {
          this.setState({
            message: "学校信息成功修改!",
            submitted: true
          });
        })
        .catch(err => {
          const resMessage =
            (err.response &&
            err.response.data &&
            err.response.data.message) ||
            err.message ||
            err.toString();

          this.setState({
            message: "学校信息修改失败! " + resMessage
          });
        });

        if (this.state.currentSchool.file || this.state.pastedPhotoType) { // photo, followed by docs
          this.updatePhoto();
        } else {
          if (this.state.currentSchool.docFiles) // docs
            this.uploadDocuments();
        }
      })
      .catch(e => {
        const resMessage =
          (e.response &&
            e.response.data &&
            e.response.data.message) ||
          e.message ||
          e.toString();

        this.setState({
          message: "学校信息修改失败! " + resMessage
        });
        console.log(e);
      });
  }


  async updatePhoto() {
    var data = new FormData();
    if (this.state.currentSchool.file)
      data.append('multi-files', this.state.currentSchool.file, this.state.currentSchool.file.name);
    else if (this.state.pastedPhotoType) {
      const base64Response = await fetch(this.state.currentSchool.photo);
      const blob = await base64Response.blob();
      data.append('multi-files', new Blob([blob], {type: this.state.pastedPhotoType}));
    }
    SchoolDataService.updatePhoto(this.state.currentSchool.id, data)
    .then(response => {
      if (this.state.currentSchool.docFiles) { // docs
        this.uploadDocuments();
      }
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  uploadDocuments() {
    var data = new FormData();
    for (var i = 0; i < this.state.currentSchool.docFiles.length; i++) {
      data.append('multi-files', this.state.currentSchool.docFiles[i],
        this.state.currentSchool.docFiles[i].name);
    }
    data.append('docCategory', this.state.currentSchool.docCategory);
    SchoolDataService.uploadDocuments(this.state.currentSchool.id, data)
    .then(response => {
      this.setState(prevState => ({
        message: prevState.message + " 学校信息附件成功上传!"
      }));

      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  deleteSchool() {
    SchoolDataService.delete(this.state.currentSchool.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/schools')
      })
      .catch(e => {
        console.log(e);
      });
  }

  onDrag = event => {
    event.preventDefault()
  }

  onDrop = event => {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    var item = event.dataTransfer.items[0];
    if (!item || item.kind !== 'file' || item.type.indexOf('image/') !== 0) return;
    
    this.setState(prevState => ({
          currentSchool: {
            ...prevState.currentSchool,
            file: file
          }
        }));

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        photo: reader.result
      }
    }));
  }


  onChangeDocFiles(e) {
    e.preventDefault();
    var docFiles = e.target.files;
    this.setState(prevState => ({
          currentSchool: {
            ...prevState.currentSchool,
            docFiles: docFiles
          }
        }));
  }

  renderUpdates() {
    return (
            <div>
            <button
              className="badge badge-danger mr-2"
              onClick={this.deleteSchool}
            >
              Delete
            </button>

            <button
              type="submit"
              className="badge badge-success"
              onClick={this.updateSchool}
            >
              Update
            </button>

            <p>{this.state.message}</p>
            </div>
    );
  }

  render() {
    const { currentSchool } = this.state;

    return (
      <div>
        {(this.state.submitted /*&& this.state.newschool*/) ? (
          <div>
            <div>{this.state.message}</div>

            <a href={"/schoolsView/" + currentSchool.id} class="btn btn-success">返回</a>
{/*}
            <h4>学校信息成功提交!</h4>
            <button class="btn btn-success" onClick={this.newSchool}>
              Add
            </button>
*/}
          </div>
        ) : (
          <div class="row">
            <div class="col-sm-4">
              <div class="row">
                <h4>学校基本信息</h4>

                <div contenteditable="true" onDragOver={this.onDrag} onDrop={this.onDrop}>
                  {this.state.readonly ? "" :
                    <p contenteditable="false">编辑学校照片（拖拽照片文件或复制粘贴图标）</p>
                  }
                  <img id="schoolPhoto" src={currentSchool.photo ? currentSchool.photo : defaultPhoto}
                    width="320" height="320" class="responsive" readonly={this.state.readonly?"":false}
                  />
                </div>

                <div class="form-group">
                <label htmlFor="code">学校编号</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="code"
                required
                value={currentSchool.code}
                onChange={this.onChangeGenerics}
                name="code"
                />
                </div>

{/*
                <div class="form-group" hidden={this.state.readonly && !currentSchool.xr} >
                  <label htmlFor="xr">向荣支持</label>
                  <input
                    type="checkbox"
                    hidden={this.state.readonly}
                    class="form-control"
                    name="xr"
                    checked={currentSchool.xr}
                    onChange={this.onChangeGenerics}
                  />
                </div>
*/}
                <div class="form-group">
                <label htmlFor="name">欣欣学校名称</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="name"
                cols="31"
                required
                value={currentSchool.name}
                onChange={this.onChangeGenerics}
                name="name"
                />
                </div>


                <div class="form-group">
                <label htmlFor="schoolBoardRegisteredName">教育局注册校名</label>
                <textarea
                readonly={this.state.readonly?"":false}
                cols="31"
                class="form-control"
                id="schoolBoardRegisteredName"
                required
                value={currentSchool.schoolBoardRegisteredName}
                onChange={this.onChangeGenerics}
                name="schoolBoardRegisteredName"
                />
                </div>

                <div class="form-group">
                <label htmlFor="schoolBoard">教育局名称</label>
                <textarea
                readonly={this.state.readonly?"":false}
                cols="31"
                class="form-control"
                id="schoolBoard"
                required
                value={currentSchool.schoolBoard}
                onChange={this.onChangeGenerics}
                name="schoolBoard"
                />
                </div>

                <div class="w-100"></div>

                {(this.state.readonly && AuthService.getCurrentUser()) && (
                <div class="box">

                  {AuthService.getCurrentUser().schoolId &&
                    <a target="_blank" href={"/forms"} class="btn btn-primary">项目申请</a>}
                  <a target="_blank" href={"/users/school/" + currentSchool.id} class="btn btn-primary">用户</a>
                  {!AuthService.getCurrentUser().schoolId &&
                    <a target="_blank" href={"/logs/school/" + currentSchool.id} class="btn btn-primary">更新历史</a>}
                  {AuthService.getCurrentUser().schoolId &&
                    <a target="_blank" href={"/surveys/" + currentSchool.id} class="btn btn-primary mb-4">更新信息</a>}
                  {!AuthService.getCurrentUser().schoolId &&
                    <a target="_blank" href={"/schools/" + currentSchool.id} class="btn btn-primary mb-4">编辑</a>}
                </div>
                )}

              </div>
            </div>

            <div class="col-sm-8">
              <div class="row">

                <div class="form-group col-sm-4">
                <div>
                <div class="side"><label htmlFor="startAt">建校年份</label></div>
                <div class="side">
                {!this.state.readonly &&
                (<YearPicker
                yearArray={['2019', '2020']}
                value={currentSchool.startAt}
                onSelect={this.onChangeYPStartAt}
                hideInput={true}
                minRange={1995}
                maxRange={2022}
                />)}
                </div>
                </div>
                <input
                readonly=""
                type="text"
                class="form-control"
                id="startAt"
                required
                value={currentSchool.startAt}
                onChange={this.onChangeStartAt}
                name="startAt"
                />
                </div>

                <div class="form-group col-sm-4">
                <label htmlFor="donor">捐款人</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="donor"
                required
                value={currentSchool.donor}
                onChange={this.onChangeGenerics}
                name="donor"
                />
                </div>

                <div class="form-group col-sm-4">
                <div>
                <div class="side"><label htmlFor="lastVisit">最近访校年份</label></div>
                <div class="side">
                {!this.state.readonly &&
                (<YearPicker
                yearArray={['2019', '2020']}
                value={currentSchool.lastVisit}
                onSelect={this.onChangeYPLastVisit}
                hideInput={true}
                minRange={1995}
                maxRange={2022}
                />)}
                </div>
                </div>
                <input
                readonly=""
                type="text"
                class="form-control"
                id="lastVisit"
                required
                value={currentSchool.lastVisit}
                onChange={this.onChangeLastVisit}
                name="lastVisit"
                />
                </div>

                <div class="w-100"></div>


                <div class="select-container form-group col-sm-4">
                <label htmlFor="stage">学校阶段</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="stage"
                required
                value={currentSchool.stage}
                onChange={this.onChangeGenerics}
                name="stage"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.stages.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="select-container form-group col-sm-4">
                <label htmlFor="status">学校状态</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="status"
                required
                value={currentSchool.status}
                onChange={this.onChangeGenerics}
                name="status"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.statuses.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="select-container form-group col-sm-4">
                <label htmlFor="request">学校需求</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="request"
                required
                value={currentSchool.request}
                onChange={this.onChangeGenerics}
                name="request"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.requests.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="w-100"></div>

                <div class="select-container form-group col-sm-3">
                <label htmlFor="region">省/自治区/直辖市</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="region"
                required
                value={currentSchool.region}
                onChange={this.onChangeGenerics}
                name="region"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.regions.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="form-group col-sm-3">
                <label htmlFor="city">市</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="city"
                required
                value={currentSchool.city}
                onChange={this.onChangeGenerics}
                name="city"
                />
                </div>

                <div class="form-group col-sm-3">
                <label htmlFor="county">区/县</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="county"
                required
                value={currentSchool.county}
                onChange={this.onChangeGenerics}
                name="county"
                />
                </div>

                <div class="form-group col-sm-3">
                <label htmlFor="community">乡/镇</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="community"
                required
                value={currentSchool.community}
                onChange={this.onChangeGenerics}
                name="community"
                />
                </div>

                <div class="form-group col-sm-12">
                <label htmlFor="address">地址</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="address"
                required
                value={currentSchool.address}
                onChange={this.onChangeGenerics}
                name="address"
                />
                </div>

                <div class="w-100"></div>


                <div class="form-group col-sm-4">
                <label htmlFor="phone">学校电话</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="phone"
                required
                value={currentSchool.phone}
                onChange={this.onChangeGenerics}
                name="phone"
                />
                </div>

                <div class="form-group col-sm-4">
                <label htmlFor="email">学校电子邮箱</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="email"
                required
                value={currentSchool.email}
                onChange={this.onChangeGenerics}
                name="email"
                />
                </div>


                <div class="w-100"></div>

                <div class="form-group col-sm-4">
                <label htmlFor="studentsCount">学生人数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="studentsCount"
                required
                value={currentSchool.studentsCount}
                onChange={this.onChangeGenerics}
                name="studentsCount"
                />
                </div>

                <div class="form-group col-sm-4">
                <label htmlFor="teachersCount">教师人数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="teachersCount"
                required
                value={currentSchool.teachersCount}
                onChange={this.onChangeGenerics}
                name="teachersCount"
                />
                </div>

                <div class="select-container form-group col-sm-4">
                <label htmlFor="category">学校类型</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="category"
                required
                value={currentSchool.category}
                onChange={this.onChangeGenerics}
                name="category"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.categories.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="w-100"></div>

                <div class="form-group col-sm-4">
                  <label htmlFor="principalId">校长</label>
                  {!this.state.readonly
                  ? (<Select onChange={this.onChangePrincipalId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="principalId"
                    value={this.display(currentSchool.principalId)}
                    name="principalId"
                    options={this.state.users}
                  />)
                  : (<Link
                    to={ "/usersView/" + currentSchool.principalId}
                    id="principalId"
                    name="principalId"
                  >
                    {this.displayName(currentSchool.principalId)}
                  </Link>)}
                </div>

                <div class="form-group col-sm-4">
                  <label htmlFor="contactId">联络人</label>
                  {!this.state.readonly
                  ? (<Select onChange={this.onChangeContactId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="contactId"
                    value={this.display(currentSchool.contactId)}
                    name="contactId"
                    options={this.state.users}
                  />)
                  : (<Link
                    to={ "/usersView/" + currentSchool.contactId}
                    id="contactId"
                    name="contactId"
                  >
                    {this.displayName(currentSchool.contactId)}
                  </Link>)}
                </div>

                <div class="w-100"></div>


                <div class="form-group col-sm-12">
                <label htmlFor="description">简介</label>
                <textarea
                rows="4"
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="description"
                required
                value={currentSchool.description}
                onChange={this.onChangeGenerics}
                name="description"
                />
                </div>
              </div>
            </div>

            <div class="w-100"></div>

            {!this.state.readonly && (

            <div>

            <button onClick={this.saveSchool} class="btn btn-primary" hidden={!this.state.newschool}>
              提交
            </button>

            <button hidden={this.state.newschool}
              type="submit"
              className="btn btn-primary"
              onClick={this.updateSchool}
            >
              更新
            </button>

            <div class="w-100"></div>

            <form ref="formToSubmit" action="http://localhost:8080/api/documents-upload" method="POST" enctype="multipart/form-data">
                <div class="form-group input-group">
                <label for="input-multi-files">上传文件:</label>
                <input type="file" name="multi-files"
                multiple
                id="input-multi-files"
                class="form-control-file border"
                onChange={e => this.onChangeDocFiles(e)}
                />

                <select
                  className="form-control input-group-append"
                  name="docCategory" id="docCategory"
                  placeholder=""
                  value={currentSchool.docCategory}
                  onChange={e => this.onChangeGenerics(e)}
                >
                  <option value="">附件类别</option>
                  {this.state.docCategories.map((option) => (
                    <option value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <input type="hidden" name="schoolId" id="schoolId"/>
                </div>
            </form>

            <p>{this.state.message}</p>
            </div>

            )}

            <div class="w-100"></div>


            {!this.state.newschool && (<Tabs>
              <TabList>
                <Tab>更多信息 <i class="fas fa-hand-point-right"></i></Tab>
                <Tab>学校详情</Tab>
                <Tab>项目列表</Tab>
                <Tab>项目申请列表</Tab>
                <Tab>学校文档</Tab>
                <Tab>学校照片</Tab>
                <Tab>评论区</Tab>
                {currentSchool.xr ? <Tab>向荣支持项目</Tab> : null}
              </TabList>

              <TabPanel>
              </TabPanel>
              <TabPanel>
                <Survey
                  schoolId = {currentSchool.id}
                  embedded = {true}
                  readonly = {this.state.readonly}
                  ref = {this.surveyRef}
                />
              </TabPanel>
              <TabPanel>
                <ProjectsList
                  schoolId = {currentSchool.id}
                  embedded = {true}
                  readonly = {this.state.readonly}
                />
              </TabPanel>
              <TabPanel>
                <ResponsesList
                  schoolId = {currentSchool.id}
                  embedded = {true}
                  readonly = {this.state.readonly}
                />
              </TabPanel>
              <TabPanel>
                <DocumentsList
                  schoolId = {currentSchool.id}
                  docCategory = {'!照片'}
                  embedded = {true}
                  readonly = {this.state.readonly}
                />
              </TabPanel>
              <TabPanel>
                <DocumentsList
                  schoolId = {currentSchool.id}
                  docCategory = {'照片'}
                  embedded = {true}
                  readonly = {this.state.readonly}
                />
              </TabPanel>
              <TabPanel>
                <CommentsList
                  schoolId = {currentSchool.id}
                  readonly = {this.state.readonly}
                />
              </TabPanel>
              {currentSchool.xr ? (<TabPanel>
                <ProjectsList
                  schoolId = {currentSchool.id}
                  embedded = {true}
                  readonly = {this.state.readonly}
                  xr = {true}
                />
              </TabPanel>) : null}
            </Tabs>)}

          </div>
        ) }
      </div>
    );
  }
}
