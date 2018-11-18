// Redux Actions

const { actionEnum, actionFunc } = require('./index-next');

/** @type {UiActions} */
const actionMap = Object.assign({}, actionEnum, actionFunc);

module.exports = actionMap;
