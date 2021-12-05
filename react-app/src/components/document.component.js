import React, { Component } from "react";
import DocumentDataService from "../services/document.service";

export default class Document extends Component {
  constructor(props) {
    super(props);
    this.onChangeOriginalname = this.onChangeOriginalname.bind(this);
    this.onChangeCreatedAt = this.onChangeCreatedAt.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.updatePublished = this.updatePublished.bind(this);
    this.updateDocument = this.updateDocument.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);

    this.state = {
      currentDocument: {
        id: null,
        originalname: "",
        createdAt: "",
        published: false
      },
      message: ""
    };
  }

  componentDidMount() {
    this.getDocument(this.props.match.params.id);
  }

  onChangeOriginalname(e) {
    const originalname = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDocument: {
          ...prevState.currentDocument,
          originalname: originalname
        }
      };
    });
  }

  onChangeCreatedAt(e) {
    const createdAt = e.target.value;

    this.setState(prevState => ({
      currentDocument: {
        ...prevState.currentDocument,
        createdAt: createdAt
      }
    }));
  }

  getDocument(id) {
    DocumentDataService.get(id)
      .then(response => {
        this.setState({
          currentDocument: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getDocumentContent(id) {
    DocumentDataService.getContent(id)
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



  render() {
    const { currentDocument } = this.state;
    return (
      <div>
        {DocumentDataService.getContent(currentDocument.id)}
      </div>
    );
  }
}
