import React, { Component } from "react"; //For react component
import "bootstrap/dist/css/bootstrap.min.css";

import 'react-tabs/style/react-tabs.css';

import Select from 'react-select';

import SchoolDataService from "../services/school.service";

export default class FormDesignation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentForm: {
        id: null,
        availableSchools: null,
        chosenSchools: null
      },

      schools: [],
      availableSchoolsFull: [],      
      chosenSchoolsFull: [], 
      readonly: false            
    };
  }

  componentDidMount() {
    var chosenSchools = this.props.chosenSchools? this.props.chosenSchools : [];
      this.setState({
        readonly: this.props.readonly,
        currentForm: {
          chosenSchools: chosenSchools
        }      
      },

    );    
    this.getSchools(chosenSchools);
  }

  updateSelection(chosenIds, init = false) {
    if (this.state.readonly && !init) return;

    const chosen = [];
    const chosenFull = [];
    const available = [];
    const availableFull = [];    
    var schools = this.state.schools;
    if (schools && chosenIds) {
      for (var i = 0; i < schools.length; i++) {
        var found = false;
        for (var j = 0; j < chosenIds.length; j++) {
          if (schools[i].value === chosenIds[j]) {
            found = true;
            chosen.push(schools[i].value);
            chosenFull.push(schools[i]);
            break;
          }
        }
        if (!found) {
          available.push(schools[i].value);
          availableFull.push(schools[i]);          
        }
      }
    }
    this.setState({
        chosenSchoolsFull: chosenFull,
        availableSchoolsFull: availableFull,
        currentForm: {
          //...prevState.currentForm,
          availableSchools: available,
          chosenSchools: chosen
        }        
      },
    ); 

    if (!init)
      this.props.setSchools(chosen);

  }

  convert(schools) {
    const result = [];
    if (schools) {
    for (var i = 0; i < schools.length; i++) {
      result.push({value: schools[i].id,
        label: schools[i].code + "-" + schools[i].name + "-" + schools[i].region });
    }
    return result;
    }
  }

  getSchoolIds(schools) {
    const ids = [];
    if (schools) {
      for (let i = 0; i < schools.length; i++){
        ids.push(schools[i].value);
      }
    }
    return ids;
  }

  getSchools(chosenSchools) {
    SchoolDataService.getAllSimple()
      .then(response => {
        this.setState({
          schools: this.convert(response.data)
        });

        this.updateSelection(chosenSchools, true);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }


  customFilter(option, inputValue) {
    return (option.label.toString().match(inputValue) || []).length > 0;
  }

  onSelectSchool(e) {
    this.updateSelection(this.state.currentForm.chosenSchools.concat([e.value]));

  }
  
  onDeselectSchool(e) {
    this.updateSelection(this.state.currentForm.chosenSchools.filter(element => element !== e.value));

  }
 
  render() {
    return (
      <div className="row mb-3 ">
        <div className="col-sm-5 ml-2">
          <label htmlFor="available">未选学校</label>
          <Select onChange={this.onSelectSchool.bind(this)}
          readonly={this.state.readonly?"":false}
          value={''}
          class="form-control"
          required
          id="available"
          multiple
          size="5"
          style="height: 24pt"
          menuIsOpen
          name="available"
          filterOption={this.customFilter}
          options={this.state.availableSchoolsFull}
        />
      </div>

      <div className="row mb-3 col-sm-2">

        <button className="col-sm-3" title="全选" onClick={() => {this.updateSelection(this.getSchoolIds(this.state.schools))}} >
          <i class="fa fa-angle-double-right" ></i>
        </button>

        <div className="col-sm-6"/>

        <button className="col-sm-3" title="全退" onClick={() => {this.updateSelection([])}} >
          <i class="fa fa-angle-double-left" ></i>
        </button>        

      </div>

      <div className="col-sm-5 ml-2">
          <label htmlFor="chosen">已选学校</label>
          <Select onChange={this.onDeselectSchool.bind(this)}
          readonly={this.state.readonly?"":false}
          value={''}
          class="form-control"
          required
          id="chosen"
          multiple
          size="5"
          style="height: 24pt"
          menuIsOpen
          name="chosen"
          filterOption={this.customFilter}
          options={this.state.chosenSchoolsFull}
        />
      </div>      
    </div>
    )
  }
}
