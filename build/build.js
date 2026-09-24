#!/usr/bin/env node
'use strict';
/*
 * ساخت بانک پرامپت.
 *   node build/build.js          بررسی و ساخت dist/
 *   node build/build.js --check  فقط بررسی
 */
const fs = require('fs');
const path = require('path');
const yaml = require('./yaml');
const qr = require('./qr');
const png = require('./png');
const E = require('../app/engine');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const config = readJson('bank.config.json');
const tools = readJson('data/tools.json');
const personas = readJson('data/personas.json');
delete personas._note;
const categories = readJson('data/categories.json');
const brand = readJson('data/brand.json');
const search = readJson('data/search.json');

const errors = [];
const warnings = [];
const err = (id, m) => errors.push(`${id}: ${m}`);
const warn = (id, m) => warnings.push(`${id}: ${m}`);

// کلیدهای پروفایل: فیلدهای «برند من» و متن‌های ساخته‌شده‌ی آن
const profileKeys = new Set();
brand.sections.forEach((s) => {
  s.fields.forEach((f) => profileKeys.add(f.key));
  if (s.compose) profileKeys.add(s.compose);
});

// قطعه‌های مشترک
const fenced = (s) => { const m = /```[^\n]*\n([\s\S]*?)\n```/.exec(s); return m ? m[1] : null; };
const partials = {};
fs.readdirSync(path.join(ROOT, 'cards/_partials')).filter((f) => f.endsWith('.md')).forEach((f) => {
  partials[f.replace(/\.md$/, '')] = fenced(fs.readFileSync(path.join(ROOT, 'cards/_partials', f), 'utf8')) || '';
});
const withPartials = (t, id) => t.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (m, n) => {
  if (!(n in partials)) { err(id, `قطعه‌ی ناموجود ${n}`); return ''; }
  return withPartials(partials[n], id);
});

const catOf = {};
categories.forEach((c) => c.cards.forEach((id) => {
  if (catOf[id]) err(id, `در دو دسته آمده: ${catOf[id]} و ${c.id}`);
  catOf[id] = c.id;
}));

/*
 * قالب‌ها در فایل با خط‌های کوتاه نوشته شده‌اند تا خوانا باشند؛ پرامپت نهایی نباید وسط جمله خط بشکند.
 * خط بعدی به خط قبل می‌چسبد، مگر خط قبل با نشانه‌ی پایان جمله، دونقطه یا برچسب تمام شود،
 * یا خط بعدی خالی، مورد فهرست، شماره، تگ XML یا برچسب قالب باشد.
 */
function unwrap(t) {
  const out = [];
  t.split('\n').forEach((l) => {
    const prev = out.length ? out[out.length - 1] : null;
    const cont = /^\s+\S/.test(l) && !/^\s*[-*•]/.test(l);
    const startsBlock = /^\s*$|^\s*[-*•]\s|^\s*[0-9۰-۹]+[.)]\s|^\s*</.test(l) || /^\s*\{\{/.test(l) || /^\s*[^\s:]{1,20}:\s/.test(l);
    const prevOpen = prev !== null && prev.trim() !== '' && !/[.:؛!?؟»>}\]]\s*$/.test(prev);
    if (prevOpen && (cont || !startsBlock)) out[out.length - 1] = prev.replace(/\s+$/, '') + ' ' + l.trim();
    else out.push(l);
  });
  return out.join('\n');
}
function words(s) { return String(s).replace(/\{\{[^}]*\}\}/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; }
function hasPhrase(text, p) {
  return new RegExp(`(^|[^\\p{L}\\u200c])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\u200c])`, 'u').test(text);
}

const cards = [];
const files = fs.readdirSync(path.join(ROOT, 'cards')).filter((f) => f.endsWith('.md')).sort();
files.forEach((file) => {
  const src = fs.readFileSync(path.join(ROOT, 'cards', file), 'utf8').replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!m) { err(file, 'مشخصات بالای فایل پیدا نشد'); return; }
  let f;
  try { f = yaml.parse(m[1]); } catch (e) { err(file, e.message); return; }
  const id = f.id || file;
  if (file !== `${f.id}.md`) err(file, `نام فایل باید ${f.id}.md باشد`);
  const sec = {};
  const parts = m[2].split(/^## +(.+)$/m);
  for (let i = 1; i < parts.length; i += 2) sec[parts[i].trim()] = parts[i + 1].trim();

  if (!f.title) err(id, 'عنوان ندارد');
  if (!catOf[id]) err(id, 'در هیچ دسته‌ای در data/categories.json نیست');
  if (f.category !== catOf[id]) err(id, `دسته‌ی فایل (${f.category}) با categories.json (${catOf[id]}) یکی نیست`);
  if (!['prompt', 'addon'].includes(f.type)) err(id, `نوع نامعتبر: ${f.type}`);
  if (f.tool && !tools.tools[f.tool]) err(id, `ابزار ناموجود: ${f.tool}`);
  if (!['green', 'yellow', 'red'].includes(f.privacy)) err(id, 'رنگ رازداری نامعتبر');
  const desc = (sec['کاربرد'] || '').replace(/\s+/g, ' ').trim();
  if (!desc) err(id, 'بخش «کاربرد» ندارد');
  if (words(desc) > 22) warn(id, 'توضیح بیش از یک خط است');

  const fields = f.fields || [];
  const keys = new Set();
  fields.forEach((fl) => {
    if (keys.has(fl.key)) err(id, `فیلد تکراری ${fl.key}`);
    keys.add(fl.key);
    fl.type = fl.type || 'text';
    (fl.options || []).forEach((o, j) => { if (typeof o === 'string') fl.options[j] = { label: o, value: o }; });
    if (fl.profile && !profileKeys.has(fl.profile)) err(id, `کلید «برند من» ناموجود: ${fl.profile}`);
  });

  let template = fenced(sec['قالب'] || '');
  if (template === null) { err(id, 'قالب ندارد'); return; }
  template = unwrap(withPartials(template, id));
  let used = [];
  try { used = E.keysOf(template); } catch (e) { err(id, 'قالب: ' + e.message); }
  used.forEach((k) => { if (!keys.has(k)) err(id, `{{${k}}} فیلد ندارد`); });
  fields.forEach((fl) => { if (!used.includes(fl.key)) warn(id, `فیلد ${fl.key} در قالب استفاده نشده`); });
  E.leftovers(template.replace(/\{\{[^}]*\}\}/g, ''), f.allow_brackets || []).forEach((x) => err(id, x));
  if (!f.long && words(template) > config.template_word_limit) warn(id, `قالب ${words(template)} واژه است`);
  if (!f.forbidden_ok) config.forbidden_phrases.concat(config.forbidden_words).forEach((p) => { if (hasPhrase(template, p)) err(id, `واژه‌ی ممنوعه: ${p}`); });
  if (f.privacy === 'red' && f.tool !== 'sensitive') err(id, 'پرامپت حساس باید ابزار sensitive داشته باشد');
  const gloss = sec['ترجمه برای خودتان'] ? unwrap(fenced(sec['ترجمه برای خودتان'])) : null;

  // نمونه‌ها واقعاً ساخته می‌شوند (بعد از باز کردن شکست‌های خط)
  Object.keys(f.examples || {}).forEach((p) => {
    if (!personas[p]) { err(id, `نمونه‌ی ناشناخته ${p}`); return; }
    const vals = {};
    fields.forEach((fl) => {
      let v = f.examples[p][fl.key];
      if (v === undefined && fl.profile) v = personas[p].profile[fl.profile];
      vals[fl.key] = v === undefined ? fl.default : v;
      if (fl.type === 'select' && vals[fl.key] !== undefined && !fl.options.some((o) => o.value === vals[fl.key])) err(id, `نمونه‌ی ${p}: گزینه‌ی ناموجود برای ${fl.key}`);
    });
    try { E.leftovers(E.render(template, vals, {}, { lang: f.lang_out }), f.allow_brackets || []).forEach((x) => warn(id, `نمونه‌ی ${p}: ${x}`)); }
    catch (e) { err(id, e.message); }
  });

  cards.push({
    id, title: f.title, category: f.category, type: f.type, tool: f.tool || 'any', privacy: f.privacy,
    desc, template, gloss, fields, examples: f.examples || {}, lang_out: f.lang_out, allow_brackets: f.allow_brackets,
    tags: f.tags || [], link: f.link || '',
  });
});
categories.forEach((c) => c.cards.forEach((id) => { if (!cards.find((x) => x.id === id)) err(c.id, `پرامپت ${id} فایل ندارد`); }));

console.log(`پرامپت‌ها: ${cards.length}، دسته‌ها: ${categories.length}، خطا: ${errors.length}، هشدار: ${warnings.length}`);
errors.forEach((e) => console.log('  ✗ ' + e));
warnings.forEach((w) => console.log('  ! ' + w));
if (errors.length) process.exit(1);
if (CHECK_ONLY) process.exit(0);

// ---------- خروجی ----------
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
fs.readdirSync(DIST).forEach((f) => fs.rmSync(path.join(DIST, f), { recursive: true, force: true }));
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };
['index.html', 'app.js', 'engine.js', 'style.css', 'manifest.webmanifest', 'icons/icon.svg'].forEach((f) => copy(path.join(ROOT, 'app', f), path.join(DIST, f)));
const fonts = fs.readdirSync(path.join(ROOT, 'app/fonts')).filter((f) => f.endsWith('.woff2'));
fonts.forEach((f) => copy(path.join(ROOT, 'app/fonts', f), path.join(DIST, 'fonts', f)));
fs.writeFileSync(path.join(DIST, 'icons/icon-192.png'), png.icon(192));
fs.writeFileSync(path.join(DIST, 'icons/icon-512.png'), png.icon(512));
fs.writeFileSync(path.join(DIST, 'qr.svg'), qr.toSvg(config.base_url, { label: config.title }));

const order = {};
categories.forEach((c) => c.cards.forEach((id, i) => { order[id] = i; }));
cards.sort((a, b) => categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category) || order[a.id] - order[b.id]);
fs.writeFileSync(path.join(DIST, 'cards.json'), JSON.stringify({
  version: config.version, base_url: config.base_url,
  categories: categories.map((c) => ({ id: c.id, title: c.title, icon: c.icon })),
  tools: { apps: tools.apps, tools: tools.tools }, personas, brand, synonyms: search.synonyms, cards,
}));

const precache = ['./', 'index.html', 'app.js', 'engine.js', 'style.css', 'cards.json', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', ...fonts.map((f) => 'fonts/' + f)];
fs.writeFileSync(path.join(DIST, 'sw.js'), fs.readFileSync(path.join(ROOT, 'app/sw.js'), 'utf8')
  .replace('__VERSION__', config.version).replace('__FILES__', JSON.stringify(precache)));

// نسخه‌ی چاپی (پشتیبان): همه‌ی پرامپت‌ها با جای خالی
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function printable(c) {
  const lab = {};
  c.fields.forEach((fl) => { lab[fl.key] = fl.label; });
  return c.template.replace(/\{\{[#^/][^}]*\}\}/g, '').replace(/\{\{\s*\.\s*\}\}/g, '[…]').replace(/\{\{\s*@n\s*\}\}/g, '')
    .replace(/\{\{\s*(\w+)(?::label)?\s*\}\}/g, (m, k) => `[${lab[k] || k}]`).replace(/\n{3,}/g, '\n\n').trim();
}
let html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${esc(config.title)}</title><style>
@font-face{font-family:V;src:url(fonts/Vazirmatn-Regular.woff2)}@font-face{font-family:V;src:url(fonts/Vazirmatn-Bold.woff2);font-weight:700}
body{font-family:V,Tahoma,sans-serif;margin:0;padding:12mm;color:#111;line-height:1.8;font-size:10.5pt}h1{margin:0 0 4mm}h2{border-bottom:2px solid #b8863b;padding-bottom:2mm;page-break-before:always}h2:first-of-type{page-break-before:auto}
section{page-break-inside:avoid;margin:5mm 0}h3{margin:0}p{margin:0 0 2mm;color:#555}pre{white-space:pre-wrap;font-family:inherit;background:#f6f3ec;border-radius:4px;padding:3mm;margin:0;unicode-bidi:plaintext}@page{size:A4;margin:10mm}
</style></head><body><h1>${esc(config.title)}</h1><p>${cards.length} پرامپت · متن داخل [کروشه] جای خالی است.</p>`;
categories.forEach((cat) => {
  html += `<h2>${esc(cat.title)}</h2>`;
  cards.filter((c) => c.category === cat.id).forEach((c) => { html += `<section><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><pre>${esc(printable(c))}</pre></section>`; });
});
fs.writeFileSync(path.join(DIST, 'print.html'), html + '</body></html>');

const size = ['index.html', 'app.js', 'engine.js', 'style.css', 'cards.json', ...fonts.map((f) => 'fonts/' + f)].reduce((s, f) => s + fs.statSync(path.join(DIST, f)).size, 0);
console.log(`dist آماده شد (${Math.round(size / 1024)} کیلوبایت)`);
