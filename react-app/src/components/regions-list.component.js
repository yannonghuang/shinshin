import React, { Component } from "react";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

const RegionsList = (props) => {
  const [regions, setRegions] = useState([]);

  const [currentRegion, setCurrentRegion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [responseId, setResponseId] = useState(props.match? props.match.params.responseId : props.responseId);
  //const [responseId, setResponseId] = useState(props.match.params.responseId);

  const regionsRef = useRef();
  regionsRef.current = regions;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const onChangeSearchOriginalname = (e) => {
    const searchOriginalname = e.target.value;
    setSearchOriginalname(searchOriginalname);
  };

  const getRequestParams = (page, pageSize) => {
    let params = {};

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    return params;
  };

  const retrieveRegions = () => {
    const params = getRequestParams(page, pageSize);

    SchoolDataService.getCountsByRegion(params)
      .then((response) => {

        const { schools, totalPages } = response.data;

        setRegions(schools);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {

        console.log(e);
      });
  };

  useEffect(retrieveRegions, [page, pageSize]);

  const refreshList = () => {
    retrieveRegions();
  };

  const openRegion = (rowIndex) => {
    const region = regionsRef.current[rowIndex].region;

    props.history.push("/schools/" + region);
  };


  const columns = useMemo(
    () => [
      {
        Header: "省（自治区）",
        accessor: "region",
      },

      {
        Header: "学校数",
        accessor: "schoolsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>

              <Link
                to={"/schools/" + regionsRef.current[rowIdx].region}
                className="badge badge-success"
              >
                {regionsRef.current[rowIdx].schoolsCount}
              </Link>

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
    data: regions,
  },
  useSortBy);

  const findByOriginalname = () => {
    setPage(1);
    retrieveRegions();
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
      <div className="col-md-8">
        <h4>地区列表</h4>
{/*}
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
*/}
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


    </div>
  );
};

export default RegionsList;