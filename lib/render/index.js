
module.exports = (data = {}, ssr = false) => {
  const {
    html = '',
    initialState = {},
    title = 'Plaaant',
    og = [], // Facebook Open Graph
  } = data;

  const ogMeta = og.map(i => `<meta property="og:${i.property}" content="${i.content}" />`);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    ${ogMeta.join('\n')}
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
    <link rel="manifest" href="/manifest.json">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
    <meta charset="UTF-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="theme-color" content="#ffffff">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
  </head>
<body>\
<div id='wrapper'>\
${html}\
</div>\
<script>\
window.__SSR__ = ${ssr};
window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}\
</script>\
<script src="/bundle.js"></script>\
</body>
</html>`;
};
