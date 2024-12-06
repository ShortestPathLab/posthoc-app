bunx electron-packager . Posthoc --dir dist --platform=win32 --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --ignore tsconfig.json --ignore vite.config.ts --ignore .eslintrc.json --ignore .unimportedrc.json --ignore package.sh --overwrite --icon ./dist/favicon --out bin
bunx electron-packager . Posthoc --dir dist --platform=linux --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --ignore tsconfig.json --ignore vite.config.ts --ignore .eslintrc.json --ignore .unimportedrc.json --ignore package.sh --overwrite --icon ./dist/favicon --out bin
bunx electron-packager . Posthoc --dir dist --platform=darwin --arch=arm64 --electronVersion=26.2.1 --ignore node_modules --ignore src --ignore tsconfig.json --ignore vite.config.ts --ignore .eslintrc.json --ignore .unimportedrc.json --ignore package.sh --overwrite --icon ./dist/favicon --out bin
bunx electron-packager . Posthoc --dir dist --platform=darwin --arch=x64 --electronVersion=26.2.1 --ignore node_modules --ignore src --ignore tsconfig.json --ignore vite.config.ts --ignore .eslintrc.json --ignore .unimportedrc.json --ignore package.sh --overwrite --icon ./dist/favicon --out bin

cd bin

zip -r Posthoc-linux-x64.zip Posthoc-linux-x64
zip -r Posthoc-win32-x64.zip Posthoc-win32-x64
zip -r Posthoc-darwin-arm64.zip Posthoc-darwin-arm64
zip -r Posthoc-darwin-x64.zip Posthoc-darwin-x64
