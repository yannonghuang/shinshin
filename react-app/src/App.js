import React, { Component } from "react";
import { Switch, Route, Link, Redirect, withRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.min.js'
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";

import "./App.css";

import logo from './shinshin-logo.png';

//import AddTutorial from "./components/add-tutorial.component";
//import Tutorial from "./components/tutorial.component";
//import TutorialsList from "./components/tutorials-list.component";

//import AddSchool from "./components/add-school.component";
import Survey from "./components/survey.component";
import SurveysList from "./components/surveys-list.component";

import School from "./components/school.component";
import SchoolsList from "./components/schools-list.component";
import DocumentsList from "./components/documents-list.component";
import RegionsList from "./components/regions-list.component";
import CommentsList from "./components/comments-list.component";
import LogsList from "./components/logs-list.component";

import Project from "./components/project.component";
import ProjectsList from "./components/projects-list.component";
import DossiersList from "./components/dossiers-list.component";

//import AddForm from "./components/add-form.component";
import Form from "./components/form.component";
import FormsList from "./components/forms-list.component";

//import AddResponse from "./components/add-response.component";
import Response from "./components/response.component";
import ResponsesList from "./components/responses-list.component";

//import AddAttachment from "./components/add-attachment.component";
//import Attachment from "./components/attachment.component";
import AttachmentsList from "./components/attachments-list.component";

import UsersList from "./components/users-list.component";

import AuthService from "./services/auth.service";
import AccessControlService from "./services/timer.service";

import Reset from "./components/reset.component";
import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
//import BoardUser from "./components/board-user.component";
//import BoardModerator from "./components/board-moderator.component";
//import BoardAdmin from "./components/board-admin.component";

const jwt = require("jsonwebtoken");

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles.includes("ROLE_ADMIN"),
      });
    }
  }

  logOut() {
    AuthService.logout();
    this.props.history.push('/login');
    window.location.reload();
  }

  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

    return (
      <div>
        <div class="mb-3">
          <a href={"https://shinshinfoundation.org/"}>
            <img src={logo} alt="" height="60" width="370" class="responsive" />
          </a>
        </div>

{/*
        <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
*/}
        <nav class="navbar navbar-expand-sm navbar-dark navbar-custom">
          <Link to={"/"} onClick={() => window.location.reload()} class="navbar-brand">
            学校项目管理系统
          </Link>

          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon">
            </span>
          </button>

          <div class="collapse navbar-collapse navbar-nav mr-auto" id="navbarSupportedContent">

            {(currentUser && !currentUser.schoolId && showAdminBoard) && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                管理
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/users"}>用户列表</a>
                <a class="dropdown-item" href={"/addU"}>创建用户</a>
              </div>
            </li>)}

            {(!currentUser || (currentUser && !currentUser.schoolId)) && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                学校
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/schools"}>学校列表</a>
                <a class="dropdown-item" href={"/regions"} hidden={!currentUser}>地区列表</a>
                <a class="dropdown-item" href={"/addS"} hidden={!currentUser} >新增学校</a>
{/*
                <a class="dropdown-item" href={"/addSurvey"}>新增调查表</a>
*/}
                <div class="dropdown-divider" hidden={!currentUser}></div>
                <a class="dropdown-item" href={"/documents"} hidden={!currentUser}>学校文档</a>
                <a class="dropdown-item" href={"/comments"} hidden={!currentUser}>留言</a>
                <a class="dropdown-item" href={"/logs"} hidden={!currentUser}>修改记录</a>
{/*
                <a class="dropdown-item" href={"/surveys"}>调查表列表</a>
*/}
              </div>
            </li>)}

            {(!currentUser || (currentUser && !currentUser.schoolId)) && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                项目
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/projects"}>项目列表</a>
                <a class="dropdown-item" href={"/addP"} hidden={!currentUser}>新增项目</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/projectsXR"}>向荣支持项目列表</a>
                <a class="dropdown-item" href={"/addPXR"} hidden={!currentUser}>新增向荣支持项目</a>
                <div class="dropdown-divider" hidden={!currentUser}></div>
                <a class="dropdown-item" href={"/dossiers"} hidden={!currentUser}>项目文档</a>
              </div>
            </li>)}

            {(currentUser && !currentUser.schoolId) && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                项目申请
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
{/*
                <a class="dropdown-item" href={"/responses"}>项目申请列表</a>
*/}
                <a class="dropdown-item" href={"/forms"}>项目申请表</a>
                <a class="dropdown-item" href={"/addF"}>新增项目申请表</a>
{/*
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/attachments"}>项目申请附件</a>
*/}
              </div>
            </li>)}

          </div>

          {currentUser ? (
            <div class="navbar-nav ml-auto">

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">

                {currentUser.lastLogin
                  ? <span title={"上次登录时间: " + currentUser.lastLogin}>
                    我的欣欣({currentUser.chineseName ? currentUser.chineseName : currentUser.username})
                    </span>
                  : <span> 我的欣欣({currentUser.chineseName ? currentUser.chineseName : currentUser.username}) </span>
                }
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/users/" + currentUser.id}>
                  个人信息
                </a>

                <a class="dropdown-item"
                  href={'/reset?token=' +
                    jwt.sign({ email: currentUser.email }, "config.secret", {
                      expiresIn: 900 // 15 minutes
                    })
                  }
                >
                  重置密码
                </a>

                {currentUser.schoolId
                  ? <a class="dropdown-item" href={"/schoolsView/" + currentUser.schoolId}>我的学校</a>
                  : ''
                }
                <a class="dropdown-item" href={"/responses/user/" + currentUser.id}>我的项目申请</a>
{/*}
                <a class="dropdown-item" href={"/login"} onClick={this.logOut}>退出</a>
*/}
              </div>
            </li>

            <li class="nav-item">
              <a href="#" class="nav-link" onClick={this.logOut}>
                退出
              </a>
            </li>
{/*}
              <li class="nav-item">
                <Link to={"/profile"} class="nav-link">
                  {currentUser.username}
                </Link>
              </li>
*/}
            </div>
          ) : (
            <div class="navbar-nav ml-auto">
              <li class="nav-item">
                <Link to={"/login"} class="nav-link">
                  登录
                </Link>
              </li>

              <li class="nav-item">
                <Link to={"/register"} class="nav-link">
                  注册
                </Link>
              </li>
            </div>
          )}
        </nav>

        <div class="container mt-3">
          <Switch>
          {/*}
            <Route exact path={["/", "/home"]} component={Home} />
          */}
            <Route exact path={["/reset"]} component={Reset} />
            <Route exact path={["/login", "/", "/home"]} component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/profile" component={Profile} />

{/*
            <Route exact path={["/schools"]} component={SchoolsList} />
            <Route path={["/schoolsView/:id"]} component={School} />

            <Route exact path={["/projects", "/projects/school/:schoolId"]} component={ProjectsList} />
            <Route path={["/projectsView/:id"]} component={Project} />

            <Route path="/user" component={BoardUser} />
            <Route path="/mod" component={BoardModerator} />
            <Route path="/admin" component={BoardAdmin} />
            <Route exact path={["/", "/tutorials"]} component={TutorialsList} />
            <Route exact path="/add" component={AddTutorial} />
            <Route path="/tutorials/:id" component={Tutorial} />
*/}


            <Route exact path={["/regions"]} component={RegionsList} >
                <AccessControlService ComposedClass={RegionsList} />
            </Route>
            <Route exact path={["/schools", "/schools/region/:region"]} >
                <AccessControlService ComposedClass={SchoolsList} />
            </Route>
            <Route path={["/schoolsView/:id", "/schools/:id", "/addS"]} component={School} >
                <AccessControlService ComposedClass={School} />
            </Route>

            <Route path={["/surveys/:id", "/surveysView/:id", "/addSurvey", "/surveys/school/:schoolId"]} component={Survey} >
                <AccessControlService ComposedClass={Survey} />
            </Route>
            <Route exact path={["/surveys"]} component={SurveysList} >
                <AccessControlService ComposedClass={SurveysList} />
            </Route>

            <Route exact path={["/documents", "/documents/school/:schoolId",
                            "/documents/school/:schoolId/:docCategory"]} component={DocumentsList} >
                <AccessControlService ComposedClass={DocumentsList} />
            </Route>

            <Route exact path={["/comments", "/comments/school/:schoolId"]} component={CommentsList} >
                <AccessControlService ComposedClass={CommentsList} />
            </Route>

            <Route exact path={["/logs", "/logs/school/:schoolId"]} component={LogsList} >
                <AccessControlService ComposedClass={LogsList} />
            </Route>

            <Route exact path={["/projects", "/projects/school/:schoolId", "/projectsXR", "/projectsXR/school/:schoolId"]}
                component={ProjectsList} >
                <AccessControlService ComposedClass={ProjectsList} />
            </Route>
            <Route path={["/projectsView/:id", "/projects/:id", "/addP", "/projectsViewXR/:id", "/projectsXR/:id", "/addPXR"]}
                component={Project} >
                <AccessControlService ComposedClass={Project} />
            </Route>

            <Route exact path={["/dossiers", "/dossiers/project/:projectId",
                                            "/dossiers/project/:projectId/:docCategory"]} component={DossiersList} >
                <AccessControlService ComposedClass={DossiersList} />
            </Route>

            <Route exact path={["/forms"]} component={FormsList} >
                <AccessControlService ComposedClass={FormsList} />
            </Route>

            {/*
            <Route exact path="/addF" component={AddForm} />
            */}
            <Route path={["/forms/:id", "/formsView/:id", "/addF"]} component={Form} >
                <AccessControlService ComposedClass={Form} />
            </Route>

            <Route exact path={["/responses", "/responses/form/:formId", "/responses/school/:schoolId",
                                "/responses/user/:userId"]} component={ResponsesList} >
                <AccessControlService ComposedClass={ResponsesList} />
            </Route>

            {/*}
            <Route path="/addR/:id" component={AddResponse} />
            */}
            <Route path={["/responses/:id", "/responsesView/:id", "/addR/:id"]} component={Response} >
                <AccessControlService ComposedClass={Response} />
            </Route>

            <Route exact path={["/attachments", "/attachments/response/:responseId"]} component={AttachmentsList} >
                <AccessControlService ComposedClass={AttachmentsList} />
            </Route>

            {/*}
            <Route path="/addA/:id" component={AddAttachment} />
            <Route path="/attachments/:id" component={Attachment} />
            */}

            <Route exact path={["/users", "/users/school/:schoolId"]} component={UsersList} >
                <AccessControlService ComposedClass={UsersList} />
            </Route>

            <Route path={["/addU", "/users/:id", "/usersView/:id"]} component={Register} >
                <AccessControlService ComposedClass={Register} />
            </Route>

          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
