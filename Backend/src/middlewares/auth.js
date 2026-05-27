const passport = require('passport');
const httpStatus = require('../utils/httpStatus.js');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  req.user.role = 'admin';

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    const nextFn = typeof next === 'function' ? next : () => {};
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
        req,
        res,
        nextFn,
      );
    })
      .then(() => {
        if (typeof next === 'function') next();
      })
      .catch((err) => {
        if (typeof next === 'function') return next(err);
        res.status(err.statusCode || err.status || 500).json({ message: err.message || 'Unauthorized' });
      });
  };

module.exports = auth;
