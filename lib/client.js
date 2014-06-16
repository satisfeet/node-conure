var https  = require('https');
var errors = require('./errors');

const HOST = 'engine.satisfeet.me';

function Client(options) {
  options = options || {};

  if (!options.username) throw new Error('Client requires "username".');
  if (!options.username) throw new Error('Client requires "password".');

  this.auth = options.username + ':' + options.password;

  this.agent = new https.Agent({
    "keepAlive": true,
    "keepAliveMsecs": 3000,
    "maxSockets": 20
  });
}

Client.prototype.find = function* (name, query) {
  var path = '/' + name;

  var res = yield request.call(this, 'GET', path, query);

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode !== 200) throw new errors.UnknownError(res);

  return res.body;
};

Client.prototype.findOne = function* (name, query) {
  var path = '/' + name + '/' + query.id;

  delete query.id;

  var res = yield request.call(this, 'GET', path, query);

  if (res.statusCode === 404) return null;
  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode !== 200) throw new errors.UnknownError(res);

  return res.body;
};

Client.prototype.persist = function* (name, body) {
  var path = '/' + name + '/' + query.id;
  var method = (body && body.id) ? 'PUT' : 'POST';

  var res = yield request.call(this, method, path, body);

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 404) throw new errors.NotFoundError(res);
  if (res.statusCode !== 201) throw new errors.UnknownError(res);
};

Client.prototype.remove = function* (name, body) {
  var path = '/' + name + '/' + query.id;

  var res = yield request.call(this, 'DELETE', path);

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode === 404) throw new errors.NotFoundError(res);
  if (res.statusCode !== 201) throw new errors.UnknownError(res);
};

module.exports = Client;

function request(method, path, param) {
  if (method === 'GET') {
    var query = param;
  } else {
    var body = param;
  }

  var req = https.request({
    host: HOST,
    path: path,
    query: query,
    method: method,
    auth: this.auth,
    agent: this.agent
  });

  return function(callback) {
    req.once('response', function(res) {
      var body = '';

      res.on('readable', function() {
        body += (res.read() || '').toString();
      });
      res.on('end', function() {
        try {
          res.body = JSON.parse(body || '{}');
          res.text = body;
        } catch(err) {
          throw new Error('Failed parsing ' + body + ' as JSON.');
        }

        callback(null, res);
      });
    });
    req.once('error', function(err) {
      callback(err);
    });

    if (body) {
      req.end(JSON.stringify(body));
    } else {
      req.end();
    }
  }
}
