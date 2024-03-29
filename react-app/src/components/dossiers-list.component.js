import React, { Component } from "react";
import DossierDataService from "../services/dossier.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

const DossiersList = (props) => {
  const [dossiers, setDossiers] = useState([]);
  const [currentDossier, setCurrentDossier] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [projectId, setProjectId] = useState(props.match? props.match.params.projectId : props.projectId);
  const [docCategory, setDocCategory] = useState(props.match? props.match.params.docCategory : props.docCategory);

  const [readonly, setReadonly] = useState(props.readonly ? props.readonly : false);

  const [embedded, setEmbedded] = useState(props.embedded ? props.embedded : false);

  const dossiersRef = useRef();
  dossiersRef.current = dossiers;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const [totalItems, setTotalItems] = useState(0);

  const onChangeSearchOriginalname = (e) => {
    const searchOriginalname = e.target.value;
    setSearchOriginalname(searchOriginalname);
  };

  const getRequestParams = (/*searchOriginalname, page, pageSize, projectId, docCategory*/) => {
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

    if (projectId) {
      params["projectId"] = projectId;
    }

    if (docCategory) {
      params["docCategory"] = docCategory;
    }

    return params;
  };

  const retrieveDossiers = () => {
    const params = getRequestParams(/*searchOriginalname, page, pageSize, projectId, docCategory*/);

    DossierDataService.getAll2(params)
      .then((response) => {
        const { dossiers, totalPages, totalItems } = response.data;

        setDossiers(dossiers);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveDossiers, [page, pageSize]);

  const refreshList = () => {
    retrieveDossiers();
  };

  const removeAllDossiers = () => {
    DossierDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openDossier = (rowIndex) => {
    const id = dossiersRef.current[rowIndex].id;

    props.history.push("/dossiers/" + id);
  };

  const promote = (rowIndex) => {
    const id = dossiersRef.current[rowIndex].id;

    let originalname = prompt("请输入新文件名", "");
    if (!originalname) return;

    DossierDataService.promote(id, {originalname})
      .then((response) => {
        alert('项目附件成功升级为学校文档');
      })
      .catch((e) => {
        alert('项目附件升级失败：' + JSON.stringify(e));
        console.log(e);
      });
  };

  const deleteDossier = (rowIndex) => {
    const id = dossiersRef.current[rowIndex].id;

    DossierDataService.delete(id)
      .then((response) => {
        //props.history.push("/dossiers");

        let newDossiers = [...dossiersRef.current];
        newDossiers.splice(rowIndex, 1);

        setDossiers(newDossiers);
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
          const d = new Date(dossiersRef.current[rowIdx].createdAt);
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
      },
      {
        Header: "类别",
        accessor: "docCategory",
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
                <i className="badge badge-success mr-2">存档</i>
              </a>              
{/*
              {(dossiersRef.current[rowIdx].mimetype.startsWith('image') ||
                dossiersRef.current[rowIdx].mimetype.indexOf('pdf') > 0 ||
                dossiersRef.current[rowIdx].mimetype.indexOf('msword') > 0)
                && (
*/}
                  <a href="#" onClick={() => download(dossiersRef.current[rowIdx].id,
                                                dossiersRef.current[rowIdx].originalname,
                                                dossiersRef.current[rowIdx].mimetype, true)} >
                    <i className="fas fa-eye action mr-2"></i>
                  </a>
{/*
              )}
*/}
              <a href="#" onClick={() => download(dossiersRef.current[rowIdx].id,
                                                dossiersRef.current[rowIdx].originalname,
                                                dossiersRef.current[rowIdx].mimetype, false)} >
                <i className="fas fa-download action mr-2"></i>
              </a>

              {!readonly && (<span onClick={() => window.confirm("您确定要删除吗 ?") && deleteDossier(rowIdx)}>
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
    data: dossiers,
    disableSortRemove: true,
  },
  useSortBy);

  const findByOriginalname = () => {
    setPage(1);
    retrieveDossiers();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  const download = (id, originalname, mimetype, previewOnly) => {
    DossierDataService.getContent(id)
	  .then(response => {
        console.log(response.data);

        const url = window.URL.createObjectURL(new Blob([response.data], { type: mimetype }));
        const link = document.createElement('a');
        link.href = url;
/**
        if (!previewOnly)
          link.setAttribute('download',
            originalname
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
        <h4>项目附件列表(总数：{totalItems})</h4>
        {!embedded && (<div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="文件名查找。。。"
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

export default DossiersList;