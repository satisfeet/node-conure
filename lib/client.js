var https = require('https');

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
      maxSockets: 50,
      keepAlive: true,
      keepAliveMsecs: 3000
    }),
    headers: {
      accept: 'application/json'
    }
  });
}

Client.prototype.find = function* (name, query) {
  if (!name) throw new Error('Requires "name".');

  var res = yield this.request({
    path: '/' + name,
    query: query
  });

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 500) throw new errors.InternalServerError(res);
  if (res.statusCode !== 200) throw new errors.UnknownError(res);

  return res.body;
};

Client.prototype.findOne = function* (name, query) {
  if (!name) throw new Error('Requires "name".');
  if (!query) throw new Error('Requires "query".');
  if (!query.id) throw new Error('Requires "query.id".');

  var res = yield this.request({
    path: '/' + name + '/' + query.id
  });

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 404) return null;
  if (res.statusCode === 500) throw new errors.InternalServerError(res);
  if (res.statusCode !== 200) throw new errors.UnknownError(res);

  return res.body;
};

Client.prototype.persist = function* (name, body) {
  if (!name) throw new Error('Requires "name".');
  if (!body) throw new Error('Requires "body".');

  var res = yield this.request({
    path: '/' + name + ((body.id) ? '/' + body.id : ''),
    method: ((body.id) ? 'PUT' : 'POST'),
    body: body
  });

  if (res.statusCode === 400) throw new errors.InvalidRequestError(res);
  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 404) throw new errors.NotFoundError(res);
  if (res.statusCode === 500) throw new errors.InternalServerError(res);

  return res.body || null;
};

Client.prototype.remove = function* (name, body) {
  if (!name) throw new Error('Requires "name".');
  if (!body) throw new Error('Requires "body".');
  if (!body.id) throw new Error('Requires "body.id".');

  var res = yield this.request({
    path: '/' + name + '/' + body.id,
    method: 'DELETE'
  });

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 404) throw new errors.NotFoundError(res);
  if (res.statusCode === 500) throw new errors.InternalServerError(res);
  if (res.statusCode !== 204) throw new errors.UnknownError(res);
};

module.exports = Client;
