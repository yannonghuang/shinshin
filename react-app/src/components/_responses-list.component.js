import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import AttachmentDataService from "../services/attachment.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

const ResponsesList = (props) => {
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");

  //const [formId, setFormId] = useState(null);
  const [formId, setFormId] = useState(props.match? props.match.params.formId : props.formId);
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  //const [schoolId, setSchoolId] = useState(null);

  const responsesRef = useRef();
  responsesRef.current = responses;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);
  };

  const getRequestParams = (searchTitle, page, pageSize, formId, schoolId) => {
    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if (formId) {
      params["formId"] = formId;
    }

    if (schoolId) {
      params["schoolId"] = schoolId;
    }

    return params;
  };

  const getAttachmentsCount = async (responseId) => {
    await AttachmentDataService.getAttachmentsCount(responseId)
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((e) => {
        console.log(e);
      });

    return 0;
  };

  const retrieveResponses = () => {
    const params = getRequestParams(searchTitle, page, pageSize, formId, schoolId);

    ResponseDataService.getAll2(params)
      .then((response) => {
        const { responses, totalPages } = response.data;

        setResponses(responses);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveResponses, [page, pageSize]);

  const refreshList = () => {
    retrieveResponses();
  };

  const removeAllResponses = () => {
    ResponseDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openResponse = (rowIndex) => {
    const id = responsesRef.current[rowIndex].id;

    props.history.push("/responses/" + id);
  };

  const deleteResponse = (rowIndex) => {
    const id = responsesRef.current[rowIndex].id;

    ResponseDataService.delete(id)
      .then((response) => {
        props.history.push("/responses");

        let newResponses = [...responsesRef.current];
        newResponses.splice(rowIndex, 1);

        setResponses(newResponses);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderSchool = (rowIdx) => {
    let r = "";
    if (responsesRef.current[rowIdx].school) {
      r = responsesRef.current[rowIdx].school.region + "/" + responsesRef.current[rowIdx].school.name;
    }
    return r;
  }

  const columns = useMemo(
    () => [
      {
        Header: "标题",
        accessor: "title",
      },
      {
        Header: "创建时间",
        accessor: "createdAt",
      },
      {
        Header: "附件数目",
        accessor: "attachmentsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/attachments/response/" + responsesRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {responsesRef.current[rowIdx].attachmentsCount}
              </Link>
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
              <Link
                to={"/schools/" + responsesRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {renderSchool(rowIdx)}
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
              <span onClick={() => openResponse(rowIdx)}>
                <i className="far fa-edit action mr-2"></i>
              </span>

              <span onClick={() => deleteResponse(rowIdx)}>
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
    data: responses,
  },
  useSortBy);

  const findByTitle = () => {
    setPage(1);
    retrieveResponses();
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
      <div className="col-md-8">
        <h4>项目申请列表</h4>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByTitle}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="col-md-12 list">
        <div className="mt-3">
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
        <button className="btn btn-sm btn-danger" onClick={removeAllResponses}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default ResponsesList;