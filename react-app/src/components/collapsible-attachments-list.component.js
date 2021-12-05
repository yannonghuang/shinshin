import React, { Component, createRef } from "react";
import Collapsible from 'react-collapsible';
import AttachmentsList from './attachments-list.component.js';

export default class TheCollapsible extends Component  {
render() {
  return (
    <Collapsible trigger="点击查看附件详情 。。。">
        <iframe src={"/attachments/response/" + this.props.responseId} height="500" width="1000"/>
    </Collapsible>
  );
  }
};

//export default TheCollapsible;