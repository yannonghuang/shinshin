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
      departments: [],
      schools: [],
      rolesFull: [],
      successful: false,
      message: "",
      readonly: true,

      dirty: false,
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
    this.getDepartments();
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
          message: this.state.dirty ? "联络人信息成功更新!" : "联络人信息没有更改",
          successful: true
        });
      })
      .catch(e => {
        this.setState({
          message: "联络人信息修改失败：" + e,
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

    if (!this.validateChineseName()) return;

    if (!this.validatePhone()) return;

    if (!this.validateTitle()) return;

    if (!this.validateSchool()) return;

    //this.form.validateAll();
    //if (this.checkBtn.context._errors.length !== 0)
      //return;

    var data = {
      username: this.state.username,
      email: this.state.email,
      //password: this.state.password,
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
          message: this.state.dirty ? "用户信息成功更新!" : "用户信息没有更改",
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
        if (this.state.schools[i].value === schoolId)
          return this.state.schools[i];
      }
      return [];
    }
  }

  displayName(schoolId) {
    if (this.state.schools) {
      for (var i = 0; i < this.state.schools.length; i++) {
        if (this.state.schools[i].value === schoolId)
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

  getDepartments() {
    AuthService.getVolunteerDepartments()
      .then(response => {
        this.setState({
          departments: response.data
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
      roles: selected,
      dirty: true
    });
  }

  onChangeContactOnly(e) {
    this.setState({
      contactOnly: e.target.checked,
      dirty: true
    });
  }

  onChangeChineseName(e) {
    this.setState({
      chineseName: e.target.value,
      dirty: true
    });
  }

  onChangeTitle(e) {
    let selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    let value = "";
    if (selectedOptions) {
      for (var i = 0; i < selectedOptions.length; i++) {
        value += selectedOptions[i] + ",";
      }
      value = value.slice(0, -1);
    }
    this.setState({
      title: value,
      dirty: true
    });
  }

  displayTitle(title) {
    if (!title) return [];

    return title.split(',');
  }

  SAVE_onChangeTitle(e) {
    this.setState({
      title: e.target.value,
      dirty: true
    });
  }

  onChangePhone(e) {
    this.setState({
      phone: e.target.value,
      dirty: true
    });
  }

  onChangeWechat(e) {
    this.setState({
      wechat: e.target.value,
      dirty: true
    });
  }

  onChangeStartAt(e) {
    this.setState({
      startAt: e.target.value,
      dirty: true
    });
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value,
      dirty: true
    });
  }

  onChangeSchoolId(e) {
    this.setState({
      schoolId: e.value, //.target.value
      dirty: true
    });
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value,
      dirty: true
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value,
      dirty: true
    });
  }

  getRelevantRoles(isSchoolUser) {
    let schoolRoles = [];
    let ssRoles = [];

    if (!this.state.rolesFull) return [];

    for (var i = 0; i < this.state.rolesFull.length; i++)
      if (this.state.rolesFull[i].name === 'user')
        schoolRoles.push(this.state.rolesFull[i]);
      else
        ssRoles.push(this.state.rolesFull[i]);

    if (isSchoolUser)
      return schoolRoles;
    else
      return ssRoles;
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
            message: '创建联络人成功', //response.data.message,
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
            message: '创建联络人异常，' + resMessage
          });
        }
      );
  }

  validatePhone() {
    if (AuthService.getCurrentUser()) return true; // bypass cell number validation if current user is a shinshin user

    if (!this.state.phone) {
      this.setState({
        message: "必须填写手机号",
        successful: false
      });
      return false;
    }

    return true;
  }

  validateChineseName() {
    if (!this.state.chineseName) {
      this.setState({
        message: "必须填写姓名",
        successful: false
      });
      return false;
    }
    return true;
  }

  validateTitle() {

    if (this.state.schoolId && !this.state.title) {
      this.setState({
        message: "请选择职务",
        successful: false
      });
      return false;
    }

    return true;
  }

  validateSchool() {
    const user = AuthService.getCurrentUser(); //localStorage.getItem('user');

    if ((!user && !this.state.schoolId) ||
        (user && user.schoolId && !this.state.schoolId)) {
      this.setState({
        message: "请选择学校",
        successful: false
      });
      return false;
    }

    return true;
  }

  async validatePrincipal() {
    if (AuthService.getCurrentUser() || !this.state.schoolId) return true;

    try {
      let response = await SchoolDataService.getPrincipal(this.state.schoolId);

      let principal = prompt("请输入校长姓名", "");

      console.log(response);
      console.log('user input principal: ' + principal);
      console.log('db retrieved principal: ' + response.data.principal);

      if (!principal) return false;

      if (principal === response.data.principal)
        return true;
      else {
        alert('校长姓名输入有误！');
        return false;
      }
    } catch(e) {
      alert(e.message);
    }
    return false;
  }

  async handleRegister(e) {
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

    if (!this.validateChineseName()) return;

    if (!this.validatePhone()) return;

    if (!this.validateTitle()) return;

    if (!this.validateSchool()) return;
    let vp = await this.validatePrincipal();
    if (!vp) return;

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

          console.log(response.data.message);
          this.setState({
            message: "成功创建用户账号，待邮件确认。。。", //response.data.message,
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
            message: resMessage
          });
        }
      );
    }
  }

  emailVerification() {
    if (this.state.email) {
      var token = jwt.sign({ email: this.state.email }, "config.secret", {
        expiresIn: AuthService.getCurrentUser()
                    ? 60 * 60 * 24 * 7 // one week
                    : 60 * 120 // 2小时
      });

      //const url = window.location.host;
      const url = window.location.protocol + '//' + 'xxgl.shinshinfoundation.org'; //window.location.host; //https://xxgl.shinshinfoundation.org
      var templateParams = {
            to: this.state.email,
            username: (this.state.chineseName ? this.state.chineseName : this.state.username)
                + '(登录名: ' + this.state.username + ')',
            link: url + "/login?token=" + token,
            //link: "http://localhost:8081/login?token=" + token
            validity: AuthService.getCurrentUser() ? "一周" : "2小时"
      };

//      emailjs.send("icloud_2021_12_27","template_vye2wfs", templateParams)
      emailjs.send("Gmail 2022","template_email_check", templateParams)
      .then((result) => {
        console.log(result.text);
        this.setState({
          message: "注册确认邮件已发至" +
                    (AuthService.getCurrentUser() ? "新用户" : "您的注册") +
                    "邮箱 。。。",
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

  customFilter(option, inputValue) {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

  render() {
    return (
      <div>
        {this.state.successful

        ? (<div>
          <p>{this.state.message}</p>
          {AuthService.getCurrentUser()
            ? <a href="javascript:window.close();"><button class="btn btn-primary">关闭</button></a>
            : <Link to={"/"}><button class="btn btn-primary">返回</button></Link>
          }
          </div>)

        : (
          <div>
            <Form
              ref={c => {
                this.form = c;
              }}
            >

              <div className="row">

              <div class="form-group col-sm-4" hidden={this.state.contactOnly}>
                <label htmlFor="username">用户名<span class="required">*</span>
                </label>
                <Input
                  readonly={(!this.state.newuser) ? "" : false}
                  type="text"
                  class="form-control"
                  name="username"
                  value={this.state.username}
                  onChange={this.onChangeUsername}
                  validations={[required, vusername]}
                />
              </div>

              <div class="form-group col-sm-4">
                <label htmlFor="chineseName">姓名<span class="required">*</span>
                </label>
                <Input
                  readonly={this.state.readonly?"":false}
                  type="text"
                  class="form-control"

                  name="chineseName"
                  value={this.state.chineseName}
                  onChange={this.onChangeChineseName}
                  validations={[required]}
                />
              </div>

{/*
              <div class="form-group col-sm-4" hidden={AuthService.getCurrentUser()} >
                <label htmlFor="phone">手机号<span class="required">*</span>
                </label>
                <Input
                  readonly={this.state.readonly?"":false}
                  type="text"
                  class="form-control"
                  name="phone"
                  value={this.state.phone}
                  onChange={this.onChangePhone}
                  validations={[required]}
                />
              </div>
*/}
              <div class="form-group col-sm-4" >
                <label htmlFor="phone">手机号<span hidden={AuthService.getCurrentUser()} class="required">*</span>
                </label>
                <Input
                  readonly={this.state.readonly?"":false}
                  type="text"
                  class="form-control"
                  name="phone"
                  value={this.state.phone}
                  onChange={this.onChangePhone}
                />
              </div>

              <div class="form-group col-sm-4" hidden={this.state.contactOnly} >
                <label htmlFor="email">电子邮箱<span class="required">*</span>
                </label>
                <Input
                  readonly={!this.state.contactOnly && !this.state.newuser ? "" : false}
                  type="text"
                  class="form-control"
                  name="email"
                  value={this.state.email}
                  onChange={this.onChangeEmail}
                  validations={[required, email]}
                />
              </div>
              <div class="form-group col-sm-4" hidden={!this.state.contactOnly} >
                <label htmlFor="email">电子邮箱
                </label>
                <Input
                  readonly={!this.state.contactOnly && !this.state.newuser ? "" : false}
                  type="text"
                  class="form-control"
                  name="email"
                  value={'请输入电子邮箱。。。' /*this.state.email*/}
                  onChange={this.onChangeEmail}
                />
              </div>

              <div class="form-group col-sm-4" hidden={this.state.contactOnly || !this.state.newuser}>
                <label htmlFor="password">密码<span class="required">*</span>
                </label>
                <Input
                  readonly={this.state.readonly?"":false}
                  type="password"
                  class="form-control"
                  name="password"
                  value={this.state.password}
                  onChange={this.onChangePassword}
                  validations={[required, vpassword]}
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

              <div class="form-group col-sm-4" hidden={!this.state.schoolId && AuthService.getCurrentUser()}>
                <label htmlFor="title">职务</label>
                <select required
                  onChange={this.onChangeTitle.bind(this)}
                  disabled={this.state.readonly ? "disabled" : false}
                  class="form-control"
                  id="title"
                  value={this.displayTitle(this.state.title)}
                  name="title"
                >
                  <option value="">{this.state.readonly ? '' : '请选择' }</option>
                  {this.state.titles.map((option) => (
                    <option value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div class="form-group col-sm-4" title={'可多选：按Command(Mac系统)或Ctrl(windows系统)键'}
                hidden={this.state.schoolId || !AuthService.getCurrentUser()}
              >
                <label htmlFor="title">义工用户职位（所属部门）</label>
                <select required
                  onChange={this.onChangeTitle.bind(this)}
                  disabled={/*this.state.readonly*/ !AuthService.isAdmin() ? "disabled" : false}
                  class="form-control"
                  id="title"
                  value={this.displayTitle(this.state.title)}
                  name="title"
                  multiple
                >
                  <option value="">{this.state.readonly ? '' : '请选择' }</option>
                  {this.state.departments.map((option) => (
                    <option value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {AuthService.getCurrentUser() &&
              (<div class="form-group col-sm-4" hidden={this.state.contactOnly}>
                <label htmlFor="roles">角色</label>
                <select onChange={this.onChangeRoles.bind(this)}
                  disabled={this.state.readonly || !AuthService.getCurrentUser().roles.includes("ROLE_ADMIN")
                             ? "disabled"
                             : false
                           }
                  class="form-control"
                  id="roles"
                  value={this.state.roles}
                  name="roles"
                >
                  <option value="">请选择角色</option>
                  {//this.state.rolesFull.map((option) => (
                    this.getRelevantRoles(this.state.schoolId).map((option) => (
                    <option value={option.name}>{option.label}</option>
                  ))}
                </select>
              </div>)}

              <div class="form-group col-sm-4"
                hidden={
                  (this.state.roles && this.state.roles.includes("volunteer")) ||
                  (this.state.roles && this.state.roles.includes("admin")) ||
                  !(
                    (this.state.readonly && this.state.schoolId) ||
                    (!this.state.readonly && (this.state.newuser ||
                      (AuthService.getCurrentUser() && AuthService.getCurrentUser().roles.includes("ROLE_ADMIN"))))
                  )
                }
              >
                <label htmlFor="schoolId">所属学校
                </label>
                {!this.state.readonly && !this.state.schoolId
                ? (<Select onChange={this.onChangeSchoolId.bind(this)}
                  class="form-control"
                  id="schoolId"
                  value={this.display(this.state.schoolId)}
                  name="schoolId"
                  filterOption={this.customFilter}
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

              <div class="form-group col-sm-4" hidden={this.state.newuser}>
                <label htmlFor="lastLogin">上次登录时间</label>
                <Input
                  readonly={""}
                  type="date"
                  class="form-control"
                  name="lastLogin"
                  value={this.state.lastLogin}
                />
              </div>

              <div class="form-group col-sm-4" hidden={this.state.newuser}>
                <label htmlFor="createdAt">创建时间</label>
                <Input
                  readonly={""}
                  type="date"
                  class="form-control"
                  name="createdAt"
                  value={this.state.createdAt}
                />
              </div>

              </div>


              <CheckButton
                style={{ display: "none" }}
                ref={c => {
                  this.checkBtn = c;
                }}
              />

            </Form>


            <div class="w-100"></div>
            {!this.state.readonly && (
              <button className="btn btn-primary"
                onClick={this.state.newuser ? this.handleRegister : this.updateUser}
              >
                {this.state.newuser
                  ? this.state.contactOnly
                    ? '创建新联络人'
                    : '创建新用户'
                  : this.state.contactOnly
                    ? '修改联络人'
                    : '修改用户'
                }
              </button>
            )}

            {!this.state.contactOnly && !this.state.readonly && !this.state.newuser &&
            (AuthService.isAdmin() || this.state.username === AuthService.getCurrentUser().username) &&
              <Link
                to={'/reset?token=' +
                  jwt.sign({ email: this.state.email }, "config.secret", {
                    expiresIn: 900 // 15 minutes
                  })
                }
                className="btn btn-primary  ml-2">
                  重置密码
              </Link>
            }

            {AuthService.getCurrentUser() && !this.state.readonly && (<button
              className="btn btn-primary ml-2"
              onClick={(e) => {
                  //e.preventDefault();
                  if (!this.state.dirty || window.confirm("您确定要取消吗 ?"))
                    window.close()
                }
              }
            >
              取消
            </button>)}

            {!this.state.readonly && this.state.contactOnly && (
              <button className="btn btn-primary ml-2"
                onClick={e => {
                    this.setState({contactOnly: false, newuser: true})
                  }
                }
              >
                创建新用户
              </button>
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

          </div>
        )}
      </div>
    );
  }
}
