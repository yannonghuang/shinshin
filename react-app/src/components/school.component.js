import React, { Component } from "react";
//import 'bootstrap/dist/css/bootstrap.min.css';
//import {Tabs, Tab} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";

import CommentsList from './comments-list.component.js';
import ProjectsList from './projects-list.component.js';
import ResponsesList from './responses-list.component.js';
import DocumentsList from './documents-list.component.js';
import SchoolDataService from "../services/school.service";
import DocumentDataService from "../services/document.service";
import SchoolDetails from './collapsible-school.component';

import YearPicker from 'react-single-year-picker';

export default class School extends Component {
  constructor(props) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePrincipal = this.onChangePrincipal.bind(this);
    this.onChangePhoto = this.onChangePhoto.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeStudentsCount = this.onChangeStudentsCount.bind(this);
    this.onChangeTeachersCount = this.onChangeTeachersCount.bind(this);
    this.onChangeRegion = this.onChangeRegion.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangeYPStartAt = this.onChangeYPStartAt.bind(this);

    this.onChangeStage = this.onChangeStage.bind(this);
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeRequest = this.onChangeRequest.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);

    this.getSchool = this.getSchool.bind(this);
    this.getSchoolPhoto = this.getSchoolPhoto.bind(this);
    this.updatePublished = this.updatePublished.bind(this);
    this.updateSchool = this.updateSchool.bind(this);
    this.updatePhoto = this.updatePhoto.bind(this);
    this.deleteSchool = this.deleteSchool.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onChangeDocFiles = this.onChangeDocFiles.bind(this);
    this.onChangeDocCategory = this.onChangeDocCategory.bind(this);

    this.saveSchool = this.saveSchool.bind(this);
    this.newSchool = this.newSchool.bind(this);

    this.state = {
      currentSchool: {
        id: null,
        name: "",
        code: "",
        description: "",
        principal: "",
        photo: null,
        file: null, // for photo
        region: "",
        address: "",
        phone: "",
        studentsCount: 0,
        teachersCount: 0,
        docFiles: [],
        docCategory: "",
        startAt: null,

        stage: "",
        status: "",
        request: "",
        category: "",
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

  onChangeName(e) {
    const name = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          name: name
        }
      };
    });
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

  getSchool(id) {
    SchoolDataService.get(id)
      .then(response => {
        this.setState({
          currentSchool: response.data
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

  updatePublished(status) {
    var data = {
      id: this.state.currentSchool.id,
      title: this.state.currentSchool.title,
      description: this.state.currentSchool.description,
      published: status
    };

    SchoolDataService.update(this.state.currentSchool.id, data)
      .then(response => {
        this.setState(prevState => ({
          currentSchool: {
            ...prevState.currentSchool,
            published: status
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
    var data = {
      name: this.state.currentSchool.name,
      code: this.state.currentSchool.code,
      description: this.state.currentSchool.description,
      principal: this.state.currentSchool.principal,
      //photo: this.state.currentSchool.photo,
      region: this.state.currentSchool.region,
      address: this.state.currentSchool.address,
      phone: this.state.currentSchool.phone,
      studentsCount: this.state.currentSchool.studentsCount,
      teachersCount: this.state.currentSchool.teachersCount,
      startAt: this.state.currentSchool.startAt ? (this.state.currentSchool.startAt + '-01-01') : '',

      stage: this.state.currentSchool.stage,
      status: this.state.currentSchool.status,
      request: this.state.currentSchool.request,
      category: this.state.currentSchool.category,
    };

    SchoolDataService.create(data)
      .then(response => {
        this.setState(prevState => ({
          currentSchool: {
            ...prevState.currentSchool,
            id: response.data.id,

            //name: response.data.name,
            //code: response.data.code,
            //description: response.data.description,
            //principal: response.data.principal,
            //photo: response.data.photo,
            //region: response.data.region,
            //address: response.data.address,
            //phone: response.data.phone,
            //studentsCount: response.data.studentsCount,
            //teachersCount: response.data.teachersCount,
            //startAt: response.data.startAt,
          },

          submitted: true
        }));

        if (this.state.currentSchool.file) { // photo, followed by docs
          this.updatePhoto();
        } else {
          if (this.state.currentSchool.docFiles) // docs
            this.uploadDocuments();
        }

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });

      //$('input[name="schoolId"]').attr('value', this.state.currentSchool.id );
      //this.refs.formToSubmit.submit();
  }

  updateSchool() {
    var data = {
      name: this.state.currentSchool.name,
      code: this.state.currentSchool.code,
      description: this.state.currentSchool.description,
      principal: this.state.currentSchool.principal,
      //photo: this.state.currentSchool.photo,
      region: this.state.currentSchool.region,
      address: this.state.currentSchool.address,
      phone: this.state.currentSchool.phone,
      studentsCount: this.state.currentSchool.studentsCount,
      teachersCount: this.state.currentSchool.teachersCount,
      startAt: this.state.currentSchool.startAt ? (this.state.currentSchool.startAt + '-01-01') : '',

      stage: this.state.currentSchool.stage,
      status: this.state.currentSchool.status,
      request: this.state.currentSchool.request,
      category: this.state.currentSchool.category,
    };

    SchoolDataService.update(
      this.state.currentSchool.id,
      data
      //this.state.currentSchool
    )
      .then(response => {
        console.log(response.data);

        if (this.state.currentSchool.file) { // photo, followed by docs
          this.updatePhoto();
        } else {
          if (this.state.currentSchool.docFiles) // docs
            this.uploadDocuments();
        }

        this.setState({
          message: "学校信息成功修改!"
        });

      })
      .catch(e => {
        console.log(e);
      });

/**
      if (this.state.currentSchool.file) {
        this.updatePhoto();
      } else {
        this.uploadDocuments();
      }
*/
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
         <h4>学校信息</h4>
        {(this.state.submitted && this.state.newschool) ? (
          <div>
            <h4>学校信息成功提交!</h4>
            <button class="btn btn-success" onClick={this.newSchool}>
              Add
            </button>
          </div>
        ) : (
          <div class="row">
            <div class="col-md-4">

              <div class="row">
                <div onDragOver={this.onDrag} onDrop={this.onDrop}>
                {this.state.readonly ? "" :
                <p>上传照片（拖拽照片文件到下框中）</p>
                }
                <img src={currentSchool.photo} height="200" width="300" readonly={this.state.readonly?"":false} />
                </div>

                <div class="form-group">
                <label htmlFor="name">学校名称</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="name"
                required
                value={currentSchool.name}
                onChange={this.onChangeName}
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
                onChange={this.onChangeCode}
                name="code"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group">
                <label htmlFor="users">学校用户</label>
                <Link
                  to={"/users/school/" + currentSchool.id}
                  id="users"
                  name="users"
                >
                  {"点击查看学校用户"}
                </Link>
                </div>

              </div>
            </div>



            <div class="col-md-8">
              <div class="row">
                <div class="form-group col-md-12">
                <label htmlFor="description">简介</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="description"
                required
                value={currentSchool.description}
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
                value={currentSchool.principal}
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
                value={currentSchool.phone}
                onChange={this.onChangePhone}
                name="phone"
                />
                </div>

                <div class="form-group col-md-3">
                <label htmlFor="startAt">建校年份</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="startAt"
                required
                value={currentSchool.startAt}
                onChange={this.onChangeStartAt}
                name="startAt"
                />
                </div>

                <YearPicker
                yearArray={['2019', '2020']}
                value={currentSchool.startAt}
                onSelect={this.onChangeYPStartAt}
                hideInput={true}
                minRange={1995}
                maxRange={2022}
                />

                <div class="w-100"></div>

                <div class="select-container form-group col-md-3">
                <label htmlFor="region">省/直辖市</label>
                <select
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="region"
                required
                value={currentSchool.region}
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
                value={currentSchool.address}
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
                value={currentSchool.studentsCount}
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
                value={currentSchool.teachersCount}
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
                value={currentSchool.category}
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
                value={currentSchool.status}
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
                value={currentSchool.request}
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
                value={currentSchool.stage}
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

            {this.state.readonly ? (
            <Tabs>
              <TabList>
                <Tab>学校详情</Tab>
                <Tab>项目列表</Tab>
                <Tab>项目申请列表</Tab>
                <Tab>学校文档</Tab>
                <Tab>学校照片</Tab>
                <Tab>评论区</Tab>
              </TabList>
              <TabPanel>
                <p>... 查看学校详情 ...</p>
              </TabPanel>
              <TabPanel>
                <ProjectsList schoolId = {currentSchool.id} />
              </TabPanel>
              <TabPanel>
                <ResponsesList schoolId = {currentSchool.id} />
              </TabPanel>
              <TabPanel>
                <DocumentsList schoolId = {currentSchool.id} />
              </TabPanel>
              <TabPanel>
                <DocumentsList schoolId = {currentSchool.id} docCategory = {'照片'} />
              </TabPanel>
              <TabPanel>
                <CommentsList schoolId = {currentSchool.id} />
              </TabPanel>
            </Tabs>

            ) : (

            <div>

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
                  value={currentSchool.docCategory}
                  onChange={e => this.onChangeDocCategory(e)}
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


            <button onClick={this.saveSchool} class="btn btn-success" hidden={!this.state.newschool}>
              Submit
            </button>

            <button hidden={this.state.newschool}
              className="badge badge-danger mr-2"
              onClick={this.deleteSchool}
            >
              Delete
            </button>

            <button hidden={this.state.newschool}
              type="submit"
              className="badge badge-success"
              onClick={this.updateSchool}
            >
              Update
            </button>

            <p>{this.state.message}</p>
            </div>

            )}
          </div>
        ) }
      </div>
    );
  }
}
