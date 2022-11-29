//import React, { Component } from "react";
import React, { Component, createRef } from "react"; //For react component
//import 'bootstrap/dist/css/bootstrap.min.css';
//import {Tabs, Tab} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Select from 'react-select';

import YearPicker from 'react-single-year-picker';

import ResponsesList from './responses-list.component.js';
import MaterialsList from './materials-list.component.js';
import AwardDataService from "../services/award.service";
import MaterialDataService from "../services/material.service";
import SchoolDataService from "../services/school.service";
import AuthService from "./../services/auth.service";
//import AwardDetails from './collapsible-award.component';

export default class Award extends Component {
  constructor(props) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.onChangePhoto = this.onChangePhoto.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangeIssuer = this.onChangeIssuer.bind(this);
    this.onChangeAwardee = this.onChangeAwardee.bind(this);

    this.getAward = this.getAward.bind(this);
    this.getAwardPhoto = this.getAwardPhoto.bind(this);
    this.updateAward = this.updateAward.bind(this);
    this.updatePhoto = this.updatePhoto.bind(this);
    this.deleteAward = this.deleteAward.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onChangeDocFiles = this.onChangeDocFiles.bind(this);
    this.onChangeDocCategory = this.onChangeDocCategory.bind(this);

    this.saveAward = this.saveAward.bind(this);
    this.newAward = this.newAward.bind(this);

    this.state = {
      currentAward: {
        id: null,
        name: "",
        schoolId: null,
        type: null,
        category: null,
        photo: null,
        file: null, // for photo
        description: "",
        startAt: new Date().getFullYear(), //null,

        docFiles: null, //[],
        docCategory: "",
      },
      currentUser: null,
      schools: [],
      types: [],
      categories: [],

      newaward: false,
      readonly: true,
      docCategories: [],
      message: "",
      submitted: false,

      pastedPhotoType: null,

      dirty: false,
      progress: 0,
      hasErrors: false,

    };
  }

  componentDidMount() {

    const newaward = window.location.pathname.includes('add');

    if (newaward) {
      const search = this.props.location.search;
      const schoolId = new URLSearchParams(search).get('schoolId');

      this.setState(prevState => ({
        currentAward: {
          ...prevState.currentAward,
          schoolId: schoolId
        },
        newaward: true,
      }));
    }

    //this.setState({newaward: newaward});

    const readonly = window.location.pathname.includes('View');
    this.setState({readonly: readonly}, () => {this.init(readonly)});
    //this.setState({readonly: window.location.pathname.includes('View')});

    if (!newaward) {
      this.getAward(this.props.match.params.id);
      //this.getAwardPhoto(this.props.match.params.id);
    }

    this.getDocCategories();
    this.getSchools();
    this.getTypes();
    this.getCategories();
  }


  init(readonly) {
    function onkeydownInEditable(e: KeyboardEvent) {
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")
        e.preventDefault();
    }
    document.getElementById('awardPhotoDiv').addEventListener("keydown", onkeydownInEditable);

    if (readonly) return;

    document.getElementById('awardPhotoDiv').onpaste = async (pasteEvent) => {
      pasteEvent.preventDefault();

      var items = pasteEvent.clipboardData.items;

      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
          var blob = items[i].getAsFile();
          const type = items[i].type;
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = async () => {
            await this.setState(prevState => ({
              currentAward: {
                ...prevState.currentAward,
                photo: reader.result
              },
              pastedPhotoType: type,
              dirty: true
            }));

            if (document.getElementById('awardPhoto'))
              document.getElementById('awardPhoto').src = reader.result;

            return;
          }

        }
      }
    };

  }

  convert(schools) {
    const result = [];
    if (schools) {
    for (var i = 0; i < schools.length; i++) {
      result.push({value: schools[i].id,
        label: schools[i].code + "-" + schools[i].name + "-" + schools[i].region });
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

  displayName(schoolId) {
    if (this.state.schools) {
      for (var i = 0; i < this.state.schools.length; i++) {
        if (this.state.schools[i].value == schoolId)
          return this.state.schools[i].label ? this.state.schools[i].label : '学校名';
      }
      return '';
    }
  }

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
                currentAward: {
                  ...prevState.currentAward,
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

  getTypes() {
    AwardDataService.getTypes()
      .then(response => {
        this.setState({
          types: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getCategories() {
    AwardDataService.getCategories()
      .then(response => {
        this.setState({
          categories: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getDocCategories() {
    MaterialDataService.getDocCategories()
      .then(response => {
        this.setState({
          docCategories: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  onChangeName(e) {
    const name = e.target.value;

    this.setState(function(prevState) {
      return {
        currentAward: {
          ...prevState.currentAward,
          name: name
        },
        dirty: true
      };
    });
  }

  onChangeSchoolId(e) {
    const schoolId = e.value; //.target.value;

    this.setState(function(prevState) {
      return {
        currentAward: {
          ...prevState.currentAward,
          schoolId: schoolId
        },
        dirty: true
      };
    });
  }

  onChangeDocCategory(e) {
    const docCategory = e.target.value;

    this.setState(function(prevState) {
      return {
        currentAward: {
          ...prevState.currentAward,
          docCategory: docCategory
        },
        dirty: true
      };
    });
  }

  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentAward: {
        ...prevState.currentAward,
        photo: photo
      },
      dirty: true
    }));
  }

  onChangeType(e) {
    const type = e.target.value;

    this.setState(prevState => ({
      currentAward: {
        ...prevState.currentAward,
        type: type
      },
      dirty: true
    }));
  }

  onChangeCategory(e) {
    const category = e.target.value;

    this.setState(prevState => ({
      currentAward: {
        ...prevState.currentAward,
        category: category
      },
      dirty: true
    }));
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentAward: {
        ...prevState.currentAward,
        description: description
      },
      dirty: true
    }));
  }

  onChangeIssuer(e) {
    const issuer = e.target.value;

    this.setState(prevState => ({
      currentAward: {
        ...prevState.currentAward,
        issuer: issuer
      },
      dirty: true
    }));
  }

  onChangeAwardee(e) {
    const awardee = e.target.value;

    this.setState(prevState => ({
      currentAward: {
        ...prevState.currentAward,
        awardee: awardee
      },
      dirty: true
    }));
  }

  onChangeStartAt(e) {
    const startAt = e; //e.target.value;
    this.setState(function(prevState) {
      return {
        currentAward: {
          ...prevState.currentAward,
          startAt: startAt
        },
        dirty: true
      };
    });
  };

  getAward(id) {
    AwardDataService.get(id)
      .then(response => {
        this.setState({
          currentAward: response.data,
        });

        this.setState(prevState => ({
              currentAward: {
                ...prevState.currentAward,
                schoolId: response.data.school ? response.data.school.id : null
              }
            }));

        this.getAwardPhoto(id);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getAwardPhoto(id) {
    AwardDataService.getPhoto(id)
      .then(response => {
        var imageURL = 'data:image/png;base64,' +
            new Buffer(response.data.data.photo, 'binary').toString('base64');

        this.setState(prevState => ({
              currentAward: {
                ...prevState.currentAward,
                photo: imageURL
              }
            }));

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newAward() {
  this.setState(prevState => ({
    currentAward: {
      ...prevState.currentAward,
      id: null,
      name: "",
      photo: null,
      file: null,
      type: null,
      category: null,
      docFiles: null, //[],
      docCategory: "",
      description: "",
      issuer: "",
      awardee: "",
      startAt: new Date().getFullYear(), //null
     },

    submitted: false
  }));

  }

  validateSchool() {

    if (!this.state.currentAward.schoolId) {
      this.setState({
        message: "请选择学校"
      });
      return false;
    }
    return true;
  }

  async saveAward() {
    if (!this.validateSchool()) return;

    var data = {
      name: this.state.currentAward.name,
      schoolId: this.state.currentAward.schoolId,
      type: this.state.currentAward.type,
      category: this.state.currentAward.category,
      description: this.state.currentAward.description,
      issuer: this.state.currentAward.issuer,
      awardee: this.state.currentAward.awardee,
      startAt: this.state.currentAward.startAt ? (this.state.currentAward.startAt + '-01-10') : null,
    };

    try {
      let response = await AwardDataService.create(data);

      await this.setState(prevState => ({
        currentAward: {
          ...prevState.currentAward,
          id: response.data.id,
        },
      }));

      if (this.state.currentAward.file || this.state.pastedPhotoType)
        await this.updatePhoto();

      //if (this.state.currentAward.docFiles) // docs
      this.uploadMaterials();

      this.setState({
        message: this.state.dirty ? "奖项信息成功提交!" : "奖项信息没有修改",
        //submitted: true
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
          message: "奖项信息提交失败：" + resMessage,
          hasErrors: true,
        });

      console.log(e);
    };

  }

  progressDivide() {
    let photoPresent = this.state.currentAward.file || this.state.pastedPhotoType;
    let filesPresent = this.state.currentAward.docFiles && (this.state.currentAward.docFiles.length > 0);

    if (photoPresent && !filesPresent) return 100;
    if (!photoPresent && filesPresent) return 0;
    if (!photoPresent && !filesPresent) return 0;

    return 100 / (1 + this.state.currentAward.docFiles.length);
  }

  async updateAward() {
    if (!this.validateSchool()) return;

    var data = {
      name: this.state.currentAward.name,
      //photo: this.state.currentAward.photo,
      type: this.state.currentAward.type,
      category: this.state.currentAward.category,
      schoolId: this.state.currentAward.schoolId,
      description: this.state.currentAward.description,
      issuer: this.state.currentAward.issuer,
      awardee: this.state.currentAward.awardee,
      startAt: this.state.currentAward.startAt ? (this.state.currentAward.startAt + '-01-10') : null,
    };

    try {
      await AwardDataService.update(this.state.currentAward.id, data);

      if (this.state.currentAward.file || this.state.pastedPhotoType)
        await this.updatePhoto();

      //if (this.state.currentAward.docFiles) // docs
      this.uploadMaterials();

      this.setState({
        message: this.state.dirty ? "奖项信息成功修改!" : "奖项信息没有修改",
        //submitted: true
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
          message: "奖项信息修改失败：" + resMessage,
          hasErrors: true,
        });

        console.log(e);
    }
  }

  async updatePhoto() {
    let divide = this.progressDivide();

    var data = new FormData();
    if (this.state.currentAward.file)
      data.append('multi-files', this.state.currentAward.file, this.state.currentAward.file.name);
    else if (this.state.pastedPhotoType) {
      const base64Response = await fetch(this.state.currentAward.photo);
      const blob = await base64Response.blob();
      data.append('multi-files', new Blob([blob], {type: this.state.pastedPhotoType}));
    }
    await AwardDataService.updatePhoto(this.state.currentAward.id, data, (event) => {
      this.setState({
        progress: Math.round((divide * event.loaded) / event.total),
      });
    });
  }

  uploadMaterials() {
    let divide = this.progressDivide();

    if (this.state.currentAward.docFiles && (this.state.currentAward.docFiles.length > 0) &&
        !this.state.currentAward.docCategory) {
      throw new Error('奖项信息附件没有上传，请选择文档类型!');
    }

    var data = new FormData();
    for (var i = 0; i < (this.state.currentAward.docFiles
                        ? this.state.currentAward.docFiles.length : 0); i++) {
      data.append('multi-files', this.state.currentAward.docFiles[i],
        this.state.currentAward.docFiles[i].name);
    }
    data.append('docCategory', this.state.currentAward.docCategory);
    AwardDataService.uploadMaterials(this.state.currentAward.id, data, (event) => {
      this.setState({
        progress: Math.round(divide + ((100 - divide) * event.loaded) / event.total),
      });
    })
    .then(response => {
      this.setState(prevState => ({
        message: prevState.message + (this.state.currentAward.docFiles ? " 奖项信息附件成功上传!" : ""),
        submitted: true,
        hasErrors: false,
      }));
      console.log(response.data);
    });
  }

  deleteAward() {
    AwardDataService.delete(this.state.currentAward.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/awards')
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
          currentAward: {
            ...prevState.currentAward,
            file: file
          },
          dirty: true
        }));

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState(prevState => ({
      currentAward: {
        ...prevState.currentAward,
        photo: reader.result
      }
    }));
  }


  onChangeDocFiles(e) {
    e.preventDefault();
    var docFiles = e.target.files;
    this.setState(prevState => ({
          currentAward: {
            ...prevState.currentAward,
            docFiles: docFiles
          },
          dirty: true
        }));

	var label = e.target.nextElementSibling;

    var msgFilesPicked = docFiles.length > 0
        ? '已选文件：'
        : null;
    var msg = docFiles.length > 0
        ? '已选择' + docFiles.length + '个文件，请选下面附件类别'
        : label.innerHTML;
    for (var i = 0; i < docFiles.length; i++)
      msgFilesPicked += docFiles[i].name + '; ';
    label.title = msgFilesPicked;
    label.innerHTML = msg;
  }


  renderUpdates() {
    return (
            <div>
            <button
              className="badge badge-danger mr-2"
              onClick={this.deleteAward}
            >
              Delete
            </button>

            <button
              type="submit"
              className="badge badge-success"
              onClick={this.updateAward}
            >
              Update
            </button>

            <p>{this.state.message}</p>
            </div>
    );
  }

  customFilter(option, inputValue) {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

  isUploading() {
    return (this.state.progress > 0);
  }

  refreshOnReturn() {
    window.onblur = () => {window.onfocus = () => {
      window.location.reload(true);
    }};
  }

  render() {
    const { currentAward, progress } = this.state;

    return (
      <div>
        {(this.state.submitted /*&& this.state.newaward*/) ? (
          <div>
            <p>{this.state.message}</p>
            <a href="javascript:window.close();">
              <button class="btn btn-primary">关闭</button>
            </a>
{/*}
            <h4>奖项信息成功提交!</h4>
            <button class="btn btn-success" onClick={this.newAward}>
              Add
            </button>
*/}
          </div>
        ) : (
          <div class="row">
            <div class="col-sm-4">

              <div class="row">

                <div contenteditable = {this.state.readonly ? "false" : "true"} //"true"
                  onDragOver={!this.state.readonly && this.onDrag}
                  onDrop={!this.state.readonly && this.onDrop}
                  id="awardPhotoDiv"
                >
                  {this.state.readonly ? "" :
                    <p contenteditable="false">编辑奖项照片（拖拽照片文件或复制粘贴图标）</p>
                  }
                  <img id="awardPhoto" src={currentAward.photo }
                    width="320" height="320" class="responsive" readonly={this.state.readonly?"":false}
                  />
                </div>
{/*
                <div onDragOver={this.onDrag} onDrop={this.onDrop}>
                {!this.state.readonly && <p>上传照片（拖拽照片文件到下框中）</p>}
                <img src={currentAward.photo} height="200" width="300" readonly={this.state.readonly?"":false} />
                </div>
*/}

                <div class="form-group">
                <label htmlFor="name">{currentAward.xr && '向荣支持'}荣誉名称</label>
                <textarea
                readonly={(this.state.readonly || !AuthService.isAdmin()) ? "" : false}
                cols="26"
                class="form-control"
                id="name"
                required
                value={currentAward.name}
                onChange={this.onChangeName}
                name="name"
                />
                </div>
              </div>

                {this.state.readonly && AuthService.getCurrentUser() &&
                 !AuthService.getCurrentUser().schoolId && (
                <div class="box">
                  <a target="_blank" onClick={this.refreshOnReturn}
                    href={"/awards/" + currentAward.id} class="btn btn-primary mb-4"
                  >
                    编辑
                  </a>
                </div>
                )}

            </div>

            <div class="col-sm-8">
              <div class="row">

                <div class="form-group col-sm-12">
                <label htmlFor="issuer">颁奖单位</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="issuer"
                required
                value={currentAward.issuer}
                onChange={this.onChangeIssuer}
                name="issuer"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-sm-12">
                <label htmlFor="awardee">获奖人</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="awardee"
                required
                value={currentAward.awardee}
                onChange={this.onChangeAwardee}
                name="awardee"
                />
                </div>

                <div class="w-100"></div>

                <div class="form-group col-sm-12">
                <label htmlFor="description">奖项描述</label>
                <textarea
                rows="4"
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="description"
                required
                value={currentAward.description}
                onChange={this.onChangeDescription}
                name="description"
                />
                </div>

                <div class="w-100"></div>

                <div class="col-sm-8">
                  <label htmlFor="schoolId">学校</label>
                  {(!this.state.readonly && AuthService.isAdmin()) || this.state.newaward
                  ? (<Select onChange={this.onChangeSchoolId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    required
                    id="schoolId"
                    value={this.display(currentAward.schoolId)}
                    name="schoolId"
                    filterOption={this.customFilter}
                    options={this.state.schools}
                  />)
                  : (<Link
                    to={ "/schoolsView/" + currentAward.schoolId}
                    id="schoolId"
                    name="schoolId"
                    >
                      {this.displayName(currentAward.schoolId)}
                  </Link>)}
                </div>
{/*}
                    <option value="">学校编号（省-学校名）</option>
                    {this.state.schools.map((option) => (
                      <option value={option.id}>{option.code + "(" + option.region + " - " + option.name + ")"}</option>
                    ))}
                  </Select>
*/}

                <div class="w-100"></div>

                <div class="select-container form-group col-sm-4">
                <label htmlFor="category">奖项级别</label>
                <select onChange={this.onChangeCategory}
                disabled={this.state.readonly ? "disabled" : false}
                class="form-control"
                id="category"
                required
                value={currentAward.category}
                onChange={this.onChangeCategory}
                name="category"
                >
                <option value="">请选择</option>
                {this.state.categories.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>

                <div class="select-container form-group col-sm-4">
                <label htmlFor="type">奖项类型</label>
                <select onChange={this.onChangeType}
                disabled={this.state.readonly ? "disabled" : false}
                class="form-control"
                id="type"
                required
                value={currentAward.type}
                onChange={this.onChangeType}
                name="type"
                >
                <option value="">请选择</option>
                {this.state.types.map((option) => (
                  <option value={option}>{option}</option>
                ))}
                </select>
                </div>
                
                <div className="col-sm-4">
                  <label htmlFor="startAt">获奖年份</label>
                  {(this.state.readonly)
                  ?<input
                     type="text"
                     id='startAt'
                     readonly=""
                     className="form-control"
                     placeholder="奖项年份"
                     value={currentAward.startAt}
                  />
                  :<YearPicker
                     yearArray={['2019', '2020']}
                     value={currentAward.startAt}
                     onSelect={this.onChangeStartAt}
                     minRange={1995}
                     maxRange={2022}
                  />
                  }
                </div>

              </div>
            </div>

            <div class="w-100"></div>

            {!this.state.readonly && (

            <div>

              {(!currentAward.xr) && <div class="form-group input-group">

                <input type="file" name="multi-files"
                multiple
                id="input-multi-files"
                class="inputfile form-control-file border"
                onChange={e => this.onChangeDocFiles(e)}
                />
                <label for="input-multi-files">请选择上传文件</label>

                <select
                  className="form-control input-group-append"
                  placeholder=""
                  value={currentAward.docCategory}
                  onChange={e => this.onChangeDocCategory(e)}
                >
                  <option value="">附件类别</option>
                  {this.state.docCategories.map((option) => (
                    <option value={option}>
                      {option}
                    </option>
                  ))}
                </select>

              </div>}

              {!this.isUploading()
              ? <div>
                <button onClick={this.saveAward} class="btn btn-primary" hidden={!this.state.newaward}>
                  提交
                </button>

                <button hidden={this.state.newaward}
                  type="submit"
                  className="btn btn-primary"
                  onClick={this.updateAward}
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

              </div>

              : <div className="progress">
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
             </div>}

            </div>)}

            <div class="w-100"></div>

            {(!currentAward.xr && !this.state.newaward) &&
            <Tabs className='mt-3'>
              <TabList>
                <Tab>更多信息 <i class="fas fa-hand-point-right"></i></Tab>
                <Tab>奖项文档</Tab>
              </TabList>
              <TabPanel>
              </TabPanel>
              <TabPanel>
                <MaterialsList
                  awardId = {currentAward.id}
                  embedded = {true}
                  readonly = {this.state.readonly}
                />
              </TabPanel>
            </Tabs>}

          </div>
        ) }
      </div>
    );
  }
}
