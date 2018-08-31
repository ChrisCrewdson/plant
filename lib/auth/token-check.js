

// TODO: Rename this something more appropriate because not using Token anymore.
function requireToken(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: 'Not Authenticated' });
  }
  return next();
}

module.exports = {
  // tokenCheck,
  requireToken,
};
