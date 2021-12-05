import React, { Component } from "react";
import ResponseDataService from "../services/response.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

export default class ResponsesList extends Component {
  constructor(props) {
    super(props);
    this.onChangeSearchTitle = this.onChangeSearchTitle.bind(this);
    this.retrieveResponses = this.retrieveResponses.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.setActiveResponse = this.setActiveResponse.bind(this);
    this.removeAllResponses = this.removeAllResponses.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    this.state = {
      responses: [],
      currentResponse: null,
      currentIndex: -1,
      searchTitle: "",

      page: 1,
      count: 0,
      pageSize: 3,
    };

    this.pageSizes = [3, 6, 9];
  }

  componentDidMount() {
    this.retrieveResponses();
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

  retrieveResponses() {
    const { searchTitle, page, pageSize } = this.state;
    const params = this.getRequestParams(searchTitle, page, pageSize);

    var data = {
      title: this.state.searchTitle,
      page: this.state.page - 1,
      size: this.state.pageSize
    };

    //ResponseDataService.getAll(params)
    ResponseDataService.getAll2(data)
      .then((response) => {
        const { responses, totalPages } = response.data;

        this.setState({
          responses: responses,
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
        this.retrieveResponses();
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
        this.retrieveResponses();
      }
    );
  }

  refreshList() {
    this.retrieveResponses();
    this.setState({
      currentResponse: null,
      currentIndex: -1
    });
  }

  setActiveResponse(response, index) {
    this.setState({
      currentResponse: response,
      currentIndex: index
    });
  }

  removeAllResponses() {
    ResponseDataService.deleteAll()
      .then(response => {
        console.log(response.data);
        this.refreshList();
      })
      .catch(e => {
        console.log(e);
      });
  }

  searchTitle() {
    ResponseDataService.findByTitle(this.state.searchTitle)
      .then(response => {
        this.setState({
          responses: response.data
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
      responses,
      currentResponse,
      currentIndex,
      page,
      count,
      pageSize,
    } = this.state;

    return (
      <div className="list row">
        <div className="col-md-8">
          <div className="input-group mb-3">
            <input
              type="text"
              className="response-control"
              placeholder="Search by title"
              value={searchTitle}
              onChange={this.onChangeSearchTitle}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={this.retrieveResponses}
              >
                Search
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <h4>Responses List</h4>

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
            {responses &&
              responses.map((response, index) => (
                <li
                  className={
                    "list-group-item " +
                    (index === currentIndex ? "active" : "")
                  }
                  onClick={() => this.setActiveResponse(response, index)}
                  key={index}
                >
                  {response.title}
                </li>
              ))}
          </ul>

          <button
            className="m-3 btn btn-sm btn-danger"
            onClick={this.removeAllResponses}
          >
            Remove All
          </button>
        </div>
        <div className="col-md-6">
          {currentResponse ? (
            <div>
              <h4>Response</h4>
              <div>
                <label>
                  <strong>Title:</strong>
                </label>{" "}
                {currentResponse.title}
              </div>

              <Link
                to={"/responses/" + currentResponse.id}
                className="badge badge-warning"
              >
                Edit
              </Link>
            </div>
          ) : (
            <div>
              <br />
              <p>Please click on a Response...</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
