/* Dan's Originals — หน้ารวม · หน้ารายละเอียดภาพ · ตะกร้า
   ข้อมูลผลงานอยู่ที่ originals-data.js (ไฟล์นี้ไม่ต้องแก้เมื่อเปลี่ยนราคา/สถานะ)
   ตะกร้าเก็บในเบราว์เซอร์ของผู้ซื้อ (localStorage) · ผลงานต้นฉบับชิ้นเดียว จึงใส่ได้ชิ้นละ 1
   หน้าไหนทำอะไร ดูจาก <body data-shop="list|work|cart"> และ data-work="<id>"
   ระบบชำระเงินอัตโนมัติ (11 ต.ค. 2569): ถ้า ORIGINALS.checkout มีลิงก์ → ดึงสถานะจริง (ขายแล้ว / มีคนกำลังซื้อ / ราคา)
   จาก Sheet ผ่าน ?action=status ทุกครั้งที่เปิดหน้า แล้วแสดงใหม่ · ตะกร้าใช้ปุ่ม "ไปชำระเงิน" แทนแบบฟอร์มเดิม
   ฉบับอังกฤษ (26 ต.ค. 2569): หน้า <html lang="en"> ใน en/art/originals/ ใช้คำจากตาราง T.en + ช่อง *_en ใน originals-data.js
   (medium_en · story_en · chapters.concept_en) · ปีแปลงเป็น ค.ศ. · "ซม." เป็น "cm" · หน้าไทยแสดงเหมือนเดิมทุกตัวอักษร */
(function () {
  'use strict';

  var D = window.ORIGINALS;
  if (!D) return;
  var KEY = 'apd-cart-v1';
  var CHECKOUT = String(D.checkout || '').trim();
  var script = document.currentScript || document.querySelector('script[src*="shop.js"]');
  var base = new URL(script.src, location.href).pathname.replace(/assets\/js\/shop\.js(\?.*)?$/, '');
  var IMG = base + 'assets/img/art/';
  var EN = (document.documentElement.lang || '').slice(0, 2) === 'en';
  var LANGDIR = EN ? 'en/' : '';
  var SHOP = base + LANGDIR + 'art/originals/';

  // คำบนหน้าร้าน · th = ข้อความเดิม (ห้ามแก้ถ้าไม่ตั้งใจเปลี่ยนหน้าไทย) · en = ฉบับอังกฤษ
  var T = {
    th: {
      sold: 'ขายแล้ว', held: 'มีคนกำลังซื้อ', off: 'ไม่เปิดขายตอนนี้', ask: 'สอบถามราคา',
      inCart: 'อยู่ในตะกร้า', details: 'ดูรายละเอียด →',
      notFound: 'ไม่พบผลงานนี้', backAll: 'กลับหน้ารวม',
      askSubject: 'สอบถามราคา ', askBtn: 'สอบถามราคา →',
      added: '✓ อยู่ในตะกร้าแล้ว', toCart: 'ไปที่ตะกร้า →', remove: 'เอาออก', add: 'ใส่ตะกร้า',
      seriesLabel: '<span class="th">ชุดที่ 1</span>',
      year: 'ปีที่สร้าง', medium: 'เทคนิค', size: 'ขนาด', series: 'ชุดผลงาน',
      chapter: function (n, ch) { return 'บท ' + esc(n) + ' · ' + esc(ch.name); },
      chapterHead: function (n, ch) { return 'บท ' + esc(n) + ' · ' + esc(ch.name) + ' <span class="latin dim">' + esc(ch.en) + '</span>'; },
      note1: 'ผลงานต้นฉบับชิ้นเดียวในโลก ไม่ใช่ภาพพิมพ์',
      note2: 'ลงนามโดยศิลปิน · พร้อมใบรับรองงานแท้',
      note3: function (ship) { return 'จำหน่ายและจัดส่งเฉพาะในประเทศไทย · ค่าจัดส่ง ' + ship + ' ต่อการสั่งซื้อ'; },
      storyLabel: 'Story · <span class="th">เรื่องราวของภาพ</span>',
      conceptLabel: 'Concept · <span class="th">จากนิทรรศการ</span>',
      fullShow: 'ชมนิทรรศการเต็ม →',
      navLabel: 'ผลงานอื่น', prev: '← ก่อนหน้า', all: 'ผลงานทั้งหมด', next: 'ถัดไป →',
      empty: 'ตะกร้ายังว่าง', browse: 'เลือกชมผลงาน →',
      warn: function (label) { return 'ชิ้นนี้' + esc(label || 'สั่งซื้อไม่ได้') + ' ไม่นับรวมในยอด'; },
      subtotal: function (n) { return 'ราคาผลงาน (' + n + ' ชิ้น)'; },
      shipping: 'ค่าจัดส่ง (ต่อการสั่งซื้อ)', total: 'ยอดรวมที่ต้องโอน'
    },
    en: {
      sold: 'Sold', held: 'On hold', off: 'Not for sale at the moment', ask: 'Price on request',
      inCart: 'In your cart', details: 'View details →',
      notFound: 'This work could not be found.', backAll: 'Back to all works',
      askSubject: 'Price enquiry: ', askBtn: 'Ask about the price →',
      added: '✓ In your cart', toCart: 'Go to cart →', remove: 'Remove', add: 'Add to cart',
      seriesLabel: 'Series 1',
      year: 'Year', medium: 'Medium', size: 'Size', series: 'Series',
      chapter: function (n, ch) { return 'Chapter ' + esc(n) + ' · ' + esc(ch.en); },
      chapterHead: function (n, ch) { return 'Chapter ' + esc(n) + ' · ' + esc(ch.en); },
      note1: 'A one-of-a-kind original, not a print',
      note2: 'Signed by the artist · with a certificate of authenticity',
      note3: function (ship) { return 'Sold and shipped within Thailand only · shipping ' + ship + ' per order'; },
      storyLabel: 'Story',
      conceptLabel: 'Concept · From the exhibition',
      fullShow: 'See the full exhibition →',
      navLabel: 'More works', prev: '← Previous', all: 'All works', next: 'Next →',
      empty: 'Your cart is empty.', browse: 'Browse the works →',
      warn: function (label) { return esc(label || 'Unavailable') + ' — not included in the total'; },
      subtotal: function (n) { return 'Artwork (' + n + (n === 1 ? ' piece)' : ' pieces)'); },
      shipping: 'Shipping (per order)', total: 'Total to transfer'
    }
  };
  var L = EN ? T.en : T.th;
  // ข้อมูลภาพตามภาษา: อังกฤษใช้ช่อง *_en ถ้ามี · ปี พ.ศ. → ค.ศ. · ซม. → cm
  function tx(o, k) { return EN && o[k + '_en'] ? o[k + '_en'] : o[k]; }
  function yearOf(w) { var y = w.year; return EN && /^\d{4}$/.test(y) && +y > 2400 ? String(+y - 543) : y; }
  function sizeOf(w) { return EN ? String(w.size || '').replace(/\s*ซม\.?$/, ' cm') : w.size; }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function baht(n) { return '฿ ' + Number(n).toLocaleString('th-TH'); }
  function byId(id) { for (var i = 0; i < D.works.length; i++) if (D.works[i].id === id) return D.works[i]; return null; }
  // status: 'available' ขายอยู่ · 'held' มีคนกำลังซื้อ (จากระบบชำระเงิน) · 'sold' ขายแล้ว · อื่น ๆ = ไม่เปิดขาย
  function buyable(w) { return w && w.status === 'available' && w.price != null; }
  function statusLabel(w) {
    if (!w) return '';
    if (w.status === 'sold') return L.sold;
    if (w.status === 'held') return L.held;
    if (w.status !== 'available') return L.off;
    return w.price == null ? L.ask : '';
  }
  function priceText(w) { return statusLabel(w) || baht(w.price); }
  function meta(w) { return [yearOf(w), tx(w, 'medium'), sizeOf(w)].filter(Boolean).join(' · '); }
  function $(id) { return document.getElementById(id); }

  // ── สถานะจริงจากระบบชำระเงิน (ถ้ามี) ──
  function syncLive(cb) {
    if (!CHECKOUT || !window.fetch) { cb(false); return; }
    var done = false;
    var timer = setTimeout(function () { if (!done) { done = true; cb(false); } }, 4000);
    fetch(CHECKOUT + '?action=status', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (done) return;
        done = true; clearTimeout(timer);
        if (!j || !j.works) { cb(false); return; }
        D.works.forEach(function (w) {
          var s = j.works[w.id];
          if (!s) return;
          if (s.status === 'available' || s.status === 'held' || s.status === 'sold' || s.status === 'unavailable') w.status = s.status;
          if (s.price > 0) w.price = s.price;
        });
        if (j.shipping > 0) D.shipping = j.shipping;
        if (j.holdMinutes > 0) D.holdMinutes = j.holdMinutes;
        D.live = j;
        cb(true);
      })
      .catch(function () { if (!done) { done = true; clearTimeout(timer); cb(false); } });
  }

  // ── ตะกร้า ──
  var memory = [];       // ใช้แทนเมื่อเบราว์เซอร์บันทึกไม่ได้ (โหมดส่วนตัว ฯลฯ)
  var storageOk = true;
  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; }
    catch (e) { storageOk = false; return memory.slice(); }
  }
  function save(ids) {
    memory = ids.slice();
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) { storageOk = false; }
    if (window.APD_cartCount) window.APD_cartCount(ids.length);
  }
  function cartIds() { return load().filter(function (id) { return byId(id); }); }
  function inCart(id) { return cartIds().indexOf(id) !== -1; }
  function add(id) { var ids = cartIds(); if (ids.indexOf(id) === -1) ids.push(id); save(ids); }
  function remove(id) { save(cartIds().filter(function (x) { return x !== id; })); }

  var page = document.body.getAttribute('data-shop');
  if (window.APD_cartCount) window.APD_cartCount(cartIds().length);
  var render = function () {};

  // ── หน้ารวม ──
  if (page === 'list') {
    render = function () {
      var grid = $('grid');
      var ids = cartIds();
      grid.innerHTML = D.works.map(function (w) {
        var label = statusLabel(w);
        var off = !buyable(w);
        var tag = label && w.price != null ? '<span class="sold-tag' + (w.status === 'held' ? ' held' : '') + '">' + label + '</span>'
          : (ids.indexOf(w.id) !== -1 ? '<span class="sold-tag in-cart">' + L.inCart + '</span>' : '');
        return '<a class="shop-card' + (off && w.price != null ? ' sold' : '') + '" href="' + SHOP + w.id + '/">' +
          '<figure class="work">' + tag + '<img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="lazy"></figure>' +
          '<span class="t">' + esc(w.title) + '</span>' +
          '<span class="m">' + esc(meta(w)) + '</span>' +
          '<span class="price">' + priceText(w) + '</span>' +
          '<span class="more">' + L.details + '</span></a>';
      }).join('');
      // วิธีสั่งซื้อ: แสดงชุดที่ตรงกับระบบที่ใช้อยู่
      var flows = document.querySelectorAll('[data-flow]');
      for (var i = 0; i < flows.length; i++) flows[i].hidden = flows[i].getAttribute('data-flow') !== (CHECKOUT ? 'new' : 'old');
    };
  }

  // ── หน้ารายละเอียดภาพ ──
  if (page === 'work') {
    var id = document.body.getAttribute('data-work');
    var w = byId(id);
    var box = $('work');
    if (!w) { box.innerHTML = '<p class="stub">' + L.notFound + ' <a class="btn" href="' + SHOP + '">' + L.backAll + '</a></p>'; return; }
    var ch = D.series.chapters[w.chapter];
    var i = D.works.indexOf(w);
    var prev = D.works[(i - 1 + D.works.length) % D.works.length];
    var next = D.works[(i + 1) % D.works.length];

    function renderBuy() {
      var b = $('buy');
      if (!b) return;
      if (!buyable(w)) {
        b.innerHTML = w.price == null && w.status === 'available'
          ? '<a class="btn" href="mailto:artproducktion@gmail.com?subject=' + encodeURIComponent(L.askSubject + w.title) + '">' + L.askBtn + '</a>'
          : '<button class="btn" type="button" disabled>' + esc(statusLabel(w)) + '</button>';
        if (inCart(w.id) && w.status !== 'available') remove(w.id);   // ขายไปแล้วระหว่างอยู่ในตะกร้า → เอาออกให้
        return;
      }
      b.innerHTML = inCart(w.id)
        ? '<p class="added">' + L.added + '</p><a class="btn btn-primary" href="' + SHOP + 'cart/">' + L.toCart + '</a> <button class="btn" type="button" data-remove>' + L.remove + '</button>'
        : '<button class="btn btn-primary" type="button" data-add>' + L.add + '</button>';
    }

    render = function () {
      box.innerHTML =
        '<div class="wk">' +
          '<figure class="work wk-img"><img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="eager"></figure>' +
          '<div class="wk-info">' +
            '<p class="label">Dan\'s Originals · ' + L.seriesLabel + '</p>' +
            '<h1 class="latin wk-title">' + esc(w.title) + '</h1>' +
            '<dl class="specs">' +
              '<div><dt>' + L.year + '</dt><dd>' + esc(yearOf(w)) + '</dd></div>' +
              '<div><dt>' + L.medium + '</dt><dd>' + esc(tx(w, 'medium')) + '</dd></div>' +
              '<div><dt>' + L.size + '</dt><dd>' + esc(sizeOf(w)) + '</dd></div>' +
              '<div><dt>' + L.series + '</dt><dd>' + esc(D.series.title) + (ch ? '<br><span class="dim">' + L.chapter(w.chapter, ch) + '</span>' : '') + '</dd></div>' +
            '</dl>' +
            '<p class="wk-price">' + priceText(w) + '</p>' +
            '<div id="buy" class="wk-buy"></div>' +
            '<ul class="wk-notes">' +
              '<li>' + L.note1 + '</li>' +
              '<li>' + L.note2 + '</li>' +
              '<li>' + L.note3(baht(D.shipping)) + '</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        (tx(w, 'story') ? '<section class="wk-sec measure"><p class="label">' + L.storyLabel + '</p><p class="wk-story">' + esc(tx(w, 'story')) + '</p></section>' : '') +
        (ch ? '<section class="wk-sec measure"><p class="label">' + L.conceptLabel + '</p>' +
          '<h2>' + L.chapterHead(w.chapter, ch) + '</h2>' +
          '<p class="muted">' + tx(ch, 'concept') + '</p>' +
          '<a class="btn" href="' + base + LANGDIR + D.series.exhibition + '">' + L.fullShow + '</a></section>' : '') +
        '<nav class="wk-nav" aria-label="' + L.navLabel + '">' +
          '<a href="' + SHOP + prev.id + '/"><span class="dim">' + L.prev + '</span><span class="latin">' + esc(prev.title) + '</span></a>' +
          '<a href="' + SHOP + '#works" class="all">' + L.all + '</a>' +
          '<a href="' + SHOP + next.id + '/" class="nx"><span class="dim">' + L.next + '</span><span class="latin">' + esc(next.title) + '</span></a>' +
        '</nav>';
      renderBuy();
    };
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-add]')) { add(w.id); renderBuy(); }
      if (e.target.closest('[data-remove]')) { remove(w.id); renderBuy(); }
    });
  }

  // ── ตะกร้า ──
  if (page === 'cart') {
    render = function () {
      var ids = cartIds();
      var items = ids.map(byId);
      var ok = items.filter(buyable);
      var list = $('cart-list'), sum = $('cart-sum');
      var offFlow = $('checkout-off'), newFlow = $('checkout-new');

      function hideAll() { if (offFlow) offFlow.hidden = true; if (newFlow) newFlow.hidden = true; }

      if (!items.length) {
        list.innerHTML = '<div class="cart-empty"><p class="muted">' + L.empty + '</p><a class="btn" href="' + SHOP + '#works">' + L.browse + '</a></div>';
        sum.innerHTML = ''; hideAll();
        return;
      }
      list.innerHTML = items.map(function (w) {
        var bad = !buyable(w);
        return '<div class="cart-item' + (bad ? ' sold' : '') + '">' +
          '<a href="' + SHOP + w.id + '/"><img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="lazy"></a>' +
          '<div><a class="t latin" href="' + SHOP + w.id + '/">' + esc(w.title) + '</a>' +
          '<div class="m">' + esc(meta(w)) + '</div>' +
          (bad ? '<div class="warn">' + L.warn(statusLabel(w)) + '</div>' : '') + '</div>' +
          '<div class="cart-right"><span class="price">' + (bad ? '—' : baht(w.price)) + '</span>' +
          '<button class="link-btn" type="button" data-remove="' + esc(w.id) + '">' + L.remove + '</button></div></div>';
      }).join('');

      var sub = ok.reduce(function (s, w) { return s + w.price; }, 0);
      var total = ok.length ? sub + D.shipping : 0;
      sum.innerHTML = ok.length ?
        '<div><span>' + L.subtotal(ok.length) + '</span><span>' + baht(sub) + '</span></div>' +
        '<div><span>' + L.shipping + '</span><span>' + baht(D.shipping) + '</span></div>' +
        '<div class="total"><span>' + L.total + '</span><b>' + baht(total) + '</b></div>' : '';

      hideAll();
      if (!ok.length) return;
      if (CHECKOUT && newFlow) {
        // ระบบชำระเงินอัตโนมัติ: ปุ่มเดียว → หน้าชำระเงิน (จอง 30 นาที · QR ใส่ยอด · แนบสลิป)
        var link = $('checkout-link');
        if (link) link.href = CHECKOUT + (CHECKOUT.indexOf('?') === -1 ? '?' : '&') + 'items=' + encodeURIComponent(ok.map(function (w) { return w.id; }).join(','));
        var hm = $('hold-minutes');
        if (hm && D.holdMinutes) hm.textContent = D.holdMinutes;
        newFlow.hidden = false;
      } else if (offFlow) {
        // ยังไม่ได้ใส่ลิงก์ checkout = ปิดรับชั่วคราว (แบบฟอร์ม Formspree เดิมถอดออกแล้ว 12 ต.ค. 2569)
        offFlow.hidden = false;
      }
    };
    $('cart-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]');
      if (b) { remove(b.getAttribute('data-remove')); render(); }
    });
  }

  // แสดงจากข้อมูลในไฟล์ก่อน แล้วค่อยอัปเดตด้วยสถานะจริงถ้าดึงได้
  render();
  if (page === 'cart' && !storageOk) $('storage-warn').hidden = false;
  syncLive(function (changed) { if (changed) render(); });
})();
