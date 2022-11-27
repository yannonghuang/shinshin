//import React, { Component } from "react";
import QuestionaireDataService from "../services/questionaire.service";
import ProjectDataService from "../services/project.service";

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
import ReactDOM from "react-dom";

import YearPicker from 'react-single-year-picker';

window.jQuery = $; //JQuery alias
window.$ = $; //JQuery alias
require("jquery-ui-sortable"); //For FormBuilder Element Drag and Drop
require("formBuilder");// For FormBuilder
document.body.style.margin = "30px"; //For add margin in HTML body

export default class Questionaire extends Component {
  constructor(props) {
    super(props);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDeadline = this.onChangeDeadline.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangePCategoryId = this.onChangePCategoryId.bind(this);
    this.getQuestionaire = this.getQuestionaire.bind(this);
    this.onChangePublished = this.onChangePublished.bind(this);
    this.onChangeMultipleAllowed = this.onChangeMultipleAllowed.bind(this);
    this.updateQuestionaire = this.updateQuestionaire.bind(this);
    this.deleteQuestionaire = this.deleteQuestionaire.bind(this);
    this.saveQuestionaire = this.saveQuestionaire.bind(this);
    this.newQuestionaire = this.newQuestionaire.bind(this);

    this.state = {
      currentQuestionaire: {
        id: null,
        title: "",
        description: "",
        published: false,
        multipleAllowed: false,
        fdata: null,
        deadline: null,
        startAt: null,
        pCategoryId: null,
      },
      message: "",
      newquestionaire: true,
      readonly: true,      
      submitted: false,

      pCategories: ProjectDataService.PROJECT_CATEGORIES,
    };

    this.fb = createRef();
    this.fBuilder = null;
    this.fRender = null;
  }

  newQuestionaireOptions = {
    id: "shinshin-form-id",
    action: "http://localhost:8080/multiple-upload",
    method: "POST",
    enctype: "multipart/form-data",

    formData: [
    {
      type: "header",
      subtype: "h4",
      label: "问卷调查表"
    },
    ],
    onSave: (e, formData) => {   //Auto binds `this`
      this.saveQuestionaire(formData);
    }
  };

  oldQuestionaireOptions = {
    onSave: (e, formData) => {   //Auto binds `this`
     this.updateQuestionaire();
    },
    showActionButtons: !window.location.pathname.includes('View')
  };


  async componentDidMount() {
    const readonly = window.location.pathname.includes('View')
    const newquestionaire = window.location.pathname.includes('add');
    this.setState({newquestionaire: newquestionaire});
    this.setState({readonly: readonly});

    if (newquestionaire)
      this.fBuilder = $(this.fb.current).formBuilder(this.newQuestionaireOptions);
    else {
      //if (!readonly)
        //this.fBuilder = $(this.fb.current).formBuilder(this.oldQuestionaireOptions);
      this.getQuestionaire(this.props.match.params.id, readonly);
    }

  }

  getPCategories = async () => {
    try {
      let response = await ProjectDataService.getCategories();
      await this.setState({
        pCategories: response.data
      });
      console.log(response);

    } catch(e) {
      console.log(e);
    }
  }

  onChangeStartAt(e) {
    const startAt = e; //e.target.value;
    this.setState(function(prevState) {
      return {
        currentQuestionaire: {
          ...prevState.currentQuestionaire,
          startAt: startAt
        }
      };
    });
  };

  onChangeTitle(e) {
    const title = e.target.value;

    this.setState(function(prevState) {
      return {
        currentQuestionaire: {
          ...prevState.currentQuestionaire,
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
        currentQuestionaire: {
          ...prevState.currentQuestionaire,
          pCategoryId: pCategoryId
        }
      };
    });
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentQuestionaire: {
        ...prevState.currentQuestionaire,
        description: description
      }
    }));
  }

  onChangeDeadline(e) {
    const deadline = e.target.value;

    this.setState(prevState => ({
      currentQuestionaire: {
        ...prevState.currentQuestionaire,
        deadline: deadline
      }
    }));
  }

  onChangePublished(e) {
    const value = e.target.checked;
    this.setState(prevState => ({
      currentQuestionaire: {
        ...prevState.currentQuestionaire,
        published: value
      }
    }));
  }

  onChangeMultipleAllowed(e) {
    const value = e.target.checked;
    this.setState(prevState => ({
      currentQuestionaire: {
        ...prevState.currentQuestionaire,
        multipleAllowed: value
      }
    }));
  }

  getQuestionaire(id, readonly) {
    QuestionaireDataService.get(id)
      .then(response => {

      const {startAt, ...others} = response.data;
        this.setState({
          //currentQuestionaire: response.data

          currentQuestionaire: {
            ...others,
            startAt: (startAt ? (new Date(startAt)).getUTCFullYear() : '')
          }

        });

        console.log(response.data);

        if (readonly) {
          var formData = response.data.fdata;
          if (!((typeof formData) === "string")) formData = JSON.stringify(response.data.fdata);
          //this.fRender = $(this.fb.current).formRender({formData: response.data.fdata });
          this.fRender = $(this.fb.current).formRender({ formData });

          // make it readonly
          $('input, textarea, select', '.rendered-form').attr('readonly', true).attr('disabled', true);
        } else {
          $(this.fb.current).formBuilder(this.oldQuestionaireOptions).promise
            .then(formBuilder => {
              formBuilder.actions.setData(response.data.fdata);
              this.fBuilder = formBuilder;
            });
        }

      })
      .catch(e => {
        console.log(e);
      });
  }

  updateQuestionaire() {
    this.setState(prevState => ({
      currentQuestionaire: {
        ...prevState.currentQuestionaire,
        startAt: prevState.currentQuestionaire.startAt ? (prevState.currentQuestionaire.startAt + '-01-10') : null,
        fdata: this.fBuilder.actions.getData()
      }
    }));

    QuestionaireDataService.update(
      this.state.currentQuestionaire.id,
      this.state.currentQuestionaire
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "问卷调查表成功更新!",
          submitted: true,
        });
      })
      .catch(e => {
        console.log(e);
      });
  }

  saveQuestionaire(formData) {
    var data = {
      title: this.state.currentQuestionaire.title,
      description: this.state.currentQuestionaire.description,
      deadline: this.state.currentQuestionaire.deadline,
      published: this.state.currentQuestionaire.published,
      multipleAllowed: this.state.currentQuestionaire.multipleAllowed,
      startAt: this.state.currentQuestionaire.startAt ? (this.state.currentQuestionaire.startAt + '-01-10') : null,
      fdata: this.fBuilder.actions.getData(), /* formData */
      pCategoryId: this.state.currentQuestionaire.pCategoryId,
    };

    QuestionaireDataService.create(data)
      .then(response => {
        this.setState(prevState => ({
          currentQuestionaire: {
            ...prevState.currentQuestionaire,
            id: response.data.id,
          },
          submitted: true,
          message: '问卷调查表成功提交!'
        }));
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newQuestionaire() {
    this.setState(prevState => ({
      currentQuestionaire: {
        id: null,
        title: "",
        description: "",
        deadline: null,
        startAt: null,
        published: false,
        multipleAllowed: false,
        pCategoryId: null,
      },
      submitted: false
    }));
  }

  deleteQuestionaire() {
    QuestionaireDataService.delete(this.state.currentQuestionaire.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/questionaires')
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const { currentQuestionaire } = this.state;

    return (
      <div>
        {/*this.state.newquestionaire && */this.state.submitted
        ? (
          <div>
            <p>{this.state.message}</p>

            <a href="javascript:window.close();">
              <button class="btn btn-primary">关闭</button>
            </a>
{/*}
            <h4>成功提交!</h4>

              <button className="btn btn-success" onClick={this.newQuestionaire}>
                Add
              </button>
*/}
          </div>
          ) : (<div>
          <div className="edit-form">
            <h4>问卷调查表设计</h4>
            <form>
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  readonly={(!this.state.newquestionaire && this.state.readonly) ? "" : false}
                  type="text"
                  className="form-control"
                  id="title"
                  value={currentQuestionaire.title}
                  onChange={this.onChangeTitle}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">说明</label>
                <textarea
                  readonly={(!this.state.newform && this.state.readonly) ? "" : false}
                  rows="10"
                  className="form-control"
                  id="description"
                  value={currentQuestionaire.description}
                  onChange={this.onChangeDescription}
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline">截止日期</label>
                <input
                  readonly={(!this.state.newform && this.state.readonly) ? "" : false}
                  type="date"
                  className="form-control"
                  id="deadline"
                  value={currentQuestionaire.deadline}
                  onChange={this.onChangeDeadline}
                />
              </div>

              <div className="form-group" hidden={"true"}>
                <label htmlFor="pCategoryId">项目类型</label>
                <select
                disabled={this.state.readonly?"disabled":false}
                class="form-control"
                id="pCategoryId"
                required
                value={ProjectDataService.getCategory(currentQuestionaire.pCategoryId)}
                onChange={this.onChangePCategoryId}
                name="pCategoryId"
                >

                {this.state.pCategories.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startAt">问卷年份</label>
                {(!this.state.newform && this.state.readonly)
                ?<input
                   type="text"
                   id='startAt'
                   readonly=""
                   className="form-control"
                   placeholder="问卷年份"
                   value={currentQuestionaire.startAt}
                />
                :<YearPicker
                   yearArray={['2022', '2023']}
                   value={currentQuestionaire.startAt}
                   onSelect={this.onChangeStartAt}

                   minRange={1995}
                   maxRange={2030}
                />
                }
              </div>

              <div class="form-group col-md-3">

                <label htmlFor="published">发布?</label>
                <input
                disabled={this.state.readonly?"disabled":false}
                type="checkbox"
                class="form-control"
                id="published"
                required
                checked={currentQuestionaire.published}
                onChange={this.onChangePublished}
                name="published"
                />

              </div>

              <div class="form-group col-md-3" hidden={"true"}>
                <label htmlFor="multipleAllowed">允许多次申请?</label>
                <input
                disabled={this.state.readonly?"disabled":false}
                type="checkbox"
                class="form-control"
                id="multipleAllowed"
                required
                checked={currentQuestionaire.multipleAllowed}
                onChange={this.onChangeMultipleAllowed}
                name="multipleAllowed"
                />

              </div>


            </form>

          </div>

          <div id="fb-editor" ref={this.fb} />

          </div>)}
{/*}
          <p>{this.state.message}</p>
*/}
      </div>
    );
  }
}
