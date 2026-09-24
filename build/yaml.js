'use strict';
/*
 * پارسر زیرمجموعه‌ای از YAML برای مشخصات بالای فایل کارت‌ها، بدون وابستگی خارجی.
 * پشتیبانی: key: value، فهرست و نگاشت تورفته، [فهرست درون‌خطی]، {نگاشت درون‌خطی}،
 * رشته‌ی نقل‌قول‌دار، و متن چندخطی با |. توضیح فقط در خطی که با # شروع شود
 * (# وسط خط توضیح نیست، تا کد رنگ مثل #7A1F2B خراب نشود).
 */

function YamlError(msg, line) {
  const e = new Error(`YAML خط ${line + 1}: ${msg}`);
  e.line = line;
  return e;
}

function indentOf(s) {
  const m = /^ */.exec(s);
  return m[0].length;
}

function isBlank(s) {
  return /^\s*$/.test(s) || /^\s*#/.test(s);
}

function splitTop(s) {
  // جدا کردن با ویرگول در سطح بالا، با رعایت نقل‌قول و براکت
  const out = [];
  let depth = 0, q = null, cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      cur += c;
      if (c === '\\' && q === '"') { cur += s[++i] || ''; continue; }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '[' || c === '{') depth++;
    if (c === ']' || c === '}') depth--;
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim() !== '') out.push(cur);
  return out.map((x) => x.trim()).filter((x) => x !== '');
}

function scalar(raw, line) {
  const s = raw.trim();
  if (s === '') return '';
  if (s[0] === '"') {
    try { return JSON.parse(s); } catch (e) { throw YamlError('رشته‌ی نقل‌قول‌دار نامعتبر: ' + s, line); }
  }
  if (s[0] === "'") {
    if (s[s.length - 1] !== "'") throw YamlError('نقل‌قول بسته نشده: ' + s, line);
    return s.slice(1, -1).replace(/''/g, "'");
  }
  if (s[0] === '[') {
    if (s[s.length - 1] !== ']') throw YamlError('فهرست درون‌خطی بسته نشده', line);
    return splitTop(s.slice(1, -1)).map((x) => scalar(x, line));
  }
  if (s[0] === '{') {
    if (s[s.length - 1] !== '}') throw YamlError('نگاشت درون‌خطی بسته نشده', line);
    const obj = {};
    splitTop(s.slice(1, -1)).forEach((pair) => {
      const m = /^([A-Za-z_@][\w.-]*)\s*:\s*(.*)$/.exec(pair);
      if (!m) throw YamlError('جفت نامعتبر در نگاشت: ' + pair, line);
      obj[m[1]] = scalar(m[2], line);
    });
    return obj;
  }
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  return s;
}

const KEY = /^([A-Za-z_@][\w.-]*)\s*:(?:\s+(.*)|\s*)$/;

function parse(text) {
  const lines = text.replace(/\r\n?/g, '\n').replace(/\t/g, '  ').split('\n');
  let i = 0;

  function skip() { while (i < lines.length && isBlank(lines[i])) i++; }

  function blockScalar(parentIndent) {
    const buf = [];
    let base = -1;
    while (i < lines.length) {
      const l = lines[i];
      if (/^\s*$/.test(l)) { buf.push(''); i++; continue; }
      const ind = indentOf(l);
      if (ind <= parentIndent) break;
      if (base < 0) base = ind;
      buf.push(l.slice(Math.min(base, ind)));
      i++;
    }
    return buf.join('\n').replace(/\s+$/, '');
  }

  function value(rest, keyIndent, lineNo) {
    if (rest === undefined || rest.trim() === '') {
      skip();
      if (i >= lines.length) return null;
      const ind = indentOf(lines[i]);
      const isItem = /^\s*-(\s|$)/.test(lines[i]);
      if (ind > keyIndent || (ind === keyIndent && isItem)) return block(ind);
      return null;
    }
    const r = rest.trim();
    if (r === '|' || r === '|-' || r === '>') return blockScalar(keyIndent);
    return scalar(r, lineNo);
  }

  function block(indent) {
    skip();
    if (i >= lines.length) return null;
    return /^\s*-(\s|$)/.test(lines[i]) ? list(indent) : map(indent);
  }

  function map(indent) {
    const obj = {};
    while (true) {
      skip();
      if (i >= lines.length) break;
      const l = lines[i];
      const ind = indentOf(l);
      if (ind < indent) break;
      if (ind > indent) throw YamlError('تورفتگی نابجا', i);
      if (/^\s*-(\s|$)/.test(l)) break;
      const m = KEY.exec(l.slice(ind));
      if (!m) throw YamlError('انتظار «کلید: مقدار»: ' + l.trim(), i);
      const lineNo = i;
      i++;
      if (Object.prototype.hasOwnProperty.call(obj, m[1])) throw YamlError('کلید تکراری: ' + m[1], lineNo);
      obj[m[1]] = value(m[2], ind, lineNo);
    }
    return obj;
  }

  function list(indent) {
    const arr = [];
    while (true) {
      skip();
      if (i >= lines.length) break;
      const l = lines[i];
      const ind = indentOf(l);
      if (ind < indent) break;
      if (ind > indent) throw YamlError('تورفتگی نابجا در فهرست', i);
      const m = /^(\s*)-(?:\s+(.*)|\s*)$/.exec(l);
      if (!m) break;
      const content = m[2] || '';
      const lineNo = i;
      if (content.trim() === '') {
        i++;
        arr.push(value('', ind, lineNo));
        continue;
      }
      const first = content.trim()[0];
      if (first !== '"' && first !== "'" && first !== '[' && first !== '{' && KEY.test(content)) {
        // نگاشتی که با «- کلید:» شروع می‌شود
        lines[i] = ' '.repeat(ind + 2) + content;
        arr.push(map(ind + 2));
        continue;
      }
      i++;
      if (content.trim() === '|' || content.trim() === '|-') arr.push(blockScalar(ind));
      else arr.push(scalar(content, lineNo));
    }
    return arr;
  }

  skip();
  if (i >= lines.length) return {};
  const out = map(0);
  skip();
  if (i < lines.length) throw YamlError('متن اضافه بعد از پایان', i);
  return out;
}

module.exports = { parse };
