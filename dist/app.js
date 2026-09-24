/* بانک پرامپت: پیدا کن، پر کن، کپی کن، ذخیره کن. همه‌ی داده‌ها فقط روی همین دستگاه. */
(function () {
  'use strict';
  var E = window.BankEngine;
  var main = document.getElementById('main');
  var B = null, byId = {};

  // ---------- ابزار ----------
  function h(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function has(o, k) { return o && Object.prototype.hasOwnProperty.call(o, k); }
  var fa = E.toFa;
  var toastT;
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 1900); }

  var I = {
    grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    bookmark: '<path d="M7 3h10v18l-5-3.5L7 21z"/>',
    diamond: '<path d="M12 3l8 7-8 11-8-11z"/><path d="M4 10h16"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 014.8.9c0 1.7-2.4 2.2-2.4 3.8M12 17.2v.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    chat: '<path d="M4 5h16v11H10l-6 4z"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.8 2.6 14.2 0 17M12 3.5c-2.6 2.8-2.6 14.2 0 17"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3.5 3.5 0 000-7H9a3.5 3.5 0 010-7h6.5"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 006.5 23H20v-5"/>',
    bot: '<rect x="4" y="8" width="16" height="11" rx="3.5"/><path d="M12 4v4M9 13v.5M15 13v.5M9.5 16.5h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
    save: '<path d="M7 3h10v18l-5-3.5L7 21z"/>',
    out: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    back: '<path d="M9 5l7 7-7 7"/>',
    fwd: '<path d="M15 5l-7 7 7 7"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    markdown: '<path d="M4 6h16M4 12h16M4 18h11"/>',
    text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    shield: '<path d="M12 3l8 4v6c0 5-4 8-8 9-4-1-8-4-8-9V7l8-4z"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>'; }

  // ---------- ذخیره‌سازی ----------
  var KEY = 'pb.v2';
  var S = { profile: {}, vals: {}, saved: [], theme: 'auto', fmt: 'text' };
  var storageOk = true;
  try { var raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) { storageOk = false; }
  var currentFmt = S.fmt || 'text';
  var saveT;
  function persist() {
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { if (storageOk) toast('ذخیره روی این مرورگر ممکن نیست'); storageOk = false; }
    }, 150);
  }
  function applyTheme() {
    if (S.theme === 'light' || S.theme === 'dark') document.documentElement.setAttribute('data-theme', S.theme);
    else document.documentElement.removeAttribute('data-theme');
  }

  // ---------- مقدار فیلدها و ساختن پرامپت ----------
  function defaultOf(f) {
    if (f.default != null) return (f.type === 'multi' || f.type === 'repeat') ? [].concat(f.default) : String(f.default);
    return (f.type === 'multi' || f.type === 'repeat') ? [] : '';
  }
  function own(c) { return S.vals[c.id] || {}; }
  function fromBrand(c, f) { return f.profile && !has(own(c), f.key) && !E.isEmpty(S.profile[f.profile]); }
  function value(c, f) {
    var o = own(c);
    if (has(o, f.key)) return o[f.key];
    if (f.profile && !E.isEmpty(S.profile[f.profile])) return S.profile[f.profile];
    return defaultOf(f);
  }
  function optLabel(f, v) { var o = (f.options || []).filter(function (x) { return x.value === v; })[0]; return o ? o.label : v; }
  function build(c, markHoles) {
    var vals = {}, labels = {}, missing = [];
    c.fields.forEach(function (f) {
      var v = value(c, f);
      if ((f.type === 'repeat' || f.type === 'multi') && !Array.isArray(v)) v = E.isEmpty(v) ? [] : [v];
      if (f.type === 'number' && c.lang_out !== 'en' && !E.isEmpty(v)) v = fa(v);
      if (f.required && E.isEmpty(v)) { missing.push(f.label); if (markHoles) v = '\u0001' + f.label + '\u0002'; }
      vals[f.key] = v;
      if (f.type === 'select') labels[f.key] = optLabel(f, v);
      if (f.type === 'multi') labels[f.key] = v.map(function (x) { return optLabel(f, x); });
    });
    var text = '', gloss = '';
    try { text = E.render(c.template, vals, labels, { lang: c.lang_out }); } catch (e) { text = ''; }
    if (c.gloss) { try { gloss = E.render(c.gloss, vals, labels, { lang: 'fa' }); } catch (e) { gloss = ''; } }
    return { text: text, gloss: gloss, missing: missing };
  }
  function linesHtml(t) {
    return t.split('\n').map(function (l) {
      var s = h(l).replace(/\u0001([^\u0002]*)\u0002/g, '<span class="hole">[$1]</span>');
      s = s.replace(/(&lt;\/?[\w:-]+(?:\s+[^&gt;]*)?&gt;)/g, '<span class="xml-tag">$1</span>');
      s = s.replace(/^(#{1,6}\s+[^<]+)/g, '<span class="md-heading">$1</span>');
      s = s.replace(/(\*\*[^*]+\*\*)/g, '<span class="md-bold">$1</span>');
      return '<div class="ln" dir="auto">' + (s || '&nbsp;') + '</div>';
    }).join('');
  }

  // جعبه‌ی متن هم‌قد محتوایش بزرگ می‌شود
  function autosize(root) { $$('textarea', root).forEach(function (t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }); }

  // ---------- کپی ----------
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta); return ok;
    }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    return Promise.resolve(fallback());
  }

  // ---------- جست‌وجو ----------
  var syn = {};
  function indexCards() {
    B.synonyms.forEach(function (g) { var n = g.map(E.normalize); n.forEach(function (w) { syn[w] = n; }); });
    B.cards.forEach(function (c) {
      var cat = catOf(c);
      c._t = E.normalize(c.title);
      c._s = E.normalize([c.desc, c.tags.join(' '), cat ? cat.title : ''].join(' '));
      c._b = E.normalize(c.template.replace(/\{\{[^}]*\}\}/g, ' ')).slice(0, 1500);
    });
  }
  function catOf(c) { return B.categories.filter(function (x) { return x.id === c.category; })[0]; }
  function score(c, toks) {
    var total = 0;
    for (var i = 0; i < toks.length; i++) {
      var alts = syn[toks[i]] || [toks[i]], best = 0;
      alts.forEach(function (a) {
        if (c._t.indexOf(a) >= 0) best = Math.max(best, 10);
        else if (c._s.indexOf(a) >= 0) best = Math.max(best, 4);
        else if (a.length > 2 && c._b.indexOf(a) >= 0) best = Math.max(best, 1);
      });
      if (!best) return 0;
      total += best;
    }
    return total;
  }

  // ---------- ناوبری ----------
  var NAV = [['', 'پرامپت‌ها', 'grid'], ['saved', 'ذخیره‌ها', 'bookmark'], ['brand', 'برند من', 'diamond'], ['guide', 'راهنما', 'help']];
  function navHtml(cur) {
    return NAV.map(function (n) {
      var badge = n[0] === 'saved' && S.saved.length ? ' (' + fa(S.saved.length) + ')' : '';
      return '<a href="#/' + n[0] + '"' + (n[0] === cur ? ' aria-current="page"' : '') + '>' + ic(n[2]) + '<span>' + n[1] + badge + '</span></a>';
    }).join('');
  }
  function parse() {
    var raw = (location.hash || '#/').slice(1);
    var parts = raw.split('?');
    var segs = parts[0].split('/').filter(Boolean);
    var q = {};
    (parts[1] || '').split('&').forEach(function (p) { if (p) { var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); } });
    return { view: segs[0] || '', id: segs[1] || '', q: q };
  }
  function renderNav() {
    var r = parse(), k = r.view === 'p' ? '' : r.view;
    $('#tabs').innerHTML = navHtml(k);
    $('#dock').innerHTML = navHtml(k);
  }
  var lastView = null;
  function render() {
    var r = parse();
    renderNav();
    ({ '': viewHome, p: viewPrompt, saved: viewSaved, brand: viewBrand, guide: viewGuide }[r.view] || viewHome)(r);
    var key = r.view + '/' + r.id;
    if (key !== lastView) window.scrollTo(0, 0);
    lastView = key;
  }
  window.addEventListener('hashchange', render);

  // ---------- صفحه‌ی اصلی ----------
  var home = { q: '', cat: '', priv: '' };
  function tile(c) {
    var tool = B.tools.tools[c.tool];
    var tags = '';
    var cat = catOf(c);
    if (cat) tags += '<span class="tag cat-tag">' + h(cat.title) + '</span>';
    if (tool && tool.first.length) tags += '<span class="tag">' + h(tool.label) + '</span>';
    if (c.type === 'addon') tags += '<span class="tag addon">افزودنی</span>';
    if (c.privacy === 'red') tags += '<span class="tag red">' + ic('shield') + 'حساس</span>';
    else if (c.privacy === 'yellow') tags += '<span class="tag amber">' + ic('shield') + 'کسب‌وکار</span>';
    else tags += '<span class="tag green">' + ic('shield') + 'سبز</span>';
    if (c.fields.some(function (f) { return f.profile; })) tags += '<span class="tag gold">با برند من</span>';
    return '<a class="tile" href="#/p/' + c.id + '">' +
      '<div class="tile-top"><h3>' + h(c.title) + '</h3><span class="tile-id">' + fa(c.id) + '</span></div>' +
      '<p>' + h(c.desc) + '</p>' +
      '<div class="meta">' + tags + '</div></a>';
  }
  function brandEmpty() { return !['role', 'audience', 'tone', 'voice_doc', 'brand_colors'].some(function (k) { return !E.isEmpty(S.profile[k]); }); }
  function viewHome(r) {
    document.title = 'بانک پرامپت';
    if (r.q.q !== undefined) home.q = r.q.q;
    var total = B.cards.length;
    var html = '<section class="hero"><div class="eyebrow">' + fa(total) + ' پرامپت آماده · خصوصی روی همین دستگاه</div>' +
      '<h1>پرامپت درست را پیدا کنید،<br><em>شخصی کنید و کپی کنید.</em></h1>' +
      '<p>فرم کوتاه هر پرامپت را پر کنید؛ متن نهایی همان لحظه در سه قالب آماده‌ی کپی است.</p></section>' +
      '<div class="search">' + ic('search') +
      '<input id="q" type="search" autocomplete="off" enterkeyhint="search" aria-label="جست‌وجوی پرامپت" placeholder="جست‌وجو: کپشن، اسلاید، ایمیل، نقد، ویدیو… (کلید /)" value="' + h(home.q) + '">' +
      '<button id="q-clear" class="search-clear" data-act="q-clear" aria-label="پاک کردن جست‌وجو" style="' + (home.q ? '' : 'display:none;') + '">' + ic('close') + '</button>' +
      '</div>' +
      '<div class="filter-bar">' +
      '<div class="pills" role="group" aria-label="دسته‌ها"><button class="pill" data-cat="" aria-pressed="' + (!home.cat) + '">همه‌ی دسته‌ها <span class="n">' + fa(total) + '</span></button>' +
      B.categories.map(function (c) {
        var n = B.cards.filter(function (x) { return x.category === c.id; }).length;
        return '<button class="pill" data-cat="' + c.id + '" aria-pressed="' + (home.cat === c.id) + '">' + ic(c.icon) + h(c.title) + ' <span class="n">' + fa(n) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="pills priv-pills" role="group" aria-label="فیلتر سطح داده">' +
      '<span class="priv-label">' + ic('shield') + 'سطح داده:</span>' +
      '<button class="pill small' + (!home.priv ? ' active-pill' : '') + '" data-priv="" aria-pressed="' + (!home.priv) + '">همه</button>' +
      '<button class="pill small green' + (home.priv === 'green' ? ' active-pill' : '') + '" data-priv="green" aria-pressed="' + (home.priv === 'green') + '">سبز (عمومی)</button>' +
      '<button class="pill small amber' + (home.priv === 'yellow' ? ' active-pill' : '') + '" data-priv="yellow" aria-pressed="' + (home.priv === 'yellow') + '">زرد (کسب‌وکار)</button>' +
      '<button class="pill small red' + (home.priv === 'red' ? ' active-pill' : '') + '" data-priv="red" aria-pressed="' + (home.priv === 'red') + '">قرمز (حساس)</button>' +
      '</div></div>';

    if (brandEmpty()) {
      html += '<a class="callout" href="#/brand"><span class="ico">' + ic('diamond') + '</span><span><b>برند من را یک بار پر کنید</b><span>مخاطب، لحن و رنگ‌هایتان خودکار در پرامپت‌ها می‌نشیند.</span></span><span class="go">' + ic('fwd') + '</span></a>';
    }
    html += '<div id="results"></div>';
    main.innerHTML = html;
    results();
  }
  function results() {
    var box = $('#results');
    if (!box) return;
    var toks = E.normalize(home.q).split(' ').filter(Boolean);
    var list = B.cards.filter(function (c) {
      if (home.cat && c.category !== home.cat) return false;
      if (home.priv && c.privacy !== home.priv) return false;
      return true;
    });
    var html = '';
    if (toks.length) {
      var found = list.map(function (c) { return { c: c, s: score(c, toks) }; }).filter(function (x) { return x.s; })
        .sort(function (a, b) { return b.s - a.s; });
      html = found.length
        ? '<div class="section-head"><h2>نتیجه‌های جست‌وجو</h2><span class="n">' + fa(found.length) + ' پرامپت</span></div><div class="grid">' + found.map(function (x) { return tile(x.c); }).join('') + '</div>'
        : '<div class="empty">' + ic('search') + '<div>پرامپتی با این عبارت پیدا نشد. واژه‌ی کوتاه‌تر یا هم‌معنی دیگری را جست‌وجو کنید.</div></div>';
    } else {
      var matchedCount = 0;
      B.categories.forEach(function (cat) {
        if (home.cat && home.cat !== cat.id) return;
        var cs = list.filter(function (c) { return c.category === cat.id; });
        if (!cs.length) return;
        matchedCount += cs.length;
        html += '<div class="section-head"><span class="ico">' + ic(cat.icon) + '</span><h2>' + h(cat.title) + '</h2><span class="n">' + fa(cs.length) + '</span></div>' +
          '<div class="grid">' + cs.map(tile).join('') + '</div>';
      });
      if (!matchedCount) {
        html = '<div class="empty">' + ic('search') + '<div>پرامپتی با فیلترهای انتخابی پیدا نشد. فیلترها را ریست کنید.</div></div>';
      }
    }
    box.innerHTML = html;
  }

  // ---------- صفحه‌ی پرامپت ----------
  function fieldHtml(c, f) {
    var v = value(c, f), id = 'f_' + f.key;
    var auto = fromBrand(c, f) ? '<span class="auto">از برند من</span>' : '';
    var req = f.required ? '<span class="req" aria-label="ضروری">*</span>' : '';
    var help = f.help ? '<div class="help">' + h(f.help) + '</div>' : '';
    var ph = f.example ? ' placeholder="' + h('مثلاً ' + f.example) + '"' : '';
    if (f.type === 'select') {
      return '<div class="field"><label for="' + id + '">' + h(f.label) + req + '</label>' + help + '<select id="' + id + '" data-k="' + f.key + '">' +
        (f.default == null ? '<option value="">انتخاب کنید</option>' : '') +
        f.options.map(function (o) { return '<option value="' + h(o.value) + '"' + (o.value === v ? ' selected' : '') + '>' + h(o.label) + '</option>'; }).join('') + '</select></div>';
    }
    if (f.type === 'multi') {
      var arr = Array.isArray(v) ? v : [];
      return '<div class="field"><span class="lbl">' + h(f.label) + req + '</span>' + help + '<div class="checks">' + f.options.map(function (o, i) {
        return '<label class="check"><input type="checkbox" data-k="' + f.key + '" data-i="' + i + '"' + (arr.indexOf(o.value) >= 0 ? ' checked' : '') + '><span>' + h(o.label) + '</span></label>';
      }).join('') + '</div></div>';
    }
    if (f.type === 'repeat') {
      var items = Array.isArray(v) ? v : (E.isEmpty(v) ? [] : [v]);
      var n = Math.max(f.count || 3, items.length), out = '';
      for (var i = 0; i < n; i++) out += '<textarea data-k="' + f.key + '" data-r="' + i + '" aria-label="' + h(f.label + ' ' + fa(i + 1)) + '" placeholder="' + h((f.item_label || 'مورد') + ' ' + fa(i + 1)) + '">' + h(items[i] || '') + '</textarea>';
      return '<div class="field"><span class="lbl">' + h(f.label) + req + auto + '</span>' + help + '<div class="stack">' + out + '</div></div>';
    }
    var input = f.type === 'textarea'
      ? '<textarea id="' + id + '" data-k="' + f.key + '"' + ph + '>' + h(v) + '</textarea>'
      : '<input id="' + id + '" type="text"' + (f.type === 'number' ? ' inputmode="decimal"' : '') + ' data-k="' + f.key + '" value="' + h(v) + '"' + ph + '>';
    return '<div class="field"><label for="' + id + '">' + h(f.label) + req + auto + '</label>' + help + input + '</div>';
  }
  function exampleOf(c) {
    var ps = Object.keys(c.examples || {});
    if (!ps.length && c.fields.some(function (f) { return f.profile; })) ps = ['reza'];
    return ps[0] || null;
  }
  function viewPrompt(r) {
    var c = byId[r.id];
    if (!c) { location.hash = '#/'; return; }
    document.title = c.title + ' · بانک پرامپت';
    var tool = B.tools.tools[c.tool];
    var app = tool && tool.first.length ? B.tools.apps[tool.first[0]] : null;
    var tags = '<span class="tag cat-tag">' + h(catOf(c).title) + '</span>';
    if (tool && tool.first.length) tags += '<span class="tag">' + h(tool.label) + '</span>';
    if (c.privacy === 'red') tags += '<span class="tag red">' + ic('shield') + 'حساس: فقط متن ناشناس‌شده، در چت موقت</span>';
    else if (c.privacy === 'yellow') tags += '<span class="tag amber">' + ic('shield') + 'داده‌ی کسب‌وکار: فقط حداقل لازم، نه در Arena</span>';
    else tags += '<span class="tag green">' + ic('shield') + 'داده‌ی عمومی (سبز)</span>';

    var html = '<a class="back" href="#/">' + ic('back') + 'همه‌ی پرامپت‌ها</a>' +
      '<div class="phead"><div class="phead-title"><h1>' + h(c.title) + '</h1><span class="phead-id">' + fa(c.id) + '</span></div>' +
      '<p>' + h(c.desc) + '</p><div class="tags">' + tags + '</div></div><div class="split">';

    if (c.fields.length) {
      var ex = exampleOf(c);
      html += '<section class="panel"><div class="panel-head"><h2>متغیرها و فرم پرامپت</h2><div>' +
        (ex ? '<button class="link-btn" data-act="example">پر کردن با نمونه</button>' : '') +
        '<button class="link-btn muted" data-act="clear">پاک کردن فرم</button></div></div>' +
        c.fields.map(function (f) { return fieldHtml(c, f); }).join('') + '</section>';
    }

    html += '<section class="pv"><div class="paper">' +
      '<div class="paper-head">' +
      '  <div class="format-tabs" role="tablist" aria-label="قالب پرامپت">' +
      '    <button class="format-tab' + (currentFmt === 'text' ? ' active' : '') + '" data-act="preview-fmt" data-fmt="text" role="tab" aria-selected="' + (currentFmt === 'text') + '">' + ic('text') + 'متن پرامپت</button>' +
      '    <button class="format-tab' + (currentFmt === 'markdown' ? ' active' : '') + '" data-act="preview-fmt" data-fmt="markdown" role="tab" aria-selected="' + (currentFmt === 'markdown') + '">' + ic('markdown') + 'مارکداون (Markdown)</button>' +
      '    <button class="format-tab' + (currentFmt === 'xml' ? ' active' : '') + '" data-act="preview-fmt" data-fmt="xml" role="tab" aria-selected="' + (currentFmt === 'xml') + '">' + ic('code') + 'ساختاریافته (XML)</button>' +
      '  </div>' +
      '  <span class="paper-meta"><span id="wc" class="wc-badge"></span></span>' +
      '</div>' +
      '<div class="prompt" id="pv"></div><div class="missing" id="miss"></div>' +
      (c.gloss ? '<details class="gloss"><summary>ترجمه برای خودتان</summary><div class="prompt" id="gl"></div></details>' : '') +
      '<div class="copy-section">' +
      '  <div class="copy-section-title">کپی پرامپت در سه قالب:</div>' +
      '  <div class="copy-grid">' +
      '    <button class="btn btn-gold copy-btn' + (currentFmt === 'text' ? ' btn-active-fmt' : '') + '" data-act="copy" data-fmt="text" title="کپی متن مستقیم پرامپت">' +
      '      <span class="btn-ic">' + ic('text') + '</span><span class="btn-txt">کپی متن پرامپت</span>' +
      '    </button>' +
      '    <button class="btn btn-glass copy-btn' + (currentFmt === 'markdown' ? ' btn-active-fmt' : '') + '" data-act="copy" data-fmt="markdown" title="کپی با تیترها و قالب مارکداون">' +
      '      <span class="btn-ic">' + ic('markdown') + '</span><span class="btn-txt">کپی با فرمت مارکداون</span>' +
      '    </button>' +
      '    <button class="btn btn-glass copy-btn' + (currentFmt === 'xml' ? ' btn-active-fmt' : '') + '" data-act="copy" data-fmt="xml" title="کپی با تگ‌های ساختاریافته XML">' +
      '      <span class="btn-ic">' + ic('code') + '</span><span class="btn-txt">کپی با فرمت XML</span>' +
      '    </button>' +
      '  </div>' +
      '</div>' +
      '<div class="actions secondary-actions">' +
      '  <button class="btn btn-glass small" data-act="save">' + ic('save') + '<span>ذخیره در این دستگاه</span></button>' +
      (c.link ? '  <a class="btn btn-glass small" href="' + h(c.link) + '" target="_blank" rel="noopener noreferrer">' + ic('out') + '<span>باز کردن Gem</span></a>' : '') +
      (app ? '  <a class="btn btn-glass small" href="' + h(app.url) + '" target="_blank" rel="noopener noreferrer">' + ic('out') + '<span>باز کردن ' + h(app.name) + '</span></a>' : '') +
      '</div>' +
      '</div></section></div>';

    main.innerHTML = html;
    autosize(main);
    refresh(c);
  }
  function refresh(c) {
    var p = build(c, true);
    var formattedDisplay = E.formatPrompt(p.text, c, currentFmt);
    $('#pv').innerHTML = linesHtml(formattedDisplay);
    var clean = build(c, false).text;
    var cleanFormatted = E.formatPrompt(clean, c, currentFmt);
    var wc = cleanFormatted.split(/\s+/).filter(Boolean).length;
    $('#wc').textContent = fa(wc) + ' واژه';
    $('#miss').textContent = p.missing.length ? 'هنوز خالی: ' + p.missing.join('، ') : '';
    if ($('#gl')) $('#gl').innerHTML = linesHtml(p.gloss);

    // به‌روزرسانی زبانه فعال پیش‌نمایش
    $$('.format-tab').forEach(function (tab) {
      var isActive = tab.getAttribute('data-fmt') === currentFmt;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // مشخص کردن دکمه متناظر فرمت در بخش کپی
    $$('.copy-btn').forEach(function (btn) {
      var isFmt = btn.getAttribute('data-fmt') === currentFmt;
      btn.classList.toggle('btn-active-fmt', isFmt);
    });
  }

  // ---------- ذخیره‌ها ----------
  function viewSaved() {
    document.title = 'ذخیره‌ها · بانک پرامپت';
    var total = S.saved.length;
    var html = '<section class="hero"><div class="eyebrow">روی همین دستگاه (' + fa(total) + ')</div><h1>پرامپت‌های ذخیره‌شده</h1><p>پرامپت‌های پرشده‌ای که برای دسترسی سریع ذخیره کرده‌اید.</p></section>';
    if (!S.saved.length) {
      html += '<div class="empty">' + ic('bookmark') + '<div>هنوز پرامپتی ذخیره نکرده‌اید. در هر پرامپت، دکمه‌ی «ذخیره در این دستگاه» را بزنید.</div></div>';
    } else {
      html += '<div class="list">' + S.saved.map(function (s, i) {
        var when = '';
        try { when = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(s.at)); } catch (e) { when = ''; }
        var card = byId[s.id];
        var catTitle = card && catOf(card) ? catOf(card).title : '';
        return '<article class="panel saved">' +
          '<div class="saved-head">' +
          '  <div><h3>' + h(s.title) + '</h3>' + (catTitle ? '<span class="tag small cat-tag">' + h(catTitle) + '</span>' : '') + '</div>' +
          '  <time>' + h(when) + '</time>' +
          '</div>' +
          '<pre dir="auto">' + h(s.text) + '</pre>' +
          '<div class="saved-copy-row">' +
          '  <span class="saved-copy-label">کپی سریع:</span>' +
          '  <button class="btn btn-gold small" data-act="scopy" data-fmt="text" data-i="' + i + '" title="کپی متن پرامپت">' + ic('text') + '<span>متن</span></button>' +
          '  <button class="btn btn-line small" data-act="scopy" data-fmt="markdown" data-i="' + i + '" title="کپی با فرمت مارکداون">' + ic('markdown') + '<span>مارکداون</span></button>' +
          '  <button class="btn btn-line small" data-act="scopy" data-fmt="xml" data-i="' + i + '" title="کپی با فرمت XML">' + ic('code') + '<span>XML</span></button>' +
          '  <div class="saved-actions-end">' +
          (card ? '    <button class="btn btn-line small" data-act="sopen" data-i="' + i + '">' + ic('edit') + '<span>ویرایش فرم</span></button>' : '') +
          '    <button class="btn btn-line small del-btn" data-act="sdel" data-i="' + i + '" aria-label="حذف">' + ic('trash') + '</button>' +
          '  </div>' +
          '</div></article>';
      }).join('') + '</div>';
    }
    main.innerHTML = html + footHtml();
  }
  function footHtml() {
    return '<div class="foot"><span>همه‌چیز فقط روی همین دستگاه ذخیره می‌شود؛ بدون سرور و کاملاً خصوصی.</span><div class="row">' +
      '<button class="link-btn" data-act="export">دریافت فایل پشتیبان</button>' +
      '<label class="link-btn">بازگرداندن پشتیبان<input type="file" accept=".json,application/json" data-act-file hidden></label>' +
      '<select data-theme aria-label="تنظیم ظاهر"><option value="auto"' + (S.theme === 'auto' ? ' selected' : '') + '>ظاهر: مثل دستگاه</option><option value="light"' + (S.theme === 'light' ? ' selected' : '') + '>حالت روشن</option><option value="dark"' + (S.theme === 'dark' ? ' selected' : '') + '>حالت تیره</option></select>' +
      '</div></div>';
  }

  // ---------- برند من ----------
  function composeBrand() {
    B.brand.sections.forEach(function (s) {
      if (!s.compose) return;
      var hasAny = s.fields.some(function (f) { return !E.isEmpty(S.profile[f.key]); });
      S.profile[s.compose] = hasAny ? E.render(s.template, Object.assign({}, S.profile), {}, {}) : '';
    });
  }
  function swatches(t) {
    var m = String(t || '').match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [];
    return m.map(function (c) { return '<span class="sw" data-c="' + c + '" title="' + c + '"></span>'; }).join('');
  }
  function brandField(f) {
    var v = S.profile[f.key];
    if (f.type === 'repeat') {
      var items = Array.isArray(v) ? v : [], out = '';
      for (var i = 0; i < (f.count || 3); i++) out += '<textarea data-b="' + f.key + '" data-r="' + i + '" aria-label="' + h(f.label + ' ' + fa(i + 1)) + '" placeholder="' + h('نمونه‌ی ' + fa(i + 1)) + '">' + h(items[i] || '') + '</textarea>';
      return '<div class="field"><span class="lbl">' + h(f.label) + '</span><div class="stack">' + out + '</div></div>';
    }
    var ph = f.example ? ' placeholder="' + h('مثلاً ' + f.example) + '"' : '';
    var input = f.type === 'textarea' ? '<textarea id="b_' + f.key + '" data-b="' + f.key + '"' + ph + '>' + h(v || '') + '</textarea>'
      : '<input id="b_' + f.key + '" type="text" data-b="' + f.key + '" value="' + h(v || '') + '"' + ph + '>';
    return '<div class="field"><label for="b_' + f.key + '">' + h(f.label) + '</label>' + input + '</div>';
  }
  function viewBrand() {
    document.title = 'برند من · بانک پرامپت';
    var filledCount = ['role', 'audience', 'tone', 'voice_doc', 'brand_colors'].filter(function (k) { return !E.isEmpty(S.profile[k]); }).length;
    var statusText = filledCount === 5 ? 'پروفایل برند شما کامل است ✓' : fa(filledCount) + ' از ۵ بخش اصلی پر شده است';

    var html = '<section class="hero"><div class="eyebrow">یک بار بنویسید · ' + statusText + '</div>' +
      '<h1>برند من</h1><p>هر چه اینجا بنویسید، در پرامپت‌های مرتبط به‌طور خودکار می‌نشیند و کار شما را سریع و یکدست می‌کند.</p>' +
      '<div class="personas">نمونه‌های آماده‌ی کارگاه: ' + Object.keys(B.personas).filter(function (k) { return k !== '_note'; }).map(function (k) {
        return '<button class="link-btn" data-act="persona" data-p="' + k + '">' + h(B.personas[k].name) + ' (' + h(B.personas[k].desc) + ')</button>';
      }).join('') + '</div></section>';

    B.brand.sections.forEach(function (s) {
      html += '<section class="panel bsec"><div class="panel-head"><h2>' + h(s.title) + '</h2>' +
        (s.helper ? '<a class="link-btn" href="#/p/' + s.helper + '">ساختن خودکار از نمونه‌های من</a>' : '') + '</div>' +
        '<p class="sub">' + h(s.sub) + '</p>' + s.fields.map(brandField).join('');
      if (s.id === 'brand') html += '<div class="swatches" id="sw"></div><div class="swatch-hint">برای کپی کردن کد هر رنگ، روی آن کلیک کنید.</div>';
      if (s.note) html += '<p class="note">' + h(s.note) + '</p>';
      if (s.compose) {
        html += '<div class="paper composed"><div class="paper-head"><b>' + h(s.title) + ' آماده</b><span>برای قرار دادن در دانش Gem، Project یا دستور سفارشی</span></div>' +
          '<div class="prompt" id="c_' + s.compose + '"></div>' +
          '<div class="copy-section">' +
          '  <div class="copy-grid">' +
          '    <button class="btn btn-gold small copy-btn" data-act="bcopy" data-k="' + s.compose + '" data-fmt="text">' + ic('text') + '<span class="btn-txt">کپی متن</span></button>' +
          '    <button class="btn btn-glass small copy-btn" data-act="bcopy" data-k="' + s.compose + '" data-fmt="markdown">' + ic('markdown') + '<span class="btn-txt">کپی مارکداون</span></button>' +
          '    <button class="btn btn-glass small copy-btn" data-act="bcopy" data-k="' + s.compose + '" data-fmt="xml">' + ic('code') + '<span class="btn-txt">کپی XML</span></button>' +
          '  </div>' +
          '</div></div>';
      }
      html += '</section>';
    });
    html += '<div class="row" style="margin-top:24px;"><button class="link-btn muted" data-act="wipe">پاک کردن همه‌ی داده‌های برند و فرم‌ها از این دستگاه</button></div>' + footHtml();
    main.innerHTML = html;
    autosize(main);
    refreshBrand();
  }
  function refreshBrand() {
    composeBrand();
    B.brand.sections.forEach(function (s) {
      if (!s.compose) return;
      var el = $('#c_' + s.compose);
      if (el) el.innerHTML = S.profile[s.compose] ? linesHtml(S.profile[s.compose]) : '<div class="ln">فیلدهای بالا را پر کنید تا متن منسجم در اینجا ساخته شود.</div>';
    });
    var sw = $('#sw');
    if (sw) {
      var colors = String(S.profile.brand_colors || '').match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [];
      sw.innerHTML = colors.map(function (c) {
        return '<button class="sw" data-act="swatch" data-c="' + c + '" style="background:' + c + '" title="کپی ' + c + '" aria-label="کپی رنگ ' + c + '"></button>';
      }).join('');
    }
  }

  // ---------- راهنما ----------
  var guideDemoFmt = 'text';
  function viewGuide() {
    document.title = 'راهنما · بانک پرامپت';
    var c = byId['06b-01'];
    var ex = c.examples.reza;
    var before = S.vals[c.id], beforeProfile = S.profile;
    S.vals[c.id] = ex;
    S.profile = JSON.parse(JSON.stringify(B.personas.reza.profile));
    composeBrand();
    var outRaw = build(c, false).text;
    S.profile = beforeProfile;
    if (before === undefined) delete S.vals[c.id]; else S.vals[c.id] = before;

    var outFormatted = E.formatPrompt(outRaw, c, guideDemoFmt);

    var kv = c.fields.filter(function (f) { return has(ex, f.key); }).map(function (f) {
      var v = ex[f.key]; if (f.type === 'select') v = optLabel(f, v); if (f.type === 'number') v = fa(v);
      return '<div><dt>' + h(f.label) + '</dt><dd>' + h(v) + '</dd></div>';
    }).join('');

    main.innerHTML = '<section class="hero"><div class="eyebrow">راهنمای کاربردی کارگاه</div>' +
      '<h1>در سه قدم ساده،<br><em>پرامپت حرفه‌ای و دقیق بسازید.</em></h1>' +
      '<p>لازم نیست پرامپت‌های طولانی و پیچیده حفظ کنید؛ ساختار آماده است و شما فقط متغیرها را پر می‌کنید.</p></section>' +
      '<div class="steps">' +
      '<div class="panel step"><div class="num">۱</div><h3>پیدا کنید</h3><p>با جست‌وجو یا از میان ۱۲ دسته، پرامپت متناسب با نیاز خودتان را انتخاب کنید.</p></div>' +
      '<div class="panel step"><div class="num">۲</div><h3>فرم را پر کنید</h3><p>چند فیلد کوتاه را پر کنید. خروجی در همان لحظه در سه قالب استاندارد آماده می‌شود.</p></div>' +
      '<div class="panel step"><div class="num">۳</div><h3>کپی و استفاده</h3><p>قالب دلخواه (متن، مارکداون یا XML) را با یک کلیک کپی کنید و در چت بچسبانید.</p></div></div>' +

      '<div class="section-head"><span class="ico">' + ic('spark') + '</span><h2>نمونه‌ی واقعی: کپشن اینستاگرام (کیس رضا)</h2></div>' +
      '<div class="demo"><div class="panel"><div class="panel-head"><h2>آنچه در فرم وارد شد</h2></div><dl class="kv">' + kv + '</dl>' +
      '<p class="note">سند لحن رضا از بخش «برند من» خودکار در پرامپت قرار گرفت.</p></div>' +

      '<div class="paper">' +
      '<div class="paper-head">' +
      '  <div class="format-tabs" role="tablist" aria-label="قالب نمونه">' +
      '    <button class="format-tab' + (guideDemoFmt === 'text' ? ' active' : '') + '" data-act="guide-fmt" data-fmt="text" role="tab">' + ic('text') + 'متن پرامپت</button>' +
      '    <button class="format-tab' + (guideDemoFmt === 'markdown' ? ' active' : '') + '" data-act="guide-fmt" data-fmt="markdown" role="tab">' + ic('markdown') + 'مارکداون (Markdown)</button>' +
      '    <button class="format-tab' + (guideDemoFmt === 'xml' ? ' active' : '') + '" data-act="guide-fmt" data-fmt="xml" role="tab">' + ic('code') + 'ساختاریافته (XML)</button>' +
      '  </div>' +
      '  <span class="paper-meta"><span class="wc-badge">' + fa(outFormatted.split(/\s+/).filter(Boolean).length) + ' واژه</span></span>' +
      '</div>' +
      '<div class="prompt" id="guide_pv">' + linesHtml(outFormatted) + '</div>' +
      '<div class="actions" style="margin-top:16px;"><a class="btn btn-gold" href="#/p/06b-01">' + ic('pen') + 'خودتان این پرامپت را باز کنید</a></div></div></div>' +

      '<div class="section-head"><span class="ico">' + ic('code') + '</span><h2>راهنمای انتخاب قالب کپی</h2></div>' +
      '<div class="format-guide-grid">' +
      '  <div class="panel format-card">' +
      '    <div class="fc-head"><span class="ico">' + ic('text') + '</span><h3>متن پرامپت (ساده)</h3></div>' +
      '    <p><b>کی استفاده کنیم؟</b> برای پیام‌های سریع، کپشن‌ها، استوری‌ها و کارهای روزمره (سطح ۱ و ۲ نردبان پرامپت). روی گوشی سریع‌ترین گزینه است.</p>' +
      '  </div>' +
      '  <div class="panel format-card">' +
      '    <div class="fc-head"><span class="ico">' + ic('markdown') + '</span><h3>فرمت مارکداون (Markdown)</h3></div>' +
      '    <p><b>کی استفاده کنیم؟</b> برای بریف‌های کاری، پروپوزال‌ها، متون چندبخشی و اسنادی که انسان و مدل هر دو باید آن را به‌صورت خوانا مرور کنند.</p>' +
      '  </div>' +
      '  <div class="panel format-card">' +
      '    <div class="fc-head"><span class="ico">' + ic('code') + '</span><h3>فرمت ساختاریافته (XML)</h3></div>' +
      '    <p><b>کی استفاده کنیم؟</b> برای داده‌های طولانی، تفکیک دقیق دستور از داده، ساخت Gem یا Project در Claude/Gemini تا مدل ورودی را با دستور اشتباه نگیرد.</p>' +
      '  </div>' +
      '</div>' +

      '<div class="tips">' +
      '<div class="panel tip">' + ic('diamond') + '<p><b>برند من</b> را یک بار بنویسید؛ مخاطب، لحن، سند لحن و رنگ‌هایتان در پرامپت‌های مرتبط به‌طور خودکار می‌نشیند و برچسب «از برند من» می‌گیرد.</p></div>' +
      '<div class="panel tip">' + ic('save') + '<p><b>ذخیره‌ها</b> متن شخصی‌سازی‌شده را روی حافظه‌ی همین دستگاه نگه می‌دارد تا دفعه‌های بعد فقط با یک لمس کپی یا ویرایش کنید.</p></div>' +
      '<div class="panel tip">' + ic('grid') + '<p><b>نصب روی گوشی:</b> از منوی مرورگر گوشی گزینه‌ی «افزودن به صفحه‌ی اصلی» (Add to Home Screen) را بزنید تا بانک بدون اینترنت و مثل یک اپلیکیشن سریع باز شود.</p></div>' +
      '<div class="panel tip">' + ic('shield') + '<p>پرامپت‌هایی که برچسب <b>حساس (قرمز)</b> دارند را فقط با متن ناشناس‌شده و در چت موقت استفاده کنید. هیچ داده‌ای از این برنامه به سرور ارسال نمی‌شود.</p></div>' +
      '</div>';
  }

  // ---------- رویدادها ----------
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act],[data-cat],[data-priv]');
    if (!el) return;

    if (el.hasAttribute('data-cat')) {
      home.cat = el.getAttribute('data-cat');
      $$('.pill[data-cat]').forEach(function (p) { p.setAttribute('aria-pressed', p.getAttribute('data-cat') === home.cat); });
      results();
      return;
    }

    if (el.hasAttribute('data-priv')) {
      home.priv = el.getAttribute('data-priv');
      $$('[data-priv]').forEach(function (p) { p.classList.toggle('active-pill', p.getAttribute('data-priv') === home.priv); });
      results();
      return;
    }

    var r = parse(), c = byId[r.id], act = el.getAttribute('data-act');

    if (act === 'q-clear') {
      home.q = '';
      var qi = $('#q');
      if (qi) { qi.value = ''; qi.focus(); }
      el.style.display = 'none';
      history.replaceState(null, '', '#/');
      results();
      return;
    }

    if (act === 'preview-fmt') {
      currentFmt = el.getAttribute('data-fmt') || 'text';
      S.fmt = currentFmt;
      persist();
      if (c) refresh(c);
      return;
    }

    if (act === 'guide-fmt') {
      guideDemoFmt = el.getAttribute('data-fmt') || 'text';
      viewGuide();
      return;
    }

    if (act === 'copy') {
      var fmt = el.getAttribute('data-fmt') || currentFmt || 'text';
      var p = build(c, false);
      var textToCopy = E.formatPrompt(p.text, c, fmt);
      var btnTxt = $('.btn-txt', el);
      var oldTxt = btnTxt ? btnTxt.textContent : '';

      copyText(textToCopy).then(function (ok) {
        if (!ok) {
          toast('کپی نشد؛ دسترسی کلیپ‌بورد تأیید نشد');
          return;
        }
        el.classList.add('copied');
        if (btnTxt) btnTxt.textContent = 'کپی شد ✓';
        setTimeout(function () {
          el.classList.remove('copied');
          if (btnTxt) btnTxt.textContent = oldTxt;
        }, 1500);

        var fmtName = fmt === 'xml' ? 'فرمت XML' : (fmt === 'markdown' ? 'فرمت مارکداون' : 'متن پرامپت');
        var msg = p.missing.length
          ? fmtName + ' کپی شد · ' + fa(p.missing.length) + ' فیلد ضروری هنوز خالی است'
          : fmtName + ' با موفقیت کپی شد';
        toast(msg);
      });
      return;
    }

    if (act === 'scopy') {
      var sIdx = +el.getAttribute('data-i');
      var sItem = S.saved[sIdx];
      var sFmt = el.getAttribute('data-fmt') || 'text';
      var sCard = byId[sItem.id];
      var sFormatted = E.formatPrompt(sItem.text, sCard, sFmt);

      copyText(sFormatted).then(function (ok) {
        var fmtName = sFmt === 'xml' ? 'فرمت XML' : (sFmt === 'markdown' ? 'فرمت مارکداون' : 'متن پرامپت');
        toast(ok ? fmtName + ' کپی شد' : 'کپی انجام نشد');
      });
      return;
    }

    if (act === 'swatch') {
      var cCode = el.getAttribute('data-c');
      copyText(cCode).then(function (ok) {
        toast(ok ? 'کد رنگ ' + cCode + ' کپی شد' : 'کپی نشد');
      });
      return;
    }

    if (act === 'bcopy') {
      var bKey = el.getAttribute('data-k');
      var bFmt = el.getAttribute('data-fmt') || 'text';
      var bVal = S.profile[bKey] || '';
      var bFormatted = E.formatPrompt(bVal, null, bFmt);
      copyText(bFormatted).then(function (ok) {
        var fmtName = bFmt === 'xml' ? 'XML' : (bFmt === 'markdown' ? 'مارکداون' : 'متن');
        toast(ok ? 'با فرمت ' + fmtName + ' کپی شد' : 'کپی نشد');
      });
      return;
    }

    if (act === 'save') {
      S.saved.unshift({ id: c.id, title: c.title, text: build(c, false).text, vals: JSON.parse(JSON.stringify(own(c))), at: Date.now() });
      persist(); renderNav(); toast('در پرامپت‌های ذخیره‌شده نگه داشته شد');
      return;
    }

    if (act === 'example') {
      var pk = exampleOf(c), per = B.personas[pk].profile, ex = c.examples[pk] || {}, v = {};
      c.fields.forEach(function (f) { if (has(ex, f.key)) v[f.key] = ex[f.key]; else if (f.profile && has(per, f.profile)) v[f.key] = f.profile === 'voice_doc' ? voiceOf(per) : per[f.profile]; });
      S.vals[c.id] = v; persist(); viewPrompt(r); toast('نمونه‌ی ' + B.personas[pk].name + ' پر شد');
      return;
    }

    if (act === 'clear') {
      var cleared = {}; c.fields.forEach(function (f) { cleared[f.key] = (f.type === 'multi' || f.type === 'repeat') ? [] : ''; });
      S.vals[c.id] = cleared; persist(); viewPrompt(r); toast('فیلدها پاک شدند');
      return;
    }

    if (act === 'sopen') {
      var s = S.saved[+el.getAttribute('data-i')]; S.vals[s.id] = s.vals; persist(); location.hash = '#/p/' + s.id;
      return;
    }

    if (act === 'sdel') {
      S.saved.splice(+el.getAttribute('data-i'), 1); persist(); renderNav(); viewSaved(); toast('پرامپت از ذخیره‌ها حذف شد');
      return;
    }

    if (act === 'persona') {
      var pp = el.getAttribute('data-p');
      if (!brandEmpty() && !confirm('«برند من» با نمونه‌ی ساختگی ' + B.personas[pp].name + ' جایگزین شود؟')) return;
      S.profile = JSON.parse(JSON.stringify(B.personas[pp].profile)); persist(); viewBrand(); toast('نمونه‌ی ' + B.personas[pp].name + ' پر شد');
      return;
    }

    if (act === 'wipe') {
      if (!confirm('همه‌ی داده‌های شخصی شما (برند من، فرم‌ها و ذخیره‌ها) از این مرورگر پاک شود؟')) return;
      S = { profile: {}, vals: {}, saved: [], theme: S.theme, fmt: 'text' }; persist(); render(); toast('داده‌ها با موفقیت پاک شدند');
      return;
    }

    if (act === 'export') {
      var blob = new Blob([JSON.stringify({ app: 'prompt-bank', v: 2, data: S }, null, 1)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'prompt-bank-backup.json';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
      return;
    }
  });

  function voiceOf(profile) {
    var s = B.brand.sections.filter(function (x) { return x.compose === 'voice_doc'; })[0];
    return E.render(s.template, profile, {}, {});
  }

  // کلیدهای میان‌بر کیبورد
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      var qi = $('#q');
      if (qi) { e.preventDefault(); qi.focus(); qi.select(); }
    } else if (e.key === 'Escape') {
      var qi = $('#q');
      if (qi && document.activeElement === qi && qi.value) {
        qi.value = ''; home.q = ''; results();
        var clr = $('#q-clear'); if (clr) clr.style.display = 'none';
      }
    }
  });

  document.addEventListener('input', onEdit);
  document.addEventListener('change', onEdit);
  function onEdit(e) {
    var el = e.target, r = parse();
    if (el.tagName === 'TEXTAREA') { el.style.height = 'auto'; el.style.height = (el.scrollHeight + 2) + 'px'; }
    if (el.id === 'q') {
      home.q = el.value;
      var clr = $('#q-clear');
      if (clr) clr.style.display = el.value ? 'flex' : 'none';
      history.replaceState(null, '', el.value ? '#/?q=' + encodeURIComponent(el.value) : '#/');
      results(); return;
    }
    if (el.hasAttribute('data-theme')) { S.theme = el.value; persist(); applyTheme(); return; }
    if (el.hasAttribute('data-act-file')) {
      if (e.type !== 'change' || !el.files[0]) return;
      var rd = new FileReader();
      rd.onload = function () {
        try { var d = JSON.parse(rd.result); if (d.app !== 'prompt-bank') throw 0; S = Object.assign({ profile: {}, vals: {}, saved: [], fmt: 'text' }, d.data); persist(); applyTheme(); render(); toast('پشتیبان با موفقیت بازگردانده شد'); }
        catch (x) { toast('این فایل، پشتیبان معتبر بانک پرامپت نیست'); }
      };
      rd.readAsText(el.files[0]); return;
    }
    if (el.hasAttribute('data-b')) {
      var bk = el.getAttribute('data-b');
      if (el.hasAttribute('data-r')) S.profile[bk] = $$('[data-b="' + bk + '"]').map(function (t) { return t.value; });
      else S.profile[bk] = el.value;
      persist(); refreshBrand(); return;
    }
    if (el.hasAttribute('data-k') && r.view === 'p') {
      var c = byId[r.id], k = el.getAttribute('data-k');
      var f = c.fields.filter(function (x) { return x.key === k; })[0];
      var o = S.vals[c.id] = S.vals[c.id] || {};
      if (f.type === 'multi') o[k] = $$('[data-k="' + k + '"]').filter(function (t) { return t.checked; }).map(function (t) { return f.options[+t.getAttribute('data-i')].value; });
      else if (f.type === 'repeat') o[k] = $$('[data-k="' + k + '"]').map(function (t) { return t.value; });
      else o[k] = el.value;
      persist(); refresh(c);
    }
  }

  // ---------- کارگر سرویس ----------
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        w.addEventListener('statechange', function () { if (w.state === 'installed' && navigator.serviceWorker.controller) w.postMessage('skipWaiting'); });
      });
    }).catch(function () {});
    var reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (!reloaded) { reloaded = true; location.reload(); } });
  }

  applyTheme();
  fetch('cards.json').then(function (r) { return r.json(); }).then(function (d) {
    B = d; B.cards.forEach(function (c) { byId[c.id] = c; }); indexCards(); render();
  }).catch(function () { main.innerHTML = '<div class="empty">بانک باز نشد. یک بار با اینترنت باز کنید.</div>'; });
})();
