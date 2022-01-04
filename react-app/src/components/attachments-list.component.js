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

  const attachmentsRef = useRef();
  attachmentsRef.current = attachments;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

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
        const { attachments, totalPages } = response.data;

        setAttachments(attachments);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveAttachments, [page, pageSize]);

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

  const deleteAttachment = (rowIndex) => {
    const id = attachmentsRef.current[rowIndex].id;

    AttachmentDataService.delete(id)
      .then((response) => {
        //props.history.push("/attachments");

        let newAttachments = [...attachmentsRef.current];
        newAttachments.splice(rowIndex, 1);

        setAttachments(newAttachments);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
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
              <a href="#" onClick={() => download(attachmentsRef.current[rowIdx].id, attachmentsRef.current[rowIdx].originalname)} >
                <i className="fas fa-download action mr-2"></i>
              </a>
              {!readonly && (<span onClick={() => deleteAttachment(rowIdx)}>
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

  const download = (id, originalname) => {
    AttachmentDataService.getContent(id)
	  .then(response => {
        console.log(response.data);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                originalname //'file.file' response.headers["Content-Disposition"].split("filename=")[1]
            ); //or any other extension
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
      <div className="col-md-8">
        <h4>附件列表</h4>
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
      </div>

      <div className="col-md-12 list">
        <div className="mt-3">
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

export default AttachmentsList;