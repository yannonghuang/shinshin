
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
import DonorDataService from "../services/donor.service";
import DossierDataService from "../services/dossier.service";
import SchoolDataService from "../services/school.service";
import ProjectDataService from "../services/project.service";
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

export default class Donor extends Component {
  constructor(props) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeDonor = this.onChangeDonor.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeBillingAddress = this.onChangeBillingAddress.bind(this);
    this.onChangeShippingAddress = this.onChangeShippingAddress.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);

    this.onChangePhoto = this.onChangePhoto.bind(this);

    this.onChangeDescription = this.onChangeDescription.bind(this);

    this.getDonor = this.getDonor.bind(this);


    this.updateDonor = this.updateDonor.bind(this);

    this.deleteDonor = this.deleteDonor.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);


    this.saveDonor = this.saveDonor.bind(this);
    this.newDonor = this.newDonor.bind(this);

    this.state = {
      currentDonor: {
        id: null,
        name: "",
        donor: '',
        email: '',
        phone: '',
        billingAddress: '',
        shippingAddress: '',
        description: "",

        designations: null
      },

      photo: null,
      file: null, // for photo

      currentUser: null,

      newdonor: true,
      readonly: true,
      message: "",
      submitted: false,

      dirty: false,

      hasErrors: false,

    };
  }

  componentDidMount() {
    const newdonor = window.location.pathname.includes('add');
    this.setState({newdonor: newdonor});
    this.setState({readonly: window.location.pathname.includes('View')});

    if (!newdonor) {
      this.getDonor(this.props.match.params.id);
      //this.getDonorPhoto(this.props.match.params.id);
    }

  }

  onChangeName(e) {
    const name = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonor: {
          ...prevState.currentDonor,
          name: name
        },
        dirty: true
      };
    });
  }

  onChangeDonor(e) {
    const donor = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonor: {
          ...prevState.currentDonor,
          donor: donor
        },
        dirty: true
      };
    });
  }

  onChangePhone(e) {
    const phone = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonor: {
          ...prevState.currentDonor,
          phone: phone
        },
        dirty: true
      };
    });
  }

  onChangeEmail(e) {
    const email = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonor: {
          ...prevState.currentDonor,
          email: email
        },
        dirty: true
      };
    });
  }

  onChangeShippingAddress(e) {
    const shippingAddress = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonor: {
          ...prevState.currentDonor,
          shippingAddress: shippingAddress
        },
        dirty: true
      };
    });
  }

  onChangeBillingAddress(e) {
    const billingAddress = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDonor: {
          ...prevState.currentDonor,
          billingAddress: billingAddress
        },
        dirty: true
      };
    });
  }

  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentDonor: {
        ...prevState.currentDonor,
        photo: photo
      },
      dirty: true
    }));
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentDonor: {
        ...prevState.currentDonor,
        description: description
      },
      dirty: true
    }));
  }


  getDonor(id) {
    DonorDataService.get(id)
      .then(response => {
        this.setState({
          currentDonor: response.data,
        });

        this.getDonorPhoto(id);
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getDonorPhoto(id) {
    DonorDataService.getPhoto(id)
      .then(response => {
        var imageURL = 'data:image/png;base64,' +
            new Buffer(response.data.data.photo, 'binary').toString('base64');

        this.setState(prevState => ({
          currentDonor: {
            ...prevState.currentDonor,
          },
          photo: imageURL
        }));

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  newDonor() {
  this.setState(prevState => ({
    currentDonor: {
      ...prevState.currentDonor,

      id: null,
      name: "",
      donor: '',
      email: '',
      phone: '',
      billingAddress: '',
      shippingAddress: '',
      description: "",
    },
    photo: null,
    file: null,
    submitted: false
  }));

  }

  async saveDonor() {

    var data = this.state.currentDonor;

    try {
      let response = await DonorDataService.create(data);

      await this.setState(prevState => ({
        currentDonor: {
          ...prevState.currentDonor,
          id: response.data.id,
        },
      }));

      if (this.state.file)
        await this.updatePhoto();

      this.setState({
        message: this.state.dirty ? "捐款人信息成功提交!" : "捐款人信息没有修改",
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
          message: "捐款人信息提交失败：" + resMessage,
          hasErrors: true,
        });

      console.log(e);
    };

  }

  async updateDonor() {

    var data = this.state.currentDonor;

    try {
      await DonorDataService.update(this.state.currentDonor.id, data);


      if (this.state.file)
        await this.updatePhoto();

      this.setState({
        message: this.state.dirty ? "捐款人信息成功修改!" : "捐款人信息没有修改",
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
          message: "捐款人信息修改失败：" + resMessage,
          hasErrors: true,
        });

        console.log(e);
    }
  }


  async updatePhoto() {
    var data = new FormData();
    data.append('multi-files', this.state.file, this.state.file.name);
    await DonorDataService.updatePhoto(this.state.currentDonor.id, data);
  }

  deleteDonor() {
    DonorDataService.delete(this.state.currentDonor.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/donors')
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
      currentDonor: {
        ...prevState.currentDonor,
      },
      file: file,
      dirty: true
    }));

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState(prevState => ({
      currentDonor: {
        ...prevState.currentDonor,
      },
      photo: reader.result
    }));
  }


  displayDesignations = () => {
    const {designations} = this.state.currentDonor;
    if (!designations) return;

    return (
      <div>
        <h5>指定捐赠：</h5>
        {
          designations.map((option, index) => {
            return (
              <div>
                <a href={"/designationsView/" + designations[index].id }>
                  {designations[index].startAt +
                    ProjectDataService.getCategory(designations[index].pCategoryId) + ', '}
                </a>
                <br/>
              </div>
            )
          })
        }
      </div>
    );
  }

  render() {
    const { currentDonor } = this.state;

    return (
      <div>
        {(this.state.submitted /*&& this.state.newdonor*/) ? (
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
                <div onDragOver={this.onDrag} onDrop={this.onDrop}>
                {!this.state.readonly && <p>上传照片（拖拽照片文件到下框中）</p>}
                <img src={this.state.photo} height="200" width="300" readonly={this.state.readonly?"":false} />
                </div>

                <div class="form-group">
                <label htmlFor="donor">捐款人</label>
                <textarea
                readonly={(this.state.readonly || !AuthService.isAdmin()) ? "" : false}
                cols="26"
                class="form-control"
                id="donor"
                required
                value={currentDonor.donor}
                onChange={this.onChangeDonor}
                name="donor"
                />
                </div>
              </div>

              {this.state.readonly && AuthService.getCurrentUser() && (
                <div class="box">
                  <a target="_blank" onClick={this.refreshOnReturn}
                    href={"/donors/" + currentDonor.id} class="btn btn-primary mb-4"
                  >
                    编辑
                  </a>
                </div>
              )}

            </div>

            <div class="col-sm-8">

              <div class="row">

              <div class="form-group col-sm-4">
                <label htmlFor="name">名字</label>
                <input
                  readonly={this.state.readonly?"":false}
                  type="text"
                  class="form-control"
                  name="name"
                  value={currentDonor.name}
                  onChange={this.onChangeName}
                />
              </div>

              <div class="form-group col-sm-4" >
                <label htmlFor="phone">手机号
                </label>
                <input
                  readonly={this.state.readonly?"":false}
                  type="text"
                  class="form-control"
                  name="phone"
                  value={currentDonor.phone}
                  onChange={this.onChangePhone}
                />
              </div>


              <div class="form-group col-sm-4"  >
                <label htmlFor="email">电子邮箱
                </label>
                <input
                  readonly={this.state.readonly?"":false}
                  type="text"
                  class="form-control"
                  name="email"
                  value={currentDonor.email}
                  onChange={this.onChangeEmail}
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
                value={currentDonor.description}
                onChange={this.onChangeDescription}
                name="description"
                />
              </div>

              <div class="form-group col-sm-6">
                <label htmlFor="billingAddress">发票地址</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="billingAddress"
                required
                value={currentDonor.billingAddress}
                onChange={this.onChangeBillingAddress}
                name="billingAddress"
                />
              </div>

              <div class="form-group col-sm-6">
                <label htmlFor="shippingAddress">发货地址</label>
                <textarea
                readonly={this.state.readonly?"":false}
                class="form-control"
                id="shippingAddress"
                required
                value={currentDonor.shippingAddress}
                onChange={this.onChangeShippingAddress}
                name="shippingAddress"
                />
              </div>


            </div>
          </div>

          <div class="w-100"></div>

          {this.state.readonly && this.displayDesignations()}

          {!this.state.readonly && (<div>

            <button onClick={this.saveDonor} class="btn btn-primary" hidden={!this.state.newdonor}>
              提交
            </button>

            <button hidden={this.state.newdonor}
              type="submit"
              className="btn btn-primary"
              onClick={this.updateDonor}
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
