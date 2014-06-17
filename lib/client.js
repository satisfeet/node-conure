var util   = require('util');
var https  = require('https');
var cogent = require('cogent');

var errors = require('./errors');

function Client(options) {
  var auth = options.username + ':' + options.password;

  this.request = cogent.extend({
    auth: auth,
    agent: new https.Agent({
      keepAlive: true,
      keepAliveMsccs: 3000,
      maxSockets: 20
    }),
    headers: {
      'Accept': 'application/json'
    }
  });
}

Client.prototype.find = function* (name, query) {
  if (!name) throw new Error('Requires "name".');

  var res = yield* this.request(url(name), {
    qs: query,
    json: true
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

  var res = yield* this.request(url(name, query), {
    json: true
  });

  if (res.statusCode === 404) return null;
  if (res.statusCode === 500) throw new errors.InternalServerError(res);
  if (res.statusCode !== 200) throw new errors.UnknownError(res);

  return res.body;
};

Client.prototype.persist = function* (name, body) {
  if (!name) throw new Error('Requires "name".');
  if (!body) throw new Error('Requires "body".');

  var res = yield* this.request(url(name, param), {
    body: body,
    method: (body.id) ? 'PUT' : 'POST'
  });

  if (res.statusCode === 400) throw new errors.InvalidRequestError(res);
  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 404) throw new errors.NotFoundError(res);
  if (res.statusCode === 500) throw new errors.InternalServerError(res);
  if (res.statusCode !== 201) throw new errors.UnknownError(res);
};

Client.prototype.remove = function* (name, body) {
  if (!name) throw new Error('Requires "name".');
  if (!body) throw new Error('Requires "body".');
  if (!body.id) throw new Error('Requires "body.id".');

  var res = yield* this.request(url(name, body), {
    method: 'DELETE'
  });

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 404) throw new errors.NotFoundError(res);
  if (res.statusCode === 500) throw new errors.InternalServerError(res);
  if (res.statusCode !== 201) throw new errors.UnknownError(res);
};

module.exports = Client;

function url(name, param) {
  if (!~['customers', 'products'].indexOf(name)) {
    throw new Error('Invalid resource: "' + name + '".');
  }

  var uri = 'https://engine.satisfeet.me/' + name;

  if (param && param.id) {
    uri += '/' + param.id;
  }

  return uri;
}
