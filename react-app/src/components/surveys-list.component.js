import React, { Component } from "react";
import SurveyDataService from "../services/survey.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

const SurveysList = (props) => {
  const [surveys, setSurveys] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [docCategory, setDocCategory] = useState(props.match? props.match.params.docCategory : props.docCategory);

  const [orderby, setOrderby] = useState([]);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const surveysRef = useRef();
  surveysRef.current = surveys;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const onChangeSearchOriginalname = (e) => {
    const searchOriginalname = e.target.value;
    setSearchOriginalname(searchOriginalname);
  };

  const getRequestParams = (/*searchOriginalname, page, pageSize, schoolId, docCategory*/) => {
    let params = {};

    if (searchOriginalname) {
      params["originalname"] = searchOriginalname;
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

    if (docCategory) {
      params["docCategory"] = docCategory;
    }

    if (orderby) {
      params["orderby"] = orderby;
    }

    return params;
  };

  const retrieveSurveys = () => {
    const params = getRequestParams(/*searchOriginalname, page, pageSize, schoolId, docCategory*/);

    SurveyDataService.getAll2(params)
      .then((response) => {
        const { surveys, totalPages } = response.data;

        setSurveys(surveys);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveSurveys, [page, pageSize, orderby]);

  const refreshList = () => {
    retrieveSurveys();
  };

  const removeAllSurveys = () => {
    SurveyDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openSurvey = (rowIndex) => {
    const id = surveysRef.current[rowIndex].id;

    props.history.push("/surveys/" + id);
  };

  const deleteSurvey = (rowIndex) => {
    const id = surveysRef.current[rowIndex].id;

    SurveyDataService.delete(id)
      .then((response) => {
        //props.history.push("/surveys");

        let newSurveys = [...surveysRef.current];
        newSurveys.splice(rowIndex, 1);

        setSurveys(newSurveys);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "最后修改时间",
        accessor: "updatedAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
          const d = new Date(surveysRef.current[rowIdx].createdAt);
          return (
            <div>
              {d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          );
        },
      },
      {
        Header: "学校",
        accessor: 'school',
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/schoolsView/" + surveysRef.current[rowIdx].schoolId}
                className="badge badge-success"
              >
                {surveysRef.current[rowIdx].schoolId}
              </Link>
            </div>
          );
        }
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
                to={"/surveysView/" + surveysRef.current[rowIdx].schoolId}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>

              {!readonly && (<Link
                to={"/surveys/" + surveysRef.current[rowIdx].schoolId}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {!readonly && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteSurvey(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>)}
            </div>
          );
        },
      },
    ],
    []
  );

  const hiddenColumns = embedded
    ? ['school']
    : [];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: {sortBy},
  } = useTable({
    columns,
    data: surveys,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      sortBy: [
        {
          id: 'updatedAt',
          desc: false
        }
      ]
    },
  },
  useSortBy);

  const findByOriginalname = () => {
    setPage(1);
    retrieveSurveys();
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
      {!embedded && (<div className="col-md-8">
        <h4>调查表列表</h4>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by originalname"
            value={searchOriginalname}
            onChange={onChangeSearchOriginalname}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByOriginalname}
            >
              Search
            </button>
          </div>
        </div>

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
      </div>)}

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
      </div>
    </div>
  );
};

export default SurveysList;