import React, { Component } from "react";
import SchoolDataService from "../services/school.service";
import ProjectDataService from "../services/project.service";
import AuthService from "../services/auth.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import { withRouter } from "react-router-dom";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import debounce from 'lodash.debounce';

import { getCities } from "../geo/import-json.js";

const SchoolsList = (props) => {
  const [schools, setSchools] = useState([]);
  const [exportSchools, setExportSchools] = useState([]);

  const [currentSchool, setCurrentSchool] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user'));

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState(props.match? props.match.params.region : props.region);
  const [searchCity, setSearchCity] = useState(props.match? props.match.params.city : props.city);  
  const [searchStartAt, setSearchStartAt] = useState("");
  const [searchLastVisit, setSearchLastVisit] = useState("");
  const [searchLatestProjectYear, setSearchLatestProjectYear] = useState("");
  const [searchProjectYear, setSearchProjectYear] = useState("");

  const [searchDonor, setSearchDonor] = useState("");
  const [searchStage, setSearchStage] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchRequest, setSearchRequest] = useState("");
  const [searchXR, setSearchXR] = useState(null);
  const [searchActive, setSearchActive] = useState('欣欣');

  const schoolsRef = useRef();
  schoolsRef.current = schools;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [20, 30, 50];

  const orderbyDefault = [
    {
      id: 'code',
      desc: false
    }
  ];

  const [orderby, setOrderby] = useState(orderbyDefault);

  const [startup, setStartup] = useState(true);

  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [stages, setStages] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);


  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);

    setStartup(false);
  };

  const onChangeSearchCode = (e) => {
    const searchCode = e.target.value;
    setSearchCode(searchCode);
    //setSearchCodeDebounced(searchCode);

    setStartup(false);
  };

  const setSearchCodeDebounced = useMemo(
    () => debounce(setSearchCode, 100)
  , []);

  const onChangeSearchRegion = (e) => {
    const searchRegion = e.target.value;
    setSearchRegion(searchRegion);

    setStartup(false);
  };

  const onChangeSearchCity = (e) => {
    const searchCity = e.target.value;
    setSearchCity(searchCity);

    setStartup(false);
  };

  const onChangeSearchDonor = (e) => {
    const searchDonor = e.target.value;
    setSearchDonor(searchDonor);

    setStartup(false);
  };

  const onChangeSearchStage = (e) => {
    const searchStage = e.target.value;
    setSearchStage(searchStage);

    setStartup(false);
  };

  const onChangeSearchStatus = (e) => {
    const searchStatus = e.target.value;
    setSearchStatus(searchStatus);

    setStartup(false);
  };

  const onChangeSearchCategory = (e) => {
    const searchCategory = e.target.value;
    setSearchCategory(searchCategory);

    setStartup(false);
  };

  const onChangeSearchRequest = (e) => {
    const searchRequest = e.target.value;
    setSearchRequest(searchRequest);

    setStartup(false);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);

    setStartup(false);
  };

  const onChangeSearchLastVisit = (e) => {
    const searchLastVisit = e; //e.target.value;
    setSearchLastVisit(searchLastVisit);

    setStartup(false);
  };

  const onChangeSearchLatestProjectYear = (e) => {
    const searchLatestProjectYear = e; //e.target.value;
    setSearchLatestProjectYear(searchLatestProjectYear);

    setStartup(false);
  };

  const onChangeSearchProjectYear = (e) => {
    const searchProjectYear = e; //e.target.value;
    setSearchProjectYear(searchProjectYear);

    setStartup(false);
  };

  const onChangeSearchXR = (e) => {
    const searchXR = e.target.value;
    setSearchXR(searchXR);

    setStartup(false);
  };
  
  const onChangeSearchActive = (e) => {
    const searchActive = e.target.value;
    setSearchActive(searchActive);

    setStartup(false);
  };

  const onClearSearch = (e) => {
    setSearchName("");
    setSearchCode("");
    setSearchRegion("");
    setSearchCity("");
    setSearchStartAt("");
    setSearchLastVisit("");
    setSearchLatestProjectYear("");
    setSearchProjectYear("");
    setSearchDonor("");
    setSearchStage("");
    setSearchStatus("");
    setSearchCategory("");
    setSearchRequest("");
    setSearchXR("");
    setSearchActive('欣欣');

    setOrderby(orderbyDefault);
    setExportSchools([]);

    setPage(1);

    setStartup(false);
  };

  const restoreRequestParams = (params) => {
    if (!params) return;

    setSearchName(params["name"]);
    setPage(params["page"] + 1);
    setPageSize(params["size"]);
    setOrderby(params["orderby"]);
    setSearchCode(params["code"]);
    setSearchRegion(params["region"]);
    setSearchCity(params["city"]);
    setSearchStartAt(params["startAt"]);
    setSearchLatestProjectYear(params["latestProjectYear"]);
    setSearchProjectYear(params["projectYear"]);
    setSearchLastVisit(params["lastVisit"]);
    setSearchDonor(params["donor"]);
    setSearchStage(params["stage"]);
    setSearchStatus(params["status"]);
    setSearchCategory(params["category"]);
    setSearchRequest(params["request"]);
    setSearchXR(params["xr"]);
    setSearchActive(params["active"]);    
  };


  const getRequestParams = (exportFlag, refresh = false) => {
    const REQUEST_PARAMS_KEY = window.location.href;

    if (refresh) {
      let params = JSON.parse(localStorage.getItem(REQUEST_PARAMS_KEY));
      if (params) {
        restoreRequestParams(params);
        //localStorage.removeItem(REQUEST_PARAMS_KEY);
        return params;
      }
    }

    let params = {};

    if (searchName) {
      params["name"] = searchName;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if (orderby) {
      params["orderby"] = orderby;
    }

    if (searchCode) {
      params["code"] = searchCode;
    }

    if (searchRegion) {
      params["region"] = searchRegion;
    }

    if (searchCity) {
      params["city"] = searchCity;
    }

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }

    if (searchLatestProjectYear) {
      params["latestProjectYear"] = searchLatestProjectYear;
    }

    if (searchProjectYear) {
      params["projectYear"] = searchProjectYear;
    }

    if (searchLastVisit) {
      params["lastVisit"] = searchLastVisit;
    }

    if (searchDonor) {
      params["donor"] = searchDonor;
    }

    if (searchStage) {
      params["stage"] = searchStage;
    }

    if (searchStatus) {
      params["status"] = searchStatus;
    }

    if (searchCategory) {
      params["category"] = searchCategory;
    }

    if (searchRequest) {
      params["request"] = searchRequest;
    }

    if (searchXR) {
      params["xr"] = searchXR;
    }

    if (searchActive) {
      params["active"] = searchActive;
    }

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    if (!exportFlag)
      localStorage.setItem(REQUEST_PARAMS_KEY, JSON.stringify(params));

    return params;
  };

  const getRegions = () => {
    if (regions.length == 0) {
      SchoolDataService.getRegions()
        .then(response => {
          setRegions(response.data);
          console.log(response);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  const updateCities = () => {
    setCities(getCities(searchRegion));
  }
  useEffect(updateCities, [searchRegion]);


  const getRequests = () => {
    SchoolDataService.getRequests_ss()
      .then(response => {
        setRequests(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  const getStatuses = () => {
    SchoolDataService.getStatuses_ss()
      .then(response => {
        setStatuses(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  const getCategories = () => {
    SchoolDataService.getCategories()
      .then(response => {
        setCategories(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  const getStages = () => {
    SchoolDataService.getStages()
      .then(response => {
        setStages(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getRegions, [orderby]);
  useEffect(getStages, [orderby]);
  useEffect(getStatuses, [orderby]);
  useEffect(getCategories, [orderby]);
  useEffect(getRequests, [orderby]);

  const retrieveSchools = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, */false, refresh);

    SchoolDataService.getAll2(params)
      .then((response) => {
        const { schools, totalPages, totalItems } = response.data;

        setSchools(schools);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveExportSchoolsDetail = () => {
    doRetrieveExportSchools({main: getAttributes(exportColumnsMain),
                detail: getAttributes(exportColumnsDetail)});
  }

  const retrieveExportSchools = () => {
    doRetrieveExportSchools({main: getAttributes(exportColumnsMain), detail: []});
  }

  const doRetrieveExportSchools = (columns) => {

    const filters = getRequestParams(true);

    //SchoolDataService.getExport(columns)
    SchoolDataService.getExport({...columns, ...filters})
      .then(response => {
        setExportSchools(response.data);
        console.log(response.data);

        const csv = ProjectDataService.exportCSV(response.data, exportColumns);
        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'schools_export' + (columns.detail[0] ? '_detail' : '_basic') + '.csv'
            );
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        console.log(error);
        console.log(resMessage);
      });
  };

  const SAVE_retrieveExportSchools = () => {
    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, */true);

    SchoolDataService.getAll2(params)
      .then((response) => {
        const { schools, totalPages, totalItems } = response.data;
        setExportSchools(schools);
        console.log(response.data);

        //const csv = ProjectDataService.toCSV(schools, columns);
        //const url = window.URL.createObjectURL(new Blob([csv.header + csv.body]));
        const csv = ProjectDataService.exportCSV(schools, columns);
        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'school.csv'
            );
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const search = () => {
    if (startup) return;
    setPage(1);
    retrieveSchools();
  };

  useEffect(search, [pageSize, orderby, searchName, searchCode, searchRegion, searchCity, searchStartAt, searchLatestProjectYear, searchProjectYear,
                     searchLastVisit, searchDonor, searchStage, searchStatus, searchCategory, searchRequest, searchXR, searchActive]);

  useEffect(retrieveSchools, [page]);
  useEffect(() => {retrieveSchools(true)}, []);

  const refreshList = () => {
    retrieveSchools();
  };

  const removeAllSchools = () => {
    SchoolDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openSchool = (rowIndex) => {
    const id = schoolsRef.current[rowIndex].id;

    props.history.push("/schools/" + id);
  };

  const deleteSchool = (rowIndex) => {
    const id = schoolsRef.current[rowIndex].id;

    SchoolDataService.delete(id)
      .then((response) => {
        //props.history.push("/schools");

        let newSchools = [...schoolsRef.current];
        newSchools.splice(rowIndex, 1);

        setSchools(newSchools);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
        alert(e);
      });
  };

  const getAttributes = (mapper) => {
    var result = [];
    for (var i = 0; i < mapper.length; i++)
      result.push(mapper[i].accessor);
    return result;
  }


  const exportColumnsMain = [
      {
        Header: "学校编号",
        accessor: "code",
      },
      {
        Header: "欣欣学校名称",
        accessor: "name",
      },
      {
        Header: "教育局注册校名",
        accessor: "schoolBoardRegisteredName",
      },
      {
        Header: "主管教育局名称",
        accessor: "schoolBoard",
      },
      {
        Header: "加入年份",
        accessor: "startAt",
      },
      {
        Header: "捐款人",
        accessor: "donor",
      },
      {
        Header: "最近访校年份",
        accessor: "lastVisit",
      },
      {
        Header: "最近项目年份",
        accessor: "latestProjectYear",
      },
      {
        Header: "最近项目",
        accessor: "latestProjects",
      },         
      {
        Header: "学校阶段",
        accessor: "stage",
      },
      {
        Header: "学校状态",
        accessor: "status",
      },
/*
      {
        Header: "需求状态",
        accessor: "request",
      },
*/
      {
        Header: "省/自治区/直辖市",
        accessor: "region",
      },
      {
        Header: "市",
        accessor: "city",
      },
      {
        Header: "区/县",
        accessor: "county",
      },
      {
        Header: "乡/镇",
        accessor: "community",
      },
      {
        Header: "地址",
        accessor: "address",
      },

      {
        Header: "教师人数",
        accessor: "teachersCount",
      },
      {
        Header: "学生人数",
        accessor: "studentsCount",
      },
      {
        Header: "学校类型",
        accessor: "category",
      },
      {
        Header: "总班级数",
        accessor: "classesCount",
      },
      {
        Header: "总年级数",
        accessor: "gradesCount",
      },
      {
        Header: "校长",
        accessor: "principalId",
      },
      {
        Header: "校长电话",
        accessor: "principalPhone",
      },
      {
        Header: "校长微信",
        accessor: "principalWechat",
      },
      {
        Header: "联络人",
        accessor: "contactId",
      },
      {
        Header: "联络人电话",
        accessor: "contactPhone",
      },
      {
        Header: "联络人微信",
        accessor: "contactWechat",
      },

  ];

  const exportColumnsDetail = [ 
      {
        Header: "学校电话",
        accessor: "phone",
      },
      {
        Header: "学校电邮地址",
        accessor: "email",
      },
      {
        Header: "留守儿童人数",
        accessor: "stayBehindCount",
      },
      {
        Header: "学生住宿人数",
        accessor: "boarderCount",
      },
      {
        Header: "学前班级数",
        accessor: "kClassesCount",
      },
      {
        Header: "一年级班级数",
        accessor: "g1ClassesCount",
      },
      {
        Header: "二年级班级数",
        accessor: "g2ClassesCount",
      },
      {
        Header: "三年级班级数",
        accessor: "g3ClassesCount",
      },
      {
        Header: "四年级班级数",
        accessor: "g4ClassesCount",
      },
      {
        Header: "五年级班级数",
        accessor: "g5ClassesCount",
      },
      {
        Header: "六年级班级数",
        accessor: "g6ClassesCount",
      },
      {
        Header: "学前学生数",
        accessor: "kStudentsCount",
      },
      {
        Header: "一年级学生数",
        accessor: "g1StudentsCount",
      },
      {
        Header: "二年级学生数",
        accessor: "g2StudentsCount",
      },
      {
        Header: "三年级学生数",
        accessor: "g3StudentsCount",
      },
      {
        Header: "四年级学生数",
        accessor: "g4StudentsCount",
      },
      {
        Header: "五年级学生数",
        accessor: "g5StudentsCount",
      },
      {
        Header: "六年级学生数",
        accessor: "g6StudentsCount",
      },
      {
        Header: "如有初中学生数",
        accessor: "mStudentsCount",
      },
      {
        Header: "办公用电脑台数",
        accessor: "computersCount",
      },
      {
        Header: "是否有电脑室",
        accessor: "computerRoomExists",
      },
      {
        Header: "共有几台电脑",
        accessor: "computerRoomCount",
      },
      {
        Header: "可否上网",
        accessor: "internetExists",
      },
      {
        Header: "多媒体一体机套数",
        accessor: "multimediaSystemsCount",
      },
      {
        Header: "是否有图书阅览室",
        accessor: "libraryExists",
      },
      {
        Header: "图书角数量",
        accessor: "bookCornersCount",
      },
      {
        Header: "图书册数",
        accessor: "booksCount",
      },
      {
        Header: "评论",
        accessor: "schoolComments",
      },      
    ];

  const exportColumns = [...exportColumnsMain, ...exportColumnsDetail];

  const columns = useMemo(
    () => [
/**
      {
        Header: "ID",
        accessor: "id",
        disableSortBy: true,
      },
*/
      {
        Header: "学校编号",
        accessor: "code",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                target="_blank"
                to={"/schoolsView/" + schoolsRef.current[rowIdx].id}
              >
                {schoolsRef.current[rowIdx].code}
              </Link>
            </div>
          );
        },
      },
      {
        Header: "地区",
        accessor: "region",
      },

      {
        Header: "欣欣学校名称",
        accessor: "name",
      },

      {
        Header: "加入年份",
        accessor: "startAt",
        //Filter: SelectStartAtFilter,
      },
      {
        Header: "最近访校年份",
        accessor: "lastVisit",
        //Filter: SelectStartAtFilter,
      },
/**
      {
        Header: "校长",
        accessor: "principal",
        disableSortBy: true,
      },
*/
      {
        Header: "学校阶段",
        accessor: "stage",
      },
      {
        Header: "学校状态",
        accessor: "status",
      },
/**
      {
        Header: "需求状态",
        accessor: "request",
      },
*/
      {
        Header: "捐款人",
        accessor: "donor",
        disableSortBy: true,
      },
      {
        Header: "最近项目年份",
        accessor: "latestProjectYear",
      },
/**            
      {
        Header: "最近项目年份",
        accessor: "latestProjectYear",
        Cell: (props) => {
          const rowIdx = props.row.id;
            var d = null;
            if ((schoolsRef.current[rowIdx].latestProjectYear))
              d = new Date(schoolsRef.current[rowIdx].latestProjectYear);
            return (
              <div>
                {d ? d.getUTCFullYear() : ''}
              </div>
            );
        }
      },
      {
        Header: "教师人数",
        accessor: "teachersCount",
      },
      {
        Header: "学生人数",
        accessor: "studentsCount",
      },
*/
      {
        Header: "项目",
        accessor: "projectsCount",

        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/projects/school/" + schoolsRef.current[rowIdx].id + (searchProjectYear ? ('?startAt=' + searchProjectYear) : '') }
                className="badge badge-success"
              >
                {schoolsRef.current[rowIdx].projectsCount}
              </Link>
            </div>
          );
        },
      },
      {
        Header: "项目申请",
        accessor: "responsesCount",

        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/responses/school/" + schoolsRef.current[rowIdx].id + (searchProjectYear ? ('?startAt=' + searchProjectYear) : '')}
                className="badge badge-success"
              >
                {schoolsRef.current[rowIdx].responsesCount}
              </Link>
            </div>
          );
        },
      },
      {
        Header: "向荣支持",
        accessor: 'xr',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {schoolsRef.current[rowIdx].xr ? '是' : '否'}
            </div>
          );
        },
      },      
      {
        Header: "操作",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/schoolsView/" + schoolsRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>

              {currentUser && (<Link
                target="_blank"
                to={"/schools/" + schoolsRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {AuthService.isAdmin() && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteSchool(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>)}
            </div>
          );
        },
      },
    ],
    [searchProjectYear]
  );

  var hiddenColumnsMobile = (isMobile)
    ? ['donor', 'xr', 'responsesCount', 'projectsCount', 'lastVisit', 'region', 'latestProjectYear', 'stage', 'status', 'request', 'startAt']
    : [];

  var hiddenColumnsLogin = (!AuthService.isLogin())
    ? ["stage", "status", "request", "donor", 'latestProjectYear', 'responsesCount', 'xr', 'actions']
    : [];

  var hiddenColumns = [...hiddenColumnsMobile, ...hiddenColumnsLogin];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    state: {sortBy},
  } = useTable({
    columns,
    data: schools,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
/**
      sortBy: [
        {
          id: 'code',
          desc: false
        }
      ]
*/
    },
  },
  useSortBy,
  );

  const findByName = () => {
    setPage(1);
    retrieveSchools();
  };

  const handlePageChange = (event, value) => {
    setPage(value);

    setStartup(false);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);

    setStartup(false);
  };

  useEffect(() => {
    if (sortBy && sortBy[0]) {
      setOrderby(sortBy);

      setStartup(false);
    }
  }, [sortBy]);

  //useEffect(() => {
  //}, [filters]);


  return (
    <div className="list row">
      <div className="col-sm-9">
        <h4>学校列表(总数：{totalItems})</h4>
        <div className="row mb-3">

          <input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="学校编号"
            value={searchCode}
            onChange={onChangeSearchCode}
          />

          <select
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchRegion}
            onChange={onChangeSearchRegion}
          >
            <option value="">省/自治区</option>
            {regions.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <select
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchCity}
            onChange={onChangeSearchCity}
          >
            <option value="">地市州</option>
            {cities.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <input
            type="text"
            className="form-control col-sm-4 ml-2"
            placeholder="欣欣学校名称"
            value={searchName}
            onChange={onChangeSearchName}
          />


          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="加入年份"
            value={searchStartAt}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchStartAt}
            onSelect={onChangeSearchStartAt}
            hideInput={true}
            minRange={1995}
            maxRange={2030}
          />


          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="访校年份"
            value={searchLastVisit}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchLastVisit}
            onSelect={onChangeSearchLastVisit}
            hideInput={true}
            minRange={1995}
            maxRange={2030}
          />


          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="最近项目"
            value={searchLatestProjectYear}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchLatestProjectYear}
            onSelect={onChangeSearchLatestProjectYear}
            hideInput={true}
            minRange={1995}
            maxRange={2030}
          />

          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="项目年份"
            value={searchProjectYear}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchProjectYear}
            onSelect={onChangeSearchProjectYear}
            hideInput={true}
            minRange={1995}
            maxRange={2030}
          />

          <select hidden={!AuthService.isLogin()}
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchStage}
            onChange={onChangeSearchStage}
          >
            <option value="">学校阶段</option>
            {stages.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <select hidden={!AuthService.isLogin()}
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchStatus}
            onChange={onChangeSearchStatus}
          >
            <option value="">学校状态</option>
            {statuses.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <select hidden={!AuthService.isLogin()}
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchCategory}
            onChange={onChangeSearchCategory}
          >
            <option value="">学校类型</option>
            {categories.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <select /* style={{fontSize:'70%'}} */
            className="form-control col-sm-2 ml-2"
            hidden={!AuthService.isLogin()}
            value={searchActive}
            onChange={onChangeSearchActive}
          >
              <option value={'欣欣'}>
                {'欣欣'}
              </option>
              <option value={'非欣欣'}>
                {'非欣欣'}
              </option>
              <option value={'撤并再续'}>
                {'撤并再续'}
              </option>     
              <option value={'全部'}>
                {'全部'}
              </option>                                    
          </select>

          <select hidden={true /*!AuthService.isLogin()*/}
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchRequest}
            onChange={onChangeSearchRequest}
          >
            <option value="">需求状态</option>
            {requests.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <input hidden={!AuthService.isLogin()}
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="捐款人"
            value={searchDonor}
            onChange={onChangeSearchDonor}
          />

          <select
            className="form-control col-sm-1 ml-2"
            hidden={!AuthService.isLogin()}
            value={searchXR}
            onChange={onChangeSearchXR}
          >
            <option value="">向荣</option>
              <option value={false}>
                {'否'}
              </option>
              <option value={true}>
                {'是'}
              </option>
          </select>



          <div>
            <button
              className="btn btn-primary  ml-2"
              type="button"
              onClick={onClearSearch}
            >
              清空
            </button>
          </div>

        </div>

        <div className="input-group mb-4">
{/*
          <div>
            <button
              className="btn btn-primary "
              type="button"
              onClick={findByName}
            >
              查询
            </button>
          </div>
*/}
          <div hidden={!currentUser || isMobile}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={retrieveExportSchools}
            >
              基本导出
            </button>
          </div>
          <div hidden={!currentUser || isMobile}>
            <button
              className="btn btn-primary ml-2"
              type="button"
              onClick={retrieveExportSchoolsDetail}
            >
              详细导出
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 col-sm-3">
        {"每页显示行数: "}
        <select onChange={handlePageSizeChange} value={pageSize}>
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <Pagination
          className="my-3"
          count={count}
          page={page}
          siblingCount={1}
          boundaryCount={1}
          variant="outlined"
          shape="rounded"
          onChange={handlePageChange}
        />
      </div>

        <div class="w-100"></div>

      <div className="col-sm-12 list">
        <table
          className="table table-striped table-bordered"
          {...getTableProps()}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // Add the sorting props to control sorting. For this example
                  // we can add them into the header props
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    {/* Add a sort direction indicator */}
                    <span>
                      {/*column.isSorted*/ (column.id === 'code' || column.id === 'region' ||
                      column.id === 'startAt' || column.id === 'teachersCount' ||
                      column.id === 'studentsCount' || column.id === 'name' ||
                      column.id === 'projectsCount' || column.id === 'responsesCount' ||
                      column.id === 'latestProjectYear' ||
                      column.id === 'stage' || column.id === 'lastVisit' ||
                      column.id === 'status' || column.id === 'request' || column.id === 'xr'
                      )
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 col-sm-12">
        {"每页显示行数: "}
        <select onChange={handlePageSizeChange} value={pageSize}>
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <Pagination
          className="my-3"
          count={count}
          page={page}
          siblingCount={1}
          boundaryCount={1}
          variant="outlined"
          shape="rounded"
          onChange={handlePageChange}
        />
      </div>

    </div>
  );
};

export default withRouter(SchoolsList);