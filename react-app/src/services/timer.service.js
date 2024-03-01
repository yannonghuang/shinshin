import React from 'react';
import { withRouter } from "react-router-dom";
import { useIdleTimer } from 'react-idle-timer';
//import { useHistory } from 'react-router'

import AuthService from "./auth.service";

const SESSION_IDLE_MINUTES = 20;


/**
const EXEMPTED_URLS = [
    "/schools",
    "/schoolsView",
    "/projects",
    "/projects/school",
    "/projectsView",
    "/regionsDistribution",
    "regionsDistNav"
  ];

  const isExempted = () => {
    const pathname = window.location.pathname;
    for (var i = 0; i < EXEMPTED_URLS.length; i++)
      if (pathname.includes(EXEMPTED_URLS[i]))
        return true;
    return false;
  }
*/

const AutoLogoutTimer = (props: any) => {

  const login = (newTarget = false) => {
    AuthService.logout();
    if (newTarget) {
      props.history.goBack();
      const win = window.open("/login", newTarget ? "_blank" : null);
      win.focus();
    } else {
      //props.history.push('/login');
      //props.history.push('/');
      window.location.replace('/login');      
    }
  }

  const isExempted = () => {
    const pathname = window.location.pathname;

    if (pathname.match(/schools/)) return true;
    if (pathname.match(/schoolsView\/(\d)+/)) return true;
    if (pathname.match(/projects/)) return true;
    if (pathname.match(/projects\/school\/(\d)+/)) return true;
    if (pathname.match(/projectsView\/(\d)+/)) return true;
    if (pathname.match(/regionsDistribution/)) return true;
    if (pathname.match(/regionsDistNav/)) return true;
    if (pathname.match(/addFeedback\/(\d)+/)) return true;
    if (pathname.match(/feedbacks/)) return true;

    return false;
  }

  if (!AuthService.getCurrentUser() && !isExempted())
    login(true);

  const {start} = useIdleTimer({
    timeout: 1000 * 60 * SESSION_IDLE_MINUTES,
    onIdle: (event: any) => {login()},
    debounce: 500,
    crossTab: true,
    syncTimers: 200,

    startOnMount: false,
    startManually: true,
  });

  if (AuthService.getCurrentUser())
    start();

  const { ComposedClass, ...passThroughProps } = props;
  return <ComposedClass  {...passThroughProps} />
}

export default withRouter(AutoLogoutTimer);