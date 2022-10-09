
import React, { Component, createRef } from "react"; //For react component

import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Select from 'react-select';
import Input from "react-validation/build/input";
import { isEmail } from "validator";

import YearPicker from 'react-single-year-picker';

import ResponsesList from './responses-list.component.js';
import DossiersList from './dossiers-list.component.js';
import DesignationDataService from "../services/designation.service";
import ProjectDataService from "../services/project.service";
import DossierDataService from "../services/dossier.service";
import SchoolDataService from "../services/school.service";
import AuthService from "./../services/auth.service";

const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        请填写!
      </div>
    );
  }
};

const email = value => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        邮件地址不正确
      </div>
    );
  }
};

export default class Designation extends Component {
  constructor(props) {
    super(props);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangeAppellation = this.onChangeAppellation.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePCategoryId = this.onChangePCategoryId.bind(this);
    this.onChangeProjectId = this.onChangeProjectId.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);

    this.onChangePhoto = this.onChangePhoto.bind(this);

    this.onChangeDescription = this.onChangeDescription.bind(this);

    this.getDesignation = this.getDesignation.bind(this);

    this.updateDesignation = this.updateDesignation.bind(this);

    this.deleteDesignation = this.deleteDesignation.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.saveDesignation = this.saveDesignation.bind(this);
    this.newDesignation = this.newDesignation.bind(this);

    this.state = {
      currentDesignation: {
        id: null,
        donorId: null,
        projectId: null,
        appellation: "",
        amount: 0,
        description: "",
        pCategoryId: 0,
        startAt: new Date().getFullYear(), //null,
      },

      photo: null,
      file: null, // for photo

      currentUser: null,

      newdesignation: true,
      readonly: true,
      message: "",
      submitted: false,

      dirty: false,

      hasErrors: false,

      pCategories: ProjectDataService.PROJECT_CATEGORIES,

      projects: [],
    };
  }

  componentDidMount() {
    const newdesignation = window.location.pathname.includes('add');
    this.setState({newdesignation: newdesignation});
    this.setState({readonly: window.location.pathname.includes('View')});

    if (newdesignation)
      this.setState(function(prevState) {
        return {
          currentDesignation: {
            ...prevState.currentDesignation,
            donorId: this.props.match.params.id
          },
        };
      });

    if (!newdesignation) {
      this.getDesignation(this.props.match.params.id);
      //this.getDesignationPhoto(this.props.match.params.id);
    }

  }


  convert(projects) {
    const result = [];

    if (projects) {
      for (var i = 0; i < projects.length; i++) {
        result.push({value: projects[i].id,
          label: projects[i].name + "-" + projects[i].school.name});
          //label: projects[i].code + "-" + projects[i].name + "-" + projects[i].region});
      }
      return result;
    }
  }

  display(projectId) {
    if (this.state.projects) {
      for (var i = 0; i < this.state.projects.length; i++) {
        if (this.state.projects[i].value == projectId)
          return this.state.projects[i];
      }
      return [];
    }
  }

  displayName(projectId) {
    if (this.state.projects) {
      for (var i = 0; i < this.state.projects.length; i++) {
        if (this.state.projects[i].value == projectId)
          return this.state.projects[i].label ? this.state.projects[i].label : '指定学校项目';
      }
      return '指定学校项目';
    }
  }

  getProjects(pCategoryId = this.state.currentDesignation.pCategoryId,
    startAt = this.state.currentDesignation.startAt) {

    let params = {};
    params["pCategoryId"] = pCategoryId; //this.state.currentDesignation.pCategoryId;
    params["startAt"] = startAt; // this.state.currentDesignation.startAt;

    ProjectDataService.getAll2(params)
      .then(response => {
        this.setState({
          projects: this.convert(response.data.projects)
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  onChangeProjectId(e) {
    const projectId = e.value; //.target.value

    this.setState(function(prevState) {
      return {
        currentDesignation: {
          ...prevState.currentDesignation,
          projectId: projectId
        },
        dirty: true
      };
    });
  }

  onChangeAmount(e) {
    const amount = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDesignation: {
          ...prevState.currentDesignation,
          amount: amount
        },
        dirty: true
      };
    });
  }

  onChangeAppellation(e) {
    const appellation = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDesignation: {
          ...prevState.currentDesignation,
          appellation: appellation
        },
        dirty: true
      };
    });
  }


  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDesignation: {
          ...prevState.currentDesignation,
          description: description
        },
        dirty: true
      };
    });
  }

  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentDesignation: {
        ...prevState.currentDesignation,
        photo: photo
      },
      dirty: true
    }));
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentDesignation: {
        ...prevState.currentDesignation,
        description: description
      },
      dirty: true
    }));
  }

  onChangePCategoryId(e) {
    //const pCategoryId = e.target.selectedIndex; //e.target.value;
    const pCategoryId = ProjectDataService.PROJECT_CATEGORIES_ID[e.target.selectedIndex].id;

    this.setState(function(prevState) {
      return {
        currentDesignation: {
          ...prevState.currentDesignation,
          pCategoryId: pCategoryId
        },
        dirty: true
      };
    });

    this.getProjects(pCategoryId);
  }

  onChangeStartAt(e) {
    const startAt = e; //e.target.value;
    this.setState(function(prevState) {
      return {
        currentDesignation: {
          ...prevState.currentDesignation,
          startAt: startAt
        },
        dirty: true
      };
    });
  };

  getDesignation(id) {
    DesignationDataService.get(id)
      .then(response => {
        this.setState({
          currentDesignation: response.data,
        });

        //this.getDesignationPhoto(id);
        console.log(response.data);

        this.getProjects(response.data.pCategoryId, response.data.startAt);

      })
      .catch(e => {
        console.log(e);
      });
  }

  getDesignationPhoto(id) {
    DesignationDataService.getPhoto(id)
      .then(response => {
        var imageURL = 'data:image/png;base64,' +
            new Buffer(response.data.data.photo, 'binary').toString('base64');

        this.setState(prevState => ({
          currentDesignation: {
            ...prevState.currentDesignation,
          },
          photo: imageURL
        }));

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newDesignation() {
  this.setState(prevState => ({
    currentDesignation: {
      ...prevState.currentDesignation,

      id: null,
      donorId: null,
      projectId: null,
      appellation: "",
      amount: 0,
      description: "",
      pCategoryId: 0,
      startAt: new Date().getFullYear(), //null,
    },
    photo: null,
    file: null,
    submitted: false
  }));

  }

  async saveDesignation() {

    const {startAt, ...others} = this.state.currentDesignation;
    let data = {
      startAt: (startAt + '-01-10'),
      ...others
    };

    try {
      let response = await DesignationDataService.create(data);

      await this.setState(prevState => ({
        currentDesignation: {
          ...prevState.currentDesignation,
          id: response.data.id,
        },
      }));

      if (this.state.file)
        await this.updatePhoto();

      this.setState({
        message: this.state.dirty ? "捐赠指定信息成功提交!" : "捐赠指定信息没有修改",
        submitted: true,
        hasErrors: false,
      });

    } catch (e) {
      const resMessage =
        (e.response &&
          e.response.data &&
          e.response.data.message) ||
        e.message ||
        e.toString();

        this.setState({
          message: "捐赠指定信息提交失败：" + resMessage,
          hasErrors: true,
        });

      console.log(e);
    };

  }

  async updateDesignation() {

    const {startAt, ...others} = this.state.currentDesignation;
    let data = {
      startAt: (startAt + '-01-10'),
      ...others
    };

    try {
      await DesignationDataService.update(this.state.currentDesignation.id, data);


      if (this.state.file)
        await this.updatePhoto();

      this.setState({
        message: this.state.dirty ? "捐赠指定信息成功修改!" : "捐赠指定信息没有修改",
        submitted: true,
        hasErrors: false,
      });

    } catch (e) {
      const resMessage =
        (e.response &&
          e.response.data &&
          e.response.data.message) ||
        e.message ||
        e.toString();

        this.setState({
          message: "捐赠指定信息修改失败：" + resMessage,
          hasErrors: true,
        });

        console.log(e);
    }
  }


  async updatePhoto() {
    var data = new FormData();
    data.append('multi-files', this.state.file, this.state.file.name);
    await DesignationDataService.updatePhoto(this.state.currentDesignation.id, data);
  }

  deleteDesignation() {
    DesignationDataService.delete(this.state.currentDesignation.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/designations')
      })
      .catch(e => {
        console.log(e);
      });
  }

  onDrag = event => {
    event.preventDefault()
  }

  onDrop = event => {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    this.setState(prevState => ({
      currentDesignation: {
        ...prevState.currentDesignation,
      },
      file: file,
      dirty: true
    }));

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState(prevState => ({
      currentDesignation: {
        ...prevState.currentDesignation,
      },
      photo: reader.result
    }));
  }

  refreshOnReturn() {
    window.onblur = () => {window.onfocus = () => {
      window.location.reload(true);
    }};
  }

  customFilter(option, inputValue) {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

  render() {
    const { currentDesignation } = this.state;

    return (
      <div>
        {(this.state.submitted /*&& this.state.newdesignation*/) ? (
          <div>
            <p>{this.state.message}</p>
            <a href="javascript:window.close();">
              <button class="btn btn-primary">关闭</button>
            </a>

          </div>
        ) : (
          <div class="row">
            <div class="col-sm-4">

              <div class="row">
{/*
                <div onDragOver={this.onDrag} onDrop={this.onDrop}>
                {!this.state.readonly && <p>上传照片（拖拽照片文件到下框中）</p>}
                <img src={this.state.photo} height="200" width="300" readonly={this.state.readonly?"":false} />
                </div>
*/}
                <div class="form-group">
                <label htmlFor="donor">捐款人</label>
                <Link
                  to={"/donorsView/" + currentDesignation.donorId}
                  id="donor"
                  name="donor"
                  target='_blank'
                >
                  点击查看捐款人
                </Link>
                </div>

              </div>

              {this.state.readonly && AuthService.getCurrentUser() && (
                <div class="box">
                  <a target="_blank" onClick={this.refreshOnReturn}
                    href={"/designations/" + currentDesignation.id} class="btn btn-primary mb-4"
                  >
                    编辑
                  </a>
                </div>
              )}

            </div>

            <div class="col-sm-8">

              <div class="row">

              <div class="col-sm-4">
                <label htmlFor="amount">金额</label>
                <input
                readonly={this.state.readonly?"":false}
                type="number" min="0.00" max="10000.00" step="0.01"
                class="form-control"
                id="amount"
                required
                value={currentDesignation.amount}
                onChange={this.onChangeAmount}
                name="amount"
                />
              </div>

              <div className="col-sm-4">
                <label htmlFor="startAt">项目年份</label>
                {(this.state.readonly)
                  ?<input
                     type="text"
                     id='startAt'
                     readonly=""
                     className="form-control"
                     placeholder="项目年份"
                     value={currentDesignation.startAt}
                  />
                  :<YearPicker
                     yearArray={['2019', '2020']}
                     value={currentDesignation.startAt}
                     onSelect={this.onChangeStartAt}
                     minRange={1995}
                     maxRange={2030}
                  />
                }
              </div>

              <div className="form-group col-sm-12">
                <label htmlFor="pCategoryId">项目类型</label>
                <select
                  disabled={this.state.readonly?"disabled":false}
                  class="form-control"
                  id="pCategoryId"
                  required
                  value={ProjectDataService.getCategory(currentDesignation.pCategoryId) /*this.state.pCategories[currentDesignation.pCategoryId]*/}
                  onChange={this.onChangePCategoryId}
                  name="pCategoryId"
                >

                  {this.state.pCategories.map((option, index) => (
                  <option value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div class="form-group col-sm-12"
              >
                <label htmlFor="projectId">学校项目：
                </label>
                {!this.state.readonly
                ? (<Select onChange={this.onChangeProjectId.bind(this)}
                  class="form-control"
                  id="projectId"
                  value={this.display(currentDesignation.projectId)}
                  name="projectId"
                  filterOption={this.customFilter}
                  options={this.state.projects}
                  />)
                : (currentDesignation.projectId
                  ? <Link
                  to={ "/projectsView/" + currentDesignation.projectId}
                  id="projectId"
                  name="projectId"
                  target='_blank'
                  >
                  {this.displayName(currentDesignation.projectId)}
                  </Link>
                  : <p> 没有指定学校项目 </p>
                  )
                }
              </div>

              <div class="form-group col-sm-12">
                <label htmlFor="appellation">命名</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="appellation"
                required
                value={currentDesignation.appellation}
                onChange={this.onChangeAppellation}
                name="appellation"
                />
              </div>

              <div class="form-group col-sm-12">
                <label htmlFor="description">说明</label>
                <textarea
                rows="4"
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="description"
                required
                value={currentDesignation.description}
                onChange={this.onChangeDescription}
                name="description"
                />
              </div>

            </div>
          </div>

          <div class="w-100"></div>

          {!this.state.readonly && (<div>

            <button onClick={this.saveDesignation} class="btn btn-primary" hidden={!this.state.newdesignation}>
              提交
            </button>

            <button hidden={this.state.newdesignation}
              type="submit"
              className="btn btn-primary"
              onClick={this.updateDesignation}
            >
              保存
            </button>

            <button
              type="submit"
              className="btn btn-primary ml-2"
              onClick={() => (!this.state.dirty || window.confirm("您确定要取消吗 ?")) && window.close()}
            >
              取消
            </button>

            <div class="w-100"></div>

            {this.state.hasErrors && this.state.message && (
              <div class="form-group mt-2">
                <div
                  className={
                  this.state.submitted
                    ? "alert alert-success"
                    : "alert alert-danger"
                  }
                  role="alert"
                >
                  {this.state.message}
                </div>
              </div>
            )}

          </div>)}

          </div>
        ) }
      </div>
    );
  }
}
