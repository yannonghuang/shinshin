import React, { Component } from "react";
import UserDataService from "../services/auth.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import AuthService from "../services/auth.service";
import ProjectDataService from "../services/project.service";

import YearPicker from 'react-single-year-picker';

const UsersList = (props) => {

  const refreshOnReturn = () => {
    window.onblur = () => {window.onfocus = () => {retrieveUsers(true)}}
  };

  const [users, setUsers] = useState([]);

  const [exportUsers, setExportUsers] = useState([]);

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
                                               {name: "volunteer", label: "欣欣义工"},
                                               {name: "admin", label: "管理员"},
                                             ]);

  const [titlesFull, setTitlesFull] = useState([]);

  const [departmentsFull, setDepartmentsFull] = useState([]);

  const pageSizes = [20, 30, 50];

  const orderbyDefault = [
    {
      id: 'startAt',
      desc: true
    }
  ];

  const [orderby, setOrderby] = useState(orderbyDefault);

  const [startup, setStartup] = useState(true);

  const [totalItems, setTotalItems] = useState(0);

  const [schoolTitle, setSchoolTitle] = useState(null);

  const [searchRole, setSearchRole] = useState("");
  const onChangeSearchRole = (e) => {
    const searchRole = e.target.value;
    setSearchRole(searchRole);

    setStartup(false);
  };

  const [searchTitle, setSearchTitle] = useState("");
  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);

    setStartup(false);
  };

  const [searchUsername, setSearchUsername] = useState("");
  const onChangeSearchUsername = (e) => {
    const searchUsername = e.target.value;
    setSearchUsername(searchUsername);

    setStartup(false);
  };

  const [searchEmail, setSearchEmail] = useState("");
  const onChangeSearchEmail = (e) => {
    const searchEmail = e.target.value;
    setSearchEmail(searchEmail);

    setStartup(false);
  };

  const [searchSchoolCode, setSearchSchoolCode] = useState("");
  const onChangeSearchSchoolCode = (e) => {
    const searchSchoolCode = e.target.value;
    setSearchSchoolCode(searchSchoolCode);

    setStartup(false);
  };

  const [searchContactOnly, setSearchContactOnly] = useState(null);
  const onChangeSearchContactOnly = (e) => {
    const searchContactOnly = e.target.value;
    setSearchContactOnly(searchContactOnly);

    setStartup(false);
  };

  const [searchEmailVerified, setSearchEmailVerified] = useState(null);
  const onChangeSearchEmailVerified = (e) => {
    const searchEmailVerified = e.target.value;
    setSearchEmailVerified(searchEmailVerified);

    setStartup(false);
  };

  const [searchStartAt, setSearchStartAt] = useState("");
  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);

    setStartup(false);
  };


  const getRequestParams = (exportFlag = false, refresh = false) => {
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

    if (searchUsername) {
      params["username"] = searchUsername;
    }

    if (searchEmail) {
      params["email"] = searchEmail;
    }

    if (searchRole) {
      params["role"] = searchRole;
    }

    if (searchTitle) {
      params["title"] = searchTitle;
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

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
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

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    if (!exportFlag)
      localStorage.setItem(REQUEST_PARAMS_KEY, JSON.stringify(params));

    return params;
  };


  const restoreRequestParams = (params) => {
    if (!params) return;

    setSearchUsername(params["username"]);
    setSearchEmail(params["email"]);
    setSearchRole(params["role"]);
    setSearchTitle(params["title"]);
    setSearchSchoolCode(params["schoolCode"]);
    setSearchContactOnly(params["contactOnly"]);
    setSearchEmailVerified(params["emailVerified"]);
    setSearchStartAt(params["startAt"]);
    setPage(params["page"] + 1);
    setPageSize(params["size"]);
    setSchoolId(params["schoolId"]);
    setOrderby(params["orderby"]);

  };

  const onClearSearch = (e) => {
    setSearchUsername("");
    setSearchEmail("");
    setSearchSchoolCode("");
    setSearchRole("");
    setSearchTitle("");
    setSearchContactOnly("");
    setSearchEmailVerified("");
    setOrderby(orderbyDefault);
    setSearchStartAt("");

    setPage(1);

    setStartup(false);
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
        r = r + ", " + usersRef.current[rowIdx].roles[i].name;
        //r = r + ", " + getRoleLabel(usersRef.current[rowIdx].roles[i].name);
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

  const getTitles = () => {
    AuthService.getUserTitles()
      .then(response => {
        setTitlesFull(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getTitles, []);

  const getDepartments = () => {
    AuthService.getVolunteerDepartments()
      .then(response => {
        setDepartmentsFull(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getDepartments, []);

  const retrieveUsers = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(false, refresh);

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

  const retrieveExportUsers = () => {
    const params = getRequestParams(true);

    UserDataService.getAll2(params)
      .then((response) => {
        const { users, totalPages, totalItems } = response.data;

        setExportUsers(users);
        console.log(response.data);

        const csv = ProjectDataService.exportCSV(users, columns,
          {
            header: '职务/部门',
            translate: (title) => {return title.replace(/,/gm, "，") },
          }          
        );
        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'user.csv'
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
    retrieveUsers();
  };

  useEffect(retrieveUsers, [page]);
  useEffect(search, [pageSize, orderby, searchRole, searchTitle, searchUsername, searchEmail, searchSchoolCode,
    searchContactOnly, searchEmailVerified, searchStartAt]);
  useEffect(() => {retrieveUsers(true)}, []);

  const removeAllUsers = () => {
    UserDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        search();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openUser = (rowIndex) => {
    const id = usersRef.current[rowIndex].id;
    //props.history.push("/users/" + id);
    const win = window.open("/users/" + id, "_blank");
    win.focus();
  };

  const deleteUser = (rowIndex) => {
    const id = usersRef.current[rowIndex].id;

    UserDataService.delete(id)
      .then((response) => {
        //props.history.push("/users");
        let newUsers = [...usersRef.current];
        newUsers.splice(rowIndex, 1);
        setUsers(newUsers);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
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
        Header: "创建时间",
        accessor: "startAt",
      },

      {
        Header: "用户名",
        accessor: "username",
        disableSortBy: true,
      },
      {
        Header: "姓名",
        accessor: "chineseName",
        disableSortBy: true,
      },
      {
        Header: "电子邮件",
        accessor: "email",
        disableSortBy: true,
      },
      {
        Header: "手机号",
        accessor: "phone",
        disableSortBy: true,
      },
      {
        Header: "职务/部门",
        accessor: "title",
        disableSortBy: true,      
      },
      {
        Header: "角色",
        accessor: 'roles.name',
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
        disableSortBy: true,
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
        disableSortBy: true,
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
      {
        Header: "注册用户",
        accessor: 'contactOnly',
        disableSortBy: true,
        /**
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {usersRef.current[rowIdx].contactOnly ? '否' : '是'}
            </div>
          );
        },
        */
      },
      {
        Header: "活跃",
        accessor: 'emailVerified',
        disableSortBy: true,
        /**
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {usersRef.current[rowIdx].emailVerified ? '是' : '否'}
            </div>
          );
        },
        */
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

              {(AuthService.isAdmin() || (AuthService.isVolunteer() && schoolId)) &&
              <span onClick={() => {refreshOnReturn(); openUser(rowIdx)}}>
                <i className="far fa-edit action mr-2"></i>
              </span>}

              {(AuthService.isAdmin() || (AuthService.isVolunteer() && schoolId)) &&
              <span onClick={() => window.confirm("您确定要删除吗 ?") && deleteUser(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>}
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
/**
      sortBy: [
        {
          id: 'startAt',
          desc: true
        }
      ]
*/
    },
  },
  useSortBy);

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
      <h4>{schoolTitle ? schoolTitle + " - " : ""}用户及联络人(总数：{totalItems})</h4>
      <div class="w-100"></div>

      <div className="col-sm-8">

        <div className="row" >
          <select
            className="form-control col-sm-3"
            value={searchContactOnly}
            onChange={onChangeSearchContactOnly}
            id="searchContactOnly"
          >
            <option value="">用户类型</option>
              <option value={false}>
                {'注册用户'}
              </option>
              <option value={true}>
                {'非注册用户'}
              </option>
          </select>

          <select hidden={schoolId}
            className="form-control col-sm-3 ml-2"
            value={searchRole}
            onChange={onChangeSearchRole}
            id="searchRole"
          >
            <option value="">角色</option>
            {rolesFull.map((option) => (
              <option value={option.name}>
                {option.label}
              </option>
            ))}
          </select>

          <select hidden={schoolId}
            className="form-control col-sm-3 ml-2"
            value={searchTitle}
            onChange={onChangeSearchTitle}
            id="searchTitle"
          >
            <option value="">职务/部门</option>
            {titlesFull.map((option) => (
              <option value={option}>
                {option}
              </option>
            ))}
            <option disabled>──────────</option>
            {departmentsFull.map((option) => (
              <option value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            className="form-control col-sm-2 ml-2"
            value={searchEmailVerified}
            onChange={onChangeSearchEmailVerified}
            id="searchEmailVerified"
          >
            <option value="">活跃</option>
              <option value={true}>
                {'是'}
              </option>
              <option value={false}>
                {'否'}
              </option>
          </select>

        </div>

        <div className="row mb-3">
          <input
            type="text"
            className="form-control col-sm-3"
            placeholder="用户名/姓名"
            value={searchUsername}
            onChange={onChangeSearchUsername}
            id="searchUsername"
          />

          <input
            type="text"
            className="form-control col-sm-3 ml-2"
            placeholder="电子邮件"
            value={searchEmail}
            onChange={onChangeSearchEmail}
          />


          <input hidden={schoolId}
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="学校编号"
            value={searchSchoolCode}
            onChange={onChangeSearchSchoolCode}
            id="searchSchoolCode"
          />

          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="创建年份"
            value={searchStartAt}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchStartAt}
            onSelect={onChangeSearchStartAt}
            hideInput={true}
            minRange={1995}
            maxRange={2025}
          />

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

        <div className="row mb-4">
{/*
          <button
            className="btn btn-primary mr-2"
            type="button"
            onClick={search}
          >
            查询
          </button>
*/}
          {schoolId && (<a target="_blank"
            onClick={refreshOnReturn}
            href={"/addU?schoolId=" + schoolId} class="btn btn-primary mr-2">
              新建联络人
          </a>)}

          <div hidden={isMobile}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={retrieveExportUsers}
            >
              导出
            </button>
          </div>

        </div>
      </div>

      <div className="mt-3 col-sm-4" hidden={schoolId}>
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
                        {/*column.isSorted*/ (column.id === 'lastLogin' || column.id === 'startAt')
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

      <div className="mb-3 col-sm-12" hidden={schoolId}>
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