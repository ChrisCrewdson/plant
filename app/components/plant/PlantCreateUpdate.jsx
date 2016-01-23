// Used to add/edit a plant to/in the user's collection
// Url Create: /plant
// Url Update: /plant/<slug>/<plant-id>

import _ from 'lodash';
import {makeSlug} from '../../libs/utils';
import {validate} from '../../models/plant';
import * as actions from '../../actions';
import Divider from 'material-ui/lib/divider';
import InputCombo from '../InputCombo';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import React from 'react';
import TextField from 'material-ui/lib/text-field';

export default class PlantCreateUpdate extends React.Component {
  static contextTypes = {
    history: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  componentWillMount() {
    if(!_.isEmpty(this.props.plant)){
      const pageTitle = this.props.plant.mode === 'edit'
        ? `Edit ${this.props.plant.title}`
        : `Add New Plant`;
      this.setState({...this.props.plant, pageTitle });
    } else {
      this.setState({});
    }
  }

  cancel() {
    if(this.props.plant.mode === 'edit') {
      this.props.dispatch(actions.setPlantMode({
        _id: this.props.plant._id,
        mode: 'read'
      }));
    } else {
      // Transition to /plants
      this.context.history.pushState(null, '/plants');
    }
  }

  save(e) {
    const isNew = this.props.plant.mode === 'create';
    validate(this.state, {isNew}, (err, transformed) => {
      if(err) {
        this.setState({errors: err});
      } else {
        if(isNew) {
          this.props.dispatch(actions.createPlantRequest(transformed));
        } else {
          this.props.dispatch(actions.updatePlantRequest(transformed));
        }
        this.context.history.pushState(null, `/plant/${makeSlug(transformed.title)}/${transformed._id}`);
      }
    });
    e.preventDefault();
    e.stopPropagation();
    // TODO: Open Plant page and allow for adding of a note.
  }

  handleChange(propName, e) {
    var change = {
      [propName]: e.target.value
    };
    this.setState(change);
  }

  render() {
    const {
      title,
      botanicalName,
      commonName,
      description,
      purchasedDate,
      plantedDate,
      price,
      errors = {},
      pageTitle
    } = this.state || {};

    if(!_.isEmpty(errors)) {
      console.log('errors:', errors);
    }

    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      textAlign: 'center',
      display: 'inline-block',
    };

    const underlineStyle = {
      display: 'none',
    };

    const textFieldStyle = {
      marginLeft: 20
    };

    const textAreaStyle = {
      ...textFieldStyle,
      textAlign: 'left'
    };




    return (
      <Paper style={paperStyle} zDepth={5}>
        <h2 style={{textAlign: 'center'}}>{pageTitle}</h2>

        <InputCombo
          error={errors.title}
          label='Title'
          value={title}
          placeholder={`How do you refer to this plant? (e.g. Washington Navel)`}
          changeHandler={this.handleChange.bind(this, 'title')}
        />
        <Divider />

        <InputCombo
          error={errors.botanicalName}
          label='Botanical Name'
          value={botanicalName}
          extraClasses='col-sm-6'
          placeholder={`e.g. Citrus sinensis 'Washington Navel'`}
          changeHandler={this.handleChange.bind(this, 'botanicalName')}
        />
        <Divider />

        <InputCombo
          error={errors.commonName}
          label='Common Name'
          extraClasses='col-sm-6'
          value={commonName}
          placeholder={`e.g. Washington Navel Orange`}
          changeHandler={this.handleChange.bind(this, 'commonName')}
        />
        <Divider />

        <TextField
          errorText={errors.description}
          floatingLabelText='Description'
          fullWidth={true}
          hintText={`Describe this plant and/or the location in your yard`}
          multiLine={true}
          onChange={this.handleChange.bind(this, 'description')}
          style={textAreaStyle}
          underlineStyle={underlineStyle}
          value={description}
        />
        <Divider />

        <InputCombo
          error={errors.purchasedDate}
          extraClasses='col-sm-4'
          label='Purchase Date'
          value={purchasedDate}
          placeholder={`MM/DD/YYYY`}
          changeHandler={this.handleChange.bind(this, 'purchasedDate')}
        />
        <Divider />

        <InputCombo
          error={errors.plantedDate}
          extraClasses='col-sm-4'
          label='Planted Date'
          value={plantedDate}
          placeholder={`MM/DD/YYYY`}
          changeHandler={this.handleChange.bind(this, 'plantedDate')}
        />
        <Divider />

        <InputCombo
          error={errors.price}
          extraClasses='col-sm-4'
          label='Price'
          value={price}
          placeholder={`$9.99`}
          changeHandler={this.handleChange.bind(this, 'price')}
        />
        <Divider />

        {!_.isEmpty(errors) &&
          <div>
            <p className='text-danger col-xs-12'>There were errors. Please check your input.</p>
            <Divider />
          </div>
        }

        <div style={{textAlign: 'right'}}>
          <RaisedButton
            label='Cancel'
            onClick={this.cancel.bind(this)}
          />
          <RaisedButton
            label='Save'
            onClick={this.save.bind(this)}
            style={{marginLeft: '10px'}}
          />
        </div>

      </Paper>
    );
  }
};

PlantCreateUpdate.propTypes = {
  plant: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  mode: React.PropTypes.string.isRequired
};
