
// TODO: Rename this something more appropriate because not using Token anymore.
/**
 * requireToken
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next
 */
function requireToken(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).send({ error: 'Not Authenticated' });
  }
  return next();
}

module.exports = {
  // tokenCheck,
  requireToken,
};
