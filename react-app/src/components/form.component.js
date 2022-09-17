//import React, { Component } from "react";
import FormDataService from "../services/form.service";
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

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDeadline = this.onChangeDeadline.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangePCategoryId = this.onChangePCategoryId.bind(this);
    this.getForm = this.getForm.bind(this);
    this.onChangePublished = this.onChangePublished.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.deleteForm = this.deleteForm.bind(this);
    this.saveForm = this.saveForm.bind(this);
    this.newForm = this.newForm.bind(this);

    this.state = {
      currentForm: {
        id: null,
        title: "",
        description: "",
        published: false,
        fdata: null,
        deadline: null,
        startAt: null,
        pCategoryId: null,
      },
      message: "",
      newsform: true,
      readonly: true,      
      submitted: false,

      pCategories: ProjectDataService.PROJECT_CATEGORIES,
    };

    this.fb = createRef();
    this.fBuilder = null;
    this.fRender = null;
  }

  newFormOptions = {
    id: "shinshin-form-id",
    action: "http://localhost:8080/multiple-upload",
    method: "POST",
    enctype: "multipart/form-data",

    formData: [
    {
      type: "header",
      subtype: "h4",
      label: "项目申请表"
    },
    ],
    onSave: (e, formData) => {   //Auto binds `this`
      this.saveForm(formData);
    }
  };

  oldFormOptions = {
    onSave: (e, formData) => {   //Auto binds `this`
     this.updateForm();
    },
    showActionButtons: !window.location.pathname.includes('View')
  };


  async componentDidMount() {
    const readonly = window.location.pathname.includes('View')
    const newform = window.location.pathname.includes('add');
    this.setState({newform: newform});
    this.setState({readonly: readonly});

    if (newform)
      this.fBuilder = $(this.fb.current).formBuilder(this.newFormOptions);
    else {
      //if (!readonly)
        //this.fBuilder = $(this.fb.current).formBuilder(this.oldFormOptions);
      this.getForm(this.props.match.params.id, readonly);
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
        currentForm: {
          ...prevState.currentForm,
          startAt: startAt
        }
      };
    });
  };

  onChangeTitle(e) {
    const title = e.target.value;

    this.setState(function(prevState) {
      return {
        currentForm: {
          ...prevState.currentForm,
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
        currentForm: {
          ...prevState.currentForm,
          pCategoryId: pCategoryId
        }
      };
    });
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentForm: {
        ...prevState.currentForm,
        description: description
      }
    }));
  }

  onChangeDeadline(e) {
    const deadline = e.target.value;

    this.setState(prevState => ({
      currentForm: {
        ...prevState.currentForm,
        deadline: deadline
      }
    }));
  }

  onChangePublished(e) {
    const value = e.target.checked;
    this.setState(prevState => ({
      currentForm: {
        ...prevState.currentForm,
        published: value
      }
    }));
  }

  getForm(id, readonly) {
    FormDataService.get(id)
      .then(response => {

      const {startAt, ...others} = response.data;
        this.setState({
          //currentForm: response.data

          currentForm: {
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
          $(this.fb.current).formBuilder(this.oldFormOptions).promise
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

  updateForm() {
    this.setState(prevState => ({
      currentForm: {
        ...prevState.currentForm,
        startAt: prevState.currentForm.startAt ? (prevState.currentForm.startAt + '-01-10') : null,
        fdata: this.fBuilder.actions.getData()
      }
    }));

    FormDataService.update(
      this.state.currentForm.id,
      this.state.currentForm
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "项目申请表成功更新!",
          submitted: true,
        });
      })
      .catch(e => {
        console.log(e);
      });
  }

  saveForm(formData) {
    var data = {
      title: this.state.currentForm.title,
      description: this.state.currentForm.description,
      deadline: this.state.currentForm.deadline,
      published: this.state.currentForm.published,
      startAt: this.state.currentForm.startAt ? (this.state.currentForm.startAt + '-01-10') : null,
      fdata: this.fBuilder.actions.getData(), /* formData */
      pCategoryId: this.state.currentForm.pCategoryId,
    };

    FormDataService.create(data)
      .then(response => {
        this.setState(prevState => ({
          currentForm: {
            ...prevState.currentForm,
            id: response.data.id,
          },
          submitted: true,
          message: '项目申请表成功提交!'
        }));
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newForm() {
    this.setState(prevState => ({
      currentForm: {
        id: null,
        title: "",
        description: "",
        deadline: null,
        startAt: null,
        published: false,
        pCategoryId: null,
      },
      submitted: false
    }));
  }

  deleteForm() {
    FormDataService.delete(this.state.currentForm.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/forms')
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const { currentForm } = this.state;

    return (
      <div>
        {/*this.state.newform && */this.state.submitted
        ? (
          <div>
            <p>{this.state.message}</p>

            <a href="javascript:window.close();">
              <button class="btn btn-primary">关闭</button>
            </a>
{/*}
            <h4>成功提交!</h4>

              <button className="btn btn-success" onClick={this.newForm}>
                Add
              </button>
*/}
          </div>
          ) : (<div>
          <div className="edit-form">
            <h4>申请表格设计</h4>
            <form>
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  readonly={(!this.state.newform && this.state.readonly) ? "" : false}
                  type="text"
                  className="form-control"
                  id="title"
                  value={currentForm.title}
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
                  value={currentForm.description}
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
                  value={currentForm.deadline}
                  onChange={this.onChangeDeadline}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pCategoryId">项目类型</label>
                <select
                disabled={this.state.readonly?"disabled":false}
                class="form-control"
                id="pCategoryId"
                required
                value={ProjectDataService.getCategory(currentForm.pCategoryId)}
                onChange={this.onChangePCategoryId}
                name="pCategoryId"
                >

                {this.state.pCategories.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startAt">项目年份</label>
                {(!this.state.newform && this.state.readonly)
                ?<input
                   type="text"
                   id='startAt'
                   readonly=""
                   className="form-control"
                   placeholder="项目年份"
                   value={currentForm.startAt}
                />
                :<YearPicker
                   yearArray={['2022', '2023']}
                   value={currentForm.startAt}
                   onSelect={this.onChangeStartAt}

                   minRange={1995}
                   maxRange={2030}
                />
                }
              </div>

              <div class="form-group col-md-2">
                <label htmlFor="published">发布?</label>
                <input
                disabled={this.state.readonly?"disabled":false}
                type="checkbox"
                class="form-control"
                id="published"
                required
                checked={currentForm.published}
                onChange={this.onChangePublished}
                name="published"
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
