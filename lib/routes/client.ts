// These are routes that the client will handle
// To get around: Cannot redeclare block-scoped variable .ts(2451)
// To get around: Cannot redeclare block-scoped variable .ts(2451)

import { Application, Request, Response } from 'express';

import { indexHtml } from '../render';
import { renderPlant as plant } from '../render/plant';
import { renderArticle as article } from '../render/article';

// For these types of routes just send back the basic html
// and it will do the rest of the routing on the client.
/**
 * static index
 */
function staticIndex(title: string, req: Request, res: Response) {
  res.send(indexHtml({ title, req }, false));
}

/**
 * api note routes
 */
function client(app: Application) {
  const clientRoutes = [
    { route: '/', title: 'Plaaant' },
    { route: '/help', title: 'Plaaant Help' },
    { route: '/layout/:slug/:id', title: 'Plaaant Layout' },
    { route: '/location/:slug/:id', title: 'Plants at Location' },
    { route: '/locations/:slug/:id', title: 'Locations' },
    { route: '/login', title: 'Plaaant Login' },
    { route: '/metrics/:slug/:id', title: 'Metrics at Location' },
    { route: '/plants/:slug/:id', title: 'Plaaant Plant List' },
    { route: '/privacy', title: 'Plaaant Privacy Policy' },
    { route: '/profile', title: 'Plaaant User Profile' },
    { route: '/terms', title: 'Plaaant Terms and Conditions' },
  ];

  clientRoutes.forEach((route) => {
    app.get(route.route, staticIndex.bind(null, route.title));
  });
}

/**
 * api note routes
 */
function server(app: Application) {
  app.get('/plant/:slug/:id', plant);
  app.get('/article/:slug/:id', article);
}

/**
 * api note routes
 */
export const clientServerApi = (app: Application) => {
  client(app);
  server(app);
};
