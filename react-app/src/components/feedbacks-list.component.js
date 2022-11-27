import React, { Component } from "react";
import FeedbackDataService from "../services/feedback.service";
import AttachmentDataService from "../services/attachment.service";
import AuthService from "../services/auth.service";
import ProjectDataService from "../services/project.service";
import SchoolDataService from "../services/school.service";

import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

const FeedbacksList = (props) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchStartAt, setSearchStartAt] = useState("");
  const [searchRespondant, setSearchRespondant] = useState("");

  const [questionaireId, setQuestionaireId] = useState(props.match? props.match.params.questionaireId : props.questionaireId);
  const [title, setTitle] = useState(null);

  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [userId, setUserId] = useState(props.match? props.match.params.userId : props.userId);
  const [schoolDisplay, setSchoolDisplay] = useState(null);

  const [startup, setStartup] = useState(true);

  const orderbyDefault = [
    {
      id: 'startAt',
      //id: 'school.code',
      desc: true
    }
  ];

  const [orderby, setOrderby] = useState(orderbyDefault);

  const [exportFeedbacks, setExportFeedbacks] = useState([]);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const feedbacksRef = useRef();
  feedbacksRef.current = feedbacks;

  const [totalItems, setTotalItems] = useState(0);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  const pageSizes = [20, 30, 50];

  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);

    setStartup(false);
  };

  const onChangeSearchRespondant = (e) => {
    const searchRespondant = e.target.value;
    setSearchRespondant(searchRespondant);

    setStartup(false);
  };

  const onChangeSearchCode = (e) => {
    const searchCode = e.target.value;
    setSearchCode(searchCode);

    setStartup(false);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; // e.target.value;
    setSearchStartAt(searchStartAt);

    setStartup(false);
  };

  const onChangeSearchInputStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);

    setStartup(false);
  };

  const refreshOnReturn = () => {
    window.onblur = () => {window.onfocus = () => {retrieveFeedbacks(true)}}
  };

  const restoreRequestParams = (params) => {
    if (!params) return;

    setSearchTitle(params["title"]);
    setSearchRespondant(params["respondant"]);
    setSearchCode(params["code"]);
    setSearchStartAt(params["startAt"]);
    setPage(params["page"] + 1);
    setPageSize(params["size"]);
    setQuestionaireId(params["questionaireId"]);
    setSchoolId(params["schoolId"]);
    setOrderby(params["orderby"]);
  };


  const getRequestParams = (exportFlag, refresh = false) => {
    //const user = AuthService.getCurrentUser();
    const REQUEST_PARAMS_KEY = window.location.href;

    if (embedded) localStorage.removeItem(REQUEST_PARAMS_KEY);

    if (refresh) {
      let params = JSON.parse(localStorage.getItem(REQUEST_PARAMS_KEY));
      if (params) {
        restoreRequestParams(params);
        //localStorage.removeItem(REQUEST_PARAMS_KEY);
        return params;
      }
    }

    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
    }

    if (searchRespondant) {
      params["respondant"] = searchRespondant;
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

    if (questionaireId) {
      params["questionaireId"] = questionaireId;
    }

    if (schoolId) {
      params["schoolId"] = schoolId;
    }

    if (orderby) {
      params["orderby"] = orderby;
    }

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    if (!exportFlag)
      localStorage.setItem(REQUEST_PARAMS_KEY, JSON.stringify(params));

    return params;
  };

  const onClearSearch = (e) => {
    setSearchTitle("");
    setSearchRespondant("");
    setSearchCode("");
    setSearchStartAt("");
    setOrderby(orderbyDefault);
    setExportFeedbacks([]);

    setPage(1);

    setStartup(false);
  };

  const getAttachmentsCount = async (feedbackId) => {
    await AttachmentDataService.getAttachmentsCount(feedbackId)
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((e) => {
        console.log(e);
      });

    return 0;
  };

  const getFColumns = (fColumns, sampleFData) => {
    if (!sampleFData) return fColumns;

    let result = fColumns;
    Object.keys(sampleFData).forEach(key => {
      let included = false;
      for (var i = 0; i < fColumns.length; i++)
        if (fColumns[i].Header === key) {
          included = true;
          break;
        }

      if (!included)
        result.push({Header: key, accessor: key});
    });

    return result;
  }

  const getSelectedLabels = (selectedValues, values) => {
    let result = [];

    if (!selectedValues) return result;

    for (var i = 0; i < values.length; i++)
      if (selectedValues.includes(values[i].value))
        result.push(values[i].label)

    return result;
  }

  const flattenUserData = (userData) => {
    if (!userData || userData.length === 0) return '';
    let result = userData[0];
    for (var i = 1; i < userData.length; i++) {
      result = result + '；' + userData[i];
    }
    return result;
  }

  const flattenFData = (fdata) => {
    if (!fdata || fdata.length === 0) return {};
    let result = {};
    for (var i = 0; i < fdata.length; i++) {
      if (fdata[i].type === 'file' || fdata[i].type === 'paragraph' || fdata[i].type === 'header') continue;

      // get rid of HTML formatting, trim leading & trailing spaces, use chinese comma '，' in texts
      let label = fdata[i].label.replace(/(<([^>]+)>)/ig, '').replace(/&nbsp;/g, ' ').replace(/,/gm, "，").trim();

      if (fdata[i].type === 'radio-group' || fdata[i].type === 'checkbox-group' || fdata[i].type === 'select')
        result[label] = flattenUserData(getSelectedLabels(fdata[i].userData, fdata[i].values));
      else {
        result[label] = flattenUserData(fdata[i].userData);

      }
    }

    return result;
  }

  const flatten = (feedbacks) => {
    if (!feedbacks || feedbacks.length == 0) return [];
    let flattenedFData = [];
    let fColumns = [];
    for (var i = 0; i < feedbacks.length; i++) {
      const {fdata, ...others} = feedbacks[i];
      let f = flattenFData(fdata);
      flattenedFData.push({...others, ...f});
      fColumns = getFColumns(fColumns, f);
    }
    return {flattenedFData, fColumns};
  }

  const retrieveExportFeedbacks = () => {
    const params = getRequestParams(true);

    FeedbackDataService.getAll2(params)
      .then((response) => {
        const { feedbacks, totalPages, totalItems } = response.data;

        const {flattenedFData, fColumns} = flatten(feedbacks);

        const csv = ProjectDataService.exportCSV(flattenedFData, [...columns, ...exportColumns, ...fColumns], {
          header: '问卷年份',
          translate: (dataIndex) => {
            return (!dataIndex || dataIndex.length < 4) ? dataIndex : dataIndex.substring(0, 4)
          }
        });

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'feedbacks.csv'
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveFeedbacks = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(false, refresh);

    FeedbackDataService.getAll2(params)
      .then((response) => {
        const { feedbacks, totalPages, totalItems } = response.data;

        setFeedbacks(feedbacks);
        setCount(totalPages);
        setTotalItems(totalItems);

        if (questionaireId && feedbacks[0] && feedbacks[0].title) { // in old system, feedbackTitle is: questionaireTitle-schoolNumber
          const index = feedbacks[0].title.indexOf("-");
          setTitle((index > 0) ? feedbacks[0].title.substring(0, index) : feedbacks[0].title);
        }

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const refreshList = () => {
    if (startup) return;

    setPage(1);
    retrieveFeedbacks();
  };

  useEffect(refreshList, [pageSize, orderby, searchTitle, searchRespondant, searchCode, searchStartAt]);
  useEffect(retrieveFeedbacks, [page]);
  useEffect(() => {retrieveFeedbacks(true)}, []);

  const getSchoolDisplay = () => {
    SchoolDataService.get(schoolId)
    .then(response => {
      setSchoolDisplay('学校' + response.data.code);
    })
    .catch (err => {
      console.log(err);
    });
  }

  useEffect(getSchoolDisplay, [schoolId]);

  const removeAllFeedbacks = () => {
    FeedbackDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openFeedback = (rowIndex) => {
    const id = feedbacksRef.current[rowIndex].id;

    props.history.push("/feedbacks/" + id);
  };

  const deleteFeedback = (rowIndex) => {
    const id = feedbacksRef.current[rowIndex].id;

    FeedbackDataService.delete(id)
      .then((response) => {
        //props.history.push("/feedbacks");

        let newFeedbacks = [...feedbacksRef.current];
        newFeedbacks.splice(rowIndex, 1);

        setFeedbacks(newFeedbacks);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const renderSchool = (rowIdx) => {
    let r = "";
    if (feedbacksRef.current[rowIdx].school) {
      r = feedbacksRef.current[rowIdx].school.region + "/" + feedbacksRef.current[rowIdx].school.name;
    }
    return r;
  }

  const exportColumns = [
    {
      Header: "市",
      accessor: "school.surveys.city",
    },
    {
      Header: "区/县",
      accessor: "school.surveys.county",
    },
    {
      Header: "乡/镇",
      accessor: "school.surveys.community",
    },
    {
      Header: "教育局校名",
      accessor: "school.surveys.schoolBoardRegisteredName",
    },
    {
      Header: "学校地址",
      accessor: "school.address",
    },
    {
      Header: "学校类型",
      accessor: "school.category",
    },
    {
      Header: "学生人数",
      accessor: "school.studentsCount",
    },
    {
      Header: "教师人数",
      accessor: "school.teachersCount",
    },
  ];

  const columns = useMemo(
    () => [
      {
        Header: "问卷年份",
        accessor: "startAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            var d = null;
            if ((feedbacksRef.current[rowIdx].startAt)) d = new Date(feedbacksRef.current[rowIdx].startAt);
            return (
              <div>
                {d ? d.getUTCFullYear() : ''
                /* d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })*/
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
        Header: "答卷人",
        accessor: "respondant",
      },
      {
        Header: "修改时间",
        accessor: "updatedAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            const d = new Date(feedbacksRef.current[rowIdx].updatedAt);
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
            { (feedbacksRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + feedbacksRef.current[rowIdx].school.id}
                className="badge badge-success"
              >
                {feedbacksRef.current[rowIdx].school.code}
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
            { (feedbacksRef.current[rowIdx].school) ? (
              <Link
                to={"/schoolsView/" + feedbacksRef.current[rowIdx].school.id}
                className="badge badge-success"
              >
                {feedbacksRef.current[rowIdx].school.name}
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
                to={"/attachments/feedback/" + feedbacksRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {feedbacksRef.current[rowIdx].attachmentsCount}
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
          const expired = (feedbacksRef.current[rowIdx].questionaire && feedbacksRef.current[rowIdx].questionaire.deadline)
            ? new Date(feedbacksRef.current[rowIdx].questionaire.deadline) < new Date()
            : true;
          return (
            <div>
              <Link
                to={"/feedbacksView/" + feedbacksRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>
              {!readonly && (<Link
                target = '_blank' //{(!embedded || AuthService.getCurrentUser().schoolId) ? '_blank' : '_self'}
                onClick={refreshOnReturn}
                to={"/feedbacks/" + feedbacksRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {((!readonly && AuthService.isVolunteer()) ||
              (AuthService.isSchoolUser() && !expired)) &&
              (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteFeedback(rowIdx)}
              >
                <i className="fas fa-trash action"></i>
              </span>)}
            </div>
          );
        },
      },
    ],
    []
  );

  const questionaireKnownColumns = ['title'];

  const schoolKnownColumns = ['school.region', 'school.code', 'school.name'];

  var hiddenColumns = [];
  if (embedded || schoolId) hiddenColumns = schoolKnownColumns;
  if (questionaireId) hiddenColumns = [...hiddenColumns, ...questionaireKnownColumns];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: {sortBy},
  } = useTable({
    columns,
    data: feedbacks,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
/**
      sortBy: [
        {
          id: 'startAt',
          //id: 'school.code',
          desc: true
        }
      ]
*/
    },
  },
  useSortBy);

  const findByTitle = () => {
    setPage(1);
    retrieveFeedbacks();
  };

  const handlePageChange = (event, value) => {
    setPage(value);

    setStartup(false);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);

    setStartup(false);
  };

  useEffect(() => {
    if (sortBy && sortBy[0]) {
      setOrderby(sortBy);

      setStartup(false);
    }
  }, [sortBy]);

  return (
    <div className="list row">
      <div className="col-sm-8">
        <h4>
          {schoolId && !embedded && (<a href={'/schoolsView/' + schoolId}>{schoolDisplay + '-'}</a>)}
          {title ? (title + '-') : ''}
          问卷反馈列表(总数：{totalItems})
        </h4>
        <div className="row mb-3">
          <input
            type="text"
            readonly=""
            className="form-control col-sm-2 ml-3"
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

          {!questionaireId && (<input
            type="text"
            className="form-control col-sm-3 ml-2"
            placeholder="标题查找"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />)}

          <input
            type="text"
            className="form-control col-sm-3 ml-2"
            placeholder="答卷人查找"
            value={searchRespondant}
            onChange={onChangeSearchRespondant}
          />

          {!embedded && (<input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="学校编码"
            value={searchCode}
            onChange={onChangeSearchCode}
          />)}

          <div>
            <button
              className="btn btn-primary ml-3"
              type="button"
              onClick={onClearSearch}
            >
              清空
            </button>
          </div>
        </div>

        <div className="input-group mb-3">
{/*
          <button
            className="btn btn-primary "
            type="button"
            onClick={findByTitle}
          >
            查询
          </button>
*/}
          {questionaireId && (<button
            className="btn btn-primary"
            type="button"
            onClick={retrieveExportFeedbacks}
          >
            导出
          </button>)}
        </div>
      </div>

      <div className="col-sm-4 mt-3">
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

export default FeedbacksList;