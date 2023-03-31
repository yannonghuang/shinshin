import React from "react";
import DonorDataService from "../services/donor.service";
import ProjectDataService from "../services/project.service";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

import { isMobile } from 'react-device-detect';

import AuthService from "./../services/auth.service";

const DonorsList = (props) => {
  const REQUEST_PARAMS_KEY = window.location.href;

  const [donors, setDonors] = useState([]);
  const [exportDonors, setExportDonors] = useState([]);

  const [currentDonor, setCurrentDonor] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user'));

  const [currentIndex, setCurrentIndex] = useState(-1);

  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [searchStartAt, setSearchStartAt] = useState(props.match? props.match.params.startAt : props.startAt);

  const [formId, setFormId] = useState(props.match? props.match.params.formId : props.formId);
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [pCategoryId, setPCategoryId] = useState(props.match? props.match.params.pCategoryId : props.pCategoryId);
  const [searchName, setSearchName] = useState(props.match? props.match.params.name : props.name);

  const [schoolDisplay, setSchoolDisplay] = useState(null);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const donorsRef = useRef();
  donorsRef.current = donors;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [20, 30, 50];

  const orderbyDefault = [
    {
      id: 'donor',
      desc: false
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
        retrieveDonors(true);
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
    setSearchCode("");
    setSearchRegion("");
    setSearchStartAt("");
    setOrderby(orderbyDefault);
    setExportDonors([]);

    setPCategoryAll();

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
    setPage(params["page"] + 1);
    setPageSize(params["size"]);
    setOrderby(params["orderby"]);
    setSearchStartAt(params["startAt"]);
    setPCategoryId(params["pCategoryId"]);
  };


  const getRequestParams = (exportFlag, refresh = false) => {

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


    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }


    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    if ((pCategoryId || pCategoryId === 0) && (pCategoryId !== categories.length))
      params["pCategoryId"] = pCategoryId;

    if (!exportFlag)
      localStorage.setItem(REQUEST_PARAMS_KEY, JSON.stringify(params));

    return params;
  };

  const serializeRequestParams = () => {
    let params = JSON.parse(localStorage.getItem(REQUEST_PARAMS_KEY));
    if (!params) return '';

    let result = '?';

    if (params["startAt"]) {
      result += 'startAt=' + params["startAt"] + '&';
    }

    if (params["pCategoryId"])
      result += 'pCategoryId=' + params["pCategoryId"];

    return result;
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



  const retrieveDonors = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(false, refresh);

    DonorDataService.getAll2(params)
      .then((response) => {
        const { donors, totalPages, totalItems } = response.data;

        setDonors(donors);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveSimpleExportDonors = () => {retrieveExportDonors(false)}

  const retrieveExportDonors = (detail = true) => {
    const params = getRequestParams(true);

    DonorDataService.getAll2(params)
      .then((response) => {
        const { donors, totalPages, totalItems } = response.data;
        setExportDonors(donors);
        console.log(response.data);

        //const csv = DonorDataService.exportCSV(donors, columns);
        const csv = ProjectDataService.exportCSV(donors, columns);

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
          'donors.csv'
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
    retrieveDonors();
  };

  useEffect(search, [pageSize, orderby, searchCode, searchName, searchStartAt, searchRegion, pCategoryId]);
  useEffect(retrieveDonors, [page]);
  useEffect(() => {retrieveDonors(true)}, []);

  const refreshList = () => {
    retrieveDonors();
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

  const removeAllDonors = () => {
    DonorDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openDonor = (rowIndex) => {
    const id = donorsRef.current[rowIndex].id;

    props.history.push("/donors/" + id);
  };

  const deleteDonor = (rowIndex) => {
    const id = donorsRef.current[rowIndex].id;

    DonorDataService.delete(id)
      .then((response) => {

        //props.history.push("/donors");

        let newDonors = [...donorsRef.current];
        newDonors.splice(rowIndex, 1);

        setDonors(newDonors);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderSchool = (rowIdx) => {
    let r = "";
    if (donorsRef.current[rowIdx].school) {
      r = donorsRef.current[rowIdx].school.code + "/" + donorsRef.current[rowIdx].school.name;
    }
    return r;
  }

  const subtract = (columnSet1, columnSet2) => {
    let result = [];
    for (var i = 0; i < columnSet1.length; i++)
      if (!columnSet2.includes(columnSet1[i].accessor)) result.push(columnSet1[i])
    return result;
  }

  const displayDesignations = (designations) => {


    let result = '';
    for (var i = 0; i < designations.length; i++)
      result +=
              <Link
                target="_blank"
                to={"/designations/" + designations[i].id}
                className= "badge badge-success mr-2"
              >
                designations[i].id
              </Link>;

     return result;
  }

  const columns = useMemo(
    () => [
      {
        Header: "捐款人",
        accessor: "donor",
      },
      {
        Header: "名称",
        accessor: "name",
      },
      {
        Header: "手机",
        accessor: "phone",
      },
      {
        Header: "电子邮件",
        accessor: "email",
      },
      {
        Header: "指定",
        accessor: "designationsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <a href={"/designations/donor/" + donorsRef.current[rowIdx].id + serializeRequestParams()}>
                {donorsRef.current[rowIdx].designationsCount}
              </a>
            </div>
          );
        },
      },
      {
        Header: "捐赠",
        accessor: "donationsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <a href={"/donations/donor/" + donorsRef.current[rowIdx].id }>
                {donorsRef.current[rowIdx].donationsCount}
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
                to={"/addDesignation/" + donorsRef.current[rowIdx].id}
                className= "badge badge-success mr-2"
              >
                指定
              </Link>

              <Link
                onClick={refreshOnReturn}
                target="_blank"
                to={"/addDonation/" + donorsRef.current[rowIdx].id}
                className= "badge badge-success mr-2"
              >
                捐赠
              </Link>

              {currentUser &&
              (!xr || (xr && AuthService.isAdmin())) && (<Link
                to={"/donorsView" + (xr ? 'XR' : '') + "/" + donorsRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>)}

              {!readonly &&
              ((!xr && AuthService.isVolunteer()) || (xr && AuthService.isAdmin())) &&
              (<Link
                onClick={refreshOnReturn}
                target = '_blank' // {embedded ? '_self' : '_blank'}
                to={"/donors" + (xr ? 'XR' : '') + "/" + donorsRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {!readonly && AuthService.isAdmin() && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteDonor(rowIdx)}>
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
    data: donors,
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
          捐款人列表 (总数：{totalItems})
        </h4>
        <div className="row mb-3 ">

          <input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="捐款人"
            value={searchName}
            onChange={onChangeSearchName}
            id="searchName"
          />

          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="指定年份"
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
            指定项目类型
            </option>
          </select>

{/*
          <input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="学校编号"
            value={searchCode}
            onChange={onChangeSearchCode}
            id="searchCode"
          />
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
              onClick={retrieveSimpleExportDonors}
            >
              导出
            </button>
*/}
            <button hidden={schoolId}
              className="btn btn-primary"
              type="button"
              onClick={retrieveExportDonors}
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
                      {/*column.isSorted*/ (column.id === 'name' || column.id === 'donor'
                      || column.id === 'designationsCount' || column.id === 'donationsCount')
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

export default DonorsList;