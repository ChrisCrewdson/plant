const _ = require('lodash');

const getUser = (req = {}) => {
  const { user, logger } = req;
  if (!user) {
    logger.trace({
      msg: 'user is not defined in /render/index getUser()',
      user,
    });
    return user;
  }
  const responseUser = _.pick(user, ['_id', 'name', 'locationIds']);
  responseUser.status = 'success';
  responseUser.isLoggedIn = true;

  if (user.locationIds && user.locationIds.length) {
    if (!user.locationIds[0]._id) {
      // TODO: Pass in logger and log this.
      // logger.warn({
      //   msg: 'Missing user.locationIds[0]._id for user',
      //   locationIds: user.locationIds,
      // });
    }
    responseUser.activeLocationId = user.locationIds[0]._id;
  }

  logger.trace({
    msg: 'User is logged in',
    responseUser,
  });

  return responseUser;
};

module.exports = (data = {}, ssr = false) => {
  const {
    html = '',
    initialState = {},
    og = [], // Facebook Open Graph
    req,
    title = 'Plaaant',
  } = data;

  const user = getUser(req);
  if (user) {
    initialState.user = user;
  }

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
