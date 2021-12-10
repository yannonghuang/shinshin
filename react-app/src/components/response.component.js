//import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import FormDataService from "../services/form.service";
//import AttachmentsList from './collapsible-attachments-list.component.js';
import AttachmentsList from './attachments-list.component.js';
import SchoolDataService from "../services/school.service";
import AuthService from "./../services/auth.service";
import TheCollapsible from './collapsible-attachments-list.component';

import $ from "jquery"; //Load jquery
import React, { Component, createRef } from "react"; //For react component
import ReactDOM from "react-dom";
import Select from 'react-select';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link } from "react-router-dom";

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
      message: "",
      readonly: true,

      progress: 0,
    };

    //this.init();
  }

optionOnSave = {
  onSave: (e, responseData) => {   //Auto binds `this`
     this.submitResponse();
  }
};

  fb = createRef();
  fRender = null;
  componentDidMount() {
    this.setState({readonly: window.location.pathname.includes('View')});
    this.getResponse(this.props.match.params.id);
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
        if (this.state.schools[i].value == schoolId)
          return this.state.schools[i];
      }
      return [];
    }
  }

  getResponse(id) {
    ResponseDataService.get(id)
      .then(response => {

        try {
          const formData = JSON.stringify(response.data.fdata);
          this.fRender = $(this.fb.current).formRender({ formData });
          //this.fRender = $(this.fb.current).formRender(this.state.currentResponse.fdata);
        } catch (e) {
          alert(e);
        }

        this.setState({
          currentResponse: response.data
        });

        this.getSchools();

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

/*
  async SAVE_componentDidMount() {
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
*/

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
              currentResponse: {
                ...prevState.currentResponse,
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
    if (!this.state.currentResponse.fdata)
      return '';

    for (var i = 0; i < this.state.currentResponse.fdata.length; i++) {
      if (this.state.currentResponse.fdata[i].type === type &&
          this.state.currentResponse.fdata[i].name === name)
        return this.state.currentResponse.fdata[i].label;
    }

    return '';
  }

  collectFiles() {
    var inputs = document.getElementsByTagName("input");
    const attFiles = [];
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "file" && inputs[i].files) {
        let filesN = inputs[i].files.length;
        for (var j = 0; j < filesN; j++) {
          attFiles.push({description: this.getLabel(inputs[i].type, inputs[i].name),
            file: inputs[i].files[j]});
        }
      }
    }

    this.setState(prevState => ({
          currentResponse: {
            ...prevState.currentResponse,
            attFiles: attFiles
          }
        }));

    return attFiles;
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

/*
   async SAVE_getResponse(id) {
     const response = await ResponseDataService.get(id);
     this.setState({
       currentResponse: response.data
     });
   }
*/

  uploadAttachments(attFiles) {
    var data = new FormData();
    var descriptions = [];
    for (var i = 0; i < attFiles.length; i++) {
      data.append('multi-files', attFiles[i].file,
      attFiles[i].file.name);

      descriptions.push(attFiles[i].description);
    }
    data.append('descriptions', JSON.stringify(descriptions));

    //if (attFiles[0]) data.append('description', attFiles[0].description);
/**
    for (var i = 0; i < this.state.currentResponse.attFiles.length; i++) {
      data.append('multi-files', this.state.currentResponse.attFiles[i],
        this.state.currentResponse.attFiles[i].name);
    }
*/
    ResponseDataService.uploadAttachments(this.state.currentResponse.id, data, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  updateResponse() {
    const attFiles = this.collectFiles();

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
        this.uploadAttachments(attFiles);
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
    const { currentResponse, progress } = this.state;

    return (
      <div>
        {currentResponse ? (
          <div className="edit-form">
            <h4>欣欣教育基金会项目申请（{this.state.readonly?"阅览":"编辑"}）</h4>
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

              <div class="form-group">
                <label htmlFor="schoolId">所属学校</label>
                <Select onChange={this.onChangeSchoolId.bind(this)}
                  readonly={this.state.readonly?"":false}
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

        {this.state.readonly ? (

            <Tabs>
              <TabList>
                <Tab>...</Tab>
                <Tab>项目申请附件</Tab>
              </TabList>
              <TabPanel>
                <p>... 查看项目申请附件 ...</p>
              </TabPanel>
              <TabPanel>
                <AttachmentsList responseId = {currentResponse.id} />
              </TabPanel>

            </Tabs>

        ) : (

          <div>
{/*}
            <div class="container">
            <div class="row">
              <div class="col-sm-8 mt-3">
              <form ref="formToSubmit" action="http://localhost:8080/multiple-upload" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                <label for="input-multi-files">上传附件:</label>
                <input type="file"
                  name="multi-files" multiple
                  id="input-multi-files"
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
*/}
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

          {(progress < 100 && progress > 0) && (
            <div className="progress">
              <div
                className="progress-bar progress-bar-info progress-bar-striped"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: progress + "%" }}
              >
                {progress}%
              </div>
            </div>
          )}

          {(progress >= 100) && (
            <Link
              to={("/responses" +
                   (this.state.currentResponse.schoolId ? ('/school/' + this.state.currentResponse.schoolId) : ''))}
              className="badge badge-success mr-2"
            >
              上传成功，转项目申请列表...
            </Link>
          )}

          <p>{this.state.message}</p>
        </div>
        )}
      </div>
    );
  }
}
