
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
    // debug('fake fb initialize setup');
    return (req, res, next) => {
      // debug('fake fb initialize called');
      next();
    };
  }

  authenticate(type, cb) {
    if (cb) {
      // debug('fake fb authenticate setup with cb');
      const err = null;
      const info = {};
      return () => cb(err, this.user, info);
    }
    // debug('fake fb authenticate setup');
    return (req, res, next) => next();
  }

  // eslint-disable-next-line class-methods-use-this
  use(/* strategy */) {
    // debug('fake fb use:', arguments.length);
  }
}

module.exports = FakePassport;
