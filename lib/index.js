var errors = require('./errors');
var Client = require('./client');

exports.createClient = function(options) {
  return new Client(options);
};

exports.UnknownError        = errors.UnknownError;
exports.NotFoundError       = errors.NotFoundError;
exports.AuthenticationError = errors.AuthenticationError;
exports.InternalServerError = errors.InternalServerError;
