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

  if (res.statusCode === 401) throw new errors.AuthenticationError(res);
  if (res.statusCode !== 200) throw new errors.UnknownError(res);

  return res.body;
};

module.exports = Client;

function request(method, path, query) {
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
    req.end();
  }
}
