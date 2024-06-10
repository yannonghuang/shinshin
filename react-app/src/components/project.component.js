//import React, { Component } from "react";
import React, { Component } from "react"; //For react component
//import 'bootstrap/dist/css/bootstrap.min.css';
//import {Tabs, Tab} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
//import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Select from 'react-select';

import YearPicker from 'react-single-year-picker';

//import ResponsesList from './responses-list.component.js';
import DossiersList from './dossiers-list.component.js';
import ProjectDataService from "../services/project.service";
import DossierDataService from "../services/dossier.service";
import SchoolDataService from "../services/school.service";
import AuthService from "./../services/auth.service";
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
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);

    this.onChangeQuantity1 = this.onChangeQuantity1.bind(this);
    this.onChangeQuantity2 = this.onChangeQuantity2.bind(this);
    this.onChangeQuantity3 = this.onChangeQuantity3.bind(this);

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
    this.onChangePCategoryId = this.onChangePCategoryId.bind(this);
    this.onChangePSubCategoryId = this.onChangePSubCategoryId.bind(this);

    this.saveProject = this.saveProject.bind(this);
    this.newProject = this.newProject.bind(this);

    this.state = {
      currentProject: {
        id: null,
        name: "",
        schoolId: null,
        responseId: null,
        status: "申请",
        budget: 0,
        photo: null,
        file: null, // for photo
        description: "",
        startAt: new Date().getFullYear(), //null,
        xr: window.location.pathname.includes('XR'),

        docFiles: null, //[],
        docCategory: "",
        pCategoryId: null,
        pSubCategoryId: null,
        
        quantity1: 0,
        quantity2: 0,
        quantity3: 0,
      },
      currentUser: null,
      schools: [],
      statuses: [],

      newproject: true,
      readonly: true,
      docCategories: [],
      message: "",
      submitted: false,

      pastedPhotoType: null,

      dirty: false,
      progress: 0,
      hasErrors: false,

      pCategories: ProjectDataService.PROJECT_CATEGORIES,
    };
  }

  componentDidMount() {
    const newproject = window.location.pathname.includes('add');
    this.setState({newproject: newproject});
    const readonly = window.location.pathname.includes('View');
    this.setState({readonly: readonly}, () => {this.init(readonly)});
    //this.setState({readonly: window.location.pathname.includes('View')});

    if (!newproject) {
      this.getProject(this.props.match.params.id);
      //this.getProjectPhoto(this.props.match.params.id);
    }

    this.getDocCategories();
    this.getSchools();
    this.getStatuses();
  }


  init(readonly) {
    function onkeydownInEditable(e: KeyboardEvent) {
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")
        e.preventDefault();
    }
    document.getElementById('projectPhotoDiv').addEventListener("keydown", onkeydownInEditable);

    if (readonly) return;

    document.getElementById('projectPhotoDiv').onpaste = async (pasteEvent) => {
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
              currentProject: {
                ...prevState.currentProject,
                photo: reader.result
              },
              pastedPhotoType: type,
              dirty: true
            }));

            if (document.getElementById('projectPhoto'))
              document.getElementById('projectPhoto').src = reader.result;

            return;
          }

        }
      }
    };

  }

  convert(schools) {
    const result = [];
    if (schools) {
    for (var i = 0; i < schools.length; i++) {
      result.push({value: schools[i].id,
        label: schools[i].code + "-" + schools[i].name + "-" + schools[i].region });
    }
    return result;
    }
  }

  display(schoolId) {
    if (this.state.schools) {
      for (var i = 0; i < this.state.schools.length; i++) {
        if (this.state.schools[i].value === schoolId)
          return this.state.schools[i];
      }
      return [];
    }
  }

  displayName(schoolId) {
    if (this.state.schools) {
      for (var i = 0; i < this.state.schools.length; i++) {
        if (this.state.schools[i].value === schoolId)
          return this.state.schools[i].label ? this.state.schools[i].label : '学校名';
      }
      return '';
    }
  }

  getSchools() {
    SchoolDataService.getAllSimple()
      .then(response => {
        this.setState({
          schools: this.convert(response.data)
        });

        const user = AuthService.getCurrentUser();
        if (user) {
          this.setState({
          currentUser: user,
          });
          if (user.schoolId) {
            this.setState(function(prevState) {
              return {
                currentProject: {
                  ...prevState.currentProject,
                  schoolId: user.schoolId
                }
              };
            });
          }
        }
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  OLDgetSchools() {
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
        },
        dirty: true
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
        },
        dirty: true
      };
    });
  }

  onChangePCategoryId(e) {
    //const pCategoryId = e.target.selectedIndex; //e.target.value;
    const pCategoryId = ProjectDataService.PROJECT_CATEGORIES_ID[e.target.selectedIndex].id;

    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          pCategoryId: pCategoryId,
          pSubCategoryId: null
        },
        dirty: true
      };
    });
  }

  SAVE_onChangePSubCategoryId(e) {
    const pSubCategoryId = e.target.selectedIndex;

    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          pSubCategoryId: pSubCategoryId
        },
        dirty: true
      };
    });
  }

  onChangePSubCategoryId(e) {
    let selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    let pSubCategoryId = ProjectDataService.encodeSub(
        ProjectDataService.getProjectSubCategories(this.state.currentProject.pCategoryId), 
        selectedOptions);

    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          pSubCategoryId: pSubCategoryId
        },
        dirty: true
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
        },
        dirty: true
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
        },
        dirty: true
      };
    });
  }

  onChangeBudget(e) {
    const budget = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        budget: budget
      },
      dirty: true
    }));
  }


  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        photo: photo
      },
      dirty: true
    }));
  }

  onChangeStatus(e) {
    const status = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        status: status
      },
      dirty: true
    }));
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        description: description
      },
      dirty: true
    }));
  }

  onChangeStartAt(e) {
    const startAt = e; //e.target.value;
    this.setState(function(prevState) {
      return {
        currentProject: {
          ...prevState.currentProject,
          startAt: startAt
        },
        dirty: true
      };
    });
  };

  onChangeQuantity1(e) {
    const quantity1 = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        quantity1: quantity1
      },
      dirty: true
    }));
  }

  onChangeQuantity2(e) {
    const quantity2 = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        quantity2: quantity2
      },
      dirty: true
    }));
  }

  onChangeQuantity3(e) {
    const quantity3 = e.target.value;

    this.setState(prevState => ({
      currentProject: {
        ...prevState.currentProject,
        quantity3: quantity3
      },
      dirty: true
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
      published: status,
      quantity1: this.state.currentProject.quantity1,
      quantity2: this.state.currentProject.quantity2,
      quantity3: this.state.currentProject.quantity3,
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
      status: "申请",
      docFiles: null, //[],
      docCategory: "",
      description: "",
      startAt: new Date().getFullYear(), //null
      pCategoryId: null,
      pSubCategoryId: null,
      quantity1: 0,      
      quantity2: 0,
      quantity3: 0
    },

    submitted: false
  }));

  }

/**
  SAVE_saveProject() {
    var data = {
      name: this.state.currentProject.name,
      budget: this.state.currentProject.budget,
      schoolId: this.state.currentProject.schoolId,
      responseId: this.state.currentProject.responseId,
      status: this.state.currentProject.status,
      description: this.state.currentProject.description,
    };

    ProjectDataService.create(data)
      .then(response => {
        this.setState(prevState => ({
          currentProject: {
            ...prevState.currentProject,
            id: response.data.id,
          },
          //submitted: true
        }));

        if (this.state.currentProject.file) { // photo, followed by docs
          this.updatePhoto();
        } else {
          //if (this.state.currentProject.docFiles) // docs
          this.uploadDossiers();
        }

        this.setState({
          message: this.state.dirty ? "项目信息成功提交!" : "项目信息没有修改",
          hasErrors: false,
        });

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });

      //$('input[name="projectId"]').attr('value', this.state.currentProject.id );
      //this.refs.formToSubmit.submit();
  }
*/


  validateSchool() {

    if (!this.state.currentProject.schoolId) {
      this.setState({
        message: "请选择学校"
      });
      return false;
    }
    return true;
  }

  async saveProject() {
    if (!this.validateSchool()) return;

    var data = {
      name: this.state.currentProject.name,
      budget: this.state.currentProject.budget,
      schoolId: this.state.currentProject.schoolId,
      responseId: this.state.currentProject.responseId,
      status: this.state.currentProject.status,
      description: this.state.currentProject.description,
      startAt: this.state.currentProject.startAt ? (this.state.currentProject.startAt + '-01-10') : null,
      xr: this.state.currentProject.xr,
      pCategoryId: this.state.currentProject.pCategoryId,
      pSubCategoryId: this.state.currentProject.pSubCategoryId,   
      quantity1: this.state.currentProject.quantity1,   
      quantity2: this.state.currentProject.quantity2,  
      quantity3: this.state.currentProject.quantity3,  
    };

    try {
      let response = await ProjectDataService.create(data);

      await this.setState(prevState => ({
        currentProject: {
          ...prevState.currentProject,
          id: response.data.id,
        },
      }));

      if (this.state.currentProject.file || this.state.pastedPhotoType)
        await this.updatePhoto();

      //if (this.state.currentProject.docFiles) // docs
      this.uploadDossiers();

      this.setState({
        message: this.state.dirty ? "项目信息成功提交!" : "项目信息没有修改",
        //submitted: true
        hasErrors: false,
      });

    } catch (e) {
      const resMessage =
        (e.response &&
          e.response.data &&
          e.response.data.message) ||
        e.message ||
        e.toString();

        this.setState({
          message: "项目信息提交失败：" + resMessage,
          hasErrors: true,
        });

      console.log(e);
    };

  }

  async updateProject() {
    if (!this.validateSchool()) return;

    var data = {
      name: this.state.currentProject.name,
      budget: this.state.currentProject.budget,
      //photo: this.state.currentProject.photo,
      status: this.state.currentProject.status,
      schoolId: this.state.currentProject.schoolId,
      responseId: this.state.currentProject.responseId,
      description: this.state.currentProject.description,
      startAt: this.state.currentProject.startAt ? (this.state.currentProject.startAt + '-01-10') : null,
      pCategoryId: this.state.currentProject.pCategoryId,
      pSubCategoryId: this.state.currentProject.pSubCategoryId, 
      quantity1: this.state.currentProject.quantity1,     
      quantity2: this.state.currentProject.quantity2, 
      quantity3: this.state.currentProject.quantity3, 
    };

    try {
      await ProjectDataService.update(this.state.currentProject.id, data);

      if (this.state.currentProject.file || this.state.pastedPhotoType)
        await this.updatePhoto();

      //if (this.state.currentProject.docFiles) // docs
      this.uploadDossiers();

      this.setState({
        message: this.state.dirty ? "项目信息成功修改!" : "项目信息没有修改",
        //submitted: true
        hasErrors: false,
      });

    } catch (e) {
      const resMessage =
        (e.response &&
          e.response.data &&
          e.response.data.message) ||
        e.message ||
        e.toString();

        this.setState({
          message: "项目信息修改失败：" + resMessage,
          hasErrors: true,
        });

        console.log(e);
    }
  }

/**
  SAVE_updateProject() {
    var data = {
      name: this.state.currentProject.name,
      budget: this.state.currentProject.budget,
      //photo: this.state.currentProject.photo,
      status: this.state.currentProject.status,
      schoolId: this.state.currentProject.schoolId,
      responseId: this.state.currentProject.responseId,
      description: this.state.currentProject.description,
    };

    ProjectDataService.update(
      this.state.currentProject.id,
      data
      //this.state.currentProject
    )
      .then(response => {

        if (this.state.currentProject.file) { // photo, followed by docs
          this.updatePhoto();
        } else {
          //if (this.state.currentProject.docFiles) // docs
          this.uploadDossiers();
        }

        this.setState({
          message: this.state.dirty ? "项目信息成功修改!" : "项目信息没有修改",
          //submitted: true
          hasErrors: false,
        });

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });

  }
*/

/*
  async updatePhoto() {
    var data = new FormData();
    data.append('multi-files', this.state.currentProject.file, this.state.currentProject.file.name);
    await ProjectDataService.updatePhoto(this.state.currentProject.id, data);
  }
*/

  async updatePhoto() {
    var data = new FormData();
    if (this.state.currentProject.file)
      data.append('multi-files', this.state.currentProject.file, this.state.currentProject.file.name);
    else if (this.state.pastedPhotoType) {
      const base64Response = await fetch(this.state.currentProject.photo);
      const blob = await base64Response.blob();
      data.append('multi-files', new Blob([blob], {type: this.state.pastedPhotoType}));
    }
    await ProjectDataService.updatePhoto(this.state.currentProject.id, data);
  }

  uploadDossiers() {
    if (this.state.currentProject.docFiles && (this.state.currentProject.docFiles.length > 0) &&
        !this.state.currentProject.docCategory) {
      throw new Error('项目信息附件没有上传，请选择文档类型!');
    }

    var data = new FormData();
    for (var i = 0; i < (this.state.currentProject.docFiles
                        ? this.state.currentProject.docFiles.length : 0); i++) {
      data.append('multi-files', this.state.currentProject.docFiles[i],
        this.state.currentProject.docFiles[i].name);
    }
    data.append('docCategory', this.state.currentProject.docCategory);
    ProjectDataService.uploadDossiers(this.state.currentProject.id, data, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
    .then(response => {
      this.setState(prevState => ({
        message: prevState.message + (this.state.currentProject.docFiles ? " 项目信息附件成功上传!" : ""),
        submitted: true,
        hasErrors: false,
      }));
      console.log(response.data);
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
          },
          dirty: true
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
          },
          dirty: true
        }));

	var label = e.target.nextElementSibling;

    var msgFilesPicked = docFiles.length > 0
        ? '已选文件：'
        : null;
    var msg = docFiles.length > 0
        ? '已选择' + docFiles.length + '个文件，请选下面附件类别'
        : label.innerHTML;
    for (var i = 0; i < docFiles.length; i++)
      msgFilesPicked += docFiles[i].name + '; ';
    label.title = msgFilesPicked;
    label.innerHTML = msg;
  }


  SAVE_onChangeDocFiles(e) {
    e.preventDefault();
    var docFiles = e.target.files;
    this.setState(prevState => ({
          currentProject: {
            ...prevState.currentProject,
            docFiles: docFiles
          },
          dirty: true
        }));

    let fileButton = document.getElementById("input-multi-files-custom-button");
    var msgFilesPicked = docFiles.length > 0
        ? '已选文件：'
        : null;
    var msg = docFiles.length > 0
        ? '已选择' + docFiles.length + '个文件，点击重选'
        : fileButton.value;
    for (var i = 0; i < docFiles.length; i++)
      msgFilesPicked += docFiles[i].name + '; ';
    fileButton.title = msgFilesPicked;
    fileButton.innerHTML = msg;
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

  customFilter(option, inputValue) {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

/**
  SAVE_isUploading() {
    if (!this.state.currentProject.docFiles) return false;
    return this.state.submitted && !this.state.doneLoading;
  }
*/

  isUploading() {
    return (this.state.progress > 0);
  }

  refreshOnReturn() {
    window.onblur = () => {window.onfocus = () => {
      window.location.reload(true);
    }};
  }

  render() {
    const { currentProject, progress } = this.state;

    return (
      <div>
        {(this.state.submitted /*&& this.state.newproject*/) ? (
          <div>
            <p>{this.state.message}</p>
            <a href="javascript:window.close();">
              <button class="btn btn-primary">关闭</button>
            </a>
{/*}
            <h4>项目信息成功提交!</h4>
            <button class="btn btn-success" onClick={this.newProject}>
              Add
            </button>
*/}
          </div>
        ) : (
          <div class="row">
            <div class="col-sm-4">

              <div class="row">

                <div contenteditable = {this.state.readonly ? "false" : "true"} //"true"
                  onDragOver={!this.state.readonly && this.onDrag}
                  onDrop={!this.state.readonly && this.onDrop}
                  id="projectPhotoDiv"
                >
                  {this.state.readonly ? "" :
                    <p contenteditable="false">编辑项目照片（拖拽照片文件或复制粘贴图标）</p>
                  }
                  <img id="projectPhoto" src={currentProject.photo }
                    width="320" height="320" class="responsive" readonly={this.state.readonly?"":false}
                  />
                </div>
{/*
                <div onDragOver={this.onDrag} onDrop={this.onDrop}>
                {!this.state.readonly && <p>上传照片（拖拽照片文件到下框中）</p>}
                <img src={currentProject.photo} height="200" width="300" readonly={this.state.readonly?"":false} />
                </div>
*/}

                <div class="form-group">
                <label htmlFor="name">{currentProject.xr && '向荣支持'}项目名称</label>
                <textarea
                readonly={(this.state.readonly || !AuthService.isAdmin()) ? "" : false}
                cols="26"
                class="form-control"
                id="name"
                required
                value={currentProject.name}
                onChange={this.onChangeName}
                name="name"
                />
                </div>
              </div>

                {this.state.readonly && AuthService.getCurrentUser() &&
                 !AuthService.getCurrentUser().schoolId && (
                <div class="box">
                  <a target="_blank" onClick={this.refreshOnReturn}
                    href={"/projects/" + currentProject.id} class="btn btn-primary mb-4"
                  >
                    编辑
                  </a>
                </div>
                )}

            </div>

            <div class="col-sm-8">
              <div class="row">
                <div class="form-group col-sm-12">
                <label htmlFor="description">项目描述</label>
                <textarea
                rows="4"
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="description"
                required
                value={currentProject.description}
                onChange={this.onChangeDescription}
                name="description"
                />
                </div>

                <div class="w-100"></div>

                <div className="form-group col-sm-6">
                  <label htmlFor="pCategoryId">项目类型</label>
                  <select
                    disabled={this.state.readonly?"disabled":false}
                    class="form-control"
                    id="pCategoryId"
                    required
                    value={ProjectDataService.getCategory(currentProject.pCategoryId) /*this.state.pCategories[currentProject.pCategoryId]*/}
                    onChange={this.onChangePCategoryId}
                    name="pCategoryId"
                  >

                    {this.state.pCategories.map((option, index) => (
                    <option value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-sm-6" title={'可多选：按Command(Mac系统)或Ctrl(windows系统)键'}
                >
                  <label htmlFor="pSubCategoryId">项目子类型</label>
                  <select
                    disabled={this.state.readonly?"disabled":false}
                    class="form-control"
                    id="pSubCategoryId"
                    required
                    value={ProjectDataService.getSubCategoryArray(currentProject.pCategoryId, currentProject.pSubCategoryId)}
                    onChange={this.onChangePSubCategoryId}
                    name="pSubCategoryId"
                    multiple
                  >

                    {ProjectDataService.getProjectSubCategories(currentProject.pCategoryId).map((option, index) => (
                    <option value={option}>{option}</option>
                    ))}
                    <option value=''>
                      --
                    </option>                        
                  </select>
                </div>

                <div class="col-sm-8">
                  <label htmlFor="schoolId">学校</label>
                  {(!this.state.readonly && AuthService.isAdmin()) || this.state.newproject
                  ? (<Select onChange={this.onChangeSchoolId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    required
                    id="schoolId"
                    value={this.display(currentProject.schoolId)}
                    name="schoolId"
                    filterOption={this.customFilter}
                    options={this.state.schools}
                  />)
                  : (<Link
                    to={ "/schoolsView/" + currentProject.schoolId}
                    id="schoolId"
                    name="schoolId"
                    >
                      {this.displayName(currentProject.schoolId)}
                  </Link>)}
                </div>
{/*}
                    <option value="">学校编号（省-学校名）</option>
                    {this.state.schools.map((option) => (
                      <option value={option.id}>{option.code + "(" + option.region + " - " + option.name + ")"}</option>
                    ))}
                  </Select>
*/}

                <div class="w-100"></div>

                <div class="col-sm-4">
                <label htmlFor="budget">费用</label>
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
                <div class="col-sm-4">
                <label htmlFor="response">项目申请</label>
                <Link
                  to={(this.state.readonly ? "/responsesView/" : "/responses/") + currentProject.responseId}
                  id="response"
                  name="response"
                >
                  {"点击查看项目申请"}
                </Link>
                </div>
                ) : '' }


                {(!currentProject.xr) ? (
                <div class="select-container form-group col-sm-4">
                <label htmlFor="status">项目状态</label>
                <select onChange={this.onChangeStatus}
                disabled={this.state.readonly ? "disabled" : false}
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
                ) : '' }

                <div className="col-sm-4">
                  <label htmlFor="startAt">项目年份</label>
                  {(this.state.readonly)
                  ?<input
                     type="text"
                     id='startAt'
                     readonly=""
                     className="form-control"
                     placeholder="项目年份"
                     value={currentProject.startAt}
                  />
                  :<YearPicker
                     yearArray={['2019', '2020']}
                     value={currentProject.startAt}
                     onSelect={this.onChangeStartAt}
                     minRange={1995}
                     maxRange={2030}
                  />
                  }
                </div>

                <div class="w-100 mb-2"></div>

                <div class="col-sm-4">
                <label htmlFor="quantity1">数量1</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number" 
                class="form-control"
                id="quantity1"
                required
                value={currentProject.quantity1}
                onChange={this.onChangeQuantity1}
                name="quantity1"
                />
                </div>

                <div class="col-sm-4">
                <label htmlFor="quantity2">数量2</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number" 
                class="form-control"
                id="quantity2"
                required
                value={currentProject.quantity2}
                onChange={this.onChangeQuantity2}
                name="quantity2"
                />
                </div>

                <div class="col-sm-4">
                <label htmlFor="quantity3">数量3</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number" 
                class="form-control"
                id="quantity3"
                required
                value={currentProject.quantity3}
                onChange={this.onChangeQuantity3}
                name="quantity3"
                />
                </div>

              </div>
            </div>

            <div class="w-100"></div>

            {!this.state.readonly && (

            <div>

              {(!currentProject.xr) && <div class="form-group input-group">

                <input type="file" name="multi-files"
                multiple
                id="input-multi-files"
                class="inputfile form-control-file border"
                onChange={e => this.onChangeDocFiles(e)}
                />
                <label for="input-multi-files">请选择上传文件</label>

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

              </div>}

              {!this.isUploading()
              ? <div>
                <button onClick={this.saveProject} class="btn btn-primary" hidden={!this.state.newproject}>
                  提交
                </button>

                <button hidden={this.state.newproject}
                  type="submit"
                  className="btn btn-primary"
                  onClick={this.updateProject}
                >
                  保存
                </button>

                <button
                  type="submit"
                  className="btn btn-primary ml-2"
                  onClick={() => (!this.state.dirty || window.confirm("您确定要取消吗 ?")) && window.close()}
                >
                  取消
                </button>

                <div class="w-100"></div>

                {this.state.hasErrors && this.state.message && (
                <div class="form-group mt-2">
                <div
                  className={
                  this.state.submitted
                    ? "alert alert-success"
                    : "alert alert-danger"
                  }
                  role="alert"
                >
                  {this.state.message}
                </div>
                </div>
                )}

              </div>

              : <div className="progress">
               <div
                 className="progress-bar progress-bar-info progress-bar-striped"
                 role="progressbar"
                 aria-valuenow={progress}
                 aria-valuemin="0"
                 aria-valuemax="100"
                 style={{ width: progress + "%" }}
               >
                 {progress}%
               </div>
             </div>}

            </div>)}

            <div class="w-100"></div>

            {(!currentProject.xr && !this.state.newproject) &&
            <Tabs className='mt-3'>
              <TabList>
                <Tab>更多信息 <i class="fas fa-hand-point-right"></i></Tab>
                <Tab>项目文档</Tab>
              </TabList>
              <TabPanel>
              </TabPanel>
              <TabPanel>
                <DossiersList
                  projectId = {currentProject.id}
                  embedded = {true}
                  readonly = {this.state.readonly}
                />
              </TabPanel>
            </Tabs>}

          </div>
        ) }
      </div>
    );
  }
}
