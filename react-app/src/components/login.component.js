import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import emailjs, { init } from "emailjs-com";

import AuthService from "../services/auth.service";

init("user_xpt3ehC4nNeGJBgM579gJ");

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

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onReset = this.onReset.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleEmailVerification = this.handleEmailVerification.bind(this);
    this.togglePasswordShown = this.togglePasswordShown.bind(this);

    this.state = {
      username: "",
      password: "",
      email: "",
      isReset: false,
      loading: false,
      message: "",
      passwordShown: false
    };
  }

  componentDidMount() {
    const search = this.props.location.search;
    const username = new URLSearchParams(search).get('username');
    const token = new URLSearchParams(search).get('token');

    if (token) { // email verification
      var email = null;
      jwt.verify(token, "config.secret", (err, decoded) => {
        if (!err)
          email = decoded.email;
      });
      if (email)
        this.handleEmailVerification(email);
    }

    if (username)
      this.setState({
        username: username
      });
  }

  togglePasswordShown() {
    this.setState({
      passwordShown: this.state.passwordShown? false : true
    });
  };

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value
    });
  }

  onReset() {
    this.setState({
      isReset: true
    });
  }


  handleEmailVerification(email) {
      AuthService.findByEmail(email)
      .then(r => {
        this.setState({
          username: r.data.username
        });
      })
      .catch(e => {
        this.setState({
          message: e.toString()
        });
      });
  }

  handleReset(e) {
    e.preventDefault();

    if (this.state.email) {
      var token = jwt.sign({ email: this.state.email }, "config.secret", {
        expiresIn: 900 // 15 minutes
      });

      AuthService.findByEmail(this.state.email)
      .then(r => {

        var templateParams = {
              to: this.state.email,
              username: r.data.chineseName ? r.data.chineseName : r.data.username,
              link: "http://localhost:8081/reset?token=" + token
        };

        emailjs.send("icloud_2021_12_27","template_ae0k3bj", templateParams)
        .then((result) => {
          console.log(result.text);
          this.setState({
            message: "邮件已发至您的邮箱，请在15分钟内完成密码重置。。。"
          });
        }, (error) => {
          console.log(error.text);
          this.setState({
            message: error.text
          });
        });
      })
      .catch(e => {
        this.setState({
          message: e.toString()
        });
      });
    }
  }

  handleLogin(e) {
    e.preventDefault();

    this.setState({
      message: "",
      loading: true
    });

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      AuthService.login(this.state.username, this.state.password).then(
        () => {
          //this.props.history.push("/profile");
          this.props.history.push("/schools");
          window.location.reload();
        },
        error => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            loading: false,
            message: resMessage
          });
        }
      );
    } else {
      this.setState({
        loading: false
      });
    }
  }


  render() {
    return (
    <div>
    { /* AuthService.getCurrentUser() */ AuthService.isValid() ? (this.props.history.push('/schools')) : (
      <div className="col-md-12">
        <div className="card card-container">
          <img
            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
            alt="profile-img"
            className="profile-img-card"
          />

          <Form
            onSubmit={this.state.isReset? this.handleReset : this.handleLogin}
            ref={c => {
              this.form = c;
            }}
          >
            {this.state.isReset
            ? (
              <div className="form-group">
                <label htmlFor="email">您的注册邮箱</label>
                <Input
                  type="text"
                  className="form-control"
                  name="email"
                  value={this.state.email}
                  onChange={this.onChangeEmail}
                  validations={[required]}
                />
              </div>
            )
            : (<div>
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <Input
                  type="text"
                  className="form-control"
                  name="username"
                  value={this.state.username}
                  onChange={this.onChangeUsername}
                  validations={[required]}
                />
              </div>

              <div className="form-group">

                <label htmlFor="password">密码</label>
                <Input
                  type={this.state.passwordShown ? "text" : "password"}
                  className="form-control"
                  name="password"
                  value={this.state.password}
                  onChange={this.onChangePassword}
                  validations={[required]}
                />

                <div className="mt-2" >
                  <button type="button" style={{ float: "left", width: "12%", background: "transparent", border: "none !important" }}
                    onClick={this.togglePasswordShown}>
                    {this.state.passwordShown
                      ? (<i className= "fas fa-eye-slash"></i>)
                      : (<i className= "fas fa-eye"></i>)
                    }
                  </button>

                  <button
                    style={{ float: "right", width: "25%" }}
                    className="btn btn-primary badge"
                    type="button"
                    onClick={this.onReset}
                  >
                    忘记密码？
                  </button>
                </div>
              </div>
            </div>)}

            <div className="form-group">
              <button
                className="btn btn-primary btn-block"
                disabled={this.state.loading}
              >
                {this.state.loading && (
                  <span className="spinner-border spinner-border-sm"></span>
                )}
                <span>{this.state.isReset? '重置密码' : '登录'}</span>
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
     )}
    </div>
    );
  }
}
