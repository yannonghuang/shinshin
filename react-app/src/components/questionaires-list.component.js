import React, { Component } from "react";
import QuestionaireDataService from "../services/questionaire.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy, useFlexLayout } from "react-table";

import YearPicker from 'react-single-year-picker';

import AuthService from "./../services/auth.service";

import QRCode from 'qrcode';

const QuestionairesList = (props) => {
  const [questionaires, setQuestionaires] = useState([]);
  const [currentQuestionaire, setCurrentQuestionaire] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchStartAt, setSearchStartAt] = useState("");
  const [searchPublished, setSearchPublished] = useState(null);
  const [searchMultipleAllowed, setSearchMultipleAllowed] = useState(null);

  const questionairesRef = useRef();
  questionairesRef.current = questionaires;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const [orderby, setOrderby] = useState([]);

  const pageSizes = [20, 30, 50];

  const [totalItems, setTotalItems] = useState(0);

  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; // e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onChangeSearchInputStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onChangeSearchPublished = (e) => {
    const searchPublished = e.target.value;
    setSearchPublished(searchPublished);
  };

  const onChangeSearchMultipleAllowed = (e) => {
    const searchMultipleAllowed = e.target.value;
    setSearchMultipleAllowed(searchMultipleAllowed);
  };


  const refreshOnReturn = () => {
    window.onblur = () => {window.onfocus = () => {retrieveQuestionaires(true)}}
  };

  const getRequestParams = (refresh = false) => {
    if (refresh) {
      let params = JSON.parse(localStorage.getItem('REQUEST_PARAMS'));
      if (params) {
        return params;
      }
    }

    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
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

    if (searchPublished) {
      params["published"] = searchPublished;
    }

    if (searchMultipleAllowed) {
      params["multipleAllowed"] = searchMultipleAllowed;
    }

    if (orderby && orderby[0])
      params["orderby"] = orderby;
    else
      params["orderby"] = [{
        id: 'deadline',
        desc: true
      }];


    localStorage.setItem('REQUEST_PARAMS', JSON.stringify(params));

    return params;
  };

  const onClearSearch = (e) => {
    setSearchTitle("");
    setSearchStartAt("");
    setSearchPublished("");
    setSearchMultipleAllowed("");
    setOrderby([]);

    setPage(1);
  };

  const retrieveQuestionaires = (refresh = false) => {
    const params = getRequestParams(refresh);

    QuestionaireDataService.getAll2(params)
      .then((response) => {
        const { questionaires, totalPages, totalItems  } = response.data;

        setQuestionaires(questionaires);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const refreshList = () => {
    setPage(1);
    retrieveQuestionaires();
  };

  useEffect(refreshList, [pageSize, orderby, searchTitle, searchStartAt, searchPublished, searchMultipleAllowed]);
  useEffect(retrieveQuestionaires, [page]);


  const removeAllQuestionaires = () => {
    QuestionaireDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openQuestionaire = (rowIndex) => {
    const id = questionairesRef.current[rowIndex].id;
    //props.history.push("/questionaires/" + id);
    const win = window.open("/questionaires/" + id, "_blank");
    win.focus();
  };

  const deleteQuestionaire = (rowIndex) => {
    const id = questionairesRef.current[rowIndex].id;

    QuestionaireDataService.delete(id)
      .then((response) => {
        //props.history.push("/questionaires");

        let newQuestionaires = [...questionairesRef.current];
        newQuestionaires.splice(rowIndex, 1);

        setQuestionaires(newQuestionaires);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const publishQuestionaire = (rowIndex) => {
    const id = questionairesRef.current[rowIndex].id;

    QuestionaireDataService.publish(id)
      .then((response) => {
        //refreshList();
        props.history.go(0);
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const copyQuestionaire = async (rowIndex) => {
    const id = questionairesRef.current[rowIndex].id;
    try {
      let newF = await QuestionaireDataService.copy(id);
      //props.history.push("/questionaires/" + newF.data.id);
      const win = window.open("/questionaires/" + newF.data.id, "_blank");
      win.focus();
    } catch(e) {
      console.log(e);
      alert(JSON.stringify(e));
    };
  };

  const copyToClipboard = (str, event) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      //event.target.title = '已复制：' + str;
      return navigator.clipboard.writeText(str);
    }
    return Promise.reject('The Clipboard API is not available.');
  };

  const qrcode = (str, event) => {
    const canvas = document.getElementById("qrcode");
    var opts = {
      width: 100,
      height: 100,

      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.3,
      margin: 1,
      color: {
        dark:"#010599FF",
        light:"#FFBF60FF"
      }
    };

    QRCode.toCanvas(canvas, str, opts, function (error) {
      if (error) console.error(error)
      else console.log('success!');
    });

    canvas.title = str;
  };

  const columns = useMemo(
    () => [
      {
        Header: "截止日期",
        accessor: "deadline",
      },
      {
        Header: "问卷年份",
        accessor: "startAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            var d = null;
            if ((questionairesRef.current[rowIdx].startAt)) d = new Date(questionairesRef.current[rowIdx].startAt);
            return (
              <div>
                {d ? d.getUTCFullYear() : ''
                /*d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })*/
                }
              </div>
            );
        }
      },
      {
        Header: "标题",
        accessor: "title",
        maxWidth: 320,
        minWidth: 200,
        width: 280,
        disableSortBy: true,
      },
      {
        Header: "反馈数目",
        accessor: "feedbacksCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/feedbacks/questionaire/" + questionairesRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {questionairesRef.current[rowIdx].feedbacksCount}
              </Link>
            </div>
          );
        },
      },
      {
        Header: "已发布？",
        accessor: 'published',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {questionairesRef.current[rowIdx].published ? '是' : '否'}
            </div>
          );
        },
      },
      {
        Header: "允许多次申请？",
        accessor: 'multipleAllowed',
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
                {questionairesRef.current[rowIdx].multipleAllowed ? '是' : '否'}
            </div>
          );
        },
      },
      {
        Header: "操作",
        accessor: "actions",
        disableSortBy: true,
        maxWidth: 180,
        minWidth: 120,
        width: 150,
        Cell: (props) => {
          const rowIdx = props.row.id;
          const expired = questionairesRef.current[rowIdx].deadline
            ? new Date(questionairesRef.current[rowIdx].deadline) < new Date()
            : true;
          const url= window.location.protocol + '//' + window.location.host +
            "/addFeedback/" + questionairesRef.current[rowIdx].id;
          return (
            <div>
              {questionairesRef.current[rowIdx].published && !expired &&
              <Link
                onClick={(event) => {/*copyToClipboard*/ qrcode(url, event)}}
                title={"问卷链接二维码: " + url}
                className= "badge badge-success mr-2"
              >
                <i className="fa fa-qrcode action"></i>
              </Link>}

              <Link title="查看"
                to={"/questionairesView/" + questionairesRef.current[rowIdx].id}
              >
                <i className='fa fa-eye action mr-2' ></i>
              </Link>

              {AuthService.isAdmin() &&
                <span title="编辑" onClick={() => {refreshOnReturn(); openQuestionaire(rowIdx)}}>
                  <i className="far fa-edit action mr-2"></i>
                </span>
              }

              {AuthService.isAdmin() &&
                <span title="复制" onClick={() => copyQuestionaire(rowIdx)}>
                  <i className="far fa-copy action mr-2"></i>
                </span>
              }

              {AuthService.isAdmin() &&
              !questionairesRef.current[rowIdx].published &&
                <span title="发布" onClick={() => window.confirm("您确定发布吗 ?") && publishQuestionaire(rowIdx)} >
                  <i className="fa fa-check action mr-2"></i>
                </span>
              }

              {AuthService.isAdmin() &&
                <span title="删除" onClick={() => window.confirm("您确定要删除吗 ?") && deleteQuestionaire(rowIdx)} >
                  <i className="fas fa-trash action"></i>
                </span>
              }
            </div>
          );
        },
      },
    ],
    []
  );

  const hiddenColumns = ["multipleAllowed"];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: {sortBy},
  } = useTable({
    columns,
    data: questionaires,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
      sortBy: [
        {
          id: 'deadline',
          desc: true
        }
      ]
    },
  },
  useFlexLayout,
  useSortBy);

  const findByTitle = () => {
    setPage(1);
    retrieveQuestionaires();
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
      <div className="col-sm-9">
        <h4>问卷调查列表(总数：{totalItems})</h4>
        <div className="row mb-3">
          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-2"
            placeholder="年份"
            value={searchStartAt}
            onChange={onChangeSearchInputStartAt}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchStartAt}
            onSelect={onChangeSearchStartAt}
            hideInput={true}
            minRange={1995}
            maxRange={2025}
          />

          <input
            type="text"
            className="form-control col-sm-3 ml-2"
            placeholder="标题查找"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />

          <select
            className="form-control col-sm-2 ml-2"
            value={searchPublished}
            onChange={onChangeSearchPublished}
          >
            <option value="">已发布?</option>
              <option value={false}>
                {'否'}
              </option>
              <option value={true}>
                {'是'}
              </option>
          </select>
{/*
          <select
            className="form-control col-sm-3 ml-2"
            value={searchMultipleAllowed}
            onChange={onChangeSearchMultipleAllowed}
          >
            <option value="">允许多次申请?</option>
              <option value={false}>
                {'否'}
              </option>
              <option value={true}>
                {'是'}
              </option>
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
{/*}
        <div className="input-group mb-3">
          <button
            className="btn btn-primary "
            type="button"
            onClick={findByTitle}
          >
            查找
          </button>
        </div>
*/}

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

<canvas title={"问卷链接二维码"} id="qrcode"></canvas>
      </div>

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
                         {/*column.isSorted*/ (column.id === 'startAt' || column.id === 'deadline' ||
                         column.id === 'feedbacksCount' || column.id === 'published'|| column.id === 'multipleAllowed')
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

      <div className="col-sm-8">
      </div>
    </div>
  );
};

export default QuestionairesList;