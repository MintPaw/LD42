all:
	$(MAKE) b
	$(MAKE) r

b:
	cmd /c "call buildSystem/packSheets.bat"
	cmd /c "call buildSystem/build.bat"

r:
	cmd /c "call buildSystem/run.bat"

ship:
	cd /d/mintpaw.github.io; \
		git reset --hard; \
		git pull;
	
	cp -r bin/* /d/mintpaw.github.io/LD42
	
	cd /d/mintpaw.github.io; \
		git add .; \
		git commit -m "LD42 up"; \
		git push; \
