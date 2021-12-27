import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import AuthService from "../services/auth.service";

const jwt = require("jsonwebtoken");

const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        必须填写!
      </div>
    );
  }
};

export default class Reset extends Component {
  constructor(props) {
    super(props);
    this.handleReset = this.handleReset.bind(this);
    this.onChangePasswordVerified = this.onChangePasswordVerified.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);

    this.state = {
      passwordVerified: "",
      password: "",
      email: "",
      loading: false,
      message: ""
    };
  }

  componentDidMount() {
    const search = this.props.location.search;
    const token = new URLSearchParams(search).get('token');

    var email = null;
    jwt.verify(token, "config.secret", (err, decoded) => {
      if (!err)
        email = decoded.email;
    });

    this.setState({
      email: email
    });
  }

  onChangePasswordVerified(e) {
    this.setState({
      passwordVerified: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  handleReset(e) {
    e.preventDefault();

    this.form.validateAll();

    if (this.state.email && (this.state.passwordVerified === this.state.password)) {
      AuthService.reset(this.state.email, this.state.password)
      .then(response => {
        alert('您的密码已经成功重置');
        //this.props.history.push("/profile");
        this.props.history.push("/login");
        window.location.reload();
        this.setState({
          message: '您的密码已经成功重置！'
        });
      })
      .catch(error => {
        this.setState({
          message: JSON.stringify(error)
        });
      });

    } else {
      this.setState({
        message: '请再次确认密码。。。' + this.state.email
      });
    }
  }


  render() {
    return (
    <div>

      <div className="col-md-12">
        <div className="card card-container">
          <img
            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
            alt="profile-img"
            className="profile-img-card"
          />

          <Form
            onSubmit={this.handleReset}
            ref={c => {
              this.form = c;
            }}
          >

            <div className="form-group">
              <label htmlFor="password">新密码</label>
              <Input
                type="password"
                className="form-control"
                name="password"
                value={this.state.password}
                onChange={this.onChangePassword}
                validations={[required]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordVerified">新密码再确认</label>
              <Input
                type="password"
                className="form-control"
                name="passwordVerified"
                value={this.state.passwordVerified}
                onChange={this.onChangePasswordVerified}
                validations={[required]}
              />
            </div>

            <div className="form-group">
              <button
                className="btn btn-primary btn-block"
                disabled={this.state.loading}
              >
                {this.state.loading && (
                  <span className="spinner-border spinner-border-sm"></span>
                )}
                <span>提交</span>
              </button>
            </div>

            {this.state.message && (
              <div className="form-group">
                <div className="alert alert-danger" role="alert">
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
        </div>
      </div>

    </div>
    );
  }
}
