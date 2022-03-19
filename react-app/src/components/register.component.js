import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import Select from 'react-select';
import { Link } from "react-router-dom";

import queryString from 'query-string'

import emailjs, { init } from "emailjs-com";

import AuthService from "../services/auth.service";
import SchoolDataService from "../services/school.service";

init("user_xpt3ehC4nNeGJBgM579gJ");

const jwt = require("jsonwebtoken");

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

const vusername = value => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        用户名应含3至20个字节
      </div>
    );
  }
};

const vpassword = value => {
  if (value && value.length > 0 && (value.length < 6 || value.length > 40)) {
    return (
      <div className="alert alert-danger" role="alert">
        密码应含6至40个字节
      </div>
    );
  }
};


export default class Register extends Component {
  constructor(props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);
    this.createContactOnly = this.createContactOnly.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateContactOnly = this.updateContactOnly.bind(this);
    this.getUser = this.getUser.bind(this);

    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeRoles = this.onChangeRoles.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.onChangeChineseName = this.onChangeChineseName.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeWechat = this.onChangeWechat.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);
    this.onChangeContactOnly = this.onChangeContactOnly.bind(this);

    this.state = {
      id: null,
      username: "",
      email: "",
      password: null,
      roles: null,
      schoolId: null,
      chineseName: "",
      phone: "",
      wechat: "",
      startAt: null,
      createdAt: null,
      lastLogin: null,
      title: "",
      newuser: true,

      contactOnly: false,

      titles: [],
      schools: [],
      rolesFull: [],
      successful: false,
      message: "",
      readonly: true
    };
  }

  componentDidMount() {
    this.setState({readonly: window.location.pathname.includes('View')});

    if (this.props.match && this.props.match.params.id) {
      this.setState({newuser: false});
      this.getUser(this.props.match.params.id);
    }

    const qString = queryString.parse(this.props.location.search);
    if (qString && qString.schoolId)
      this.setState({schoolId: qString.schoolId, contactOnly: true});

    this.getRoles();
    this.getSchools();
    this.getTitles();

  }


  updateContactOnly() {
    this.setState({
      message: "",
      successful: false
    });

    var data = {
        email: this.state.email,
        roles: this.state.roles,
        schoolId: this.state.schoolId,
        chineseName: this.state.chineseName,
        phone: this.state.phone,
        wechat: this.state.wechat,
        title: this.state.title,
        contactOnly: this.state.contactOnly
    };

    AuthService.updateContactOnly(
      this.state.id,
      data
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "用户信息成功更新!",
          successful: true
        });
      })
      .catch(e => {
        this.setState({
          message: "用户信息修改失败：" + e,
          successful: false
        });
        console.log(e);
      });
  }

  updateUser(e) {
    e.preventDefault();

    if(this.state.contactOnly) return this.updateContactOnly();

    this.setState({
      message: "",
      successful: false
    });

    if (!this.validateSchool()) return;

    this.form.validateAll();
    if (this.checkBtn.context._errors.length !== 0)
        return;

    var data = {
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
      roles: this.state.roles,
      schoolId: this.state.schoolId,
      chineseName: this.state.chineseName,
      phone: this.state.phone,
      wechat: this.state.wechat,
      startAt: this.state.startAt,
      title: this.state.title
    };

    AuthService.update(
      this.state.id,
      data
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "用户信息成功更新!",
          successful: true
        });
      })
      .catch(e => {
        this.setState({
          message: "用户信息修改失败：" + e,
          successful: false
        });
        console.log(e);
      });
  }

  getRoleNames(roles) {
      const names = [];
      if (roles) {
        for (let i = 0; i < roles.length; i++){
          names.push(roles[i].name);
        }
      }
      return names;
  }

  getUser(id) {
    AuthService.get(id)
      .then(response => {
        this.setState({
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          //password: response.data.password,
          roles: this.getRoleNames(response.data.roles),
          schoolId: response.data.schoolId,
          chineseName: response.data.chineseName,
          phone: response.data.phone,
          wechat: response.data.wechat,
          startAt: response.data.startAt,
          createdAt: response.data.createdAt,
          lastLogin: response.data.lastLogin,
          title: response.data.title,

          contactOnly: response.data.contactOnly,

          //newuser: false
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getRoles() {
    AuthService.getRoles()
      .then(response => {
        this.setState({
          rolesFull: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
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
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getTitles() {
    AuthService.getUserTitles()
      .then(response => {
        this.setState({
          titles: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  onChangeRoles(event) {
    const selected = [...event.target.selectedOptions].map(opt => opt.value);
    this.setState({
      roles: selected
    });
  }

  onChangeContactOnly(e) {
    this.setState({
      contactOnly: e.target.checked
    });
  }

  onChangeChineseName(e) {
    this.setState({
      chineseName: e.target.value
    });
  }

  onChangeTitle(e) {
    this.setState({
      title: e.target.value
    });
  }

  onChangePhone(e) {
    this.setState({
      phone: e.target.value
    });
  }

  onChangeWechat(e) {
    this.setState({
      wechat: e.target.value
    });
  }

  onChangeStartAt(e) {
    this.setState({
      startAt: e.target.value
    });
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangeSchoolId(e) {
    this.setState({
      schoolId: e.value //.target.value
    });
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  createContactOnly() {

      AuthService.createContactOnly({
        email: this.state.email,
        roles: this.state.roles,
        schoolId: this.state.schoolId,
        chineseName: this.state.chineseName,
        phone: this.state.phone,
        wechat: this.state.wechat,
        title: this.state.title,
        contactOnly: this.state.contactOnly
      }).then(
        response => {
          this.setState({
            message: response.data.message,
            successful: true
          });
        },
        error => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            successful: false,
            message: '创建用户异常，' + resMessage
          });
        }
      );
  }

  validateSchool() {
    const user = AuthService.getCurrentUser(); //localStorage.getItem('user');

    if ((!user && !this.state.schoolId) ||
        (user && user.schoolId && !this.state.schoolId)){
      this.setState({
        message: "请选择学校",
        successful: false
      });
      return false;
    }

    return true;
  }

  handleRegister(e) {
    e.preventDefault();

    if (this.state.contactOnly) return this.createContactOnly();

    this.setState({
      message: "",
      successful: false
    });

    if (!this.state.password) {
      this.setState({
        message: '密码是必填项。。。'
      });
      return;
    }

    if (!this.validateSchool()) return;

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {

      AuthService.register(
        this.state.username,
        this.state.email,
        this.state.password,
        this.state.roles,
        this.state.schoolId,
        this.state.chineseName,
        this.state.phone,
        this.state.wechat,
        this.state.startAt,
        this.state.title
      ).then(
        response => {
          this.emailVerification();

          this.setState({
            message: response.data.message,
            successful: true
          });
        },
        error => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            successful: false,
            message: '创建用户异常，密码是必填项。。。' + resMessage
          });
        }
      );
    }
  }

  emailVerification() {
    if (this.state.email) {
      var token = jwt.sign({ email: this.state.email }, "config.secret", {
        expiresIn: 900 // 15 minutes
      });

      const url = window.location.host;
      var templateParams = {
            to: this.state.email,
            username: this.state.chineseName ?this.state.chineseName : this.state.username,
            link: url + "/login?token=" + token
            //link: "http://localhost:8081/login?token=" + token
      };

      emailjs.send("icloud_2021_12_27","template_vye2wfs", templateParams)
      .then((result) => {
        console.log(result.text);
        this.setState({
          message: "注册确认邮件已发至您的邮箱 。。。",
          successful: true
        });
      }, (error) => {
        console.log(error.text);
        this.setState({
          message: error.text,
          successful: false
        });
      });
    }
  }

  render() {

    return (
      <div>
{/*}
        <div className="card card-container">
*/}
          <Form
            onSubmit={this.state.newuser ? this.handleRegister : this.updateUser}
            ref={c => {
              this.form = c;
            }}
          >
          {!this.state.successful && (
            <div class="row">
{/*}
                <div class="form-group col-sm-4">
                  <label htmlFor="contactOnly"><h5>仅联络方式(信息不作校验)</h5></label>
                  <Input
                    readonly={!this.state.newuser?"":false}
                    type="checkbox"
                    class="form-control"
                    name="contactOnly"
                    checked={this.state.contactOnly}
                    onChange={this.onChangeContactOnly}
                  />
                </div>

                <div class="w-100"></div>
*/}
                <div class="form-group col-sm-4" hidden={this.state.contactOnly}>
                  <label htmlFor="username">用户名</label>
                  <Input
                    readonly={!this.state.newuser?"":false}
                    type="text"
                    class="form-control"
                    name="username"
                    value={this.state.username}
                    onChange={this.onChangeUsername}
                    validations={[required, vusername]}
                  />
                </div>

                <div class="form-group col-sm-4">
                  <label htmlFor="email">电子邮箱</label>
                  <Input
                    readonly={!this.state.newuser?"":false}
                    type="text"
                    class="form-control"
                    name="email"
                    value={this.state.email}
                    onChange={this.onChangeEmail}
                    validations={[required, email]}
                  />
                </div>


                <div class="form-group col-sm-4" hidden={this.state.contactOnly}>
                  <label htmlFor="password">密码</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="password"
                    class="form-control"
                    name="password"
                    value={this.state.password}
                    onChange={this.onChangePassword}
                    validations={[vpassword]}
                  />
                </div>

                <div class="form-group col-sm-4">
                  <label htmlFor="chineseName">中文名</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="text"
                    class="form-control"
                    required
                    name="chineseName"
                    value={this.state.chineseName}
                    onChange={this.onChangeChineseName}
                  />
                </div>

                <div class="form-group col-sm-4">
                  <label htmlFor="phone">电话</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="text"
                    class="form-control"
                    name="phone"
                    value={this.state.phone}
                    onChange={this.onChangePhone}
                  />
                </div>

                <div class="form-group col-sm-4">
                  <label htmlFor="wechat">微信</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="text"
                    class="form-control"
                    name="wechat"
                    value={this.state.wechat}
                    onChange={this.onChangeWechat}
                  />
                </div>
{/*
                <div class="form-group col-sm-4">
                  <label htmlFor="startAt">加入时间</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="date"
                    class="form-control"
                    name="startAt"
                    value={this.state.startAt}
                    onChange={this.onChangeStartAt}
                  />
                </div>
*/}
                <div class="form-group col-sm-4" hidden={!this.state.schoolId}>
                  <label htmlFor="title">职务</label>
                  <select onChange={this.onChangeTitle.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="title"
                    value={this.state.title}
                    name="title"
                >
                    <option value="">{this.state.readonly ? '' : '请选择' }</option>
                    {this.state.titles.map((option) => (
                      <option value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {AuthService.getCurrentUser() && AuthService.getCurrentUser().roles.includes("ROLE_ADMIN") &&
                (<div class="form-group col-sm-4" hidden={this.state.contactOnly}>
                  <label htmlFor="roles">角色</label>
                  <select onChange={this.onChangeRoles.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="roles"
                    value={this.state.roles}
                    name="roles"
                >
                    {this.state.rolesFull.map((option) => (
                      <option value={option.name}>{option.label}</option>
                    ))}
                  </select>
                </div>)}

                <div class="form-group col-sm-4">
                  <label htmlFor="schoolId">所属学校</label>
                  {!this.state.readonly
                  ? (<Select onChange={this.onChangeSchoolId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="schoolId"
                    value={this.display(this.state.schoolId)}
                    name="schoolId"
                    options={this.state.schools}
                  />)
                  : (<Link
                    to={ "/schoolsView/" + this.state.schoolId}
                    id="schoolId"
                    name="schoolId"
                  >
                    {this.displayName(this.state.schoolId)}
                  </Link>)}
                </div>


                <div class="form-group col-sm-4" hidden={this.state.contactOnly}>
                  <label htmlFor="lastLogin">上次登录时间</label>
                  <Input
                    readonly={""}
                    type="date"
                    class="form-control"
                    name="lastLogin"
                    value={this.state.lastLogin}
                  />
                </div>

                <div class="form-group col-sm-4">
                  <label htmlFor="createdAt">创建时间</label>
                  <Input
                    readonly={""}
                    type="date"
                    class="form-control"
                    name="createdAt"
                    value={this.state.createdAt}
                  />
                </div>

                <div class="w-100"></div>

                {this.state.readonly ? '' : (
                <div class="form-group">
                  <button className="btn btn-primary btn-block">{this.state.newuser?'创建新用户':'修改用户'}</button>
                </div>
                )}
            </div>
          )}

            {this.state.message && (
              <div class="form-group">
                <div
                  className={
                    this.state.successful
                      ? "alert alert-success"
                      : "alert alert-danger"
                  }
                  role="alert"
                >
                  {this.state.message}
                </div>
              </div>
            )}
            <CheckButton
              style={{ display: "none" }}
              ref={c => {
                this.checkBtn = c;
              }}
            />
          </Form>
{/*}
        </div>
*/}
      </div>
    );
  }
}
