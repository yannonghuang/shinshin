import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";


import $ from "jquery"; //Load jquery

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
    this.toggle = this.toggle.bind(this);

    this.state = {
      username: "",
      password: "",
      email: "",
      isReset: false,
      loading: false,
      message: "",

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

    this.init();
  }


  init() {
    $(document).ready(function() {
      $('#toggle').addClass('fas fa-eye-slash');

      $('#toggle').click(function() {
        if($(this).hasClass('fas fa-eye-slash')){
          $(this).removeClass('fas fa-eye-slash');
          $(this).addClass('fas fa-eye');
          $('#password').attr('type','text');
        } else {
          $(this).removeClass('fas fa-eye');
          $(this).addClass('fas fa-eye-slash');
          $('#password').attr('type','password');
        }
      });

    });
  }


  toggle(e) {
    e.preventDefault();

    if($('#toggle').hasClass('fas fa-eye-slash')) {
      $('#toggle').removeClass('fas fa-eye-slash');
      $('#toggle').addClass('fas fa-eye');
      $('#password').attr('type','text');
    } else {
      $('#toggle').removeClass('fas fa-eye');
      $('#toggle').addClass('fas fa-eye-slash');
      $('#password').attr('type','password');
    }
  }

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
      AuthService.findByEmail(email, true)
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


  sendEmail(user, message, isReset) {

    this.setState({
      loading: true
    });

    var token = jwt.sign({ email: user.email }, "config.secret", {
      expiresIn: 900 // 15 minutes
    });

    //const url = window.location.host;
    const url = window.location.protocol + '//' + window.location.host;

    var templateParams = {
      to: user.email,
      username: (user.chineseName ? user.chineseName : user.username)
        + '(登录名: ' + user.username + ')',
      link: url + "/" + (isReset ? "reset" : "login") + "?token=" + token
    };

    let template = isReset ? 'template_password_reset' : 'template_email_check';

    //emailjs.send("icloud_2021_12_27","template_ae0k3bj", templateParams)
    emailjs.send("Gmail 2022", template, templateParams)
    .then((result) => {
      console.log(result.text);
      this.setState({
        message: message, //"邮件已发至您的邮箱，请在15分钟内完成密码重置。。。",
        loading: false
      });
      }, (error) => {
        console.log(error.text);
        this.setState({
          message: error.text,
          loading: false
        });
      });
  }

  handleReset(e) {
    e.preventDefault();

    if (this.state.email) {
      AuthService.findByEmail(this.state.email)
      .then(r => {
        this.sendEmail(r.data,
          "邮件已发至您的邮箱，请在15分钟内完成密码重置。。。",
          true);
      })
      .catch(e => {
        this.setState({
          message: '您的注册邮箱地址有误，请提供正确的注册邮箱 。。。' //+ e.toString()
        });
      });
    } else {
      this.setState({
        message: '请提供注册邮箱 。。。'
      });
    }
  }

/**
  SAVE_handleReset(e) {
    e.preventDefault();

    if (this.state.email) {
      var token = jwt.sign({ email: this.state.email }, "config.secret", {
        expiresIn: 900 // 15 minutes
      });

      AuthService.findByEmail(this.state.email)
      .then(r => {
        const url = window.location.host;
        var templateParams = {
              to: this.state.email,
              username: r.data.chineseName ? r.data.chineseName : r.data.username,
              link: url + "/reset?token=" + token
              //link: "http://localhost:8081/reset?token=" + token
        };

        //emailjs.send("icloud_2021_12_27","template_ae0k3bj", templateParams)
        emailjs.send("Gmail 2022", "template_ae0k3bj", templateParams)
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
          message: '您的注册邮箱地址有误，请提供正确的注册邮箱 。。。' //+ e.toString()
        });
      });
    } else {
      this.setState({
        message: '请提供注册邮箱 。。。'
      });
    }
  }
*/

  handleLogin(e) {
    e.preventDefault();

/**
    this.setState({
      message: "",
      loading: true
    });
*/

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      AuthService.login(this.state.username, this.state.password).then(
        (response) => {
          if (response.data.accessToken) {
            localStorage.setItem("user", JSON.stringify(response.data));
            //this.props.history.push("/profile");
            //this.props.history.push("/schools");
            AuthService.getCurrentUser().schoolId
              ? this.props.history.push('/schoolsView/' + AuthService.getCurrentUser().schoolId)
              : this.props.history.push('/schools');

            window.location.reload();
          } else {
            this.setState({
              loading: false,
              message: '服务器异常，登录失败'
            });
          }
        },
        error => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          console.log(resMessage);

          if (error.response.data.notEmailVerified) {
            this.sendEmail(error.response.data,
              "您尚未确认邮箱地址。确认邮件已发至您的邮箱，请在15分钟内完成确认回执 。。。",
              false);
          } else {
            alert('登录失败，请确认用户名/密码正确');
            this.setState({
              //loading: false,
              //message: '登录失败，请确认用户名/密码正确'
            });
          }
        }
      );
    } else {
/**
      this.setState({
        loading: false
      });
*/
    }
  }


  render() {

    return (
    <div>
    { /* AuthService.getCurrentUser() */ AuthService.isValid()
    ? AuthService.getCurrentUser().schoolId
       ? this.props.history.push('/schoolsView/' + AuthService.getCurrentUser().schoolId)
       : this.props.history.push('/schools')
    : (
      <div className="col-sm-12">
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
                <div style={{position: "relative", width: "100%"}} >
                  <Input
                    style={{ width: "100%" }}
                    type="password"
                    className="form-control"
                    name="password"
                    id="password"
                    value={this.state.password}
                    onChange={this.onChangePassword}
                    validations={[required]}
                  />

                  <button type="button" id="toggle" class="toggle"
                    style={{ position: "absolute", right: "10px", top: "10px",
                    background: 'transparent', border: 'none'}}
                  />

                </div>

                <button
                  style={{ float: "left", width: "45%" }}
                  className="btn btn-primary badge mt-2"
                  type="button"
                  onClick={this.onReset}
                >
                  忘记用户名或密码?
                </button>

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
