var co     = require('co');
var chai   = require('chai');
var https  = require('https');
var conure = require('../../lib');

const URL = 'https://engine.satisfeet.me';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('createClient(options)', function() {

  it('should not throw an error', function() {
    chai.expect(function() {
      conure.createClient({
        username: 'foo',
        password: 'bar'
      });
    });
  });

  it('should throw error on missing "options"', function() {
    chai.expect(function() {
      conure.createClient();
    }).to.throwError;
  });

  it('should throw error on missing "username"', function() {
    chai.expect(function() {
      conure.createClient({ password: 'bar' });
    }).to.throwError;
  });

  it('should throw error on missing "password"', function() {
    chai.expect(function() {
      conure.createClient({ username: 'foo' });
    }).to.throwError;
  });

  describe('Class: Client', function() {

    describe('#check()', function() {

      it('should return true', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          return yield client.check();
        })(function(err, result) {
          if (err) throw err;

          chai.expect(result)
            .to.be.a('boolean')
            .to.be.true;

          done();
        });
      });

      it('should return false', function(done) {
        var client = conure.createClient({
          username: 'foo',
          password: 'bar'
        });

        co(function* () {
          return yield client.check();
        })(function(err, result) {
          if (err) throw err;

          chai.expect(result)
            .to.be.a('boolean')
            .to.be.false;

          done();
        });
      });

    });

    describe('#find(name[, query])', function() {

      it('should return array', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          return yield client.find('customers');
        })(function(err, result) {
          if (err) throw err;

          chai.expect(result)
            .to.be.an('array');

          done();
        });
      });

      it('should return empty array', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          return yield client.find('customers', {
            search: 'blablabalbalbalba'
          });
        })(function(err, result) {
          if (err) throw err;

          chai.expect(result)
            .to.be.an('array')
            .to.be.empty;

          done();
        });
      });

      it('should throw error on missing "name"', function() {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

	chai.expect(function() {
          client.find();
	}).to.throwError;
      });

      it('should throw error on invalid credentials', function(done) {
	var client = conure.createClient({
	  username: 'foo',
	  password: 'bar'
	});

	co(function* () {
	  yield client.findOne('customers', {
	    id: 123
	  });
	})(function(err) {
	  chai.expect(err)
	    .to.be.an.instanceOf(Error)
	    .to.have.property('name')
	    .to.contain('Authentication');

	  done();
	});
      });

    });

    describe('#findOne(name, query)', function() {

      before(create);

      it('should return customer', co(function* () {
	var client = conure.createClient({
	  username: USERNAME,
	  password: PASSWORD
	});

	var result = yield client.findOne('customers', {
	  id: this.customer.id
	});

	chai.expect(result)
	  .to.be.an('object')
	  .to.eql(this.customer);
      }));

      it('should throw error on missing "name"', function() {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

	chai.expect(function() {
	  client.findOne();
	}).to.throwError;
      });

      it('should throw error on missing "query"', function() {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        chai.expect(function() {
          client.findOne('customers');
	}).to.throwError;
      });

      it('should throw not found error', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function*() {
	  yield client.findOne('customers', { id: '1234' });
        })(function(err) {
          if (err instanceof conure.NotFoundError) return done();

          throw err;
        });
      });


      it('should throw error on invalid credentials', function(done) {
	var client = conure.createClient({
	  username: 'foo',
	  password: 'bar'
	});

	co(function* () {
	  yield client.findOne('customers', { id: 123 });
	})(function(err) {
          if (err instanceof conure.AuthenticationError) return done();

          throw err;
	});
      });

      after(destroy);

    });

    describe('#persist(name, body)', function() {

      it('should return object', co(function* () {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

	var result = yield client.persist('customers', {
	  name: 'Soap MacTavish',
	  email: 'soap@mwarfare.com',
	  address: {
	    city: 'Edinburg'
	  }
	});

	chai.expect(result)
	  .to.be.an('object')
	  .to.have.property('id');

	this.customer = result;
      }));

      it('should return customer', co(function* () {
	var client = conure.createClient({
	  username: USERNAME,
	  password: PASSWORD
	});

	this.customer.name += ' Junior';

	yield client.persist('customers', this.customer);
      }));

      it('should throw error on missing "name"', function() {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

	chai.expect(function() {
	  client.persist();
	}).to.throwError;
      });

      it('should throw error on missing "body"', function() {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        chai.expect(function() {
          client.persist('customers');
	}).to.throwError;
      });

      after(destroy);

    });

    describe('#remove(name, body)', function() {

      before(create);

      it('should remove entity', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        var self = this;
        co(function*() {
          yield client.remove('customers', self.customer);

          var result = yield client.findOne('customers', {
            id: self.customer.id
          });
        })(function(err) {
          if (err instanceof conure.NotFoundError) return done();

          throw err;
        });
      });

      it('should throw error on missing "name"', function() {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

	chai.expect(function() {
	  client.remove();
	}).to.throwError;
      });

      it('should throw error on missing "body"', function() {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        chai.expect(function() {
          client.remove('customers');
	}).to.throwError;
      });

      after(destroy);

    });

  });

});

function create(done) {
  var self = this;

  var req = https.request({
    auth: USERNAME + ':' + PASSWORD,
    host: 'engine.satisfeet.me',
    path: '/customers',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  req.once('response', function(res) {
    if (res.statusCode !== 200) {
      throw new Error('Response is "' + res.statusMessage + '".');
    }

    var body = '';
    res.once('readable', function() {
      body += (res.read() || '').toString();
    });
    res.once('end', function() {
      self.customer = JSON.parse(body);

      done();
    });
  });
  req.once('error', function(err) {
    done(err);
  });
  req.end(JSON.stringify({
    name: 'Pierce Brosnan',
    email: 'pierce@broccoli.com',
    address: {
      city: 'London'
    }
  }));
}

function destroy(done) {
  var self = this;

  https.request({
    auth: USERNAME + ':' + PASSWORD,
    host: 'engine.satisfeet.me',
    path: '/customers/' + self.customer.id,
    method: 'DELETE'
  }).end(done);
}
