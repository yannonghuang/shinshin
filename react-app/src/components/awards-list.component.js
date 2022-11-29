import React, { Component } from "react";
import AwardDataService from "../services/award.service";
import ProjectDataService from "../services/project.service";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy, useFlexLayout } from "react-table";

import YearPicker from 'react-single-year-picker';

import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import AuthService from "./../services/auth.service";

const AwardsList = (props) => {
  const [awards, setAwards] = useState([]);
  const [exportAwards, setExportAwards] = useState([]);

  const [currentAward, setCurrentAward] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user'));

  const [currentIndex, setCurrentIndex] = useState(-1);

  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [searchStartAt, setSearchStartAt] = useState(props.match? props.match.params.startAt : props.startAt);
  const [searchType, setSearchType] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const [formId, setFormId] = useState(props.match? props.match.params.formId : props.formId);
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);

  const [searchName, setSearchName] = useState(props.match? props.match.params.name : props.name);

  const [schoolDisplay, setSchoolDisplay] = useState(null);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const awardsRef = useRef();
  awardsRef.current = awards;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [20, 30, 50];

  const orderbyDefault = [
    {
      id: 'startAt',
      //id: 'school.code',
      desc: true
    }
  ];

  const [orderby, setOrderby] = useState(orderbyDefault);

  const [startup, setStartup] = useState(true);

  const [regions, setRegions] = useState([]);

  const [types, setTypes] = useState([]);

  const [categories, setCategories] = useState([]);

  const [startAt, setStartAt] = useState(
  []
  );

  const [xr, setXR] = useState(window.location.pathname.includes('XR')
    ? window.location.pathname.includes('XR')
    : props.xr);


  const refreshOnReturn = () => {
    window.onblur = () => {window.onfocus = () => {
        retrieveAwards(true);
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

  const onChangeSearchType = (e) => {
    const searchType = e.target.value;
    setSearchType(searchType);

    setStartup(false);
  };

  const onChangeSearchCategory = (e) => {
    const searchCategory = e.target.value;
    setSearchCategory(searchCategory);

    setStartup(false);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; // e.target.value;
    setSearchStartAt(searchStartAt);

    setStartup(false);
  };

  const onChangeSearchInputStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);

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
    setOrderby(orderbyDefault);
    setExportAwards([]);
    setSearchType("");
    setSearchCategory("");

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
    setSearchStartAt(params["startAt"]);
    setSchoolId(params["schoolId"]);
    setFormId(params["formId"]);
    setSearchType(params["type"]);
    setSearchCategory(params["category"]);
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

    if (orderby && orderby[0])
      params["orderby"] = orderby;
     else
      params["orderby"] = [
        {
          id: 'startAt',
          desc: true
        }
      ];

    if (searchCode) {
      params["code"] = searchCode;
    }

    if (searchRegion) {
      params["region"] = searchRegion;
    }

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }

    if (schoolId) {
      params["schoolId"] = schoolId;
    }

    if (formId) {
      params["formId"] = formId;
    }

    if (searchType) {
      params["type"] = searchType;
    }

    if (searchCategory) {
      params["category"] = searchCategory;
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

  useEffect(getRegions, []);

  const getTypes = () => {
    AwardDataService.getTypes()
      .then(response => {
        setTypes(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getTypes, []);

  const getCategories = () => {
    AwardDataService.getCategories()
      .then(response => {
        setCategories(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getCategories, []);

  const retrieveAwards = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, schoolId, */false, refresh);

    AwardDataService.getAll2(params)
      .then((response) => {
        const { awards, totalPages, totalItems } = response.data;

        setAwards(awards);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveSimpleExportAwards = () => {retrieveExportAwards(false)}

  const retrieveExportAwards = (detail = true) => {
    const params = getRequestParams(true);

    AwardDataService.getAll2(params)
      .then((response) => {
        const { awards, totalPages, totalItems } = response.data;
        setExportAwards(awards);
        console.log(response.data);

        //const csv = AwardDataService.exportCSV(awards, columns);
        const csv = ProjectDataService.exportCSV(awards,
          detail
            ? exportDetailColumns
            : schoolId
              ? exportColumnsWithSchoolKnown
              : exportColumns
        );

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
          'school_awards' + ''/*(detail ? '_detail' : '')*/ + '.csv'
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
    retrieveAwards();
  };

  useEffect(search, [pageSize, orderby, searchCode, searchName, searchStartAt, searchRegion, searchType, searchCategory]);
  useEffect(retrieveAwards, [page]);
  useEffect(() => {retrieveAwards(true)}, []);

  const refreshList = () => {
    retrieveAwards();
  };

  const getSchoolDisplay = () => {
    SchoolDataService.get(schoolId)
    .then(response => {
      setSchoolDisplay('学校' + response.data.code);
    })
    .catch (err => {
      console.log(err);
    });
  }

  useEffect(getSchoolDisplay, [schoolId]);

  const removeAllAwards = () => {
    AwardDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openAward = (rowIndex) => {
    const id = awardsRef.current[rowIndex].id;

    props.history.push("/awards/" + id);
  };

  const deleteAward = (rowIndex) => {
    const id = awardsRef.current[rowIndex].id;

    AwardDataService.delete(id)
      .then((response) => {

        //props.history.push("/awards");

        let newAwards = [...awardsRef.current];
        newAwards.splice(rowIndex, 1);

        setAwards(newAwards);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderSchool = (rowIdx) => {
    let r = "";
    if (awardsRef.current[rowIdx].school) {
      r = awardsRef.current[rowIdx].school.code + "/" + awardsRef.current[rowIdx].school.name;
    }
    return r;
  }

  const subtract = (columnSet1, columnSet2) => {
    let result = [];
    for (var i = 0; i < columnSet1.length; i++)
      if (!columnSet2.includes(columnSet1[i].accessor)) result.push(columnSet1[i])
    return result;
  }

  const columns = useMemo(
    () => [
      {
        Header: "获奖年份",
        accessor: "startAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            const d = new Date(awardsRef.current[rowIdx].startAt);
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
        Header: "荣誉名称",
        accessor: "name",
      },
      {
        Header: "奖项级别",
        accessor: "category",
      },
      {
        Header: "奖项类型",
        accessor: "type",
      },
      {
        Header: "颁奖单位",
        accessor: "issuer",
        disableSortBy: true,
      },
      {
        Header: "获奖人",
        accessor: "awardee",
        disableSortBy: true,
      },
      {
        Header: "学校编号",
        accessor: "school.code",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(awardsRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + awardsRef.current[rowIdx].school.id}
              >
                {awardsRef.current[rowIdx].school.code}
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
        Header: "学校名称",
        accessor: "school.name",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(awardsRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + awardsRef.current[rowIdx].school.id}
              >
                {awardsRef.current[rowIdx].school.name}
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
        Header: "指定捐赠",
        accessor: "designationsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <a href={"/designations/award/" + awardsRef.current[rowIdx].id }>
                {awardsRef.current[rowIdx].designationsCount}
              </a>
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
              {currentUser &&
              (!xr || (xr && AuthService.isAdmin())) && (<Link
                to={"/awardsView" + (xr ? 'XR' : '') + "/" + awardsRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>)}

              {!readonly &&
              ((!xr && AuthService.isVolunteer()) || (xr && AuthService.isAdmin())) &&
              (<Link
                onClick={refreshOnReturn}
                target = '_blank' // {embedded ? '_self' : '_blank'}
                to={"/awards" + (xr ? 'XR' : '') + "/" + awardsRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {!readonly && AuthService.isAdmin() && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteAward(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>)}
            </div>
          );
        },
      },
    ],
    []
  );

  const exportDetailColumns = subtract(columns, ['response.title']);

  const exportColumns = subtract(exportDetailColumns,
    ['school.category', 'school.teachersCount', 'school.studentsCount', "school.region"]);

  const exportColumnsWithSchoolKnown = subtract(exportColumns,
    ['school.code', 'school.name']);

  var hiddenColumnsMobile = (isMobile)
    ? ['school.category', 'school.teachersCount', 'school.studentsCount', "school.name", 'response.title']
    : [];

  const schoolKnownColumns =
    ['id', 'school.region', 'school.code', 'school.name'];

  const exportOnlyColumns =
    ['school.studentsCount', 'school.teachersCount', 'school.category'];

  var hiddenColumns = ['school.address'];
  if (embedded || schoolId) hiddenColumns =
    [...hiddenColumns, ...schoolKnownColumns, ...exportOnlyColumns];

  var hiddenColumnsLogin = (!AuthService.isLogin())
    ? ['response.title', 'budget', 'designationsCount', 'actions']
    : [];

  var hiddenColumnsDonorService = (!AuthService.isDonorService())
    ? ['designationsCount']
    : [];

  const xrColumns =
    ["response.title", "status"];

  hiddenColumns = xr
    ? [...hiddenColumns, ...xrColumns]
    : hiddenColumns;

  hiddenColumns = [...hiddenColumns, ...hiddenColumnsMobile, ...hiddenColumnsLogin, ...hiddenColumnsDonorService];

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
    data: awards,
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
          奖项列表 (总数：{totalItems})
        </h4>
        <div className="row mb-3 ">

          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="年份"
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
            type="text"
            className="form-control col-sm-4 ml-2"
            placeholder="荣誉名称"
            value={searchName}
            onChange={onChangeSearchName}
            id="searchName"
          />

          <select
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchType}
            onChange={onChangeSearchType}
            id="searchType"
          >
            <option value="">奖项类型</option>
            {types.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <select
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchCategory}
            onChange={onChangeSearchCategory}
            id="searchCategory"
          >
            <option value="">奖项级别</option>
            {categories.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

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
{/*
            <button
              className="btn btn-primary"
              type="button"
              onClick={retrieveSimpleExportAwards}
            >
              导出
            </button>
*/}
            <button hidden={schoolId}
              className="btn btn-primary"
              type="button"
              onClick={retrieveExportAwards}
            >
              导出
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
                      || column.id === 'name')
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

export default AwardsList;