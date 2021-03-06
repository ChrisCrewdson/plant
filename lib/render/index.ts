import _ from 'lodash';
import { Request } from 'express';
import { PlantStateTree } from '../types/react-common';

interface OpenGraphMeta {
  property: string;
  content: string;
}

interface ServerSideRenderData {
  html?: string;
  initialState?: PlantStateTree;
  og?: OpenGraphMeta[]; // Facebook Open Graph
  req: import('express').Request;
  title?: string;
}

/**
 * Get user object
 */
const getUser = (req: Request): UiUser | undefined => {
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
    initialState = {} as PlantStateTree,
    og = [] as OpenGraphMeta[], // Facebook Open Graph
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
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    ${ogMeta.join('\n')}
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
    <link rel="manifest" href="/manifest.json">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
    <meta charset="UTF-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="theme-color" content="#ffffff">
    <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no">
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
