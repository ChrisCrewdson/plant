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
    this.onChange = this.onChange.bind(this);
    this.renderMetric = this.renderMetric.bind(this);
    this.renderLength = this.renderLength.bind(this);
    this.renderCount = this.renderCount.bind(this);
    this.renderWeight = this.renderWeight.bind(this);
    this.renderToggle = this.renderToggle.bind(this);

    /** @type {Dictionary<Function>} */
    this.metricTypes = Object.freeze({
      length: this.renderLength,
      count: this.renderCount,
      weight: this.renderWeight,
      toggle: this.renderToggle,
    });
  }

  /**
   * Change handler for materialui Toggle control - placeholder - currently unused
   * @param {React.MouseEvent<{}>} e
   * param {boolean} isInputChecked
   */
  onChangeToggle(e /* , isInputChecked */) {
    const { name, checked, value } = e.target;
    const { interimNote, dispatch } = /** @type {NoteEditMetricProps} */ (this.props);
    const interimMetrics = interimNote.metrics || {};
    const metaMetric = utils.metaMetricsGetByKey(name);
    if (!metaMetric) {
      return;
    }
    const { type } = metaMetric;
    // based on name (e.g. blossom or height) we need to lookup
    // the type to determine where to pull the value. Types of toggle
    // have their values in "checked" otherwise in "value"
    // The change will be something like:
    // {metrics: { height: 23.4, blossom: true }}

    const controlValue = type === 'toggle' ? checked : value;

    const metrics = seamless.set(interimMetrics, name, controlValue);

    dispatch(actionFunc.editNoteChange({ metrics }));
  }

  /**
   * Change Handler for InputCombo
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  onChange(e) {
    // console.log('onChange:', e.target.name);
    const { name, checked, value } = e.target;
    const { interimNote, dispatch } = /** @type {NoteEditMetricProps} */ (this.props);
    const interimMetrics = interimNote.metrics || {};
    const metaMetric = utils.metaMetricsGetByKey(name);
    if (!metaMetric) {
      return;
    }
    const { type } = metaMetric;
    // based on name (e.g. blossom or height) we need to lookup
    // the type to determine where to pull the value. Types of toggle
    // have their values in "checked" otherwise in "value"
    // The change will be something like:
    // {metrics: { height: 23.4, blossom: true }}

    const controlValue = type === 'toggle' ? checked : value;

    const metrics = seamless.set(interimMetrics, name, controlValue);

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
        onToggle={this.onChange}
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
