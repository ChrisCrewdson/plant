import { produce } from 'immer';
import React, { ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import { Dispatch } from 'redux';

import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { actionFunc } from '../../actions';
import Errors from '../common/Errors';
import InputComboText from '../common/InputComboText';
import utils, { MetaMetric } from '../../libs/utils';
import { PlantAction } from '../../../lib/types/redux-payloads';

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
   * Change Handler for InputComboText
   */
  onChange(namo: string, value: string): void {
    const name = namo as MetaMetricKey;
    this.dispatchChange(name, value);
  }

  booleanHandler = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    const { name } = event.currentTarget as { name: MetaMetricKey };
    this.dispatchChange(name, checked);
  };

  /**
   * Handle multiple change value types
   */
  dispatchChange(name: MetaMetricKey, value: string | boolean): void {
    const { interimNote, dispatch } = this.props;
    const interimMetrics = interimNote.metrics || {} as NoteMetric;

    // @ts-ignore - TODO - fix types here
    const metrics = produce(interimMetrics, (draft) => {
      // @ts-ignore - TODO - fix types here
      draft[name] = value;
    });

    // The change will be something like:
    // {metrics: { height: 23.4 }} or {metrics: { blossom: true }}
    dispatch(actionFunc.editNoteChange({ metrics }));
  }

  renderLength(metaMetric: MetaMetric, value: any) {
    const renderValue = (value || value === 0) ? value.toString() : '';
    return (
      <InputComboText
        changeHandler={this.onChange}
        id={metaMetric.key}
        key={metaMetric.key}
        label={metaMetric.label}
        name={metaMetric.key}
        placeholder={metaMetric.placeholder}
        type="text"
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
      <FormControlLabel
        control={(
          <Switch
            checked={isToggled}
            color="primary"
            name={metaMetric.key}
            onChange={this.booleanHandler}
            style={{ paddingLeft: '5px', maxWidth: '200px' }}
          />
        )}
        key={metaMetric.key}
        label={metaMetric.label}
        labelPlacement="start"
        style={{ display: 'block' }}
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
