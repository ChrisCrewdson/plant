const React = require('react');
const PropTypes = require('prop-types');
const utils = require('../../libs/utils');

/**
 * @param {NoteReadMetricsProps} props
 */
function noteReadMetrics(props) {
  const { note: { metrics } } = props;
  if (!metrics) {
    return null;
  }

  const renderedMetrics = utils.metaMetrics.map((metaMetric) => {
    const { key, type, label } = metaMetric;
    if (!metrics[key] && metrics[key] !== 0) {
      return null;
    }

    let value;
    switch (type) {
      case 'toggle':
        value = '✔';
        break;
      case 'length':
        value = `: ${metrics[key]} inches`;
        break;
      case 'weight':
        value = `: ${metrics[key]} lbs`;
        break;
      default:
        value = `: ${metrics[key]}`;
        break;
    }

    return (
      <li key={key}>
        {`${label} ${value}`}
      </li>
    );
  });

  return (
    <div>
      <h5>
Metrics:
      </h5>
      <ul>
        {renderedMetrics}
      </ul>
    </div>
  );
}

noteReadMetrics.propTypes = {
  note: PropTypes.shape({
    metrics: PropTypes.object,
  }).isRequired,
};

module.exports = noteReadMetrics;
