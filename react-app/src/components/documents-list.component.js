import React, { Component } from "react";
import DocumentDataService from "../services/document.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

const DocumentsList = (props) => {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [schoolId, setSchoolId] = useState(props.match? props.match.params.schoolId : props.schoolId);
  const [docCategory, setDocCategory] = useState(props.match? props.match.params.docCategory : props.docCategory);

  const documentsRef = useRef();
  documentsRef.current = documents;

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

    return params;
  };

  const retrieveDocuments = () => {
    const params = getRequestParams(/*searchOriginalname, page, pageSize, schoolId, docCategory*/);

    DocumentDataService.getAll2(params)
      .then((response) => {
        const { documents, totalPages } = response.data;

        setDocuments(documents);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveDocuments, [page, pageSize]);

  const refreshList = () => {
    retrieveDocuments();
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
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "文档名",
        accessor: "originalname",
      },
      {
        Header: "创建时间",
        accessor: "createdAt",
      },
      {
        Header: "类别",
        accessor: "docCategory",
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
              <a href="#" onClick={() => download(documentsRef.current[rowIdx].id, documentsRef.current[rowIdx].originalname)} >
                <i className="fas fa-download action mr-2"></i>
              </a>

              <span onClick={() => deleteDocument(rowIdx)}>
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
    data: documents,
    disableSortRemove: true,
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

  const download = (id, originalname) => {
    DocumentDataService.getContent(id)
	  .then(response => {
        console.log(response.data);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
                originalname
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
        <button className="btn btn-sm btn-danger" onClick={removeAllDocuments}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default DocumentsList;