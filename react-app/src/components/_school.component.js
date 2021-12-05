import React, { Component } from "react";
import SchoolDataService from "../services/school.service";

export default class School extends Component {
  constructor(props) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePrincipal = this.onChangePrincipal.bind(this);
    this.onChangePhoto = this.onChangePhoto.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeStudentsCount = this.onChangeStudentsCount.bind(this);
    this.onChangeTeachersCount = this.onChangeTeachersCount.bind(this);
    this.onChangeRegion = this.onChangeRegion.bind(this);

    this.getSchool = this.getSchool.bind(this);
    this.getSchoolPhoto = this.getSchoolPhoto.bind(this);
    this.updatePublished = this.updatePublished.bind(this);
    this.updateSchool = this.updateSchool.bind(this);
    this.updatePhoto = this.updatePhoto.bind(this);
    this.deleteSchool = this.deleteSchool.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      currentSchool: {
        id: null,
        name: "",
        description: "",
        principal: "",
        photo: null,
        file: null,
        region: "",
        address: "",
        phone: "",
        studentsCount: 0,
        teachersCount: 0,
      },

      regions: [],
      message: ""
    };
  }

  componentDidMount() {
    this.getSchool(this.props.match.params.id);
    this.getSchoolPhoto(this.props.match.params.id);

    this.getRegions();
  }

  getRegions() {
    SchoolDataService.getRegions()
      .then(response => {
        this.setState({
          regions: response.data
        });
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  onChangeName(e) {
    const name = e.target.value;

    this.setState(function(prevState) {
      return {
        currentSchool: {
          ...prevState.currentSchool,
          name: name
        }
      };
    });
  }

  onChangeDescription(e) {
    const description = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        description: description
      }
    }));
  }

  onChangePrincipal(e) {
    const principal = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        principal: principal
      }
    }));
  }

  onChangePhoto(e) {
    const photo = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        photo: photo
      }
    }));
  }

  onChangeAddress(e) {
    const address = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        address: address
      }
    }));
  }

  onChangeRegion(e) {
    const region = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        region: region
      }
    }));
  }

  onChangePhone(e) {
    const phone = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        phone: phone
      }
    }));
  }

  onChangeTeachersCount(e) {
    const teachersCount = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        teachersCount: teachersCount
      }
    }));
  }

  onChangeStudentsCount(e) {
    const studentsCount = e.target.value;

    this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        studentsCount: studentsCount
      }
    }));
  }

  getSchool(id) {
    SchoolDataService.get(id)
      .then(response => {
        this.setState({
          currentSchool: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  getSchoolPhoto(id) {
    SchoolDataService.getPhoto(id)
      .then(response => {
        var imageURL = 'data:image/png;base64,' +
            new Buffer(response.data.data.photo, 'binary').toString('base64');

        this.setState(prevState => ({
              currentSchool: {
                ...prevState.currentSchool,
                photo: imageURL
              }
            }));

        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  updatePublished(status) {
    var data = {
      id: this.state.currentSchool.id,
      title: this.state.currentSchool.title,
      description: this.state.currentSchool.description,
      published: status
    };

    SchoolDataService.update(this.state.currentSchool.id, data)
      .then(response => {
        this.setState(prevState => ({
          currentSchool: {
            ...prevState.currentSchool,
            published: status
          }
        }));
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  updateSchool() {
    var data = {
      name: this.state.currentSchool.name,
      description: this.state.currentSchool.description,
      principal: this.state.currentSchool.principal,
      //photo: this.state.currentSchool.photo,
      region: this.state.currentSchool.region,
      address: this.state.currentSchool.address,
      phone: this.state.currentSchool.phone,
      studentsCount: this.state.currentSchool.studentsCount,
      teachersCount: this.state.currentSchool.teachersCount,
    };

    SchoolDataService.update(
      this.state.currentSchool.id,
      data
      //this.state.currentSchool
    )
      .then(response => {
        console.log(response.data);
        this.setState({
          message: "The school was updated successfully!"
        });
      })
      .catch(e => {
        console.log(e);
      });

      if (this.state.currentSchool.file)
        this.updatePhoto();
  }

  updatePhoto() {
    var data = new FormData();
    data.append('multi-files', this.state.currentSchool.file, this.state.currentSchool.file.name);
    SchoolDataService.updatePhoto(this.state.currentSchool.id, data)
    .then(response => {
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  deleteSchool() {
    SchoolDataService.delete(this.state.currentSchool.id)
      .then(response => {
        console.log(response.data);
        this.props.history.push('/schools')
      })
      .catch(e => {
        console.log(e);
      });
  }

  onDrag = event => {
    event.preventDefault()
  }

  onDrop = event => {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    this.setState(prevState => ({
          currentSchool: {
            ...prevState.currentSchool,
            file: file
          }
        }));

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState(prevState => ({
      currentSchool: {
        ...prevState.currentSchool,
        photo: reader.result
      }
    }));
  }


  render() {
    const { currentSchool } = this.state;

    return (
      <div>
         <h4>学校信息</h4>
        {currentSchool ? (
          <div class="row">
            <div class="form-group">
              <label htmlFor="name">学校名称</label>
              <input
                type="text"
                class="form-control"
                id="name"
                required
                value={currentSchool.name}
                onChange={this.onChangeName}
                name="name"
              />
            </div>

            <div class="form-group col">
              <label htmlFor="principal">校长</label>
              <input
                type="text"
                class="form-control"
                id="principal"
                required
                value={currentSchool.principal}
                onChange={this.onChangePrincipal}
                name="principal"
              />
            </div>

            <div class="w-100"></div>

            <div class="form-group">
              <label htmlFor="description">说明</label>
              <input
                type="textarea"
                class="form-control"
                id="description"
                required
                value={currentSchool.description}
                onChange={this.onChangeDescription}
                name="description"
              />
            </div>

            <div class="w-100"></div>

            <div class="select-container form-group col">
              <label htmlFor="region">省/直辖市</label>
              <select onChange={this.onChangeRegion}
                class="form-control"
                id="region"
                required
                value={currentSchool.region}
                onChange={this.onChangeRegion}
                name="region"
              >
                <option value="">请选择</option>
                {this.state.regions.map((option) => (
                  <option value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div class="form-group col">
              <label htmlFor="address">地址</label>
              <input
                type="text"
                class="form-control"
                id="address"
                required
                value={currentSchool.address}
                onChange={this.onChangeAddress}
                name="address"
              />
            </div>

            <div class="form-group col">
              <label htmlFor="phone">电话</label>
              <input
                type="text"
                class="form-control"
                id="phone"
                required
                value={currentSchool.phone}
                onChange={this.onChangePhone}
                name="phone"
              />
            </div>

            <div class="w-100"></div>

            <div class="form-group col">
              <label htmlFor="studentsCount">学生人数</label>
              <input
                type="number"
                class="form-control"
                id="studentsCount"
                required
                value={currentSchool.studentsCount}
                onChange={this.onChangeStudentsCount}
                name="studentsCount"
              />
            </div>

            <div class="form-group col">
              <label htmlFor="teachersCount">教师人数</label>
              <input
                type="number"
                class="form-control"
                id="teachersCount"
                required
                value={currentSchool.teachersCount}
                onChange={this.onChangeTeachersCount}
                name="teachersCount"
              />
            </div>

            <div class="w-100"></div>

            <div class="col" onDragOver={this.onDrag} onDrop={this.onDrop}>
                <p>上传照片（拖拽照片文件到下框中）</p>
                <img src={currentSchool.photo} height="250" width="350"/>
            </div>

            <div class="w-100"></div>
            <button
              className="badge badge-danger mr-2"
              onClick={this.deleteSchool}
            >
              Delete
            </button>

            <button
              type="submit"
              className="badge badge-success"
              onClick={this.updateSchool}
            >
              Update
            </button>
            <p>{this.state.message}</p>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on a School...</p>
          </div>
        )}
      </div>
    );
  }
}
