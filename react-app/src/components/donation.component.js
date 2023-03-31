
import React, { Component } from "react"; //For react component

import "bootstrap/dist/css/bootstrap.min.css";
//import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
//import $ from "jquery"; //Load jquery
import { Link } from "react-router-dom";
//import Select from 'react-select';
//import Input from "react-validation/build/input";
import { isEmail } from "validator";

//import YearPicker from 'react-single-year-picker';

//import ResponsesList from './responses-list.component.js';
//import DossiersList from './dossiers-list.component.js';
import DonationDataService from "../services/donation.service";
import ProjectDataService from "../services/project.service";
//import DossierDataService from "../services/dossier.service";
//import SchoolDataService from "../services/school.service";
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

export default class Donation extends Component {
  constructor(props) {
    super(props);
    this.onChangeAmount = this.onChangeAmount.bind(this);

    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeTransaction = this.onChangeTransaction.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);

    this.onChangePhoto = this.onChangePhoto.bind(this);

    //this.onChangeDescription = this.onChangeDescription.bind(this);

    this.getDonation = this.getDonation.bind(this);

    this.updateDonation = this.updateDonation.bind(this);

    this.deleteDonation = this.deleteDonation.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.saveDonation = this.saveDonation.bind(this);
    this.newDonation = this.newDonation.bind(this);

    this.state = {
      currentDonation: {
        id: null,
        donorId: null,
        transaction: null,
        type: null,
        amount: 0,
        description: "",

        startAt: new Date(), //null,
      },
      donor: {donor: null},

      photo: null,
      file: null, // for photo

      currentUser: null,

      newdonation: true,
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
    const newdonation = window.location.pathname.includes('add');
    this.setState({newdonation: newdonation});
    this.setState({readonly: window.location.pathname.includes('View')});

    if (newdonation)
      this.setState(function(prevState) {
        return {
          currentDonation: {
            ...prevState.currentDonation,
            donorId: this.props.match.params.id
          },
        };
      });

    if (!newdonation) {
      this.getDonation(this.props.match.params.id);
      //this.getDonationPhoto(this.props.match.params.id);
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
        if (this.state.projects[i].value === projectId)
          return this.state.projects[i];
      }
      return [];
    }
  }

  displayName(projectId) {
    if (this.state.projects) {
      for (var i = 0; i < this.state.projects.length; i++) {
        if (this.state.projects[i].value === projectId)
          return this.state.projects[i].label ? this.state.projects[i].label : '指定学校项目';
      }
      return '指定学校项目';
    }
  }

  getProjects(pCategoryId, startAt) {

    let params = {};
    params["pCategoryId"] = pCategoryId; //this.state.currentDonation.pCategoryId;
    params["startAt"] = startAt; // this.state.currentDonation.startAt;

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



  onChangeAmount(e) {
    const amount = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonation: {
          ...prevState.currentDonation,
          amount: amount
        },
        dirty: true
      };
    });
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonation: {
          ...prevState.currentDonation,
          description: description
        },
        dirty: true
      };
    });
  }

/** 
  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentDonation: {
        ...prevState.currentDonation,
        description: description
      },
      dirty: true
    }));
  }
*/

  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentDonation: {
        ...prevState.currentDonation,
        photo: photo
      },
      dirty: true
    }));
  }

  onChangeTransaction(e) {
    const transaction = e.target.value;

    this.setState(prevState => ({
      currentDonation: {
        ...prevState.currentDonation,
        transaction: transaction
      },
      dirty: true
    }));
  }

  onChangeType(e) {
    const type = e.target.value;

    this.setState(prevState => ({
      currentDonation: {
        ...prevState.currentDonation,
        type: type
      },
      dirty: true
    }));
  }

  onChangeStartAt(e) {
    const startAt = e.target.value;
    this.setState(function(prevState) {
      return {
        currentDonation: {
          ...prevState.currentDonation,
          startAt: startAt
        },
        dirty: true
      };
    });
  };

  getDonation(id) {
    DonationDataService.get(id)
      .then(response => {
        this.setState({
          currentDonation: response.data,
          donor: response.data.donor
        });

        //this.getDonationPhoto(id);
        console.log(response.data);

        this.getProjects(response.data.pCategoryId, response.data.startAt);

      })
      .catch(e => {
        console.log(e);
      });
  }

  getDonationPhoto(id) {
    DonationDataService.getPhoto(id)
      .then(response => {
        var imageURL = 'data:image/png;base64,' +
            new Buffer(response.data.data.photo, 'binary').toString('base64');

        this.setState(prevState => ({
          currentDonation: {
            ...prevState.currentDonation,
          },
          photo: imageURL
        }));

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newDonation() {
  this.setState(prevState => ({
    currentDonation: {
      ...prevState.currentDonation,

      id: null,
      donorId: null,

      amount: 0,
      description: "",
      transaction: null,
      type: null,
      startAt: new Date(), //null,
    },
    photo: null,
    file: null,
    submitted: false
  }));

  }

  async saveDonation() {

    let data = this.state.currentDonation;

    try {
      let response = await DonationDataService.create(data);

      await this.setState(prevState => ({
        currentDonation: {
          ...prevState.currentDonation,
          id: response.data.id,
        },
      }));

      if (this.state.file)
        await this.updatePhoto();

      this.setState({
        message: this.state.dirty ? "捐赠信息成功提交!" : "捐赠信息没有修改",
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
          message: "捐赠信息提交失败：" + resMessage,
          hasErrors: true,
        });

      console.log(e);
    };

  }

  async updateDonation() {

    let data = this.state.currentDonation;

    try {
      await DonationDataService.update(this.state.currentDonation.id, data);


      if (this.state.file)
        await this.updatePhoto();

      this.setState({
        message: this.state.dirty ? "捐赠信息成功修改!" : "捐赠信息没有修改",
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
          message: "捐赠信息修改失败：" + resMessage,
          hasErrors: true,
        });

        console.log(e);
    }
  }


  async updatePhoto() {
    var data = new FormData();
    data.append('multi-files', this.state.file, this.state.file.name);
    await DonationDataService.updatePhoto(this.state.currentDonation.id, data);
  }

  deleteDonation() {
    DonationDataService.delete(this.state.currentDonation.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/donations')
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
      currentDonation: {
        ...prevState.currentDonation,
      },
      file: file,
      dirty: true
    }));

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState(prevState => ({
      currentDonation: {
        ...prevState.currentDonation,
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
    const { currentDonation } = this.state;

    return (
      <div>
        {(this.state.submitted /*&& this.state.newdonation*/) ? (
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
                  to={"/donorsView/" + currentDonation.donorId}
                  id="donor"
                  name="donor"
                  target='_blank'
                >
                  {this.state.donor.donor}
                </Link>
                </div>

              </div>

              {this.state.readonly && AuthService.getCurrentUser() && (
                <div class="box">
                  <a target="_blank" onClick={this.refreshOnReturn}
                    href={"/donations/" + currentDonation.id} class="btn btn-primary mb-4"
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
                value={currentDonation.amount}
                onChange={this.onChangeAmount}
                name="amount"
                />
              </div>

              <div class="col-sm-4">
                <label htmlFor="startAt">日期</label>
                <input
                readonly={this.state.readonly?"":false}
                type="date"
                class="form-control"
                id="startAt"
                required
                value={currentDonation.startAt}
                onChange={this.onChangeStartAt}
                name="startAt"
                />
              </div>


              <div class="col-sm-4">
                <label htmlFor="transaction">Transaction #</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="transaction"
                required
                value={currentDonation.transaction}
                onChange={this.onChangeTransaction}
                name="transaction"
                />
              </div>

              <div class="col-sm-12">
                <label htmlFor="type">类别</label>
                <input
                readonly={this.state.readonly?"":false}
                type="text"
                class="form-control"
                id="type"
                required
                value={currentDonation.type}
                onChange={this.onChangeType}
                name="type"
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
                value={currentDonation.description}
                onChange={this.onChangeDescription}
                name="description"
                />
              </div>

            </div>
          </div>

          <div class="w-100"></div>

          {!this.state.readonly && (<div>

            <button onClick={this.saveDonation} class="btn btn-primary" hidden={!this.state.newdonation}>
              提交
            </button>

            <button hidden={this.state.newdonation}
              type="submit"
              className="btn btn-primary"
              onClick={this.updateDonation}
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
