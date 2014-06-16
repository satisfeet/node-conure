var errors = require('./errors');
var Client = require('./client');

exports.createClient = function(options) {
  return new Client(options);
};

exports.Client = Client;

exports.UnknownError        = errors.UnknownError;
exports.AuthenticationError = errors.AuthenticationError;
