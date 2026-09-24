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
  var S = { profile: {}, vals: {}, saved: [], theme: 'auto', fmt: 'text', activePersona: null, brandInject: true };
  var storageOk = true;
  try { var raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) { storageOk = false; }
  if (S.brandInject === undefined) S.brandInject = true;
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

  // ---------- حل هویت و لحن برند ----------
  function getActiveProfile() {
    if (S.activePersona && B && B.personas && B.personas[S.activePersona]) {
      return B.personas[S.activePersona].profile;
    }
    return S.profile || {};
  }
  function getActivePersonaName() {
    if (S.activePersona && B && B.personas && B.personas[S.activePersona]) {
      return B.personas[S.activePersona].name + ' (' + B.personas[S.activePersona].desc + ')';
    }
    return 'برند من';
  }
  function cardHasVoice(c) {
    if (!c) return false;
    return /\{\{\s*voice\b|<voice>/i.test(c.template);
  }
  function injectBrandToText(rawText, c, fmt) {
    if (!S.brandInject || cardHasVoice(c)) return rawText;
    var prof = getActiveProfile();
    var hasBrandInfo = Boolean(prof.business || prof.role || prof.audience || prof.tone || prof.voice_doc || prof.voice_avoid || prof.voice_use);
    if (!hasBrandInfo) return rawText;

    var business = prof.business ? String(prof.business).trim() : '';
    var role = prof.role ? String(prof.role).trim() : '';
    var aud = prof.audience ? String(prof.audience).trim() : '';
    var tone = prof.tone ? String(prof.tone).trim() : '';
    var avoid = prof.voice_avoid ? String(prof.voice_avoid).trim() : '';
    var use = prof.voice_use ? String(prof.voice_use).trim() : '';

    if (fmt === 'xml') {
      var brandXml = '  <brand_voice>\n';
      if (business) brandXml += '    <business>' + business + '</business>\n';
      if (role) brandXml += '    <role>' + role + '</role>\n';
      if (aud) brandXml += '    <audience>' + aud + '</audience>\n';
      if (tone) brandXml += '    <tone>' + tone + '</tone>\n';
      if (use) brandXml += '    <preferred_terms>' + use + '</preferred_terms>\n';
      if (avoid) brandXml += '    <avoid_terms>' + avoid + '</avoid_terms>\n';
      brandXml += '  </brand_voice>';

      if (/<\/prompt>\s*$/.test(rawText)) {
        return rawText.replace(/<\/prompt>\s*$/, '\n' + brandXml + '\n</prompt>');
      }
      return rawText + '\n\n' + brandXml;
    }

    if (fmt === 'markdown') {
      var brandMd = '### مشخصات و لحن برند من\n';
      if (business) brandMd += '- **حوزه و تخصص:** ' + business + '\n';
      if (role) brandMd += '- **نقش من:** ' + role + '\n';
      if (aud) brandMd += '- **مخاطب هدف:** ' + aud + '\n';
      if (tone) brandMd += '- **لحن کلام:** ' + tone + '\n';
      if (use) brandMd += '- **واژه‌های مورد استفاده:** ' + use + '\n';
      if (avoid) brandMd += '- **واژه‌های ممنوعه (خط‌قرمزها):** ' + avoid + '\n';
      return rawText.trim() + '\n\n' + brandMd.trim();
    }

    // text format
    var lines = ['', '[مشخصات و لحن برند من]:'];
    if (business) lines.push('حوزه و تخصص: ' + business);
    if (role) lines.push('نقش من: ' + role);
    if (aud) lines.push('مخاطب: ' + aud);
    if (tone) lines.push('لحن صحبت: ' + tone);
    if (use) lines.push('واژه‌های مورد استفاده: ' + use);
    if (avoid) lines.push('واژه‌های ممنوعه: ' + avoid);
    return rawText.trim() + '\n' + lines.join('\n');
  }

  // ---------- مقدار فیلدها و ساختن پرامپت ----------
  function defaultOf(f) {
    if (f.default != null) return (f.type === 'multi' || f.type === 'repeat') ? [].concat(f.default) : String(f.default);
    return (f.type === 'multi' || f.type === 'repeat') ? [] : '';
  }
  function own(c) { return S.vals[c.id] || {}; }
  function fromBrand(c, f) {
    var prof = getActiveProfile();
    return f.profile && !has(own(c), f.key) && !E.isEmpty(prof[f.profile]);
  }
  function value(c, f) {
    var o = own(c);
    if (has(o, f.key)) return o[f.key];
    var prof = getActiveProfile();
    if (f.profile && !E.isEmpty(prof[f.profile])) return prof[f.profile];
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
  function brandEmpty() { return !['role', 'audience', 'tone', 'business'].some(function (k) { return !E.isEmpty(S.profile[k]); }); }

  function viewHome(r) {
    document.title = 'بانک پرامپت';
    if (r.q.q !== undefined) home.q = r.q.q;
    if (r.q.cat !== undefined) home.cat = r.q.cat;
    var total = B.cards.length;
    var html = '<section class="hero"><div class="eyebrow">' + fa(total) + ' پرامپت آماده · خصوصی روی همین دستگاه</div>' +
      '<h1>بانک پرامپت‌های آماده و استاندارد</h1>' +
      '<p>پرامپت مورد نظرتان را پیدا کنید، فرم ساده‌اش را پر کنید یا از نمونه‌های واقعی استفاده کنید؛ متن نهایی در سه قالب آماده‌ی کپی است.</p></section>' +
      '<div class="search">' + ic('search') +
      '<input id="q" type="search" autocomplete="off" enterkeyhint="search" aria-label="جست‌وجوی پرامپت" placeholder="جست‌وجو: پادکست، ریلز، درمان، فروش، کپشن، اسلاید، ایمیل… (کلید /)" value="' + h(home.q) + '">' +
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
      html += '<a class="callout" href="#/brand"><span class="ico">' + ic('diamond') + '</span><span><b>برند من را یک بار تنظیم کنید</b><span>تخصص، مخاطب و لحن شما خودکار به پرامپت‌ها اضافه می‌شود.</span></span><span class="go">' + ic('fwd') + '</span></a>';
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

  // ---------- فرهنگ راهنمای کاربردی پرامپت‌ها ----------
  var CARD_GUIDES = {
    '03-01': {
      use: 'سریع‌ترین و چابک‌ترین پرامپت برای کارهای روزمره: بازنویسی پیام به مشتری، عذرخواهی محترمانه، پاسخ به دایرکت یا ویرایش ایمیل کاری، بدون اینکه هوش مصنوعی پرگویی کند.',
      output: 'یک پاسخ ۱ تا ۳ خطی کاملاً متمرکز، خوش‌لحن و بدون تعارفات اضافه، دقیقاً در قالبی که شما تعیین کرده‌اید.',
      tip: 'همیشه یک قید منفی بگذارید! مثلاً: «بدون وعده‌ی زمان مشخص» یا «بدون تعارفات طولانی»؛ قید منفی دست مدل را برای پرگویی می‌بندد.'
    },
    '03-02': {
      use: 'تبدیل متن‌های خشک و اداری به متنی گیرا و خواندنی، به طوری که مخاطب در همان سطر اول متوقف شود و تا پایان همراهی کند.',
      output: 'متن بازنویسی‌شده در دو بخش: قلاب اولیه برنده و بدنه‌ی روان و منسجم با لحن انتخابی شما.',
      tip: 'جملات طولانی را بشکنید و از مدل بخواهید کلمات ملموس و قابل‌تصور را جایگزین اصطلاحات انتزاعی کند.'
    },
    '03-03': {
      use: 'فشرده‌سازی متن‌های طولانی و مقالات در سه سطح مختلف برای مرور سریع در موبایل یا جلسات کاری.',
      output: 'خلاصه در سه لایه: یک جمله پیام اصلی، سه نکته‌ی محوری، و پاراگراف جمع‌بندی تصمیمات.',
      tip: 'اگر تصمیم‌گیری خاصی مد نظر است، در بخش هدف بنویسید تا تلخیص روی همان زاویه متمرکز شود.'
    },
    '03-04': {
      use: 'اصلاح متن‌های پیچیده، برطرف کردن ابهامات زبانی و روان‌سازی جملاتی که چندپهلو یا سخت‌خوان هستند.',
      output: 'نسخه‌ی پیراسته و شفاف بدون تغییر در معنای اصلی، همراه با فهرست خطاهای برطرف‌شده در صورت تمایل.',
      tip: 'از مدل بخواهید فعل‌های مجهول را به معلوم تبدیل کند تا فاعل هر کار کاملاً روشن باشد.'
    },
    '04-01': {
      use: 'وقتی می‌خواهید امضای کلامی و سبک قلم خود را استخراج کنید تا هوش مصنوعی همیشه متونی شبیه به خودتان بنویسد.',
      output: 'سند رسمی لحن برند شامل: لحن محوری، چرایی، واژه‌های پرکاربرد، واژه‌های ممنوعه، سقف کلمات و نمونه‌های اصیل.',
      tip: '۳ نمونه از واقعی‌ترین و موفق‌ترین پیام‌ها یا پست‌های قبلی خود را قرار دهید تا هویت کلامی دقیق استخراج شود.'
    },
    '03-05': {
      use: 'نگارش ایمیل‌های رسمی، نامه‌های اداری و مکاتبات حساس کاری که باید همزمان محترمانه، روشن و بدون چاپلوسی باشند.',
      output: 'یک ایمیل تمیز شامل: موضوع مشخص، سلام و شروع مستقیم، اصل درخواست در ۲ بند، و پایان‌بندی روشن با اقدام بعدی.',
      tip: 'از احوالپرسی‌های طولانی پرهیز کنید؛ مدیران و همکاران پیام‌هایی را که در ۳۰ ثانیه خوانده می‌شوند سریع‌تر پاسخ می‌دهند.'
    },
    '04-06': {
      use: 'تغییر لحن یک متن موجود (مثلاً از رسمی به خودمانی، یا از تند به همدلانه) بدون تغییر اطلاعات و واقعیت‌ها.',
      output: 'متن جدید با لحن بازآفرینی‌شده و یکنواخت، بدون هیچ‌گونه نشت لحن قبلی.',
      tip: 'تغییر لحن نباید حقیقت یا داده‌ها را دگرگون کند؛ مشخص کنید کدام واقعیت‌ها باید بدون دستکاری باقی بمانند.'
    },
    '04-07': {
      use: 'پاکسازی متن از خطاهای تایپی، تصحیح فاصله‌گذاری‌ها، نیم‌فاصله‌ها و نشانه‌گذاری طبق اصول نگارش فارسی.',
      output: 'متن ویراسته با نیم‌فاصله‌های استاندارد، تنوین و علائم نگارشی دقیق، آماده‌ی انتشار چاپی یا دیجیتال.',
      tip: 'به مدل تأکید کنید که ساختار جملات را دستکاری نکند و فقط پیرایش فنی و رسم‌الخطی انجام دهد.'
    },
    '06b-01': {
      use: 'نوشتن کپشن برای پست‌های اینستاگرام که هم زمان مکث مخاطب را بالا ببرد و هم به فروش، کامنت یا پیام دایرکت ختم شود.',
      output: '۳ نسخه کپشن کامل شامل: قلاب اول (هوک برای قبل از More)، بدنه‌ی کوتاه و ملموس، و دعوت به اقدام صریح (CTA).',
      tip: 'قلاب اول را هرگز با سلام شروع نکنید! مستقیم از مسأله، کنجکاوی یا یک حس مشترک آغاز کنید.'
    },
    '06b-02': {
      use: 'تبدیل یک ایده، آموزش یا تجربه به پست اسلایدی اینستاگرام و لینکدین که مخاطب را تا اسلاید آخر مشتاق نگه دارد.',
      output: 'متن تفکیک‌شده برای ۵ تا ۸ اسلاید: اسلاید ۱ (کاور پرکشش)، اسلایدهای میانی (یک نکته در هر اسلاید)، و اسلاید آخر (سیو و ارسال).',
      tip: 'در هر اسلاید فقط یک پیام بگذارید؛ شلوغ کردن اسلاید ورق زدن را متوقف می‌کند.'
    },
    '06b-03': {
      use: 'برنامه‌ریزی محتوای یک هفته با توزیع متوازن پست‌های آموزشی، اعتمادساز، تعاملی و پیشنهادات فروش.',
      output: 'جدول ۷ روزه با عنوان پست، قالب (ریلز، اسلاید، استوری)، پیام اصلی و اقدام مورد انتظار از مخاطب.',
      tip: 'بیش از یک‌سوم محتوای هفته نباید فروش مستقیم باشد؛ ابتدا ارزش بدهید تا پیشنهاد فروش پذیرفته شود.'
    },
    '06b-04': {
      use: 'سناریونویسی استوری‌های تعاملی ۲۴ ساعته برای گرم کردن مخاطب، نظرسنجی و سپس هدایت به محصول یا خدمت.',
      output: 'زنجیره ۴ تا ۶ استوری پیوسته: استوری اول (قلاب بصری)، استوری تعامل (استیکر/کوییز)، استوری ارزش، و استوری تبدیل به اقدام.',
      tip: 'در استوری اول لینک یا قیمت نگذارید؛ اول تعامل بگیرید تا استوری به افراد بیشتری نمایش داده شود.'
    },
    '06b-05': {
      use: 'پاسخ حرفه‌ای به مشتریان ناراضی، کامنت‌های انتقادی یا پیام‌های تند دایرکت، بدون باختن آرامش و با حفظ اعتبار برند.',
      output: 'پاسخ همدلانه در ۳ بخش: پذیرش حس مخاطب، توضیح شفاف بدون توجیه تراشی، و راهکار مشخص برای جبران یا پیگیری.',
      tip: 'با مشتری خشمگین یکی‌به‌دو نکنید؛ احساسش را معتبر بشمارید و ادامه گفتگو را به پیام خصوصی هدایت کنید.'
    },
    '06a-09': {
      use: 'ایده‌پردازی جملات افتتاحیه (قلاب‌ها) برای شروع ریلز، ویدیو یا متن‌های بازاریابی برای متوقف کردن انگشت مخاطب.',
      output: '۱۰ ایده قلاب در دسته‌های متنوع: قلاب سوالی، اعترافی، آماری، خلاف‌عادت و داستانی.',
      tip: 'بهترین قلاب‌ها باورهای غلط رایج را به چالش می‌کشند یا از یک اشتباه معمول پرده برمی‌دارند.'
    },
    '06a-01': {
      use: 'تدوین بریف شفاف و متمرکز برای کمپین فروش، رونمایی محصول جدید یا رویداد فصلی.',
      output: 'سند بریف کمپین شامل: پیام محوری، اهداف سنجش‌پذیر، پرسونای هدف، تقویم اجرایی و کانال‌های توزیع.',
      tip: 'پیام محوری کمپین فقط باید یک چیز باشد؛ اگر چند پیام را همزمان بگویید، مخاطب هیچ‌کدام را به خاطر نمی‌سپارد.'
    },
    '06a-04': {
      use: 'طراحی پیشنهادی که ارزش آن بسیار بالاتر از قیمت پرداختی باشد و مشتری دلیلی برای رد کردن آن پیدا نکند.',
      output: 'بسته پیشنهاد شامل: پیشنهاد اصلی، هدایای جانبی مرتبط، رفع ریسک با ضمانت، و دلیل واقعی برای محدودیت زمان.',
      tip: 'پیشنهاد رد‌نشدنی به معنی حراج یا تخفیف نیست؛ به معنی ترکیب هوشمندانه خدمات جانبی است که ارزش را چندبرابر می‌کنند.'
    },
    '06c-01': {
      use: 'نگارش ساختار و متن صفحه فرود (Landing Page) برای معرفی یک محصول، خدمت یا وبینار با هدف ثبت‌نام یا خرید.',
      output: 'متن کامل بخش‌های لندینگ: هیرو سکشن (تیتر + زیرتیتر + دکمه)، بخش درد و نیاز، معرفی راه‌حل، مزایا و اعتمادسازی.',
      tip: 'در بخش هیرو در کمتر از ۵ ثانیه باید مشخص شود: این چیست، برای چه کسی است، و چه دردی را دوا می‌کند.'
    },
    '06c-03': {
      use: 'نوشتن تیترهای متقاعدکننده و جذاب برای صفحات سایت، بنرهای تبلیغاتی و عنوان مقالات.',
      output: 'مجموعه‌ای از تیترهای آزمایش‌شده در سبک‌های مختلف: نتیجه‌محور، کنجکاوی‌ساز، شفاف و راهنمایی.',
      tip: 'تیتر باید وعده مشخصی بدهد؛ از تیترهای مبهم و شاعرانه برای صفحات فروش اجتناب کنید.'
    },
    '03-07': {
      use: 'نقد بی‌رحمانه و سنجش تاب‌آوری یک ایده، محصول یا برنامه کاری قبل از صرف وقت و هزینه، توسط یک منتقد سخت‌گیر.',
      output: 'گزارش ارزیابی موشکافانه شامل: ۵ ضعف پنهان، فرضیات اثبات‌نشده، ریسک‌های اجرایی و دلایلی که رقبا یا مشتریان شما را پس می‌زنند.',
      tip: 'به نقدها به چشم دشمن نگاه نکنید؛ هر ضعفی که اینجا پیدا شود، یک بحران واقعی در بازار را خنثی می‌کند.'
    },
    '03-08': {
      use: 'آزمایش متن تبلیغ، پیشنهاد قیمت یا صفحه محصول در برابر ذهنیت یک مخاطب شکاک، کم‌حوصله یا محافظه‌کار.',
      output: 'واکنش سطر‌به‌سطر از چشم مخاطب: کجا شک کرد؟ کجا خسته شد؟ و چه سؤالی برایش بی‌جواب ماند؟',
      tip: 'مخاطب را با جزییات توصیف کنید؛ مثلاً «مادری که نگران کیفیت محصول است و بودجه محدودی دارد».'
    },
    '03-11': {
      use: 'کشف فرضیات پنهانی که پایه‌های تصمیم شما هستند اما شاید در واقعیت درست نباشند.',
      output: 'فهرست پیش‌فرض‌های نادیده، سطح ریسک هر کدام، و یک آزمون سریع برای راستی‌آزمایی آن‌ها.',
      tip: 'بسیاری از شکست‌های کاری از پیش‌فرض‌هایی ناشی می‌شوند که هیچ‌وقت آزموده نشده‌اند.'
    },
    '05b-01': {
      use: 'تهیه چکیده مدیریتی از گزارش‌ها، فایل‌های متنی طولانی یا کتابچه‌ها برای تصمیم‌گیری در کمترین زمان.',
      output: 'خلاصه ساختاریافته در یک صفحه: نکات محوری، آمار و ارقام مستند، تصمیمات متخذه، و گام‌های بعدی.',
      tip: 'متن فایل را به پرامپت ضمیمه کنید و از مدل بخواهید فقط بر اساس فکت‌های درون متن بنویسد.'
    },
    '01-04': {
      use: 'استخراج الگوها، نقاط قوت، افت‌های غیرمنتظره و فرصت‌های سودآوری از جدول اکسل یا داده‌های آماری.',
      output: 'تحلیل آماری به زبان ساده، جدول مقایسه‌ای و ۳ پیشنهاد عملی برای رشد بر مبنای ارقام واقعی.',
      tip: 'ستون‌های داده را معرفی کنید و بازه زمانی اعداد را صریحاً بنویسید.'
    },
    '04-03': {
      use: 'طراحی دستورالعمل سیستم برای ساخت دستیار شخصی در Gemini (بخش Gems) یا ChatGPT (بخش Custom GPTs).',
      output: 'متن استاندارد پرامپت سیستمی شامل: تعریف نقش، وظایف مجاز، لحن، خط‌قرمزها و قالب‌های خروجی مورد انتظار.',
      tip: 'دستورالعمل سیستم را با سند لحن برند ترکیب کنید و در بخش Instructions دستیار قرار دهید.'
    },
    'G-01': {
      use: 'دستورالعمل ساخت یک دستیار اختصاصی در اکانت هوش مصنوعی که وظیفه‌اش نقد شفاف نوشته‌های شما بدون هیچ تعارفی است.',
      output: 'پرامپت سیستمی آماده برای وارد کردن در بخش ساخت Gem در گوگل جمینای.',
      tip: 'هر متنی را قبل از ارسال به کارفرما یا انتشار عمومی، یک بار به این Gem بدهید تا ایرادهایش را بگوید.'
    },
    '03-16': {
      use: 'تبدیل خواسته‌های خودمانی و پراکنده به یک پرامپت مهندسی‌شده، دقیق و اصولی برای رسیدن به بهترین جواب.',
      output: 'یک پرامپت استاندارد چندبخشی شامل زمینه، خواسته، قیدها و قالب خروجی.',
      tip: 'خواسته خود را با همان واژه‌های روزمره بنویسید؛ مدل جاهای خالی فنی را خودش تکمیل می‌کند.'
    },
    '02-01': {
      use: 'جمع‌بندی یک چت طولانی که حافظه کاری‌اش پر شده و مدل دچار کندی یا فراموشی شده است.',
      output: 'متن فشرده تحویل کار برای باز کردن چت نو و ادامه دادن بدون از دست رفتن دستاوردها.',
      tip: 'این خلاصه را کپی کنید و در چت جدید بچسبانید تا با سرعت و دقت روز اول کار را ادامه دهید.'
    }
  };

  var CATEGORY_HEURISTICS = {
    write: {
      use: 'برای نوشتن، بازنویسی و پیراستن متن‌های کاری و شخصی تا بیانی روان، جذاب و استاندارد پیدا کنند.',
      output: 'متن بازنویسی‌شده یا تدوین‌شده متناسب با چارچوب، طول و لحن درخواستی شما.',
      tip: 'واژه‌های غیرضروری را حذف کنید و به مدل بگویید منظور را با کوتاه‌ترین جملات ممکن بیان کند.'
    },
    social: {
      use: 'برای برنامه‌ریزی، تولید محتوا و تعامل در پلتفرم‌های اینستاگرام، تلگرام، لینکدین و توییتر.',
      output: 'متن آماده‌ی کپی برای انتشار در شبکه‌های اجتماعی همراه با قلاب اول و دعوت به اقدام.',
      tip: 'پست را با لحن برند خودتان هماهنگ کنید و از کلیشه‌های ماشینی و بازاریابی زرد پرهیز نمایید.'
    },
    visual: {
      use: 'برای خلق سناریوهای تصویری، پرامپت‌های تولید تصویر در ابزارهای هوش مصنوعی و طراحی بنر.',
      output: 'توصیف دقیق جزییات بصری، سبک نورپردازی، پالت رنگ و ترکیب‌بندی مناسب ابزار تصویرساز.',
      tip: 'رنگ‌های پالت برند خود را در پرامپت ذکر کنید تا تصاویر ساخته‌شده هویت بصری یکپارچه داشته باشند.'
    },
    campaign: {
      use: 'برای طراحی استراتژی بازاریابی، خلق آفرها و برنامه‌ریزی فروش محصولات و خدمات.',
      output: 'سند برنامه بازاریابی با اهداف مشخص، پیام‌های محوری و زمان‌بندی اقدام.',
      tip: 'همیشه دغدغه‌ی مخاطب را بر منافع شخصی خود ترجیح دهید تا اعتماد به خرید شکل بگیرد.'
    },
    web: {
      use: 'برای نوشتن متن بخش‌های مختلف سایت، صفحات فرود و پیام‌های تبدیل مخاطب به خریدار.',
      output: 'متن ساختاریافته وب شامل تیترها، زیرتیترها، متن‌های توضیح و دکمه‌های اقدام (CTA).',
      tip: 'صفحات وب باید به راحتی اسکن شوند؛ جملات را در بندهای حداکثر ۳ خطی بنویسید.'
    },
    files: {
      use: 'برای استخراج نکات مهم، خلاصه کردن اسناد و آماده‌سازی اسلایدهای ارائه از روی فایل‌ها.',
      output: 'گزارش فشرده و تفکیک‌شده از محتوای فایل با تکیه بر اطلاعات و ارقام مستند.',
      tip: 'از مدل بخواهید صرفاً به فکت‌های موجود در فایل وفادار بماند و از افزودن حدسیات بپرهیزد.'
    },
    data: {
      use: 'برای سازماندهی، کشف الگوها و تحلیل اعداد، آمارها و جداول اطلاعاتی.',
      output: 'تحلیل شفاف عددی، نمایش نقاط قوت و ضعف و پیشنهادات اجرایی مستند.',
      tip: 'سرستون‌ها و واحدهای اندازه‌گیری را به درستی مشخص کنید تا محاسبات بدون خطا انجام شوند.'
    },
    think: {
      use: 'برای چالش کشیدن ایده‌ها، نقد تصمیمات و بازبینی سناریوهای کاری از دیدگاه‌های متفاوت.',
      output: 'نقد تحلیلی، فهرست ریسک‌های احتمالی و پیشنهادات سازنده برای ارتقای تصمیم.',
      tip: 'تعصب روی ایده‌ی اولیه را کنار بگذارید و نقدها را راهی برای ایمن‌سازی آینده بدانید.'
    },
    plan: {
      use: 'برای سازماندهی جلسات کاری با هوش مصنوعی، نقشه‌برداری مراحل و مدیریت چت‌های چندمرحله‌ای.',
      output: 'سند برنامه اقدام، ماتریس تقسیم وظایف یا چکیده تحویل کار برای ادامه.',
      tip: 'چت‌های طولانی را به مراحل مشخص تقسیم کنید تا هوش مصنوعی دچار فراموشی نشود.'
    },
    learn: {
      use: 'برای یادگیری عمیق مفاهیم جدید، پرسش‌گری تعاملی و تمرین مهارت‌ها با شیوه سقراطی.',
      output: 'پاسخ‌های هدایت‌کننده، طرح سوالات گام‌به‌گام و بازخورد درباره میزان درک شما.',
      tip: 'به جای خواستن جواب آماده، بخواهید مدل با سوال پرسیدن شما را به کشف پاسخ برساند.'
    },
    assistant: {
      use: 'برای طراحی دستیارهای هوشمند اختصاصی (Gems/GPTs) و مهندسی سیستم پرامپت‌ها.',
      output: 'دستورالعمل کامل رفتاری، بندهای دفاعی و وظایف یک دستیار برای نصب در اکانت.',
      tip: 'بندهای دفاعی را همیشه در انتهای دستورالعمل بگذارید تا دستیار از چارچوب خارج نشود.'
    },
    addon: {
      use: 'برای اضافه کردن ضوابط تکمیلی، محدودیت طول یا سبک خاص به پرامپت‌های دیگر.',
      output: 'یک بند تکمیلی استاندارد برای چسباندن به انتهای هر پرامپت دلخواه.',
      tip: 'افزودنی‌ها را با پرامپت‌های اصلی ترکیب کنید تا خروجی دقیقاً باب میل شما شکل بگیرد.'
    }
  };

  function getCardGuidance(c) {
    if (!c) return { use: '', output: '', tip: '' };
    if (CARD_GUIDES[c.id]) return CARD_GUIDES[c.id];
    var catH = CATEGORY_HEURISTICS[c.category] || CATEGORY_HEURISTICS.write;
    var use = c.desc || catH.use;
    if (use.length < 35) use = c.desc + ' · ' + catH.use;
    return {
      use: use,
      output: catH.output,
      tip: catH.tip
    };
  }

  // ---------- راهنمای جمع‌وجور و سبک پرامپت ----------
  function simpleGuideHtml(c) {
    var g = getCardGuidance(c);
    return '<details class="simple-guide">' +
      '<summary><span class="sg-icon">💡</span> <b>راهنمای کاربردی این پرامپت (کاربرد، خروجی و نکته)</b></summary>' +
      '<div class="simple-guide-body">' +
      '  <div class="sg-row"><span class="sg-lbl">🎯 کاربرد:</span> <span class="sg-txt">' + h(g.use) + '</span></div>' +
      '  <div class="sg-row"><span class="sg-lbl">📦 خروجی:</span> <span class="sg-txt">' + h(g.output) + '</span></div>' +
      '  <div class="sg-row"><span class="sg-lbl">✨ نکته طلایی:</span> <span class="sg-txt">' + h(g.tip) + '</span></div>' +
      '</div></details>';
  }

  // ---------- نوار وضعیت اتصال برند من ----------
  function brandBarHtml(c) {
    var prof = getActiveProfile();
    var hasBrand = Boolean(prof.business || prof.role || prof.audience || prof.tone);
    if (!hasBrand) {
      return '<div class="brand-bar empty">' +
        '<div class="bb-info">' + ic('diamond') + '<span>مشخصات برند شما هنوز ثبت نشده است.</span></div>' +
        '<a class="btn btn-line small" href="#/brand">تنظیم مشخصات برند من</a>' +
        '</div>';
    }
    var brandTitle = prof.business || prof.role || 'برند من';
    return '<div class="brand-bar connected">' +
      '<label class="brand-inject-label">' +
      '  <input type="checkbox" data-act="toggle-brand-inject"' + (S.brandInject ? ' checked' : '') + '>' +
      '  <span>' + ic('diamond') + 'افزودن امضای برند من به این پرامپت <b>(' + h(brandTitle) + ')</b></span>' +
      '</label>' +
      '<a class="link-btn small" href="#/brand">ویرایش برند</a>' +
      '</div>';
  }

  // ---------- نوار نمونه‌های پرشده آماده (ساده و مرتب) ----------
  function quickSamplesHtml(c) {
    if (!c.fields || !c.fields.length) return '';
    var exKeys = Object.keys(c.examples || {});
    if (!exKeys.length && c.fields.some(function (f) { return f.profile; })) {
      exKeys = ['sara', 'reza', 'mina'];
    }
    if (!exKeys.length) return '';

    var personaMeta = {
      sara: { name: 'سارا (روان‌درمانگر)', icon: '🌱' },
      reza: { name: 'رضا (کسب‌وکار و فروش)', icon: '☕' },
      mina: { name: 'مینا (آموزش و مشاوره)', icon: '🎓' }
    };

    return '<div class="quick-samples-bar">' +
      '<span class="qsb-label">' + ic('spark') + 'نمونه‌ی پرشده:</span>' +
      exKeys.map(function (pk) {
        var m = personaMeta[pk] || { name: pk, icon: '⚡' };
        var isCurrent = S.activePersona === pk;
        return '<button type="button" class="qsb-btn' + (isCurrent ? ' active' : '') + '" data-act="load-sample" data-p="' + pk + '" title="پر کردن فرم با سناریوی ' + h(m.name) + '">' +
          m.icon + ' ' + h(m.name) + '</button>';
      }).join('') +
      '<button type="button" class="qsb-clear" data-act="clear" title="پاک کردن فیلدهای فرم">پاک کردن فرم</button>' +
      '</div>';
  }

  // ---------- فیلدهای فرم (ساده، خلوت و آرام) ----------
  function fieldHtml(c, f) {
    var v = value(c, f), id = 'f_' + f.key;
    var auto = fromBrand(c, f) ? '<span class="auto">از برند من</span>' : '';
    var req = f.required ? '<span class="req" aria-label="ضروری">*</span>' : '';
    var help = f.help ? '<div class="help">' + h(f.help) + '</div>' : '';
    var ph = f.example ? ' placeholder="' + h('مثلاً ' + f.example) + '"' : '';

    if (f.type === 'select') {
      return '<div class="field"><label for="' + id + '">' + h(f.label) + req + auto + '</label>' + help + '<select id="' + id + '" data-k="' + f.key + '">' +
        (f.default == null ? '<option value="">انتخاب کنید</option>' : '') +
        f.options.map(function (o) { return '<option value="' + h(o.value) + '"' + (o.value === v ? ' selected' : '') + '>' + h(o.label) + '</option>'; }).join('') + '</select></div>';
    }
    if (f.type === 'multi') {
      var arr = Array.isArray(v) ? v : [];
      return '<div class="field"><span class="lbl">' + h(f.label) + req + auto + '</span>' + help + '<div class="checks">' + f.options.map(function (o, i) {
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
    if (!ps.length && c.fields.some(function (f) { return f.profile; })) ps = ['sara', 'reza'];
    return ps[0] || null;
  }

  // ---------- صفحه‌ی پرامپت ----------
  function viewPrompt(r) {
    var c = byId[r.id];
    if (!c) { location.hash = '#/'; return; }
    document.title = c.title + ' · بانک پرامپت';
    var tool = B.tools.tools[c.tool];
    var app = tool && tool.first.length ? B.tools.apps[tool.first[0]] : null;
    var tags = '<span class="tag cat-tag">' + h(catOf(c).title) + '</span>';
    if (tool && tool.first.length) tags += '<span class="tag">' + h(tool.label) + '</span>';
    if (c.privacy === 'red') tags += '<span class="tag red">' + ic('shield') + 'حساس: در چت موقت</span>';
    else if (c.privacy === 'yellow') tags += '<span class="tag amber">' + ic('shield') + 'داده‌ی کسب‌وکار</span>';
    else tags += '<span class="tag green">' + ic('shield') + 'داده‌ی عمومی</span>';

    var html = '<a class="back" href="#/">' + ic('back') + 'همه‌ی پرامپت‌ها</a>' +
      '<div class="phead">' +
      '  <div class="phead-title"><h1>' + h(c.title) + '</h1><span class="phead-id">' + fa(c.id) + '</span></div>' +
      '  <p>' + h(c.desc) + '</p>' +
      '  <div class="tags">' + tags + '</div>' +
      '</div>' +
      simpleGuideHtml(c) +
      brandBarHtml(c) +
      '<div class="split">' +
      '  <section class="panel form-panel">' +
      quickSamplesHtml(c) +
      '    <div class="panel-head"><h2>متغیرهای پرامپت</h2><div>' +
      '      <button class="link-btn muted" data-act="clear">پاک کردن فرم</button>' +
      '    </div></div>' +
      (c.fields.length ? c.fields.map(function (f) { return fieldHtml(c, f); }).join('') : '<p class="muted">این پرامپت متغیری ندارد و آماده‌ی کپی مستقیم است.</p>') +
      '  </section>' +
      '  <section class="pv"><div class="paper">' +
      '    <div class="paper-head">' +
      '      <div class="format-tabs" role="tablist" aria-label="قالب پرامپت">' +
      '        <button class="format-tab' + (currentFmt === 'text' ? ' active' : '') + '" data-act="preview-fmt" data-fmt="text" role="tab" aria-selected="' + (currentFmt === 'text') + '">' + ic('text') + 'متن پرامپت</button>' +
      '        <button class="format-tab' + (currentFmt === 'markdown' ? ' active' : '') + '" data-act="preview-fmt" data-fmt="markdown" role="tab" aria-selected="' + (currentFmt === 'markdown') + '">' + ic('markdown') + 'مارکداون (Markdown)</button>' +
      '        <button class="format-tab' + (currentFmt === 'xml' ? ' active' : '') + '" data-act="preview-fmt" data-fmt="xml" role="tab" aria-selected="' + (currentFmt === 'xml') + '">' + ic('code') + 'ساختاریافته (XML)</button>' +
      '      </div>' +
      '      <span class="paper-meta"><span id="wc" class="wc-badge"></span></span>' +
      '    </div>' +
      '    <div class="prompt" id="pv"></div><div class="missing" id="miss"></div>' +
      (c.gloss ? '<details class="gloss"><summary>ترجمه برای خودتان</summary><div class="prompt" id="gl"></div></details>' : '') +
      '    <div class="copy-section">' +
      '      <div class="copy-section-title">کپی پرامپت در سه قالب:</div>' +
      '      <div class="copy-grid">' +
      '        <button class="btn btn-gold copy-btn' + (currentFmt === 'text' ? ' btn-active-fmt' : '') + '" data-act="copy" data-fmt="text" title="کپی متن مستقیم پرامپت">' +
      '          <span class="btn-ic">' + ic('text') + '</span><span class="btn-txt">کپی متن پرامپت</span>' +
      '        </button>' +
      '        <button class="btn btn-glass copy-btn' + (currentFmt === 'markdown' ? ' btn-active-fmt' : '') + '" data-act="copy" data-fmt="markdown" title="کپی با تیترها و قالب مارکداون">' +
      '          <span class="btn-ic">' + ic('markdown') + '</span><span class="btn-txt">کپی با فرمت مارکداون</span>' +
      '        </button>' +
      '        <button class="btn btn-glass copy-btn' + (currentFmt === 'xml' ? ' btn-active-fmt' : '') + '" data-act="copy" data-fmt="xml" title="کپی با تگ‌های ساختاریافته XML">' +
      '          <span class="btn-ic">' + ic('code') + '</span><span class="btn-txt">کپی با فرمت XML</span>' +
      '        </button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="actions secondary-actions">' +
      '      <button class="btn btn-glass small" data-act="save">' + ic('save') + '<span>ذخیره در این دستگاه</span></button>' +
      (c.link ? '      <a class="btn btn-glass small" href="' + h(c.link) + '" target="_blank" rel="noopener noreferrer">' + ic('out') + '<span>باز کردن Gem</span></a>' : '') +
      (app ? '      <a class="btn btn-glass small" href="' + h(app.url) + '" target="_blank" rel="noopener noreferrer">' + ic('out') + '<span>باز کردن ' + h(app.name) + '</span></a>' : '') +
      '    </div>' +
      '  </div></section>' +
      '</div>';

    main.innerHTML = html;
    autosize(main);
    refresh(c);
  }
  function refresh(c) {
    var p = build(c, true);
    var formattedDisplay = E.formatPrompt(p.text, c, currentFmt);
    formattedDisplay = injectBrandToText(formattedDisplay, c, currentFmt);
    $('#pv').innerHTML = linesHtml(formattedDisplay);

    var clean = build(c, false).text;
    var cleanFormatted = E.formatPrompt(clean, c, currentFmt);
    cleanFormatted = injectBrandToText(cleanFormatted, c, currentFmt);
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
    var prof = S.profile || {};
    var hasIdentity = Boolean(prof.business || prof.role || prof.audience);
    var hasVoice = Boolean(prof.tone || prof.voice_use || prof.voice_avoid);
    var statusText = (hasIdentity && hasVoice) ? 'مشخصات برند شما آماده و ذخیره شده است ✓' : 'مشخصات برند را بنویسید و سپس دکمه‌ی ذخیره را بزنید.';

    var html = '<section class="hero"><div class="eyebrow">یک بار ذخیره کنید · روی همین دستگاه</div>' +
      '<h1>برند من (هویت و لحن کلامی شما)</h1>' +
      '<p>مشخصات تخصص، مخاطب و لحن کاری خود را در کادرهای زیر بنویسید و دکمه‌ی «ذخیره اطلاعات برند» را بزنید. این مشخصات در تمام پرامپت‌ها می‌نشیند و دیگر نیازی به تکرار ندارید.</p>' +
      '<div class="brand-presets-row">' +
      '  <span class="bpr-title">نمونه‌های آماده‌ی کارگاه:</span>' +
      '  <button class="btn btn-line small" data-act="persona" data-p="sara">🌱 سارا (روان‌درمانگر)</button>' +
      '  <button class="btn btn-line small" data-act="persona" data-p="reza">☕ رضا (کسب‌وکار و فروشگاه)</button>' +
      '  <button class="btn btn-line small" data-act="persona" data-p="mina">🎓 مینا (مشاور آموزشی)</button>' +
      '</div></section>';

    // دکمه ذخیره اول (بالای فرم)
    html += '<div class="brand-save-card">' +
      '  <button type="button" class="btn btn-gold btn-save-brand" data-act="save-brand">' + ic('save') + '<span>ذخیره اطلاعات برند من روی این دستگاه</span></button>' +
      '  <div class="brand-save-status" id="brand-save-status">' + statusText + '</div>' +
      '</div>';

    B.brand.sections.forEach(function (s) {
      if (s.id === 'extra') {
        html += '<details class="panel extra-brand-section"><summary><b>' + h(s.title) + '</b> <span class="muted">(' + h(s.sub) + ')</span></summary>' +
          '<div class="extra-brand-content">' + s.fields.map(brandField).join('') + '</div></details>';
        return;
      }
      html += '<section class="panel bsec"><div class="panel-head"><h2>' + h(s.title) + '</h2>' +
        (s.helper ? '<a class="link-btn" href="#/p/' + s.helper + '">ساختن خودکار از نمونه‌های من</a>' : '') + '</div>' +
        '<p class="sub">' + h(s.sub) + '</p>' + s.fields.map(brandField).join('');
      if (s.id === 'brand') html += '<div class="swatches" id="sw"></div><div class="swatch-hint">برای کپی کردن کد هر رنگ، روی آن کلیک کنید.</div>';
      if (s.note) html += '<p class="note">' + h(s.note) + '</p>';
      if (s.compose) {
        html += '<div class="paper composed"><div class="paper-head"><b>' + h(s.title) + ' آماده</b><span>برای قرار دادن در دانش Gem یا دستور سفارشی</span></div>' +
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

    // دکمه ذخیره دوم (پایین فرم)
    html += '<div class="brand-save-card bottom-save">' +
      '  <button type="button" class="btn btn-gold btn-save-brand" data-act="save-brand">' + ic('save') + '<span>ذخیره اطلاعات برند من روی این دستگاه</span></button>' +
      '  <div class="brand-save-status">اطلاعات روی همین مرورگر ماندگار می‌شود و در تمام پرامپت‌ها قرار می‌گیرد.</div>' +
      '</div>';

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

  // ---------- راهنما و قطب‌نما ----------
  var guideDemoFmt = 'text';
  function viewGuide() {
    document.title = 'راهنما و قطب‌نما · بانک پرامپت';
    var total = B.cards.length;

    var html = '<section class="hero"><div class="eyebrow">راهنمای کاربردی و قطب‌نمای کارگاه</div>' +
      '<h1>راهنمای انتخاب پرامپت<br><em>و معجزه‌ی ترکیب با برند من</em></h1>' +
      '<p>چطور پرامپت متناسب با نیازتان را در چند ثانیه پیدا کنید و با افزودن هویت برند، خروجی‌های ملموس و بدون کلیشه بگیرید.</p></section>' +

      '<div class="section-head"><span class="ico">' + ic('spark') + '</span><h2>معجزه‌ی ترکیب برند با پرامپت: مقایسه دو جهان</h2></div>' +
      '<div class="before-after-grid">' +
      '  <div class="panel ba-card ba-before">' +
      '    <div class="ba-badge red">جهان ۱: پرامپت خام بدون برند (ماشینی و کلیشه‌ای)</div>' +
      '    <p class="ba-desc">وقتی بدون سند لحن و بدون معرفی مخاطب پرامپت می‌دهید، هوش مصنوعی از عبارات زرد و غیرواقعی استفاده می‌کند:</p>' +
      '    <div class="ba-quote">«سلام خدمت همراهان گرامی! آیا به دنبال یک فرصت استثنایی و یک محصول بی‌نظیر هستید؟ کیفیت اتفاقی نیست! همین حالا عدد ۱ را دایرکت بفرستید تا شگفت‌زده شوید...»</div>' +
      '    <div class="ba-foot red">✗ نتیجه: مخاطب حس تبلیغ فیک می‌کند و اعتماد شکل نمی‌گیرد.</div>' +
      '  </div>' +
      '  <div class="panel ba-card ba-after">' +
      '    <div class="ba-badge green">جهان ۲: پرامپت ترکیب‌شده با برند من (اصیل و انسانی)</div>' +
      '    <p class="ba-desc">وقتی مشخصات «برند من» (رضا - دمنوش) تزریق می‌شود، خروجی آرام، صادقانه و دلنشین است:</p>' +
      '    <div class="ba-quote">«دمنوش به‌لیموی ما را ساعت ده شب دم کنید. بوی لیمو که بلند شد، گوشی را کنار بگذارید. همین. بسته‌ی هدیه‌ی یلدا آماده‌ی سفارش در لینک بیو است.»</div>' +
      '    <div class="ba-foot green">✓ نتیجه: صمیمیت، اعتبار، و فروش بدون تحمیل و اصرار.</div>' +
      '  </div>' +
      '</div>' +

      '<div class="section-head"><span class="ico">' + ic('route') + '</span><h2>قطب‌نمای انتخاب پرامپت (دنبال چه کاری هستید؟)</h2></div>' +
      '<div class="compass-grid">' +
      '  <div class="panel compass-card">' +
      '    <div class="cc-head"><span class="ico">' + ic('chat') + '</span><h3>۱. محتوا و شبکه‌های اجتماعی</h3></div>' +
      '    <p>برای جذب مخاطب، توقف اسکرول و تعامل مداوم در اینستاگرام، تلگرام و توییتر.</p>' +
      '    <ul class="cc-links">' +
      '      <li><a href="#/p/06b-01"><b>کپشن اینستاگرام</b> · قلاب، بدنه کوتاه و دعوت به اقدام</a></li>' +
      '      <li><a href="#/p/06b-02"><b>اسلایدهای کاروسل</b> · آموزش ورق‌زدنی تک‌نکته‌ای</a></li>' +
      '      <li><a href="#/p/06b-04"><b>استوری‌های تعاملی</b> · سناریوی نظرسنجی و فروش</a></li>' +
      '      <li><a href="#/p/06a-09"><b>ایده‌های قلاب جذاب</b> · ۱۰ زاویه برای شروع ویدیو و متن</a></li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="panel compass-card">' +
      '    <div class="cc-head"><span class="ico">' + ic('pen') + '</span><h3>۲. نوشتن، ویرایش و نامه‌نگاری</h3></div>' +
      '    <p>برای پیام‌های تمیز کاری، دایرکت‌های حساس و استخراج سبک شخصی قلم.</p>' +
      '    <ul class="cc-links">' +
      '      <li><a href="#/p/03-01"><b>پرامپت یک‌جمله‌ای</b> · فرمول ۳ جزئی برای پیام و بازنویسی</a></li>' +
      '      <li><a href="#/p/04-01"><b>استخراج سند لحن</b> · تبدیل نمونه متن‌ها به امضای کلامی</a></li>' +
      '      <li><a href="#/p/03-05"><b>ایمیل و پیام اداری</b> · محترمانه، بدون چاپلوسی و شفاف</a></li>' +
      '      <li><a href="#/p/04-06"><b>تغییر لحن متن</b> · جابجایی لحن رسمی و صمیمی بدون تحریف</a></li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="panel compass-card">' +
      '    <div class="cc-head"><span class="ico">' + ic('target') + '</span><h3>۳. فروش، لندینگ و بازاریابی</h3></div>' +
      '    <p>برای طراحی کمپین‌ها، پیشنهادات وسوسه‌انگیز و صفحات فرود با نرخ تبدیل بالا.</p>' +
      '    <ul class="cc-links">' +
      '      <li><a href="#/p/06a-01"><b>بریف کامل کمپین</b> · پیام محوری و اهداف اجرایی</a></li>' +
      '      <li><a href="#/p/06a-04"><b>پیشنهاد رد‌نشدنی</b> · بسته‌بندی ارزش، بونوس و ضمانت</a></li>' +
      '      <li><a href="#/p/06c-01"><b>صفحه فرود (لندینگ)</b> · متن تبدیل غریبه به خریدار</a></li>' +
      '      <li><a href="#/p/06c-03"><b>تیترنویسی وب</b> · تیترهای کنجکاوی‌ساز و ارزش‌محور</a></li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="panel compass-card">' +
      '    <div class="cc-head"><span class="ico">' + ic('spark') + '</span><h3>۴. فکر، نقد و چکش‌کاری ایده</h3></div>' +
      '    <p>برای ارزیابی موشکافانه طرح‌ها قبل از صرف وقت، انرژی و سرمایه.</p>' +
      '    <ul class="cc-links">' +
      '      <li><a href="#/p/03-07"><b>وکیل‌مدافع شیطان</b> · کشف ۵ نقطه ضعف مرگبار ایده</a></li>' +
      '      <li><a href="#/p/03-08"><b>شبیه‌ساز مخاطب</b> · تست بازخورد مشتری شکاک و محافظه‌کار</a></li>' +
      '      <li><a href="#/p/03-11"><b>نقد پیش‌فرض‌ها</b> · پیدا کردن مفروضات پنهان غلط</a></li>' +
      '      <li><a href="#/p/03-16"><b>پرامپت‌ساز</b> · تبدیل درخواست خام به پرامپت مهندسی‌شده</a></li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="panel compass-card">' +
      '    <div class="cc-head"><span class="ico">' + ic('file') + '</span><h3>۵. فایل‌ها، داده‌ها و ارائه‌ها</h3></div>' +
      '    <p>برای خلاصه کردن سریع اسناد قطور و ساختاربندی داده‌های اکسل و اسلاید.</p>' +
      '    <ul class="cc-links">' +
      '      <li><a href="#/p/05b-01"><b>خلاصه‌ی اجرایی سند</b> · عصاره‌ی ۱ صفحه‌ای از گزارش‌های طولانی</a></li>' +
      '      <li><a href="#/p/05b-07"><b>متن اسلایدهای ارائه</b> · تیتر، نکته و یادداشت سخنران</a></li>' +
      '      <li><a href="#/p/01-04"><b>تحلیل جدول داده</b> · کشف الگوها و فرصت‌ها از اکسل</a></li>' +
      '      <li><a href="#/p/02-01"><b>خلاصه‌ی تحویل چت</b> · فشرده‌سازی چت و انتقال به چت نو</a></li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="panel compass-card">' +
      '    <div class="cc-head"><span class="ico">' + ic('bot') + '</span><h3>۶. ساخت دستیار هوشمند و Gem</h3></div>' +
      '    <p>برای طراحی ایجنت‌های دائمی در Gemini و ChatGPT با قوانین رفتاری پایدار.</p>' +
      '    <ul class="cc-links">' +
      '      <li><a href="#/p/04-03"><b>دستورالعمل سیستم Gem</b> · پرامپت ریشه برای ساخت دستیار</a></li>' +
      '      <li><a href="#/p/G-01"><b>Gem منتقد بی‌تعارف</b> · دستیار غربالگری و بهبود متن</a></li>' +
      '      <li><a href="#/p/04-05"><b>دستورالعمل ChatGPT</b> · تنظیمات پایدار برای همه چت‌ها</a></li>' +
      '      <li><a href="#/p/07c-01"><b>بندهای دفاعی دستیار</b> · جلوگیری از هک و خروج از دستور</a></li>' +
      '    </ul>' +
      '  </div>' +
      '</div>' +

      '<div class="section-head"><span class="ico">' + ic('code') + '</span><h2>راهنمای انتخاب قالب کپی</h2></div>' +
      '<div class="format-guide-grid">' +
      '  <div class="panel format-card">' +
      '    <div class="fc-head"><span class="ico">' + ic('text') + '</span><h3>متن پرامپت (ساده)</h3></div>' +
      '    <p><b>کی استفاده کنیم؟</b> برای پیام‌های سریع، کپشن‌ها، استوری‌ها و کارهای روزمره. روی گوشی سریع‌ترین گزینه است و مستقیماً در هر کادری پیست می‌شود.</p>' +
      '  </div>' +
      '  <div class="panel format-card">' +
      '    <div class="fc-head"><span class="ico">' + ic('markdown') + '</span><h3>فرمت مارکداون (Markdown)</h3></div>' +
      '    <p><b>کی استفاده کنیم؟</b> برای بریف‌های کاری، پروپوزال‌ها، متون چندبخشی و اسنادی که انسان و مدل هر دو باید آن را به‌صورت تمیز و بخش‌بندی‌شده بخوانند.</p>' +
      '  </div>' +
      '  <div class="panel format-card">' +
      '    <div class="fc-head"><span class="ico">' + ic('code') + '</span><h3>فرمت ساختاریافته (XML)</h3></div>' +
      '    <p><b>کی استفاده کنیم؟</b> برای داده‌های طولانی، تفکیک دقیق دستور از داده، ساخت Gem یا Project تا مدل متن ورودی را با دستور اصلی اشتباه نگیرد.</p>' +
      '  </div>' +
      '</div>' +

      '<div class="section-head"><span class="ico">' + ic('spark') + '</span><h2>۵ قانون طلایی کارگاه برای خروجی بی‌نقص</h2></div>' +
      '<div class="tips">' +
      '<div class="panel tip">' + ic('diamond') + '<p><b>۱. همیشه برند من را متصل نگه دارید:</b> تفاوت هوش مصنوعی آماتور با حرفه‌ای در همین است؛ بدون برند، مدل جملات کلیشه‌ای و زرد می‌نویسد؛ با برند، دقیقاً زبان کسب‌وکار شما را صحبت می‌کند.</p></div>' +
      '<div class="panel tip">' + ic('target') + '<p><b>۲. قید منفی بگذارید:</b> مدل‌ها عاشق پرگویی هستند! با گفتن «بدون اصطلاحات تخصصی»، «حداکثر ۴۰ کلمه» یا «بدون سلام و احوالپرسی» جلوی اضافه‌گویی را بگیرید.</p></div>' +
      '<div class="panel tip">' + ic('route') + '<p><b>۳. چت‌ها را سبک نگه دارید:</b> وقتی پروژه‌ای طولانی شد، با پرامپت ۰۲-۰۱ خلاصه تحویل بگیرید و کار را در یک چت تازه ادامه دهید تا حافظه مدل کند نشود.</p></div>' +
      '<div class="panel tip">' + ic('save') + '<p><b>۴. پرامپت‌های برنده را ذخیره کنید:</b> هر فرمی که پر کردید و خروجی عالی داد را با دکمه‌ی «ذخیره در این دستگاه» نگه دارید تا دفعه بعد در ۵ ثانیه آماده باشد.</p></div>' +
      '<div class="panel tip">' + ic('shield') + '<p><b>۵. اطلاعات حساس را ماسک کنید:</b> پرامپت‌های قرمز را هرگز با نام مشتری یا اطلاعات بانکی پر نکنید و همیشه از چت موقت (Temporary Chat) استفاده نمایید.</p></div>' +
      '</div>';

    main.innerHTML = html + footHtml();
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

    if (act === 'save-brand') {
      $$('[data-b]').forEach(function (inp) {
        var bk = inp.getAttribute('data-b');
        if (inp.hasAttribute('data-r')) {
          var rIdx = +inp.getAttribute('data-r');
          if (!Array.isArray(S.profile[bk])) S.profile[bk] = [];
          S.profile[bk][rIdx] = inp.value;
        } else {
          S.profile[bk] = inp.value;
        }
      });
      composeBrand();
      persist();
      refreshBrand();
      var statEls = $$('.brand-save-status');
      statEls.forEach(function (st) {
        st.textContent = '✓ اطلاعات برند شما با موفقیت ذخیره شد و در پرامپت‌ها فعال است.';
        st.classList.add('saved-active');
      });
      toast('💾 اطلاعات برند شما با موفقیت ذخیره شد');
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

    if (act === 'toggle-brand-inject') {
      S.brandInject = el.checked;
      persist();
      if (c) refresh(c);
      return;
    }

    if (act === 'copy') {
      var fmt = el.getAttribute('data-fmt') || currentFmt || 'text';
      var p = build(c, false);
      var textToCopy = E.formatPrompt(p.text, c, fmt);
      textToCopy = injectBrandToText(textToCopy, c, fmt);
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
      sFormatted = injectBrandToText(sFormatted, sCard, sFmt);

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

    if (act === 'load-sample') {
      var pk = el.getAttribute('data-p');
      var ex = (c.examples && c.examples[pk]) ? c.examples[pk] : {};
      var per = (B.personas && B.personas[pk]) ? B.personas[pk].profile : {};
      var v = {};
      c.fields.forEach(function (f) {
        if (has(ex, f.key)) {
          v[f.key] = ex[f.key];
        } else if (f.profile && has(per, f.profile)) {
          v[f.key] = f.profile === 'voice_doc' ? voiceOf(per) : per[f.profile];
        } else if (f.default !== undefined) {
          v[f.key] = f.default;
        }
      });
      S.vals[c.id] = v;
      S.activePersona = pk;
      persist();
      viewPrompt(r);
      var pName = (B.personas && B.personas[pk]) ? B.personas[pk].name : pk;
      toast('⚡ سناریوی طلایی «' + pName + '» با موفقیت در فرم بارگذاری شد');
      return;
    }

    if (act === 'example') {
      var pk = exampleOf(c), per = B.personas[pk].profile, ex = c.examples[pk] || {}, v = {};
      c.fields.forEach(function (f) { if (has(ex, f.key)) v[f.key] = ex[f.key]; else if (f.profile && has(per, f.profile)) v[f.key] = f.profile === 'voice_doc' ? voiceOf(per) : per[f.profile]; });
      S.vals[c.id] = v; S.activePersona = pk; persist(); viewPrompt(r); toast('نمونه‌ی ' + B.personas[pk].name + ' پر شد');
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
