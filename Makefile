build:
	elm make src/Voronoi.elm --output=main.js

watch:
	rg -telm -l '' | entr make build
