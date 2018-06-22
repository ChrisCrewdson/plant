
const marked = require('marked');
const React = require('react');
const PropTypes = require('prop-types');

function markdown(props) {
  const { markdown: md } = props;
  const mkn = { __html: marked(md || '') };
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={mkn} />;
}

markdown.propTypes = {
  markdown: PropTypes.string,
};

markdown.defaultProps = {
  markdown: '',
};

module.exports = markdown;
