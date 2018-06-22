const React = require('react');
const PropTypes = require('prop-types');
const utils = require('../../libs/utils');

function noteReadMetrics(props) {
  const { note: { metrics } } = props;
  if (!metrics) {
    return null;
  }

  const renderedMetrics = utils.metaMetrics.map((metaMetric) => {
    if (!metrics[metaMetric.key]) {
      return null;
    }

    let value;
    switch (metaMetric.type) {
      case 'toggle':
        value = '✔';
        break;
      case 'length':
        value = `: ${metrics[metaMetric.key]} inches`;
        break;
      case 'weight':
        value = `: ${metrics[metaMetric.key]} lbs`;
        break;
      default:
        value = `: ${metrics[metaMetric.key]}`;
        break;
    }

    return (
      <li key={metaMetric.key}>
        {`${metaMetric.label} ${value}`}
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
