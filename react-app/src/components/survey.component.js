import React, { Component } from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Divider from '@material-ui/core/Divider';

import Select from 'react-select';

import UserDataService from "../services/auth.service";
import SurveyDataService from "../services/survey.service";
import SchoolDataService from "../services/school.service";
import DocumentDataService from "../services/document.service";

import YearPicker from 'react-single-year-picker';

export default class Survey extends Component {
  constructor(props) {
    super(props);
/**
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePrincipal = this.onChangePrincipal.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangeStudentsCount = this.onChangeStudentsCount.bind(this);
    this.onChangeTeachersCount = this.onChangeTeachersCount.bind(this);
    this.onChangeRegion = this.onChangeRegion.bind(this);
    this.onChangeDocCategory = this.onChangeDocCategory.bind(this);


    this.onChangePrincipal = this.onChangePrincipal.bind(this);
    this.onChangePrincipalCell = this.onChangePrincipalCell.bind(this);
    this.onChangePrincipalWechat = this.onChangePrincipalWechat.bind(this);
    this.onChangeSchoolBoardRegisteredName = this.onChangeSchoolBoardRegisteredName.bind(this);
    this.onChangeSchoolBoard = this.onChangeSchoolBoard.bind(this);

    this.onChangeContact = this.onChangeContact.bind(this);
    this.onChangeContactCell = this.onChangeContactCell.bind(this);
    this.onChangeContactWechat = this.onChangeContactWechat.bind(this);

    this.onChangeStage = this.onChangeStage.bind(this);
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeRequest = this.onChangeRequest.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
*/
    this.onChangeGenerics = this.onChangeGenerics.bind(this);

    this.getSurvey = this.getSurvey.bind(this);
    this.updateSurvey = this.updateSurvey.bind(this);
    this.deleteSurvey = this.deleteSurvey.bind(this);
    this.onChangeDocFiles = this.onChangeDocFiles.bind(this);

    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.onChangePrincipalId = this.onChangePrincipalId.bind(this);
    this.onChangeContactId = this.onChangeContactId.bind(this);

    this.saveSurvey = this.saveSurvey.bind(this);
    this.newSurvey = this.newSurvey.bind(this);

    this.state = {
      currentSurvey: {
        id: null,
        schoolId: null,
        docFiles: [],
        docCategory: "",

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

        stayBehindCount: 0,
        boarderCount: 0,
        kClassesCount: 0,
        g1ClassesCount: 0,
        g2ClassesCount: 0,
        g3ClassesCount: 0,
        g4ClassesCount: 0,
        g5ClassesCount: 0,
        g6ClassesCount: 0,
        kStudentsCount: 0,
        g1StudentsCount: 0,
        g2StudentsCount: 0,
        g3StudentsCount: 0,
        g4StudentsCount: 0,
        g5StudentsCount: 0,
        g6StudentsCount: 0,
        mStudentsCount: 0,
        computersCount: 0,
        computerRoomExists: false,
        computerRoomCount: 0,
        internetExists: false,
        multimediaSystemsCount: 0,
        libraryExists: false,
        bookCornersCount: 0,
        booksCount: 0,

      },

      embedded: false,
      newsurvey: true,
      readonly: true,
      regions: [],
      docCategories: [],

      users: [],

      schools: [],
      stages: [],
      statuses: [],
      requests: [],
      categories: [],

      message: "",
      submitted: false
    };
  }

  componentDidMount() {
    const newsurvey = window.location.pathname.includes('add');
    this.setState({newsurvey: newsurvey});
    this.setState({readonly: window.location.pathname.includes('View')});

    var schoolId = this.props.match? this.props.match.params.schoolId : this.props.schoolId;
    const id = this.props.match? this.props.match.params.id : this.props.id;
    schoolId = schoolId ? schoolId : id;
    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        schoolId: schoolId
      }
    }));

    const embedded = this.props.match? this.props.match.params.embedded : this.props.embedded;
    this.setState({embedded: embedded});

    if (!newsurvey) {
      this.getSurvey(schoolId);
    }

    this.getSchools();

    this.getRegions();
    this.getDocCategories();

    this.getCategories();
    this.getRequests();
    this.getStatuses();
    this.getStages();
    this.getUsers(schoolId);
  }


  convertUser(users) {
    const result = [];
    if (users) {
    for (var i = 0; i < users.length; i++) {
      result.push({value: users[i].id,
        label: users[i].chineseName });
    }
    return result;
    }
  }

  displayUser(userId) {
    if (this.state.users) {
      for (var i = 0; i < this.state.users.length; i++) {
        if (this.state.users[i].value == userId)
          return this.state.users[i];
      }
      return [];
    }
  }

  displayNameUser(userId) {
    if (this.state.users) {
      for (var i = 0; i < this.state.users.length; i++) {
        if (this.state.users[i].value == userId)
          return this.state.users[i].label ? this.state.users[i].label : '中文名';
      }
      return '';
    }
  }

  getUsers(schoolId) {
    //UserDataService.getAll2({schoolId: this.state.currentSurvey.schoolId})
    UserDataService.getAllSimple({schoolId: schoolId})
      .then(response => {
        this.setState({
          users: this.convertUser(response.data)
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getSchools() {
    SchoolDataService.getAllSimple()
      .then(response => {
        this.setState({
          schools: this.convert(response.data)
        });
        console.log(response);
      })
      .catch(e => {
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
    SchoolDataService.getRequests()
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
    SchoolDataService.getStatuses()
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

  display(schoolId) {
    if (this.state.schools) {
      for (var i = 0; i < this.state.schools.length; i++) {
        if (this.state.schools[i].value == schoolId)
          return this.state.schools[i];
      }
      return [];
    }
  }

  convert(schools) {
    const result = [];
    if (schools) {
    for (var i = 0; i < schools.length; i++) {
      result.push({value: schools[i].id,
        label: schools[i].code + "-" + schools[i].name + "-" + schools[i].region});
    }
    return result;
    }
  }

  onChangeSchoolId(e) {
    const schoolId = e.value; //.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        schoolId: schoolId
      }
    }));
  }

/**
  onChangeSchoolBoardRegisteredName(e) {
    const schoolBoardRegisteredName = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSurvey: {
          ...prevState.currentSurvey,
          schoolBoardRegisteredName: schoolBoardRegisteredName
        }
      };
    });
  }

  onChangeSchoolBoard(e) {
    const schoolBoard = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSurvey: {
          ...prevState.currentSurvey,
          schoolBoard: schoolBoard
        }
      };
    });
  }


  onChangePrincipal(e) {
    const principal = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        principal: principal
      }
    }));
  }

  onChangePrincipalCell(e) {
    const principalCell = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        principalCell: principalCell
      }
    }));
  }

  onChangePrincipalWechat(e) {
    const principalWechat = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        principalWechat: principalWechat
      }
    }));
  }

  onChangeContact(e) {
    const contact = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        contact: contact
      }
    }));
  }

  onChangeContactCell(e) {
    const contactCell = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        contactCell: contactCell
      }
    }));
  }

  onChangeContactWechat(e) {
    const contactWechat = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        contactWechat: contactWechat
      }
    }));
  }

  onChangeStage(e) {
    const stage = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        stage: stage
      }
    }));
  }

  onChangeStatus(e) {
    const status = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        status: status
      }
    }));
  }

  onChangeRequest(e) {
    const request = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        request: request
      }
    }));
  }

  onChangeCategory(e) {
    const category = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        category: category
      }
    }));
  }

  onChangeName(e) {
    const name = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSurvey: {
          ...prevState.currentSurvey,
          name: name
        }
      };
    });
  }

  onChangeDocCategory(e) {
    const docCategory = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSurvey: {
          ...prevState.currentSurvey,
          docCategory: docCategory
        }
      };
    });
  }

  onChangeCode(e) {
    const code = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSurvey: {
          ...prevState.currentSurvey,
          code: code
        }
      };
    });
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        description: description
      }
    }));
  }

  onChangePrincipal(e) {
    const principal = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        principal: principal
      }
    }));
  }


  onChangeAddress(e) {
    const address = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        address: address
      }
    }));
  }

  onChangeRegion(e) {
    const region = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        region: region
      }
    }));
  }

  onChangePhone(e) {
    const phone = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        phone: phone
      }
    }));
  }

  onChangeEmail(e) {
    const email = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        email: email
      }
    }));
  }

  onChangeTeachersCount(e) {
    const teachersCount = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        teachersCount: teachersCount
      }
    }));
  }

  onChangeStudentsCount(e) {
    const studentsCount = e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        studentsCount: studentsCount
      }
    }));
  }
*/

  onChangePrincipalId(e) {
    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        principalId: e.value //.target.value
      }
    }));
  }

  onChangeContactId(e) {
    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        contactId: e.value //.target.value
      }
    }));
  }

  onChangeGenerics(e) {
    const name = e.target.name;
    const type = e.target.type;
    const value = (type === "checkbox") ? e.target.checked : e.target.value;

    this.setState(prevState => ({
      currentSurvey: {
        ...prevState.currentSurvey,
        [name]: value
      }
    }));
  }

  getSurvey(id) {
    SurveyDataService.get(id)
      .then(response => {
        this.setState({
          currentSurvey: response.data
        });

        //this.getSurveyPhoto(id);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }


  newSurvey() {
  this.setState(prevState => ({
    currentSurvey: {
      ...prevState.currentSurvey,
      id: null,
      name: "",
      code: "",
      description: "",
      principal: "",

      region: "",
      address: "",
      phone: "",
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

  saveSurvey() {

    SurveyDataService.create(this.state.currentSurvey)
      .then(response => {
        this.setState(prevState => ({

          currentSurvey: {
            ...prevState.currentSurvey,
            id: response.data.id,
          },

          message: "学校信息成功提交!",
          submitted: true
        }));

        if (this.state.currentSurvey.docFiles) // docs
          this.uploadDocuments();

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

      //$('input[name="surveyId"]').attr('value', this.state.currentSurvey.id );
      //this.refs.formToSubmit.submit();
  }

  updateSurvey() {

    SurveyDataService.update(
      this.state.currentSurvey.schoolId,
      this.state.currentSurvey
      //this.state.currentSurvey
    )
      .then(response => {
        console.log(response.data);

        if (this.state.currentSurvey.docFiles) // docs
          this.uploadDocuments();

        this.setState({
          message: "学校信息成功修改!",
          submitted: true
        });

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


  uploadDocuments() {
    var data = new FormData();
    for (var i = 0; i < this.state.currentSurvey.docFiles.length; i++) {
      data.append('multi-files', this.state.currentSurvey.docFiles[i],
        this.state.currentSurvey.docFiles[i].name);
    }
    data.append('docCategory', this.state.currentSurvey.docCategory);
    SchoolDataService.uploadDocuments(this.state.currentSurvey.schoolId, data)
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

  deleteSurvey() {
    SurveyDataService.delete(this.state.currentSurvey.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/surveys')
      })
      .catch(e => {
        console.log(e);
      });
  }



  onChangeDocFiles(e) {
    e.preventDefault();
    var docFiles = e.target.files;
    this.setState(prevState => ({
          currentSurvey: {
            ...prevState.currentSurvey,
            docFiles: docFiles
          }
        }));
  }

  renderUpdates() {
    return (
            <div>
            <button
              className="badge badge-danger mr-2"
              onClick={this.deleteSurvey}
            >
              Delete
            </button>

            <button
              type="submit"
              className="badge badge-success"
              onClick={this.updateSurvey}
            >
              Update
            </button>

            <p>{this.state.message}</p>
            </div>
    );
  }

  render() {
    const { currentSurvey } = this.state;

    return (
      <div>
        {(this.state.submitted /*&& this.state.newsurvey*/) ? (
          <div>
            <h4>{this.state.message}</h4>

            <a href={"/surveysView/" + currentSurvey.schoolId} class="btn btn-success">返回</a>
{/*}
            <h4>学校信息成功提交!</h4>
            <button class="btn btn-success" onClick={this.newSurvey}>
              Add
            </button>
*/}
          </div>
        ) : (
          <div class="row">
            <div class="col-md-3">
              <div class="row">
              {!this.state.embedded &&
              (<div>
                <h4>学校详情</h4>
                <div class="form-group" style={{width: "100%"}}>
                  <label htmlFor="schoolId">学校</label>
                  <Select onChange={this.onChangeSchoolId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="schoolId"
                    value={this.display(currentSurvey.schoolId)}
                    name="schoolId"
                    options={this.state.schools}
                  />
                </div>

                <div class="form-group">
                <label htmlFor="schoolBoardRegisteredName">教育局校名</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="schoolBoardRegisteredName"
                required
                value={currentSurvey.schoolBoardRegisteredName}
                onChange={this.onChangeGenerics}
                name="schoolBoardRegisteredName"
                />
                </div>

                <div class="form-group">
                <label htmlFor="schoolBoard">教育局</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="schoolBoard"
                required
                value={currentSurvey.schoolBoard}
                onChange={this.onChangeGenerics}
                name="schoolBoard"
                />
                </div>
              </div>)}

                {!this.state.readonly && (<div>
                <div class="w-100"></div>

                  {!this.state.embedded && (<form ref="formToSubmit"
                    action="http://localhost:8080/api/documents-upload" method="POST" enctype="multipart/form-data">
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
                    placeholder=""
                    name="docCategory" id="docCategory"
                    value={currentSurvey.docCategory}
                    onChange={e => this.onChangeGenerics(e)}
                  >
                    <option value="">附件类别</option>
                    {this.state.docCategories.map((option) => (
                      <option value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input type="hidden" name="surveyId" id="surveyId"/>
                  </div>
                  </form>)}


                  <button onClick={this.saveSurvey}

                    class="btn btn-success"
                    hidden={!this.state.newsurvey}>
                    提交
                  </button>
                  <button hidden={this.state.newsurvey}

                    type="submit"
                    className="btn btn-success"
                    onClick={this.updateSurvey}
                  >
                    更新
                  </button>

                  <p>{this.state.message}</p>
                </div>)}

                <div class="w-100"></div>

                {(this.state.readonly) && (
                  <a target="_blank"

                    href={"/surveys/" + currentSurvey.schoolId} class="btn btn-primary mb-4">
                    编辑
                  </a>
                )}

              </div>
            </div>

            <div class="col-md-9">

              {!this.state.embedded &&
              (<div class="row">

                <div class="w-100"></div>

                <div class="col-md-4">
                </div>

                <div class="select-container form-group col-md-4">
                <label htmlFor="status">学校状态</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="status"
                required
                value={currentSurvey.status}
                onChange={this.onChangeGenerics}
                name="status"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.statuses.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="select-container form-group col-md-4">
                <label htmlFor="request">学校需求状态</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="request"
                required
                value={currentSurvey.request}
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

                <div class="select-container form-group col-md-3">
                <label htmlFor="region">省/自治区</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="region"
                required
                value={currentSurvey.region}
                onChange={this.onChangeGenerics}
                name="region"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.regions.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>


                <div class="form-group col-md-3">
                <label htmlFor="city">市</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="city"
                required
                value={currentSurvey.city}
                onChange={this.onChangeGenerics}
                name="city"
                />
                </div>

                <div class="form-group col-md-3">
                <label htmlFor="county">区/县</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="county"
                required
                value={currentSurvey.county}
                onChange={this.onChangeGenerics}
                name="county"
                />
                </div>

                <div class="form-group col-md-3">
                <label htmlFor="community">乡镇</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="community"
                required
                value={currentSurvey.community}
                onChange={this.onChangeGenerics}
                name="community"
                />
                </div>

                <div class="form-group col-md-12">
                <label htmlFor="address">地址</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="address"
                required
                value={currentSurvey.address}
                onChange={this.onChangeGenerics}
                name="address"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-md-4">
                <label htmlFor="studentsCount">学生人数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="studentsCount"
                required
                value={currentSurvey.studentsCount}
                onChange={this.onChangeGenerics}
                name="studentsCount"
                />
                </div>

                <div class="form-group col-md-4">
                <label htmlFor="teachersCount">教师人数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="teachersCount"
                required
                value={currentSurvey.teachersCount}
                onChange={this.onChangeGenerics}
                name="teachersCount"
                />
                </div>

                <div class="select-container form-group col-md-4">
                <label htmlFor="category">学校类型</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="category"
                required
                value={currentSurvey.category}
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

                <div class="form-group col-md-4">
                  <label htmlFor="principalId">校长</label>
                  {!this.state.readonly
                  ? (<Select onChange={this.onChangePrincipalId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="principalId"
                    value={this.displayUser(currentSurvey.principalId)}
                    name="principalId"
                    options={this.state.users}
                  />)
                  : (<Link
                    to={ "/usersView/" + currentSurvey.principalId}
                    id="principalId"
                    name="principalId"
                  >
                    {this.displayNameUser(currentSurvey.principalId)}
                  </Link>)}
                </div>

                <div class="form-group col-md-4">
                  <label htmlFor="contactId">联络人</label>
                  {!this.state.readonly
                  ? (<Select onChange={this.onChangeContactId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="contactId"
                    value={this.displayUser(currentSurvey.contactId)}
                    name="contactId"
                    options={this.state.users}
                  />)
                  : (<Link
                    to={ "/usersView/" + currentSurvey.contactId}
                    id="contactId"
                    name="contactId"
                  >
                    {this.displayNameUser(currentSurvey.contactId)}
                  </Link>)}
                </div>

                <div class="w-100"></div>

                <div class="form-group col-md-12">
                <label htmlFor="description">简介</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="description"
                required
                value={currentSurvey.description}
                onChange={this.onChangeGenerics}
                name="description"
                />
                </div>

              </div>)}


              <div class="row">
                <div class="w-100"></div>

                <div class="form-group col-md-5">
                <label htmlFor="phone">学校电话</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="phone"
                required
                value={currentSurvey.phone}
                onChange={this.onChangeGenerics}
                name="phone"
                />
                </div>


                <div class="form-group col-md-5">
                <label htmlFor="email">学校电子邮箱</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="email"
                required
                value={currentSurvey.email}
                onChange={this.onChangeGenerics}
                name="email"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-md-2">
                <label htmlFor="stayBehindCount">留守儿童人数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="stayBehindCount"
                required
                value={currentSurvey.stayBehindCount}
                onChange={this.onChangeGenerics}
                name="stayBehindCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="boarderCount">学生住宿人数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="boarderCount"
                required
                value={currentSurvey.boarderCount}
                onChange={this.onChangeGenerics}
                name="boarderCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="kClassesCount">学前班级数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="kClassesCount"
                required
                value={currentSurvey.kClassesCount}
                onChange={this.onChangeGenerics}
                name="kClassesCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="kStudentsCount">学前学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="kStudentsCount"
                required
                value={currentSurvey.kStudentsCount}
                onChange={this.onChangeGenerics}
                name="kStudentsCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="mStudentsCount">初中学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="mStudentsCount"
                required
                value={currentSurvey.mStudentsCount}
                onChange={this.onChangeGenerics}
                name="mStudentsCount"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-md-2">
                <label htmlFor="g1ClassesCount">一年级班级数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g1ClassesCount"
                required
                value={currentSurvey.g1ClassesCount}
                onChange={this.onChangeGenerics}
                name="g1ClassesCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g2ClassesCount">二年级班级数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g2ClassesCount"
                required
                value={currentSurvey.g2ClassesCount}
                onChange={this.onChangeGenerics}
                name="g2ClassesCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g3ClassesCount">三年级班级数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g3ClassesCount"
                required
                value={currentSurvey.g3ClassesCount}
                onChange={this.onChangeGenerics}
                name="g3ClassesCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g4ClassesCount">四年级班级数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g4ClassesCount"
                required
                value={currentSurvey.g4ClassesCount}
                onChange={this.onChangeGenerics}
                name="g4ClassesCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g5ClassesCount">五年级班级数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g5ClassesCount"
                required
                value={currentSurvey.g5ClassesCount}
                onChange={this.onChangeGenerics}
                name="g5ClassesCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g6ClassesCount">六年级班级数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g6ClassesCount"
                required
                value={currentSurvey.g6ClassesCount}
                onChange={this.onChangeGenerics}
                name="g6ClassesCount"
                />
                </div>

                <div class="w-100"></div>


                <div class="form-group col-md-2">
                <label htmlFor="g1StudentsCount">一年级学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g1StudentsCount"
                required
                value={currentSurvey.g1StudentsCount}
                onChange={this.onChangeGenerics}
                name="g1StudentsCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g2StudentsCount">二年级学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g2StudentsCount"
                required
                value={currentSurvey.g2StudentsCount}
                onChange={this.onChangeGenerics}
                name="g2StudentsCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g3StudentsCount">三年级学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g3StudentsCount"
                required
                value={currentSurvey.g3StudentsCount}
                onChange={this.onChangeGenerics}
                name="g3StudentsCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g4StudentsCount">四年级学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g4StudentsCount"
                required
                value={currentSurvey.g4StudentsCount}
                onChange={this.onChangeGenerics}
                name="g4StudentsCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g5StudentsCount">五年级学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g5StudentsCount"
                required
                value={currentSurvey.g5StudentsCount}
                onChange={this.onChangeGenerics}
                name="g5StudentsCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="g6StudentsCount">六年级学生数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="g6StudentsCount"
                required
                value={currentSurvey.g6StudentsCount}
                onChange={this.onChangeGenerics}
                name="g6StudentsCount"
                />
                </div>


                <div class="form-group col-md-2">
                <label htmlFor="computersCount">办公电脑数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="computersCount"
                required
                value={currentSurvey.computersCount}
                onChange={this.onChangeGenerics}
                name="computersCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="computerRoomExists">是否有电脑室</label>
                <input
                readonly={this.state.readonly?"":false}
                type="checkbox"
                class="form-control"
                id="computerRoomExists"
                required
                checked={currentSurvey.computerRoomExists}
                onChange={this.onChangeGenerics}
                name="computerRoomExists"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="computerRoomCount">电脑室电脑数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="computerRoomCount"
                required
                value={currentSurvey.computerRoomCount}
                onChange={this.onChangeGenerics}
                name="computerRoomCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="internetExists">可否上网</label>
                <input
                readonly={this.state.readonly?"":false}
                type="checkbox"
                class="form-control"
                id="internetExists"
                required
                checked={currentSurvey.internetExists}
                onChange={this.onChangeGenerics}
                name="internetExists"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="multimediaSystemsCount">多媒体一体机数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="multimediaSystemsCount"
                required
                value={currentSurvey.multimediaSystemsCount}
                onChange={this.onChangeGenerics}
                name="multimediaSystemsCount"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-md-2">
                <label htmlFor="libraryExists">是否有图书室</label>
                <input
                readonly={this.state.readonly?"":false}
                type="checkbox"
                class="form-control"
                id="libraryExists"
                required
                checked={currentSurvey.libraryExists}
                onChange={this.onChangeGenerics}
                name="libraryExists"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="bookCornersCount">图书角数量</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="bookCornersCount"
                required
                value={currentSurvey.bookCornersCount}
                onChange={this.onChangeGenerics}
                name="bookCornersCount"
                />
                </div>

                <div class="form-group col-md-2">
                <label htmlFor="booksCount">图书册数</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number"
                class="form-control"
                id="booksCount"
                required
                value={currentSurvey.booksCount}
                onChange={this.onChangeGenerics}
                name="booksCount"
                />
                </div>

              </div>
            </div>

            <div class="w-100"></div>

          </div>
        ) }
      </div>
    );
  }
}
