import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.min.js'

import SchoolDataService from "../services/school.service";

export default class AddSchool extends Component {
  constructor(props) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePrincipal = this.onChangePrincipal.bind(this);
    this.onChangePhoto = this.onChangePhoto.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangePhone = this.onChangePhone.bind(this);
    this.onChangeStudentsCount = this.onChangeStudentsCount.bind(this);
    this.onChangeTeachersCount = this.onChangeTeachersCount.bind(this);
    this.onChangeRegion = this.onChangeRegion.bind(this);

    this.saveSchool = this.saveSchool.bind(this);
    this.newSchool = this.newSchool.bind(this);

    this.state = {
      id: null,
      name: "",
      description: "",
      principal: "",
      photo: null,
      file: null,
      address: "",
      phone: "",
      studentsCount: 0,
      teachersCount: 0,
      region: "",

      regions: [],
      submitted: false
    };
  }

  componentDidMount() {
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

  onChangeRegion(e) {
    this.setState({
      region: e.target.value
    });
  }

  onChangeFile(e) {
    this.setState({
      file: e.target.value
    });
  }

  onChangeName(e) {
    this.setState({
      name: e.target.value
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    });
  }

  onChangePrincipal(e) {
    this.setState({
      principal: e.target.value
    });
  }

  onChangePhoto(e) {
    this.setState({
      photo: e.target.value
    });
  }

  onChangeAddress(e) {
    this.setState({
      address: e.target.value
    });
  }

  onChangePhone(e) {
    this.setState({
      phone: e.target.value
    });
  }

  onChangeTeachersCount(e) {
    this.setState({
      teachersCount: e.target.value
    });
  }

  onChangeStudentsCount(e) {
    this.setState({
      studentsCount: e.target.value
    });
  }

  saveSchool() {
    var data = {
      name: this.state.name,
      description: this.state.description,
      principal: this.state.principal,
      //photo: this.state.photo,
      region: this.state.region,
      address: this.state.address,
      phone: this.state.phone,
      studentsCount: this.state.studentsCount,
      teachersCount: this.state.teachersCount,
    };

    SchoolDataService.create(data)
      .then(response => {
        this.setState({
          id: response.data.id,

          name: response.data.name,
          description: response.data.description,
          principal: response.data.principal,
          //photo: response.data.photo,
          region: response.data.region,
          address: response.data.address,
          phone: response.data.phone,
          studentsCount: response.data.studentsCount,
          teachersCount: response.data.teachersCount,

          submitted: true
        });
        if (this.state.file)
          this.updatePhoto();
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  updatePhoto() {
    let data = new FormData();
    data.append('multi-files', this.state.file, this.state.file.name);
    SchoolDataService.updatePhoto(this.state.id, data)
    .then(response => {
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
  }

  newSchool() {
    this.setState({
      id: null,
      name: "",
      description: "",
      principal: "",
      photo: null,
      region: "",
      address: "",
      phone: "",
      studentsCount: 0,
      teachersCount: 0,

      submitted: false
    });
  }

  onDrag = event => {
    event.preventDefault()
  }

  onDrop = event => {
    event.preventDefault();
    let file = event.dataTransfer.files[0];
    this.setState({ file: file });

    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState({ photo: reader.result });
  }

  render() {
    return (
      <div >
        <h4>新增学校</h4>
        {this.state.submitted ? (
          <div>
            <h4>You submitted successfully!</h4>
            <button class="btn btn-success" onClick={this.newSchool}>
              Add
            </button>
          </div>
        ) : (
          <div class="row">
            <div class="form-group">
              <label htmlFor="name">学校名称</label>
              <input
                type="text"
                class="form-control"
                id="name"
                required
                value={this.state.name}
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
                value={this.state.principal}
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
                value={this.state.description}
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
                value={this.state.region}
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
                value={this.state.address}
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
                value={this.state.phone}
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
                value={this.state.studentsCount}
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
                value={this.state.teachersCount}
                onChange={this.onChangeTeachersCount}
                name="teachersCount"
              />
            </div>

            <div class="w-100"></div>

            <div class="col" onDragOver={this.onDrag} onDrop={this.onDrop}>
                <p>上传照片（拖拽照片文件到下框中）</p>
                <img src={this.state.photo} height="400" width="500"/>
            </div>

            <div class="w-100"></div>

            <button onClick={this.saveSchool} class="btn btn-success">
              Submit
            </button>
          </div>
        )}
      </div>
    );
  }
}
