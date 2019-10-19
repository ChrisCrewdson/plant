import si from 'seamless-immutable';
import React from 'react';
import Toggle from 'material-ui/Toggle';
import PropTypes from 'prop-types';

import { Dispatch } from 'redux';
import { actionFunc } from '../../actions';
import Errors from '../common/Errors';
import InputCombo from '../common/InputCombo';
import utils, { MetaMetric } from '../../libs/utils';
import { PlantAction } from '../../../lib/types/redux-payloads';

// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = si.static;

interface NoteEditMetricProps {
  dispatch: Dispatch<PlantAction<any>>;
  interimNote: UiInterimNote;
  error: string;
}

export default class NoteEditMetrics extends React.PureComponent {
  props!: NoteEditMetricProps;

  metricTypes: Record<string, Function>;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    error: PropTypes.string,
    interimNote: PropTypes.shape({
      metrics: PropTypes.object,
    }).isRequired,
  };

  static defaultProps = {
    error: '',
  };

  constructor(props: NoteEditMetricProps) {
    super(props);
    this.booleanHandler = this.booleanHandler.bind(this);
    this.dispatchChange = this.dispatchChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.renderCount = this.renderCount.bind(this);
    this.renderLength = this.renderLength.bind(this);
    this.renderMetric = this.renderMetric.bind(this);
    this.renderToggle = this.renderToggle.bind(this);
    this.renderWeight = this.renderWeight.bind(this);

    this.metricTypes = Object.freeze({
      length: this.renderLength,
      count: this.renderCount,
      weight: this.renderWeight,
      toggle: this.renderToggle,
    });
  }

  /**
   * Change Handler for InputCombo
   */
  onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    this.dispatchChange(name, value);
  }

  booleanHandler = (e: React.MouseEvent<HTMLInputElement>, isInputChecked: boolean): void => {
    const { name } = e.currentTarget;
    this.dispatchChange(name, isInputChecked);
  };

  /**
   * Handle multiple change value types
   */
  dispatchChange(name: string, value: string | boolean): void {
    const { interimNote, dispatch } = this.props;
    const interimMetrics = interimNote.metrics || {};

    const metrics = seamless.set(interimMetrics, name, value);

    // The change will be something like:
    // {metrics: { height: 23.4, blossom: true }}
    dispatch(actionFunc.editNoteChange({ metrics }));
  }

  renderLength(metaMetric: MetaMetric, value: any) {
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

  renderCount(metaMetric: MetaMetric, value: any) {
    return this.renderLength(metaMetric, value);
  }

  renderWeight(metaMetric: MetaMetric, value: any) {
    return this.renderLength(metaMetric, value);
  }

  renderToggle(metaMetric: MetaMetric, value: any) {
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
   * @param metaMetric - All the metrics available
   * @param value - the value if one has been set or an empty string.
   * @returns - a rendered React component to edit this type of metric
   */
  renderMetric(metaMetric: MetaMetric, value: number | boolean): object {
    return this.metricTypes[metaMetric.type](metaMetric, value);
  }

  render() {
    const { interimNote, error } = this.props;
    const {
      metrics = {} as NoteMetric,
    } = interimNote || {};
    const { metaMetrics } = utils;

    const renderedMetrics = metaMetrics.map((metaMetric) => {
      const { key } = metaMetric;
      const value = metrics[key];
      // const renderValue = (value || value === 0) ? value : '';
      return this.renderMetric(metaMetric, value);
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
