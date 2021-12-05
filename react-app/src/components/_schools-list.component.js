import React, { Component } from "react";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy } from "react-table";

const SchoolsList = (props) => {
  const [schools, setSchools] = useState([]);
  const [currentSchool, setCurrentSchool] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchName, setSearchName] = useState("");

  const schoolsRef = useRef();
  schoolsRef.current = schools;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [5, 10, 20];

  const [orderby, setOrderby] = useState(" order by code asc");

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const getRequestParams = (searchName, page, pageSize, orderby) => {
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

    return params;
  };

  const retrieveSchools = () => {
    const params = getRequestParams(searchName, page, pageSize, orderby);

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

  useEffect(retrieveSchools, [page, pageSize, orderby]);

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
        props.history.push("/schools");

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
      },
      {
        Header: "学校编号",
        accessor: "code",
      },
      {
        Header: "学校名称",
        accessor: "name",
      },
      {
        Header: "校长",
        accessor: "principal",
      },
      {
        Header: "省/直辖市",
        accessor: "region",
      },
      {
        Header: "地址",
        accessor: "address",
      },
      {
        Header: "教师人数",
        accessor: "teachersCount",
      },
      {
        Header: "学生人数",
        accessor: "studentsCount",
      },
      {
        Header: "项目",
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
        Header: "文档",
        accessor: "documentsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/documents/school/" + schoolsRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {schoolsRef.current[rowIdx].documentsCount}
              </Link>
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
                to={"/schoolsView/" + schoolsRef.current[rowIdx].id}
              >
                <i className="fas fa-glasses action mr-2"></i>
              </Link>

              <span onClick={() => openSchool(rowIdx)}>
                <i className="far fa-edit action mr-2"></i>
              </span>

              <span onClick={() => deleteSchool(rowIdx)}>
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
    state: {sortBy}
  } = useTable({
    columns,
    data: schools,
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
  useSortBy);

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
    if (sortBy[0] && sortBy[0].id != 'actions') {
      setOrderby(" order by " + sortBy[0].id + (sortBy[0].desc ? " desc " : " asc "));
      retrieveSchools();
    }
  }, [sortBy]);

  return (
    <div className="list row">
      <div className="col-md-6">
        <h4>学校列表(总数：{totalItems})</h4>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={searchName}
            onChange={onChangeSearchName}
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
        <button className="btn btn-sm btn-danger" onClick={removeAllSchools}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default SchoolsList;