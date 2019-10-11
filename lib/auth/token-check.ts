
import { Request, Response, NextFunction } from 'express';

// TODO: Rename this something more appropriate because not using Token anymore.
/**
 * requireToken
 */
export function requireToken(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).send({ error: 'Not Authenticated' });
  }
  return next();
}
