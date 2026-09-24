/* کارگر سرویس: همه‌ی فایل‌ها در اولین بازدید ذخیره می‌شوند؛ نسخه‌ی کش همان نسخه‌ی بانک است. */
'use strict';
const VERSION = '2.0.0';
const CACHE = 'prompt-bank-' + VERSION;
const FILES = ["./","index.html","app.js","engine.js","style.css","cards.json","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","fonts/Vazirmatn-Bold.woff2","fonts/Vazirmatn-Regular.woff2"];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  // put به‌جای addAll: اگر کش از نصب قبلی همین نسخه پر مانده باشد، addAll خطا می‌دهد
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) =>
    fetch(f, { cache: 'reload' }).then((res) => {
      if (!res.ok) throw new Error('precache ' + f + ' ' + res.status);
      return c.put(f, res);
    })
  ))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('prompt-bank-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

// اول کش، بعد شبکه؛ QRها و فایل‌های دیگر همان دامنه بعد از اولین دیدن ذخیره می‌شوند
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
