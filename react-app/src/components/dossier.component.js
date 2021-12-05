import React, { Component } from "react";
import DossierDataService from "../services/dossier.service";

export default class Dossier extends Component {
  constructor(props) {
    super(props);
    this.onChangeOriginalname = this.onChangeOriginalname.bind(this);
    this.onChangeCreatedAt = this.onChangeCreatedAt.bind(this);
    this.getDossier = this.getDossier.bind(this);
    this.updatePublished = this.updatePublished.bind(this);
    this.updateDossier = this.updateDossier.bind(this);
    this.deleteDossier = this.deleteDossier.bind(this);

    this.state = {
      currentDossier: {
        id: null,
        originalname: "",
        createdAt: "",
        published: false
      },
      message: ""
    };
  }

  componentDidMount() {
    this.getDossier(this.props.match.params.id);
  }

  onChangeOriginalname(e) {
    const originalname = e.target.value;

    this.setState(function(prevState) {
      return {
        currentDossier: {
          ...prevState.currentDossier,
          originalname: originalname
        }
      };
    });
  }

  onChangeCreatedAt(e) {
    const createdAt = e.target.value;

    this.setState(prevState => ({
      currentDossier: {
        ...prevState.currentDossier,
        createdAt: createdAt
      }
    }));
  }

  getDossier(id) {
    DossierDataService.get(id)
      .then(response => {
        this.setState({
          currentDossier: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getDossierContent(id) {
    DossierDataService.getContent(id)
      .then((response) => {
          return (
            <div> response.data </div>
          );
      /**
        console.log(response.data);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = dossier.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.file');
        dossier.body.appendChild(link);
        link.click();
        */
      });
  }



  render() {
    const { currentDossier } = this.state;
    return (
      <div>
        {DossierDataService.getContent(currentDossier.id)}
      </div>
    );
  }
}
