cd doc && rm -r out && cp layout.tmpl $HOME/.npm-packages/lib/node_modules/ink-docstrap/template/tmpl/ && jsdoc -c jsdoc.conf.json -t $HOME/.npm-packages/lib/node_modules/ink-docstrap/template/ -R ../../../README.md && cp ../../../swansea-university-logo.png out && cp ../../../swansea-university-logo-white.png out && cp ../../../college-of-science-logo.png out &&cd ..

cd doc && rm -r out && jsdoc -c jsdoc.conf.json -t ../../../node_modules/ink-docstrap/template/ -R ../../../README.md  && cd ..


jsdoc -c jsdoc.conf.json -t %AppData%/npm/node_modules/ink-docstrap/template -R ../../../README.md