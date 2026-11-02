npx esbuild static/css/app.css     --bundle     --minify     --external:/static/* --outfile=static/dist/app.min.css
npx esbuild static/js/app.js     --bundle   --drop:console --drop:debugger --legal-comments=none --charset=utf8 --target=es2020  --minify   --outfile=static/dist/app.min.js
