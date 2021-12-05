import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";

import "./App.css";

import AddTutorial from "./components/add-tutorial.component";
import Tutorial from "./components/tutorial.component";
import TutorialsList from "./components/tutorials-list.component";

import AddForm from "./components/add-form.component";
import Form from "./components/form.component";
import FormsList from "./components/forms-list.component";

import AddResponse from "./components/add-response.component";
import Response from "./components/response.component";
import ResponsesList from "./components/responses-list.component";

import AddAttachment from "./components/add-attachment.component";
import Attachment from "./components/attachment.component";
import AttachmentsList from "./components/attachments-list.component";

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
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <Link to={"/"} className="navbar-brand">
            欣欣教育基金会
          </Link>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/home"} className="nav-link">
                Home
              </Link>
            </li>

            {showModeratorBoard && (
              <li className="nav-item">
                <Link to={"/mod"} className="nav-link">
                  Moderator Board
                </Link>
              </li>
            )}

            {showAdminBoard && (
              <li className="nav-item">
                <Link to={"/admin"} className="nav-link">
                  Admin Board
                </Link>
              </li>
            )}

            {currentUser && (
              <li className="nav-item">
                <Link to={"/user"} className="nav-link">
                  User
                </Link>
              </li>
            )}

            <li className="nav-item">
             <Link to={"/tutorials"} className="nav-link">
               Tutorials
             </Link>
            </li>
            <li className="nav-item">
              <Link to={"/add"} className="nav-link">
                Add Tutorial
              </Link>
            </li>

            <li className="nav-item">
             <Link to={"/forms"} className="nav-link">
               Forms
             </Link>
            </li>
            <li className="nav-item">
              <Link to={"/addF"} className="nav-link">
                Add Form
              </Link>
            </li>

            <li className="nav-item">
             <Link to={"/responses"} className="nav-link">
               Responses
             </Link>
            </li>

            <li className="nav-item">
             <Link to={"/attachments"} className="nav-link">
               Attachments
             </Link>
            </li>
          </div>

          {currentUser ? (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/profile"} className="nav-link">
                  {currentUser.username}
                </Link>
              </li>
              <li className="nav-item">
                <a href="/login" className="nav-link" onClick={this.logOut}>
                  LogOut
                </a>
              </li>
            </div>
          ) : (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/login"} className="nav-link">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link to={"/register"} className="nav-link">
                  Sign Up
                </Link>
              </li>
            </div>
          )}
        </nav>

        <div className="container mt-3">
          <Switch>
            <Route exact path={["/", "/home"]} component={Home} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/profile" component={Profile} />
            <Route path="/user" component={BoardUser} />
            <Route path="/mod" component={BoardModerator} />
            <Route path="/admin" component={BoardAdmin} />

            <Route exact path={["/", "/tutorials"]} component={TutorialsList} />
            <Route exact path="/add" component={AddTutorial} />
            <Route path="/tutorials/:id" component={Tutorial} />

            <Route exact path={["/forms"]} component={FormsList} />
            <Route exact path="/addF" component={AddForm} />
            <Route path="/forms/:id" component={Form} />

            <Route exact path={["/responses", "/responses/form/:formId"]} component={ResponsesList} />
            <Route path="/addR/:id" component={AddResponse} />
            <Route path="/responses/:id" component={Response} />

            <Route exact path={["/attachments", "/attachments/response/:responseId"]} component={AttachmentsList} />
            <Route path="/addA/:id" component={AddAttachment} />
            <Route path="/attachments/:id" component={Attachment} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
