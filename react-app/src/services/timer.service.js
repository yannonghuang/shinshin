import React, { useEffect } from 'react';
import { withRouter } from "react-router-dom";
// legacy (ES5) build: webpack 4 in react-scripts 3 can't parse the default build
import { useIdleTimer } from 'react-idle-timer/dist/index.legacy.cjs.js';
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
      props.history.push('/login');
      window.location.reload();
    }
  }

  const isExempted = () => {
    const pathname = window.location.pathname;

    if (pathname.match(/schools/)) return true;
    if (pathname.match(/schoolsView\/(\d)+/)) return true;
    if (pathname.match(/projects/)) return true;
    if (pathname.match(/projects\/school\/(\d)+/)) return true;
    if (pathname.match(/projectsView\/(\d)+/)) return true;
    if (pathname.match(/^\/cases$/)) return true;
    if (pathname.match(/^\/cases\/(\d)+$/)) return true;
    if (pathname.match(/regionsDistribution/)) return true;
    if (pathname.match(/regionsDistNav/)) return true;
    if (pathname.match(/mapNoHead/)) return true;
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
    // v5 replicates onIdle to every tab, so no tab stays on its page with a
    // cleared session (v4 needed emitOnAllTabs and used the deprecated
    // `unload` event, which Chrome reports as a permissions policy violation)
    crossTab: true,
    syncTimers: 200,

    startOnMount: false,
    startManually: true,
  });

  useEffect(() => {
    if (AuthService.getCurrentUser())
      start();

    // session ended elsewhere (idle logout / sign-out in another tab)
    const onStorage = (e: any) => {
      if ((e.key === 'user' || e.key === null) && !localStorage.getItem('user') && !isExempted())
        login();
    };

    // returning to a tab (or waking the machine) after the token has expired
    const checkValidity = () => {
      if (document.visibilityState === 'visible' &&
          AuthService.getCurrentUser() && !AuthService.isValid())
        login();
    };

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', checkValidity);
    window.addEventListener('focus', checkValidity);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', checkValidity);
      window.removeEventListener('focus', checkValidity);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { ComposedClass, ...passThroughProps } = props;
  return <ComposedClass  {...passThroughProps} />
}

export default withRouter(AutoLogoutTimer);
