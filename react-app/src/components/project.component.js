import React, { Component } from "react";
//import 'bootstrap/dist/css/bootstrap.min.css';
//import {Tabs, Tab} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Select from 'react-select';

import ResponsesList from './responses-list.component.js';
import DossiersList from './dossiers-list.component.js';
import ProjectDataService from "../services/project.service";
import DossierDataService from "../services/dossier.service";
import SchoolDataService from "../services/school.service";
//import ProjectDetails from './collapsible-project.component';

export default class Project extends Component {
  constructor(props) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.onChangeResponseId = this.onChangeResponseId.bind(this);

    this.onChangeBudget = this.onChangeBudget.bind(this);

    this.onChangePhoto = this.onChangePhoto.bind(this);
    this.onChangeStatus = this.onChangeStatus.bind(this);

    this.getProject = this.getProject.bind(this);
    this.getProjectPhoto = this.getProjectPhoto.bind(this);
    this.updatePublished = this.updatePublished.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.updatePhoto = this.updatePhoto.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onChangeDocFiles = this.onChangeDocFiles.bind(this);
    this.onChangeDocCategory = this.onChangeDocCategory.bind(this);

    this.saveProject = this.saveProject.bind(this);
    this.newProject = this.newProject.bind(this);

    this.state = {
      currentProject: {
        id: null,
        name: "",
        schoolId: null,
        responseId: null,
        status: "",
        budget: 0,
        photo: null,
        file: null, // for photo
        status: "",

        docFiles: [],
        docCategory: ""
      },

      schools: [],
      statuses: [],

      newproject: true,
      readonly: true,
      docCategories: [],
      message: "",
      submitted: false
    };
  }

  componentDidMount() {
    const newproject = window.location.pathname.includes('add');
    this.setState({newproject: newproject});
    this.setState({readonly: window.location.pathname.includes('View')});

    if (!newproject) {
      this.getProject(this.props.match.params.id);
      //this.getProjectPhoto(this.props.match.params.id);
    }

    this.getDocCategories();
    this.getSchools();
    this.getStatuses();
  }

  convert(schools) {
    const result = [];
    if (schools) {
    for (var i = 0; i < schools.length; i++) {
      result.push({value: schools[i].id,
        label: schools[i].region + "-" + schools[i].code + "-" + schools[i].name});
    }
    return result;
    }
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

  getStatuses() {
    ProjectDataService.getStatuses()
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


  getDocCategories() {
    DossierDataService.getDocCategories()
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

  onChangeName(e) {
    const name = e.target.value;

    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          name: name
        }
      };
    });
  }

  onChangeSchoolId(e) {
    const schoolId = e.value; //.target.value;

    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          schoolId: schoolId
        }
      };
    });
  }

  onChangeResponseId(e) {
    const responseId = e.target.value;

    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          responseId: responseId
        }
      };
    });
  }

  onChangeDocCategory(e) {
    const docCategory = e.target.value;

    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          docCategory: docCategory
        }
      };
    });
  }

  onChangeBudget(e) {
    const budget = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        budget: budget
      }
    }));
  }


  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        photo: photo
      }
    }));
  }

  onChangeStatus(e) {
    const status = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        status: status
      }
    }));
  }


  getProject(id) {
    ProjectDataService.get(id)
      .then(response => {
        this.setState({
          currentProject: response.data,
        });

        this.setState(prevState => ({
              currentProject: {
                ...prevState.currentProject,
                schoolId: response.data.school ? response.data.school.id : null
              }
            }));

        this.setState(prevState => ({
              currentProject: {
                ...prevState.currentProject,
                responseId: response.data.response ? response.data.response.id : null
              }
            }));

        this.getProjectPhoto(id);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getProjectPhoto(id) {
    ProjectDataService.getPhoto(id)
      .then(response => {
        var imageURL = 'data:image/png;base64,' +
            new Buffer(response.data.data.photo, 'binary').toString('base64');

        this.setState(prevState => ({
              currentProject: {
                ...prevState.currentProject,
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
      id: this.state.currentProject.id,
      title: this.state.currentProject.title,
      budget: this.state.currentProject.budget,
      published: status
    };

    ProjectDataService.update(this.state.currentProject.id, data)
      .then(response => {
        this.setState(prevState => ({
          currentProject: {
            ...prevState.currentProject,
            published: status
          }
        }));
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newProject() {
  this.setState(prevState => ({
    currentProject: {
      ...prevState.currentProject,
      id: null,
      name: "",
      budget: 0,
      photo: null,
      file: null,
      status: "",
      docFiles: [],
      docCategory: "",
      },

      submitted: false
    }));

  }

  saveProject() {
    var data = {
      name: this.state.currentProject.name,
      budget: this.state.currentProject.budget,
      schoolId: this.state.currentProject.schoolId,
      responseId: this.state.currentProject.responseId,
      status: this.state.currentProject.status,
    };

    ProjectDataService.create(data)
      .then(response => {
        this.setState(prevState => ({
          currentProject: {
            ...prevState.currentProject,
            id: response.data.id,

            //name: response.data.name,
            //budget: response.data.budget,
            //status: response.data.status,
          },

          submitted: true
        }));

        if (this.state.currentProject.file) { // photo, followed by docs
          this.updatePhoto();
        } else {
          if (this.state.currentProject.docFiles) // docs
            this.uploadDossiers();
        }

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });

      //$('input[name="projectId"]').attr('value', this.state.currentProject.id );
      //this.refs.formToSubmit.submit();
  }

  updateProject() {
    var data = {
      name: this.state.currentProject.name,
      budget: this.state.currentProject.budget,
      //photo: this.state.currentProject.photo,
      status: this.state.currentProject.status,
      schoolId: this.state.currentProject.schoolId,
      responseId: this.state.currentProject.responseId,
    };

    ProjectDataService.update(
      this.state.currentProject.id,
      data
      //this.state.currentProject
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "The project was updated successfully!"
        });

        if (this.state.currentProject.file) { // photo, followed by docs
          this.updatePhoto();
        } else {
          if (this.state.currentProject.docFiles) // docs
            this.uploadDossiers();
        }

      })
      .catch(e => {
        console.log(e);
      });

/**
      if (this.state.currentProject.file) {
        this.updatePhoto();
      } else {
        this.uploadDossiers();
      }
*/
  }


  updatePhoto() {
    var data = new FormData();
    data.append('multi-files', this.state.currentProject.file, this.state.currentProject.file.name);
    ProjectDataService.updatePhoto(this.state.currentProject.id, data)
    .then(response => {
      if (this.state.currentProject.docFiles) { // docs
        this.uploadDossiers();
      }
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  uploadDossiers() {
    var data = new FormData();
    for (var i = 0; i < this.state.currentProject.docFiles.length; i++) {
      data.append('multi-files', this.state.currentProject.docFiles[i],
        this.state.currentProject.docFiles[i].name);
    }
    data.append('docCategory', this.state.currentProject.docCategory);
    ProjectDataService.uploadDossiers(this.state.currentProject.id, data)
    .then(response => {
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  deleteProject() {
    ProjectDataService.delete(this.state.currentProject.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/projects')
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
          currentProject: {
            ...prevState.currentProject,
            file: file
          }
        }));

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        photo: reader.result
      }
    }));
  }


  onChangeDocFiles(e) {
    e.preventDefault();
    var docFiles = e.target.files;
    this.setState(prevState => ({
          currentProject: {
            ...prevState.currentProject,
            docFiles: docFiles
          }
        }));
  }

  renderUpdates() {
    return (
            <div>
            <button
              className="badge badge-danger mr-2"
              onClick={this.deleteProject}
            >
              Delete
            </button>

            <button
              type="submit"
              className="badge badge-success"
              onClick={this.updateProject}
            >
              Update
            </button>

            <p>{this.state.message}</p>
            </div>
    );
  }

  render() {
    const { currentProject } = this.state;

    return (
      <div>
         <h4>项目信息</h4>
        {(this.state.submitted && this.state.newproject) ? (
          <div>
            <h4>You submitted successfully!</h4>
            <button class="btn btn-success" onClick={this.newProject}>
              Add
            </button>
          </div>
        ) : (
          <div class="row">
            <div class="col-md-4">

              <div class="row">
                <div onDragOver={this.onDrag} onDrop={this.onDrop}>
                <p>上传照片（拖拽照片文件到下框中）</p>
                <img src={currentProject.photo} height="200" width="300" readonly={this.state.readonly?"":false} />
                </div>

                <div class="form-group">
                <label htmlFor="name">项目名称</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="name"
                required
                value={currentProject.name}
                onChange={this.onChangeName}
                name="name"
                />
                </div>
              </div>
            </div>

            <div class="col-md-8">
              <div class="row">
                <div class="col-md-8">
                  <label htmlFor="schoolId">学校</label>
                  <Select onChange={this.onChangeSchoolId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="schoolId"
                    value={this.display(currentProject.schoolId)}
                    name="schoolId"
                    options={this.state.schools}
                  />
                </div>
{/*}
                    <option value="">学校编号（省-学校名）</option>
                    {this.state.schools.map((option) => (
                      <option value={option.id}>{option.code + "(" + option.region + " - " + option.name + ")"}</option>
                    ))}
                  </Select>
*/}

                <div class="w-100"></div>

                <div class="col-md-4">
                <label htmlFor="budget">预算</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number" min="0.00" max="10000.00" step="0.01"
                class="form-control"
                id="budget"
                required
                value={currentProject.budget}
                onChange={this.onChangeBudget}
                name="budget"
                />
                </div>

                {(currentProject.responseId) ? (
                <div class="col-md-4">
                <label htmlFor="response">项目申请</label>
                <Link
                  to={"/responsesView/" + currentProject.responseId}
                  id="response"
                  name="response"
                >
                  {"点击查看项目申请"}
                </Link>
                </div>
                ) : '' }

                <div class="w-100"></div>

                <div class="select-container form-group col-md-4">
                <label htmlFor="status">项目状态</label>
                <select onChange={this.onChangeStatus}
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="status"
                required
                value={currentProject.status}
                onChange={this.onChangeStatus}
                name="status"
                >
                <option value="">请选择</option>
                {this.state.statuses.map((option) => (
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
                <Tab>项目详情</Tab>
                <Tab>项目文档</Tab>
              </TabList>
              <TabPanel>
                <p>... 查看学校详情 ...</p>
              </TabPanel>
              <TabPanel>
                <DossiersList projectId = {currentProject.id} />
              </TabPanel>
            </Tabs>

            ) : (

            <div>

            <form ref="formToSubmit" action="http://localhost:8080/api/dossiers-upload" method="POST" enctype="multipart/form-data">
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
                  value={currentProject.docCategory}
                  onChange={e => this.onChangeDocCategory(e)}
                >
                  <option value="">附件类别</option>
                  {this.state.docCategories.map((option) => (
                    <option value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <input type="hidden" name="projectId" id="projectId"/>
                </div>
            </form>


            <button onClick={this.saveProject} class="btn btn-success" hidden={!this.state.newproject}>
              Submit
            </button>

            <button hidden={this.state.newproject}
              className="badge badge-danger mr-2"
              onClick={this.deleteProject}
            >
              Delete
            </button>

            <button hidden={this.state.newproject}
              type="submit"
              className="badge badge-success"
              onClick={this.updateProject}
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
