const actions = require('../../actions');
const React = require('react');
const Toggle = require('material-ui/Toggle').default;
const InputCombo = require('../common/InputCombo');
const Divider = require('material-ui/Divider').default;
const { RadioButton } = require('material-ui/RadioButton');
const { RadioButtonGroup } = require('material-ui/RadioButton');
const PropTypes = require('prop-types');

class PlantEditTerminated extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    const { interimPlant } = this.props;
    let { terminatedReason } = interimPlant;
    if (!terminatedReason) {
      terminatedReason = 'died';
      this.props.dispatch(actions.editPlantChange({
        terminatedReason,
      }));
    }
  }

  onChange(e) {
    // console.log('onChange', e.target.name, e.target.checked, e.target.value);
    const { name: inputName } = e.target;
    const value = inputName === 'isTerminated' ? e.target.checked : e.target.value;

    this.props.dispatch(actions.editPlantChange({
      [inputName]: value,
    }));
  }

  render() {
    const styles = {
      radioGroup: {
        display: 'flex',
      },
      radioButton: {
        marginBottom: 16,
        width: 'inherit',
      },
    };

    const {
      errors = {},
      isTerminated = false,
      terminatedDate = '',
      terminatedDescription = '',
      terminatedReason,
    } = this.props.interimPlant;

    const dateFormat = 'MM/DD/YYYY';

    return (
      <div>
        <Toggle
          toggled={isTerminated}
          label="Terminated"
          labelPosition="left"
          name="isTerminated"
          onToggle={this.onChange}
          style={{ paddingLeft: '5px', maxWidth: '150px' }}
        />
        {isTerminated &&
          <div>
            <InputCombo
              changeHandler={this.onChange}
              error={errors.terminatedDate}
              label="Termination Date"
              name="terminatedDate"
              placeholder={dateFormat}
              value={terminatedDate}
            />
            <RadioButtonGroup
              defaultSelected={terminatedReason}
              name="terminatedReason"
              onChange={this.onChange}
              style={styles.radioGroup}
            >
              <RadioButton
                label="Culled"
                style={styles.radioButton}
                value="culled"
              />
              <RadioButton
                label="Died"
                style={styles.radioButton}
                value="died"
              />
              <RadioButton
                label="Transferred"
                style={styles.radioButton}
                value="transferred"
              />
            </RadioButtonGroup>
            <InputCombo
              changeHandler={this.onChange}
              error={errors.terminatedDescription}
              label="Termination Description"
              name="terminatedDescription"
              placeholder="(Optional) Describe why this plant was terminated."
              value={terminatedDescription}
            />

            <Divider />
          </div>
        }
      </div>
    );
  }
}

PlantEditTerminated.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interimPlant: PropTypes.shape({
    errors: PropTypes.object,
    isTerminated: PropTypes.bool,
    terminatedDate: PropTypes.string,
    terminatedDescription: PropTypes.string,
    terminatedReason: PropTypes.string,
  }).isRequired,
};

module.exports = PlantEditTerminated;
