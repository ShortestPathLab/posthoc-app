#!/bin/bash

rm -rf dist

# Build

npx --yes vite build

# Copy files

mkdir -p dist/content
cp -r content dist
cp -r adapter.config.yaml dist

# Make executables

npx --yes pkg \
    --out-path dist \
    --compress GZip \
    --target node18-windows,node18-linux \
    dist/main.js

# Compress executables

gzexe dist/main-linux
rm dist/main-linux~

# Add metadata to Windows executable

npx --yes resedit-cli \
    --in dist/main-win.exe \
    --out dist/main-win.exe \
    --icon "1,icon.ico" \
    --product-name "Visualiser" \
    --product-version "0.1.0.0" \
    --file-version "0.1.0.0" \
    --file-description "Visualiser Adapter Server"

# Sign Windows executable

if which osslsigncode >/dev/null; then
    if ! test -f "private/cert.p12"; then
        mkdir -p private
        openssl req -x509 \
            -newkey rsa:2048 \
            -keyout private/key.pem \
            -out private/cert.pem \
            -nodes
        openssl pkcs12 -export \
            -out private/cert.p12 \
            -inkey private/key.pem \
            -in private/cert.pem
    fi
    osslsigncode sign -pkcs12 private/cert.p12 \
        -n "Visualiser Adapter Server" \
        -i "https://github.com/path-visualiser" \
        -in dist/main-win.exe \
        -out dist/main-win-signed.exe
    rm dist/main-win.exe
    mv dist/main-win-signed.exe dist/main-win.exe
fi

rm dist/main.js

mv dist/main-win.exe dist/adapter-win.exe
mv dist/main-linux dist/adapter-linux
