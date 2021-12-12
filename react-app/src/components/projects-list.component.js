import React, { Component } from "react";
import ProjectDataService from "../services/project.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce } from "react-table";

import YearPicker from 'react-single-year-picker';
import { CSVLink, CSVDownload } from "react-csv";

const ProjectsList = (props) => {
  const [projects, setProjects] = useState([]);
  const [exportProjects, setExportProjects] = useState([]);

  const [currentProject, setCurrentProject] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [searchCreatedAt, setSearchCreatedAt] = useState("");
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);

  const projectsRef = useRef();
  projectsRef.current = projects;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [5, 10, 20];

  const [orderby, setOrderby] = useState([]);

  const [regions, setRegions] = useState([]);


  const [createdAt, setCreatedAt] = useState(
  []
  );

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

  const onChangeSearchCreatedAt = (e) => {
    const searchCreatedAt = e; //e.target.value;
    setSearchCreatedAt(searchCreatedAt);
  };


  const onClearSearch = (e) => {
    setSearchName("");
    setSearchCode("");
    setSearchRegion("");
    setSearchCreatedAt("");
    setOrderby([]);
    setExportProjects([]);
  };


  const getRequestParams = (searchName, page, pageSize, orderby,
    searchCode, searchRegion, searchCreatedAt, schoolId, exportFlag) => {
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

    if (searchCreatedAt) {
      params["createdAt"] = searchCreatedAt;
    }

    if (schoolId) {
      params["schoolId"] = schoolId;
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

  const retrieveProjects = () => {
    const params = getRequestParams(searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchCreatedAt, schoolId, false);

    ProjectDataService.getAll2(params)
      .then((response) => {
        const { projects, totalPages, totalItems } = response.data;

        setProjects(projects);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const toCSV = (obj, path = '') => {
    if (!(obj instanceof Object)) {
      const p = path.substring(0, path.lastIndexOf('.')); // drop the last "."
      return {header: p, body: (obj ? obj : '')};
    }

    if (obj instanceof Array) {
      var body = '';
      var header = '';
      for (var i = 0; i < obj.length; i++) {
        const result = toCSV(obj[i], path);
        body = body + result.body + '\n';
        if (!header.endsWith('\n'))
          header = header + result.header + '\n';
      }
      return {header: header, body: body};
    }

    if (obj instanceof Object) {
      var body = '';
      var header = '';
      Object.keys(obj).forEach(key => {
        const result = toCSV(obj[key], path + key + '.');
        body = body + result.body + ', ';
        if (!header.endsWith('\n'))
          header = header + result.header + ', ';
      })
      body = body.substring(0, body.lastIndexOf(',')); // drop last ', '
      header = header.substring(0, header.lastIndexOf(',')); // drop last ', '
      return {header: header, body: body};
    }

  }

  const translate = (header) => {
    const columns = header.split(',');
    var result = "";
    for (var i = 0; i < columns.length; i++) {
      for (var j = 0; j < exportHeaders.length; j++) {
        if (columns[i].trim() === exportHeaders[j].key) {
          result = result + exportHeaders[j].label + ",";
        }
      }
    }

    result = result.substring(0, result.lastIndexOf(',')); // drop last ', '
    return result;
  }

  const retrieveExportProjects = () => {
    const params = getRequestParams(searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchCreatedAt, schoolId, true);

    ProjectDataService.getAll2(params)
      .then((response) => {
        const { projects, totalPages, totalItems } = response.data;
        setExportProjects(projects);
        console.log(response.data);

        const csv = toCSV(projects);
        const url = window.URL.createObjectURL(new Blob([translate(csv.header) + '\n' + csv.body]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'project.csv' //'file.file' response.headers["Content-Disposition"].split("filename=")[1]
            ); //or any other extension
        document.body.appendChild(link);
        link.click();
        link.remove();

      })
      .catch((e) => {

        console.log(e);
      });
  };

  const exportHeaders = [
    {key: "id", label: "id"},
    {key: "name", label: "项目名称"},
    {key: "budget", label: "费用"},
    {key: "status", label: "状态"},
    {key: "createdAt", label: "创建时间"},
    {key: "school.id", label: "学校id"},
    {key: "school.code", label: "学校编号"},
    {key: "school.name", label: "学校名称"},
    {key: "school.region", label: "省（直辖市）"},
    {key: "response.id", label: "项目申请id"},
    {key: "response.title", label: "项目申请"},
  ];

  useEffect(retrieveProjects, [page, pageSize, orderby]);

  const refreshList = () => {
    retrieveProjects();
  };

  const removeAllProjects = () => {
    ProjectDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openProject = (rowIndex) => {
    const id = projectsRef.current[rowIndex].id;

    props.history.push("/projects/" + id);
  };

  const deleteProject = (rowIndex) => {
    const id = projectsRef.current[rowIndex].id;

    ProjectDataService.delete(id)
      .then((response) => {
        props.history.push("/projects");

        let newProjects = [...projectsRef.current];
        newProjects.splice(rowIndex, 1);

        setProjects(newProjects);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderSchool = (rowIdx) => {
    let r = "";
    if (projectsRef.current[rowIdx].school) {
      r = projectsRef.current[rowIdx].school.code + "/" + projectsRef.current[rowIdx].school.name;
    }
    return r;
  }

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        disableSortBy: true,
      },
      {
        Header: "省（直辖市）",
        accessor: "school.region",
      },
      {
        Header: "学校编号",
        accessor: "school.code",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(projectsRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + projectsRef.current[rowIdx].school.id}
              >
                {projectsRef.current[rowIdx].school.code}
              </Link>
              ) : ''}
            </div>
          );
        },
      },
      {
        Header: "学校名称",
        accessor: "school.name",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(projectsRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + projectsRef.current[rowIdx].school.id}
              >
                {projectsRef.current[rowIdx].school.name}
              </Link>
              ) : ''}
            </div>
          );
        },
      },
      {
        Header: "项目申请",
        accessor: "response.title",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            {(projectsRef.current[rowIdx].response) ? (
              <Link
                to={"/responsesView/" + projectsRef.current[rowIdx].response.id}
              >
                {projectsRef.current[rowIdx].response.title}
              </Link>
              ) : ''}
            </div>
          );
        },
      },
      {
        Header: "项目名称",
        accessor: "name",
      },
      {
        Header: "项目费用",
        accessor: "budget",
        disableSortBy: true,
      },
      {
        Header: "项目年份",
        accessor: "createdAt",
      },
      {
        Header: "项目状态",
        accessor: "status",
      },
/*}
      {
        Header: "文档",
        accessor: "dossiersCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/dossiers/project/" + projectsRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {projectsRef.current[rowIdx].dossiersCount}
              </Link>
            </div>
          );
        },
      },
*/
      {
        Header: "操作",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/projectsView/" + projectsRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>

              <span onClick={() => openProject(rowIdx)}>
                <i className="far fa-edit action mr-2"></i>
              </span>

              <span onClick={() => deleteProject(rowIdx)}>
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


  function SelectCreatedAtFilter({
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
        {createdAt.map((option, i) => (
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
    data: projects,
    manualFilters: true,
    autoResetFilters: false,
    defaultColumn,

    manualSortBy: true,
    initialState: {
        sortBy: [
            {
                id: 'id',
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
    retrieveProjects();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  useEffect(() => {
    setOrderby(sortBy);
/**
  }
    const result = [];
    for (var i = 0; i < sortBy.length; i++) {
      result.push([sortBy[i].id, (sortBy[i].desc ? "desc" : "asc")]);

      const s = sortBy[i].id.split(".");
      if (s.length == 1) result.push([s[0], (sortBy[i].desc ? "desc" : "asc")]);
      if (s.length == 2) result.push([s[0], s[1], (sortBy[i].desc ? "desc" : "asc")]);

    }
setOrderby(result);
      */
  }, [sortBy]);

  useEffect(() => {
  }, [filters]);


  return (
    <div className="list row">
      <div className="col-md-9">
        <h4>项目列表(总数：{totalItems})</h4>
        <div className="input-group mb-3 ">

          <input
            type="text"
            className="form-control"
            placeholder="项目名称"
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

          <YearPicker
            yearArray={['2019', '2020']}
            value={searchCreatedAt}
            onSelect={onChangeSearchCreatedAt}
            hideInput={false}
            minRange={1995}
            maxRange={2022}
          />

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
              onClick={retrieveExportProjects}
            >
              导出
            </button>
          </div>
{/*
          <CSVLink
          data={exportProjects}
          headers={exportHeaders}
          enclosingCharacter={`'`}
          separator={","}
          filename={"Projects.csv"}
          className="btn btn-primary"
          target="_blank"


          asyncOnClick={true}
          onClick={(event, done) => {
            async_retrieveExportProjects().then((response) => {
            const { projects, totalPages, totalItems } = response.data;
            setExportProjects(projects);
            console.log(response.data);
            done(); // REQUIRED to invoke the logic of component
            });
          }}

          onClick={() => {
            sync_retrieveExportProjects();

            console.log("You click the link"); // 👍🏻 Your click handling logic
            }}

          >
            导出
          </CSVLink>
*/}

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
                                        {/*column.isSorted*/ (column.id === 'school.region' || column.id === 'school.code' ||
                                        column.id === 'school.name' || column.id === 'createdAt' || column.id === 'status' ||
                                        column.id === 'name')
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                    {/* Render the columns filter UI */}
                                    {/* <div>column.canFilter (column.id === 'region' || column.id === 'createdAt' ) ?
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
        <button className="btn btn-sm btn-danger" onClick={removeAllProjects}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default ProjectsList;