const React = require('react');
const Toggle = require('material-ui/Toggle').default;
const Divider = require('material-ui/Divider').default;
const { RadioButton } = require('material-ui/RadioButton');
const { RadioButtonGroup } = require('material-ui/RadioButton');
const PropTypes = require('prop-types');
const InputComboText = require('../common/InputComboText');
const { actionFunc } = require('../../actions');

class PlantEditTerminated extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { dispatch } = this.props;
    const { interimPlant } = this.props;
    let { terminatedReason } = interimPlant;
    if (!terminatedReason) {
      terminatedReason = 'died';
      dispatch(actionFunc.editPlantChange({
        terminatedReason,
      }));
    }
  }

  onChange(e) {
    const { dispatch } = this.props;
    const { name: inputName } = e.target;
    const value = inputName === 'isTerminated' ? e.target.checked : e.target.value;

    dispatch(actionFunc.editPlantChange({
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
      interimPlant: {
        errors = {},
        isTerminated = false,
        terminatedDate = '',
        terminatedDescription = '',
        terminatedReason,
      },
    } = this.props;

    const dateFormat = 'MM/DD/YYYY';

    return (
      <div>
        <Toggle
          label="Terminated"
          labelPosition="left"
          name="isTerminated"
          onToggle={this.onChange}
          style={{ paddingLeft: '5px', maxWidth: '150px' }}
          toggled={isTerminated}
        />
        {isTerminated
          && (
          <div>
            <InputComboText
              changeHandler={this.onChange}
              error={errors.terminatedDate}
              id="termination-date"
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
            <InputComboText
              changeHandler={this.onChange}
              error={errors.terminatedDescription}
              id="termination-description"
              label="Termination Description"
              name="terminatedDescription"
              placeholder="(Optional) Describe why this plant was terminated."
              value={terminatedDescription}
            />

            <Divider />
          </div>
          )
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
