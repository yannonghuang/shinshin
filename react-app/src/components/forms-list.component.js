import React, { Component } from "react";
import FormDataService from "../services/form.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import YearPicker from 'react-single-year-picker';

const FormsList = (props) => {
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCreatedAt, setSearchCreatedAt] = useState("");

  const formsRef = useRef();
  formsRef.current = forms;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [orderby, setOrderby] = useState([]);

  const pageSizes = [5, 10, 20];

  const [totalItems, setTotalItems] = useState(0);

  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);
  };

  const onChangeSearchCreatedAt = (e) => {
    const searchCreatedAt = e; // e.target.value;
    setSearchCreatedAt(searchCreatedAt);
  };

  const onChangeSearchInputCreatedAt = (e) => {
    const searchCreatedAt = e; //e.target.value;
    setSearchCreatedAt(searchCreatedAt);
  };

  const getRequestParams = (/*searchTitle, page, pageSize, orderby*/) => {
    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
    }

    if (searchCreatedAt) {
      params["createdAt"] = searchCreatedAt;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if (orderby) {
      params["orderby"] = orderby;
    }

    return params;
  };

  const onClearSearch = (e) => {
    setSearchTitle("");
    setSearchCreatedAt("");
    setOrderby([]);
  };

  const retrieveForms = () => {
    const params = getRequestParams(/*searchTitle, page, pageSize, orderby*/);

    FormDataService.getAll2(params)
      .then((response) => {
        const { forms, totalPages, totalItems  } = response.data;

        setForms(forms);
        setCount(totalPages);
        setTotalItems(totalItems);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(retrieveForms, [page, pageSize, orderby, searchTitle, searchCreatedAt]);

  const refreshList = () => {
    retrieveForms();
  };

  const removeAllForms = () => {
    FormDataService.deleteAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  const openForm = (rowIndex) => {
    const id = formsRef.current[rowIndex].id;
    props.history.push("/forms/" + id);
  };

  const deleteForm = (rowIndex) => {
    const id = formsRef.current[rowIndex].id;

    FormDataService.delete(id)
      .then((response) => {
        //props.history.push("/forms");

        let newForms = [...formsRef.current];
        newForms.splice(rowIndex, 1);

        setForms(newForms);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const columns = useMemo(
    () => [
      {
        Header: "截止日期",
        accessor: "deadline",
      },
      {
        Header: "创建时间",
        accessor: "createdAt",
        Cell: (props) => {
          const rowIdx = props.row.id;
            const d = new Date(formsRef.current[rowIdx].createdAt);
            return (
              <div>
                {d.toLocaleDateString('zh-cn', { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            );
        }
      },
      {
        Header: "标题",
        accessor: "title",
        disableSortBy: true,
      },
      {
        Header: "项目申请数目",
        accessor: "responsesCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={"/responses/form/" + formsRef.current[rowIdx].id}
                className="badge badge-success"
              >
                {formsRef.current[rowIdx].responsesCount}
              </Link>
            </div>
          );
        },
      },
      {
        Header: "操作",
        accessor: "actions",
        disableSortBy: true,
        Cell: (props) => {
          const rowIdx = props.row.id;
          const expired = formsRef.current[rowIdx].deadline
            ? new Date(formsRef.current[rowIdx].deadline) < new Date()
            : false;
          return (
            <div>
              <Link
                to={"/addR/" + formsRef.current[rowIdx].id}
                className= {expired ? "disabled-link" : "badge badge-success mr-2"}
              >
                {expired ? "逾期 " : "申请"}
              </Link>

              <Link
                to={"/formsView/" + formsRef.current[rowIdx].id}
              >
                <i className="fas fa-eye action mr-2"></i>
              </Link>

              <span onClick={() => openForm(rowIdx)}>
                <i className="far fa-edit action mr-2"></i>
              </span>

              <span onClick={() => window.confirm("您确定要删除吗 ?") && deleteForm(rowIdx)}>
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
    state: {sortBy},
  } = useTable({
    columns,
    data: forms,
    disableSortRemove: true,
    manualSortBy: true,
    initialState: {
      sortBy: [
        {
          id: 'deadline',
          desc: true
        }
      ]
    },
  },
  useSortBy);

  const findByTitle = () => {
    setPage(1);
    retrieveForms();
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
      <div className="col-md-8">
        <h4>项目征集列表(总数：{totalItems})</h4>
        <div className="input-group mb-3">
          <input
            type="text"
            readonly=""
            className="form-control"
            placeholder="项目年份"
            value={searchCreatedAt}
            onChange={onChangeSearchInputCreatedAt}
          />
          <YearPicker
            yearArray={['2019', '2020']}
            value={searchCreatedAt}
            onSelect={onChangeSearchCreatedAt}
            hideInput={true}
            minRange={1995}
            maxRange={2022}
          />

          <input
            type="text"
            className="form-control"
            placeholder="标题查找"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />

          <div>
            <button
              className="btn btn-primary badge btn-block"
              type="button"
              onClick={onClearSearch}
            >
              清空
            </button>
          </div>

          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByTitle}
            >
              查找
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
                         {/*column.isSorted*/ (column.id === 'createdAt' || column.id === 'deadline' || column.id === 'responsesCount')
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

export default FormsList;