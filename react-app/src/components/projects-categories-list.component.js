import React from "react";
import ProjectDataService from "../services/project.service";
//import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

import { isMobile } from 'react-device-detect';

import AuthService from "./../services/auth.service";
import FormDataService from "../services/form.service";

const ProjectsByCategoriesList = (props) => {
  const [projects, setProjects] = useState([]);
  const [exportProjects, setExportProjects] = useState([]);

  const [currentProject, setCurrentProject] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(-1);

  const [pCategoryId, setPCategoryId] = useState(props.match? props.match.params.pCategoryId : props.pCategoryId);
  const [pSubCategoryId, setPSubCategoryId] = useState(props.match? props.match.params.pSubCategoryId : props.pSubCategoryId);

  const [canonical, setCanonical] = useState(window.location.pathname.includes('Canonical'));

  const [orderby, setOrderby] = useState([]);

  const projectsRef = useRef();
  projectsRef.current = projects;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [totalItems, setTotalItems] = useState(0);
  const [schoolProjectsCount, setSchoolProjectsCount] = useState(0);

  const pageSizes = [20, 30, 50];

  const [categories, setCategories] = useState(ProjectDataService.PROJECT_CATEGORIES);
  const [searchStartAt, setSearchStartAt] = useState(props.match? props.match.params.startAt : props.startAt);
  const [searchName, setSearchName] = useState(props.match? props.match.params.name : props.name);

  const [searchApplied, setSearchApplied] = useState(null);
  const onChangeSearchApplied = (e) => {
    const searchApplied = e.target.value;
    setSearchApplied(searchApplied);
  };

  const init = () => {
    if (!pCategoryId || (pCategoryId === 'null'))
      setPCategoryAll();
  }

  useEffect(init, []);

  const refreshOnReturn = () => {
    window.onblur = () => {window.onfocus = () => {retrieveProjects(true)}}
  };

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchPCategory = (e) => {
    //const searchPCategoryId = e.target.selectedIndex;
    const searchPCategoryId = e.target.selectedIndex < categories.length
      ? ProjectDataService.PROJECT_CATEGORIES_ID[e.target.selectedIndex].id
      : categories.length;

    setPCategoryId(searchPCategoryId);
    setPSubCategoryId(null);
  };

  const onChangeSearchPSubCategory = (e) => {
    const searchPSubCategoryId = e.target.selectedIndex;

    setPSubCategoryId(searchPSubCategoryId);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; // e.target.value;
    setSearchStartAt(searchStartAt);
  };


  const onClearSearch = (e) => {
    setSearchName("");
    setSearchStartAt("");
    setSearchApplied("");
    setExportProjects([]);
    setOrderby([]);

    setPCategoryAll();

    setPage(1);
  };

  const setPCategoryAll = () => {
    const select = document.getElementById('pCategoryId');
    select.value = 'all';
    setPCategoryId(categories.length);
    setPSubCategoryId('');    
  }

  const getRequestParams = (exportFlag = false, refresh = false) => {
    if (refresh) {
      let params = JSON.parse(localStorage.getItem('REQUEST_PARAMS'));
      if (params) {
        return params;
      }
    }

    let params = {};

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if ((pCategoryId || pCategoryId === 0) && (pCategoryId !== categories.length))
      params["pCategoryId"] = pCategoryId;

    if ((pSubCategoryId || pSubCategoryId === 0) && (pSubCategoryId !== ProjectDataService.getProjectSubCategories(pCategoryId).length))
       params["pSubCategoryId"] = pSubCategoryId;

    if (searchName) {
      params["name"] = searchName;
    }

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }

    if (searchApplied) {
      params["applied"] = searchApplied;
    }

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    if (canonical) {
      params["canonical"] = canonical;
    }

    if (orderby && orderby[0])
      params["orderby"] = orderby;
    else
      params["orderby"] = [{
        id: 'startAt',
        desc: true
      }];

    if (!exportFlag)
      localStorage.setItem('REQUEST_PARAMS', JSON.stringify(params));

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

        const csv = ProjectDataService.exportCSV(projects, columns, {
          header: '项目类型',
          translate: (dataIndex) => {return ProjectDataService.getCategory(dataIndex)},
          associate: {
            pCategoryId,
            header: '项目子类型',
            translate: (pCategoryId, pSubCategoryId) => {return ProjectDataService.getSubCategory(pCategoryId, pSubCategoryId)}
          }          
        });
        //const csv = ProjectDataService.exportCSV(projects, columns, {header: '项目类型', dictionary: categories});

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'projects_export.csv'
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveProjects = (refresh = false) => {
    const params = getRequestParams(false, refresh);

    ProjectDataService.getAllByCategories(params)
      .then((response) => {
        const { projects, totalPages, totalItems, schoolProjectsCount } = response.data;

        setProjects(projects);
        setCount(totalPages);
        setTotalItems(totalItems);
        setSchoolProjectsCount(schoolProjectsCount);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const search = () => {
    setPage(1);
    retrieveProjects();
  };

  useEffect(search, [pageSize, searchName, searchStartAt, pCategoryId, pSubCategoryId, searchApplied, orderby]);
  useEffect(retrieveProjects, [page]);


  const createVForm = (pCategoryId, startAt, name) => {

    var data = {
      title: name,
      description: '虚拟表格。。。',
      //deadline: this.state.currentForm.deadline,
      //published: this.state.currentForm.published,
      startAt: startAt,
      //fdata: this.fBuilder.actions.getData(),
      pCategoryId: pCategoryId,
    };

    FormDataService.createV(data)
	  .then(response => {
        console.log(response.data);

        const formId = response.data.id;
        const url = '/forms/' + formId;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
	  })
	  .catch((e) => {
	    alert(e);
        console.log(e);
      });
  }

  const columns = useMemo(
    () => [
      {
        Header: "项目年份",
        accessor: "startAt",
      },
      {
        Header: "项目类型",
        accessor: "pCategoryId",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {ProjectDataService.getCategory(projectsRef.current[rowIdx].pCategoryId) /*categories[projectsRef.current[rowIdx].pCategoryId]*/}
            </div>
          );
        },
      },
      {
        Header: "项目子类型",
        accessor: "pSubCategoryId",
        disableSortBy: true,        
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {ProjectDataService.getSubCategory(projectsRef.current[rowIdx].pCategoryId, projectsRef.current[rowIdx].pSubCategoryId) /*categories[projectsRef.current[rowIdx].pCategoryId]*/}
            </div>
          );
        },
      },      
      {
        Header: "项目名称",
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
                    "/" + projectsRef.current[rowIdx].pSubCategoryId +
                    "/" + projectsRef.current[rowIdx].startAt +
                    "/" + projectsRef.current[rowIdx].name +
                    "/" + projectsRef.current[rowIdx].formId
                    }
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
          <div>
            <div hidden={!projectsRef.current[rowIdx].formId}>
              <Link
                target = '_blank'
                to={"/formsView/" + projectsRef.current[rowIdx].formId}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>
              {AuthService.isAdmin() && <Link
                target = '_blank'
                onClick={refreshOnReturn}
                to={"/forms/" + projectsRef.current[rowIdx].formId}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>}
            </div>

            <div hidden={projectsRef.current[rowIdx].formId}>
              <a href="#" onClick={() => {
                    refreshOnReturn();
                    createVForm(projectsRef.current[rowIdx].pCategoryId,
                            projectsRef.current[rowIdx].startAt,
                            projectsRef.current[rowIdx].name);
                  }
                }
              >
                <i className="fas fa-plus action mr-2"></i>
              </a>
            </div>
          </div>
          );
        },
      },
    ],
    []
  );

  var hiddenColumns = (canonical)
    ? ['formId', 'pSubCategoryId']
    : ['pSubCategoryId'];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: {sortBy},
  } = useTable({
    columns,
    data: projects,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
      sortBy: [
        {
          id: 'startAt',
          desc: true
        }
      ]
    },
  },
  useSortBy
  );

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
          项目列表 {!canonical && '-系统迁移'}
          {((pCategoryId || pCategoryId === 0) && (pCategoryId !== categories.length)) &&
          '(项目类型：' + ProjectDataService.getCategory(pCategoryId) + ')'}(项目总数：{totalItems}；学校项目总数：{schoolProjectsCount})
        </h4>

        <div className="row mb-3 ">

          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="年份"
            value={searchStartAt}
            id="searchStartAt"
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchStartAt}
            onSelect={onChangeSearchStartAt}
            hideInput={true}
            minRange={1995}
            maxRange={2025}
          />

          <select
            className="form-control col-sm-3 ml-2"
            placeholder="...."
            value={pCategoryId < categories.length ? ProjectDataService.getCategory(pCategoryId) : 'all' }
            onChange={onChangeSearchPCategory}
            id="pCategoryId"
          >
            {categories.map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
            <option value='all'>
            项目类型
            </option>
          </select>

          <select hidden={true}
            className="form-control col-sm-3 ml-2"
            placeholder="...."
            value={ ProjectDataService.getSubCategory(pCategoryId, pSubCategoryId) }
            onChange={onChangeSearchPSubCategory}
            id="pSubCategoryId"
          >
            {ProjectDataService.getProjectSubCategories(pCategoryId).map((option) => (
            <option value={option}>
            {option}
            </option>
            ))}
            <option value=''>
            项目子类型
            </option>
          </select>

          <input
            type="text"
            className="form-control col-sm-4 ml-2"
            placeholder="项目名称"
            value={searchName}
            onChange={onChangeSearchName}
            id="searchName"
          />

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

          <select hidden={canonical}
            className="form-control col-sm-2 ml-2"
            value={searchApplied}
            onChange={onChangeSearchApplied}
            id="searchApplied"
          >
            <option value="">申请表?</option>
              <option value={true}>
                {'有'}
              </option>
              <option value={false}>
                {'无'}
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

          <div hidden={isMobile}>
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
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    {/* Add a sort direction indicator */}
                    <span>
                      {/*column.isSorted*/ (column.id === 'startAt' || column.id === 'pCategoryId' ||
                      column.id === 'name')
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