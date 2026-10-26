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
      { path: 'photo/#contact',  th: 'ติดต่อ',           en: 'Contact' }
    ] },
    { key: 'tarot', path: 'tarot/', th: 'อ่านไพ่', en: 'Tarot', sub: [
      { path: 'tarot/#concept',  th: 'แนวคิด',       en: 'Approach' },
      { path: 'tarot/#reader',   th: 'ผู้อ่านไพ่',    en: 'The reader' },
      { path: 'tarot/deck/',     th: 'Dan Tarot 78 ใบ', en: 'Dan Tarot deck' }
    ] },
    { key: 'books', path: 'books/', th: 'หนังสือ', en: 'Books', sub: [
      { path: 'books/#all',  th: 'รวมทุกเล่ม',   en: 'All books' },
      { path: 'books/#book-01', th: 'เปิดไพ่ ฟังใจ', en: 'Poed Phai Fang Jai' }
    ] },
    { key: 'links', path: 'links/', th: 'ลิงก์', en: 'Links', sub: [] }
  ];
  // หน้าที่มีฉบับอังกฤษแล้ว ('' = หน้าแรก · 'art/' = ส่วนศิลปะ …) · ไฟล์อยู่ en/<path>index.html
  // เพิ่มภาพใหม่ใน Dan's Originals: ทำหน้า en/art/originals/<id>/ ด้วย แล้วใส่ชื่อในรายการนี้ (ไม่ใส่ = ปุ่ม EN พาไปหน้าแรกอังกฤษ)
  // art/originals/coa/ ไม่มีฉบับอังกฤษ (แม่แบบใบรับรองใช้ภายใน)
  var EN_PAGES = [
    '', 'art/', 'art/at-the-end/', 'art/doi-suthep/', 'art/cv/',
    'art/originals/', 'art/originals/cart/',
    'art/originals/house-of-dream/', 'art/originals/just-two-of-us/', 'art/originals/our-song/',
    'art/originals/song-of-sun-and-moon/', 'art/originals/love-and-peace/', 'art/originals/we-meet-in-the-sky/',
    'art/originals/sun-and-moon/', 'art/originals/missing-you/', 'art/originals/i-am-home-bridge/',
    'art/originals/i-am-home-moka/', 'art/originals/i-am-home-coffee-and-rose/', 'art/originals/couple/',
    'art/originals/melting-sun/', 'art/originals/hourglass/', 'art/originals/before-wake-up/',
    'photo/', 'tarot/', 'tarot/deck/', 'books/', 'links/'
  ];

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
      '<div class="right"><a class="cart-link" href="' + hrefFor('art/originals/cart/') + '" hidden>' + esc(t.cart) + ' <span class="n">0</span></a>' + langHtml + '</div>' +
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
  floatCart.href = hrefFor('art/originals/cart/');
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

  // กดรูปผลงานเพื่อดูภาพใหญ่ (Dan ขอ 26 ต.ค. 2569) — ใช้กับ figure.work ทุกหน้า (นิทรรศการ · หน้าภาพในร้าน) ยกเว้นรูปที่เป็นลิงก์
  // ปิด: ปุ่ม × · Esc · แตะพื้นหลัง · เลื่อนรูป: ปุ่ม ‹ › · ลูกศรซ้ายขวา · ปัดนิ้ว · มือถือซูมด้วยสองนิ้วได้
  var ZT = lang === 'en'
    ? { open: 'View larger', close: 'Close', prev: 'Previous', next: 'Next' }
    : { open: 'ดูภาพใหญ่', close: 'ปิด', prev: 'ภาพก่อนหน้า', next: 'ภาพถัดไป' };
  // สไตล์ของกล่องภาพใหญ่ใส่จากที่นี่ (ไม่อยู่ใน site.css) เพื่อไม่ให้พังตอนเบราว์เซอร์ยังจำ site.css เก่า
  var lbCss = document.createElement('style');
  lbCss.textContent = 'img[data-zoom]{cursor:zoom-in}img[data-zoom]:focus-visible{outline:2px solid var(--accent);outline-offset:3px}html.lb-open,html.lb-open body{overflow:hidden}.lightbox{position:fixed;inset:0;z-index:200;background:#08090b;display:flex;align-items:center;justify-content:center;padding:56px 12px 16px}.lightbox[hidden]{display:none}.lb-fig{margin:0;max-width:100%;max-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%}.lb-fig img{max-width:100%;max-height:calc(100% - 64px);width:auto;height:auto;object-fit:contain;display:block;cursor:zoom-out;border:1px solid var(--edge)}.lb-fig figcaption{margin-top:var(--s3);text-align:center;display:flex;flex-direction:column;gap:2px}.lb-fig .t{font-family:var(--font-display);font-size:20px;color:var(--text)}.lb-fig .m{font-size:13px;color:var(--gray-2)}.lb-close,.lb-nav{position:absolute;background:rgba(24,27,32,.85);color:var(--text);border:1px solid var(--line);border-radius:999px;width:44px;height:44px;font-size:26px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:var(--font-display)}.lb-close:hover,.lb-nav:hover{border-color:var(--text)}.lb-close{top:8px;right:12px}.lb-nav{top:50%;transform:translateY(-50%)}.lb-nav[hidden]{display:none}.lb-prev{left:12px}.lb-next{right:12px}@media (max-width:699px){.lb-nav{top:auto;bottom:12px;transform:none}.lightbox{padding-bottom:68px}}';
  document.head.appendChild(lbCss);
  function zoomable() {
    return Array.prototype.filter.call(document.querySelectorAll('figure.work img'), function (img) { return !img.closest('a'); });
  }
  function markZoomable() {
    each(zoomable(), function (img) {
      if (img.hasAttribute('data-zoom')) return;
      img.setAttribute('data-zoom', '');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', ZT.open + ' — ' + (img.alt || ''));
    });
  }
  var lb = null, lbList = [], lbIdx = 0, lbLast = null;
  function lbBuild() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button type="button" class="lb-close" aria-label="' + esc(ZT.close) + '">×</button>' +
      '<button type="button" class="lb-nav lb-prev" aria-label="' + esc(ZT.prev) + '">‹</button>' +
      '<figure class="lb-fig"><img alt=""><figcaption><span class="t"></span><span class="m"></span></figcaption></figure>' +
      '<button type="button" class="lb-nav lb-next" aria-label="' + esc(ZT.next) + '">›</button>';
    document.body.appendChild(lb);
    lb.querySelector('.lb-close').addEventListener('click', lbClose);
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); lbGo(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); lbGo(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) lbClose(); });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null || (window.visualViewport && visualViewport.scale > 1.05)) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) lbGo(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }
  function lbShow() {
    var img = lbList[lbIdx], fig = img.closest('figure');
    var big = lb.querySelector('.lb-fig img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || '';
    var t = fig && fig.querySelector('figcaption .t'), m = fig && fig.querySelector('figcaption .m');
    lb.querySelector('.lb-fig .t').textContent = t ? t.textContent : (img.alt || '');
    lb.querySelector('.lb-fig .m').textContent = m ? m.textContent : '';
    var multi = lbList.length > 1;
    each(lb.querySelectorAll('.lb-nav'), function (b) { b.hidden = !multi; });
  }
  function lbOpen(img) {
    if (!lb) lbBuild();
    lbList = zoomable();
    lbIdx = Math.max(0, lbList.indexOf(img));
    lbLast = img;
    lbShow();
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    lb.querySelector('.lb-close').focus();
  }
  function lbClose() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (lbLast) lbLast.focus();
  }
  function lbGo(d) {
    if (lbList.length < 2) return;
    lbIdx = (lbIdx + d + lbList.length) % lbList.length;
    lbShow();
  }
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('img[data-zoom]');
    if (img) { e.preventDefault(); lbOpen(img); }
  });
  document.addEventListener('keydown', function (e) {
    if (lb && !lb.hidden) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowRight') lbGo(1);
      else if (e.key === 'ArrowLeft') lbGo(-1);
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('img[data-zoom]')) { e.preventDefault(); lbOpen(e.target); }
  });
  markZoomable();
  // หน้าภาพในร้านสร้างรูปทีหลัง (shop.js) → เฝ้าดูแล้วติดป้ายให้
  if (window.MutationObserver) new MutationObserver(markZoomable).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });

  if (isHome) document.body.classList.add('is-home');
  document.body.classList.add('js');
})();
