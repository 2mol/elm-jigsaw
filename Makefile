build:
	elm make src/Voronoi.elm --output=site/main.js

watch:
	rg -telm -l '' | entr make build

build-release:
	elm make src/Voronoi.elm --output=site/main.js --optimize
