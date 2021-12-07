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

  /**
    this.setState(function(prevState) {
      return {
        currentForm: {
          ...prevState.currentForm,
          readonly: window.location.pathname.includes('View')
        }
      };
    });
*/
    //this.setState({readonly: window.location.pathname.includes('View')});

    const optionOnSave = {
      onSave: (e, formData) => {   //Auto binds `this`
       this.updateForm();
      },
      showActionButtons: !window.location.pathname.includes('View')
      //showActionButtons: !this.state.currentForm.readonly
    };

    this.fBuilder = $(this.fb.current).formBuilder(optionOnSave);

    this.getForm(this.props.match.params.id);

/**
    try {
      this.fBuilder.actions.setData(this.state.currentForm.fdata);
    } catch (e) {
      alert(e);
    }
*/

  }

  async SAVE_componentDidMount() {
    this.fBuilder = $(this.fb.current).formBuilder(this.optionOnSave);

    await this.getForm(this.props.match.params.id);

    try {
      this.fBuilder.actions.setData(this.state.currentForm.fdata);
    } catch (e) {
      alert(e);
    }

    this.setState({readonly: window.location.pathname.includes('View')});
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

  async SAVE_getForm(id) {
    const response = await FormDataService.get(id);

      this.setState({
      currentForm: response.data
    });
  }

  getForm(id) {
    FormDataService.get(id)
      .then(response => {
        this.setState({
          currentForm: response.data
        });

        this.fBuilder.actions.setData(this.state.currentForm.fdata);


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

/*
  updatePublished(status) {
    var data = {
      id: this.state.currentForm.id,
      title: this.state.currentForm.title,
      description: this.state.currentForm.description,
      deadline: this.state.currentForm.deadline,
      published: status
    };

    FormDataService.update(this.state.currentForm.id, data)
      .then(response => {
        this.setState(prevState => ({
          currentForm: {
            ...prevState.currentForm,
            published: status
          }
        }));
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }
*/

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
{/*}
              <div className="form-group">
                <label>
                  <strong>Status:</strong>
                </label>
                {currentForm.published ? "Published" : "Pending"}
              </div>
*/}

            </form>

{/*}
            {currentForm.published ? (
              <button
                className="badge badge-primary mr-2"
                onClick={() => this.updatePublished(false)}
              >
                UnPublish
              </button>
            ) : (
              <button
                className="badge badge-primary mr-2"
                onClick={() => this.updatePublished(true)}
              >
                Publish
              </button>

            )}
*/}
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
        ) : (
          <div>
            <br />
            <p>Please click on a Form...</p>
          </div>
        )}

        <div id="fb-editor" ref={this.fb} />
      </div>
    );
  }
}
