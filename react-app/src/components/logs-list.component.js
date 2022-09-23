import React, { Component } from "react";
import Select from 'react-select';

import LogDataService from "../services/log.service";
import AuthService from "../services/auth.service";
import SchoolDataService from "../services/school.service";
import ProjectDataService from "../services/project.service";

import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useFlexLayout, useBlockLayout, useResizeColumns, useSortBy } from "react-table";

import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import YearPicker from 'react-single-year-picker';

const LogsList = (props) => {
  const [logs, setLogs] = useState([]);
  const [exportLogs, setExportLogs] = useState([]);

  const [currentLog, setCurrentLog] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [school, setSchool] = useState(null);
  const [userId, setUserId] = useState(AuthService.getCurrentUser() ? AuthService.getCurrentUser().id : null);

  const [searchCreatedAt, setSearchCreatedAt] = useState("");
  const [searchRegion, setSearchRegion] = useState("");

  const [totalItems, setTotalItems] = useState(0);

  const [orderby, setOrderby] = useState([]);

  const [searchField, setSearchField] = useState("");
  const [importantFields, setImportantFields] = useState([]);

  const getImportantFields = () => {
    SchoolDataService.getImportantFields()
      .then(response => {
        setImportantFields(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getImportantFields, []);

  const [schools, setSchools] = useState([]);

  const convert = (schools) => {
    const result = [];
    if (schools) {
    for (var i = 0; i < schools.length; i++) {
      result.push({value: schools[i].id,
        label: schools[i].code + "-" + schools[i].name + "-" + schools[i].region});
    }
    return result;
    }
  }

  const getSchools = () => {
    SchoolDataService.getAllSimple()
      .then(response => {
        setSchools(convert(response.data));
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getSchools, []);

  const [regions, setRegions] = useState([]);

  const getRegions = () => {
    SchoolDataService.getRegions()
      .then(response => {
        setRegions(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getRegions, []);

  const logsRef = useRef();
  logsRef.current = logs;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const pageSizes = [20, 30, 50];

  const onChangeText = (e) => {
    const text = e.target.value;
    setText(text);
  };

  const onChangeSearchText = (e) => {
    const searchText = e.target.value;
    setSearchText(searchText);
  };

  const onChangeSearchField = event => {
    const selected = [...event.target.selectedOptions].map(opt => opt.value);
    setSearchField(selected);
  }

  const onChangeSearchCreatedAt = (e) => {
    const searchCreatedAt = e; //e.target.value;
    setSearchCreatedAt(searchCreatedAt);
  };

  const onChangeSchoolId = (e) => {
    setSchoolId(e.value) //.target.value
  }

  const onChangeSearchRegion = (e) => {
    const searchRegion = e.target.value;
    setSearchRegion(searchRegion);
  }

  const display = (schoolId) => {
    if (schools) {
      for (var i = 0; i < schools.length; i++) {
        if (schools[i].value == schoolId)
          return schools[i];
      }
      return [];
    }
  }

  const customFilter = (option, inputValue) => {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

  const onClearSearch = (e) => {
    setSearchText("");
    setSearchField("");
    setSchoolId(null);
    setSearchCreatedAt("");
    setSearchRegion("");

    setOrderby([]);

    setPage(1);
  };

  const getRequestParams = (/*searchText, page, pageSize, schoolId, orderby*/exportFlag = false) => {
    let params = {};

    if (searchText) {
      params["text"] = searchText;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if (schoolId) {
      params["schoolId"] = schoolId;
    }

    if (searchField) {
      params["field"] = searchField;
    }

    if (searchCreatedAt) {
      params["createdAt"] = searchCreatedAt;
    }

    if (searchRegion) {
      params["region"] = searchRegion;
    }

    if (orderby) {
      params["orderby"] = orderby;
    }

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    return params;
  };

  const retrieveLogs = () => {
    const params = getRequestParams(/*searchText, page, pageSize, schoolId, orderby*/);

    LogDataService.getAll2(params)
      .then((response) => {
        const { logs, totalPages, totalItems } = response.data;

        setLogs(logs);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const search = () => {
    setPage(1);
    retrieveLogs();
  };

  useEffect(search, [pageSize, orderby, searchText, searchField, searchCreatedAt, schoolId, searchRegion]);

  useEffect(retrieveLogs, [page]);

  const retrieveExportLogs = () => {
    const params = getRequestParams(true);

    LogDataService.getAll2(params)
      .then((response) => {
        const { logs, totalPages, totalItems } = response.data;

        setExportLogs(logs);
        console.log(response.data);

        //const csv = ProjectDataService.exportCSV(logs, columns);

        const csv = ProjectDataService.exportCSV(logs, columns, {
          header: '时间',
          translate: (dataIndex) => {return new Date(dataIndex).toLocaleDateString('zh-cn',
            { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        });

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'school_change_logs.csv'
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

      })
      .catch((e) => {
        console.log(e);
      });
  };

  const refreshList = () => {
    retrieveLogs();
    setText("");
  };

  const retrieveSchool = () => {
    if (!schoolId) {
      setSchool(null);
      return;
    }

    SchoolDataService.get(schoolId)
      .then((response) => {
        setSchool(response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveSchool, [schoolId]);

  const save = (e) => {

    var data = {
      text: text,
      userId: userId,
      schoolId: schoolId
    };

    LogDataService.create(data)
      .then(response => {
        refreshList();
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }


  const removeAllLogs = () => {
    LogDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const deleteLog = (rowIndex) => {
    const id = logsRef.current[rowIndex].id;

    LogDataService.delete(id)
      .then((response) => {
        //props.history.push("/logs");

        let newLogs = [...logsRef.current];
        newLogs.splice(rowIndex, 1);

        setLogs(newLogs);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "时间",
        accessor: "createdAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
          const d = new Date(logsRef.current[rowIdx].createdAt);
          return (
            <div>
              {d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          );
        },
      },
      {
        Header: "学校",
        accessor: 'school.code',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>

              {logsRef.current[rowIdx].school && <Link
                to={"/schoolsView/" + logsRef.current[rowIdx].schoolId}
                className="badge badge-success"
              >
                {logsRef.current[rowIdx].school.code}
              </Link>}

            </div>
          );
        },
      },
      {
        Header: "地区",
        accessor: 'school.region'
      },
      {
        Header: "修改人",
        accessor: 'user.chineseName',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            { (logsRef.current[rowIdx].user) ? (
              <Link
                to={"/usersView/" + logsRef.current[rowIdx].user.id}
                className="badge badge-success"
              >
                {logsRef.current[rowIdx].user.chineseName
                  ? logsRef.current[rowIdx].user.chineseName
                  : logsRef.current[rowIdx].user.username
                }
              </Link>
            ) : ''}
            </div>
          );
        },
      },
      {
        Header: "修改字段",
        accessor: "field",
      },
      {
        Header: "老值",
        accessor: "oldv",
        disableSortBy: true,
      },
      {
        Header: "新值",
        accessor: "newv",
        disableSortBy: true,
      },
      {
        Header: "删除",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              {AuthService.isAdmin() &&
                <span onClick={() => window.confirm("您确定要删除吗 ?") && deleteLog(rowIdx)}>
                  <i className="fas fa-trash action"></i>
                </span>
              }
            </div>
          );
        },
      },
    ],
    []
  );

  const hiddenColumns = schoolId
    ? 'school.code'
    : [];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: {sortBy},
  } = useTable({
    columns,
    data: logs,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      //hiddenColumns: hiddenColumns,
      sortBy: [
        {
          id: 'createdAt',
          desc: true
        }
      ]
    },
  },
  useFlexLayout,
  useSortBy);

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


  return (
    <div className="list row">
      <div className="col-sm-9">
      <h4>
        {school ? school.name + '-' : ''}
        学校信息修改记录(总数：{totalItems})
      </h4>

        <div className="row">
          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-3"
            placeholder="修改年份"
            value={searchCreatedAt}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchCreatedAt}
            onSelect={onChangeSearchCreatedAt}
            hideInput={true}
            minRange={1995}
            maxRange={2030}
          />


          <select
            className="form-control col-sm-4 ml-3"
            placeholder="字段名称"
            value={searchField}
            onChange={onChangeSearchField}
          >
            <option value="">字段名称</option>
            {importantFields.map((option) => (
            <option value={option.name}>
            {option.label + '-' + option.name}
            </option>
            ))}
          </select>

        </div>

        <div className="row">


{/*
          <input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="新值或老值查询"
            value={searchText}
            onChange={onChangeSearchText}
          />
*/}

          <select
            className="form-control col-sm-2 ml-3"
            placeholder="...."
            value={searchRegion}
            onChange={onChangeSearchRegion}
          >
            <option value="">地区</option>
            {regions.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

          <Select onChange={onChangeSchoolId}
            placeholder="学校"
            className="col-sm-6"
            id="schoolId"
            value={display(schoolId)}
            name="schoolId"
            filterOption={customFilter}
            options={schools}
          />

          <div>
            <button
              className="btn btn-primary ml-2 mb-2"
              type="button"
              onClick={onClearSearch}
            >
              清空
            </button>
          </div>
        </div>

        <div className="row mb-4 ml-1">
          <div hidden={isMobile}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={retrieveExportLogs}
            >
              导出
            </button>
          </div>
        </div>

      </div>

        <div className="col-sm-3">
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
                <th {...column.getHeaderProps(column.getSortByToggleProps(), {
                /*
                  style: {
                      minWidth: column.minWidth,
                      width: column.width,
                    },
                */
                  })}
                >
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span>
                    {/*column.isSorted*/ (column.id === 'createdAt' || column.id === 'user.chineseName' ||
                    column.id === 'field' || column.id === 'school.code' || column.id === 'school.region')
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
                      <td {...cell.getCellProps({

                          style: {
                            minWidth: cell.column.minWidth,
                            width: cell.column.width,
                            whiteSpace: 'pre-wrap'
                          },

                        })}>
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="col-sm-8">
      </div>
    </div>
  );
};

export default LogsList;