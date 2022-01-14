import React, { Component } from "react";
//import 'bootstrap/dist/css/bootstrap.min.css';
//import {Tabs, Tab} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Divider from '@material-ui/core/Divider';

import Survey from './survey.component.js';
import CommentsList from './comments-list.component.js';
import ProjectsList from './projects-list.component.js';
import ResponsesList from './responses-list.component.js';
import DocumentsList from './documents-list.component.js';
import SchoolDataService from "../services/school.service";
import SurveyDataService from "../services/survey.service";
import DocumentDataService from "../services/document.service";
//import SchoolDetails from './collapsible-school.component';

import YearPicker from 'react-single-year-picker';

export default class School extends Component {
  constructor(props) {
    super(props);

/**
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);

    this.onChangePrincipal = this.onChangePrincipal.bind(this);
    this.onChangePrincipalCell = this.onChangePrincipalCell.bind(this);
    this.onChangePrincipalWechat = this.onChangePrincipalWechat.bind(this);
    this.onChangeSchoolBoardRegisteredName = this.onChangeSchoolBoardRegisteredName.bind(this);
    this.onChangeSchoolBoard = this.onChangeSchoolBoard.bind(this);

    this.onChangeContact = this.onChangeContact.bind(this);
    this.onChangeContactCell = this.onChangeContactCell.bind(this);
    this.onChangeContactWechat = this.onChangeContactWechat.bind(this);

    this.onChangePhoto = this.onChangePhoto.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeStudentsCount = this.onChangeStudentsCount.bind(this);
    this.onChangeTeachersCount = this.onChangeTeachersCount.bind(this);
    this.onChangeRegion = this.onChangeRegion.bind(this);
    this.onChangeDonor = this.onChangeDonor.bind(this);


    this.onChangeStage = this.onChangeStage.bind(this);
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeRequest = this.onChangeRequest.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.onChangeDocCategory = this.onChangeDocCategory.bind(this);
*/
    this.onChangeGenerics = this.onChangeGenerics.bind(this);

    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangeYPStartAt = this.onChangeYPStartAt.bind(this);
    this.onChangeLastVisit = this.onChangeLastVisit.bind(this);
    this.onChangeYPLastVisit = this.onChangeYPLastVisit.bind(this);

    this.getSchool = this.getSchool.bind(this);
    this.getSchoolPhoto = this.getSchoolPhoto.bind(this);
    //this.updatePublished = this.updatePublished.bind(this);
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
        address: "",
        phone: "",
        studentsCount: 0,
        teachersCount: 0,
        description: "",
      },

      newschool: true,
      readonly: true,
      regions: [],
      docCategories: [],

      stages: [],
      statuses: [],
      requests: [],
      categories: [],

      message: "",
      submitted: false
    };
  }

  componentDidMount() {
    const newschool = window.location.pathname.includes('add');
    this.setState({newschool: newschool});
    this.setState({readonly: window.location.pathname.includes('View')});

    if (!newschool) {
      this.getSchool(this.props.match? this.props.match.params.id : this.props.id);
      this.getSchoolPhoto(this.props.match? this.props.match.params.id : this.props.id);
    }

    this.getRegions();
    this.getDocCategories();

    this.getCategories();
    this.getRequests();
    this.getStatuses();
    this.getStages();
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

/**
  onChangeStage(e) {
    const stage = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        stage: stage
      }
    }));
  }

  onChangeStatus(e) {
    const status = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        status: status
      }
    }));
  }

  onChangeRequest(e) {
    const request = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        request: request
      }
    }));
  }

  onChangeCategory(e) {
    const category = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        category: category
      }
    }));
  }


  onChangeSchoolBoardRegisteredName(e) {
    const schoolBoardRegisteredName = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          schoolBoardRegisteredName: schoolBoardRegisteredName
        }
      };
    });
  }

  onChangeSchoolBoard(e) {
    const schoolBoard = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          schoolBoard: schoolBoard
        }
      };
    });
  }
*/

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

/**
  onChangeDonor(e) {
    const donor = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          donor: donor
        }
      };
    });
  }

  onChangeDocCategory(e) {
    const docCategory = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          docCategory: docCategory
        }
      };
    });
  }

  onChangeCode(e) {
    const code = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          code: code
        }
      };
    });
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        description: description
      }
    }));
  }

  onChangePrincipal(e) {
    const principal = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        principal: principal
      }
    }));
  }

  onChangePrincipalCell(e) {
    const principalCell = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        principalCell: principalCell
      }
    }));
  }

  onChangePrincipalWechat(e) {
    const principalWechat = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        principalWechat: principalWechat
      }
    }));
  }

  onChangeContact(e) {
    const contact = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        contact: contact
      }
    }));
  }

  onChangeContactCell(e) {
    const contactCell = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        contactCell: contactCell
      }
    }));
  }

  onChangeContactWechat(e) {
    const contactWechat = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        contactWechat: contactWechat
      }
    }));
  }


  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        photo: photo
      }
    }));
  }


  onChangeAddress(e) {
    const address = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        address: address
      }
    }));
  }

  onChangeRegion(e) {
    const region = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        region: region
      }
    }));
  }

  onChangePhone(e) {
    const phone = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        phone: phone
      }
    }));
  }

  onChangeTeachersCount(e) {
    const teachersCount = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        teachersCount: teachersCount
      }
    }));
  }

  onChangeStudentsCount(e) {
    const studentsCount = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        studentsCount: studentsCount
      }
    }));
  }
*/

  getSchool(schoolId) {
    const {
      id,
      photo,
      file,
      docFiles,
      docCategory,
      ...others} = this.state.currentSchool;

    SchoolDataService.get(schoolId)
      .then(response => {

        SurveyDataService.get(schoolId)
        .then (r => {
          this.setState({
              currentSchool: {...others, ...response.data}
            }, () => {
            const {id, ...others2} = SchoolDataService.reduce(r.data, this.state.currentSchool);
            this.setState(prevState => ({
                    currentSchool: {
                      id: prevState.currentSchool.id,
                      ...others2
                    }
            }));
          });

        })
        .catch (err => {
          alert(err.message);
        });

        //this.getSchoolPhoto(id);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
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

        if (this.state.currentSchool.file) { // photo, followed by docs
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

        if (this.state.currentSchool.file) { // photo, followed by docs
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


  updatePhoto() {
    var data = new FormData();
    data.append('multi-files', this.state.currentSchool.file, this.state.currentSchool.file.name);
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
            <h4>{this.state.message}</h4>

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
            <div class="col-md-4">
              <div class="row">
                <h4>学校基本信息</h4>

                <div onDragOver={this.onDrag} onDrop={this.onDrop}>
                {this.state.readonly ? "" :
                <p>上传照片（拖拽照片文件到下框中）</p>
                }
                <img src={currentSchool.photo} height="250" width="350" readonly={this.state.readonly?"":false} />
                </div>

                <div class="form-group">
                <label htmlFor="name">学校名称</label>
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

                <div class="form-group">
                <label htmlFor="schoolBoardRegisteredName">教育局校名</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="schoolBoardRegisteredName"
                required
                value={currentSchool.schoolBoardRegisteredName}
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
                value={currentSchool.schoolBoard}
                onChange={this.onChangeGenerics}
                name="schoolBoard"
                />
                </div>

                <div class="w-100"></div>

                {this.state.readonly && (
                <div class="box">
                  <a target="_blank" href={"/users/school/" + currentSchool.id} class="btn btn-primary">用户</a>
                  <a target="_blank" href={"/logs/school/" + currentSchool.id} class="btn btn-primary">历史</a>
                  <a target="_blank" href={"/schools/" + currentSchool.id} class="btn btn-primary mb-4">编辑</a>
                </div>
                )}

              </div>
            </div>

            <div class="col-md-8">
              <div class="row">

                <div class="form-group col-md-4">
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

                <div class="form-group col-md-4">
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

                <div class="form-group col-md-4">
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

                <div class="w-100"></div>


                <div class="select-container form-group col-md-4">
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

                <div class="select-container form-group col-md-4">
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

                <div class="select-container form-group col-md-4">
                <label htmlFor="request">学校需求状态</label>
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

                <div class="select-container form-group col-md-3">
                <label htmlFor="region">省/自治区</label>
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

                <div class="form-group col-md-9">
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

                <div class="form-group col-md-4">
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

                <div class="form-group col-md-4">
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

                <div class="select-container form-group col-md-4">
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

                <div class="form-group col-md-4">
                <label htmlFor="principal">校长</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="principal"
                required
                value={currentSchool.principal}
                onChange={this.onChangeGenerics}
                name="principal"
                />
                </div>

                <div class="form-group col-md-4">
                <label htmlFor="principalCell">校长手机</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="principalCell"
                required
                value={currentSchool.principalCell}
                onChange={this.onChangeGenerics}
                name="principalCell"
                />
                </div>

                <div class="form-group col-md-4">
                <label htmlFor="principalWechat">校长微信</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="principalWechat"
                required
                value={currentSchool.principalWechat}
                onChange={this.onChangeGenerics}
                name="principalWechat"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-md-4">
                <label htmlFor="contact">联络人</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="contact"
                required
                value={currentSchool.contact}
                onChange={this.onChangeGenerics}
                name="contact"
                />
                </div>

                <div class="form-group col-md-4">
                <label htmlFor="contactCell">联络人手机</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="contactCell"
                required
                value={currentSchool.contactCell}
                onChange={this.onChangeGenerics}
                name="contactCell"
                />
                </div>

                <div class="form-group col-md-4">
                <label htmlFor="contactWechat">联络人微信</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="contactWechat"
                required
                value={currentSchool.contactWechat}
                onChange={this.onChangeGenerics}
                name="contactWechat"
                />
                </div>

                <div class="w-100"></div>


                <div class="form-group col-md-12">
                <label htmlFor="description">简介</label>
                <textarea
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

            <button onClick={this.saveSchool} class="btn btn-success" hidden={!this.state.newschool}>
              提交
            </button>

            <button hidden={this.state.newschool}
              type="submit"
              className="btn btn-success"
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


            <Tabs>
              <TabList>
                <Tab>更多信息 <i class="fas fa-hand-point-right"></i></Tab>
                <Tab>学校详情</Tab>
                <Tab>项目列表</Tab>
                <Tab>项目申请列表</Tab>
                <Tab>学校文档</Tab>
                <Tab>学校照片</Tab>
                <Tab>评论区</Tab>
              </TabList>

              <TabPanel>
              </TabPanel>
              <TabPanel>
                <Survey
                  schoolId = {currentSchool.id}
                  embedded = {true}
                  readonly = {this.state.readonly}
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
            </Tabs>

          </div>
        ) }
      </div>
    );
  }
}
