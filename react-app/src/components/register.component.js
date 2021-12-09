import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import Select from 'react-select';

import AuthService from "../services/auth.service";
import SchoolDataService from "../services/school.service";

const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

const email = value => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        This is not a valid email.
      </div>
    );
  }
};

const vusername = value => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        The username must be between 3 and 20 characters.
      </div>
    );
  }
};

const vpassword = value => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        The password must be between 6 and 40 characters.
      </div>
    );
  }
};

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.getUser = this.getUser.bind(this);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeRoles = this.onChangeRoles.bind(this);
    this.onChangeSchoolId = this.onChangeSchoolId.bind(this);
    this.onChangeChineseName = this.onChangeChineseName.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeWechat = this.onChangeWechat.bind(this);
    this.onChangeStartAt = this.onChangeStartAt.bind(this);

    this.state = {
      id: null,
      username: "",
      email: "",
      password: "",
      roles: [],
      schoolId: null,
      chineseName: "",
      phone: "",
      wechat: "",
      startAt: null,

      newuser: true,

      schools: [],
      rolesFull: [],
      successful: false,
      message: "",
      readonly: true
    };
  }

  componentDidMount() {
    this.setState({readonly: window.location.pathname.includes('View')});

    this.getRoles();
    this.getSchools();
    if (this.props.match.params.id) {
      this.getUser(this.props.match.params.id);
    }
  }

  updateUser(e) {
    e.preventDefault();
    var data = {
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
      roles: this.state.roles,
      schoolId: this.state.schoolId,
      chineseName: this.state.chineseName,
      phone: this.state.phone,
      wechat: this.state.wechat,
      startAt: this.state.startAt
    };

    AuthService.update(
      this.state.id,
      data
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "The user was updated successfully!"
        });
      })
      .catch(e => {
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
          password: response.data.password,
          roles: this.getRoleNames(response.data.roles),
          schoolId: response.data.schoolId,
          chineseName: response.data.chineseName,
          phone: response.data.phone,
          wechat: response.data.wechat,
          startAt: response.data.startAt,

          newuser: false
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

  onChangeRoles(event) {
    const selected = [...event.target.selectedOptions].map(opt => opt.value);
    this.setState({
      roles: selected
    });
  }

  onChangeChineseName(e) {
    this.setState({
      chineseName: e.target.value
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

  handleRegister(e) {
    e.preventDefault();

    this.setState({
      message: "",
      successful: false
    });

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
        this.state.startAt
      ).then(
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
            message: resMessage
          });
        }
      );
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
                <div class="form-group col-md-4">
                  <label htmlFor="username">用户名</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="text"
                    class="form-control"
                    name="username"
                    value={this.state.username}
                    onChange={this.onChangeUsername}
                    validations={[required, vusername]}
                  />
                </div>

                <div class="form-group col-md-4">
                  <label htmlFor="email">电子邮箱</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="text"
                    class="form-control"
                    name="email"
                    value={this.state.email}
                    onChange={this.onChangeEmail}
                    validations={[required, email]}
                  />
                </div>

                <div class="form-group col-md-4">
                  <label htmlFor="password">密码</label>
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

                <div class="form-group col-md-4">
                  <label htmlFor="chineseName">中文名</label>
                  <Input
                    readonly={this.state.readonly?"":false}
                    type="text"
                    class="form-control"
                    name="chineseName"
                    value={this.state.chineseName}
                    onChange={this.onChangeChineseName}
                  />
                </div>

                <div class="form-group col-md-4">
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

                <div class="form-group col-md-4">
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

                <div class="form-group col-md-4">
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

                <div class="form-group col-md-4">
                  <label htmlFor="roles">角色</label>
                  <select multiple onChange={this.onChangeRoles.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="roles"
                    required
                    value={this.state.roles}
                    name="roles"
                >
                    {this.state.rolesFull.map((option) => (
                      <option value={option.name}>{option.label}</option>
                    ))}
                  </select>
                </div>


                <div class="form-group col-md-4">
                  <label htmlFor="schoolId">所属学校</label>
                  <Select onChange={this.onChangeSchoolId.bind(this)}
                    readonly={this.state.readonly?"":false}
                    class="form-control"
                    id="schoolId"
                    value={this.display(this.state.schoolId)}
                    name="schoolId"
                    options={this.state.schools}
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
