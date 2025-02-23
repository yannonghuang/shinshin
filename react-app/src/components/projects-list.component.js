import React, { Component } from "react";
import ProjectDataService from "../services/project.service";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import queryString from 'query-string'

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy, useFlexLayout } from "react-table";

import YearPicker from 'react-single-year-picker';

import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import AuthService from "./../services/auth.service";

const ProjectsList = (props) => {
  const [projects, setProjects] = useState([]);
  const [exportProjects, setExportProjects] = useState([]);

  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user'));

  const [currentIndex, setCurrentIndex] = useState(-1);

  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState("");

  //const [searchStartAt, setSearchStartAt] = useState(props.match? props.match.params.startAt : props.startAt);
  const qString = props.location ? queryString.parse(props.location.search) : null;
  const [searchStartAt, setSearchStartAt] = useState(qString ? qString.startAt: null);

  const [searchYearCount, setSearchYearCount] = useState(null);

  const [formId, setFormId] = useState(props.match? props.match.params.formId : props.formId);
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [pCategoryId, setPCategoryId] = useState(props.match? props.match.params.pCategoryId : props.pCategoryId);
  const [pSubCategoryId, setPSubCategoryId] = useState(props.match? props.match.params.pSubCategoryId : props.pSubCategoryId);
  const [searchName, setSearchName] = useState(props.match? props.match.params.name : props.name);

  const [schoolDisplay, setSchoolDisplay] = useState(null);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const projectsRef = useRef();
  projectsRef.current = projects;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [20, 30, 50];

  const orderbyDefault = searchStartAt || qString
    ? [
      {
        //id: 'startAt',
        id: 'school.code',
        desc: false
      }
    ]  
    : [
      {
        id: 'startAt',
        //id: 'school.code',
        desc: true
      }
    ];

  //const [orderby, setOrderby] = useState(orderbyDefault);
  const [orderby, setOrderby] = useState(null);

  const [startup, setStartup] = useState(true);

  const [regions, setRegions] = useState([]);

  const [startAt, setStartAt] = useState(
  []
  );

  const [xr, setXR] = useState(window.location.pathname.includes('XR')
    ? window.location.pathname.includes('XR')
    : props.xr);

  const init = () => {
    if (pCategoryId === 'null')
      setPCategoryId(null);

    //if (formId === 'null')
      //setFormId(null);
  }

  useEffect(init, []);

  const refreshOnReturn = () => {
    window.onblur = () => {window.onfocus = () => {
        retrieveProjects(true);
      }
    }
  };

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);

    setStartup(false);
  };

  const onChangeSearchCode = (e) => {
    const searchCode = e.target.value;
    setSearchCode(searchCode);

    setStartup(false);
  };

  const onChangeSearchRegion = (e) => {
    const searchRegion = e.target.value;
    setSearchRegion(searchRegion);

    setStartup(false);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; // e.target.value;
    setSearchStartAt(searchStartAt);

    //setOrderby(orderbyDefault)

    setStartup(false);
  };

  const onChangeSearchYearCount = (e) => {
    const searchYearCount = e.target.value;
    setSearchYearCount(searchYearCount);

    setStartup(false);
  };

  const onChangeSearchInputStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);

    setStartup(false);
  };

  const onChangeSearchPCategory = (e) => {
    //const searchPCategoryId = e.target.selectedIndex;
    const searchPCategoryId = e.target.selectedIndex < categories.length
      ? ProjectDataService.PROJECT_CATEGORIES_ID[e.target.selectedIndex].id
      : categories.length;

    setPCategoryId(searchPCategoryId);
    setPSubCategoryId(null);

    setStartup(false);
  };

  const onChangeSearchPSubCategory = (e) => {
    const searchPSubCategoryId = e.target.selectedIndex;
    
/*
    if (ProjectDataService.PROJECT_CATEGORIES_ID[pCategoryId].sub &&
      ProjectDataService.PROJECT_CATEGORIES_ID[pCategoryId].sub.length > searchPSubCategoryId
    )
*/    
    if (ProjectDataService.getProjectSubCategories(pCategoryId) &&
      ProjectDataService.getProjectSubCategories(pCategoryId).length > searchPSubCategoryId
    )    
      setPSubCategoryId(searchPSubCategoryId);
    else
      setPSubCategoryId(null);

    setStartup(false);
  };

  const [searchDesignated, setSearchDesignated] = useState(null);
  const onChangeSearchDesignated = (e) => {
    const searchDesignated = e.target.value;
    setSearchDesignated(searchDesignated);

    setStartup(false);
  };

  const onClearSearch = (e) => {
    setSearchName("");
    setSearchCode("");
    setSearchRegion("");
    setSearchStartAt("");
    setSearchYearCount("");
    //setOrderby(orderbyDefault);
    setOrderby(null);    
    setExportProjects([]);
    setSearchDesignated("");
    setPCategoryAll();

    setPage(1);

    setStartup(false);
  };

  const setPCategoryAll = () => {
    const select = document.getElementById('pCategoryId');
    select.value = 'all';
    setPCategoryId(categories.length);
    setPSubCategoryId(null);
  }

  const restoreRequestParams = (params) => {
    if (!params) return;

    setSearchName(params["name"]);
    setPage(params["page"] + 1);
    setPageSize(params["size"]);
    setOrderby(params["orderby"]);
    setSearchCode(params["code"]);
    setSearchRegion(params["region"]);
    setSearchStartAt(params["startAt"]);
    setSchoolId(params["schoolId"]);
    setFormId(params["formId"]);
    setSearchDesignated(params["designated"]);
    setXR(params["xr"]);
    setPCategoryId(params["pCategoryId"]);
    setPSubCategoryId(params["pSubCategoryId"]);
  };

  const getRequestParams = (exportFlag, refresh = false) => {
    const REQUEST_PARAMS_KEY = window.location.href;

    if (embedded) localStorage.removeItem(REQUEST_PARAMS_KEY);

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

    if (searchCode) {
      params["code"] = searchCode;
    }

    if (searchRegion) {
      params["region"] = searchRegion;
    }

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }

    params["yearCount"] = searchYearCount;

    if (orderby && orderby[0])
      params["orderby"] = orderby;
     else
      params["orderby"] = orderbyDefault;
    /*
      params["orderby"] = [
        {
          id: 'startAt',
          desc: true
        }
      ];
    */

    if (schoolId) {
      params["schoolId"] = schoolId;
    }

    if (formId) {
      params["formId"] = formId;
    }

    if (searchDesignated) {
      params["designated"] = searchDesignated;
    }

    params["xr"] = xr;

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

/**
    if (pCategoryId) {
      params["pCategoryId"] = pCategoryId;
    }
*/

    if ((pCategoryId || pCategoryId === 0) && (pCategoryId !== categories.length))
      params["pCategoryId"] = pCategoryId;

    if ((pSubCategoryId || pSubCategoryId === 0) && (pSubCategoryId !== ProjectDataService.getProjectSubCategories(pCategoryId).length))
      params["pSubCategoryId"] = pSubCategoryId;

    if (!exportFlag)
      localStorage.setItem(REQUEST_PARAMS_KEY, JSON.stringify(params));

    return params;
  };

  const getRegions = () => {
    if (regions.length == 0) {
      ProjectDataService.getRegions()
        .then(response => {
          setRegions(response.data);
          console.log(response);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  useEffect(getRegions, [orderby]);

  const [categories, setCategories] = useState(ProjectDataService.PROJECT_CATEGORIES);

/**
  const [categories, setCategories] = useState([]);

  const getCategories = () => {
    ProjectDataService.getCategories()
      .then(response => {
        setCategories(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getCategories, []);
*/

  const retrieveProjects = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, schoolId, */false, refresh);

    ProjectDataService.getAll2(params)
      .then((response) => {
        const { projects, totalPages, totalItems } = response.data;
   
        setProjects(projects);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveSimpleExportProjects = () => {retrieveExportProjects(false)}

  const retrieveExportProjects = (detail = true) => {
    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, schoolId, */true);

    ProjectDataService.getAll2(params)
      .then((response) => {
        const { projects, totalPages, totalItems } = response.data;
        setExportProjects(projects);
        console.log(response.data);

        //const csv = ProjectDataService.exportCSV(projects, columns);
        const csv = ProjectDataService.exportCSV(projects,
          detail
            ? setQuantityLabel(exportDetailColumns)
            : schoolId
              ? exportColumnsWithSchoolKnown
              : exportColumns,
          {
            header: '项目类型',
            translate: (dataIndex) => {return ProjectDataService.getCategory(dataIndex)},
            associate: {
              pCategoryId,
              header: '项目子类型',
              translate: (pCategoryId, pSubCategoryId) => {return ProjectDataService.getSubCategory(pCategoryId, pSubCategoryId)}
            }
          }
        );

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
          //'school_projects' + (xr ? '_xr' : '') + '.csv'
          'school_projects' + (detail ? '_detail' : '') + (xr ? '_xr' : '') + '.csv'
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
    retrieveProjects();
  };

  useEffect(search, [pageSize, orderby, searchCode, searchName, searchStartAt, searchYearCount, searchRegion, pCategoryId, pSubCategoryId, searchDesignated]);
  useEffect(retrieveProjects, [page]);
  useEffect(() => {retrieveProjects(true)}, []);

  const refreshList = () => {
    retrieveProjects();
  };

  const getSchoolDisplay = () => {
    if (!schoolId) return;
    SchoolDataService.get(schoolId)
    .then(response => {
      setSchoolDisplay('学校' + response.data.code);
    })
    .catch (err => {
      console.log(err);
    });
  }

  useEffect(getSchoolDisplay, [schoolId]);

  const removeAllProjects = () => {
    ProjectDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openProject = (rowIndex) => {
    const id = projectsRef.current[rowIndex].id;

    props.history.push("/projects/" + id);
  };

  const deleteProject = (rowIndex) => {
    const id = projectsRef.current[rowIndex].id;

    ProjectDataService.delete(id)
      .then((response) => {

        //props.history.push("/projects");

        let newProjects = [...projectsRef.current];
        newProjects.splice(rowIndex, 1);

        setProjects(newProjects);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderSchool = (rowIdx) => {
    let r = "";
    if (projectsRef.current[rowIdx].school) {
      r = projectsRef.current[rowIdx].school.code + "/" + projectsRef.current[rowIdx].school.name;
    }
    return r;
  }

  const subtract = (columnSet1, columnSet2) => {
    let result = [];
    for (var i = 0; i < columnSet1.length; i++)
      if (!columnSet2.includes(columnSet1[i].accessor)) result.push(columnSet1[i])
    return result;
  }

  const setQuantityLabel = (columnSet) => {
    if (!ProjectDataService.getQuantity(pCategoryId)) return columnSet;

    let result = [];
    for (var i = 0; i < columnSet.length; i++) {
      const {Header, accessor, ...others} = columnSet[i]
      if (accessor === "quantity1") 
        result.push({Header: ProjectDataService.getQuantity(pCategoryId)[0], accessor, ...others})
      else if (accessor === "quantity2") 
        result.push({Header: ProjectDataService.getQuantity(pCategoryId)[1], accessor, ...others})
      else if (accessor === "quantity3") 
        result.push({Header: ProjectDataService.getQuantity(pCategoryId)[2], accessor, ...others})
      else result.push(columnSet[i])
    }
    return result;
  }

  const columns = useMemo(
    () => [
      {
        Header: "项目年份",
        accessor: "startAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            const d = new Date(projectsRef.current[rowIdx].startAt);
            return (
              <div>
                {/*d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })*/
                d.getUTCFullYear()
                }
              </div>
            );
        }
      },
      {
        Header: "项目类型",
        accessor: "pCategoryId",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {ProjectDataService.getCategory(projectsRef.current[rowIdx].pCategoryId)}
            </div>
          );
        },
      },
      {
        Header: "项目子类型",
        accessor: "pSubCategoryId",
        disableSortBy: true,        
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {ProjectDataService.getSubCategory(projectsRef.current[rowIdx].pCategoryId, projectsRef.current[rowIdx].pSubCategoryId)}
            </div>
          );
        },
      },      
      {
        Header: "项目名称",
        accessor: "name",
      },
      {
        Header: "项目状态",
        accessor: "status",
      },
      {
        Header: "项目申请",
        accessor: "response.title",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(projectsRef.current[rowIdx].response) ? (
              <Link
                to={"/responsesView/" + projectsRef.current[rowIdx].response.id}
              >
                {projectsRef.current[rowIdx].response.title}
              </Link>
              ) : ''}
            </div>
          );
        },
      },
      {
        Header: "项目描述",
        accessor: "description",
        disableSortBy: true,
      },
      {
        Header: "项目费用",
        accessor: "budget",
        disableSortBy: true,
      },
      {
        Header: "学校编号",
        accessor: "school.code",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(projectsRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + projectsRef.current[rowIdx].school.id}
              >
                {projectsRef.current[rowIdx].school.code}
              </Link>
              ) : ''}
            </div>
          );
        },
      },
      {
        Header: "省（直辖市）",
        accessor: "school.region",
      },
      {
        Header: "欣欣学校名称",
        accessor: "school.name",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(projectsRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + projectsRef.current[rowIdx].school.id}
              >
                {projectsRef.current[rowIdx].school.name}
              </Link>
              ) : ''}
            </div>
          );
        },
      },
      {
        Header: "学校地址",
        accessor: 'school.address',
        disableSortBy: true,
      },
      {
        Header: "学生数",
        accessor: 'school.studentsCount',
        disableSortBy: true,
      },
      {
        Header: "教师数",
        accessor: 'school.teachersCount',
        disableSortBy: true,
      },
      {
        Header: "班级数",
        accessor: 'school.classesCount',
        disableSortBy: true,
      },
      {
        Header: "年级数",
        accessor: 'school.gradesCount',
        disableSortBy: true,
      },
      {
        Header: "校长",
        accessor: 'school.principalName',
        disableSortBy: true,
      },
      {
        Header: "校长电话",
        accessor: 'school.principalPhone',
        disableSortBy: true,
      },

      {
        Header: "指定捐赠",
        accessor: "designationsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <a href={"/designations/project/" + projectsRef.current[rowIdx].id }>
                {projectsRef.current[rowIdx].designationsCount}
              </a>
            </div>
          );
        },
      },

      {
        Header: "数量1",
        accessor: "quantity1",
      },
      {
        Header: "数量2",
        accessor: "quantity2",
      },
      {
        Header: "数量3",
        accessor: "quantity3",
      },

      {
        Header: "操作",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              {currentUser &&
              (!xr || (xr && AuthService.isAdmin())) && (<Link
                to={"/projectsView" + (xr ? 'XR' : '') + "/" + projectsRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>)}

              {!readonly &&
              ((!xr && AuthService.isVolunteer()) || (xr && AuthService.isAdmin())) &&
              (<Link
                onClick={refreshOnReturn}
                target = '_blank' // {embedded ? '_self' : '_blank'}
                to={"/projects" + (xr ? 'XR' : '') + "/" + projectsRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {!readonly && AuthService.isAdmin() && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteProject(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>)}
            </div>
          );
        },
      },
    ],
    []
  );

  var exportDetailColumns = subtract(columns, ['response.title', 'designationsCount']);

  if (!ProjectDataService.getQuantity(pCategoryId))
    exportDetailColumns = subtract(exportDetailColumns, ['quantity1', 'quantity2', 'quantity3']);

  var exportColumns = subtract(exportDetailColumns,
    ['quantity1', 'quantity2', 'quantity3', 'school.name', 'school.classesCount', 'school.gradesCount', 'school.principalName', 'school.principalPhone', 'school.category', 'school.teachersCount', 'school.studentsCount']);

  const exportColumnsWithSchoolKnown = subtract(exportColumns,
    ['school.code', 'school.name']);

  var hiddenColumnsMobile = (isMobile)
    ? ['school.category', 'school.teachersCount', 'school.studentsCount', "school.name", 'response.title']
    : [];

  const schoolKnownColumns =
    ['id', 'school.region', 'school.code', 'school.name'];

  const exportOnlyColumns =
    ['school.studentsCount', 'school.teachersCount', 'school.category', 'school.classesCount', 'school.gradesCount'];

  var hiddenColumns = ['quantity1', 'quantity2', 'quantity3', 'school.address', 'school.principalName', 'school.principalPhone', 'school.classesCount', 'school.gradesCount'];
  if (embedded || schoolId) hiddenColumns =
    [...hiddenColumns, ...schoolKnownColumns, ...exportOnlyColumns];

  var hiddenColumnsLogin = (!AuthService.isLogin())
    ? ['response.title', 'budget', 'designationsCount', 'actions']
    : [];

  var hiddenColumnsDonorService = (!AuthService.isDonorService())
    ? ['designationsCount']
    : [];

  const hiddenColumnsXR =
    ["response.title", "status", "pCategoryId", "pSubCategoryId", "budget", "designationsCount"];

  hiddenColumns = xr
    ? [...hiddenColumns, ...hiddenColumnsXR]
    : hiddenColumns;

  hiddenColumns = [...hiddenColumns, ...hiddenColumnsMobile, ...hiddenColumnsLogin, ...hiddenColumnsDonorService];

  if (xr) {
    //exportDetailColumns = subtract(exportDetailColumns, hiddenColumns);    
    exportColumns = subtract(exportColumns, hiddenColumns);
  }

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
    data: projects,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
/**
      sortBy: [
        {
          id: 'startAt',
          //id: 'school.code',
          desc: true
        }
      ]
*/
    },
  },
  //useFlexLayout,
  useSortBy,
  );

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


  return (
    <div className="list row">
      <div className="col-sm-9">
        <h4>
          {schoolId && !embedded && (<a href={'/schoolsView/' + schoolId}>{schoolDisplay + '-'}</a>)}
          {xr && '向荣支持'}学校项目列表 (总数：{totalItems})
            {/* (pCategoryId || pCategoryId === 0) &&
            '[项目类型：' + ProjectDataService.getCategory(pCategoryId) +
            '; 年份：' + searchStartAt +
            '; 标题：' + searchName +
            ((formId === undefined || formId === 'undefined')
              ? ''
              : ('; 申请表：' + ((formId && formId !== 'null') ? '有' : '无'))) +
            ']' */}
        </h4>
        <div className="row mb-3 ">

          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="开始年份"
            value={searchStartAt}
            id="searchStartAt"
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchStartAt}
            onSelect={onChangeSearchStartAt}
            hideInput={true}
            minRange={1995}
            maxRange={2025}
          />

          <input
            type="number" min="1"
            className="form-control col-sm-2 ml-2"
            placeholder="年数"
            value={searchYearCount}
            onChange={onChangeSearchYearCount}
            id="searchYearCount"
          />

          <select
            className="form-control col-sm-3 ml-2"
            placeholder="...."
            value={pCategoryId < categories.length ? ProjectDataService.getCategory(pCategoryId) : 'all' }
            onChange={onChangeSearchPCategory}
            id="pCategoryId"
          >
            {categories.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
            <option value='all'>
            项目类型
            </option>
          </select>

          <select
            className="form-control col-sm-3 ml-2"
            placeholder="...."
            value={ ProjectDataService.getSubCategory(pCategoryId, pSubCategoryId) }
            onChange={onChangeSearchPSubCategory}
            id="pSubCategoryId"
          >
            {ProjectDataService.getProjectSubCategories(pCategoryId).map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
            <option value=''>
            项目子类型
            </option>            
          </select>

          <input
            type="text"
            className="form-control col-sm-4 ml-2"
            placeholder="项目名称"
            value={searchName}
            onChange={onChangeSearchName}
            id="searchName"
          />

          {!embedded && (<input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="学校编号"
            value={searchCode}
            onChange={onChangeSearchCode}
            id="searchCode"
          />)}

          {!embedded && (<select
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchRegion}
            onChange={onChangeSearchRegion}
            id="searchRegion"
          >
            <option value="">省/自治区</option>
            {regions.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>)}

          <select hidden={!AuthService.isDonorService()}
            className="form-control col-sm-2 ml-2"
            value={searchDesignated}
            onChange={onChangeSearchDesignated}
            id="searchDesignated"
          >
            <option value="">指定捐赠?</option>
              <option value={true}>
                {'是'}
              </option>
              <option value={false}>
                {'否'}
              </option>
          </select>

          <div>
            <button
              className="btn btn-primary ml-2"
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
              onClick={search}
            >
              查询
            </button>
          </div>
*/}
          <div hidden={!currentUser || isMobile}>
{
            <button
              className="btn btn-primary"
              type="button"
              onClick={retrieveSimpleExportProjects}
            >
              基本导出
            </button>
}
            <button 
              className="btn btn-primary ml-2" 
              type="button"
              onClick={retrieveExportProjects}
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
                      {/*column.isSorted*/ (column.id === 'school.region' || column.id === 'school.code' ||
                      column.id === 'school.name' || column.id === 'startAt' || column.id === 'status'
                      || column.id === 'name' || column.id === 'pCategoryId' || column.id === 'designationsCount')
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

      <div className="mt-3 col-sm-">
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

export default ProjectsList;