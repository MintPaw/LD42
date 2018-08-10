rd /s /q bin\assets
mkdir bin\assets

cd sourceAssets
set packer="..\buildSystem\SpriteSheetPacker\SpriteSheetPacker.exe"
%packer% --powerOf2 --format pixijs sprites ../bin/assets
REM %packer% --powerOf2 --format pixijs minimap ../bin/assets
REM %packer% --powerOf2 --format pixijs ui ../bin/assets
REM %packer% --powerOf2 --format pixijs particles ../bin/assets
REM %packer% --powerOf2 --format pixijs tiles ../bin/assets

REM magick montage -mode concatenate -channel rgba -background transparent -tile 8x tiles/* tilesheet.png
REM copy tilesheet.png ..\bin\assets

REM xcopy /s /y /i maps ..\bin\assets\maps

cd ..
exit /b 0
