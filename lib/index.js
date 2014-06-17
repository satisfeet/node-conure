var errors = require('./errors');
var Client = require('./client');

exports.createClient = function(options) {
  if (!options) throw new Error('Client required "options".');
  if (!options.username) throw new Error('Client requires "username".');
  if (!options.username) throw new Error('Client requires "password".');

  return new Client(options);
};

exports.Client = Client;

exports.UnknownError        = errors.UnknownError;
exports.AuthenticationError = errors.AuthenticationError;
