PACKER="../buildSystem/SpriteSheetPacker/SpriteSheetPacker.exe"

all:
	$(MAKE) b
	$(MAKE) r

processAudio:
	# IFS=$$'\n'; \
	# for file in `find sourceAssets/audio/ -type f -name "*.wav"`; do \
	# 	echo "$$file"; \
	# 	ffmpeg -i "$$file" -loglevel error -qscale:a 2 "$${file%.*}.ogg" -y; \
	# 	echo "good"; \
	# done; \
	# wait;


b:
	-mkdir bin
	rm -rf bin/assets
	mkdir bin/assets
	-cd sourceAssets; \
		$(PACKER) --powerOf2 --format pixijs sprites ../bin/assets
	-mkdir bin/assets/audio
	cp -r sourceAssets/audio/ bin/assets
	find bin/assets/audio -type f -name "*.wav" -delete
	cp -r sourceAssets/maps bin/assets
	cp -r sourceAssets/fonts bin/assets
	cp sourceAssets/*.png bin/assets
	cp buildSystem/phaser.d.ts src
	
	tsc src/*.ts --outdir bin
	cp buildSystem/phaser.js bin
	cp buildSystem/index.html bin

r:
	cmd /c "call buildSystem/run.bat"

buildSounds:
	# cd bin/assets; \
	# 	audiosprite --path audio.json --output audio ../../sourceAssets/audio/*

ship:
	cd /d/mintpaw.github.io; \
		git reset --hard; \
		git pull;
	
	cp -r bin/* /d/mintpaw.github.io/LD42
	
	cd /d/mintpaw.github.io; \
		git add .; \
		git commit -m "LD42 up"; \
		git push; \
