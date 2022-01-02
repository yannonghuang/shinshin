import React, { Component } from "react";
import ProjectDataService from "../services/project.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

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
    const searchCreatedAt = e; // e.target.value;
    setSearchCreatedAt(searchCreatedAt);
  };

  const onChangeSearchInputCreatedAt = (e) => {
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


  const getRequestParams = (/*searchName, page, pageSize, orderby,
    searchCode, searchRegion, searchCreatedAt, schoolId, */exportFlag) => {
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
    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchCreatedAt, schoolId, */false);

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

  const retrieveExportProjects = () => {
    const params = getRequestParams(/*searchName, page, pageSize, orderby,
        searchCode, searchRegion, searchCreatedAt, schoolId, */true);

    ProjectDataService.getAll2(params)
      .then((response) => {
        const { projects, totalPages, totalItems } = response.data;
        setExportProjects(projects);
        console.log(response.data);

        const csv = ProjectDataService.exportCSV(projects, columns);
        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'project.csv'
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

      })
      .catch((e) => {

        console.log(e);
      });
  };

  useEffect(retrieveProjects, [page, pageSize, orderby, searchCode, searchName, searchCreatedAt]);

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
        Header: "项目年份",
        accessor: "createdAt",
      },
      {
        Header: "项目状态",
        accessor: "status",
      },
      {
        Header: "项目申请(项目名称)",
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
        Header: "项目费用",
        accessor: "budget",
        disableSortBy: true,
      },
      {
        Header: "项目描述",
        accessor: "description",
        disableSortBy: true,
      },
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
        Header: "操作",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/projectsView/" + projectsRef.current[rowIdx].id}
                target='_blank'
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>

              <Link
                to={"/projects/" + projectsRef.current[rowIdx].id}
                target='_blank'
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>

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
    data: projects,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      sortBy: [
        {
          id: 'createdAt',
          desc: false
        }
      ]
    },
  },
  useSortBy,
  );

  const search = () => {
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
    if (sortBy && sortBy[0])
      setOrderby(sortBy);
  }, [sortBy]);


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

          <input
            type="text"
            readonly=""
            className="form-control"
            placeholder="项目年份"
            value={searchCreatedAt}
            onChange={onChangeSearchInputCreatedAt}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchCreatedAt}
            onSelect={onChangeSearchCreatedAt}
            hideInput={true}
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
              onClick={search}
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
                      {/*column.isSorted*/ (column.id === 'school.region' || column.id === 'school.code' ||
                      column.id === 'school.name' || column.id === 'createdAt' || column.id === 'status' )
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
        <button className="btn btn-sm btn-danger" onClick={removeAllProjects}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default ProjectsList;