
class FakePassport {
  constructor(user) {
    this.user = user;
  }

  setUser(user) {
    this.user = user;
  }

  getUserId() {
    return this.user._id;
  }

  // eslint-disable-next-line class-methods-use-this
  initialize() {
    return (req, res, next) => {
      next();
    };
  }

  authenticate(type, cb) {
    if (cb) {
      const err = null;
      const info = {};
      return () => cb(err, this.user, info);
    }
    return (req, res, next) => next();
  }

  // eslint-disable-next-line class-methods-use-this
  use(/* strategy */) {
  }
}

module.exports = FakePassport;
