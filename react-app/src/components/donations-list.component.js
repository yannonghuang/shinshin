import React, { Component } from "react";
import DonationDataService from "../services/donation.service";
import ProjectDataService from "../services/project.service";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy, useFlexLayout } from "react-table";

import YearPicker from 'react-single-year-picker';

import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import AuthService from "./../services/auth.service";

const DonationsList = (props) => {
  const [donations, setDonations] = useState([]);
  const [exportDonations, setExportDonations] = useState([]);

  const [currentDonation, setCurrentDonation] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user'));

  const [currentIndex, setCurrentIndex] = useState(-1);

  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [searchStartAt, setSearchStartAt] = useState(props.match? props.match.params.startAt : props.startAt);

  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);

  const [donorId, setDonorId] = useState(props.match? props.match.params.donorId : props.donorId);
  const [projectId, setProjectId] = useState(props.match? props.match.params.projectId : props.projectId);

  const [pCategoryId, setPCategoryId] = useState(props.match? props.match.params.pCategoryId : props.pCategoryId);
  const [searchName, setSearchName] = useState(props.match? props.match.params.name : props.name);

  const [searchDonor, setSearchDonor] = useState('');

  const [searchType, setSearchType] = useState('');

  const [schoolDisplay, setSchoolDisplay] = useState(null);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const donationsRef = useRef();
  donationsRef.current = donations;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [20, 30, 50];

  const orderbyDefault = [
    {
      id: 'startAt',
      desc: true
    }
  ];

  const [orderby, setOrderby] = useState(orderbyDefault);

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
        retrieveDonations(true);
      }
    }
  };

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);

    setStartup(false);
  };

  const onChangeSearchDonor = (e) => {
    const searchDonor = e.target.value;
    setSearchDonor(searchDonor);

    setStartup(false);
  };


  const onChangeSearchType = (e) => {
    const searchType = e.target.value;
    setSearchType(searchType);

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

    setStartup(false);
  };

  const onClearSearch = (e) => {
    setSearchName("");
    setSearchDonor("");
    setSearchCode("");
    setSearchRegion("");
    setSearchStartAt("");
    setOrderby(orderbyDefault);
    setExportDonations([]);

    //setPCategoryAll();

    setPage(1);

    setStartup(false);
  };

  const setPCategoryAll = () => {
    const select = document.getElementById('pCategoryId');
    select.value = 'all';
    setPCategoryId(categories.length);
  }


  const restoreRequestParams = (params) => {
    if (!params) return;

    setSearchName(params["name"]);
    setSearchDonor(params["donor"]);
    setSearchType(params["type"]);
    setDonorId(params["donorId"]);
    setProjectId(params["projectId"]);
    setPage(params["page"] + 1);
    setPageSize(params["size"]);
    setOrderby(params["orderby"]);
    setSearchStartAt(params["startAt"]);
    setPCategoryId(params["pCategoryId"]);

  };

  const getRequestParams = (exportFlag, refresh = false) => {
    const REQUEST_PARAMS_KEY = window.location.href;

    if (refresh) {
      let params = JSON.parse(localStorage.getItem(REQUEST_PARAMS_KEY));
      if (params) {
        restoreRequestParams(params);
        localStorage.removeItem(REQUEST_PARAMS_KEY);
        return params;
      }
    }

    let params = {};

    if (searchName) {
      params["name"] = searchName;
    }

    if (searchDonor) {
      params["donor"] = searchDonor;
    }

    if (searchType) {
      params["type"] = searchType;
    }

    if (donorId) {
      params["donorId"] = donorId;
    }

    if (projectId) {
      params["projectId"] = projectId;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if (orderby && orderby[0])
      params["orderby"] = orderby;


    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }


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
    DonationDataService.getCategories()
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

  const retrieveDonations = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, schoolId, */false, refresh);

    DonationDataService.getAll2(params)
      .then((response) => {
        const { donations, totalPages, totalItems } = response.data;

        setDonations(donations);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveSimpleExportDonations = () => {retrieveExportDonations(false)}

  const retrieveExportDonations = (detail = true) => {
    const params = getRequestParams(true);

    DonationDataService.getAll2(params)
      .then((response) => {
        const { donations, totalPages, totalItems } = response.data;
        setExportDonations(donations);
        console.log(response.data);

        const csv = ProjectDataService.exportCSV(donations, columns,
          {
            header: '项目类型',
            translate: (dataIndex) => {return ProjectDataService.getCategory(dataIndex)}
          }
        );

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
          'donations.csv'
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
    retrieveDonations();
  };

  useEffect(search, [pageSize, orderby, searchCode, searchName, searchDonor, searchType, searchStartAt, searchRegion, pCategoryId]);
  useEffect(retrieveDonations, [page]);
  useEffect(() => {retrieveDonations(true)}, []);

  const refreshList = () => {
    retrieveDonations();
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

  //useEffect(getSchoolDisplay, [schoolId]);

  const removeAllDonations = () => {
    DonationDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openDonation = (rowIndex) => {
    const id = donationsRef.current[rowIndex].id;

    props.history.push("/donations/" + id);
  };

  const deleteDonation = (rowIndex) => {
    const id = donationsRef.current[rowIndex].id;

    DonationDataService.delete(id)
      .then((response) => {

        //props.history.push("/donations");

        let newDonations = [...donationsRef.current];
        newDonations.splice(rowIndex, 1);

        setDonations(newDonations);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderSchool = (rowIdx) => {
    let r = "";
    if (donationsRef.current[rowIdx].school) {
      r = donationsRef.current[rowIdx].school.code + "/" + donationsRef.current[rowIdx].school.name;
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
        Header: "日期",
        accessor: "startAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
          const t = (new Date(donationsRef.current[rowIdx].startAt)).toDateString();
          return (
            <div>{t}</div>
          );
        },
      },
      {
        Header: "捐款人",
        accessor: "donor.donor",
        Cell: (props) => {
          const rowIdx = props.row.id;
          const donor = donationsRef.current[rowIdx].donor;
          return (
            <div>
              <a href={"/donorsView/" + donationsRef.current[rowIdx].donorId }>
                {donor.donor}
              </a>
            </div>
          );
        },
      },
      {
        Header: "金额",
        accessor: "amount",
      },
      {
        Header: "类别",
        accessor: "type",
        disableSortBy: true,
      },
      {
        Header: "说明",
        accessor: "description",
        disableSortBy: true,
      },
      {
        Header: "指定",
        accessor: "designationsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <a href={"/designations/donation/" + donationsRef.current[rowIdx].id }>
                {donationsRef.current[rowIdx].designationsCount}
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
              <Link
                onClick={refreshOnReturn}
                target="_blank"
                to={"/addDesignation/" + donationsRef.current[rowIdx].donorId + "?donationId=" + donationsRef.current[rowIdx].id}
                className= "badge badge-success mr-2"
              >
                指定
              </Link>

              {currentUser &&
              (!xr || (xr && AuthService.isAdmin())) && (<Link
                to={"/donationsView" + (xr ? 'XR' : '') + "/" + donationsRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>)}

              {!readonly &&
              ((!xr && AuthService.isVolunteer()) || (xr && AuthService.isAdmin())) &&
              (<Link
                onClick={refreshOnReturn}
                target = '_blank' // {embedded ? '_self' : '_blank'}
                to={"/donations" + (xr ? 'XR' : '') + "/" + donationsRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {!readonly && AuthService.isAdmin() && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteDonation(rowIdx)}>
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

  const xrColumns =
    ["response.title", "status"];

  hiddenColumns = xr
    ? [...hiddenColumns, ...xrColumns]
    : hiddenColumns;

  hiddenColumns = [...hiddenColumns, ...hiddenColumnsMobile];

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
    data: donations,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns
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
          捐赠列表 (总数：{totalItems})
          {projectId && <a href={"/projectsView/" + projectId }> - 指定项目</a>}
          {donorId && <a href={"/donorsView/" + donorId }> - 捐款人</a>}
        </h4>
        <div className="row mb-3 ">

          <input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="捐款人名称"
            value={searchDonor}
            onChange={onChangeSearchDonor}
            id="searchDonor"
          />

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
            className="form-control col-sm-2 ml-2"
            placeholder="类别"
            value={searchType}
            onChange={onChangeSearchType}
            id="searchType"
          />
{/*
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

          <input
            type="text"
            className="form-control col-sm-3 ml-2"
            placeholder="指定名称"
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
*/}
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
              onClick={retrieveSimpleExportDonations}
            >
              导出
            </button>
*/}
            <button hidden={schoolId}
              className="btn btn-primary"
              type="button"
              onClick={retrieveExportDonations}
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
                      {/*column.isSorted*/ (column.id === 'appellation' || column.id === 'pCategoryId'
                      || column.id === 'startAt' || column.id === 'donor' || column.id === 'amount'
                      || column.id === 'schoolId' || column.id === 'donor.donor' || column.id === 'designationsCount')
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

export default DonationsList;