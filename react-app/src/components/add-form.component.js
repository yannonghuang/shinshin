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

export default class AddForm extends Component {
  constructor(props) {
    super(props);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDeadline = this.onChangeDeadline.bind(this);
    this.saveForm = this.saveForm.bind(this);
    this.newForm = this.newForm.bind(this);

    this.state = {
      id: null,
      title: "",
      description: "",
      published: false,
      deadline: null,
      submitted: false
    };
  }

options = {
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

  onChangeTitle(e) {
    this.setState({
      title: e.target.value
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    });
  }

  onChangeDeadline(e) {
    this.setState({
      deadline: e.target.value
    });
  }

  saveForm(formData) {
    var data = {
      title: this.state.title,
      description: this.state.description,
      deadline: this.state.deadline,
      fdata: this.fBuilder.actions.getData() /* formData */
    };

    FormDataService.create(data)
      .then(response => {
        this.setState({
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          deadline: response.data.deadline,
          published: response.data.published,

          submitted: true
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newForm() {
    this.setState({
      id: null,
      title: "",
      description: "",
      deadline: null,
      published: false,

      submitted: false
    });
  }

  fb = createRef();
  fBuilder = null;
  componentDidMount() {
    this.fBuilder = $(this.fb.current).formBuilder(this.options);
  }


  NEWrender() {
    return <div id="fb-editor" ref={this.fb} />;
  }

  render() {
    return (
    <div>
      <div className="submit-form">
        {this.state.submitted ? (
          <div>
            <h4>You submitted successfully!</h4>
            <button className="btn btn-success" onClick={this.newForm}>
              Add
            </button>
          </div>
        ) : (
          <div>
            <h4>申请表格设计</h4>
            <div className="form-group">
              <label htmlFor="title">标题</label>
              <input
                type="text"
                className="form-control"
                id="title"
                required
                value={this.state.title}
                onChange={this.onChangeTitle}
                name="title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">说明</label>
              <input
                type="text"
                className="form-control"
                id="description"
                required
                value={this.state.description}
                onChange={this.onChangeDescription}
                name="description"
              />
            </div>

             <div className="form-group">
               <label htmlFor="deadline">截止日期</label>
               <input
                 type="date"
                 className="form-control"
                 id="deadline"
                 value={this.state.deadline}
                 onChange={this.onChangeDeadline}
               />
             </div>
          </div>
        )}
      </div>

      <div id="fb-editor" ref={this.fb} />
    </div>
    );
  }
}
