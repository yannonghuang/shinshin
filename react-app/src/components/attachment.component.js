import React, { Component } from "react";
import AttachmentDataService from "../services/attachment.service";

export default class Attachment extends Component {
  constructor(props) {
    super(props);
    this.onChangeOriginalname = this.onChangeOriginalname.bind(this);
    this.onChangeCreatedAt = this.onChangeCreatedAt.bind(this);
    this.getAttachment = this.getAttachment.bind(this);
    this.updatePublished = this.updatePublished.bind(this);
    this.updateAttachment = this.updateAttachment.bind(this);
    this.deleteAttachment = this.deleteAttachment.bind(this);

    this.state = {
      currentAttachment: {
        id: null,
        originalname: "",
        createdAt: "",
        published: false
      },
      message: ""
    };
  }

  componentDidMount() {
    this.getAttachment(this.props.match.params.id);
  }

  onChangeOriginalname(e) {
    const originalname = e.target.value;

    this.setState(function(prevState) {
      return {
        currentAttachment: {
          ...prevState.currentAttachment,
          originalname: originalname
        }
      };
    });
  }

  onChangeCreatedAt(e) {
    const createdAt = e.target.value;

    this.setState(prevState => ({
      currentAttachment: {
        ...prevState.currentAttachment,
        createdAt: createdAt
      }
    }));
  }

  getAttachment(id) {
    AttachmentDataService.get(id)
      .then(response => {
        this.setState({
          currentAttachment: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getAttachmentContent(id) {
    AttachmentDataService.getContent(id)
      .then((response) => {
          return (
            <div> response.data </div>
          );
      /**
        console.log(response.data);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.file');
        document.body.appendChild(link);
        link.click();
        */
      });
  }

  updatePublished(status) {
    var data = {
      id: this.state.currentAttachment.id,
      originalname: this.state.currentAttachment.originalname,
      createdAt: this.state.currentAttachment.createdAt,
      published: status
    };

    AttachmentDataService.update(this.state.currentAttachment.id, data)
      .then(response => {
        this.setState(prevState => ({
          currentAttachment: {
            ...prevState.currentAttachment,
            published: status
          }
        }));
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  updateAttachment() {
    AttachmentDataService.update(
      this.state.currentAttachment.id,
      this.state.currentAttachment
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "The attachment was updated successfully!"
        });
      })
      .catch(e => {
        console.log(e);
      });
  }

  deleteAttachment() {
    AttachmentDataService.delete(this.state.currentAttachment.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/attachments')
      })
      .catch(e => {
        console.log(e);
      });
  }


  render() {
    const { currentAttachment } = this.state;

    return (
      <div>
        {currentAttachment ? (
          <div className="edit-form">
            <h4>Attachment</h4>
            <form>
              <div className="form-group">
                <label htmlFor="originalname">Original Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="originalname"
                  value={currentAttachment.originalname}
                  onChange={this.onChangeOriginalname}
                />
              </div>
              <div className="form-group">
                <label htmlFor="createdAt">Created At</label>
                <input
                  type="text"
                  className="form-control"
                  id="createdAt"
                  value={currentAttachment.createdAt}
                  onChange={this.onChangeCreatedAt}
                />
              </div>
            </form>

            <button className="badge badge-success" href="">
              <a href={"http://localhost:8080/api/attachmentsContent/" + currentAttachment.id} target="blank" >View</a>
            </button>

            <button
              className="badge badge-danger mr-2"
              onClick={this.deleteAttachment}
            >
              Delete
            </button>

            <button
              className="badge badge-warning"
              onClick={() => this.getAttachmentContent(currentAttachment.id)}
            >
              Save
            </button>
            <p>{this.state.message}</p>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on a Attachment...</p>
          </div>
        )}
      </div>
    );
  }
}
