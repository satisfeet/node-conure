var co     = require('co');
var chai   = require('chai');
var cogent = require('cogent');
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

      it('should throw error on missing "name"', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          yield client.find();
        })(function(err) {
          chai.expect(err).to.be.an.instanceOf(Error);

          done();
        });
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

      it('should not throw error', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          return yield client.findOne('customers', {
	    id: '1234'
	  });
        })(function(err, body) {
          chai.expect(err).to.not.exist;
	  chai.expect(body).to.be.null;

          done();
        });
      });

      it('should throw error on missing "name"', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          yield client.findOne();
        })(function(err) {
          chai.expect(err).to.be.an.instanceOf(Error);

          done();
        });
      });

      it('should throw error on missing "query"', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          yield client.findOne('customers');
        })(function(err) {
          chai.expect(err).to.be.an.instanceOf(Error);

          done();
        });
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

    describe('#persist(name, body)', function() {

    });

    describe('#remove(name, body)', function() {

    });

  });

});
