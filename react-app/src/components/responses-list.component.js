import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import AttachmentDataService from "../services/attachment.service";
import AuthService from "../services/auth.service";

import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

const ResponsesList = (props) => {
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchStartAt, setSearchStartAt] = useState("");
  const [title, setTitle] = useState(null);

  const [formId, setFormId] = useState(props.match? props.match.params.formId : props.formId);
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [userId, setUserId] = useState(props.match? props.match.params.userId : props.userId);

  const [orderby, setOrderby] = useState([]);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const responsesRef = useRef();
  responsesRef.current = responses;

  const [totalItems, setTotalItems] = useState(0);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);
  };

  const onChangeSearchCode = (e) => {
    const searchCode = e.target.value;
    setSearchCode(searchCode);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; // e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onChangeSearchInputStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const getRequestParams = (/*searchTitle, page, pageSize, formId, schoolId, userId, orderby*/) => {
    //const user = AuthService.getCurrentUser();

    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
    }

    if (searchCode) {
      params["code"] = searchCode;
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

    if (formId) {
      params["formId"] = formId;
    }

    if (schoolId) {
      params["schoolId"] = schoolId;
    }

    if (orderby) {
      params["orderby"] = orderby;
    }

    if (userId) {
      params["userId"] = userId;
    }

    return params;
  };

  const onClearSearch = (e) => {
    setSearchTitle("");
    setSearchCode("");
    setSearchStartAt("");
    setOrderby([]);
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
    const params = getRequestParams(/*searchTitle, page, pageSize, formId, schoolId, userId, orderby*/);

    ResponseDataService.getAll2(params)
      .then((response) => {
        const { responses, totalPages, totalItems } = response.data;

        setResponses(responses);
        setCount(totalPages);
        setTotalItems(totalItems);

        if (formId && responses[0]) setTitle(responses[0].title);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveResponses, [page, pageSize, orderby, searchTitle, searchCode, searchStartAt]);

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
        //props.history.push("/responses");

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
        Header: "项目年份",
        accessor: "startAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            var d = null;
            if ((responsesRef.current[rowIdx].startAt)) d = new Date(responsesRef.current[rowIdx].startAt);
            return (
              <div>
                {d ? d.getFullYear() : ''
                /*d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })*/
                }
              </div>
            );
        }
      },
      {
        Header: "标题",
        accessor: "title",
      },
      {
        Header: "申请人",
        accessor: 'user.name',
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            { (responsesRef.current[rowIdx].user) ? (
              <Link
                to={"/usersView/" + responsesRef.current[rowIdx].user.id}
                className="badge badge-success"
              >
                {responsesRef.current[rowIdx].user.chineseName}
              </Link>
            ) : ''}
            </div>
          );
        },
      },
      {
        Header: "修改时间",
        accessor: "updatedAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            const d = new Date(responsesRef.current[rowIdx].updatedAt);
            return (
              <div>
                {d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            );
        }
      },
      {
        Header: "学校编号",
        accessor: 'school.code',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            { (responsesRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + responsesRef.current[rowIdx].school.id}
                className="badge badge-success"
              >
                {responsesRef.current[rowIdx].school.code}
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
            { (responsesRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + responsesRef.current[rowIdx].school.id}
                className="badge badge-success"
              >
                {responsesRef.current[rowIdx].school.name}
              </Link>
            ) : ''}
            </div>
          );
        },
      },
      {
        Header: "省（直辖市）",
        accessor: 'school.region',
      },
/**
      {
        Header: "附件数目",
        accessor: "attachmentsCount",
        disableSortBy: true,
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
                to={"/responsesView/" + responsesRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>
              {!readonly && (<Link
                to={"/responses/" + responsesRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {!readonly && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteResponse(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>)}
            </div>
          );
        },
      },
    ],
    []
  );

  const formKnownColumns = ['title'];

  const schoolKnownColumns = ['school.region', 'school.code', 'school.name'];

  var hiddenColumns = [];
  if (embedded) hiddenColumns = schoolKnownColumns;
  if (formId) hiddenColumns = formKnownColumns;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: {sortBy},
  } = useTable({
    columns,
    data: responses,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
      sortBy: [
        {
          id: 'startAt',
          desc: false
        }
      ]
    },
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

  useEffect(() => {
    if (sortBy && sortBy[0])
      setOrderby(sortBy);
  }, [sortBy]);

  return (
    <div className="list row">
      <div className="col-md-8">
        <h4>{title ? title + " - " : ""}项目申请列表(总数：{totalItems})</h4>
        <div className="input-group mb-3">
          <input
            type="text"
            readonly=""
            className="form-control"
            placeholder="项目年份"
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

          {!formId && (<input
            type="text"
            className="form-control ml-2"
            placeholder="标题查找"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />)}

          {!embedded && (<input
            type="text"
            className="form-control ml-2"
            placeholder="学校编码"
            value={searchCode}
            onChange={onChangeSearchCode}
          />)}
{/*
          <div>
            <button
              className="btn btn-primary badge btn-block ml-2"
              type="button"
              onClick={onClearSearch}
            >
              清空
            </button>
          </div>
*/}
          <div className="input-group-append ml-2">
            <button
              className="btn btn-primary badge-success"
              type="button"
              onClick={findByTitle}
            >
              查找
            </button>
          </div>
        </div>
      </div>

      <div className="col-md-4 mt-3">
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
                        column.id === 'school.name' || column.id === 'startAt' || column.id === 'updatedAt' ||
                        column.id === 'title')
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
    </div>
  );
};

export default ResponsesList;