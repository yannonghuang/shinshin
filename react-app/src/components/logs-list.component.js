import React, { Component } from "react";
import LogDataService from "../services/log.service";
import AuthService from "../services/auth.service";

import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useFlexLayout, useBlockLayout, useResizeColumns, useSortBy } from "react-table";

const LogsList = (props) => {
  const [logs, setLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [userId, setUserId] = useState(AuthService.getCurrentUser() ? AuthService.getCurrentUser().id : null);

  const [orderby, setOrderby] = useState([]);

  const logsRef = useRef();
  logsRef.current = logs;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const onChangeText = (e) => {
    const text = e.target.value;
    setText(text);
  };

  const onChangeSearchText = (e) => {
    const searchText = e.target.value;
    setSearchText(searchText);
  };

  const getRequestParams = (/*searchText, page, pageSize, schoolId, orderby*/) => {
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

    if (orderby) {
      params["orderby"] = orderby;
    }

    return params;
  };

  const retrieveLogs = () => {
    const params = getRequestParams(/*searchText, page, pageSize, schoolId, orderby*/);

    LogDataService.getAll2(params)
      .then((response) => {
        const { logs, totalPages } = response.data;

        setLogs(logs);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveLogs, [page, pageSize, orderby]);

  const refreshList = () => {
    retrieveLogs();
    setText("");
  };


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
        props.history.push("/logs");

        let newLogs = [...logsRef.current];
        newLogs.splice(rowIndex, 1);

        setLogs(newLogs);
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
        Header: "修改人",
        accessor: 'userId',
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
        disableSortBy: true,
      },
      {
        Header: "老值",
        accessor: "oldv",
      },
      {
        Header: "新值",
        accessor: "newv",
      },
      {
        Header: "删除",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <span onClick={() => deleteLog(rowIdx)}>
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
    state: {sortBy},
  } = useTable({
    columns,
    data: logs,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
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

  const search = () => {
    setPage(1);
    retrieveLogs();
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

  return (
    <div className="list row">
      <div className="col-md-6">
        <h6>修改记录</h6>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="新值或老值"
            value={searchText}
            onChange={onChangeSearchText}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={search}
            >
              查找
            </button>
          </div>
        </div>

        <div className="col-md-6 mt-3">
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
                    {/*column.isSorted*/ (column.id === 'createdAt' || column.id === 'user.username')
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

      <div className="col-md-8">
        <button className="btn btn-sm btn-danger" onClick={removeAllLogs}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default LogsList;