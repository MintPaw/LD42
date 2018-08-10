all:
	$(MAKE) b
	$(MAKE) r

b:
	cmd /c "call buildSystem/packSheets.bat"
	$(MAKE) buildSounds
	cmd /c "call buildSystem/build.bat"

r:
	cmd /c "call buildSystem/run.bat"

buildSounds:
	# cd bin/assets; \
	# 	audiosprite --path audio.json --output audio ../../sourceAssets/audio/*
	mkdir bin/assets/audio
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
