import { Application } from 'express';
import { rss } from './rss';

import { auth } from '../auth/auth-routes';
import { clientServerApi as client } from './client';
import { locationsApi } from './api-locations';
import { noteApi } from './api-note';
import { plantApi } from './api-plant';
import { plantsApi } from './api-plants';
import { userApi } from './api-user';

const shortMap: Record<string, string> = {
  guy: '/location/guy-ellis-yard/5851d7d52967c2153ab6c856',
  prea: '/location/preashni-aheer-yard/5851d7d52967c2153ab6c857',
};

/**
 * Short Url alias for location - start off with hard coding a single one
 */
const shortUrl = (app: Application): void => {
  // The 's' is for short.
  // Idea will be to allow people to add their own short url at some point
  // in the future and this will be a unique field in the location collection
  app.get('/s/:short', (req, res) => {
    const { short } = req.params;
    const url = shortMap[short] || shortMap.guy;
    return res.redirect(url);
  });
};

/**
 * Short Url alias for location - start off with hard coding a single one
 */
export async function index(app: Application): Promise<any> {
  client(app);
  auth(app);
  locationsApi(app);
  noteApi(app);
  plantApi(app);
  plantsApi(app);
  userApi(app);
  rss(app);
  shortUrl(app);
}
