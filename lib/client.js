var https       = require('https');
var querystring = require('querystring');

var errors  = require('./errors');
var request = require('./request');

function Client(options) {
  if (!options) throw new Error('Client required "options".');
  if (!options.username) throw new Error('Client requires "username".');
  if (!options.username) throw new Error('Client requires "password".');

  this.request = request({
    host: 'engine.satisfeet.me',
    auth: {
      username: options.username,
      password: options.password
    },
    agent: new https.Agent({
      maxSockets: 20,
      keepAlive: true,
      keepAliveMsecs: 3000
    }),
    headers: {
      accept: 'application/json'
    }
  });
}

Client.prototype.check = function* () {
  var res = yield this.request({
    method: 'GET'
  });

  return (res.statusCode / 100 | 0) === 2;
};

Client.prototype.find = function* (name, query) {
  if (!name) throw new Error('Requires "name".');

  var path = '/' + name;

  if (query) {
    path += '/?' + querystring.stringify(query);
  }

  return yield exec.call(this, path);
};

Client.prototype.findOne = function* (name, query) {
  if (!name) throw new Error('Requires "name".');
  if (!query) throw new Error('Requires "query".');
  if (!query.id) throw new Error('Requires "query.id".');

  var path = '/' + name + '/' + query.id;

  return yield exec.call(this, path);
};

Client.prototype.persist = function* (name, body) {
  if (!name) throw new Error('Requires "name".');
  if (!body) throw new Error('Requires "body".');

  var path = '/' + name;

  if (body.id) {
    path += '/' + body.id;
  }

  var method = (body.id) ? 'PUT' : 'POST';

  return yield exec.call(this, path, method, body);
};

Client.prototype.remove = function* (name, body) {
  if (!name) throw new Error('Requires "name".');
  if (!body) throw new Error('Requires "body".');
  if (!body.id) throw new Error('Requires "body.id".');

  var path = '/' + name + '/' + body.id;

  return yield exec.call(this, path, 'DELETE');
};

module.exports = Client;

function* exec(path, method, param) {
  if (method === 'PUT' || method === 'POST') {
    var body = JSON.stringify(param);
  }

  var res = yield this.request({
    path: path, method: method, body: body
  });

  switch (res.statusCode) {
    case 400: throw new errors.InvalidRequestError(res);
    case 401: throw new errors.AuthenticationError(res);
    case 404: throw new errors.NotFoundError(res);
    case 500: throw new errors.InternalServerError(res);
  }

  if (res.statusCode > 204) {
    throw new errors.UnknownError(res);
  }

  return res.body || null;
}
