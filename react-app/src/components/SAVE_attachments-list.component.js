import React, { Component } from "react";
import AttachmentDataService from "../services/attachment.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import Collapsible from 'react-collapsible';

export default class AttachmentsList extends Component {
  constructor(props) {
    super(props);
    this.onChangeSearchOriginalname = this.onChangeSearchOriginalname.bind(this);
    this.retrieveAttachments = this.retrieveAttachments.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.setActiveAttachment = this.setActiveAttachment.bind(this);
    this.removeAllAttachments = this.removeAllAttachments.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    this.state = {
      attachments: [],
      currentAttachment: null,
      currentIndex: -1,
      searchTitle: "",
      responseId: this.props.responseId,

      page: 1,
      count: 0,
      pageSize: 3,
    };

    this.pageSizes = [3, 6, 9];
  }

  componentDidMount() {
    this.setState({
      responseId: this.props.responseId,
    });
    this.retrieveAttachments();
  }

  onChangeSearchOriginalname(e) {
    const searchOriginalname = e.target.value;

    this.setState({
      searchOriginalname: searchOriginalname,
    });
  }

  getRequestParams(searchOriginalname, page, pageSize) {
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

    if (this.state.responseId) {
      params["responseId"] = this.state.responseId;
    }

    return params;
  }


  retrieveAttachments() {
    const { searchOriginalname, page, pageSize } = this.state;
    const params = this.getRequestParams(searchOriginalname, page, pageSize);

    var data = {
      originalname: this.state.searchOriginalname,
      responseId: this.props.responseId,
      page: this.state.page - 1,
      size: this.state.pageSize
    };

    //AttachmentDataService.getAll(params)
    AttachmentDataService.getAll2(data)
      .then((response) => {
        const { attachments, totalPages } = response.data;

        this.setState({
          attachments: attachments,
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
        this.retrieveAttachments();
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
        this.retrieveAttachments();
      }
    );
  }

  refreshList() {
    this.retrieveAttachments();
    this.setState({
      currentAttachment: null,
      currentIndex: -1
    });
  }

  setActiveAttachment(attachment, index) {
    this.setState({
      currentAttachment: attachment,
      currentIndex: index
    });
  }

  removeAllAttachments() {
    AttachmentDataService.deleteAll()
      .then(response => {
        console.log(response.data);
        this.refreshList();
      })
      .catch(e => {
        console.log(e);
      });
  }

/*
  searchOriginalname() {
    AttachmentDataService.findByOriginalname(this.state.searchOriginalname)
      .then(response => {
        this.setState({
          attachments: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }
*/
  render() {
    const {
      searchOriginalname,
      attachments,
      currentAttachment,
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
              className="form-control"
              placeholder="文件名查找"
              value={searchOriginalname}
              onChange={this.onChangeSearchOriginalname}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={this.retrieveAttachments}
              >
                Search
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <h4>附件列表</h4>

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
            {attachments &&
              attachments.map((attachment, index) => (
                <li
                  className={
                    "list-group-item " +
                    (index === currentIndex ? "active" : "")
                  }
                  onClick={() => this.setActiveAttachment(attachment, index)}
                  key={index}
                >
                  {attachment.originalname}
                </li>
              ))}
          </ul>

        </div>
        <div className="col-md-6">
          {currentAttachment ? (
            <div>
              <h4>附件</h4>
              <div>
                <label>
                  <strong>文件名:</strong>
                </label>{" "}
                {currentAttachment.originalname}
              </div>

              <Link
                to={"/attachments/" + currentAttachment.id}
                className="badge badge-warning" target="blank"
              >
                Edit
              </Link>
            </div>
          ) : (
            <div>
              <br />
              <p>请在左边附件列表中选择...</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
