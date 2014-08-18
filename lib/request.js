var http = require('http');

module.exports = function(defaults) {
  defaults = defaults || {};

  return function(options) {
    options = options || {};

    for (var key in defaults) {
      options[key] = defaults[key];
    }

    options.auth = options.auth.username + ':' + options.auth.password;

    var req = http.request(options);

    if (options.body) {
      req.setHeader('Content-Type', 'application/json');
      req.write(options.body);
    }

    return function(callback) {
      req.once('response', function(res) {
	res.text = '';

	if (res.statusCode === 200) {
	  res.on('readable', function() {
	    res.text += (res.read() || '').toString();
	  });
	  res.on('end', function() {
	    try {
	      res.body = JSON.parse(res.text);
	    } catch(err) {
	      callback(new Error('Invalid response body "' + res.body + '".'));
	    }

	    callback(null, res);
	  });
	} else {
	  callback(null, res);
	}
      });
      req.once('error', function(err) {
	callback(err);
      });
      req.end();
    }
  };
};
