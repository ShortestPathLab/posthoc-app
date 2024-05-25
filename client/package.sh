npx electron-packager . Posthoc --dir dist --platform=win32 --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin
npx electron-packager . Posthoc --dir dist --platform=linux --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin
# npx electron-packager . Posthoc --dir dist --platform=darwin --arch=universal --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin

cd bin

zip -r Posthoc-linux-x64.zip Posthoc-linux-x64
zip -r Posthoc-win32-x64.zip Posthoc-win32-x64
# zip -r Posthoc-darwin-universal.zip Posthoc-darwin-universal
