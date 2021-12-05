import React, { Component, createRef } from "react";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Collapsible from 'react-collapsible';
import ResponsesList from './responses-list.component.js';

export default class SchoolDetails extends Component  {
render() {
  return (
    <Collapsible trigger="点击查看学校详情 。。。">
      <Tabs>
        <TabList>
          <Tab>学校详情</Tab>
          <Tab>项目列表</Tab>
          <Tab>文档</Tab>
        </TabList>
        <TabPanel>
          <p>... 查看学校详情 ...</p>
        </TabPanel>
        <TabPanel>
          <ResponsesList schoolId = {this.props.schoolId} />
        </TabPanel>
        <TabPanel>
          <ResponsesList schoolId = {this.props.schoolId} />
        </TabPanel>
      </Tabs>
    </Collapsible>
  );
  }
};

//export default TheCollapsible;