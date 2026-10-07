/* Dan's Originals — หน้ารวม · หน้ารายละเอียดภาพ · ตะกร้า
   ข้อมูลผลงานอยู่ที่ originals-data.js (ไฟล์นี้ไม่ต้องแก้เมื่อเปลี่ยนราคา/สถานะ)
   ตะกร้าเก็บในเบราว์เซอร์ของผู้ซื้อ (localStorage) · ผลงานต้นฉบับชิ้นเดียว จึงใส่ได้ชิ้นละ 1
   หน้าไหนทำอะไร ดูจาก <body data-shop="list|work|cart"> และ data-work="<id>" */
(function () {
  'use strict';

  var D = window.ORIGINALS;
  if (!D) return;
  var KEY = 'apd-cart-v1';
  var script = document.currentScript || document.querySelector('script[src*="shop.js"]');
  var base = new URL(script.src, location.href).pathname.replace(/assets\/js\/shop\.js(\?.*)?$/, '');
  var IMG = base + 'assets/img/art/';
  var SHOP = base + 'art/originals/';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function baht(n) { return '฿ ' + Number(n).toLocaleString('th-TH'); }
  function byId(id) { for (var i = 0; i < D.works.length; i++) if (D.works[i].id === id) return D.works[i]; return null; }
  function buyable(w) { return w && w.status !== 'sold' && w.price != null; }
  function meta(w) { return [w.year, w.medium, w.size].filter(Boolean).join(' · '); }
  function $(id) { return document.getElementById(id); }

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

  // ── หน้ารวม ──
  if (page === 'list') {
    var grid = $('grid');
    var ids = cartIds();
    grid.innerHTML = D.works.map(function (w) {
      var sold = w.status === 'sold';
      var tag = sold ? '<span class="sold-tag">ขายแล้ว</span>' : (ids.indexOf(w.id) !== -1 ? '<span class="sold-tag in-cart">อยู่ในตะกร้า</span>' : '');
      return '<a class="shop-card' + (sold ? ' sold' : '') + '" href="' + SHOP + w.id + '/">' +
        '<figure class="work">' + tag + '<img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="lazy"></figure>' +
        '<span class="t">' + esc(w.title) + '</span>' +
        '<span class="m">' + esc(meta(w)) + '</span>' +
        '<span class="price">' + (sold ? 'ขายแล้ว' : (w.price == null ? 'สอบถามราคา' : baht(w.price))) + '</span>' +
        '<span class="more">ดูรายละเอียด →</span></a>';
    }).join('');
  }

  // ── หน้ารายละเอียดภาพ ──
  if (page === 'work') {
    var id = document.body.getAttribute('data-work');
    var w = byId(id);
    var box = $('work');
    if (!w) { box.innerHTML = '<p class="stub">ไม่พบผลงานนี้ <a class="btn" href="' + SHOP + '">กลับหน้ารวม</a></p>'; return; }
    var ch = D.series.chapters[w.chapter];
    var i = D.works.indexOf(w);
    var prev = D.works[(i - 1 + D.works.length) % D.works.length];
    var next = D.works[(i + 1) % D.works.length];

    box.innerHTML =
      '<div class="wk">' +
        '<figure class="work wk-img"><img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="eager"></figure>' +
        '<div class="wk-info">' +
          '<p class="label">Dan\'s Originals · <span class="th">ชุดที่ 1</span></p>' +
          '<h1 class="latin wk-title">' + esc(w.title) + '</h1>' +
          '<dl class="specs">' +
            '<div><dt>ปีที่สร้าง</dt><dd>' + esc(w.year) + '</dd></div>' +
            '<div><dt>เทคนิค</dt><dd>' + esc(w.medium) + '</dd></div>' +
            '<div><dt>ขนาด</dt><dd>' + esc(w.size) + '</dd></div>' +
            '<div><dt>ชุดผลงาน</dt><dd>' + esc(D.series.title) + (ch ? '<br><span class="dim">บท ' + esc(w.chapter) + ' · ' + esc(ch.name) + '</span>' : '') + '</dd></div>' +
          '</dl>' +
          '<p class="wk-price">' + (w.status === 'sold' ? 'ขายแล้ว' : (w.price == null ? 'สอบถามราคา' : baht(w.price))) + '</p>' +
          '<div id="buy" class="wk-buy"></div>' +
          '<ul class="wk-notes">' +
            '<li>ผลงานต้นฉบับชิ้นเดียวในโลก ไม่ใช่ภาพพิมพ์</li>' +
            '<li>ลงนามโดยศิลปิน · พร้อมใบรับรองงานแท้</li>' +
            '<li>จำหน่ายและจัดส่งเฉพาะในประเทศไทย · ค่าจัดส่ง ' + baht(D.shipping) + ' ต่อการสั่งซื้อ</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      (w.story ? '<section class="wk-sec measure"><p class="label">Story · <span class="th">เรื่องราวของภาพ</span></p><p class="wk-story">' + esc(w.story) + '</p></section>' : '') +
      (ch ? '<section class="wk-sec measure"><p class="label">Concept · <span class="th">จากนิทรรศการ</span></p>' +
        '<h2>บท ' + esc(w.chapter) + ' · ' + esc(ch.name) + ' <span class="latin dim">' + esc(ch.en) + '</span></h2>' +
        '<p class="muted">' + ch.concept + '</p>' +
        '<a class="btn" href="' + base + D.series.exhibition + '">ชมนิทรรศการเต็ม →</a></section>' : '') +
      '<nav class="wk-nav" aria-label="ผลงานอื่น">' +
        '<a href="' + SHOP + prev.id + '/"><span class="dim">← ก่อนหน้า</span><span class="latin">' + esc(prev.title) + '</span></a>' +
        '<a href="' + SHOP + '#works" class="all">ผลงานทั้งหมด</a>' +
        '<a href="' + SHOP + next.id + '/" class="nx"><span class="dim">ถัดไป →</span><span class="latin">' + esc(next.title) + '</span></a>' +
      '</nav>';

    function renderBuy() {
      var b = $('buy');
      if (!buyable(w)) {
        b.innerHTML = w.status === 'sold' ? '<button class="btn" type="button" disabled>ขายแล้ว</button>'
          : '<a class="btn" href="mailto:dan.pittore@icloud.com?subject=' + encodeURIComponent('สอบถามราคา ' + w.title) + '">สอบถามราคา →</a>';
        return;
      }
      b.innerHTML = inCart(w.id)
        ? '<p class="added">✓ อยู่ในตะกร้าแล้ว</p><a class="btn btn-primary" href="' + SHOP + 'cart/">ไปที่ตะกร้า →</a> <button class="btn" type="button" data-remove>เอาออก</button>'
        : '<button class="btn btn-primary" type="button" data-add>ใส่ตะกร้า</button>';
    }
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-add]')) { add(w.id); renderBuy(); }
      if (e.target.closest('[data-remove]')) { remove(w.id); renderBuy(); }
    });
    renderBuy();
  }

  // ── ตะกร้า ──
  if (page === 'cart') {
    function renderCart() {
      var ids = cartIds();
      var items = ids.map(byId);
      var ok = items.filter(buyable);
      var gone = items.filter(function (w) { return !buyable(w); });
      var list = $('cart-list'), sum = $('cart-sum'), checkout = $('checkout');

      if (!items.length) {
        list.innerHTML = '<div class="cart-empty"><p class="muted">ตะกร้ายังว่าง</p><a class="btn" href="' + SHOP + '#works">เลือกชมผลงาน →</a></div>';
        sum.innerHTML = ''; checkout.hidden = true;
        return;
      }
      list.innerHTML = items.map(function (w) {
        var bad = !buyable(w);
        return '<div class="cart-item' + (bad ? ' sold' : '') + '">' +
          '<a href="' + SHOP + w.id + '/"><img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="lazy"></a>' +
          '<div><a class="t latin" href="' + SHOP + w.id + '/">' + esc(w.title) + '</a>' +
          '<div class="m">' + esc(meta(w)) + '</div>' +
          (bad ? '<div class="warn">ชิ้นนี้ขายแล้ว ไม่นับรวมในยอด</div>' : '') + '</div>' +
          '<div class="cart-right"><span class="price">' + (bad ? '—' : baht(w.price)) + '</span>' +
          '<button class="link-btn" type="button" data-remove="' + esc(w.id) + '">เอาออก</button></div></div>';
      }).join('');

      var sub = ok.reduce(function (s, w) { return s + w.price; }, 0);
      var total = ok.length ? sub + D.shipping : 0;
      sum.innerHTML = ok.length ?
        '<div><span>ราคาผลงาน (' + ok.length + ' ชิ้น)</span><span>' + baht(sub) + '</span></div>' +
        '<div><span>ค่าจัดส่ง (ต่อการสั่งซื้อ)</span><span>' + baht(D.shipping) + '</span></div>' +
        '<div class="total"><span>ยอดรวมที่ต้องโอน</span><b>' + baht(total) + '</b></div>' : '';
      checkout.hidden = !ok.length;

      // ข้อมูลที่แนบไปกับแบบฟอร์ม (เข้าอีเมลศิลปิน)
      $('f-works').value = ok.map(function (w) { return w.title + ' — ' + baht(w.price); }).join('\n');
      $('f-total').value = ok.length ? baht(total) + ' (รวมค่าจัดส่ง ' + baht(D.shipping) + ')' : '';
      if (gone.length && !ok.length) checkout.hidden = true;
    }
    $('cart-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]');
      if (b) { remove(b.getAttribute('data-remove')); renderCart(); }
    });
    renderCart();
    if (!storageOk) $('storage-warn').hidden = false;
  }
})();
