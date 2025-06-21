import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import AttachmentDataService from "../services/attachment.service";
import AuthService from "../services/auth.service";
import ProjectDataService from "../services/project.service";
import SchoolDataService from "../services/school.service";

import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";
import queryString from 'query-string';

import YearPicker from 'react-single-year-picker';

const ResponsesList = (props) => {
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCode, setSearchCode] = useState("");

  //const [searchStartAt, setSearchStartAt] = useState("");
  const qString = props.location ? queryString.parse(props.location.search) : null;
  const [searchStartAt, setSearchStartAt] = useState(qString ? qString.startAt: null);

  const [formId, setFormId] = useState(props.match? props.match.params.formId : props.formId);
  const [title, setTitle] = useState(null);

  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [userId, setUserId] = useState(props.match? props.match.params.userId : props.userId);
  const [schoolDisplay, setSchoolDisplay] = useState(null);

  const [startup, setStartup] = useState(true);

  const orderbyDefault = schoolId
  ? [
      {
        id: 'startAt',
        //id: 'school.code',
        desc: true
      }
    ]
  : [
      {
      //id: 'startAt',
        id: 'school.code',
        desc: false
      }
    ];

  const [orderby, setOrderby] = useState(orderbyDefault);

  const [exportResponses, setExportResponses] = useState([]);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const responsesRef = useRef();
  responsesRef.current = responses;

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
    window.onblur = () => {window.onfocus = () => {retrieveResponses(true)}}
  };

  const restoreRequestParams = (params) => {
    if (!params) return;

    setSearchTitle(params["title"]);
    setSearchCode(params["code"]);
    setSearchStartAt(params["startAt"]);
    setPage(params["page"] + 1);
    setPageSize(params["size"]);
    setFormId(params["formId"]);
    setSchoolId(params["schoolId"]);
    setOrderby(params["orderby"]);
    setUserId(params["userId"]);
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

    if (exportFlag) {
      params["exportFlag"] = exportFlag;
    }

    if (!exportFlag)
      localStorage.setItem(REQUEST_PARAMS_KEY, JSON.stringify(params));

    return params;
  };

  const onClearSearch = (e) => {
    setSearchTitle("");
    setSearchCode("");
    setSearchStartAt("");
    setOrderby(orderbyDefault);
    setExportResponses([]);

    setPage(1);

    setStartup(false);
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

      const previous = result[label] ? result[label] + '，' : '';
      if (fdata[i].type === 'radio-group' || fdata[i].type === 'checkbox-group' || fdata[i].type === 'select')
        result[label] = previous + flattenUserData(getSelectedLabels(fdata[i].userData, fdata[i].values));
      else {
        result[label] = previous + flattenUserData(fdata[i].userData);
      }
    }

    return result;
  }

  const flatten = (responses) => {
    if (!responses || responses.length == 0) return [];
    let flattenedFData = [];
    let fColumns = [];
    for (var i = 0; i < responses.length; i++) {
      const {fdata, ...others} = responses[i];
      let f = flattenFData(fdata);
      flattenedFData.push({...others, ...f});
      fColumns = getFColumns(fColumns, f);
    }
    return {flattenedFData, fColumns};
  }

  const retrieveExportResponses = () => {
    const params = getRequestParams(true);

    ResponseDataService.getAll2(params)
      .then((response) => {
        const { responses, totalPages, totalItems } = response.data;

        const {flattenedFData, fColumns} = flatten(responses);

        const csv = ProjectDataService.exportCSV(flattenedFData, [...columns, ...exportColumns, ...fColumns], {
          header: '项目年份',
          translate: (dataIndex) => {
            return (!dataIndex || dataIndex.length < 4) ? dataIndex : dataIndex.substring(0, 4)
          }
        });

        const url = window.URL.createObjectURL(new Blob([csv]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                'responses.csv'
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

  const retrieveResponses = (refresh = false) => {
    if (startup && !refresh) return;

    const params = getRequestParams(false, refresh);

    ResponseDataService.getAll2(params)
      .then((response) => {
        const { responses, totalPages, totalItems } = response.data;

        setResponses(responses);
        setCount(totalPages);
        setTotalItems(totalItems);

        if (formId && responses[0] && responses[0].title) { // in old system, responseTitle is: formTitle-schoolNumber
          const index = responses[0].title.indexOf("-");
          setTitle((index > 0) ? responses[0].title.substring(0, index) : responses[0].title);
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
    retrieveResponses();
  };

  useEffect(refreshList, [pageSize, orderby, searchTitle, searchCode, searchStartAt]);
  useEffect(retrieveResponses, [page]);
  useEffect(() => {retrieveResponses(true)}, []);

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
        setTotalItems(prevTotalItems => prevTotalItems - 1);
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
    {
      Header: "班级数",
      accessor: 'school.classesCount',
    },
    {
      Header: "年级数",
      accessor: 'school.gradesCount',
    },    
  ];

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
        Header: "申请人",
        accessor: 'user.chineseName',
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
        Header: "欣欣学校名称",
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
          const expired = (responsesRef.current[rowIdx].form && responsesRef.current[rowIdx].form.deadline)
            ? new Date(responsesRef.current[rowIdx].form.deadline) < new Date()
            : true;
          return (
            <div>
              <Link
                to={"/responsesView/" + responsesRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>
              {!readonly && (<Link
                target = '_blank' //{(!embedded || AuthService.getCurrentUser().schoolId) ? '_blank' : '_self'}
                onClick={refreshOnReturn}
                to={"/responses/" + responsesRef.current[rowIdx].id}
              >
                <i className="far fa-edit action mr-2"></i>
              </Link>)}

              {((!readonly && AuthService.isVolunteer()) ||
              (AuthService.isSchoolUser() && !expired)) &&
              (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteResponse(rowIdx)}
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

  const formKnownColumns = ['title'];

  const schoolKnownColumns = ['school.region', 'school.code', 'school.name'];

  var hiddenColumns = [];
  if (embedded || schoolId) hiddenColumns = schoolKnownColumns;
  if (formId) hiddenColumns = [...hiddenColumns, ...formKnownColumns];

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
    retrieveResponses();
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
          项目申请列表(总数：{totalItems})
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
            maxRange={2030}
          />

          {!formId && (<input
            type="text"
            className="form-control col-sm-3 ml-2"
            placeholder="标题查找"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />)}

          {!embedded && (<input
            type="text"
            className="form-control col-sm-2 ml-2"
            placeholder="学校编码"
            value={searchCode}
            onChange={onChangeSearchCode}
          />)}

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
          {formId && (<button
            className="btn btn-primary"
            type="button"
            onClick={retrieveExportResponses}
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

export default ResponsesList;