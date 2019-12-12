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

export default function noteEditMetrics(props: NoteEditMetricProps) {
  /**
   * Handle multiple change value types
   */
  const dispatchChange = (name: MetaMetricKey, value: string | boolean): void => {
    const { interimNote, dispatch } = props;
    const interimMetrics = interimNote.metrics || {} as NoteMetric;

    // @ts-ignore - TODO - fix types here
    const metrics = produce(interimMetrics, (draft) => {
      // @ts-ignore - TODO - fix types here
      draft[name] = value;
    });

    // The change will be something like:
    // {metrics: { height: 23.4 }} or {metrics: { blossom: true }}
    dispatch(actionFunc.editNoteChange({ metrics }));
  };

  /**
   * Change Handler for InputComboText
   */
  const onChange = (namo: string, value: string): void => {
    const name = namo as MetaMetricKey;
    dispatchChange(name, value);
  };

  const booleanHandler = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    const { name } = event.currentTarget as { name: MetaMetricKey };
    dispatchChange(name, checked);
  };

  const renderLength = (metaMetric: MetaMetric, value: any) => {
    const renderValue = (value || value === 0) ? value.toString() : '';
    return (
      <InputComboText
        changeHandler={onChange}
        id={metaMetric.key}
        key={metaMetric.key}
        label={metaMetric.label}
        name={metaMetric.key}
        placeholder={metaMetric.placeholder}
        type="text"
        value={renderValue}
      />
    );
  };

  const renderCount = (metaMetric: MetaMetric, value: any) => renderLength(metaMetric, value);

  const renderWeight = (metaMetric: MetaMetric, value: any) => renderLength(metaMetric, value);

  const renderToggle = (metaMetric: MetaMetric, value: any) => {
    const isToggled = value === 'true' || value === true;
    return (
      <FormControlLabel
        control={(
          <Switch
            checked={isToggled}
            color="primary"
            name={metaMetric.key}
            onChange={booleanHandler}
            style={{ paddingLeft: '5px', maxWidth: '200px' }}
          />
        )}
        key={metaMetric.key}
        label={metaMetric.label}
        labelPlacement="start"
        style={{ display: 'block' }}
      />
    );
  };

  const metricTypes = Object.freeze({
    length: renderLength,
    count: renderCount,
    weight: renderWeight,
    toggle: renderToggle,
  });

  /**
   * @param metaMetric - All the metrics available
   * @param value - the value if one has been set or an empty string.
   * @returns - a rendered React component to edit this type of metric
   */
  const renderMetric = (
    metaMetric: MetaMetric, value: number | boolean,
  ): object => metricTypes[metaMetric.type](metaMetric, value);


  const { interimNote, error } = props;
  const {
    metrics = {} as NoteMetric,
  } = interimNote || {};
  const { metaMetrics } = utils;

  const renderedMetrics = metaMetrics.map((metaMetric) => {
    const { key } = metaMetric;
    const value = metrics[key];
    // const renderValue = (value || value === 0) ? value : '';
    return renderMetric(metaMetric, value);
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

noteEditMetrics.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.string,
  interimNote: PropTypes.shape({
    metrics: PropTypes.object,
  }).isRequired,
};

noteEditMetrics.defaultProps = {
  error: '',
};
