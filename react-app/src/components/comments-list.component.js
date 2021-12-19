import React, { Component } from "react";
import CommentDataService from "../services/comment.service";
import AuthService from "../services/auth.service";

import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

const CommentsList = (props) => {
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [userId, setUserId] = useState(AuthService.getCurrentUser() ? AuthService.getCurrentUser().id : null);

  const commentsRef = useRef();
  commentsRef.current = comments;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const onChangeText = (e) => {
    const text = e.target.value;
    setText(text);
  };

  const onChangeSearchText = (e) => {
    const searchText = e.target.value;
    setSearchText(searchText);
  };

  const getRequestParams = (searchText, page, pageSize, schoolId) => {
    let params = {};

    if (text) {
      params["text"] = searchText;
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

    return params;
  };

  const retrieveComments = () => {
    const params = getRequestParams(searchText, page, pageSize, schoolId);

    CommentDataService.getAll2(params)
      .then((response) => {
        const { comments, totalPages } = response.data;

        setComments(comments);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveComments, [page, pageSize]);

  const refreshList = () => {
    retrieveComments();
  };


  const save = (e) => {

    var data = {
      text: text,
      userId: userId,
      schoolId: schoolId
    };

    CommentDataService.create(data)
      .then(response => {
        refreshList();
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  const removeAllComments = () => {
    CommentDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const deleteComment = (rowIndex) => {
    const id = commentsRef.current[rowIndex].id;

    CommentDataService.delete(id)
      .then((response) => {
        props.history.push("/comments");

        let newComments = [...commentsRef.current];
        newComments.splice(rowIndex, 1);

        setComments(newComments);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "评论",
        accessor: "text",
      },
      {
        Header: "时间",
        accessor: "createdAt",
      },
      {
        Header: "评论人",
        accessor: 'user.name',
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
            { (commentsRef.current[rowIdx].user) ? (
              <Link
                to={"/usersView/" + commentsRef.current[rowIdx].user.id}
                className="badge badge-success"
              >
                {commentsRef.current[rowIdx].user.chineseName}
              </Link>
            ) : ''}
            </div>
          );
        },
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <span onClick={() => deleteComment(rowIdx)}>
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
    data: comments,
  },
  useSortBy);

  const search = () => {
    setPage(1);
    retrieveComments();
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

      <div class="form-group col-md-12">
        <label htmlFor="text"><h4>评论</h4></label>
        <textarea
          rows="4"
          class="form-control"
          id="text"
          name="text"
          value={text}
          onChange={onChangeText}
        />
        <button className="btn btn-primary badge-success mb-5" onClick={save}>
          提交
        </button>
      </div>

      <div class="w-100"></div>


      <div className="col-md-6">
        <h6>评论列表</h6>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="搜索 。。。"
            value={searchText}
            onChange={onChangeSearchText}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={search}
            >
              Search
            </button>
          </div>
        </div>

        <div className="col-md-6 mt-3">
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
                                        {/*column.isSorted*/ (column.id === 'createdAt')
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
        <button className="btn btn-sm btn-danger" onClick={removeAllComments}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default CommentsList;