npx electron-packager . Visualiser --dir dist --platform=win32 --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin
npx electron-packager . Visualiser --dir dist --platform=linux --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin

cd bin

zip -r Visualiser-linux-x64.zip Visualiser-linux-x64
zip -r Visualiser-win32-x64.zip Visualiser-win32-x64
