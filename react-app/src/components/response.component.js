//import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import FormDataService from "../services/form.service";
//import AttachmentsList from './collapsible-attachments-list.component.js';
import AttachmentsList from './attachments-list.component.js';
import SchoolDataService from "../services/school.service";
import SurveyDataService from "../services/survey.service";
import AuthService from "./../services/auth.service";
//import TheCollapsible from './collapsible-attachments-list.component';
import ProjectDataService from "../services/project.service";

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
//import ReactDOM from "react-dom";
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
    this.onChangePCategoryId = this.onChangePCategoryId.bind(this);

    this.state = {
      currentResponse: {
        id: null,
        title: "",
        fdata: null,
        formId: null,
        schoolId: null,
        //attFiles: [],
        pCategoryId: null,
        description: null,
        deadline: null
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

      dirty: true,
      pCategories: ProjectDataService.PROJECT_CATEGORIES,
      hasErrors: false,
    };

    this.fb = createRef();
    this.fRender = null;
    //this.init();

    this.fileInputLabels = new Map();
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

  refreshOnReturn() {
    window.onblur = () => {window.onfocus = () => {
      window.location.reload(true);
    }};
  }

  async setUpdateStatus() {
    const UPDATE_THRESHOLD = 180; // number of days
    //const REFRESH_RATE = 3; // number of seconds

    const user = AuthService.getCurrentUser();
    if (this.state.newresponse && user && user.schoolId) {
      try {
        let r = await SurveyDataService.getUpdatedAt(user.schoolId);
        let updatedAtObj =  (new Date(r.data.updatedAt.updatedAt));
        let updatedRecently = ((new Date()).getTime() - updatedAtObj.getTime()) < UPDATE_THRESHOLD * (60 * 60 * 24 * 1000);
        await this.setState({
          updatedRecently: updatedRecently,
          updatedAt: updatedAtObj.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })
        });

        if (!updatedRecently)
          //this.refresher = window.setTimeout(this.props.history.go(0), REFRESH_RATE * 1000);
          //setTimeout(function() {window.location.reload()}, REFRESH_RATE * 1000);
          this.refreshOnReturn();

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

  getForm(formId) {
    FormDataService.get(formId)
      .then(response => {

      try {
        //const formData = JSON.stringify(response.data.fdata);
        var formData = response.data.fdata;
        if (!((typeof formData) === "string")) formData = JSON.stringify(response.data.fdata);
        this.fRender = $(this.fb.current).formRender({ formData });

        this.initInputfile();
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
      .then(async (response) => {
        try {
          //const formData = JSON.stringify(response.data.fdata);
          var formData = response.data.fdata;
          if (!((typeof formData) === "string")) formData = JSON.stringify(response.data.fdata);
          this.fRender = $(this.fb.current).formRender({ formData });
          //this.fRender = $(this.fb.current).formRender(this.state.currentResponse.fdata);
          if (readonly)
            $('input, textarea, select', '.rendered-form').attr('readonly', true).attr('disabled', true);

          this.initInputfile();
        } catch (e) {
          alert(e);
        }

        const {startAt, formId, ...otherParameters} = response.data;

        let form = await FormDataService.get(formId);

        this.setState({
          //currentResponse: response.data,
          currentResponse: {
            ...otherParameters,
            startAt: (startAt ? (new Date(startAt)).getUTCFullYear() : ''),
            description: form.data.description,
            deadline: form.data.deadline
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
            attFiles.push({description: this.fileInputLabels.get('file' + i), //this.getLabel(inputs[i].type, inputs[i].name),
              file: inputs[i].files[j]});
          }
        }
      }
    }
    return attFiles;
  }

  initInputfile() {
    var inputs = document.getElementsByTagName("input");
    if (inputs) {
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type === "file") {
          inputs[i].className = 'inputfile';

          var label = inputs[i].previousElementSibling;
          label.className = 'inputfileLabel';

          label.innerHTML = label.innerText; // get rid of formatting

          this.fileInputLabels.set('file' + i, label.innerText);

          inputs[i].addEventListener( 'change', function( e ) {
            var label = e.target.previousElementSibling;
            var docFiles = e.target.files;
            var msgFilesPicked = docFiles.length > 0
              ? '已选文件：'
              : null;
            var msg = docFiles.length > 0
              ? '已选择' + docFiles.length + '个文件'
              : label.innerText;
            for (var i = 0; i < docFiles.length; i++)
              msgFilesPicked += docFiles[i].name + '; ';
            label.title = msgFilesPicked;
            label.innerText = msg;
          });

        }
      }
    }

  }

  hasFiles() {
    var inputs = document.getElementsByTagName("input");
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

  onChangePCategoryId(e) {
    //const pCategoryId = e.target.selectedIndex; //e.target.value;
    const pCategoryId = ProjectDataService.PROJECT_CATEGORIES_ID[e.target.selectedIndex].id; //e.target.value;

    this.setState(function(prevState) {
      return {
        currentResponse: {
          ...prevState.currentResponse,
          pCategoryId: pCategoryId
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
          message: this.state.dirty ? prevState.message : (attFiles[0] ? " 项目申请附件成功上传!" : ""),
          reload: !this.state.reload,
          submitted: true,
          hasErrors: false,
        }))
//      }
      //alert(this.state.message);
      this.clearFiles();
    })
    .catch(err => {
      console.log(err);

      const resMessage =
        (err.response &&
        err.response.data &&
        err.response.data.message) ||
        err.message ||
        err.toString();

      this.setState({
        message: "项目申请修改或提交失败! " + resMessage,
        hasErrors: true,
      });

    });
  }

  validateSchool() {

    if (!this.state.currentResponse.schoolId) {
      this.setState({
        message: "请选择学校",
        hasErrors: true,
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
        message: this.state.dirty ? "项目申请成功修改!" : "项目申请没有修改",
        hasErrors: false,
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
      pCategoryId: this.state.currentResponse.pCategoryId,
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
        message: this.state.dirty ? "项目申请成功提交!" : "项目申请没有修改",
        newresponse: false,
        hasErrors: false,
      }));

      this.uploadAttachments(attFiles);
      this.props.history.push("/responses/" + response.data.id);
    })
    .catch(error => {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      alert(resMessage)
      console.log(resMessage);
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

  isUploading() {
    return (this.state.progress > 0);
  }

  customFilter(option, inputValue) {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

  render() {
    const { currentResponse, progress } = this.state;

    return (

      <div>
      {!this.state.updatedRecently
      ? (
        <div>
            <p>{'您的学校信息上次更新时间是：' + this.state.updatedAt + ', 请点击下面更新学校信息'}</p>
            <a target='_blank' href={"/surveys/" + currentResponse.schoolId} class="btn btn-primary">更新</a>
            <a href="javascript:window.close();">
              <button class="btn btn-primary ml-2">暂不申请</button>
            </a>
        </div>
      )
      : (this.state.submitted
        ? (<div>
          <p>{this.state.message}</p>
          <a href="javascript:window.close();">
            <button class="btn btn-primary">关闭</button>
          </a>
        </div>)
        : (
          <div class="row">
            <div class="col-sm-3">
            {this.state.readonly && (
              <div class="box">
                <a target="_blank" href={"/responses/" + currentResponse.id} class="btn btn-primary mb-4">编辑</a>
              </div>
            )}
            </div>

            <div class="col-sm-6">
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

              <div className="form-group">
                <label htmlFor="description">说明</label>
                <textarea
                  rows="10"
                  readonly={"true"}
                  type="text"
                  className="form-control"
                  id="description"
                  value={currentResponse.description}
                />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">截止日期</label>
              <input
                readonly={"true"}
                type="date"
                className="form-control"
                id="deadline"
                value={currentResponse.deadline}
              />
            </div>

            <div className="form-group ">
              <label htmlFor="pCategoryId">项目类型</label>
              <select
                disabled={"true"}
                class="form-control"
                id="pCategoryId"
                required
                value={ProjectDataService.getCategory(currentResponse.pCategoryId) /*this.state.pCategories[currentResponse.pCategoryId]*/}
                onChange={this.onChangePCategoryId}
                name="pCategoryId"
              >

                {this.state.pCategories.map((option, index) => (
                <option value={option}>{option}</option>
                ))}
              </select>
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
                filterOption={this.customFilter}
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

          <div class="col-sm-3">
           {!this.state.readonly && (<div>
             {!this.isUploading()
             ? <div>
                {this.state.newresponse? (
                  <button
                    style={{ position: "absolute", right: "10px" }}
                    type="submit"
                    className="btn btn-primary"
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

                <button
                  style={{ position: "absolute", right: "-60px" }}
                  type="submit"
                  className="btn btn-primary ml-2"
                  onClick={() => (!this.state.dirty || window.confirm("您确定要取消吗 ?")) && window.close()}
                >
                  取消
                </button>

                {this.state.hasErrors && <div className="alert-danger"
                  style={{ position: "absolute", right: "-60px", top: "50px" }}
                >
                  <p><h6>{this.state.message}</h6></p>
                </div>}

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

          {!this.state.readonly && !this.isUploading() && (<div>
            { this.state.newresponse? (
              <button
                type="submit"
                className="btn btn-primary mt-2"
                onClick={() => {window.scrollTo(0, 0); this.submitResponse()}}
              >
                提交
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary mt-2"
                onClick={() => {window.scrollTo(0, 0); this.updateResponse()}}
              >
                保存
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary ml-2 mt-2"
              onClick={() => (!this.state.dirty || window.confirm("您确定要取消吗 ?")) && window.close()}
            >
              取消
            </button>

            <div class="w-100"></div>
            {this.state.hasErrors && <div className="alert-danger mt-2">
              <p><h6>{this.state.message}</h6></p>
            </div>}

          </div>)}


        </div>)
      )}
      </div>
    );
  }
}
