// Builds the static site in public/ from the design-canvas sources in src/.
//   src/Main.dc.html   -> public/index.html   (viewer: catalog, dictionary, lineage, import/export)
//   src/Editor.dc.html -> public/editor.html  (diagram editor; reuses the viewer's YAML/zip code as MHCore)
// Usage: node scripts/build.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function parts(file) {
  const src = fs.readFileSync(path.join(root, 'src', file), 'utf8');
  const xdc = src.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1];
  const out = {
    title: (src.match(/<title>([\s\S]*?)<\/title>/) || [, 'Metadata Hub'])[1],
    lang: (src.match(/<html[^>]*lang="([^"]+)"/) || [, 'en'])[1],
    helmet: (xdc.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1].trim(),
    template: xdc.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim(),
    code: src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1]
  };
  if (/<\/script/i.test(out.template)) throw new Error(file + ': template must not contain </script>');
  return out;
}

function page(p, preScripts) {
  return `<!doctype html>
<html lang="${p.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
${p.helmet}
</head>
<body>
<div id="app"></div>
<script type="text/x-template" id="dc-template">
${p.template}
</script>
<script src="vendor/react.production.min.js"></script>
<script src="vendor/react-dom.production.min.js"></script>
<script src="dc-runtime.js"></script>
<script>window.MH_STANDALONE = true;</script>
${preScripts || ''}<script>
${p.code}
mountDC(document.getElementById('dc-template').textContent, Component, document.getElementById('app'));
</script>
</body>
</html>
`;
}

const main = parts('Main.dc.html');
fs.writeFileSync(path.join(root, 'public/index.html'), page(main));

const editor = parts('Editor.dc.html');
// The editor borrows the viewer's YAML parser/writer, zip reader/writer and project loader.
const core = `<script>
(function () {
${main.code}
window.MHCore = Component;
})();
</script>
`;
fs.writeFileSync(path.join(root, 'public/editor.html'), page(editor, core));

// samples the editor can load directly
fs.mkdirSync(path.join(root, 'public/samples'), { recursive: true });
for (const f of ['airflow-bigquery-sample.zip', 'metadata-hub-sample.zip', 'openlineage-sample.json']) {
  const from = path.join(root, 'samples', f);
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(root, 'public/samples', f));
}
console.log('Built public/index.html, public/editor.html and public/samples/');
