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
  const start = moment(startAt, 'YYYY-MM-DD HH:mm:ss.SSS', true);
  const end = moment(endAt, 'YYYY-MM-DD HH:mm:ss.SSS', true);

  return start.isValid() && end.isValid() && start.isBefore(end);
}

module.exports = {
    isUndefined,
    isNotValidString,
    isNotValidInteger,
    areValidDates
}