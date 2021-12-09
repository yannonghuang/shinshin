//import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import FormDataService from "../services/form.service";
import SchoolDataService from "../services/school.service";
import AuthService from "./../services/auth.service";

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
import ReactDOM from "react-dom";
import Select from 'react-select';

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
    this.getForm = this.getForm.bind(this);
    this.submitResponse = this.submitResponse.bind(this);
    this.deleteResponse = this.deleteResponse.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.onChangeAttFiles = this.onChangeAttFiles.bind(this);

    this.state = {
      currentResponse: {
        id: null,
        title: "",
        fdata: null,
        formId: null,
        schoolId: null,
        attFiles: [],
      },

      currentUser: null,
      schools: [],
      message: ""
    };

    //this.init();
  }

options = {
  action: "http://localhost:8080/multiple-upload",
  method: "POST",
  enctype: "multipart/form-data",
};

  fb = createRef();
  fRender = null;
  componentDidMount() {
    this.getForm(this.props.match.params.id);

    this.getSchools();
  }


  convert(schools) {
    const result = [];
    if (schools) {
    for (var i = 0; i < schools.length; i++) {
      result.push({value: schools[i].id,
        label: schools[i].region + "-" + schools[i].code + "-" + schools[i].name});
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

  getSchools() {
    SchoolDataService.getAllSimple()
    .then(response => {
        this.setState({
          schools: this.convert(response.data)
        });
        console.log(response);

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

  getForm(id) {
    FormDataService.get(id)
      .then(response => {
        this.setState({
          currentResponse: response.data
        });

        try {
          const formData = JSON.stringify(response.data.fdata);
          this.fRender = $(this.fb.current).formRender({ formData });
        } catch (e) {
          alert(e);
        }

        this.setState(function(prevState) {
          return {
            currentResponse: {
              ...prevState.currentResponse,
              formId: id
              }
           };
        });
      })
    }

  uploadAttachments(responseId) {
    var data = new FormData();
    for (var i = 0; i < this.state.currentResponse.attFiles.length; i++) {
      data.append('multi-files', this.state.currentResponse.attFiles[i],
        this.state.currentResponse.attFiles[i].name);
    }
    ResponseDataService.uploadAttachments(responseId /*this.state.currentResponse.id*/, data)
    .then(response => {
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  submitResponse() {
    var data = {
      title: this.state.currentResponse.title,
      formId: this.state.currentResponse.formId,
      schoolId: this.state.currentResponse.schoolId,
      fdata: this.fRender.userData
    };

    ResponseDataService.create(
      data
    )
    .then(response => {
      if (this.state.currentResponse.attFiles)
        this.uploadAttachments(response.data.id);

      console.log(response.data);

      this.setState({
        currentResponse: response.data,
        message: "The response was submitted successfully!"
        });

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
        this.props.history.push('/responses')
      })
      .catch(e => {
        console.log(e);
      });
  }


  render() {
    const { currentResponse } = this.state;

    return (
      <div>
        {currentResponse ? (
          <div className="edit-form">
            <h4>欣欣教育基金会项目申请（新建）</h4>
            <form>
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  type="text"
                  readonly={"true"}
                  className="form-control"
                  id="title"
                  value={currentResponse.title}
                  onChange={this.onChangeTitle}
                />
              </div>

              <div class="form-group">
                <label htmlFor="schoolId">所属学校</label>
                <Select onChange={this.onChangeSchoolId.bind(this)}
                  class="form-control"
                  id="schoolId"
                  value={this.display(currentResponse.schoolId)}
                  name="schoolId"
                  options={this.state.schools}
                />
              </div>

            </form>

          </div>
        ) : ''}

        <div id="fb-editor" ref={this.fb} />

        <div class="container">
          <div class="row">
            <div class="col-sm-8 mt-3">
                <h4>Attachment</h4>
            <form ref="formToSubmit" action="http://localhost:8080/multiple-upload" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                <input type="file"
                  name="multi-files"
                  multiple id="input-multi-files"
                  class="form-control-file border"
                  onChange={e => this.onChangeAttFiles(e)}
                />
                <input type="hidden" name="responseId" id="responseId"/>
                </div>
            </form>
            </div>
          </div>
          <hr />
          <div class="row">
            <div class="col-sm-12">
              <div class="preview-images"></div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="badge badge-success"
          onClick={this.submitResponse}
        >
          Submit
        </button>

        <p>{this.state.message}</p>
      </div>
    );
  }
}
