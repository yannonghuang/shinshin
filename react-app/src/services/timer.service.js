import React from 'react';
import { withRouter } from "react-router-dom";
import { useIdleTimer } from 'react-idle-timer';
//import { useHistory } from 'react-router'

import AuthService from "./auth.service";

const SESSION_IDEL_MINUTES = 20;

const AutoLogoutTimer = (props: any) => {
    const logout = () => {
        AuthService.logout();
        props.history.push('/login');
        window.location.reload();
    }

    if (!AuthService.getCurrentUser()) logout();

    const { ComposedClass, ...passThroughProps } = props;
    //const history = useHistory();

    const handleOnIdle = (event: any) => {
        //console.log('user is idle', event)
        console.log('last active', getLastActiveTime());
        //logout();
        AuthService.logout();
        props.history.push('/login');
    }

    const {getLastActiveTime } = useIdleTimer({
        timeout: 1000 * 60 * SESSION_IDEL_MINUTES,
        onIdle: handleOnIdle,
        debounce: 500,
    })

    return <ComposedClass  {...passThroughProps} />
}

export default withRouter(AutoLogoutTimer);