/* ArtproDucktion — แถบบน (เมนูหลัก + รายการย่อย) + ท้ายหน้า + ปุ่มภาษา + ปุ่มย้อนกลับ
   ไฟล์เดียวใช้ทุกหน้า · แก้เมนูที่ MENU · คำในปุ่มที่ UI · หน้าอังกฤษที่ทำแล้วใส่ใน EN_PAGES
   พฤติกรรมเมนู (Dan 6 ต.ค.): ชี้เมาส์ที่หัวข้อ = รายการย่อยเลื่อนลง · คลิกหัวข้อ = หน้าแรกของส่วนนั้น · มือถือแตะ ▾ = เปิดรายการย่อย */
(function () {
  'use strict';

  var MENU = [
    { key: 'art', path: 'art/', th: 'งานศิลปะ', en: 'Art', sub: [
      { path: 'art/#exhibitions', th: 'นิทรรศการ',     en: 'Exhibitions' },
      { path: 'art/originals/',   th: 'ผลงานที่ขาย',   en: 'Original works' },
      { path: 'art/cv/',          th: 'ประวัติศิลปิน', en: 'Artist CV' }
    ] },
    { key: 'photo', path: 'photo/', th: 'ภาพถ่าย', en: 'Photography', sub: [
      { path: 'photo/#concept',  th: 'แนวคิด',          en: 'Approach' },
      { path: 'photo/#sets',     th: 'ชุดผลงาน',        en: 'Portfolio' },
      { path: 'photo/#services', th: 'รับถ่ายอะไรบ้าง', en: 'Services' },
      { path: 'photo/#book',     th: 'จองคิว',           en: 'Book a shoot' }
    ] },
    { key: 'tarot', path: 'tarot/', th: 'อ่านไพ่', en: 'Tarot', sub: [
      { path: 'tarot/#concept',  th: 'แนวคิด',       en: 'Approach' },
      { path: 'tarot/#services', th: 'บริการ 3 แบบ', en: 'Readings' },
      { path: 'tarot/deck/',     th: 'Dan Tarot 78 ใบ', en: 'Dan Tarot deck' },
      { path: 'tarot/#book',     th: 'จองอ่านไพ่',   en: 'Book a reading' }
    ] },
    { key: 'books', path: 'books/', th: 'หนังสือ', en: 'Books', sub: [
      { path: 'books/#all',  th: 'รวมทุกเล่ม',   en: 'All books' },
      { path: 'books/#book-01', th: 'เปิดไพ่ ฟังใจ', en: 'เปิดไพ่ ฟังใจ' }
    ] },
    { key: 'links', path: 'links/', th: 'ลิงก์', en: 'Links', sub: [] }
  ];
  // หน้าที่มีฉบับอังกฤษแล้ว ('' = หน้าแรก · 'art/' = ส่วนศิลปะ …)
  var EN_PAGES = [''];

  var UI = {
    th: { cart: 'ตะกร้า', back: '← ย้อนกลับ', backTitle: 'ย้อนกลับหน้าก่อน', homeTitle: 'กลับหน้าแรก', more: 'เปิดรายการย่อย', navLabel: 'ส่วนของเว็บ', who: 'Danaya Buntasnakul', where: 'Bangkok · multidisciplinary art studio' },
    en: { cart: 'Cart', back: '← Back',      backTitle: 'Go back',          homeTitle: 'Home',           more: 'Show sub-pages',   navLabel: 'Sections',    who: 'Danaya Buntasnakul', where: 'Bangkok · multidisciplinary art studio' }
  };

  var script = document.currentScript || document.querySelector('script[src*="site.js"]');
  var base = new URL(script.src, location.href).pathname.replace(/assets\/js\/site\.js(\?.*)?$/, '');
  var lang = (document.documentElement.lang || 'th').slice(0, 2) === 'en' ? 'en' : 'th';
  var t = UI[lang];

  var rel = location.pathname.indexOf(base) === 0 ? location.pathname.slice(base.length) : '';
  rel = rel.replace(/index\.html?$/, '');
  if (rel.indexOf('en/') === 0) rel = rel.slice(3);
  var isHome = rel === '';
  var section = document.body.getAttribute('data-section') || '';
  var year = new Date().getFullYear();

  function hasEn(p) { return EN_PAGES.indexOf(p.split('#')[0]) !== -1; }
  // ลิงก์ไปหน้า p: ถ้าเป็นเว็บอังกฤษและหน้านั้นมีอังกฤษ → en/ ไม่มีก็ไปหน้าไทย (ดีกว่าลิงก์ตาย)
  function hrefFor(p) { return base + (lang === 'en' && hasEn(p) ? 'en/' : '') + p; }
  var parent = rel.replace(/[^\/]+\/$/, '');
  var thHref = base + rel;
  var enHref = base + 'en/' + (hasEn(rel) ? rel : '');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  var navHtml = '<ul>' + MENU.map(function (m) {
    var hasSub = m.sub && m.sub.length > 0;
    var sub = hasSub ? '<ul class="sub">' + m.sub.map(function (s) {
      return '<li><a href="' + hrefFor(s.path) + '">' + esc(s[lang]) + '</a></li>';
    }).join('') + '</ul>' : '';
    var toggle = hasSub ? '<button type="button" class="sub-toggle" aria-label="' + esc(t.more) + '" aria-expanded="false">▾</button>' : '';
    return '<li class="' + (hasSub ? 'has-sub' : '') + (m.key === section ? ' is-on' : '') + '">' +
      '<a class="top" href="' + hrefFor(m.path) + '">' + esc(m[lang]) + '</a>' + toggle + sub + '</li>';
  }).join('') + '</ul>';

  var langHtml = '<span class="lang">' +
    '<a href="' + thHref + '"' + (lang === 'th' ? ' class="is-on"' : '') + ' lang="th">ไทย</a><span>|</span>' +
    '<a href="' + enHref + '"' + (lang === 'en' ? ' class="is-on"' : '') + ' lang="en">EN</a></span>';

  var header = document.querySelector('[data-site-header]');
  if (header) {
    header.innerHTML = '<div class="topbar-in">' +
      '<a class="back" href="' + hrefFor(parent) + '" title="' + esc(t.backTitle) + '" data-back>' + esc(t.back) + '</a>' +
      '<a class="brand" href="' + hrefFor('') + '" title="' + esc(t.homeTitle) + '">ArtproDucktion</a>' +
      '<nav class="menu" aria-label="' + esc(t.navLabel) + '">' + navHtml + '</nav>' +
      '<div class="right"><a class="cart-link" href="' + base + 'art/originals/cart/" hidden>' + esc(t.cart) + ' <span class="n">0</span></a>' + langHtml + '</div>' +
      '</div>';

    header.querySelector('[data-back]').addEventListener('click', function (e) {
      if (history.length > 1 && document.referrer && document.referrer.indexOf(location.origin + base) === 0) {
        e.preventDefault(); history.back();
      }
    });

    function closeAll() {
      each(header.querySelectorAll('.has-sub.open'), function (li) {
        li.classList.remove('open');
        li.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false');
      });
    }
    each(header.querySelectorAll('.sub-toggle'), function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var li = btn.parentNode, wasOpen = li.classList.contains('open');
        closeAll();
        if (!wasOpen) { li.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.addEventListener('click', function (e) { if (!header.contains(e.target)) closeAll(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  }

  // ปุ่มตะกร้า (Dan's Originals) — แสดงเมื่อมีของในตะกร้า · shop.js เรียก APD_cartCount(n) เมื่อเปลี่ยน
  // จอคอม = ปุ่มในแถบบน · มือถือ = ปุ่มลอยมุมขวาล่าง (แถบบนมือถือไม่มีที่พอ)
  var floatCart = document.createElement('a');
  floatCart.className = 'cart-link cart-float';
  floatCart.href = base + 'art/originals/cart/';
  floatCart.hidden = true;
  floatCart.innerHTML = esc(t.cart) + ' <span class="n">0</span>';
  document.body.appendChild(floatCart);
  window.APD_cartCount = function (n) {
    each(document.querySelectorAll('.cart-link'), function (a) {
      a.hidden = !(n > 0);
      a.querySelector('.n').textContent = n;
    });
  };
  try { window.APD_cartCount((JSON.parse(localStorage.getItem('apd-cart-v1') || '[]') || []).length); } catch (e) {}

  var footer = document.querySelector('[data-site-footer]');
  if (footer) {
    footer.innerHTML = '<div class="fleuron">❦</div>' +
      '<div class="who">' + esc(t.who) + '</div>' +
      '<div class="where">' + esc(t.where) + '</div>' +
      '<div>© ' + year + ' ArtproDucktion</div>' +
      '<div class="lang">' + langHtml + '</div>';
  }

  if (isHome) document.body.classList.add('is-home');
  document.body.classList.add('js');
})();
