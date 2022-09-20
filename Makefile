build:
	elm make src/Voronoi.elm --output=site/main.js

serve:
	cd site/ && python3 -m http.server

watch:
	rg -telm -thtml -l '' | entr -s 'make build && make serve'

build-release:
	elm make src/Voronoi.elm --output=site/main.js --optimize

deploy: build-release
	scp -r site/* bakdor:/var/www/puzzleys
