var http = require('http');
var util = require('util');

exports.UnknownError = function(res) {
  this.name = 'ConureUnknownError';
  this.message = 'Unknown error: "' + http.STATUS_CODES[res.statusCode] + '".';
};

exports.NotFoundError = function(res) {
  this.name = 'ConureUnknownError';
  this.message = 'Did not found requested resource "' + res.path + '".';
};

exports.InternalServerError = function(res) {
  this.name = 'ConureInternalServerError';
  this.message = 'There was a problem on the server.';
};

exports.InvalidRequestError = function(res) {
  this.name = 'ConureInvalidRequestError';
  this.message = 'There was a problem with the request.';
};

exports.AuthenticationError = function(res) {
  this.name = 'ConureAuthenticationError';
  this.message = 'Authentication failed with client credentials.';
};

// ultimate inheritance
for (var key in exports) {
  util.inherits(exports[key], Error);

  exports[key].prototype.inspect = toString;
  exports[key].prototype.toString = toString;
}

function toString() {
  return this.message;
}
