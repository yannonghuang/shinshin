import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.min.js'
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";

import "./App.css";

import logo from './shinshin-logo.png';

import AddTutorial from "./components/add-tutorial.component";
import Tutorial from "./components/tutorial.component";
import TutorialsList from "./components/tutorials-list.component";

//import AddSchool from "./components/add-school.component";
import School from "./components/school.component";
import SchoolsList from "./components/schools-list.component";
import DocumentsList from "./components/documents-list.component";
import RegionsList from "./components/regions-list.component";
import CommentsList from "./components/comments-list.component";

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

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import BoardUser from "./components/board-user.component";
import BoardModerator from "./components/board-moderator.component";
import BoardAdmin from "./components/board-admin.component";

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
  }

  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

    return (
      <div>
        <div class="mb-3">
          <img src={logo} alt="" height="60" width="370" />
        </div>

        <nav class="navbar navbar-expand navbar-dark bg-dark">
          <Link to={"/"} class="navbar-brand">
            学校项目管理系统
          </Link>

          <div class="collapse navbar-collapse navbar-nav mr-auto">
{/*}
            {showModeratorBoard && (
              <li class="nav-item">
                <Link to={"/mod"} class="nav-link">
                  Moderator Board
                </Link>
              </li>
            )}

            {showAdminBoard && (
              <li class="nav-item">
                <Link to={"/admin"} class="nav-link">
                  Admin Board
                </Link>
              </li>
            )}

            {currentUser && (
              <li class="nav-item">
                <Link to={"/user"} class="nav-link">
                  User
                </Link>
              </li>
            )}

            <li class="nav-item">
             <Link to={"/tutorials"} class="nav-link">
               Tutorials
             </Link>
            </li>
            <li class="nav-item">
              <Link to={"/add"} class="nav-link">
                Add Tutorial
              </Link>
            </li>
*/}
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                管理
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/users"}>用户列表</a>
                <a class="dropdown-item" href={"/addU"}>创建用户</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#">Something else here</a>
              </div>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                学校
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/schools"}>学校列表</a>
                <a class="dropdown-item" href={"/regions"}>地区列表</a>
                <a class="dropdown-item" href={"/addS"}>新增学校</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/documents"}>学校文档</a>
                <a class="dropdown-item" href={"/comments"}>留言</a>
                <a class="dropdown-item" href="#">Something else here</a>
              </div>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                项目申请
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/forms"}>项目征集列表</a>
                <a class="dropdown-item" href={"/addF"}>新增项目征集</a>
                <a class="dropdown-item" href={"/responses"}>项目申请列表</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/attachments"}>项目申请附件</a>
                <a class="dropdown-item" href="#">Something else here</a>
              </div>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                项目
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/projects"}>项目列表</a>
                <a class="dropdown-item" href={"/addP"}>新增项目</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/dossiers"}>项目文档</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#">Something else here</a>
              </div>
            </li>
          </div>

          {currentUser ? (
            <div class="navbar-nav ml-auto">

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                我的欣欣({currentUser.chineseName ? currentUser.chineseName : currentUser.username})
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/users/" + currentUser.id}>
                  个人信息
                </a>
                {currentUser.schoolId
                  ? <a class="dropdown-item" href={"/schoolsView/" + currentUser.schoolId}>我的学校</a>
                  : ''
                }
                <a class="dropdown-item" href={"/responses/user/" + currentUser.id}>我的申请</a>
                <div class="dropdown-divider"></div>
{/*}
                <a class="dropdown-item" href={"/login"} onClick={this.logOut}>退出</a>
*/}
                <a class="dropdown-item" href="#">Something else here</a>
              </div>
            </li>

            <li class="nav-item">
              <a href="/login" class="nav-link" onClick={this.logOut}>
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
            <Route exact path={["/login", "/", "/home"]} component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/profile" component={Profile} />
            <Route path="/user" component={BoardUser} />
            <Route path="/mod" component={BoardModerator} />
            <Route path="/admin" component={BoardAdmin} />

            <Route exact path={["/", "/tutorials"]} component={TutorialsList} />
            <Route exact path="/add" component={AddTutorial} />
            <Route path="/tutorials/:id" component={Tutorial} />

            <Route exact path={["/regions"]} component={RegionsList} />
            <Route exact path={["/schools", "/schools/region/:region"]} component={SchoolsList} />
            <Route path={["/schools/:id", "/schoolsView/:id", "/addS"]} component={School} />
            <Route exact path={["/documents", "/documents/school/:schoolId", "/documents/school/:schoolId/:docCategory"]} component={DocumentsList} />
            <Route exact path={["/comments", "/documents/school/:schoolId"]} component={CommentsList} />

            <Route exact path={["/projects", "/projects/school/:schoolId"]} component={ProjectsList} />
            <Route path={["/projects/:id", "/projectsView/:id", "/addP"]} component={Project} />
            <Route exact path={["/dossiers", "/dossiers/project/:projectId", "/dossiers/project/:projectId/:docCategory"]} component={DossiersList} />

            <Route exact path={["/forms"]} component={FormsList} />
            {/*
            <Route exact path="/addF" component={AddForm} />
            */}
            <Route path={["/forms/:id", "/formsView/:id", "/addF"]} component={Form} />

            <Route exact path={["/responses", "/responses/form/:formId", "/responses/school/:schoolId", "/responses/user/:userId"]} component={ResponsesList} />
            {/*}
            <Route path="/addR/:id" component={AddResponse} />
            */}
            <Route path={["/responses/:id", "/responsesView/:id", "/addR/:id"]} component={Response} />

            <Route exact path={["/attachments", "/attachments/response/:responseId"]} component={AttachmentsList} />
            {/*}
            <Route path="/addA/:id" component={AddAttachment} />
            <Route path="/attachments/:id" component={Attachment} />
            */}

            <Route exact path={["/users"]} component={UsersList} />
            <Route exact path="/addU" component={Register} />
            <Route path={["/users/:id", "/usersView/:id"]} component={Register} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
