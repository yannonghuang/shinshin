import React, { Component, createRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
import Divider from '@material-ui/core/Divider';
import Select from 'react-select';

import AuthService from "./../services/auth.service";
import UserDataService from "../services/auth.service";

import BatchDataService from "../services/batch.service";

export default class Batch extends Component {
  constructor(props) {
    super(props);

    this.onChangeDocFiles = this.onChangeDocFiles.bind(this);
    this.upload = this.upload.bind(this);

    this.state = {
      currentBatch: {
        docFiles: null,
      },
      message: "",
      submitted: false,

      dirty: false,

      progress: 0,
      hasErrors: false,

      type: null
    };

  }

  componentDidMount() {
    this.setState({type:
      (new URLSearchParams(window.location.search)).get('type')
    });
  }

  upload() {
    var data = new FormData();
    for (var i = 0; i < (this.state.currentBatch.docFiles
                        ? this.state.currentBatch.docFiles.length : 0); i++) {
      data.append('multi-files', this.state.currentBatch.docFiles[i],
        this.state.currentBatch.docFiles[i].name);
    }
    BatchDataService.batch(this.state.type, data, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
    .then(response => {
      this.setState(prevState => ({
        message: prevState.message + response.data, //(this.state.currentBatch.docFiles ? " 批量更新成功!" : ""),
        submitted: true,
        hasErrors: false,
      }));
      console.log(response.data);
    })
    .catch(e => {
      this.setState({
        message: "批量更新失败：" + e,
      });
      console.log(e);
    });
  }


  onChangeDocFiles(e) {
    e.preventDefault();
    var docFiles = e.target.files;
    this.setState(prevState => ({
      currentBatch: {
        ...prevState.currentBatch,
        docFiles: docFiles
      },
    }));

	var label = e.target.nextElementSibling;

    var msgFilesPicked = docFiles.length > 0
        ? '已选文件：'
        : null;
    var msg = docFiles.length > 0
        ? '已选择' + docFiles.length + '个文件'
        : label.innerHTML;
    for (var i = 0; i < docFiles.length; i++)
      msgFilesPicked += docFiles[i].name + '; ';
    label.title = msgFilesPicked;
    label.innerHTML = msg;
  }


  isUploading() {
    return (this.state.progress > 0);
  }

  render() {
    const { currentBatch, progress } = this.state;

    return (
      <div>
        {(this.state.submitted ) ? (
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
                <h4>批量
                {this.state.type === 'donations'
                ? '捐款'
                : this.state.type === 'projects'
                  ? '学校项目'
                  : ''
                }
                  更新
                </h4>

              </div>
            </div>

            <div class="w-100"></div>


            <div>

            <input type="file" name="multi-files"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" //, .csv, application/vnd.ms-excel"
              id="input-multi-files"
              class="inputfile form-control-file border"
              onChange={this.onChangeDocFiles}
            />
            <label for="input-multi-files">请选择上传文件</label>

            {!this.isUploading()
            ? <div>
              <button onClick={this.upload} class="btn btn-primary">
                提交
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

            </div>

          </div>
        )}
      </div>
    );
  }
}
