import React, { Component } from "react";
import UserDataService from "../services/auth.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import AuthService from "../services/auth.service";

const UsersList = (props) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchUsername, setSearchUsername] = useState("");

  const usersRef = useRef();
  usersRef.current = users;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [rolesFull, setRolesFull] = useState([
                                               {name: "user", label: "学校用户"},
                                               {name: "admin", label: "管理员"},
                                               {name: "moderator", label: "教师"},
                                               {name: "volunteer", label: "欣欣义工"},
                                             ]);

  const pageSizes = [5, 10, 20];

  const onChangeSearchUsername = (e) => {
    const searchUsername = e.target.value;
    setSearchUsername(searchUsername);
  };

  const getRequestParams = (searchUsername, page, pageSize) => {
    let params = {};

    if (searchUsername) {
      params["username"] = searchUsername;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    return params;
  };

  const getRoleLabel = (name, rolesFull) => {
    for (var i = 0; i < rolesFull.length; i++) {
      if (rolesFull[i].name === name) {
        return rolesFull[i].label;
      }
    }
    return null;
  }

  const renderRoles = (rowIdx) => {
    let r = "";
    if (usersRef.current[rowIdx].roles && usersRef.current[rowIdx].roles[0]) {
      r = getRoleLabel(usersRef.current[rowIdx].roles[0].name, rolesFull);
      for (var i = 1; i < usersRef.current[rowIdx].roles.length; i++) {
        r = r + ", " + getRoleLabel(usersRef.current[rowIdx].roles[i].name, rolesFull);
      }
    }
    return r;
  }

  const renderSchool = (rowIdx) => {
    let r = "";
    if (usersRef.current[rowIdx].school) {
      r = usersRef.current[rowIdx].school.region + "/" + usersRef.current[rowIdx].school.name;
    }
    return r;
  }

  const getRoles = () => {
    AuthService.getRoles()
      .then(response => {
        setRolesFull(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  //useEffect(() => { getRoles(); });
  useEffect(getRoles, []);

  const retrieveUsers = () => {
    const params = getRequestParams(searchUsername, page, pageSize);

    UserDataService.getAll2(params)
      .then((response) => {
        const { users, totalPages } = response.data;

        setUsers(users);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveUsers, [page, pageSize]);

  const refreshList = () => {
    retrieveUsers();
  };

  const removeAllUsers = () => {
    UserDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openUser = (rowIndex) => {
    const id = usersRef.current[rowIndex].id;
    props.history.push("/users/" + id);
  };

  const deleteUser = (rowIndex) => {
    const id = usersRef.current[rowIndex].id;

    UserDataService.delete(id)
      .then((response) => {
        props.history.push("/users");
        let newUsers = [...usersRef.current];
        newUsers.splice(rowIndex, 1);
        setUsers(newUsers);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "id",
        accessor: "id",
      },
      {
        Header: "用户名",
        accessor: "username",
      },
      {
        Header: "中文名",
        accessor: "chineseName",
      },
      {
        Header: "电子邮件",
        accessor: "email",
      },
      {
        Header: "角色",
        accessor: '',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {renderRoles(rowIdx)}
            </div>
          );
        },
      },
      {
        Header: "学校",
        accessor: 'school',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {usersRef.current[rowIdx].school ? (
              <Link
                to={"/schoolsView/" + usersRef.current[rowIdx].school.id}
                className="badge badge-success"
              >
                {renderSchool(rowIdx)}
              </Link>
            ) : ''}
            </div>
          );
        },
      },
      {
        Header: "操作",
        accessor: "actions",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/usersView/" + usersRef.current[rowIdx].id}
              >
                <i className="fas fa-glasses action mr-2"></i>
              </Link>

              <span onClick={() => openUser(rowIdx)}>
                <i className="far fa-edit action mr-2"></i>
              </span>

              <span onClick={() => deleteUser(rowIdx)}>
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
  } = useTable({
    columns,
    data: users,
  },
  useSortBy);

  const findByName = () => {
    setPage(1);
    retrieveUsers();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };


  return (
    <div className="list row">
      <div className="col-md-6">
        <h4>用户列表</h4>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by username"
            value={searchUsername}
            onChange={onChangeSearchUsername}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByName}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 col-md-6">
        {"Items per Page: "}
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
                                        {column.isSorted
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
        <button className="btn btn-sm btn-danger" onClick={removeAllUsers}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default UsersList;