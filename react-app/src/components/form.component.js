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

    this.state = {
      currentForm: {
        id: null,
        title: "",
        description: "",
        published: false,
        fdata: null,
        deadline: null,
        readonly: true
      },
      message: ""
    };
  }



  fb = createRef();
  fBuilder = null;
  componentDidMount() {
    const optionOnSave = {
      onSave: (e, formData) => {   //Auto binds `this`
       this.updateForm();
      },
      showActionButtons: !window.location.pathname.includes('View')
    };
    this.fBuilder = $(this.fb.current).formBuilder(optionOnSave);

    this.getForm(this.props.match.params.id);
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

  getForm(id) {
    FormDataService.get(id)
      .then(response => {
        this.setState({
          currentForm: response.data
        });

        //this.fBuilder.actions.setData(this.state.currentForm.fdata);
        this.fBuilder.actions.setData(response.data.fdata);

        this.setState(function(prevState) {
          return {
            currentForm: {
              ...prevState.currentForm,
              readonly: window.location.pathname.includes('View')
            }
          };
        });

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
        {currentForm ? (
          <div className="edit-form">
            <h4>申请表格设计</h4>
            <form>
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  readonly={currentForm.readonly?"":false}
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
                  readonly={currentForm.readonly?"":false}
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
                  readonly={currentForm.readonly?"":false}
                  type="date"
                  className="form-control"
                  id="deadline"
                  value={currentForm.deadline}
                  onChange={this.onChangeDeadline}
                />
              </div>
            </form>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on a Form...</p>
          </div>
        )}

        <div id="fb-editor" ref={this.fb} />

        {currentForm.readonly ? '' : (
        <button
          className="badge badge-danger mr-2"
          onClick={this.deleteForm}
        >
          Delete
        </button>
        )}
        <p>{this.state.message}</p>

      </div>
    );
  }
}
