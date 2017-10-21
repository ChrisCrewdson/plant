const React = require('react');
const utils = require('../../libs/utils');
// const Immutable = require('immutable');
const PropTypes = require('prop-types');

function noteReadMetrics(props) {
  const mets = props.note.get('metrics');
  if (!mets) {
    return null;
  }

  const metrics = mets.toJS();

  const renderedMetrics = utils.metaMetrics.toJS().map((metaMetric) => {
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
      <h5>Metrics:</h5>
      <ul>
        {renderedMetrics}
      </ul>
    </div>
  );
}

noteReadMetrics.propTypes = {
  note: PropTypes.shape({
    get: PropTypes.func.isRequired,
    toJS: PropTypes.func.isRequired,
  }).isRequired,
};

module.exports = noteReadMetrics;
