import React, { Component, Suspense } from "react";
import { Switch, Route, Link, withRouter } from "react-router-dom";
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

import CommentsList from "./components/comments-list.component";
import LogsList from "./components/logs-list.component";

import ProjectDataService from "./services/project.service";
import Project from "./components/project.component";
import ProjectsList from "./components/projects-list.component";
import ProjectsByCategoriesList from "./components/projects-categories-list.component";
import DossiersList from "./components/dossiers-list.component";

//import AwardDataService from "./services/award.service";
import Award from "./components/award.component";
import AwardsList from "./components/awards-list.component";
import MaterialsList from "./components/materials-list.component";

//import AddForm from "./components/add-form.component";
import Form from "./components/form.component";
import FormsList from "./components/forms-list.component";

//import AddResponse from "./components/add-response.component";
import Response from "./components/response.component";
import ResponsesList from "./components/responses-list.component";

import Questionaire from "./components/questionaire.component";
import QuestionairesList from "./components/questionaires-list.component";

import Feedback from "./components/feedback.component";
import FeedbacksList from "./components/feedbacks-list.component";

//import AddAttachment from "./components/add-attachment.component";
//import Attachment from "./components/attachment.component";
import AttachmentsList from "./components/attachments-list.component";

import UsersList from "./components/users-list.component";

import AuthService from "./services/auth.service";
import AccessControlService from "./services/timer.service";

//import DonorDataService from "./services/donor.service";
import Donor from "./components/donor.component";
import DonorsList from "./components/donors-list.component";

//import DesignationDataService from "./services/designation.service";
import Designation from "./components/designation.component";
import DesignationsList from "./components/designations-list.component";

//import DonationDataService from "./services/donation.service";
import Donation from "./components/donation.component";
import DonationsList from "./components/donations-list.component";

//import BatchDataService from "./services/batch.service";
import Batch from "./components/batch.component";

import Reset from "./components/reset.component";
import Login from "./components/login.component";
import Register from "./components/register.component";
//import Home from "./components/home.component";
import Profile from "./components/profile.component";
//import BoardUser from "./components/board-user.component";
//import BoardModerator from "./components/board-moderator.component";
//import BoardAdmin from "./components/board-admin.component";

//import RegionsList from "./components/regions-list.component";
const RegionsList = React.lazy(() => import("./components/regions-list.component"));
const MapShow = React.lazy(() => import("./components/mapshow.component"));


const jwt = require("jsonwebtoken");

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,

      pCategories: ProjectDataService.PROJECT_CATEGORIES,
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles.includes("ROLE_ADMIN"),
      });
    }

  }

  componentWillReceiveProps = (nextProps)=> {
    if (nextProps.location.pathname === this.props.location.pathname &&
      nextProps.location.pathname === '/login') {
      window.location.reload();
    }
  };

  logOut() {
    AuthService.logout();
    this.props.history.push('/login');
    window.location.reload();
  }

  noNavBar() {
    if (this.props.location.pathname.match(/schools\/(\d)+/)) return true;
    if (this.props.location.pathname.match(/projects\/(\d)+/)) return true;
    if (this.props.location.pathname.match(/responses\/(\d)+/)) return true;
    if (this.props.location.pathname.match(/surveys\/(\d)+/)) return true;
    if (this.props.location.pathname.match(/forms\/(\d)+/)) return true;
    if (this.props.location.pathname.match(/users\/(\d)+/)) return true;

    if (this.props.location.pathname.match(/addS/)) return true;
    if (this.props.location.pathname.match(/addP/)) return true;
    if (this.props.location.pathname.match(/addPXR/)) return true;
    if (this.props.location.pathname.match(/addF/)) return true;
    if (this.props.location.pathname.match(/addU/)) return true;

    if (this.props.location.pathname.match(/regionsDistribution/)) return true;

    if (this.props.location.pathname.match(/batch/)) return true;

    return false;
  }

  noLogo() {
    if (this.props.location.pathname.match(/regionsDistribution/)) return true;

    return false;
  }

  getPCategories = async () => {
    try {
      let response = await ProjectDataService.getCategories();

      await this.setState({
        pCategories: response.data
      });
      console.log(response);

    } catch(e) {
      console.log(e);
    }
  }

  renderProjectsByCategories() {
    return (
      <div>
        {this.state.pCategories.map((option, index) => {
          if (index > 0)
            return <a class="dropdown-item" href={"/projects/categoryCanonical/" + ProjectDataService.PROJECT_CATEGORIES_ID[index].id}>{option}</a>
        })}
      </div>
    )
  }

  render() {

    return (
      <div>

        {!this.noNavBar() && <div class="mb-3" >
          <a href={"https://shinshinfoundation.org/"} >
            <img src={logo} alt="" height="60" width="370" class="responsive" />
          </a>
        </div>}

{/*
        <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
*/}
        <nav class="navbar navbar-expand-sm navbar-dark navbar-custom" hidden={this.noNavBar()} >
          <Link to={"/login"} class="navbar-brand">
            学校项目管理系统
          </Link>

          {AuthService.isSchoolUser() && <Link to={"/"} class="navbar-brand">
            主页
          </Link>}

          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon">
            </span>
          </button>

          <div class="collapse navbar-collapse navbar-nav mr-auto" id="navbarSupportedContent">

            {AuthService.isVolunteer() && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                用户
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/users"}>用户列表</a>
                {AuthService.isAdmin() &&
                  <a class="dropdown-item" href={"/addU"} target="_blank">创建用户</a>
                }
              </div>
            </li>)}

            {AuthService.isDonorService() && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                捐赠
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/donors"}>捐款人列表</a>

                <a class="dropdown-item" href={"/addD"} target="_blank">创建捐款人</a>

                <div class="dropdown-divider"></div>

                <a class="dropdown-item" href={"/designations"}>专款项目列表</a>
                {/*AuthService.isAdmin() &&
                  <a class="dropdown-item" href={"/addDesignation"} target="_blank">创建捐赠指定</a>
                */}

                <div class="dropdown-divider"></div>

                <a class="dropdown-item" href={"/donations"}>捐赠列表</a>

                <div>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" href={"/batch?type=donors&source=QuickBook"} target="_blank">批量捐款人更新(QuickBook)</a>
                  <a class="dropdown-item" href={"/batch?type=donors&source=MailChimp"} target="_blank">批量捐款人更新(MailChimp)</a>
                </div>

                <div>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" href={"/batch?type=donations"} target="_blank">批量捐款更新</a>
                </div>
              </div>

            </li>)}

            {(!AuthService.isLogin() || AuthService.isVolunteer()) && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                学校
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/schools"}>学校列表</a>
                <a class="dropdown-item" href={"/regions"} hidden={!AuthService.isLogin()}>地区列表</a>
                <a class="dropdown-item" href={"/regionsDistNav"}>学校分布</a>
                <a class="dropdown-item" href={"/addS"}
                  hidden={!AuthService.isLogin() || !AuthService.isAdmin()}
                  target="_blank">新增学校
                </a>
{/*
                <div class="dropdown-divider" hidden={!AuthService.isLogin()}></div>
                <a class="dropdown-item" href={"/documents"} hidden={!AuthService.isLogin()}>学校文档</a>
                <a class="dropdown-item" href={"/comments"} hidden={!AuthService.isLogin()}>留言</a>
                <a class="dropdown-item" href={"/logs"} hidden={!AuthService.isLogin()}>更新列表</a>
*/}
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/awards"} hidden={!AuthService.isLogin()}>奖项列表</a>

                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/logs"}
                  hidden={!AuthService.isLogin() || !AuthService.isAdmin()}
                >学校修改记录
                </a>
              </div>
            </li>)}

            {(!AuthService.isLogin() || AuthService.isVolunteer()) && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                项目
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/projects"}>学校项目列表</a>
                <a class="dropdown-item" href={"/addP"}
                  hidden={!AuthService.isLogin() || !AuthService.isAdmin()}
                  target="_blank">新增学校项目
                </a>
                <div class="dropdown-divider"></div>

                <a class="dropdown-item" href={"/projects/allCategoriesCanonical" }>总项目列表</a>

{/*
                <a class="dropdown-item" href={"/projects/allCategories" }>总项目列表(系统迁移)</a>
*/}

                {this.renderProjectsByCategories()}

                {AuthService.isAdmin() && <div>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" href={"/batch?type=projects"} target="_blank">批量学校项目更新</a>
                </div>}

                <div class="dropdown-divider"></div>

                <a class="dropdown-item"
                  hidden={!AuthService.isVolunteer()}
                  href={"/projectsXR"}>向荣支持项目列表
                </a>
                <a class="dropdown-item" href={"/addPXR"}
                  hidden={!AuthService.isLogin() || !AuthService.isAdmin()}
                  target="_blank">新增向荣支持项目
                </a>
                {AuthService.isAdmin() && <div>
                  <a class="dropdown-item" href={"/batch?type=projectsXR"} target="_blank">批量向荣项目录入</a>
                </div>}                
{/*
                <div class="dropdown-divider" hidden={!AuthService.isLogin()}></div>
                <a class="dropdown-item" href={"/dossiers"} hidden={!AuthService.isLogin()} >项目文档</a>
*/}
              </div>
            </li>)}

            {AuthService.isVolunteer() && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                项目申请
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
{/*
                <a class="dropdown-item" href={"/responses"}>项目申请列表</a>
*/}
                <a class="dropdown-item" href={"/forms"}>项目申请表</a>
                <a class="dropdown-item" href={"/addF"}
                  hidden={!AuthService.isAdmin()}
                  target="_blank">新增项目申请表
                </a>
{/*
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/attachments"}>项目申请附件</a>
*/}
              </div>
            </li>)}

            {(/*!AuthService.isLogin() || */AuthService.isVolunteer()) && (
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                调查问卷
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/questionaires"}
                  hidden={!AuthService.isLogin()}
                >
                  问卷列表
                </a>
                <a class="dropdown-item" href={"/addQ"}
                  hidden={!AuthService.isAdmin()}
                  target="_blank"
                >
                  新增问卷
                </a>

                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href={"/feedbacks"}>问卷反馈列表</a>
              </div>

            </li>)}

          </div>

          {AuthService.isLogin()
          ? (
            <div class="navbar-nav ml-auto">

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {AuthService.getCurrentUser().lastLogin
                  ? <span title={"上次登录时间: " + AuthService.getCurrentUser().lastLogin}>
                    我的欣欣({AuthService.getCurrentUser().chineseName
                    ? AuthService.getCurrentUser().chineseName
                    : AuthService.getCurrentUser().username})
                    </span>
                  : <span> 我的欣欣({AuthService.getCurrentUser().chineseName
                    ? AuthService.getCurrentUser().chineseName
                    : AuthService.getCurrentUser().username})
                    </span>
                }
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href={"/users/" + AuthService.getCurrentUser().id} target='_blank'>
                  个人信息
                </a>

                <a class="dropdown-item"
                  href={'/reset?token=' +
                    jwt.sign({ email: AuthService.getCurrentUser().email }, "config.secret", {
                      expiresIn: 900 // 15 minutes
                    })
                  }
                >
                  重置密码
                </a>

                {AuthService.getCurrentUser().schoolId
                  ? <a class="dropdown-item" href={"/schoolsView/" + AuthService.getCurrentUser().schoolId}>我的学校</a>
                  : ''
                }
                <a class="dropdown-item" href={"/responses/user/" + AuthService.getCurrentUser().id}>我的项目申请</a>
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
                  {AuthService.getCurrentUser().username}
                </Link>
              </li>
*/}
            </div>
            )
          : (
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


            <Route exact path={["/regions", "/regionsDistribution"]} component={RegionsList} >
              <Suspense fallback={<span>Loading...</span>}>
                <AccessControlService ComposedClass={RegionsList} />
              </Suspense> 
            </Route>

            <Route exact path={["/regionsDistNav"]} component={MapShow} >
              <Suspense fallback={<span>Loading...</span>}>
                <AccessControlService ComposedClass={MapShow} />
              </Suspense> 
            </Route>

            <Route exact path={["/schools", "/schools/region/:region", "/schools/city/:city"]} >
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

            <Route exact path={["/projects", "/projects/school/:schoolId",
                    "/projectsXR", "/projectsXR/school/:schoolId",
                    "/projectsByCategoryByStartAt/:pCategoryId/:pSubCategoryId/:startAt/:name/:formId"]}
                component={ProjectsList} >
                <AccessControlService ComposedClass={ProjectsList} />
            </Route>
            <Route exact path={["/projects/category/:pCategoryId/:pSubCategoryId", "/projects/categoryCanonical/:pCategoryId",
                            "/projects/allCategories", "/projects/allCategoriesCanonical"]}
                component={ProjectsByCategoriesList} >
                <AccessControlService ComposedClass={ProjectsByCategoriesList} />
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

            <Route exact path={["/donors"]} component={DonorsList} >
                <AccessControlService ComposedClass={DonorsList} />
            </Route>

            <Route path={["/donors/:id", "/donorsView/:id", "/addD"]} component={Donor} >
                <AccessControlService ComposedClass={Donor} />
            </Route>

            <Route exact path={["/designations", "/designations/donor/:donorId",
            "/designations/project/:projectId", "/designations/donation/:donationId"]}
                component={DesignationsList} >
                <AccessControlService ComposedClass={DesignationsList} />
            </Route>

            <Route path={["/designations/:id", "/designationsView/:id",
            "/addDesignation/:id", "/addDesignation/:id/:donationId"]} component={Designation} >
                <AccessControlService ComposedClass={Designation} />
            </Route>

            <Route exact path={["/donations", "/donations/donor/:donorId"]}
                component={DonationsList} >
                <AccessControlService ComposedClass={DonationsList} />
            </Route>

            <Route path={["/donations/:id", "/donationsView/:id", "/addDonation/:id"]} component={Donation} >
                <AccessControlService ComposedClass={Donation} />
            </Route>

            <Route path={["/batch"]} component={Batch} >
                <AccessControlService ComposedClass={Batch} />
            </Route>


            <Route exact path={["/questionaires"]} component={QuestionairesList} >
                <AccessControlService ComposedClass={QuestionairesList} />
            </Route>

            <Route path={["/questionaires/:id", "/questionairesView/:id", "/addQ"]} component={Questionaire} >
                <AccessControlService ComposedClass={Questionaire} />
            </Route>

            <Route exact path={["/feedbacks", "/feedbacks/questionaire/:questionaireId", "/feedbacks/school/:schoolId",
                                "/feedbacks/user/:userId"]} component={FeedbacksList} >
                <AccessControlService ComposedClass={FeedbacksList} />
            </Route>

            <Route path={["/feedbacks/:id", "/feedbacksView/:id", "/addFeedback/:id"]} component={Feedback} >
                <AccessControlService ComposedClass={Feedback} />
            </Route>


            <Route exact path={["/awards", "/awards/school/:schoolId"]}
                component={AwardsList} >
                <AccessControlService ComposedClass={AwardsList} />
            </Route>
            <Route path={["/awardsView/:id", "/awards/:id", "/addA"]}
                component={Award} >
                <AccessControlService ComposedClass={Award} />
            </Route>

            <Route exact path={["/materials", "/materials/award/:awardId",
                                            "/materials/award/:awardId/:docCategory"]} component={MaterialsList} >
                <AccessControlService ComposedClass={MaterialsList} />
            </Route>

          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
