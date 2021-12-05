//import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import FormDataService from "../services/form.service";
import AttachmentsList from './collapsible-attachments-list.component.js';
import SchoolDataService from "../services/school.service";
import AuthService from "./../services/auth.service";

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
import ReactDOM from "react-dom";
import TheCollapsible from './collapsible-attachments-list.component';

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

    this.state = {
      currentResponse: {
        id: null,
        title: "",
        fdata: null,
        formId: null,
        schoolId: null,
      },

      currentUser: null,
      schools: [],
      message: "",
      readonly: true,
    };

    this.init();
  }

optionOnSave = {
  onSave: (e, responseData) => {   //Auto binds `this`
     this.submitResponse();
  }
};

  fb = createRef();
  fRender = null;

  async componentDidMount() {

    this.setState({readonly: window.location.pathname.includes('View')});

    await this.getResponse(this.props.match.params.id);
    try {
      const formData = JSON.stringify(this.state.currentResponse.fdata);
      this.fRender = $(this.fb.current).formRender({ formData });
      //this.fRender = $(this.fb.current).formRender(this.state.currentResponse.fdata);
    } catch (e) {
      alert(e);
    }

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
    this.getSchools();
  }

  getSchools() {
    SchoolDataService.getAllSimple()
      .then(response => {
        this.setState({
          schools: response.data
        });
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

  onChangeSchoolId(e) {
    const SchoolId = e.target.value;

    this.setState(function(prevState) {
      return {
        currentResponse: {
          ...prevState.currentResponse,
          SchoolId: SchoolId
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

   async getResponse(id) {
     const response = await ResponseDataService.get(id);
     this.setState({
       currentResponse: response.data
     });
   }

   updateResponse() {
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
        this.setState({
          currentResponse: response.data,
          message: "The response was updated successfully!"
        });
      })
      .catch(e => {
        console.log(e);
      });

      $('input[name="responseId"]').attr('value', this.state.currentResponse.id);
      this.refs.formToSubmit.submit();
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
            <h4>欣欣教育基金会项目申请（编辑）</h4>
            <form>
              <div className="form-group">
                <label htmlFor="title">标题</label>
                <input
                  readonly={"true"/*this.state.readonly?"":false*/}
                  type="text"
                  className="form-control"
                  id="title"
                  value={currentResponse.title}
                  onChange={this.onChangeTitle}
                />
              </div>


                <div className="form-group">
                  <label htmlFor="schoolId">School</label>
                  <select onChange={this.onChangeSchoolId.bind(this)}
                  readonly={"true"/*this.state.readonly?"":false*/}
                    class="form-control"
                    id="schoolId"
                    value={currentResponse.schoolId}
                    name="schoolId"
                >
                    <option value="">学校编号（省-学校名）</option>
                    {this.state.schools.map((option) => (
                      <option value={option.id}>{option.code + "(" + option.region + " - " + option.name + ")"}</option>
                    ))}
                  </select>
                </div>

            </form>
            <p>{this.state.message}</p>
          </div>



        ) : (
          <div>
            <br />
            <p>Please click on a Response...</p>
          </div>
        )}

        <div id="fb-editor" ref={this.fb} />

        {this.state.readonly ? (<AttachmentsList responseId = {this.state.currentResponse.id}/>) : (
        <div>
        <div class="container">
          <div class="row">
            <div class="col-sm-8 mt-3">
            <form ref="formToSubmit" action="http://localhost:8080/multiple-upload" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                <label for="input-multi-files">上传附件:</label>
                <input type="file" name="multi-files" multiple id="input-multi-files" class="form-control-file border"/>
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
          onClick={this.updateResponse}
        >
          Update
        </button>

        <button
          className="badge badge-danger mr-2"
          onClick={this.deleteResponse}
        >
          Delete
        </button>
        </div>
        )}
      </div>
    );
  }
}
