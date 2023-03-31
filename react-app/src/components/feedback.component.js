//import React, { Component } from "react";
import FeedbackDataService from "../services/feedback.service";
import QuestionaireDataService from "../services/questionaire.service";
//import AttachmentsList from './collapsible-attachments-list.component.js';
//import AttachmentsList from './attachments-list.component.js';
import SchoolDataService from "../services/school.service";
//import SurveyDataService from "../services/survey.service";
import AuthService from "./../services/auth.service";
//import TheCollapsible from './collapsible-attachments-list.component';
import ProjectDataService from "../services/project.service";

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
//import ReactDOM from "react-dom";
import Select from 'react-select';
//import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link } from "react-router-dom";

window.jQuery = $; //JQuery alias
window.$ = $; //JQuery alias
require("jquery-ui-sortable"); //For FormBuilder Element Drag and Drop
require("formBuilder");// For FormBuilder

require('formBuilder/dist/form-render.min.js');

document.body.style.margin = "30px"; //For add margin in HTML body

export default class Feedback extends Component {
  constructor(props) {
    super(props);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeRespondant = this.onChangeRespondant.bind(this);
    this.getFeedback = this.getFeedback.bind(this);
    this.updateFeedback = this.updateFeedback.bind(this);
    this.deleteFeedback = this.deleteFeedback.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.submitFeedback = this.submitFeedback.bind(this);
    this.onChangePCategoryId = this.onChangePCategoryId.bind(this);

    this.state = {
      currentFeedback: {
        id: null,
        title: "",
        fdata: null,
        questionaireId: null,
        schoolId: null,
        //attFiles: [],
        pCategoryId: null,
        description: null,
        deadline: null,
        respondant: "",
      },

      currentUser: null,
      schools: [],
      message: "",
      readonly: true,
      newfeedback: true,
      progress: 0,

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
    onSave: (e, feedbackData) => {   //Auto binds `this`
     this.submitFeedback();
    }
  };

  async componentDidMount() {
    const newfeedback = window.location.pathname.includes('add');
    this.setState({newfeedback: newfeedback});
    const readonly = window.location.pathname.includes('View');
    this.setState({readonly: readonly});

    if (newfeedback)
      this.getQuestionaire(this.props.match.params.id);
    else
      this.getFeedback(this.props.match.params.id, readonly);
  }

  refreshOnReturn() {
    window.onblur = () => {window.onfocus = () => {
      window.location.reload(true);
    }};
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

  getQuestionaire(questionaireId) {
    QuestionaireDataService.get(questionaireId)
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
        currentFeedback: {
          ...otherParameters,
          startAt: (new Date(startAt)).getFullYear(),
          questionaireId: questionaireId
        },
      });

      this.getSchools();
    })
  }

  getFeedback(id, readonly) {
    FeedbackDataService.get(id)
      .then(async (response) => {
        try {
          //const formData = JSON.stringify(response.data.fdata);
          var formData = response.data.fdata;
          if (!((typeof formData) === "string")) formData = JSON.stringify(response.data.fdata);
          this.fRender = $(this.fb.current).formRender({ formData });
          //this.fRender = $(this.fb.current).formRender(this.state.currentFeedback.fdata);
          if (readonly)
            $('input, textarea, select', '.rendered-form').attr('readonly', true).attr('disabled', true);

        } catch (e) {
          alert(e);
        }

        const {startAt, questionaireId, ...otherParameters} = response.data;

        let questionaire = null;
        if (questionaireId) 
          questionaire = await QuestionaireDataService.get(questionaireId);

        this.setState({
          //currentFeedback: response.data,
          currentFeedback: {
            ...otherParameters,
            startAt: (startAt ? (new Date(startAt)).getUTCFullYear() : ''),
            description: questionaire ? questionaire.data.description : '',
            deadline: questionaire ? questionaire.data.deadline : ''
          },

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
                currentFeedback: {
                  ...prevState.currentFeedback,
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
    if (!this.state.currentFeedback.fdata)
      return '';

    for (var i = 0; i < this.state.currentFeedback.fdata.length; i++) {
      if (this.state.currentFeedback.fdata[i].type === type &&
          this.state.currentFeedback.fdata[i].name === name)
        return this.state.currentFeedback.fdata[i].label;
    }

    return '';
  }


  onChangeSchoolId(e) {
    const schoolId = e.value; //.target.value

    this.setState(function(prevState) {
      return {
        currentFeedback: {
          ...prevState.currentFeedback,
          schoolId: schoolId
        }
      };
    });
  }

  onChangeTitle(e) {
    const title = e.target.value;

    this.setState(function(prevState) {
      return {
        currentFeedback: {
          ...prevState.currentFeedback,
          title: title
        }
      };
    });
  }

  onChangeRespondant(e) {
    const respondant = e.target.value;

    this.setState(function(prevState) {
      return {
        currentFeedback: {
          ...prevState.currentFeedback,
          respondant: respondant
        }
      };
    });
  }

  onChangePCategoryId(e) {
    //const pCategoryId = e.target.selectedIndex; //e.target.value;
    const pCategoryId = ProjectDataService.PROJECT_CATEGORIES_ID[e.target.selectedIndex].id; //e.target.value;

    this.setState(function(prevState) {
      return {
        currentFeedback: {
          ...prevState.currentFeedback,
          pCategoryId: pCategoryId
        }
      };
    });
  }


  validateSchool() {

    if (!this.state.currentFeedback.schoolId) {
      this.setState({
        message: "请选择学校",
        hasErrors: true,
      });
      return false;
    }
    return true;
  }

  validateRespondant() {

    if (!this.state.currentFeedback.respondant) {
      this.setState({
        message: "请填写答卷人名称",
        hasErrors: true,
      });
      return false;
    }
    return true;
  }

  updateFeedback() {
    if (!this.validateSchool()) return;
    if (!this.validateRespondant()) return;

    var data = {
      title: this.state.currentFeedback.title,
      schoolId: this.state.currentFeedback.schoolId,
      respondant: this.state.currentFeedback.respondant,
      fdata: this.fRender.userData
    };

    FeedbackDataService.update(
      this.state.currentFeedback.id,
      data
    )
    .then(response => {
      console.log(response.data);
      this.setState({
        //currentFeedback: response.data,
        message: this.state.dirty ? "问卷反馈成功修改!" : "问卷反馈没有修改",
        hasErrors: false,
        submitted: true,
      });
    })
    .catch(e => {
      console.log(e);
    });
      //$('input[name="responseId"]').attr('value', this.state.currentFeedback.id);
      //this.refs.formToSubmit.submit();
  }


  submitFeedback() {
    if (!this.validateSchool()) return;
    if (!this.validateRespondant()) return;

    var data = {
      title: this.state.currentFeedback.title,
      questionaireId: this.state.currentFeedback.questionaireId,
      schoolId: this.state.currentFeedback.schoolId,
      fdata: this.fRender.userData,
      //userId: this.state.currentUser.id,
      pCategoryId: this.state.currentFeedback.pCategoryId,
      respondant: this.state.currentFeedback.respondant,
    };

    FeedbackDataService.create(
      data
    )
    .then(async (response) => {
      console.log(response.data);

      await this.setState(prevState => ({
        //currentFeedback: response.data,
        currentFeedback: {
          ...prevState.currentFeedback,
          id: response.data.id
        },
        message: this.state.dirty ? "问卷反馈成功提交!" : "问卷反馈没有修改",
        newfeedback: false,
        hasErrors: false,
        submitted: true,
      }));

      //this.props.history.push("/feedbacks/" + response.data.id);
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
   }


  deleteFeedback() {
    FeedbackDataService.delete(this.state.currentFeedback.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push("/feedbacks" + (this.state.currentFeedback.schoolId
                                               ? ('/school/' + this.state.currentFeedback.schoolId)
                                               : ''))
      })
      .catch(e => {
        console.log(e);
      });
  }

  customFilter(option, inputValue) {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

  render() {
    const { currentFeedback } = this.state;

    return (

      <div>
        {this.state.submitted
        ? <div>
          <p>{this.state.message}</p>
          <a href="/">
            <button class="btn btn-primary">关闭</button>
          </a>
          </div>
        : <div class="row">
          <div class="col-sm-3">
            {this.state.readonly && (
              <div class="box">
                <a target="_blank" href={"/feedbacks/" + currentFeedback.id} class="btn btn-primary mb-4">编辑</a>
              </div>
            )}
          </div>

          <div class="col-sm-6">
            <h4>问卷反馈（{this.state.readonly?"浏览":"编辑"}）</h4>
            <form>
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  readonly={"true" /*this.state.readonly?"":false*/}
                  type="text"
                  className="form-control"
                  id="title"
                  value={currentFeedback.title}
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
                  value={currentFeedback.description}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">截止日期</label>
                <input
                  readonly={"true"}
                  type="date"
                  className="form-control"
                  id="deadline"
                  value={currentFeedback.deadline}
                />
              </div>

              <div className="form-group" hidden={"true"}>
                <label htmlFor="pCategoryId">项目类型</label>
                <select
                  disabled={"true"}
                  class="form-control"
                  id="pCategoryId"
                  required
                  value={ProjectDataService.getCategory(currentFeedback.pCategoryId) /*this.state.pCategories[currentFeedback.pCategoryId]*/}
                  onChange={this.onChangePCategoryId}
                  name="pCategoryId"
                >

                  {this.state.pCategories.map((option, index) => (
                  <option value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="respondant">答卷人</label>
                <input
                  type="text"
                  readonly={this.state.readonly?"":false}
                  className="form-control"
                  id="respondant"
                  value={currentFeedback.respondant}
                  onChange={this.onChangeRespondant}
                />
              </div>

              <div class="form-group">
                <label htmlFor="schoolId">所属学校</label>
                {!this.state.readonly
                ? (<Select onChange={this.onChangeSchoolId.bind(this)}
                  readonly={this.state.readonly?"":false}
                  class="form-control"
                  required
                  id="schoolId"
                  value={this.display(currentFeedback.schoolId)}
                  name="schoolId"
                  filterOption={this.customFilter}
                  options={this.state.schools}
                />)
                : (<Link
                  to={ "/schoolsView/" + currentFeedback.schoolId}
                  id="schoolId"
                  name="schoolId"
                >
                  {this.displayName(currentFeedback.schoolId)}
                </Link>)}
              </div>

              <div class="form-group">
                <label htmlFor="startAt">问卷年份</label>
                <input
                  type="text"
                  className="form-control"
                  id='startAt'
                  readonly={"true" /*this.state.readonly?"":false*/}
                  placeholder="问卷年份"
                  value={currentFeedback.startAt}
                />
              </div>

            </form>
          </div>

          <div class="col-sm-3">
            {!this.state.readonly &&

             <div>
                {this.state.newfeedback? (
                  <button
                    style={{ position: "absolute", right: "10px" }}
                    type="submit"
                    className="btn btn-primary"
                    onClick={this.submitFeedback}
                  >
                    提交
                  </button>
                ) : (
                  <button
                    style={{ position: "absolute", right: "10px" }}
                    type="submit"
                    className="btn btn-primary"
                    onClick={this.updateFeedback}
                  >
                    保存
                  </button>
                )}

                <button
                  style={{ position: "absolute", right: "-60px" }}
                  type="submit"
                  className="btn btn-primary ml-2"
                  onClick={() => (!this.state.dirty || window.confirm("您确定要取消吗 ?")) && this.props.history.push("/")}
                >
                  取消
                </button>

                {this.state.hasErrors && <div className="alert-danger"
                  style={{ position: "absolute", right: "-60px", top: "50px" }}
                >
                  <p><h6>{this.state.message}</h6></p>
                </div>}
             </div>}
          </div>


          <div id="fb-editor" ref={this.fb} />

          <div class="w-100"></div>

          {!this.state.readonly && (<div>
            { this.state.newfeedback? (
              <button
                type="submit"
                className="btn btn-primary mt-2"
                onClick={() => {window.scrollTo(0, 0); this.submitFeedback()}}
              >
                提交
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary mt-2"
                onClick={() => {window.scrollTo(0, 0); this.updateFeedback()}}
              >
                保存
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary ml-2 mt-2"
              onClick={() => (!this.state.dirty || window.confirm("您确定要取消吗 ?")) && this.props.history.push("/")}
            >
              取消
            </button>

            <div class="w-100"></div>
            {this.state.hasErrors && <div className="alert-danger mt-2">
              <p><h6>{this.state.message}</h6></p>
            </div>}

          </div>)}
        </div>}
      </div>
    );
  }
}
