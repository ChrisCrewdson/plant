
import marked from 'marked';
import React from 'react';
import PropTypes from 'prop-types';

interface MarkdownProps {
  markdown: string;
}

export default function markdown(props: MarkdownProps) {
  const { markdown: md } = props;
  const mkn = { __html: marked(md || '') };
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={mkn} />;
}

markdown.propTypes = {
  markdown: PropTypes.string.isRequired,
};
