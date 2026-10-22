// Builds public/index.html from src/Main.dc.html (the design-canvas source).
// Usage: node scripts/build.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/Main.dc.html'), 'utf8');

const title = (src.match(/<title>([\s\S]*?)<\/title>/) || [, 'Metadata Hub'])[1];
const lang = (src.match(/<html[^>]*lang="([^"]+)"/) || [, 'en'])[1];
const xdc = src.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1];
const helmet = (xdc.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1];
const template = xdc.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
const code = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];

if (/<\/script/i.test(template)) throw new Error('Template must not contain </script>');

const out = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${helmet.trim()}
</head>
<body>
<div id="app"></div>
<script type="text/x-template" id="dc-template">
${template}
</script>
<script src="vendor/react.production.min.js"></script>
<script src="vendor/react-dom.production.min.js"></script>
<script src="dc-runtime.js"></script>
<script>
${code}
mountDC(document.getElementById('dc-template').textContent, Component, document.getElementById('app'));
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'public/index.html'), out);
console.log('Built public/index.html (' + out.length + ' bytes)');
