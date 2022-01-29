//import React, { Component } from "react";
import FormDataService from "../services/form.service";

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
    this.getForm = this.getForm.bind(this);
    //this.updatePublished = this.updatePublished.bind(this);
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
      },
      message: "",
      newsform: true,
      readonly: true,      
      submitted: false
    };
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

  fb = createRef();
  fBuilder = null;
  fRender = null;
  componentDidMount() {
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

  getForm(id, readonly) {
    FormDataService.get(id)
      .then(response => {
        this.setState({
          currentForm: response.data
        });

        if (readonly) {
          const formData = JSON.stringify(response.data.fdata);
          this.fRender = $(this.fb.current).formRender({ formData });
        } else {
          $(this.fb.current).formBuilder(this.oldFormOptions).promise
            .then(formBuilder => {
              formBuilder.actions.setData(response.data.fdata);
              this.fBuilder = formBuilder;
            });
        }
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  updateForm() {
    this.setState(prevState => ({
      currentForm: {
        ...prevState.currentForm,
        startAt: prevState.currentForm.startAt ? (prevState.currentForm.startAt + '-02-01') : null,
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
      startAt: this.state.currentForm.startAt ? (this.state.currentForm.startAt + '-02-01') : null,
      fdata: this.fBuilder.actions.getData() /* formData */
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
            <p><h4>{this.state.message}</h4></p>
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
                <label htmlFor="startAt">项目年份</label>
                {(!this.state.newform && this.state.readonly)
                ?<input
                   type="text"
                   id='startAt'
                   readonly=""
                   className="form-control"
                   placeholder="项目年份"
                   value={(new Date(currentForm.startAt)).getFullYear()}
                />
                :<YearPicker
                   yearArray={['2019', '2020']}
                   value={currentForm.startAt}
                   onSelect={this.onChangeStartAt}

                   minRange={1995}
                   maxRange={2022}
                />
                }
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
