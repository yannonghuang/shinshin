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

  const usersRef = useRef();
  usersRef.current = users;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);

  const [rolesFull, setRolesFull] = useState([
                                               {name: "user", label: "学校用户"},
                                               {name: "admin", label: "管理员"},
                                               {name: "moderator", label: "教师"},
                                               {name: "volunteer", label: "欣欣义工"},
                                             ]);

  const pageSizes = [20, 30, 50];

  const [orderby, setOrderby] = useState([]);

  const [totalItems, setTotalItems] = useState(0);

  const [schoolTitle, setSchoolTitle] = useState(null);

  const [searchRole, setSearchRole] = useState("");
  const onChangeSearchRole = (e) => {
    const searchRole = e.target.value;
    setSearchRole(searchRole);
  };

  const [searchUsername, setSearchUsername] = useState("");
  const onChangeSearchUsername = (e) => {
    const searchUsername = e.target.value;
    setSearchUsername(searchUsername);
  };

  const [searchEmail, setSearchEmail] = useState("");
  const onChangeSearchEmail = (e) => {
    const searchEmail = e.target.value;
    setSearchEmail(searchEmail);
  };

  const [searchSchoolCode, setSearchSchoolCode] = useState("");
  const onChangeSearchSchoolCode = (e) => {
    const searchSchoolCode = e.target.value;
    setSearchSchoolCode(searchSchoolCode);
  };

  const [searchContactOnly, setSearchContactOnly] = useState(null);
  const onChangeSearchContactOnly = (e) => {
    const searchContactOnly = e.target.value;
    setSearchContactOnly(searchContactOnly);
  };

  const [searchEmailVerified, setSearchEmailVerified] = useState(null);
  const onChangeSearchEmailVerified = (e) => {
    const searchEmailVerified = e.target.value;
    setSearchEmailVerified(searchEmailVerified);
  };

  const getRequestParams = (/*searchUsername, searchRole, searchSchoolCode, page, pageSize, schoolId, orderby*/) => {
    let params = {};

    if (searchUsername) {
      params["username"] = searchUsername;
    }

    if (searchEmail) {
      params["email"] = searchEmail;
    }

    if (searchRole) {
      params["role"] = searchRole;
    }

    if (searchSchoolCode) {
      params["schoolCode"] = searchSchoolCode;
    }

    if (searchContactOnly) {
      params["contactOnly"] = searchContactOnly;
    }

    if (searchEmailVerified) {
      params["emailVerified"] = searchEmailVerified;
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

  const onClearSearch = (e) => {
    setSearchUsername("");
    setSearchEmail("");
    setSearchSchoolCode("");
    setSearchRole("");
    setSearchContactOnly("");
    setSearchEmailVerified("");
    setOrderby([]);
  };

  const getRoleLabel = (name) => {
    for (var i = 0; i < rolesFull.length; i++) {
      if (rolesFull[i].name.trim() === name.trim()) {
        return rolesFull[i].label;
      }
    }
    return null;
  }


  const renderRoles = (rowIdx) => {
    let r = "";
    if (usersRef.current[rowIdx].roles) {
      for (var i = 0; i < usersRef.current[rowIdx].roles.length; i++) {
        r = r + ", " + getRoleLabel(usersRef.current[rowIdx].roles[i].name);
      }
    }
    return r.substring(r.indexOf(',') + 2);
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

  useEffect(getRoles, []);

  const retrieveUsers = () => {
    const params = getRequestParams(/*searchUsername, searchRole, searchSchoolCode, page, pageSize, schoolId, orderby*/);

    UserDataService.getAll2(params)
      .then((response) => {
        const { users, totalPages, totalItems } = response.data;

        setUsers(users);
        setCount(totalPages);
        setTotalItems(totalItems);


        if (schoolId && users[0]) setSchoolTitle(users[0].school.name + "(" + users[0].school.code + ")");

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveUsers, [page, pageSize, orderby, searchRole, searchUsername, searchEmail, searchSchoolCode,
    searchContactOnly, searchEmailVerified]);

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
        //props.history.push("/users");
        let newUsers = [...usersRef.current];
        newUsers.splice(rowIndex, 1);
        setUsers(newUsers);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const schoolKnownColumns =
    [ 'school.code', 'school.name'];

  var hiddenColumns = [];
  if (schoolId) hiddenColumns = schoolKnownColumns;

  const columns = useMemo(
    () => [
/*
      {
        Header: "id",
        accessor: "id",
        disableSortBy: true,
      },
*/
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
        disableSortBy: true,
      },
      {
        Header: "职务",
        accessor: "title",
        disableSortBy: true,
      },
      {
        Header: "角色",
        accessor: 'roles',
        disableSortBy: true,
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
        Header: "学校编号",
        accessor: 'school.code',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {usersRef.current[rowIdx].school ? (
              <Link
                to={"/schoolsView/" + usersRef.current[rowIdx].school.id}
                className="badge badge-success"
              >
                {usersRef.current[rowIdx].school.code}
              </Link>
            ) : ''}
            </div>
          );
        },
      },
      {
        Header: "学校名称",
        accessor: 'school.name',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {usersRef.current[rowIdx].school ? (
              <Link
                to={"/schoolsView/" + usersRef.current[rowIdx].school.id}
                className="badge badge-success"
              >
                {usersRef.current[rowIdx].school.name}
              </Link>
            ) : ''}
            </div>
          );
        },
      },
      {
        Header: "上次登录时间",
        accessor: "lastLogin",
      },
/*
      {
        Header: "创建时间",
        accessor: "createdAt",
      },
*/
      {
        Header: "注册用户",
        accessor: 'contactOnly',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {usersRef.current[rowIdx].contactOnly ? '否' : '是'}
            </div>
          );
        },
      },
      {
        Header: "登录过?",
        accessor: 'emailVerified',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {usersRef.current[rowIdx].emailVerified ? '是' : '否'}
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
                to={"/usersView/" + usersRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>

              <span onClick={() => openUser(rowIdx)}>
                <i className="far fa-edit action mr-2"></i>
              </span>

              <span onClick={() => window.confirm("您确定要删除吗 ?") && deleteUser(rowIdx)}>
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
    data: users,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
    },
  },
  useSortBy);

  const search = () => {
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

  useEffect(() => {
    if (sortBy && sortBy[0])
      setOrderby(sortBy);
  }, [sortBy]);


  return (
    <div className="list row">
      <div className="col-sm-10">
        <h4>{schoolTitle ? schoolTitle + " - " : ""}用户列表(总数：{totalItems})</h4>
        <div className="input-group mb-3">
          <select
            className="form-control"
            value={searchRole}
            onChange={onChangeSearchRole}
          >
            <option value="">角色查询</option>
            {rolesFull.map((option) => (
              <option value={option.name}>
                {option.label}
              </option>
            ))}
          </select>

          {!schoolId && (<input
            type="text"
            className="form-control ml-2"
            placeholder="学校编码"
            value={searchSchoolCode}
            onChange={onChangeSearchSchoolCode}
          />)}

          <input
            type="text"
            className="form-control ml-2"
            placeholder="用户名/中文名"
            value={searchUsername}
            onChange={onChangeSearchUsername}
          />

          <input
            type="text"
            className="form-control ml-2"
            placeholder="电子邮件"
            value={searchEmail}
            onChange={onChangeSearchEmail}
          />

          <select
            className="form-control ml-2"
            value={searchContactOnly}
            onChange={onChangeSearchContactOnly}
          >
            <option value="">用户类型</option>
              <option value={false}>
                {'注册用户'}
              </option>
              <option value={true}>
                {'非注册用户'}
              </option>
          </select>

          <select
            className="form-control ml-2"
            value={searchEmailVerified}
            onChange={onChangeSearchEmailVerified}
          >
            <option value="">登录过?</option>
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
          <button
            className="btn btn-primary mr-2"
            type="button"
            onClick={search}
          >
            查询
          </button>

          {schoolId && (<a target="_blank"
            href={"/addU?schoolId=" + schoolId} class="btn btn-primary ">
              新建联络方式
          </a>)}

        </div>


      </div>

      <div className="mb-3 col-sm-2">
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

      <div className="mb-3 col-sm-12">
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

export default UsersList;