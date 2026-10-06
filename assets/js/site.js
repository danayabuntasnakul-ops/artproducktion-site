/* ArtproDucktion — แถบบน + ท้ายหน้า + ปุ่มภาษา + ปุ่มย้อนกลับ
   ไฟล์เดียวใช้ทุกหน้า · แก้เมนูที่ MENU · คำในปุ่มที่ UI · หน้าอังกฤษที่ทำแล้วใส่ใน EN_PAGES */
(function () {
  'use strict';

  var MENU = [
    { key: 'art',   path: 'art/',   th: 'ศิลปะ',    en: 'Art' },
    { key: 'photo', path: 'photo/', th: 'ถ่ายภาพ', en: 'Photography' },
    { key: 'tarot', path: 'tarot/', th: 'ทาโรต์',   en: 'Tarot' },
    { key: 'books', path: 'books/', th: 'หนังสือ',  en: 'Books' },
    { key: 'links', path: 'links/', th: 'ลิงก์',    en: 'Links' }
  ];
  // หน้าที่มีฉบับอังกฤษแล้ว ('' = หน้าแรก · 'art/' = ส่วนศิลปะ …) ปุ่ม EN จะชี้ไปหน้านั้น หน้าอื่นชี้ไปหน้าแรกอังกฤษ
  var EN_PAGES = [''];

  var UI = {
    th: { back: '← ย้อนกลับ', backTitle: 'ย้อนกลับหน้าก่อน', homeTitle: 'กลับหน้าแรก', who: 'Danaya Buntasnakul', where: 'Bangkok · multidisciplinary art studio', copy: '©' },
    en: { back: '← Back',      backTitle: 'Go back',          homeTitle: 'Home',           who: 'Danaya Buntasnakul', where: 'Bangkok · multidisciplinary art studio', copy: '©' }
  };

  var script = document.currentScript || document.querySelector('script[src*="site.js"]');
  var base = new URL(script.src, location.href).pathname.replace(/assets\/js\/site\.js(\?.*)?$/, '');
  var lang = (document.documentElement.lang || 'th').slice(0, 2) === 'en' ? 'en' : 'th';
  var t = UI[lang];

  // path ของหน้านี้ เทียบกับราก (ตัด index.html และ en/ ออก)
  var rel = location.pathname.indexOf(base) === 0 ? location.pathname.slice(base.length) : '';
  rel = rel.replace(/index\.html?$/, '');
  if (rel.indexOf('en/') === 0) rel = rel.slice(3);
  var isHome = rel === '';
  var section = document.body.getAttribute('data-section') || '';
  var year = new Date().getFullYear();

  function hasEn(p) { return EN_PAGES.indexOf(p) !== -1; }
  function hrefFor(p, wantLang) {           // ลิงก์ไปหน้า p ในภาษาที่ต้องการ ถ้าไม่มีอังกฤษให้ไปหน้าไทย
    if (wantLang === 'en') return base + 'en/' + (hasEn(p) ? p : '');
    return base + p;
  }
  var parent = rel.replace(/[^\/]+\/$/, '');
  var thHref = base + rel;
  var enHref = base + 'en/' + (hasEn(rel) ? rel : '');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var menuHtml = MENU.map(function (m) {
    return '<a href="' + hrefFor(m.path, lang) + '"' + (m.key === section ? ' class="is-on"' : '') + '>' + esc(m[lang]) + '</a>';
  }).join('');

  var langHtml = '<span class="lang">' +
    '<a href="' + thHref + '"' + (lang === 'th' ? ' class="is-on"' : '') + ' lang="th">ไทย</a><span>|</span>' +
    '<a href="' + enHref + '"' + (lang === 'en' ? ' class="is-on"' : '') + ' lang="en">EN</a></span>';

  var header = document.querySelector('[data-site-header]');
  if (header) {
    header.innerHTML = '<div class="topbar-in">' +
      '<a class="back" href="' + hrefFor(parent, lang) + '" title="' + esc(t.backTitle) + '" data-back>' + esc(t.back) + '</a>' +
      '<a class="brand" href="' + hrefFor('', lang) + '" title="' + esc(t.homeTitle) + '">ArtproDucktion</a>' +
      '<div class="right"><nav class="menu" aria-label="ส่วนของเว็บ">' + menuHtml + '</nav>' + langHtml + '</div>' +
      '</div>';
    var back = header.querySelector('[data-back]');
    back.addEventListener('click', function (e) {
      if (history.length > 1 && document.referrer && document.referrer.indexOf(location.origin + base) === 0) {
        e.preventDefault(); history.back();
      }
    });
  }

  var footer = document.querySelector('[data-site-footer]');
  if (footer) {
    footer.innerHTML = '<div class="fleuron">❦</div>' +
      '<div class="who">' + esc(t.who) + '</div>' +
      '<div class="where">' + esc(t.where) + '</div>' +
      '<div>' + esc(t.copy) + ' ' + year + ' ArtproDucktion</div>' +
      '<div class="lang">' + langHtml + '</div>';
  }

  if (isHome) document.body.classList.add('is-home');
  document.body.classList.add('js');
})();
