PATH := node_modules/.bin:$(PATH)

.PHONY: ts clean

all: ts html

ts:
	tsc

html:
	n-copy --source src/html --destination dist/html **/*.html **/*.css

clean:
	n-clean dist
