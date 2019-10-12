import _ from 'lodash';

/**
 * Get user object
 */
const getUser = (req: import('express').Request): UiUser | undefined => {
  const { user, logger } = req;
  if (!user) {
    logger.trace({
      msg: 'user is not defined in /render/index getUser()',
      user,
    });
    return user as undefined;
  }
  const responseUser = _.pick(user, [
    '_id', 'name', 'locationIds', 'status', 'isLoggedIn', 'activeLocationId',
  ]);
  responseUser.status = 'success';
  responseUser.isLoggedIn = true;

  if (user.locationIds && user.locationIds.length) {
    [responseUser.activeLocationId] = user.locationIds;
  }

  logger.trace({
    msg: 'User is logged in',
    responseUser,
  });

  // Convert the BizUser object to a UiUser object which has stronger
  // typing for some of the properties.
  const uiUser = {
    ...responseUser,
    isLoggedIn: !!responseUser.isLoggedIn,
    locationIds: responseUser.locationIds || [],
    name: responseUser.name || '',
    status: responseUser.status || 'success',
  };

  return uiUser;
};

/**
 * Server Side Render SSR
 */
export const indexHtml = (data: ServerSideRenderData, ssr: boolean): string => {
  const {
    html = '',
    initialState = /** @type {PlantStateTree} */ ({}),
    og = /** @type {OpenGraphMeta[]} */ ([]), // Facebook Open Graph
    req,
    title = 'Plaaant',
  } = data;

  const user = getUser(req);
  if (user) {
    (initialState as PlantStateTree).user = user;
  }

  const ogMeta = og.map((i) => `<meta property="og:${i.property}" content="${i.content}" />`);

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
window.__SSR__ = ${!!ssr};
window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}\
</script>\
<script src="/bundle.js"></script>\
</body>
</html>`;
};
