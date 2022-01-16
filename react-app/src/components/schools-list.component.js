import React, { Component } from "react";
import SchoolDataService from "../services/school.service";
import ProjectDataService from "../services/project.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import { withRouter } from "react-router-dom";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

const SchoolsList = (props) => {
  const [schools, setSchools] = useState([]);
  const [exportSchools, setExportSchools] = useState([]);

  const [currentSchool, setCurrentSchool] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState(props.match? props.match.params.region : props.region);
  const [searchStartAt, setSearchStartAt] = useState("");
  const [searchLastVisit, setSearchLastVisit] = useState("");
  const [searchDonor, setSearchDonor] = useState("");
  const [searchStage, setSearchStage] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchRequest, setSearchRequest] = useState("");

  const schoolsRef = useRef();
  schoolsRef.current = schools;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [5, 10, 20];

  const [orderby, setOrderby] = useState([]);

  const [regions, setRegions] = useState([]);
  const [stages, setStages] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [requests, setRequests] = useState([]);


  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchCode = (e) => {
    const searchCode = e.target.value;
    setSearchCode(searchCode);
  };

  const onChangeSearchRegion = (e) => {
    const searchRegion = e.target.value;
    setSearchRegion(searchRegion);
  };

  const onChangeSearchDonor = (e) => {
    const searchDonor = e.target.value;
    setSearchDonor(searchDonor);
  };

  const onChangeSearchStage = (e) => {
    const searchStage = e.target.value;
    setSearchStage(searchStage);
  };

  const onChangeSearchStatus = (e) => {
    const searchStatus = e.target.value;
    setSearchStatus(searchStatus);
  };

  const onChangeSearchRequest = (e) => {
    const searchRequest = e.target.value;
    setSearchRequest(searchRequest);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onChangeSearchInputStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onChangeSearchLastVisit = (e) => {
    const searchLastVisit = e; //e.target.value;
    setSearchLastVisit(searchLastVisit);
  };

  const onChangeSearchInputLastVisit = (e) => {
    const searchLastVisit = e; //e.target.value;
    setSearchLastVisit(searchLastVisit);
  };


  const onClearSearch = (e) => {
    setSearchName("");
    setSearchCode("");
    setSearchRegion("");
    setSearchStartAt("");
    setSearchLastVisit("");
    setSearchDonor("");
    setSearchStage("");
    setSearchStatus("");
    setSearchRequest("");

    setOrderby([]);
    setExportSchools([]);
  };

  const getRequestParams = (/*searchName, page, pageSize, orderby,
    searchCode, searchRegion, searchStartAt, */exportFlag) => {
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

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
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

    if (searchRequest) {
      params["request"] = searchRequest;
    }

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

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
  useEffect(getRequests, [orderby]);

  const retrieveSchools = () => {
    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, */false);

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

  const retrieveExportSchools = () => {
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

  useEffect(retrieveSchools, [page, pageSize, orderby, searchName, searchCode, searchRegion, searchStartAt,
                            searchLastVisit, searchDonor, searchStage, searchStatus, searchRequest]);

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
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        disableSortBy: true,
      },
      {
        Header: "学校编号",
        accessor: "code",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/schoolsView/" + schoolsRef.current[rowIdx].id}
              >
                {schoolsRef.current[rowIdx].code}
              </Link>
            </div>
          );
        },
      },
      {
        Header: "学校名称",
        accessor: "name",
      },
      {
        Header: "建校年份",
        accessor: "startAt",
        //Filter: SelectStartAtFilter,
      },
      {
        Header: "最近访校年份",
        accessor: "lastVisit",
        //Filter: SelectStartAtFilter,
      },
      {
        Header: "捐款人",
        accessor: "donor",
        disableSortBy: true,
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
      {
        Header: "需求状态",
        accessor: "request",
      },
      {
        Header: "省/自治区",
        accessor: "region",
      },
/**
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
                to={"/projects/school/" + schoolsRef.current[rowIdx].id}
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
                to={"/responses/school/" + schoolsRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {schoolsRef.current[rowIdx].responsesCount}
              </Link>
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
                target='_blank'
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>

              <Link
                to={"/schools/" + schoolsRef.current[rowIdx].id}
                target='_blank'
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>

              <span onClick={() => window.confirm("您确定要删除吗 ?") && deleteSchool(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>
            </div>
          );
        },
      },
    ],
    []
  );


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
      sortBy: [
        {
          id: 'code',
          desc: false
        }
      ]
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
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  useEffect(() => {
    if (sortBy && sortBy[0])
      setOrderby(sortBy);
  }, [sortBy]);

  //useEffect(() => {
  //}, [filters]);


  return (
    <div className="list row">
      <div className="col-md-9">
        <h4>学校列表(总数：{totalItems})</h4>
        <div className="row mb-3 ">

          <input
            type="text"
            className="form-control col-md-2 ml-2"
            placeholder="学校编号"
            value={searchCode}
            onChange={onChangeSearchCode}
          />

          <input
            type="text"
            className="form-control col-md-4 ml-2"
            placeholder="学校名称"
            value={searchName}
            onChange={onChangeSearchName}
          />


          <input
            type="text"
            readonly=""
            className="form-control col-md-1 ml-2"
            placeholder="建校"
            value={searchStartAt}
            onChange={onChangeSearchInputStartAt}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchStartAt}
            onSelect={onChangeSearchStartAt}
            hideInput={true}
            minRange={1995}
            maxRange={2022}
          />


          <input
            type="text"
            readonly=""
            className="form-control col-md-1 ml-2"
            placeholder="访校"
            value={searchLastVisit}
            onChange={onChangeSearchInputLastVisit}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchLastVisit}
            onSelect={onChangeSearchLastVisit}
            hideInput={true}
            minRange={1995}
            maxRange={2022}
          />

          <input
            type="text"
            className="form-control col-md-2 ml-2"
            placeholder="捐款人"
            value={searchDonor}
            onChange={onChangeSearchDonor}
          />


        </div>

        <div className="row mb-3 ">


          <select
            className="form-control col-md-2 ml-2"
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

          <select
            className="form-control col-md-2 ml-2"
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

          <select
            className="form-control col-md-2 ml-2"
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

          <select
            className="form-control col-md-2 ml-2"
            placeholder="...."
            value={searchRegion}
            onChange={onChangeSearchRegion}
          >
            <option value="">省（直辖市）</option>
            {regions.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <div>
            <button
              className="btn btn-primary badge btn-block ml-2"
              type="button"
              onClick={onClearSearch}
            >
              清空
            </button>
          </div>

        </div>

        <div className="input-group mb-4">
          <div>
            <button
              className="btn btn-primary badge-success"
              type="button"
              onClick={findByName}
            >
              查询
            </button>
          </div>
          <div>
            <button
              className="btn btn-primary ml-2"
              type="button"
              onClick={retrieveExportSchools}
            >
              导出
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 col-md-3">
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

      <div className="col-md-12 list">
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
                      column.id === 'stage' || column.id === 'lastVisit' ||
                      column.id === 'status' || column.id === 'request'
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

      <div className="col-md-8">
      </div>
    </div>
  );
};

export default withRouter(SchoolsList);