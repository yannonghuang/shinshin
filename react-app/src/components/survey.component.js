import React, { Component } from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Divider from '@material-ui/core/Divider';

import Select from 'react-select';

import SurveyDataService from "../services/survey.service";
import SchoolDataService from "../services/school.service";
import DocumentDataService from "../services/document.service";

import YearPicker from 'react-single-year-picker';

export default class Survey extends Component {
  constructor(props) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePrincipal = this.onChangePrincipal.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeStudentsCount = this.onChangeStudentsCount.bind(this);
    this.onChangeTeachersCount = this.onChangeTeachersCount.bind(this);
    this.onChangeRegion = this.onChangeRegion.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangeYPStartAt = this.onChangeYPStartAt.bind(this);
    this.onChangeDocCategory = this.onChangeDocCategory.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);

    this.onChangeStage = this.onChangeStage.bind(this);
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeRequest = this.onChangeRequest.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);

    this.getSurvey = this.getSurvey.bind(this);
    this.updateSurvey = this.updateSurvey.bind(this);
    this.deleteSurvey = this.deleteSurvey.bind(this);
    this.onChangeDocFiles = this.onChangeDocFiles.bind(this);
    this.onChangeDocCategory = this.onChangeDocCategory.bind(this);

    this.saveSurvey = this.saveSurvey.bind(this);
    this.newSurvey = this.newSurvey.bind(this);

    this.state = {
      currentSurvey: {
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
        startAt: null,

        schoolId: null,

        stage: "",
        status: "",
        request: "",
        category: "",
      },

      embedded: false,
      newsurvey: true,
      readonly: true,
      regions: [],
      docCategories: [],

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

  onChangeStartAt(e) {
    const startAt = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSurvey: {
          ...prevState.currentSurvey,
          startAt: startAt
        }
      };
    });
  }

  onChangeYPStartAt(e) {
    const startAt = e; //.target.value;

    this.setState(function(prevState) {
      return {
        currentSurvey: {
          ...prevState.currentSurvey,
          startAt: startAt
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
              <h4>学校详情</h4>
                {!this.state.embedded && (<div class="form-group" style={{width: "100%"}}>
                  <label htmlFor="schoolId">学校</label>
                  <Select onChange={this.onChangeSchoolId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="schoolId"
                    value={this.display(currentSurvey.schoolId)}
                    name="schoolId"
                    options={this.state.schools}
                  />
                </div>)}

                {!this.state.readonly && (<div>
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
                    placeholder=""
                    value={currentSurvey.docCategory}
                    onChange={e => this.onChangeDocCategory(e)}
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
                  </form>

                  <button onClick={this.saveSurvey} class="btn btn-success" hidden={!this.state.newsurvey}>
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
                  <a target="_blank" href={"/surveys/" + currentSurvey.schoolId} class="btn btn-primary mb-4">
                    编辑
                  </a>
                )}

              </div>
            </div>

            <div class="col-md-9">
              <div class="row">
                <div class="form-group col-md-12">
                <label htmlFor="description">简介</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="description"
                required
                value={currentSurvey.description}
                onChange={this.onChangeDescription}
                name="description"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-md-4">
                <label htmlFor="principal">校长</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="principal"
                required
                value={currentSurvey.principal}
                onChange={this.onChangePrincipal}
                name="principal"
                />
                </div>

                <div class="form-group col-md-4">
                <label htmlFor="phone">电话</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="phone"
                required
                value={currentSurvey.phone}
                onChange={this.onChangePhone}
                name="phone"
                />
                </div>

                <div class="form-group col-md-4">
                <div>
                <div class="side"><label htmlFor="startAt">建校年份</label></div>
                <div class="side">
                {!this.state.readonly &&
                (<YearPicker
                yearArray={['2019', '2020']}
                value={currentSurvey.startAt}
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
                value={currentSurvey.startAt}
                onChange={this.onChangeStartAt}
                name="startAt"
                />
                </div>


                <div class="w-100"></div>

                <div class="select-container form-group col-md-3">
                <label htmlFor="region">省/直辖市</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="region"
                required
                value={currentSurvey.region}
                onChange={this.onChangeRegion}
                name="region"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.regions.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="form-group col-md-9">
                <label htmlFor="address">地址</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="address"
                required
                value={currentSurvey.address}
                onChange={this.onChangeAddress}
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
                onChange={this.onChangeStudentsCount}
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
                onChange={this.onChangeTeachersCount}
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
                onChange={this.onChangeCategory}
                name="category"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.categories.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="select-container form-group col-md-4">
                <label htmlFor="status">学校状态</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="status"
                required
                value={currentSurvey.status}
                onChange={this.onChangeStatus}
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
                onChange={this.onChangeRequest}
                name="request"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.requests.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>


                <div class="select-container form-group col-md-4">
                <label htmlFor="stage">学校阶段</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="stage"
                required
                value={currentSurvey.stage}
                onChange={this.onChangeStage}
                name="stage"
                >
                <option value="">{this.state.readonly ? '' : '请选择' }</option>
                {this.state.stages.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>
              </div>
            </div>

            <div class="w-100"></div>


            <div class="w-100"></div>

          </div>
        ) }
      </div>
    );
  }
}
