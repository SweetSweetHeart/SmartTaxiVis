cd doc && rm -r out && cp layout.tmpl /Users/Henry/node_modules_global/lib/node_modules/ink-docstrap/template/tmpl/ && jsdoc -c jsdoc.conf.json -t $HOME/node_modules_global/lib/node_modules/ink-docstrap/template -R ../../../README.md && cd ..

jsdoc -c jsdoc.conf.json -t %AppData%/npm/node_modules/ink-docstrap/template -R ../../../README.md