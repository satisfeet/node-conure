SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)

test: export NODE_ENV=test
test:
	@mocha \
	  --harmony \
	  --reporter spec \
	  opt/test

clean:
	@rm -rf components node_modules

.PHONY: test clean
