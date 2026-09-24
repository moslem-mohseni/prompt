/*
 * موتور مشترک بانک پرامپت: ساختن پرامپت از قالب، یکسان‌سازی متن برای جست‌وجو و ارقام.
 * هم در مرورگر (window.BankEngine) و هم در اسکریپت ساخت (require) استفاده می‌شود،
 * تا چیزی که اسکریپت ساخت بررسی می‌کند همان چیزی باشد که روی گوشی ساخته می‌شود.
 *
 * نحو قالب:
 *   {{key}}            مقدار فیلد (برای انتخاب: مقدار؛ برای چندانتخابی: با «، » جدا)
 *   {{key:label}}      برچسبی که کاربر دیده (برای ترجمه‌ی فارسی پرامپت انگلیسی)
 *   {{#key}}...{{/key}} اگر خالی باشد حذف می‌شود؛ اگر فهرست باشد برای هر مورد تکرار می‌شود
 *   {{^key}}...{{/key}} فقط وقتی خالی است نمایش داده می‌شود
 *   {{.}}  {{@n}}       مورد جاری و شماره‌ی آن (از ۱) داخل تکرار
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BankEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var AR = '٠١٢٣٤٥٦٧٨٩';

  function toFa(s) {
    return String(s).replace(/[0-9]/g, function (d) { return FA[+d]; });
  }
  function toEn(s) {
    return String(s)
      .replace(/[۰-۹]/g, function (d) { return String(FA.indexOf(d)); })
      .replace(/[٠-٩]/g, function (d) { return String(AR.indexOf(d)); });
  }

  // ---------- قالب ----------
  var TAG = /\{\{\s*([#^\/]?)\s*([^{}]*?)\s*\}\}/g;

  function parse(src) {
    // مثل Mustache: برچسب بخشی که تنها روی خط خودش است، خط خالی به جا نمی‌گذارد
    src = String(src).replace(/^[ \t]*(\{\{\s*[#^\/][^{}]*\}\})[ \t]*\r?\n/gm, '$1');
    var rootNode = { children: [] };
    var stack = [rootNode];
    var last = 0;
    var m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(src))) {
      var top = stack[stack.length - 1];
      if (m.index > last) top.children.push({ t: 'text', v: src.slice(last, m.index) });
      last = TAG.lastIndex;
      var sigil = m[1];
      var name = m[2];
      if (sigil === '#' || sigil === '^') {
        var node = { t: 'section', name: name, inverted: sigil === '^', children: [] };
        top.children.push(node);
        stack.push(node);
      } else if (sigil === '/') {
        if (stack.length < 2 || stack[stack.length - 1].name !== name) {
          throw new Error('بستن نابجای بخش: ' + name);
        }
        stack.pop();
      } else {
        var parts = name.split(':');
        top.children.push({ t: 'var', name: parts[0], mod: parts[1] || '' });
      }
    }
    if (stack.length > 1) throw new Error('بخش بسته‌نشده: ' + stack[stack.length - 1].name);
    if (last < src.length) rootNode.children.push({ t: 'text', v: src.slice(last) });
    return rootNode.children;
  }

  // همه‌ی نام‌هایی که قالب به آن‌ها ارجاع می‌دهد (برای بررسی در اسکریپت ساخت)
  function keysOf(src) {
    var out = {};
    (function walk(nodes) {
      nodes.forEach(function (n) {
        if (n.t === 'var' && n.name !== '.' && n.name.charAt(0) !== '@') out[n.name] = true;
        if (n.t === 'section') { out[n.name] = true; walk(n.children); }
      });
    })(parse(src));
    return Object.keys(out);
  }

  function isEmpty(v) {
    if (v === undefined || v === null || v === false) return true;
    if (Array.isArray(v)) return v.filter(function (x) { return !isEmpty(x); }).length === 0;
    return String(v).trim() === '';
  }

  function lookup(scopes, name) {
    for (var i = scopes.length - 1; i >= 0; i--) {
      var s = scopes[i];
      if (s && Object.prototype.hasOwnProperty.call(s, name)) return s[name];
    }
    return undefined;
  }

  function show(v) {
    if (Array.isArray(v)) return v.filter(function (x) { return !isEmpty(x); }).join('، ');
    return v === undefined || v === null ? '' : String(v);
  }

  function renderNodes(nodes, scopes, labels, fa) {
    var out = '';
    nodes.forEach(function (n) {
      if (n.t === 'text') { out += n.v; return; }
      if (n.t === 'var') {
        var v;
        if (n.name === '.') v = lookup(scopes, '.');
        else if (n.name === '@n') { v = lookup(scopes, '@n'); v = fa ? toFa(v) : v; }
        else if (n.mod === 'label') v = labels[n.name] !== undefined ? labels[n.name] : lookup(scopes, n.name);
        else v = lookup(scopes, n.name);
        out += show(v);
        return;
      }
      // section
      var val = n.name === '.' ? lookup(scopes, '.') : lookup(scopes, n.name);
      var empty = isEmpty(val);
      if (n.inverted) { if (empty) out += renderNodes(n.children, scopes, labels, fa); return; }
      if (empty) return;
      if (Array.isArray(val)) {
        var items = val.filter(function (x) { return !isEmpty(x); });
        items.forEach(function (item, i) {
          out += renderNodes(n.children, scopes.concat([{ '.': item, '@n': i + 1 }]), labels, fa);
        });
      } else {
        out += renderNodes(n.children, scopes.concat([{ '.': val }]), labels, fa);
      }
    });
    return out;
  }

  function tidy(s) {
    return s
      .split('\n').map(function (l) { return l.replace(/[ \t]+$/g, ''); }).join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+\n/, '')
      .trim();
  }

  /*
   * values: {key: string | string[]}
   * labels: {key: string | string[]}  (برچسب گزینه‌های انتخاب‌شده)
   */
  function render(src, values, labels, opts) {
    opts = opts || {};
    var fa = opts.lang !== 'en';
    return tidy(renderNodes(parse(src), [values || {}], labels || {}, fa));
  }

  // نشانه‌های جای خالی که بعد از ساختن باقی مانده‌اند
  function leftovers(text, allow) {
    var issues = [];
    if (/\{\{|\}\}/.test(text)) issues.push('نشانه‌ی {{ در متن مانده است');
    var allowed = (allow || []).map(function (a) { return a.replace(/[\[\]]/g, ''); });
    var re = /\[([^\]\n]{0,60})\]/g;
    var m;
    while ((m = re.exec(text))) {
      if (allowed.indexOf(m[1].trim()) === -1 && allowed.indexOf(m[1].split(':')[0].trim()) === -1) {
        issues.push('جای خالی پرنشده: [' + m[1] + ']');
      }
    }
    return issues;
  }

  // ---------- یکسان‌سازی برای جست‌وجو ----------
  function normalize(s) {
    return toEn(String(s || ''))
      .toLowerCase()
      .replace(/ي/g, 'ی').replace(/ى/g, 'ی').replace(/ك/g, 'ک')
      .replace(/[ۀة]/g, 'ه').replace(/[أإٱ]/g, 'ا').replace(/ؤ/g, 'و')
      .replace(/[ً-ٰٟـ]/g, '') // اعراب و کشیده
      .replace(/[‌‍‎‏]/g, '')   // نیم‌فاصله و نویسه‌های جهت
      .replace(/[«»"'`،؛,.:;!?؟()\[\]{}<>\/\\|*_#-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function squash(s) { return normalize(s).replace(/ /g, ''); }

  // ---------- تبدیل فرمت پرامپت (متن، مارکداون، XML) ----------
  var TAG_FA_MAP = {
    role: 'نقش کاربردی (Role)',
    context: 'زمینه و موقعیت (Context)',
    rules: 'قواعد و ضوابط (Rules)',
    rule: 'قاعده',
    constraints: 'قیدها و محدودیت‌ها (Constraints)',
    constraint: 'قید',
    output_format: 'قالب خروجی (Output Format)',
    task: 'دستور و خواسته (Task)',
    instruction: 'دستورالعمل (Instruction)',
    instructions: 'دستورالعمل‌ها',
    prompt: 'پرامپت (Prompt)',
    voice: 'سند لحن و سبک (Voice)',
    samples: 'نمونه‌های لحن (Voice Samples)',
    sample: 'نمونه',
    examples: 'نمونه‌ها (Examples)',
    example: 'نمونه',
    input: 'داده‌ی ورودی (Input)',
    input_data: 'داده‌های ورودی (Input Data)',
    draft: 'متن پیش‌نویس (Draft)',
    facts: 'داده‌ها و واقعیت‌های ثابت (Facts)',
    audience: 'مخاطب هدف (Audience)',
    guidelines: 'راهنما (Guidelines)',
    defense: 'بندهای دفاعی دستیار (Defense)',
    spec: 'مشخصات فنی (Specifications)',
    criteria: 'معیارهای سنجش (Criteria)',
    steps: 'مراحل (Steps)',
    fixed_facts: 'داده‌های الزامی (Fixed Facts)'
  };

  var FA_LABEL_TO_TAG = [
    { re: /^(?:زمینه|زمینه‌ی کار|زمینه‌ی نادیدنی):\s*/i, tag: 'context', md: '### زمینه (Context)' },
    { re: /^(?:خواسته|دستور نهایی|کار|هدف اصلی):\s*/i, tag: 'task', md: '### خواسته (Task)' },
    { re: /^(?:قیدها|قیدها، هر کدام با «چون \.\.\.»|قید|محدودیت‌ها):\s*/i, tag: 'constraints', md: '### قیدها و ضوابط (Constraints)' },
    { re: /^(?:قالب خروجی|قالب|ساختار):\s*/i, tag: 'output_format', md: '### قالب خروجی (Output Format)' },
    { re: /^(?:معیار موفقیت|معیار سنجش|معیار موفقیت \(از کجا بفهمم خوب است؟\)):\s*/i, tag: 'success_criteria', md: '### معیار موفقیت (Success Criteria)' },
    { re: /^(?:موضوع|پست درباره‌ی چیست؟):\s*/i, tag: 'subject', md: '### موضوع (Subject)' },
    { re: /^(?:هدف|هدف پست):\s*/i, tag: 'goal', md: '### هدف (Goal)' },
    { re: /^(?:این‌ها را دقیقاً همین‌طور بیاور|واقعیت‌ها|داده‌های مشخص):\s*/i, tag: 'fixed_facts', md: '### داده‌های الزامی (Fixed Facts)' },
    { re: /^(?:مخاطب|مخاطب شما):\s*/i, tag: 'audience', md: '### مخاطب (Audience)' },
    { re: /^(?:نقش|نقش کاربردی مدل):\s*/i, tag: 'role', md: '### نقش مدل (Role)' }
  ];

  function indentLines(text, spaces) {
    var pad = new Array(spaces + 1).join(' ');
    return String(text).split('\n').map(function (l) { return l.trim() ? pad + l : l; }).join('\n');
  }

  function toText(rawText) {
    return tidy(String(rawText || ''));
  }

  function toXml(rawText, card) {
    if (!rawText || !String(rawText).trim()) return '';
    var text = tidy(String(rawText));

    // حالت ۱: پرامپت از قبل دارای تگ‌های XML است
    var xmlTagRe = /<([a-zA-Z0-9_-]+)>([\s\S]*?)<\/\1>/g;
    var hasXml = /<[a-zA-Z0-9_-]+>[\s\S]*?<\/[a-zA-Z0-9_-]+>/.test(text);

    if (hasXml) {
      if (/^\s*<prompt>[\s\S]*<\/prompt>\s*$/.test(text)) return text;
      var out = '<prompt>\n';
      var lastIdx = 0, m;
      xmlTagRe.lastIndex = 0;
      while ((m = xmlTagRe.exec(text)) !== null) {
        var preceding = text.slice(lastIdx, m.index).trim();
        if (preceding) {
          out += '  <instruction>\n' + indentLines(preceding, 4) + '\n  </instruction>\n\n';
        }
        var tag = m[1], inner = m[2].trim();
        out += '  <' + tag + '>\n' + indentLines(inner, 4) + '\n  </' + tag + '>\n\n';
        lastIdx = xmlTagRe.lastIndex;
      }
      var trailing = text.slice(lastIdx).trim();
      if (trailing) {
        out += '  <instruction>\n' + indentLines(trailing, 4) + '\n  </instruction>\n';
      }
      return tidy(out) + '\n</prompt>';
    }

    // حالت ۲: پرامپت با برچسب‌های فارسی ساختاریافته است (مانند زمینه: ... خواسته: ...)
    var lines = text.split('\n');
    var sections = [], currentSec = null;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var matched = null;
      for (var r = 0; r < FA_LABEL_TO_TAG.length; r++) {
        var match = line.match(FA_LABEL_TO_TAG[r].re);
        if (match) {
          matched = { tag: FA_LABEL_TO_TAG[r].tag, content: line.slice(match[0].length).trim() };
          break;
        }
      }
      if (matched) {
        if (currentSec) sections.push(currentSec);
        currentSec = { tag: matched.tag, lines: matched.content ? [matched.content] : [] };
      } else if (currentSec) {
        currentSec.lines.push(line);
      } else {
        if (!currentSec) currentSec = { tag: 'instruction', lines: [line] };
        else currentSec.lines.push(line);
      }
    }
    if (currentSec) sections.push(currentSec);

    var recognizedCount = sections.filter(function (s) { return s.tag !== 'instruction'; }).length;
    if (recognizedCount > 0) {
      var xOut = '<prompt>\n';
      sections.forEach(function (s) {
        var content = s.lines.join('\n').trim();
        if (content) {
          xOut += '  <' + s.tag + '>\n' + indentLines(content, 4) + '\n  </' + s.tag + '>\n\n';
        }
      });
      return tidy(xOut) + '\n</prompt>';
    }

    // حالت ۳: پرامپت یک‌جمله‌ای یا دارای متن ورودی جداگانه
    var paragraphs = text.split(/\n\s*\n/).filter(Boolean);
    if (paragraphs.length >= 2) {
      var instr = paragraphs.slice(0, paragraphs.length - 1).join('\n\n').trim();
      var inputContent = paragraphs[paragraphs.length - 1].trim();
      return '<prompt>\n  <instruction>\n' + indentLines(instr, 4) + '\n  </instruction>\n\n  <input_data>\n' + indentLines(inputContent, 4) + '\n  </input_data>\n</prompt>';
    }

    return '<prompt>\n  <instruction>\n' + indentLines(text, 4) + '\n  </instruction>\n</prompt>';
  }

  function toMarkdown(rawText, card) {
    if (!rawText || !String(rawText).trim()) return '';
    var text = tidy(String(rawText));

    // حالت ۱: پرامپت دارای تگ‌های XML است
    var xmlTagRe = /<([a-zA-Z0-9_-]+)>([\s\S]*?)<\/\1>/g;
    var hasXml = /<[a-zA-Z0-9_-]+>[\s\S]*?<\/[a-zA-Z0-9_-]+>/.test(text);

    if (hasXml) {
      var out = '';
      var lastIdx = 0, m;
      xmlTagRe.lastIndex = 0;
      while ((m = xmlTagRe.exec(text)) !== null) {
        var preceding = text.slice(lastIdx, m.index).trim();
        if (preceding) {
          out += '### دستور کار (Instruction)\n' + preceding + '\n\n';
        }
        var tag = m[1], heading = TAG_FA_MAP[tag] || ('### ' + tag), inner = m[2].trim();
        if (tag === 'samples' || tag === 'examples') {
          var itemRe = /<(?:sample|example)>([\s\S]*?)<\/(?:sample|example)>/g;
          var items = [], im;
          while ((im = itemRe.exec(inner)) !== null) items.push(im[1].trim());
          if (items.length) {
            out += '### ' + (TAG_FA_MAP[tag] || tag) + '\n\n';
            items.forEach(function (item, idx) {
              out += '**نمونه‌ی ' + toFa(idx + 1) + ':**\n> ' + item.split('\n').join('\n> ') + '\n\n';
            });
          } else {
            out += '### ' + (TAG_FA_MAP[tag] || tag) + '\n' + inner + '\n\n';
          }
        } else if (tag === 'draft' || tag === 'input' || tag === 'input_data') {
          out += '### ' + (TAG_FA_MAP[tag] || tag) + '\n> ' + inner.split('\n').join('\n> ') + '\n\n';
        } else {
          out += '### ' + (TAG_FA_MAP[tag] || tag) + '\n' + inner + '\n\n';
        }
        lastIdx = xmlTagRe.lastIndex;
      }
      var trailing = text.slice(lastIdx).trim();
      if (trailing) {
        out += '### دستور کار (Instruction)\n' + trailing + '\n\n';
      }
      return tidy(out);
    }

    // حالت ۲: برچسب‌های فارسی
    var lines = text.split('\n');
    var sections = [], currentSec = null;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var matched = null;
      for (var r = 0; r < FA_LABEL_TO_TAG.length; r++) {
        var match = line.match(FA_LABEL_TO_TAG[r].re);
        if (match) {
          matched = { md: FA_LABEL_TO_TAG[r].md, content: line.slice(match[0].length).trim() };
          break;
        }
      }
      if (matched) {
        if (currentSec) sections.push(currentSec);
        currentSec = { heading: matched.md, lines: matched.content ? [matched.content] : [] };
      } else if (currentSec) {
        currentSec.lines.push(line);
      } else {
        if (!currentSec) currentSec = { heading: '### دستور کار (Instruction)', lines: [line] };
        else currentSec.lines.push(line);
      }
    }
    if (currentSec) sections.push(currentSec);

    var recognizedCount = sections.filter(function (s) { return s.heading !== '### دستور کار (Instruction)'; }).length;
    if (recognizedCount > 0) {
      var mdOut = '';
      sections.forEach(function (s) {
        var content = s.lines.join('\n').trim();
        if (content) {
          mdOut += s.heading + '\n' + content + '\n\n';
        }
      });
      return tidy(mdOut);
    }

    // حالت ۳: تفکیک دستور و متن ورودی
    var paragraphs = text.split(/\n\s*\n/).filter(Boolean);
    if (paragraphs.length >= 2) {
      var instr = paragraphs.slice(0, paragraphs.length - 1).join('\n\n').trim();
      var inputContent = paragraphs[paragraphs.length - 1].trim();
      return '### دستور کار (Instruction)\n' + instr + '\n\n### داده‌ی ورودی (Input Data)\n> ' + inputContent.split('\n').join('\n> ');
    }

    return '### پرامپت (Prompt)\n' + text;
  }

  function formatPrompt(rawText, card, format) {
    if (format === 'xml') return toXml(rawText, card);
    if (format === 'markdown' || format === 'md') return toMarkdown(rawText, card);
    return toText(rawText);
  }

  return {
    parse: parse,
    keysOf: keysOf,
    render: render,
    leftovers: leftovers,
    isEmpty: isEmpty,
    normalize: normalize,
    squash: squash,
    toFa: toFa,
    toEn: toEn,
    toText: toText,
    toXml: toXml,
    toMarkdown: toMarkdown,
    formatPrompt: formatPrompt,
    TAG_FA_MAP: TAG_FA_MAP
  };
});

