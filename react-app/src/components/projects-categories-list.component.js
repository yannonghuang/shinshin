import React, { Component } from "react";
import ProjectDataService from "../services/project.service";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTable, useSortBy, useFlexLayout } from "react-table";

import YearPicker from 'react-single-year-picker';

import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import AuthService from "./../services/auth.service";

const ProjectsByCategoriesList = (props) => {
  const [projects, setProjects] = useState([]);
  const [exportProjects, setExportProjects] = useState([]);

  const [currentProject, setCurrentProject] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(-1);

  const [pCategoryId, setPCategoryId] = useState(props.match? props.match.params.pCategoryId : props.pCategoryId);


  const projectsRef = useRef();
  projectsRef.current = projects;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [totalItems, setTotalItems] = useState(0);

  const pageSizes = [20, 30, 50];

  const [categories, setCategories] = useState(ProjectDataService.PROJECT_CATEGORIES);
  const [searchStartAt, setSearchStartAt] = useState(props.match? props.match.params.startAt : props.startAt);
  const [searchName, setSearchName] = useState(props.match? props.match.params.name : props.name);

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchPCategory = (e) => {
    const searchPCategory = e.target.selectedIndex;
    setPCategoryId(searchPCategory === 0 ? null : searchPCategory);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; // e.target.value;
    setSearchStartAt(searchStartAt);
  };


  const onClearSearch = (e) => {
    setSearchName("");
    setSearchStartAt("");
    setPCategoryId(0);
    setExportProjects([]);
  };


  const getRequestParams = (exportFlag = false) => {
    let params = {};

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if (pCategoryId) {
      params["pCategoryId"] = pCategoryId;
    }

    if (searchName) {
      params["name"] = searchName;
    }

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }


    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    return params;
  };

/**
  const getCategories = () => {
    ProjectDataService.getCategories()
      .then(response => {
        setCategories(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getCategories, []);
*/

  const retrieveExportProjects = () => {
    const params = getRequestParams(true);

    ProjectDataService.getAllByCategories(params)
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

  const retrieveProjects = () => {
    const params = getRequestParams();

    ProjectDataService.getAllByCategories(params)
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

  useEffect(retrieveProjects, [page, pageSize, searchName, searchStartAt, pCategoryId]);

  const columns = useMemo(
    () => [
      {
        Header: "项目年份",
        accessor: "startAt",
      },
      {
        Header: "标题",
        accessor: "name",
      },
      {
        Header: "学校项目数",
        accessor: "count",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                target = '_blank'
                to={"/projectsByCategoryByStartAt/" + projectsRef.current[rowIdx].pCategoryId +
                    "/" + projectsRef.current[rowIdx].startAt +
                    "/" + projectsRef.current[rowIdx].name}
              >
                {projectsRef.current[rowIdx].count}
              </Link>

            </div>
          );
        },
      },
      {
        Header: "申请表",
        accessor: "formId",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div hidden={!projectsRef.current[rowIdx].formId}>
              <Link
                target = '_blank'
                to={"/formsView/" + projectsRef.current[rowIdx].formId}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>
              {AuthService.isAdmin() && <Link
                target = '_blank'
                to={"/forms/" + projectsRef.current[rowIdx].formId}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>}
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
  });

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };



  return (
    <div className="list row">
      <div className="col-sm-9">
        <h4>
          项目列表 {pCategoryId && '(项目类型：' + categories[pCategoryId] + ')'}(项目总数：{totalItems})
        </h4>

        <div className="row mb-3 ">

          <input
            type="text"
            className="form-control col-sm-4 ml-2"
            placeholder="项目名称"
            value={searchName}
            onChange={onChangeSearchName}
          />

          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="年份"
            value={searchStartAt}
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
            className="form-control col-sm-4 ml-2"
            placeholder="...."
            value={categories[pCategoryId]}
            onChange={onChangeSearchPCategory}
          >
            {categories.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>

{/*
          <select
            className="form-control col-sm-2 ml-2"
            placeholder="...."
            value={searchPCategoryId}
            onChange={onChangeSearchPCategoryId}
          >
            <option value="">项目类型/option>
            {categories.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
          </select>
*/}
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

          <div hidden={isMobile}>
            <button
              className="btn btn-primary ml-2"
              type="button"
              onClick={retrieveExportProjects}
            >
              导出
            </button>
          </div>
        </div>


      </div>

      <div className="mt-3 col-sm-3">
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
                  <th {...column.getHeaderProps()}>
                    {column.render('Header')}
                    {/* Add a sort direction indicator */}
                    <span>
                      {/*column.isSorted*/ (column.id === 'school.region' || column.id === 'school.code' ||
                      column.id === 'school.name' || column.id === 'status')
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

      <div className="mt-3 col-sm-">
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

export default ProjectsByCategoriesList;