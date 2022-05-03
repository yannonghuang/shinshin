//import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import FormDataService from "../services/form.service";
//import AttachmentsList from './collapsible-attachments-list.component.js';
import AttachmentsList from './attachments-list.component.js';
import SchoolDataService from "../services/school.service";
import SurveyDataService from "../services/survey.service";
import AuthService from "./../services/auth.service";
//import TheCollapsible from './collapsible-attachments-list.component';

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
import ReactDOM from "react-dom";
import Select from 'react-select';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link } from "react-router-dom";

window.jQuery = $; //JQuery alias
window.$ = $; //JQuery alias
require("jquery-ui-sortable"); //For FormBuilder Element Drag and Drop
require("formBuilder");// For FormBuilder

require('formBuilder/dist/form-render.min.js');

document.body.style.margin = "30px"; //For add margin in HTML body

export default class Response extends Component {
  constructor(props) {
    super(props);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.getResponse = this.getResponse.bind(this);
    this.updateResponse = this.updateResponse.bind(this);
    this.deleteResponse = this.deleteResponse.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.onChangeAttFiles = this.onChangeAttFiles.bind(this);
    this.submitResponse = this.submitResponse.bind(this);
    this.reload = this.reload.bind(this);
    this.hasFiles = this.hasFiles.bind(this);

    this.state = {
      currentResponse: {
        id: null,
        title: "",
        fdata: null,
        formId: null,
        schoolId: null,
        //attFiles: [],
      },

      currentUser: null,
      schools: [],
      message: "",
      readonly: true,
      newresponse: true,
      progress: 0,
      reload: false,
      hasFiles: null,

      submitted: false,
      updatedRecently: true,
      updatedAt: null,
    };

    this.fb = createRef();
    this.fRender = null;
    //this.init();
  }

  optionOnSave = {
    onSave: (e, responseData) => {   //Auto binds `this`
     this.submitResponse();
    }
  };

  async componentDidMount() {
    await this.setUpdateStatus();

    const newresponse = window.location.pathname.includes('add');
    this.setState({newresponse: newresponse});
    const readonly = window.location.pathname.includes('View');
    this.setState({readonly: readonly});

    if (newresponse)
      this.getForm(this.props.match.params.id);
    else
      this.getResponse(this.props.match.params.id, readonly);
  }

  async setUpdateStatus() {
    const UPDATE_THRESHOLD = 2; // number of days
    const user = AuthService.getCurrentUser();
    if (user && user.schoolId) {
      try {
        let r = await SurveyDataService.getUpdatedAt(user.schoolId);
        let updatedAtObj =  (new Date(r.data.updatedAt.updatedAt));
        let updatedRecently = ((new Date()).getTime() - updatedAtObj.getTime()) < UPDATE_THRESHOLD * (60 * 60 * 24 * 1000);
        await this.setState({
          updatedRecently: updatedRecently,
          updatedAt: updatedAtObj.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })
        });
      } catch (e) {
        console.log(e.message);
      }
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

  display(schoolId) {
    if (this.state.schools) {
      for (var i = 0; i < this.state.schools.length; i++) {
        if (this.state.schools[i].value == schoolId)
          return this.state.schools[i];
      }
      return [];
    }
  }

  displayName(schoolId) {
    if (this.state.schools) {
      for (var i = 0; i < this.state.schools.length; i++) {
        if (this.state.schools[i].value == schoolId)
          return this.state.schools[i].label ? this.state.schools[i].label : '学校名';
      }
      return '';
    }
  }

  getForm(formId) {
    FormDataService.get(formId)
      .then(response => {

      try {
        //const formData = JSON.stringify(response.data.fdata);
        var formData = response.data.fdata;
        if (!((typeof formData) === "string")) formData = JSON.stringify(response.data.fdata);
        this.fRender = $(this.fb.current).formRender({ formData });
      } catch (e) {
        alert(e);
      }

      const {id, startAt, ...otherParameters} = response.data;

      this.setState({
        currentResponse: {
          ...otherParameters,
          startAt: (new Date(startAt)).getFullYear(),
          formId: formId
        },
        hasFiles: this.hasFiles()
      });

/*
      this.setState(function(prevState) {
        return {
          currentResponse: {
            ...prevState.currentResponse,
            formId: formId
          },
          hasFiles: this.hasFiles()
         };
      });
*/
      this.getSchools();
    })
  }

  getResponse(id, readonly) {
    ResponseDataService.get(id)
      .then(response => {
        try {
          //const formData = JSON.stringify(response.data.fdata);
          var formData = response.data.fdata;
          if (!((typeof formData) === "string")) formData = JSON.stringify(response.data.fdata);
          this.fRender = $(this.fb.current).formRender({ formData });
          //this.fRender = $(this.fb.current).formRender(this.state.currentResponse.fdata);
          if (readonly)
            $('input, textarea, select', '.rendered-form').attr('readonly', true).attr('disabled', true);
        } catch (e) {
          alert(e);
        }

        const {startAt, ...otherParameters} = response.data;

        this.setState({
          //currentResponse: response.data,
          currentResponse: {
            ...otherParameters,
            startAt: (startAt ? (new Date(startAt)).getUTCFullYear() : '')
          },

          hasFiles: this.hasFiles()
        });

        this.getSchools();

        console.log(response.data);
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

        const user = AuthService.getCurrentUser();
        if (user) {
          this.setState({
          currentUser: user,
          });
          if (user.schoolId) {
            this.setState(function(prevState) {
              return {
                currentResponse: {
                  ...prevState.currentResponse,
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

  init() {
    $(document).ready(function() {
      let imagesPreview = function(input, placeToInsertImagePreview) {
        if (input.files) {
          let filesAmount = input.files.length;
          for (var i = 0; i < filesAmount; i++) {
            let reader = new FileReader();
            reader.onload = function(event) {
              $($.parseHTML("<img>"))
                .attr("src", event.target.result)
                .appendTo(placeToInsertImagePreview);
            };
            reader.readAsDataURL(input.files[i]);
          }
        }
      };
      $("#input-multi-files").on("change", function() {
        imagesPreview(this, "div.preview-images");
      });
    });
  }

  getLabel(type, name) {
    if (!this.state.currentResponse.fdata)
      return '';

    for (var i = 0; i < this.state.currentResponse.fdata.length; i++) {
      if (this.state.currentResponse.fdata[i].type === type &&
          this.state.currentResponse.fdata[i].name === name)
        return this.state.currentResponse.fdata[i].label;
    }

    return '';
  }

  collectFiles() {
    var inputs = document.getElementsByTagName("input");
    const attFiles = [];
    if (inputs) {
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "file" && inputs[i].files) {
        let filesN = inputs[i].files.length;
        for (var j = 0; j < filesN; j++) {
          attFiles.push({description: this.getLabel(inputs[i].type, inputs[i].name),
            file: inputs[i].files[j]});
          }
        }
      }
    }

    return attFiles;
  }

  hasFiles() {
    var inputs = document.getElementsByTagName("input");
    const attFiles = [];
    if (!inputs) return false;

    for (var i = 0; i < inputs.length; i++)
      if (inputs[i].type === "file")
        return true;

    return false;
  }

  clearFiles() {
    var inputs = document.getElementsByTagName("input");

    if (inputs) {
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "file" && inputs[i].files) {
        inputs[i].value = null;
        }
      }
    }
  }

  onChangeAttFiles(e) {
    e.preventDefault();
    var attFiles = e.target.files;
    this.setState(prevState => ({
          currentResponse: {
            ...prevState.currentResponse,
            attFiles: attFiles
          }
        }));
  }

  onChangeSchoolId(e) {
    const schoolId = e.value; //.target.value

    this.setState(function(prevState) {
      return {
        currentResponse: {
          ...prevState.currentResponse,
          schoolId: schoolId
        }
      };
    });
  }

  onChangeTitle(e) {
    const title = e.target.value;

    this.setState(function(prevState) {
      return {
        currentResponse: {
          ...prevState.currentResponse,
          title: title
        }
      };
    });
  }

  uploadAttachments(attFiles) {
    var data = new FormData();
    var descriptions = [];
    for (var i = 0; i < attFiles.length; i++) {
      data.append('multi-files', attFiles[i].file,
      attFiles[i].file.name);

      descriptions.push(attFiles[i].description);
    }
    data.append('descriptions', JSON.stringify(descriptions));

    ResponseDataService.uploadAttachments(this.state.currentResponse.id, data, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
    .then(response => {
      console.log(response.data);

//      if (attFiles[0]) {
      //this.reload();
        this.setState(prevState => ({
          message: prevState.message + (attFiles[0] ? " 项目申请附件成功上传!" : ""),
          reload: !this.state.reload,
          submitted: true,
        }))
//      }
      //alert(this.state.message);
      this.clearFiles();
    })
    .catch(e => {
      console.log(e);
    });
  }

  validateSchool() {

    if (!this.state.currentResponse.schoolId) {
      this.setState({
        message: "请选择学校"
      });
      return false;
    }
    return true;
  }

  updateResponse() {
    if (!this.validateSchool()) return;

    const attFiles = this.collectFiles();

    var data = {
      title: this.state.currentResponse.title,
      schoolId: this.state.currentResponse.schoolId,
      fdata: this.fRender.userData
    };

    ResponseDataService.update(
      this.state.currentResponse.id,
      data
    )
    .then(response => {
      console.log(response.data);
      this.uploadAttachments(attFiles);
      this.setState({
        //currentResponse: response.data,
        message: "项目申请成功修改!"
      });
    })
    .catch(e => {
      console.log(e);
    });
      //$('input[name="responseId"]').attr('value', this.state.currentResponse.id);
      //this.refs.formToSubmit.submit();
  }


  submitResponse() {
    if (!this.validateSchool()) return;

    const attFiles = this.collectFiles();

    var data = {
      title: this.state.currentResponse.title,
      formId: this.state.currentResponse.formId,
      schoolId: this.state.currentResponse.schoolId,
      fdata: this.fRender.userData,
      userId: this.state.currentUser.id,
    };

    ResponseDataService.create(
      data
    )
    .then(async (response) => {
      console.log(response.data);

      await this.setState(prevState => ({
        //currentResponse: response.data,
        currentResponse: {
          ...prevState.currentResponse,
          id: response.data.id
        },
        message: "项目申请成功提交!",
        newresponse: false
      }));

      this.uploadAttachments(attFiles);
      this.props.history.push("/responses/" + response.data.id);
    })
    .catch(e => {
      console.log(e);
    });

      //$('input[name="responseId"]').attr('value', this.state.currentResponse.id);
      //this.refs.formToSubmit.submit();
   }


  deleteResponse() {
    ResponseDataService.delete(this.state.currentResponse.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push("/responses" + (this.state.currentResponse.schoolId
                                               ? ('/school/' + this.state.currentResponse.schoolId)
                                               : ''))
      })
      .catch(e => {
        console.log(e);
      });
  }

  reload() {
    //const c = Date.now();
    this.setState({reload: !this.state.reload});
  }


  render() {
    const { currentResponse, progress } = this.state;

    return (

      <div>
      {!this.state.updatedRecently
      ? (
        <div>
            <p>{'您的学校信息上次更新时间是：' + this.state.updatedAt + ', 请点击下面更新学校信息'}</p>
            <a href={"/surveys/" + currentResponse.schoolId} class="btn btn-success">更新</a>
        </div>
      )
      : (this.state.submitted
        ? (<div>
          <h4>{this.state.message}</h4>
          <a href="javascript:window.close();">
            <button class="btn btn-primary">关闭</button>
          </a>
        </div>)
        : (
          <div class="row">
            <div class="col-sm-4">
            {this.state.readonly && (
              <div class="box">
                <a target="_blank" href={"/responses/" + currentResponse.id} class="btn btn-primary mb-4">编辑</a>
              </div>
            )}
            </div>

            <div class="col-sm-4">
            <h4>项目申请（{this.state.readonly?"浏览":"编辑"}）</h4>
            <form>
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  readonly={"true" /*this.state.readonly?"":false*/}
                  type="text"
                  className="form-control"
                  id="title"
                  value={currentResponse.title}
                  onChange={this.onChangeTitle}
                />
            </div>

            <div class="form-group">
              <label htmlFor="schoolId">所属学校</label>
              {!this.state.readonly && AuthService.getCurrentUser() && !AuthService.getCurrentUser().schoolId
              ? (<Select onChange={this.onChangeSchoolId.bind(this)}
                readonly={this.state.readonly?"":false}
                class="form-control"
                required
                id="schoolId"
                value={this.display(currentResponse.schoolId)}
                name="schoolId"
                options={this.state.schools}
              />)
              : (<Link
                to={ "/schoolsView/" + currentResponse.schoolId}
                id="schoolId"
                name="schoolId"
              >
                {this.displayName(currentResponse.schoolId)}
              </Link>)}
            </div>

            <div class="form-group">
              <label htmlFor="startAt">项目年份</label>
              <input
                type="text"
                className="form-control"
                id='startAt'
                readonly={"true" /*this.state.readonly?"":false*/}
                placeholder="项目年份"
                value={currentResponse.startAt}
              />
            </div>

            </form>
          </div>

          <div class="col-sm-4">
           {!this.state.readonly && (<div>
              { this.state.newresponse? (
                <button
                  style={{ position: "absolute", right: "10px" }}
                  type="submit"
                  className="btn btn-success"
                  onClick={this.submitResponse}
                >
                  提交
                </button>
              ) : (
                <button
                  style={{ position: "absolute", right: "10px" }}
                  type="submit"
                  className="btn btn-primary"
                  onClick={this.updateResponse}
                >
                  保存
                </button>
              )}

              {(progress < 100 && progress > 0) && (
                <div className="progress">
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
                </div>
              )}
            </div>)}
          </div>


          <div id="fb-editor" ref={this.fb} />

          <div class="w-100"></div>

          {this.state.hasFiles &&
          (<Tabs>
            <TabList>
            <Tab>更多信息 <i class="fas fa-hand-point-right"></i></Tab>
            <Tab>项目申请附件</Tab>
            </TabList>
            <TabPanel>
            </TabPanel>
            <TabPanel>
            {this.state.currentResponse.id && (<AttachmentsList
              responseId = {this.state.currentResponse.id}
              embedded = {true}
              readonly = {this.state.readonly}
              reload = {this.state.reload}
            />)}
          </TabPanel>
          </Tabs>)}

          <div class="w-100"></div>

          {!this.state.readonly && (<div>
          { this.state.newresponse? (
            <button
              type="submit"
              className="btn btn-success"
              onClick={this.submitResponse}
            >
              提交
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              onClick={this.updateResponse}
            >
              保存
            </button>
          )}
          </div>)}

          <div class="w-100"></div>
          <div className="alert-danger">
            <p><h4>{this.state.message}</h4></p>
          </div>
        </div>)
      )}
      </div>
    );
  }
}
