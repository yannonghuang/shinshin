import React, { Component } from "react";
import AttachmentDataService from "../services/attachment.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

const AttachmentsList = (props) => {
  const [attachments, setAttachments] = useState([]);

  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [responseId, setResponseId] = useState(props.match? props.match.params.responseId : props.responseId);
  //const [responseId, setResponseId] = useState(props.match.params.responseId);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const [reload, setReload] = useState(props.reload);

  //useEffect(setReload, [props.reload]);
  useEffect(() => { setReload(props.reload) }, [props.reload]);

  const attachmentsRef = useRef();
  attachmentsRef.current = attachments;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const [totalItems, setTotalItems] = useState(0);

  const onChangeSearchOriginalname = (e) => {
    const searchOriginalname = e.target.value;
    setSearchOriginalname(searchOriginalname);
  };

  const getRequestParams = (/*searchOriginalname, page, pageSize, responseId*/) => {
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

    if (responseId) {
      params["responseId"] = responseId;
    }

    return params;
  };

  const retrieveAttachments = () => {
    const params = getRequestParams(/*searchOriginalname, page, pageSize, responseId*/);

    AttachmentDataService.getAll2(params)
      .then((response) => {
        const { attachments, totalPages, totalItems } = response.data;

        setAttachments(attachments);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveAttachments, [page, pageSize, reload]);

  const refreshList = () => {
    retrieveAttachments();
  };

  const removeAllAttachments = () => {
    AttachmentDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openAttachment = (rowIndex) => {
    const id = attachmentsRef.current[rowIndex].id;

    props.history.push("/attachments/" + id);
  };

  const promote = (rowIndex) => {
    const id = attachmentsRef.current[rowIndex].id;

    let originalname = prompt("请输入新文件名", "");
    if (!originalname) return;
    
    AttachmentDataService.promote(id, {originalname})
      .then((response) => {
        alert('项目申请附件成功升级为学校文档');
      })
      .catch((e) => {
        alert('申请附件升级失败：' + JSON.stringify(e));
        console.log(e);
      });
  };

  const deleteAttachment = (rowIndex) => {
    const id = attachmentsRef.current[rowIndex].id;

    AttachmentDataService.delete(id)
      .then((response) => {
        //props.history.push("/attachments");

        let newAttachments = [...attachmentsRef.current];
        newAttachments.splice(rowIndex, 1);

        setAttachments(newAttachments);
        setTotalItems(prevTotalItems => prevTotalItems - 1);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "时间",
        accessor: "createdAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
          const d = new Date(attachmentsRef.current[rowIdx].createdAt);
          return (
            <div>
              {d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          );
        },
      },
      {
        Header: "文件名",
        accessor: "originalname",
      },
      {
        Header: "说明",
        accessor: "description",
        disableSortBy: true,
      },
      {
        Header: "操作",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <a href="#" onClick={() => promote(rowIdx)}>
                <i className="badge badge-success mr-2">升级</i>
              </a>

              {(attachmentsRef.current[rowIdx].mimetype.startsWith('image') ||
                attachmentsRef.current[rowIdx].mimetype.indexOf('pdf') > 0) && (
              <a href="#" onClick={() => download(attachmentsRef.current[rowIdx].id,
                                                attachmentsRef.current[rowIdx].originalname,
                                                attachmentsRef.current[rowIdx].mimetype, true)} >
                <i className="fas fa-eye action mr-2"></i>
              </a>
              )}

              <a href="#" onClick={() => download(attachmentsRef.current[rowIdx].id,
                                                attachmentsRef.current[rowIdx].originalname,
                                                attachmentsRef.current[rowIdx].mimetype, false)} >
                <i className="fas fa-download action mr-2"></i>
              </a>

              {!readonly && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteAttachment(rowIdx)}>
                <i className="fas fa-trash action"></i>
              </span>)}
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
    data: attachments,
    disableSortRemove: true,
  },
  useSortBy);

  const findByOriginalname = () => {
    setPage(1);
    retrieveAttachments();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  const download = (id, originalname, mimetype, previewOnly) => {
    AttachmentDataService.getContent(id)
	  .then(response => {
        console.log(response.data);

        const url = window.URL.createObjectURL(new Blob([response.data], { type: mimetype }));
        const link = document.createElement('a');
        link.href = url;
/**
        if (!previewOnly)
          link.setAttribute('download',
            originalname //'file.file' response.headers["Content-Disposition"].split("filename=")[1]
          ); //or any other extension
*/
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

  return (
    <div className="list row">
      <div className="col-sm-8">
        <h4>项目申请附件列表(总数：{totalItems})</h4>
        {!embedded && (<div className="input-group mb-3">
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
        </div>)}
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

export default AttachmentsList;