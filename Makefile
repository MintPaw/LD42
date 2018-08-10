all:
	$(MAKE) b
	$(MAKE) r

b:
	-mkdir bin
	cmd /c "call buildSystem/packSheets.bat"
	$(MAKE) buildSounds
	cp buildSystem/phaser.d.ts src
	tsc src/*.ts --outdir bin
	cp buildSystem/phaser.js bin
	cp buildSystem/index.html bin

r:
	cmd /c "call buildSystem/run.bat"

buildSounds:
	# cd bin/assets; \
	# 	audiosprite --path audio.json --output audio ../../sourceAssets/audio/*
	-mkdir bin/assets/audio
	cp sourceAssets/audio/* bin/assets/audio

ship:
	cd /d/mintpaw.github.io; \
		git reset --hard; \
		git pull;
	
	cp -r bin/* /d/mintpaw.github.io/LD42
	
	cd /d/mintpaw.github.io; \
		git add .; \
		git commit -m "LD42 up"; \
		git push; \
