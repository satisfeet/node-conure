# Conure

![Golden Conure](http://bit.ly/U2RBgE)

**Conure** is the node REST API client for [satisfeet](https://satisfeet.me).

    var conure = require('conure');

    var client = conure.createClient({
      username: 'the-username-you-will-not-get',
      password: 'the-password-you-will-not-get'
    });

    var results = yield client.find('customers', {
      filter: { name: 'Bodo' }
    });

    console.log(results);

## Documentation

**Conure** extends nodes `https` module, tunes it for improved OpenSSL
performance and wraps the requests in some trendy methods.

### createClient(options)

Creates an instance of `conure.Client`. The object `options` requires:

* `username`
* `password`

for authentication.

### Class: Client

The `Client` prototype creates HTTPS requests for us. The main reason
for this whole lib is that we need a customized `https.Agent` to get
response times to an acceptable level as well as having the option to
implement a cache layer on top.

#### client.check()

    yield client.check();

Returns `true` if request succeeds.

#### client.find(name[, query])

    yield client.find('customers', { search: 'Bodo' });

Returns an array of customers matching the provided `query`. `query`
supports:

* `search`, pseudo full-text-search.
* `filter`, e.g. `{ filter: { name: 'Bodo Kaiser' } }`.
* `limit`, amount of items to return.

`client.find` will throw an error if authentication fails our we have a
status code different from `200`.

#### client.findOne(name, query)

    yield client.findOne('customers', { id: '123' });

Returns a customer object with the given `query.id`.

#### client.persist(name, body)

		// creates a new customer
		var result = yield client.persist('customers', {
			name: 'Bodo Kaiser',
			email: 'i@bodokaiser.io',
			address: {
				city: 'Berlin'
			}
		});

		result.email = 'info@satisfeet.me';
		result.company = 'satisfeet';

		// updates customer
		yield client.persist('customers', result);

Creates or updates a model. Depends on id provided.

#### client.remove(name, body)

		// lets take the result from above
		yield client.remove('customers', result);

Destroys a model (by id).

## License

Copyright © 2014 Bodo Kaiser <i@bodokaiser.io>
