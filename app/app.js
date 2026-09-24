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
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="8.5"/>',
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
  var S = { profile: {}, vals: {}, saved: [], theme: 'auto', fmt: 'text', brandInject: true, dismissedBrandPrompt: false };
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
    return S.profile || {};
  }
  function getActivePersonaName() {
    var p = S.profile || {};
    return (p.business || p.role || 'برند من');
  }
  function hasBrandConfigured() {
    var p = S.profile || {};
    return Boolean((p.business && p.business.trim()) || (p.role && p.role.trim()) || (p.tone && p.tone.trim()));
  }
  function isSaved(cardId) {
    return (S.saved || []).some(function (x) { return x.id === cardId; });
  }

  // پالت‌های رنگی آماده و هماهنگ
  var BRAND_PALETTES = [
    {
      id: 'calm',
      name: 'سلامت و آرامش',
      desc: 'روان‌درمانی، مشاوره، سلامت و پزشکی',
      hexes: ['#4A6B5D', '#E29578', '#F4EFEA'],
      items: [
        { color: '#4A6B5D', label: 'رنگ اصلی (سبز زیتونی آرامش‌بخش)' },
        { color: '#E29578', label: 'دکمه و اقدام (گلبهی خاکی)' },
        { color: '#F4EFEA', label: 'پس‌زمینه اسلاید و محتوا' }
      ]
    },
    {
      id: 'academic',
      name: 'آکادمیک و متانت',
      desc: 'آموزش، پژوهش، اندیشکده و حقوق',
      hexes: ['#1D3557', '#D4AF37', '#F8F9FA'],
      items: [
        { color: '#1D3557', label: 'رنگ اصلی (سرمه‌ای متین)' },
        { color: '#D4AF37', label: 'تأکید و نشان‌ها (طلایی مات)' },
        { color: '#F8F9FA', label: 'پس‌زمینه روشن و عاجی' }
      ]
    },
    {
      id: 'modern',
      name: 'مدرن و فناوری',
      desc: 'فناوری، نرم‌افزار، استارتاپ و داده',
      hexes: ['#2563EB', '#0D9488', '#0F172A'],
      items: [
        { color: '#2563EB', label: 'رنگ اصلی (آبی کبالت فناوری)' },
        { color: '#0D9488', label: 'دکمه و اقدام (فیروزه‌ای زنده)' },
        { color: '#0F172A', label: 'تیترها و کادر تیره' }
      ]
    },
    {
      id: 'cozy',
      name: 'صمیمی و ارگانیک',
      desc: 'دمنوش، کافه، صنایع دستی و غذایی',
      hexes: ['#6B4226', '#D97706', '#FDF8F0'],
      items: [
        { color: '#6B4226', label: 'رنگ اصلی (قهوه‌ای گرم زمینی)' },
        { color: '#D97706', label: 'تأکید و جلب توجه (کهربایی)' },
        { color: '#FDF8F0', label: 'پس‌زمینه شنی گرم' }
      ]
    },
    {
      id: 'creative',
      name: 'خلاقیت و هنر',
      desc: 'طراحی، مد، رسانه، تولید محتوا و هنر',
      hexes: ['#7C3AED', '#EC4899', '#FAF5FF'],
      items: [
        { color: '#7C3AED', label: 'رنگ اصلی (بنفش خلاقیت)' },
        { color: '#EC4899', label: 'دکمه و تأکید (سرخابی پرانرژی)' },
        { color: '#FAF5FF', label: 'پس‌زمینه ملایم یاسی' }
      ]
    }
  ];
  var BRAND_FONTS = ['وزیرمتن', 'یکان‌بخش', 'ایران‌یکان', 'شبنم', 'دانا'];

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
    var bColors = prof.brand_colors ? String(prof.brand_colors).trim() : '';
    var bFonts = prof.brand_fonts ? String(prof.brand_fonts).trim() : '';

    if (fmt === 'xml') {
      var brandXml = '  <brand_voice>\n';
      if (business) brandXml += '    <business>' + business + '</business>\n';
      if (role) brandXml += '    <role>' + role + '</role>\n';
      if (aud) brandXml += '    <audience>' + aud + '</audience>\n';
      if (tone) brandXml += '    <tone>' + tone + '</tone>\n';
      if (use) brandXml += '    <preferred_terms>' + use + '</preferred_terms>\n';
      if (avoid) brandXml += '    <avoid_terms>' + avoid + '</avoid_terms>\n';
      if (bColors) brandXml += '    <brand_colors>' + bColors + '</brand_colors>\n';
      if (bFonts) brandXml += '    <brand_fonts>' + bFonts + '</brand_fonts>\n';
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
      if (bColors) brandMd += '- **پالت رنگ‌های برند:** ' + bColors + '\n';
      if (bFonts) brandMd += '- **فونت برند:** ' + bFonts + '\n';
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
    if (bColors) lines.push('پالت رنگ‌های برند: ' + bColors);
    if (bFonts) lines.push('فونت برند: ' + bFonts);
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

  // جعبه‌ی متن هم‌قد محتوایش بزرگ می‌شود (بدون کات شدن متن)
  function autosize(root) {
    $$('textarea', root).forEach(function (t) {
      t.style.height = 'auto';
      t.style.height = Math.max(t.scrollHeight + 2, 48) + 'px';
    });
  }

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

  function viewHome(r) {
    document.title = 'بانک پرامپت';
    if (r.q.q !== undefined) home.q = r.q.q;
    if (r.q.cat !== undefined) home.cat = r.q.cat;
    var total = B.cards.length;
    var html = '<section class="hero"><div class="eyebrow">' + fa(total) + ' پرامپت استاندارد · کاملاً خصوصی روی همین دستگاه</div>' +
      '<h1>بانک پرامپت‌های تخصصی و آماده</h1>' +
      '<p>پرامپت مورد نظرتان را پیدا کنید، موضوع را بنویسید و متن آماده را در سه قالب کپی کنید.</p></section>';

    // بنر خوش‌آمدگویی برای تکمیل برند در اولین ورود
    if (!hasBrandConfigured() && !S.dismissedBrandPrompt) {
      html += '<div class="brand-onboarding-card">' +
        '<div class="boc-icon">💎</div>' +
        '<div class="boc-body">' +
        '  <h2>گام نخست: هویت و حوزه‌ی کاری خود را ثبت کنید</h2>' +
        '  <p>بانک پرامپت طوری برنامه‌ریزی شده که خروجی‌ها را بر اساس تخصص، لحن و مخاطبان واقعی شما بسازد. لطفاً ابتدا مشخصات برند خود را تکمیل کنید تا تمام پرامپت‌ها متناسب با کار شما شخصی‌سازی شوند.</p>' +
        '  <div class="boc-actions">' +
        '    <a href="#/brand" class="btn btn-gold">ثبت هویت برند من (تنها ۱ دقیقه) ←</a>' +
        '    <button type="button" class="link-btn muted" data-act="dismiss-onboarding">مشاهده‌ی پرامپت‌ها بدون ثبت برند</button>' +
        '  </div>' +
        '</div>' +
        '</div>';
    }

    html += '<div class="search">' + ic('search') +
      '<input id="q" type="search" autocomplete="off" enterkeyhint="search" aria-label="جست‌وجوی پرامپت" placeholder="جست‌وجو: آموزش، اسلاید، درمان، ریلز، فروش، کپشن، ایمیل… (کلید /)" value="' + h(home.q) + '">' +
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

  // ---------- راهنماهای کاربردی کارت‌ها ----------
  var CARD_GUIDES = {
    '03-01': {
      use: 'سریع‌ترین و چابک‌ترین پرامپت برای کارهای روزمره: بازنویسی پیام به مراجع یا مشتری، پاسخ به دایرکت یا ویرایش ایمیل، بدون اینکه هوش مصنوعی پرگویی کند.',
      output: 'یک پاسخ ۱ تا ۳ خطی کاملاً متمرکز، خوش‌لحن و بدون تعارفات اضافه.',
      tip: 'همیشه یک قید منفی بگذارید! مثلاً: «بدون وعده‌ی زمان مشخص» یا «بدون تعارفات طولانی»؛ قید منفی دست مدل را برای پرگویی می‌بندد.'
    },
    '05-01': {
      use: 'آموزش هر موضوع تازه از صفر تا عمق زیاد با شیوه مدرس نابغه، سناریوی داستانی و پیوندهای مفهومی طبیعی.',
      output: 'یک مسیر آموزشی پیوسته با سرفصل‌ها، داستان‌های ملموس، چرایی و چگونگی پیدایش هر مفهوم و مثال‌های در لحظه.',
      tip: 'کافیست فقط موضوع را بنویسید؛ تمام ۱۱ بند سخت‌گیرانه آموزشی به صورت خودکار در پرامپت فعال هستند.'
    },
    '05b-07': {
      use: 'معماری اسلایدهای ارائه و پاورپوینت با سیستم امتیازدهی خودانتقادی سخت‌گیرانه (>۹.۷) و انطباق کامل با استاندارد فارسی و راست‌به‌چپ.',
      output: 'اسکلت ساخت‌یافته اسلاید به اسلاید شامل تیترهای جمله‌ای، نکات بصری و یادداشت سخنران.',
      tip: 'این پرامپت مدل را مجبور می‌کند به جدول‌ها از راست به چپ ستون بدهد و تا نمره بالای ۹.۷ نگرفته به اسلاید بعد نرود.'
    }
  };

  var CATEGORY_HEURISTICS = {
    learn: {
      use: 'برای یادگیری عمیق مفاهیم جدید، پرسش‌گری تعاملی و آموزش گام‌به‌گام.',
      output: 'توضیحات عمیق، سناریومحور و بدون پرش متنی.',
      tip: 'به جای خواستن جواب آماده، اجازه دهید مدل با مثال‌های ملموس چرایی را جا بیندازد.'
    },
    write: {
      use: 'برای ویراستاری، نامه‌نگاری محترمانه، خلاصه‌سازی و بازنویسی متون.',
      output: 'متنی تمیز، صیقل‌خورده و هماهنگ با لحن شخصی شما.',
      tip: 'نمونه متن اولیه خود را بگذارید تا مدل همان را پیراسته کند.'
    },
    social: {
      use: 'تولید محتوا، سناریوی ویدیو و استوری‌های تعاملی بدون لحن رباتی.',
      output: 'متنی با قلاب توقف اسکرول و دعوت به اقدام ملموس.',
      tip: 'با اتصال برند من، خطوط قرمز و واژه‌های ممنوعه رعایت می‌شوند.'
    },
    campaign: {
      use: 'برای معرفی اخلاقی خدمات، بریف تبلیغاتی و بسته‌بندی ارزش‌ها.',
      output: 'پیشنهادی شفاف با رفع نگرانی‌های مخاطب.',
      tip: 'روی دغدغه و درد اصلی مخاطب تمرکز کنید، نه تعریف اغراق‌آمیز از خود.'
    },
    think: {
      use: 'چکش‌کاری ایده‌ها، کشف پیش‌فرض‌های نادرست و شبیه‌سازی نقد مخاطب.',
      output: 'نقد تحلیلی و پیشنهادهای ایمن‌سازی تصمیم قبل از صرف هزینه.',
      tip: 'از مدل بخواهید در نقش یک مخاطب دیرباور و محافظه‌کار عیب‌ها را بگوید.'
    },
    plan: {
      use: 'برای سازماندهی وظایف، نقشه‌برداری گام‌ها و تبدیل پروژه‌ها به کارهای خرد.',
      output: 'سند برنامه اقدام شفاف و ماتریس وظایف.',
      tip: 'چت‌های طولانی را به مراحل مشخص تقسیم کنید.'
    },
    files: {
      use: 'طراحی اسلایدهای حرفه‌ای، خلاصه‌سازی اسناد و کار با فایل‌ها.',
      output: 'ساختار اسلاید به اسلاید با رعایت استاندارد فارسی و راست‌به‌چپ.',
      tip: 'رنگ‌های پالت برند من به طور خودکار در مشخصات اسلاید می‌نشیند.'
    },
    web: {
      use: 'متن صفحات فرود (لندینگ)، تیترهای وب و سوالات متداول.',
      output: 'ساختار استاندارد صفحه وب متناسب با خوانش فارسی.',
      tip: 'تیترها را ارزش‌محور بنویسید نه صرفاً توصیفی.'
    },
    visual: {
      use: 'پرامپت‌های تولید تصویر، توصیف صحنه‌ها و عکس‌های واقع‌گرایانه.',
      output: 'پرامپت دقیق تصویری با نورپردازی، زاویه دوربین و رنگ.',
      tip: 'سبک عکس واقعی با نور طبیعی بالاترین باورپذیری را دارد.'
    },
    data: {
      use: 'تحلیل داده‌های آماری، اکسل و کشف الگوها.',
      output: 'تحلیل ساخت‌یافته همراه با تفکیک مشاهدات از فرضیات.',
      tip: 'داده‌های حساس را با نمونه‌های نمادین جایگزین کنید.'
    },
    assistant: {
      use: 'طراحی دستورالعمل‌های پایه برای ساخت دستیار (Gem و ChatGPT).',
      output: 'دستورالعمل جامع رفتاری با بندهای دفاعی.',
      tip: 'وظایف دستیار را محدود و شفاف تعریف کنید.'
    },
    addon: {
      use: 'افزودن ضوابط تکمیلی یا سبک خاص به پرامپت‌های دیگر.',
      output: 'یک بند تکمیلی استاندارد برای چسباندن به انتهای پرامپت.',
      tip: 'افزودنی‌ها را با پرامپت‌های اصلی ترکیب کنید.'
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
      '<summary><span class="sg-icon">💡</span> <b>راهنمای کوتاه و نکات این پرامپت</b></summary>' +
      '<div class="simple-guide-body">' +
      '  <div class="sg-row"><span class="sg-lbl">🎯 کاربرد:</span> <span class="sg-txt">' + h(g.use) + '</span></div>' +
      '  <div class="sg-row"><span class="sg-lbl">📦 خروجی:</span> <span class="sg-txt">' + h(g.output) + '</span></div>' +
      '  <div class="sg-row"><span class="sg-lbl">✨ نکته طلایی:</span> <span class="sg-txt">' + h(g.tip) + '</span></div>' +
      '</div></details>';
  }

  // ---------- نوار وضعیت اتصال برند من ----------
  function brandBarHtml(c) {
    var prof = getActiveProfile();
    var hasBrand = hasBrandConfigured();
    if (!hasBrand) {
      return '<div class="brand-bar empty">' +
        '<div class="bb-info">' + ic('diamond') + '<span>مشخصات برند شما هنوز ثبت نشده است.</span></div>' +
        '<a class="btn btn-line small" href="#/brand">ثبت هویت برند من (۱ دقیقه)</a>' +
        '</div>';
    }
    var brandTitle = prof.business || prof.role || 'برند من';
    return '<div class="brand-bar connected">' +
      '<label class="brand-inject-label">' +
      '  <input type="checkbox" data-act="toggle-brand-inject"' + (S.brandInject ? ' checked' : '') + '>' +
      '  <span>' + ic('diamond') + 'پیوست هویت برند من به این پرامپت <b>(' + h(brandTitle) + ')</b></span>' +
      '</label>' +
      '<a class="link-btn small" href="#/brand">ویرایش برند</a>' +
      '</div>';
  }

  // ---------- فیلدهای فرم (ورودی‌های چندخطی بدون کات شدن متن) ----------
  function fieldHtml(c, f) {
    var v = value(c, f), id = 'f_' + f.key;
    var auto = fromBrand(c, f) ? '<span class="auto">از برند من</span>' : '';
    var req = f.required ? '<span class="req" aria-label="ضروری">*</span>' : '';
    var help = f.help ? '<div class="help">' + h(f.help) + '</div>' : '';
    var ph = f.example ? ' placeholder="' + h('مثلاً: ' + f.example) + '"' : '';

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
    if (f.type === 'number') {
      return '<div class="field"><label for="' + id + '">' + h(f.label) + req + auto + '</label>' + help +
        '<input id="' + id + '" type="number" inputmode="numeric" data-k="' + f.key + '" value="' + h(v) + '"' + ph + '></div>';
    }

    // تمام فیلدهای متنی: textarea با رشد خودکار برای دیده‌شدن تمام متن
    var input = '<textarea id="' + id + '" data-k="' + f.key + '" class="auto-grow" rows="2"' + ph + '>' + h(v) + '</textarea>';
    return '<div class="field"><label for="' + id + '">' + h(f.label) + req + auto + '</label>' + help + input + '</div>';
  }

  // ---------- پنجره پاپ‌آپ پیش‌نمایش و ویرایش پرامپت ----------
  function modalHtml(c) {
    var p = build(c, false);
    var formatted = E.formatPrompt(p.text, c, currentFmt);
    formatted = injectBrandToText(formatted, c, currentFmt);
    var wc = formatted.split(/\s+/).filter(Boolean).length;

    return '<div id="prompt-modal" class="modal-backdrop" role="dialog" aria-modal="true">' +
      '  <div class="modal-box">' +
      '    <div class="modal-head">' +
      '      <div class="modal-title-row">' +
      '        <h3>' + h(c.title) + ' · پیش‌نمایش و ویرایش</h3>' +
      '        <span class="wc-badge" id="modal-wc">' + fa(wc) + ' واژه</span>' +
      '      </div>' +
      '      <div class="format-tabs" role="tablist">' +
      '        <button type="button" class="format-tab' + (currentFmt === 'text' ? ' active' : '') + '" data-act="modal-fmt" data-fmt="text">متن ساده</button>' +
      '        <button type="button" class="format-tab' + (currentFmt === 'markdown' ? ' active' : '') + '" data-act="modal-fmt" data-fmt="markdown">مارکداون</button>' +
      '        <button type="button" class="format-tab' + (currentFmt === 'xml' ? ' active' : '') + '" data-act="modal-fmt" data-fmt="xml">XML</button>' +
      '      </div>' +
      '      <button type="button" class="modal-close-btn" data-act="modal-close" aria-label="بستن پنجره">' + ic('close') + '</button>' +
      '    </div>' +
      '    <div class="modal-body">' +
      '      <div class="modal-hint">' + ic('spark') + 'می‌توانید هر واژه‌ای را در کادر زیر ویرایش کنید؛ تغییرات شما هنگام کپی لحاظ خواهد شد:</div>' +
      '      <textarea id="modal-prompt-edit" class="modal-edit-textarea" dir="auto">' + h(formatted) + '</textarea>' +
      '    </div>' +
      '    <div class="modal-foot">' +
      '      <button type="button" class="btn btn-line" data-act="modal-close">بستن</button>' +
      '      <button type="button" class="btn btn-gold copy-modal-btn" data-act="copy-modal">' + ic('copy') + '<span class="btn-txt">کپی این متن</span></button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  }

  // ---------- صفحه‌ی پرامپت (ساده، متمرکز و بدون شلوغی) ----------
  function viewPrompt(r) {
    var c = byId[r.id];
    if (!c) { location.hash = '#/'; return; }
    document.title = c.title + ' · بانک پرامپت';
    var tool = B.tools.tools[c.tool];
    var tags = '<span class="tag cat-tag">' + h(catOf(c).title) + '</span>';
    if (tool && tool.first.length) tags += '<span class="tag">' + h(tool.label) + '</span>';
    if (c.privacy === 'red') tags += '<span class="tag red">' + ic('shield') + 'حساس: در چت موقت</span>';
    else if (c.privacy === 'yellow') tags += '<span class="tag amber">' + ic('shield') + 'داده‌ی کسب‌وکار</span>';
    else tags += '<span class="tag green">' + ic('shield') + 'داده‌ی عمومی</span>';

    var saved = isSaved(c.id);

    var html = '<div class="prompt-zen-container">' +
      '<a class="back" href="#/">' + ic('back') + 'همه‌ی پرامپت‌ها</a>' +
      '<div class="phead">' +
      '  <div class="phead-top">' +
      '    <div class="phead-title"><h1>' + h(c.title) + '</h1><span class="phead-id">' + fa(c.id) + '</span></div>' +
      '    <button type="button" class="btn-icon-save' + (saved ? ' active' : '') + '" data-act="toggle-save-prompt" title="' + (saved ? 'در پرامپت‌های ذخیره‌شده هست (برای حذف کلیک کنید)' : 'ذخیره این پرامپت با شخصی‌سازی‌های شما') + '" aria-label="ذخیره پرامپت">' +
      '      ' + ic('bookmark') +
      '    </button>' +
      '  </div>' +
      '  <p>' + h(c.desc) + '</p>' +
      '  <div class="tags">' + tags + '</div>' +
      '</div>' +
      simpleGuideHtml(c) +
      brandBarHtml(c) +
      '<section class="panel prompt-form-card">' +
      '  <div class="panel-head"><h2>اطلاعات و متغیرهای پرامپت</h2>' +
      '    <button class="link-btn muted" data-act="clear">پاک کردن فرم</button>' +
      '  </div>' +
      (c.fields.length ? c.fields.map(function (f) { return fieldHtml(c, f); }).join('') : '<p class="muted">این پرامپت متغیری ندارد و آماده‌ی کپی مستقیم است.</p>') +
      '</section>' +
      '<div class="prompt-actions-box">' +
      '  <div class="prompt-actions-grid">' +
      '    <button type="button" class="btn btn-gold copy-btn" data-act="copy" data-fmt="text" title="کپی مستقیم متن پرامپت آماده برای هوش مصنوعی">' +
      '      <span class="btn-ic">' + ic('text') + '</span><span class="btn-txt">کپی متن پرامپت</span>' +
      '    </button>' +
      '    <button type="button" class="btn btn-line copy-btn" data-act="copy" data-fmt="markdown" title="کپی با قالب‌بندی مارکداون">' +
      '      <span class="btn-ic">' + ic('markdown') + '</span><span class="btn-txt">کپی مارکداون</span>' +
      '    </button>' +
      '    <button type="button" class="btn btn-line copy-btn" data-act="copy" data-fmt="xml" title="کپی با تگ‌های ساختاریافته XML">' +
      '      <span class="btn-ic">' + ic('code') + '</span><span class="btn-txt">کپی XML</span>' +
      '    </button>' +
      '  </div>' +
      '  <div class="prompt-actions-bottom">' +
      '    <button type="button" class="btn-preview-modal" data-act="open-modal" title="مشاهده متن کامل پرامپت و ویرایش آزاد">' +
      '      ' + ic('edit') + '<span>مشاهده و ویرایش پرامپت</span>' +
      '    </button>' +
      '    <span class="missing-badge" id="miss"></span>' +
      '  </div>' +
      '</div>' +
      modalHtml(c) +
      '</div>'; // end prompt-zen-container

    main.innerHTML = html;
    autosize(main);
    refresh(c);
  }

  function refresh(c) {
    var p = build(c, false);
    var cleanFormatted = E.formatPrompt(p.text, c, currentFmt);
    cleanFormatted = injectBrandToText(cleanFormatted, c, currentFmt);
    var wc = cleanFormatted.split(/\s+/).filter(Boolean).length;

    var missEl = $('#miss');
    if (missEl) {
      missEl.textContent = p.missing.length ? '⚠️ فیلدهای خالی: ' + p.missing.join('، ') : '';
    }

    var editBox = $('#modal-prompt-edit');
    if (editBox && !editBox.dataset.userEdited) {
      editBox.value = cleanFormatted;
    }
    var wcEl = $('#modal-wc');
    if (wcEl) wcEl.textContent = fa(wc) + ' واژه';

    $$('#prompt-modal .format-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-fmt') === currentFmt);
    });
  }

  // ---------- ذخیره‌ها ----------
  function viewSaved() {
    document.title = 'ذخیره‌ها · بانک پرامپت';
    var total = S.saved.length;
    var html = '<section class="hero"><div class="eyebrow">روی همین دستگاه (' + fa(total) + ')</div><h1>پرامپت‌های ذخیره‌شده</h1><p>پرامپت‌هایی که شخصی‌سازی کرده و برای مراجعات بعدی نگه داشته‌اید.</p></section>';
    if (!S.saved.length) {
      html += '<div class="empty">' + ic('bookmark') + '<div>هنوز پرامپتی ذخیره نکرده‌اید. در صفحه هر پرامپت، آیکون بوکمارک بالای صفحه را بزنید تا در اینجا نگهداری شود.</div></div>';
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
          (card ? '    <button class="btn btn-line small" data-act="sopen" data-i="' + i + '">' + ic('edit') + '<span>ویرایش متغیرها</span></button>' : '') +
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

  function normalizeHex(c) {
    if (!c) return '#4A6B5D';
    c = String(c).trim();
    if (c[0] !== '#') c = '#' + c;
    if (/^#[0-9a-fA-F]{6}$/.test(c)) return c.toUpperCase();
    if (/^#[0-9a-fA-F]{3}$/.test(c)) {
      return ('#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]).toUpperCase();
    }
    return '#4A6B5D';
  }

  function getBrandColorsList() {
    if (Array.isArray(S.profile.brand_colors_list) && S.profile.brand_colors_list.length > 0) {
      return S.profile.brand_colors_list;
    }
    var str = S.profile.brand_colors;
    if (str && typeof str === 'string' && str.trim()) {
      var list = [];
      var re = /(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\s*(\([^)]*\)|[^,#\n\r]+)?/g;
      var m;
      while ((m = re.exec(str)) !== null) {
        var hx = normalizeHex(m[1]);
        var lbl = (m[2] || '').trim().replace(/^[\s(]+|[)\s]+$/g, '');
        list.push({ color: hx, label: lbl });
      }
      if (list.length > 0) {
        S.profile.brand_colors_list = list;
        return list;
      }
    }
    var def = [
      { color: '#4A6B5D', label: 'رنگ اصلی و سازمانی' },
      { color: '#E29578', label: 'دکمه و دعوت به اقدام (CTA)' },
      { color: '#F4EFEA', label: 'پس‌زمینه اسلاید و محتوا' }
    ];
    S.profile.brand_colors_list = def;
    syncBrandColorsString();
    return def;
  }

  function syncBrandColorsString() {
    var list = S.profile.brand_colors_list || [];
    var parts = list.map(function (item) {
      var c = normalizeHex(item.color);
      var l = (item.label || '').trim();
      return l ? c + ' (' + l + ')' : c;
    });
    S.profile.brand_colors = parts.join('، ');
    return S.profile.brand_colors;
  }

  function renderColorBuilder() {
    var list = getBrandColorsList();
    var rowsHtml = list.map(function (item, idx) {
      var hexVal = normalizeHex(item.color);
      return '<div class="color-row-item" data-idx="' + idx + '">' +
        '  <div class="color-picker-badge" style="background:' + hexVal + '" title="کلیک برای باز کردن طیف کامل رنگ">' +
        '    <span class="color-picker-icon">' + ic('spark') + '</span>' +
        '    <input type="color" class="native-color-input" value="' + hexVal + '" data-act="color-picker-change" data-idx="' + idx + '" aria-label="انتخاب از طیف رنگ">' +
        '  </div>' +
        '  <div class="color-hex-col">' +
        '    <input type="text" class="color-hex-input" value="' + hexVal + '" data-act="color-hex-change" data-idx="' + idx + '" maxlength="7" placeholder="#000000" aria-label="کد هگز رنگ">' +
        '    <button type="button" class="btn-spectrum-pill" data-act="open-spectrum" data-idx="' + idx + '">طیف 🎨</button>' +
        '  </div>' +
        '  <div class="color-label-col">' +
        '    <input type="text" class="color-label-input" value="' + h(item.label || '') + '" data-act="color-label-change" data-idx="' + idx + '" placeholder="کاربرد این رنگ (مثلاً: رنگ اصلی، دکمه CTA، پس‌زمینه...)" aria-label="کاربرد رنگ">' +
        '    <div class="role-chips-row">' +
        '      <span class="role-chip-hint">برچسب سریع:</span>' +
        '      <button type="button" class="role-chip-btn" data-act="set-role-chip" data-idx="' + idx + '" data-role="رنگ اصلی و سازمانی">اصلی</button>' +
        '      <button type="button" class="role-chip-btn" data-act="set-role-chip" data-idx="' + idx + '" data-role="دکمه و اقدام (CTA)">دکمه/CTA</button>' +
        '      <button type="button" class="role-chip-btn" data-act="set-role-chip" data-idx="' + idx + '" data-role="پس‌زمینه اسلاید و محتوا">پس‌زمینه</button>' +
        '      <button type="button" class="role-chip-btn" data-act="set-role-chip" data-idx="' + idx + '" data-role="تیترها و تأکید">تیتر/تأکید</button>' +
        '      <button type="button" class="role-chip-btn" data-act="set-role-chip" data-idx="' + idx + '" data-role="کادر و خطوط">کادر</button>' +
        '    </div>' +
        '  </div>' +
        '  <button type="button" class="btn-del-color" data-act="del-color-row" data-idx="' + idx + '" title="حذف این رنگ" aria-label="حذف این رنگ">' +
        ic('trash') +
        '  </button>' +
        '</div>';
    }).join('');

    var previewSegments = list.map(function (item) {
      return '<span class="color-live-segment" style="background:' + normalizeHex(item.color) + '" title="' + h((item.label ? item.label + ': ' : '') + item.color) + '"></span>';
    }).join('');

    var compiledStr = syncBrandColorsString();

    return '<div class="color-builder-box" id="brand-color-builder">' +
      '  <div class="color-builder-head">' +
      '    <div class="color-builder-title">' + ic('diamond') + '<span>رنگ‌های انتخاب‌شده در پالت برند من:</span></div>' +
      '    <p class="color-builder-desc">روی نشانگر هر رنگ یا دکمه «طیف 🎨» کلیک کنید تا طیف رنگ‌ها باز شود و بصری انتخاب کنید. می‌توانید برای هر رنگ برچسب نقش بنویسید یا رنگ تازه بیفزایید.</p>' +
      '  </div>' +
      '  <div class="color-rows-list" id="color-rows-list">' + rowsHtml + '</div>' +
      '  <div class="color-builder-foot">' +
      '    <button type="button" class="btn-add-color-row" data-act="add-color-row">' + ic('plus') + '<span>+ افزودن رنگ جدید به پالت</span></button>' +
      '    <div class="color-live-preview-box">' +
      '      <div class="color-live-preview-bar">' + previewSegments + '</div>' +
      '      <div class="color-compiled-text">خروجی هوشمند برای پرامپت‌ها و اسلایدها: <strong id="compiled-colors-label">' + h(compiledStr || '(هنوز رنگی انتخاب نشده)') + '</strong></div>' +
      '    </div>' +
      '  </div>' +
      '  <input type="hidden" id="b_brand_colors" data-b="brand_colors" value="' + h(compiledStr) + '">' +
      '</div>';
  }

  function updateColorLivePreview() {
    var list = getBrandColorsList();
    var pBar = $('.color-live-preview-bar');
    if (pBar) {
      pBar.innerHTML = list.map(function (item) {
        return '<span class="color-live-segment" style="background:' + normalizeHex(item.color) + '" title="' + h((item.label ? item.label + ': ' : '') + item.color) + '"></span>';
      }).join('');
    }
    var compLabel = $('#compiled-colors-label');
    var compiledStr = syncBrandColorsString();
    if (compLabel) {
      compLabel.textContent = compiledStr || '(هنوز رنگی انتخاب نشده)';
    }
    var hiddenInp = $('#b_brand_colors');
    if (hiddenInp) {
      hiddenInp.value = compiledStr;
    }
  }

  function brandField(f) {
    var v = S.profile[f.key] || '';
    var ph = f.example ? ' placeholder="' + h('مثلاً: ' + f.example) + '"' : '';

    if (f.key === 'brand_colors') {
      var palettesHtml = '<div class="preset-pills-row">' +
        '<span class="preset-pill-label">' + ic('spark') + 'بارگذاری پالت‌های پیشنهادی:</span>' +
        BRAND_PALETTES.map(function (pal) {
          return '<button type="button" class="preset-pill-btn" data-act="select-palette" data-pal="' + pal.id + '">' +
            '<span class="preset-pill-swatches">' +
            pal.hexes.map(function (hx) { return '<span class="preset-mini-dot" style="background:' + hx + '"></span>'; }).join('') +
            '</span>' +
            '<span>' + h(pal.name) + '</span>' +
            '</button>';
        }).join('') +
        '</div>';

      return '<div class="field">' +
        '  <label>' + h(f.label) + '</label>' +
        palettesHtml +
        renderColorBuilder() +
        '</div>';
    }

    if (f.key === 'brand_fonts') {
      var fontsHtml = '<div class="font-pills">' +
        BRAND_FONTS.map(function (fn) {
          var isF = (v || '').indexOf(fn) >= 0;
          return '<button type="button" class="font-pill' + (isF ? ' active' : '') + '" data-act="select-font" data-font="' + fn + '">' + fn + '</button>';
        }).join('') + '</div>';

      return '<div class="field">' +
        '  <label for="b_' + f.key + '">' + h(f.label) + '</label>' +
        fontsHtml +
        '  <input id="b_' + f.key + '" type="text" data-b="' + f.key + '" value="' + h(v) + '"' + ph + '>' +
        '</div>';
    }

    return '<div class="field"><label for="b_' + f.key + '">' + h(f.label) + '</label>' +
      '<textarea id="b_' + f.key + '" data-b="' + f.key + '" class="auto-grow" rows="2"' + ph + '>' + h(v) + '</textarea>' +
      '</div>';
  }

  function viewBrand() {
    document.title = 'برند من · بانک پرامپت';
    var prof = S.profile || {};
    var hasBrand = hasBrandConfigured();
    var statusText = hasBrand
      ? '✓ مشخصات برند شما ذخیره شده و در تمام پرامپت‌ها فعال است.'
      : 'مشخصات را بنویسید و دکمه‌ی ذخیره را بزنید (اطلاعات خودکار نیز روی همین مرورگر نگهداری می‌شود).';

    var html = '<div class="prompt-zen-container">' +
      '<section class="hero"><div class="eyebrow">یک بار ذخیره کنید · روی همین دستگاه</div>' +
      '<h1>برند من (هویت، تخصص و لحن کلامی)</h1>' +
      '<p>مشخصات تخصص، مخاطب و لحن کاری خود را در کادرهای زیر بنویسید؛ این اطلاعات خودکار به تمام پرامپت‌ها پیوست می‌شود و دیگر نیازی به تکرار ندارید.</p>' +
      '</section>' +
      '<div class="brand-save-card">' +
      '  <button type="button" class="btn btn-gold btn-save-brand" data-act="save-brand">' + ic('save') + '<span>ذخیره اطلاعات برند من روی این دستگاه</span></button>' +
      '  <div class="brand-save-status' + (hasBrand ? ' saved-active' : '') + '" id="brand-save-status">' + statusText + '</div>' +
      '</div>';

    B.brand.sections.forEach(function (s) {
      html += '<section class="panel bsec" style="margin-top:18px;"><div class="panel-head"><h2>' + h(s.title) + '</h2></div>' +
        '<p class="sub">' + h(s.sub) + '</p>' + s.fields.map(brandField).join('');
      if (s.id === 'brand') html += '<div class="swatches" id="sw"></div>';
      html += '</section>';
    });

    html += '<div class="brand-save-card bottom-save">' +
      '  <button type="button" class="btn btn-gold btn-save-brand" data-act="save-brand">' + ic('save') + '<span>ذخیره اطلاعات برند من روی این دستگاه</span></button>' +
      '  <div class="brand-save-status">تمام تغییرات بلافاصله روی همین مرورگر نگهداری می‌شود و هیچ نیازی به سرور نیست.</div>' +
      '</div>' +
      '<div class="row" style="margin-top:24px;"><button class="link-btn muted" data-act="wipe">پاک کردن همه‌ی داده‌های برند و فرم‌ها از این دستگاه</button></div>' +
      footHtml() +
      '</div>';

    main.innerHTML = html;
    autosize(main);
    refreshBrand();
  }

  function refreshBrand() {
    composeBrand();
    var sw = $('#sw');
    if (sw) {
      var colors = String(S.profile.brand_colors || '').match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [];
      sw.innerHTML = colors.map(function (c) {
        return '<button class="sw" data-act="swatch" data-c="' + c + '" style="background:' + c + '" title="کپی ' + c + '" aria-label="کپی رنگ ' + c + '"></button>';
      }).join('');
    }
  }

  // ---------- راهنما و قطب‌نما ----------
  function viewGuide() {
    document.title = 'راهنما و قطب‌نما · بانک پرامپت';
    var html = '<div class="prompt-zen-container">' +
      '<section class="hero"><div class="eyebrow">راهنمای کاربردی</div>' +
      '<h1>راهنمای انتخاب پرامپت<br><em>و ترکیب با هویت برند</em></h1>' +
      '<p>چطور پرامپت متناسب با نیازتان را پیدا کنید و با هویت برند خروجی‌های ملموس و بدون کلیشه بگیرید.</p></section>' +
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
      '</div>' + footHtml();

    main.innerHTML = html;
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

    if (act === 'dismiss-onboarding') {
      S.dismissedBrandPrompt = true;
      persist();
      viewHome(r);
      return;
    }

    if (act === 'open-spectrum') {
      var row = el.closest('.color-row-item');
      if (row) {
        var pi = row.querySelector('.native-color-input');
        if (pi) {
          if (typeof pi.showPicker === 'function') {
            try { pi.showPicker(); } catch (err) { pi.click(); }
          } else {
            pi.click();
          }
        }
      }
      return;
    }

    if (act === 'select-palette') {
      var palId = el.getAttribute('data-pal');
      var targetPal = BRAND_PALETTES.filter(function (p) { return p.id === palId; })[0];
      if (targetPal) {
        S.profile.brand_colors_list = JSON.parse(JSON.stringify(targetPal.items));
        syncBrandColorsString();
        persist();
        refreshBrand();
        var bBox = $('#brand-color-builder');
        if (bBox) {
          bBox.outerHTML = renderColorBuilder();
        }
        $$('.preset-pill-btn').forEach(function (pb) {
          pb.classList.toggle('active', pb.getAttribute('data-pal') === palId);
        });
        toast('🎨 پالت «' + targetPal.name + '» در سازنده رنگ بارگذاری شد');
      }
      return;
    }

    if (act === 'set-role-chip') {
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      var role = el.getAttribute('data-role');
      var list = getBrandColorsList();
      if (list[idx]) {
        list[idx].label = role;
        var row = el.closest('.color-row-item');
        if (row) {
          var li = row.querySelector('.color-label-input');
          if (li) li.value = role;
        }
        updateColorLivePreview();
        persist();
        toast('🏷️ برچسب «' + role + '» ثبت شد');
      }
      return;
    }

    if (act === 'add-color-row') {
      var list = getBrandColorsList();
      var extraColors = ['#2563EB', '#D97706', '#059669', '#7C3AED', '#DB2777', '#4F46E5', '#0D9488'];
      var chosen = extraColors[list.length % extraColors.length];
      list.push({ color: chosen, label: 'رنگ تأکید / کاربرد ویژه' });
      syncBrandColorsString();
      persist();
      refreshBrand();
      var bBox = $('#brand-color-builder');
      if (bBox) {
        bBox.outerHTML = renderColorBuilder();
      }
      toast('➕ رنگ جدید اضافه شد؛ روی نشانگر رنگ یا دکمه «طیف 🎨» کلیک کنید');
      return;
    }

    if (act === 'del-color-row') {
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      var list = getBrandColorsList();
      if (list.length <= 1) {
        toast('حداقل یک رنگ باید در پالت باقی بماند');
        return;
      }
      list.splice(idx, 1);
      syncBrandColorsString();
      persist();
      refreshBrand();
      var bBox = $('#brand-color-builder');
      if (bBox) {
        bBox.outerHTML = renderColorBuilder();
      }
      toast('🗑️ رنگ از پالت حذف شد');
      return;
    }

    if (act === 'select-font') {
      var fn = el.getAttribute('data-font');
      S.profile.brand_fonts = fn;
      var fInp = $('#b_brand_fonts');
      if (fInp) fInp.value = fn;
      persist();
      $$('.font-pill').forEach(function (fp) {
        fp.classList.toggle('active', fp.getAttribute('data-font') === fn);
      });
      toast('✍️ فونت «' + fn + '» انتخاب شد');
      return;
    }

    if (act === 'save-brand') {
      $$('[data-b]').forEach(function (inp) {
        var bk = inp.getAttribute('data-b');
        S.profile[bk] = inp.value;
      });
      syncBrandColorsString();
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

    if (act === 'toggle-brand-inject') {
      S.brandInject = el.checked;
      persist();
      if (c) refresh(c);
      return;
    }

    if (act === 'toggle-save-prompt') {
      var sIdx = -1;
      for (var i = 0; i < S.saved.length; i++) {
        if (S.saved[i].id === c.id) { sIdx = i; break; }
      }
      if (sIdx >= 0) {
        S.saved.splice(sIdx, 1);
        el.classList.remove('active');
        toast('از پرامپت‌های ذخیره‌شده حذف شد');
      } else {
        var p = build(c, false);
        var fullText = E.formatPrompt(p.text, c, currentFmt);
        fullText = injectBrandToText(fullText, c, currentFmt);
        S.saved.unshift({
          id: c.id,
          title: c.title,
          text: fullText,
          vals: JSON.parse(JSON.stringify(own(c))),
          fmt: currentFmt,
          at: Date.now()
        });
        el.classList.add('active');
        toast('💾 پرامپت شخصی‌سازی‌شده در ذخیره‌ها نگهداری شد');
      }
      persist();
      renderNav();
      return;
    }

    if (act === 'open-modal') {
      var m = $('#prompt-modal');
      if (m) {
        var editArea = $('#modal-prompt-edit');
        if (editArea) {
          var p = build(c, false);
          var fullText = E.formatPrompt(p.text, c, currentFmt);
          fullText = injectBrandToText(fullText, c, currentFmt);
          editArea.value = fullText;
          editArea.dataset.userEdited = '';
        }
        m.classList.add('open');
      }
      return;
    }

    if (act === 'modal-close') {
      var m = $('#prompt-modal');
      if (m) m.classList.remove('open');
      return;
    }

    if (act === 'modal-fmt') {
      currentFmt = el.getAttribute('data-fmt') || 'text';
      S.fmt = currentFmt;
      persist();
      var editArea = $('#modal-prompt-edit');
      if (editArea) {
        var p = build(c, false);
        var fullText = E.formatPrompt(p.text, c, currentFmt);
        fullText = injectBrandToText(fullText, c, currentFmt);
        editArea.value = fullText;
        var wc = fullText.split(/\s+/).filter(Boolean).length;
        var wcEl = $('#modal-wc');
        if (wcEl) wcEl.textContent = fa(wc) + ' واژه';
      }
      $$('#prompt-modal .format-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-fmt') === currentFmt);
      });
      return;
    }

    if (act === 'copy-modal') {
      var editArea = $('#modal-prompt-edit');
      var textToCopy = editArea ? editArea.value : '';
      var btnTxt = $('.btn-txt', el);
      var oldTxt = btnTxt ? btnTxt.textContent : '';

      copyText(textToCopy).then(function (ok) {
        if (!ok) { toast('کپی انجام نشد'); return; }
        if (btnTxt) btnTxt.textContent = 'کپی شد ✓';
        setTimeout(function () { if (btnTxt) btnTxt.textContent = oldTxt; }, 1500);
        toast('📋 پرامپت با موفقیت کپی شد');
      });
      return;
    }

    if (act === 'copy') {
      var fmt = el.getAttribute('data-fmt') || currentFmt || 'text';
      currentFmt = fmt;
      S.fmt = currentFmt;
      persist();

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
          ? fmtName + ' کپی شد · ' + fa(p.missing.length) + ' فیلد هنوز خالی است'
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

    if (act === 'clear') {
      var cleared = {};
      c.fields.forEach(function (f) { cleared[f.key] = (f.type === 'multi' || f.type === 'repeat') ? [] : ''; });
      S.vals[c.id] = cleared;
      persist();
      viewPrompt(r);
      toast('فیلدها پاک شدند');
      return;
    }

    if (act === 'sopen') {
      var s = S.saved[+el.getAttribute('data-i')];
      S.vals[s.id] = s.vals;
      persist();
      location.hash = '#/p/' + s.id;
      return;
    }

    if (act === 'sdel') {
      S.saved.splice(+el.getAttribute('data-i'), 1);
      persist();
      renderNav();
      viewSaved();
      toast('پرامپت از ذخیره‌ها حذف شد');
      return;
    }

    if (act === 'wipe') {
      if (!confirm('همه‌ی داده‌های شخصی شما (برند من، فرم‌ها و ذخیره‌ها) از این مرورگر پاک شود؟')) return;
      S = { profile: {}, vals: {}, saved: [], theme: S.theme, fmt: 'text', brandInject: true };
      persist();
      render();
      toast('داده‌ها با موفقیت پاک شدند');
      return;
    }

    if (act === 'export') {
      var blob = new Blob([JSON.stringify({ app: 'prompt-bank', v: 2, data: S }, null, 1)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'prompt-bank-backup.json';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
      return;
    }
  });

  // کلیدهای میان‌بر کیبورد
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var m = $('#prompt-modal');
      if (m && m.classList.contains('open')) {
        m.classList.remove('open');
        return;
      }
      var qi = $('#q');
      if (qi && document.activeElement === qi && qi.value) {
        qi.value = ''; home.q = ''; results();
        var clr = $('#q-clear'); if (clr) clr.style.display = 'none';
      }
    } else if (e.key === '/' && document.activeElement && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      var qi = $('#q');
      if (qi) { e.preventDefault(); qi.focus(); qi.select(); }
    }
  });

  document.addEventListener('input', onEdit);
  document.addEventListener('change', onEdit);
  function onEdit(e) {
    var el = e.target, r = parse();
    if (el.tagName === 'TEXTAREA') {
      el.style.height = 'auto';
      el.style.height = (el.scrollHeight + 2) + 'px';
      if (el.id === 'modal-prompt-edit') {
        el.dataset.userEdited = 'true';
      }
    }
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
    if (el.getAttribute('data-act') === 'color-picker-change') {
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      var val = el.value.toUpperCase();
      var list = getBrandColorsList();
      if (list[idx]) {
        list[idx].color = val;
        var badge = el.closest('.color-picker-badge');
        if (badge) badge.style.backgroundColor = val;
        var row = el.closest('.color-row-item');
        if (row) {
          var hi = row.querySelector('.color-hex-input');
          if (hi) hi.value = val;
        }
        updateColorLivePreview();
        persist();
        refreshBrand();
      }
      return;
    }
    if (el.getAttribute('data-act') === 'color-hex-change') {
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      var val = el.value.trim();
      var list = getBrandColorsList();
      if (list[idx]) {
        if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
          var norm = normalizeHex(val);
          list[idx].color = norm;
          var row = el.closest('.color-row-item');
          if (row) {
            var b = row.querySelector('.color-picker-badge');
            if (b) b.style.backgroundColor = norm;
            var pi = row.querySelector('.native-color-input');
            if (pi) pi.value = norm;
          }
          updateColorLivePreview();
          persist();
          refreshBrand();
        }
      }
      return;
    }
    if (el.getAttribute('data-act') === 'color-label-change') {
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      var val = el.value;
      var list = getBrandColorsList();
      if (list[idx]) {
        list[idx].label = val;
        updateColorLivePreview();
        persist();
      }
      return;
    }
    if (el.hasAttribute('data-b')) {
      var bk = el.getAttribute('data-b');
      S.profile[bk] = el.value;
      persist();
      refreshBrand();
      return;
    }
    if (el.hasAttribute('data-k') && r.view === 'p') {
      var c = byId[r.id], k = el.getAttribute('data-k');
      var f = c.fields.filter(function (x) { return x.key === k; })[0];
      var o = S.vals[c.id] = S.vals[c.id] || {};
      if (f.type === 'multi') o[k] = $$('[data-k="' + k + '"]').filter(function (t) { return t.checked; }).map(function (t) { return f.options[+t.getAttribute('data-i')].value; });
      else o[k] = el.value;
      persist();
      refresh(c);
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
