import React, { Component } from "react";
import SchoolDataService from "../services/school.service";
import ProjectDataService from "../services/project.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce } from "react-table";

import YearPicker from 'react-single-year-picker';

const SchoolsList = (props) => {
  const [schools, setSchools] = useState([]);
  const [exportSchools, setExportSchools] = useState([]);

  const [currentSchool, setCurrentSchool] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [searchStartAt, setSearchStartAt] = useState("");

  const schoolsRef = useRef();
  schoolsRef.current = schools;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [5, 10, 20];

  const [orderby, setOrderby] = useState([]);

  const [regions, setRegions] = useState([]);

  const [startAt, setStartAt] = useState([]);

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

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onChangeSearchInputStartAt = (e) => {
    const searchStartAt = e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onClearSearch = (e) => {
    setSearchName("");
    setSearchCode("");
    setSearchRegion("");
    setSearchStartAt("");
    setOrderby([]);
    setExportSchools([]);
  };

  const getRequestParams = (searchName, page, pageSize, orderby,
    searchCode, searchRegion, searchStartAt, exportFlag) => {
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

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    return params;
  };

  // Define a default UI for filtering
  function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
  }) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)

    return (
      <span>
        Search:{' '}
          <input
            className="form-control"
            value={value || ""}
            onChange={e => {
                setValue(e.target.value);
                onChange(e.target.value);
            }}
            placeholder={`${count} records...`}
          />
      </span>
    )
  }

  function DefaultColumnFilter({
      column: { filterValue, preFilteredRows, setFilter },
    }) {
      const count = preFilteredRows.length

      return (
        <input
          className="form-control"
          value={filterValue || ''}
          onChange={e => {
            setFilter(e.target.value || undefined)
          }}
          placeholder={`Search ${count} records...`}
        />
      )
  }

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

  useEffect(getRegions, [orderby]);

  const retrieveSchools = () => {
    const params = getRequestParams(searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, false);

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
    const params = getRequestParams(searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchStartAt, true);

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
        Header: "省/直辖市",
        accessor: "region",
        Filter: SelectRegionFilter,
      },
      {
        Header: "校长",
        accessor: "principal",
        disableSortBy: true,
      },
      {
        Header: "创建年份",
        accessor: "startAt",
        //Filter: SelectStartAtFilter,
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
        accessor: "projectsCount",
        disableSortBy: true,
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
        disableSortBy: true,
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
              >
                <i className="fas fa-eye action mr-2"></i>
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

  function SelectRegionFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) {
  // Render a multi-select box
    return (
      <select
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">请选择</option>
        {regions.map((option, i) => (
          <option key={i} value={option}>
          {option}
        </option>
        ))}
      </select>
    );
  }


  function SelectStartAtFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) {
  // Render a multi-select box
    return (
      <select
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">请选择</option>
        {startAt.map((option, i) => (
          <option key={i} value={option}>
          {option}
        </option>
        ))}
      </select>
    );
  }

  const defaultColumn = React.useMemo(
      () => ({
          // Default Filter UI
          Filter: DefaultColumnFilter,
      }),
      []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    state: {filters},
    state: {sortBy},
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable({
    columns,
    data: schools,
    manualFilters: true,
    autoResetFilters: false,
    defaultColumn,

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
  useFilters,
  useGlobalFilter,
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
    const result = [];
    for (var i = 0; i < sortBy.length; i++) {
      result.push([sortBy[i].id, (sortBy[i].desc ? "desc" : "asc")]);
    }
    setOrderby(result);
    //setOrderby(" order by " + sortBy[0].id + (sortBy[0].desc ? " desc " : " asc "));
    //retrieveSchools();

  }, [sortBy]);

  useEffect(() => {
  }, [filters]);


  return (
    <div className="list row">
      <div className="col-md-9">
        <h4>学校列表(总数：{totalItems})</h4>
        <div className="input-group mb-3 ">

          <input
            type="text"
            className="form-control"
            placeholder="学校名称"
            value={searchName}
            onChange={onChangeSearchName}
          />
          <input
            type="text"
            className="form-control"
            placeholder="学校编号"
            value={searchCode}
            onChange={onChangeSearchCode}
          />

          <input
            type="text"
            className="form-control"
            placeholder="创建年份"
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

          <select
            className="form-control"
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
              className="btn btn-primary badge btn-block"
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
              className="btn btn-primary"
              type="button"
              onClick={retrieveExportSchools}
            >
              导出
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 col-md-3">
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

{/*
        <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
        />
*/}
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
                      column.id === 'studentsCount' || column.id === 'name')
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                    </span>
                      {/* Render the columns filter UI */}
                      {/* <div>column.canFilter (column.id === 'region' || column.id === 'startAt' ) ?
                      column.render('Filter') : null}</div> */}
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