npx electron-packager . Posthoc --dir dist --platform=win32 --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin
npx electron-packager . Posthoc --dir dist --platform=linux --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin
npx electron-packager . Posthoc --dir dist --platform=darwin --arch=arm64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin
npx electron-packager . Posthoc --dir dist --platform=darwin --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --overwrite --icon ./dist/favicon --out bin

mkdir -p ./bin/Posthoc-darwin-x64/resources/app
mkdir -p ./bin/Posthoc-darwin-arm64/resources/app
cp -r ./dist ./bin/Posthoc-darwin-x64/resources/app
cp -r ./dist ./bin/Posthoc-darwin-arm64/resources/app

cd bin

zip -r Posthoc-linux-x64.zip Posthoc-linux-x64
zip -r Posthoc-win32-x64.zip Posthoc-win32-x64
zip -r Posthoc-darwin-arm64.zip Posthoc-darwin-arm64
zip -r Posthoc-darwin-x64.zip Posthoc-darwin-x64
