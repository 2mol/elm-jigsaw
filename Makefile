build:
	elm make src/Voronoi.elm --output=site/main.js

deps:
	curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
	mv tailwindcss-macos-arm64 tailwindcss
	chmod +x tailwindcss

serve:
	cd site/ && python3 -m http.server

watch:
	rg -telm -thtml -l '' | entr make build

watch-css:
	./tailwindcss -i input.css -o site/tailwind.css --watch

build-release:
	elm make src/Voronoi.elm --output=site/main.js --optimize

deploy: build-release
	./tailwindcss -i input.css -o site/tailwind.css --minify
	scp -r site/* bakdor:/var/www/puzzleys
