//import React, { Component } from "react";
import FormDataService from "../services/form.service";

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
import ReactDOM from "react-dom";

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
          this.fBuilder = $(this.fb.current).formBuilder(this.oldFormOptions).promise
            .then(formBuilder => {
              formBuilder.actions.setData(response.data.fdata);
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
          message: "The form was updated successfully!"
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
      fdata: this.fBuilder.actions.getData() /* formData */
    };

    FormDataService.create(data)
      .then(response => {
        this.setState(prevState => ({
          currentForm: {
            ...prevState.currentForm,
            id: response.data.id,
          },
          submitted: true
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
        {this.state.newform && this.state.submitted
        ? (
          <div>
            <h4>You submitted successfully!</h4>
              <button className="btn btn-success" onClick={this.newForm}>
                Add
              </button>
          </div>
          ) : (
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
                <input
                  readonly={(!this.state.newform && this.state.readonly) ? "" : false}
                  type="text"
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
            </form>
          </div>
          )}

        <div id="fb-editor" ref={this.fb} />


        <p>{this.state.message}</p>

      </div>
    );
  }
}
