/* Minimal standalone runtime for the .dc.html template format:
   {{holes}}, <sc-for>, <sc-if>, and a `class Component extends DCLogic` with renderVals(). */
(function () {
  var h = React.createElement, Fragment = React.Fragment;
  var VOID = { input: 1, meta: 1, link: 1, br: 1, img: 1, hr: 1, source: 1, col: 1 };
  var ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  function decode(s) {
    return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (m, e) {
      if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m;
    });
  }
  function parse(src) {
    var root = { tag: '#root', children: [] }, stack = [root], m;
    var re = /<!--[\s\S]*?-->|<\/([A-Za-z][\w:-]*)\s*>|<([A-Za-z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>|([^<]+)/g;
    while ((m = re.exec(src))) {
      if (m[0].slice(0, 4) === '<!--') continue;
      var top = stack[stack.length - 1];
      if (m[1]) {
        for (var i = stack.length - 1; i > 0; i--) { if (stack[i].tag === m[1]) { stack.length = i; break; } }
      } else if (m[2]) {
        var attrs = {};
        m[3].replace(/([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g, function (a, k, v1, v2) { attrs[k] = decode(v1 !== undefined ? v1 : v2 !== undefined ? v2 : ''); return a; });
        var n = { tag: m[2], attrs: attrs, children: [] };
        top.children.push(n);
        if (!VOID[m[2].toLowerCase()] && !m[4]) stack.push(n);
      } else if (m[5]) {
        if (/^\s*$/.test(m[5]) && /\n/.test(m[5])) continue;
        top.children.push({ text: decode(m[5]) });
      }
    }
    return root.children;
  }
  function look(p, scope) {
    p = p.trim();
    if (p === 'true') return true; if (p === 'false') return false; if (p === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(p)) return Number(p);
    if (/^'.*'$|^".*"$/.test(p)) return p.slice(1, -1);
    return p.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope);
  }
  function val(s, scope) {
    var whole = s.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/);
    if (whole) return look(whole[1], scope);
    if (s.indexOf('{{') < 0) return s;
    return s.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (a, p) { var v = look(p, scope); return v == null ? '' : String(v); });
  }
  function styleObj(s) {
    var o = {};
    s.split(';').forEach(function (decl) {
      var i = decl.indexOf(':'); if (i < 0) return;
      var k = decl.slice(0, i).trim(), v = decl.slice(i + 1).trim(); if (!k) return;
      if (k.slice(0, 2) !== '--') k = k.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, function (a, c) { return c.toUpperCase(); });
      o[k] = v;
    });
    return o;
  }
  function kids(n, scope) { var out = []; n.children.forEach(function (c, i) { out.push(el(c, scope, i)); }); return out; }
  function el(n, scope, key) {
    if (n.text !== undefined) return val(n.text, scope);
    if (n.tag === 'sc-for') {
      var list = val(n.attrs.list || '', scope) || [], as = n.attrs.as || 'item';
      return h(Fragment, { key: key }, list.map(function (it, i) { var s = Object.create(scope); s[as] = it; s.$index = i; return h(Fragment, { key: i }, kids(n, s)); }));
    }
    if (n.tag === 'sc-if') return val(n.attrs.value || '', scope) ? h(Fragment, { key: key }, kids(n, scope)) : null;
    var p = { key: key };
    Object.keys(n.attrs).forEach(function (k) {
      if (k.slice(0, 5) === 'hint-') return;
      var v = val(n.attrs[k], scope), name = k;
      if (k === 'class') name = 'className'; else if (k === 'for') name = 'htmlFor';
      else if (k === 'readonly') name = 'readOnly'; else if (k === 'autocomplete') name = 'autoComplete';
      if (name === 'style' && typeof v === 'string') v = styleObj(v);
      if (name === 'value' && v == null) v = '';
      if (/^on[A-Z]/.test(name) && typeof v !== 'function') return;
      p[name] = v;
    });
    if (VOID[n.tag.toLowerCase()]) return h(n.tag, p);
    return h.apply(null, [n.tag, p].concat(kids(n, scope)));
  }
  var tree = null;
  window.DCLogic = class extends React.Component {
    render() { return h(Fragment, null, kids({ children: tree }, this.renderVals())); }
  };
  window.mountDC = function (templateText, Component, mountNode) {
    tree = parse(templateText);
    ReactDOM.createRoot(mountNode).render(h(Component, {}));
  };
})();
