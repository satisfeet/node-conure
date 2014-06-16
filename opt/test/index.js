var co     = require('co');
var chai   = require('chai');
var conure = require('../../lib');

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

      it('should throw error', function(done) {
        var client = conure.createClient({
          username: 'foo',
          password: 'bar'
        });

        co(function* () {
          yield client.find('customers');
        })(function(err) {
          chai.expect(err).to.be.an.instanceOf(Error);

          done();
        });
      });

      it('should return array', function(done) {
        var client = conure.createClient({
          username: USERNAME,
          password: PASSWORD
        });

        co(function* () {
          return yield client.find('customers');
        })(function(err, result) {
          chai.expect(err)
            .to.not.exist;

          chai.expect(result)
            .to.be.an('array');

          done();
        });
      });

    });

    describe('#findOne(name, query)', function() {

      it('should throw error', function(done) {
        var client = conure.createClient({
          username: 'foo',
          password: 'bar'
        });

        co(function* () {
          yield client.findOne('customers', { id: '1234' });
        })(function(err) {
          chai.expect(err).to.be.an.instanceOf(Error);

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
