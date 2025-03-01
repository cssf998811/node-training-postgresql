const moment = require('moment');

function isUndefined(value) {
  return value === undefined;
}

function isNotValidString(value) {
  return typeof value !== "string" || value.trim().length === 0 || value === "";
}

function isNotValidInteger(value) {
  return typeof value !== "number" || value < 0 || value % 1 !== 0;
}

function areValidDates(startAt, endAt) {
  const format = 'YYYY-MM-DD HH:mm:ss';
  const start = moment(startAt, format, true);
  const end = moment(endAt, format, true);

  return start.isValid() && end.isValid() && start.isBefore(end);
}

function isValidPassword(password) {
  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
  return passwordPattern.test(password)
}

module.exports = {
    isUndefined,
    isNotValidString,
    isNotValidInteger,
    areValidDates,
    isValidPassword
}