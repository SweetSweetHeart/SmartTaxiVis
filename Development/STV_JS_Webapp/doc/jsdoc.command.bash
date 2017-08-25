cd doc && rm -r out && jsdoc -c jsdoc.conf.json -t ../../../node_modules/ink-docstrap/template/ -R ../../../README.md  && cd ..

cd .\Development\STV_JS_Webapp\doc
jsdoc -c jsdoc.conf.json -t %AppData%/npm/node_modules/ink-docstrap/template -R ../../../README.md