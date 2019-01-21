// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const React = require('react');
const Toggle = require('material-ui/Toggle').default;
const PropTypes = require('prop-types');
const { actionFunc } = require('../../actions');
const Errors = require('../common/Errors');
const InputCombo = require('../common/InputCombo');
const utils = require('../../libs/utils');

class NoteEditMetrics extends React.PureComponent {
  /**
   * @param {NoteEditMetricProps} props
   */
  constructor(props) {
    super(props);
    this.booleanHandler = this.booleanHandler.bind(this);
    this.dispatchChange = this.dispatchChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.renderCount = this.renderCount.bind(this);
    this.renderLength = this.renderLength.bind(this);
    this.renderMetric = this.renderMetric.bind(this);
    this.renderToggle = this.renderToggle.bind(this);
    this.renderWeight = this.renderWeight.bind(this);

    /** @type {Dictionary<Function>} */
    this.metricTypes = Object.freeze({
      length: this.renderLength,
      count: this.renderCount,
      weight: this.renderWeight,
      toggle: this.renderToggle,
    });
  }

  /**
   * Change Handler for InputCombo
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {void}
   */
  onChange(e) {
    const { name, value } = e.target;
    this.dispatchChange(name, value);
  }

  /**
   * @param {React.MouseEvent<HTMLInputElement>} e
   * @param {boolean} isInputChecked
   * @returns {void}
   */
  booleanHandler = (e, isInputChecked) => {
    const { name } = e.currentTarget;
    this.dispatchChange(name, isInputChecked);
  };

  /**
   * Handle multiple change value types
   * @param {string} name
   * @param {string|boolean} value
   * @returns {void}
   * @memberof NoteEditMetrics
   */
  dispatchChange(name, value) {
    const { interimNote, dispatch } = /** @type {NoteEditMetricProps} */ (this.props);
    const interimMetrics = interimNote.metrics || {};

    const metrics = seamless.set(interimMetrics, name, value);

    // The change will be something like:
    // {metrics: { height: 23.4, blossom: true }}
    dispatch(actionFunc.editNoteChange({ metrics }));
  }

  /**
   * @param {MetaMetric} metaMetric
   * @param {*} value
   */
  renderLength(metaMetric, value) {
    const renderValue = (value || value === 0) ? value.toString() : '';
    return (
      <InputCombo
        changeHandler={this.onChange}
        id={metaMetric.key}
        key={metaMetric.key}
        label={metaMetric.label}
        name={metaMetric.key}
        placeholder={metaMetric.placeholder}
        type="number"
        value={renderValue}
      />
    );
  }

  /**
   * @param {MetaMetric} metaMetric
   * @param {*} value
   */
  renderCount(metaMetric, value) {
    return this.renderLength(metaMetric, value);
  }

  /**
   * @param {MetaMetric} metaMetric
   * @param {*} value
   */
  renderWeight(metaMetric, value) {
    return this.renderLength(metaMetric, value);
  }

  /**
   * @param {MetaMetric} metaMetric
   * @param {*} value
   */
  renderToggle(metaMetric, value) {
    const isToggled = value === 'true' || value === true;
    return (
      <Toggle
        key={metaMetric.key}
        label={metaMetric.label}
        labelPosition="left"
        name={metaMetric.key}
        onToggle={this.booleanHandler}
        style={{ paddingLeft: '5px', maxWidth: '200px' }}
        toggled={isToggled}
      />
    );
  }

  /**
   * @param {object} metaMetric - All the metrics available
   * @param {string} value - the value if one has been set or an empty string.
   * @returns {object} - a rendered React component to edit this type of metric
   */
  renderMetric(metaMetric, value) {
    return this.metricTypes[metaMetric.type](metaMetric, value);
  }

  render() {
    const { interimNote, error } = /** @type {NoteEditMetricProps} */ (this.props);
    const { metrics = {} } = interimNote || {};
    const { metaMetrics } = utils;

    const renderedMetrics = metaMetrics.map((metaMetric) => {
      const value = metrics[metaMetric.key];
      const renderValue = (value || value === 0) ? value : '';
      return this.renderMetric(metaMetric, renderValue);
    });

    return (
      <div style={{ textAlign: 'left' }}>
        <Errors errors={error} />
        <div>
          {renderedMetrics}
        </div>
      </div>
    );
  }
}

NoteEditMetrics.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.string,
  interimNote: PropTypes.shape({
    metrics: PropTypes.object,
  }).isRequired,
};

NoteEditMetrics.defaultProps = {
  error: '',
};

module.exports = NoteEditMetrics;
