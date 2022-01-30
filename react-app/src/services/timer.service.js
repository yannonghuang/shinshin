import React from 'react';
import { withRouter } from "react-router-dom";
import { useIdleTimer } from 'react-idle-timer';
//import { useHistory } from 'react-router'

import AuthService from "./auth.service";

const SESSION_IDLE_MINUTES = 20;

const EXEMPTED_URLS = [
    "/schools",
    "/schoolsView",
    "/projects",
    "/projects/school",
    "/projectsView"
  ];

const AutoLogoutTimer = (props: any) => {

  const login = () => {
    AuthService.logout();
    props.history.push('/login');
    window.location.reload();
  }

//window.location.pathname.includes('add')

  const isExempted = () => {
    const pathname = window.location.pathname;
    for (var i = 0; i < EXEMPTED_URLS.length; i++)
      if (pathname.includes(EXEMPTED_URLS[i]))
        return true;
    return false;
  }

  if (!AuthService.getCurrentUser() && !isExempted()) {
    if (window.confirm("需要登录 ?")) login();
    else props.history.goBack();
    //alert("需要登录");
  }


  const { ComposedClass, ...passThroughProps } = props;
    //const history = useHistory();

  const handleOnIdle = (event: any) => {
    //console.log('user is idle', event)
    //console.log('last active', getLastActiveTime());
    login();
    //AuthService.logout();
    //props.history.push('/login');
  }

  const {getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * SESSION_IDLE_MINUTES,
    onIdle: handleOnIdle,
    debounce: 500,
  })

  return <ComposedClass  {...passThroughProps} />
}

export default withRouter(AutoLogoutTimer);