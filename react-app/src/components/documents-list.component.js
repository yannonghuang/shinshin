import React, { Component } from "react";
import DocumentDataService from "../services/document.service";
import AuthService from "./../services/auth.service";

import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

const DocumentsList = (props) => {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [searchStartAt, setSearchStartAt] = useState("");
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [docCategory, setDocCategory] = useState(props.match? props.match.params.docCategory : props.docCategory);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const documentsRef = useRef();
  documentsRef.current = documents;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const pageSizes = [10, 20, 30];

  const [totalItems, setTotalItems] = useState(0);

  const onChangeSearchOriginalname = (e) => {
    const searchOriginalname = e.target.value;
    setSearchOriginalname(searchOriginalname);
  };

  const onChangeSearchStartAt = (e) => {
    const searchStartAt = e; //e.target.value;
    setSearchStartAt(searchStartAt);
  };

  const onClearSearch = (e) => {
    setSearchOriginalname("");
    setSearchStartAt("");
    setPage(1);
  };

  const [orderby, setOrderby] = useState([]);

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

    if (searchStartAt) {
      params["startAt"] = searchStartAt;
    }

    if (orderby && orderby[0])
      params["orderby"] = orderby;
    else
      params["orderby"] = [
        {
          id: 'createdAt',
          desc: true
        }
      ];

    return params;
  };

  const retrieveDocuments = () => {
    const params = getRequestParams(/*searchOriginalname, page, pageSize, schoolId, docCategory*/);

    DocumentDataService.getAll2(params)
      .then((response) => {
        const { documents, totalPages, totalItems } = response.data;

        setDocuments(documents);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const search = () => {
    setPage(1);
    retrieveDocuments();
  };

  useEffect(search, [pageSize, orderby, searchOriginalname, searchStartAt]);
  useEffect(retrieveDocuments, [page]);


  const refreshList = () => {
    retrieveDocuments();
  };

  const getStartAt = (rowIndex) => {
    let s = documentsRef.current[rowIndex].startAt;
    s = s ? s : documentsRef.current[rowIndex].createdAt;

    return "" + new Date(s).getFullYear();
  }

  const updateStartAt = (rowIndex) => {
    const id = documentsRef.current[rowIndex].id;
    let s = documentsRef.current[rowIndex].startAt;
    s = s ? s : documentsRef.current[rowIndex].createdAt;

    let startAt = prompt("请输入年份", getStartAt(rowIndex));
    if (!startAt) return;

    DocumentDataService.update(id, {startAt: startAt + '-02-01'})
      .then((response) => {
        refreshList();
        //alert('修改成功');
      })
      .catch((e) => {
        alert('修改失败：' + JSON.stringify(e));
        console.log(e);
      });
  };

  const updateDescription = (rowIndex) => {
    const id = documentsRef.current[rowIndex].id;
    let d = documentsRef.current[rowIndex].description;
    let description = prompt("请输入说明", d ? d : '');
    if (!description) return;

    DocumentDataService.update(id, {description})
      .then((response) => {
        refreshList();
        //alert('修改成功');
      })
      .catch((e) => {
        alert('修改失败：' + JSON.stringify(e));
        console.log(e);
      });
  };

  const removeAllDocuments = () => {
    DocumentDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openDocument = (rowIndex) => {
    const id = documentsRef.current[rowIndex].id;

    props.history.push("/documents/" + id);
  };

  const deleteDocument = (rowIndex) => {
    const id = documentsRef.current[rowIndex].id;

    DocumentDataService.delete(id)
      .then((response) => {
        //props.history.push("/documents");

        let newDocuments = [...documentsRef.current];
        newDocuments.splice(rowIndex, 1);

        setDocuments(newDocuments);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "年份",
        accessor: "startAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              {getStartAt(rowIdx)}
            </div>
          );
        },        
      },      
      {
        Header: "文件上传时间",
        accessor: "createdAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
          const d = new Date(documentsRef.current[rowIdx].createdAt);
          return (
            <div>
              {d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          );
        },
      },
      {
        Header: "文档名",
        accessor: "originalname",
        disableSortBy: true,        
      },
      {
        Header: "类别",
        accessor: "docCategory",
      },
      {
        Header: "说明",
        accessor: "description",
        disableSortBy: true,        
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
                to={"/schoolsView/" + documentsRef.current[rowIdx].schoolId}
                className="badge badge-success"
              >
                {"点击查看学校"}
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
              {!readonly && AuthService.isVolunteer() &&<a href="#" onClick={() => updateStartAt(rowIdx)}>
                <i className="badge badge-success mr-2">年份</i>
              </a>}    

              {!readonly && AuthService.isVolunteer() &&<a href="#" onClick={() => updateDescription(rowIdx)}>
                <i className="badge badge-success mr-2">说明</i>
              </a>}                           
{/*
              {(documentsRef.current[rowIdx].mimetype.startsWith('image') ||
                documentsRef.current[rowIdx].mimetype.indexOf('pdf') > 0 ) && (
*/}
              <a href="#" onClick={() =>
                download(documentsRef.current[rowIdx].id,
                  documentsRef.current[rowIdx].originalname,
                  documentsRef.current[rowIdx].mimetype, true)
                }
              >
                <i className="fas fa-eye action mr-2"></i>
              </a>
{/*
              )}
*/}

{/*
              {!(documentsRef.current[rowIdx].mimetype.indexOf('pdf') > 0 ) && (
*/}
              <a href="#" onClick={() =>
                download(documentsRef.current[rowIdx].id,
                  documentsRef.current[rowIdx].originalname,
                  documentsRef.current[rowIdx].mimetype, false)
                }
              >
                <i className="fas fa-download action mr-2"></i>
              </a>
{/*
              )}
*/}

              {!readonly && AuthService.isVolunteer() && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteDocument(rowIdx)}>
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
    data: documents,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      hiddenColumns: hiddenColumns,
      sortBy: [
        {
          id: 'createdAt',
          desc: true
        }
      ]
    },
  },
  useSortBy);

  const findByOriginalname = () => {
    setPage(1);
    retrieveDocuments();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  const download = (id, originalname, mimetype, previewOnly) => {
    DocumentDataService.getContent(id)
	  .then(response => {
        console.log(response.data);

        const url = window.URL.createObjectURL(new Blob([response.data], { type: mimetype }));
        const link = document.createElement('a');
        link.href = url; //+ originalname.substring(originalname.lastIndexOf('.'));

        if (!previewOnly)
          link.setAttribute('download', originalname);
        else {
          link.target = '_blank';
        }

        document.body.appendChild(link);
        link.click();
        link.remove();
	  })
	  .catch((e) => {
	    alert(e);
        console.log(e);
      });
  }

  useEffect(() => {
    if (sortBy && sortBy[0])
      setOrderby(sortBy);
  }, [sortBy]);

  return (
    <div className="list row">
      <div className="col-sm-8">
        <div className="mb-3">
          <h4>学校附件列表(总数：{totalItems})</h4>
          <div className="row mb-3 ml-1">
            <div>
              <input
              type="text"
              className="form-control"
              placeholder="文档名或说明查找。。。"
              value={searchOriginalname}
              onChange={onChangeSearchOriginalname}
              />
            </div>
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
              maxRange={2030}
            />
            <div>
              <button
                className="btn btn-primary  ml-2"
                type="button"
                onClick={onClearSearch}
              >
                清空
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
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

      <div className="col-sm-8">
      </div>
    </div>
  );
};

export default DocumentsList;