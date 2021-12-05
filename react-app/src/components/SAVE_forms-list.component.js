import React, { Component } from "react";
import FormDataService from "../services/form.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

export default class FormsList extends Component {
  constructor(props) {
    super(props);
    this.onChangeSearchTitle = this.onChangeSearchTitle.bind(this);
    this.retrieveForms = this.retrieveForms.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.setActiveForm = this.setActiveForm.bind(this);
    this.removeAllForms = this.removeAllForms.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    this.state = {
      forms: [],
      currentForm: null,
      currentIndex: -1,
      searchTitle: "",

      page: 1,
      count: 0,
      pageSize: 3,
    };

    this.pageSizes = [3, 6, 9];
  }

  componentDidMount() {
    this.retrieveForms();
  }

  onChangeSearchTitle(e) {
    const searchTitle = e.target.value;

    this.setState({
      searchTitle: searchTitle,
    });
  }

  getRequestParams(searchTitle, page, pageSize) {
    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    return params;
  }

  retrieveForms() {
    const { searchTitle, page, pageSize } = this.state;
    const params = this.getRequestParams(searchTitle, page, pageSize);

    var data = {
      title: this.state.searchTitle,
      page: this.state.page - 1,
      size: this.state.pageSize
    };

    //FormDataService.getAll(params)
    FormDataService.getAll2(data)
      .then((response) => {
        const { forms, totalPages } = response.data;

        this.setState({
          forms: forms,
          count: totalPages,
        });
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  handlePageChange(event, value) {
    this.setState(
      {
        page: value,
      },
      () => {
        this.retrieveForms();
      }
    );
  }

  handlePageSizeChange(event) {
    this.setState(
      {
        pageSize: event.target.value,
        page: 1
      },
      () => {
        this.retrieveForms();
      }
    );
  }

  refreshList() {
    this.retrieveForms();
    this.setState({
      currentForm: null,
      currentIndex: -1
    });
  }

  setActiveForm(form, index) {
    this.setState({
      currentForm: form,
      currentIndex: index
    });
  }

  removeAllForms() {
    FormDataService.deleteAll()
      .then(response => {
        console.log(response.data);
        this.refreshList();
      })
      .catch(e => {
        console.log(e);
      });
  }

  searchTitle() {
    FormDataService.findByTitle(this.state.searchTitle)
      .then(response => {
        this.setState({
          forms: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const {
      searchTitle,
      forms,
      currentForm,
      currentIndex,
      page,
      count,
      pageSize,
    } = this.state;

    return (
      <div className="list row">
        <div className="col-md-6">
        <h4>项目征集列表</h4>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title"
              value={searchTitle}
              onChange={this.onChangeSearchTitle}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={this.retrieveForms}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {currentForm ? (
          <div>
              <h5>当前项目征集</h5>
              <div>
                <label>
                  <strong>Title:</strong>
                </label>{" "}
                {currentForm.title}
              </div>
              <div>
                <label>
                  <strong>Description:</strong>
                </label>{" "}
                {currentForm.description}
              </div>

              <div>
                <label>
                  <strong>Status:</strong>
                </label>
                {currentForm.published ? "Published" : "Pending"}
              </div>

              <Link
                to={"/forms/" + currentForm.id}
                className="badge badge-warning"
              >
                Edit
              </Link>

              <Link
                to={"/addR/" + currentForm.id}
                className="badge badge-success"
              >
                Reply
              </Link>
          </div>
          ) : (
            <div>
              <br />
              <p>Please click on a Form...</p>
            </div>
          )}
        </div>

        <div className="col-md-10">


          <div className="mt-3">
            {"Items per Page: "}
            <select onChange={this.handlePageSizeChange} value={pageSize}>
              {this.pageSizes.map((size) => (
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
              onChange={this.handlePageChange}
            />
          </div>

          <ul className="list-group">
            {forms &&
              forms.map((form, index) => (
                <li
                  className={
                    "list-group-item " +
                    (index === currentIndex ? "active" : "")
                  }
                  onClick={() => this.setActiveForm(form, index)}
                  key={index}
                >
                  {form.title}
                </li>
              ))}
          </ul>

          <button
            className="m-3 btn btn-sm btn-danger"
            onClick={this.removeAllForms}
          >
            Remove All
          </button>
        </div>

      </div>
    );
  }
}
