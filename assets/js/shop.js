/* Dan's Originals — หน้ารวม · หน้ารายละเอียดภาพ · ตะกร้า
   ข้อมูลผลงานอยู่ที่ originals-data.js (ไฟล์นี้ไม่ต้องแก้เมื่อเปลี่ยนราคา/สถานะ)
   ตะกร้าเก็บในเบราว์เซอร์ของผู้ซื้อ (localStorage) · ผลงานต้นฉบับชิ้นเดียว จึงใส่ได้ชิ้นละ 1
   หน้าไหนทำอะไร ดูจาก <body data-shop="list|work|cart"> และ data-work="<id>"
   ระบบชำระเงินอัตโนมัติ (11 ต.ค. 2569): ถ้า ORIGINALS.checkout มีลิงก์ → ดึงสถานะจริง (ขายแล้ว / มีคนกำลังซื้อ / ราคา)
   จาก Sheet ผ่าน ?action=status ทุกครั้งที่เปิดหน้า แล้วแสดงใหม่ · ตะกร้าใช้ปุ่ม "ไปชำระเงิน" แทนแบบฟอร์มเดิม */
(function () {
  'use strict';

  var D = window.ORIGINALS;
  if (!D) return;
  var KEY = 'apd-cart-v1';
  var CHECKOUT = String(D.checkout || '').trim();
  var script = document.currentScript || document.querySelector('script[src*="shop.js"]');
  var base = new URL(script.src, location.href).pathname.replace(/assets\/js\/shop\.js(\?.*)?$/, '');
  var IMG = base + 'assets/img/art/';
  var SHOP = base + 'art/originals/';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function baht(n) { return '฿ ' + Number(n).toLocaleString('th-TH'); }
  function byId(id) { for (var i = 0; i < D.works.length; i++) if (D.works[i].id === id) return D.works[i]; return null; }
  // status: 'available' ขายอยู่ · 'held' มีคนกำลังซื้อ (จากระบบชำระเงิน) · 'sold' ขายแล้ว · อื่น ๆ = ไม่เปิดขาย
  function buyable(w) { return w && w.status === 'available' && w.price != null; }
  function statusLabel(w) {
    if (!w) return '';
    if (w.status === 'sold') return 'ขายแล้ว';
    if (w.status === 'held') return 'มีคนกำลังซื้อ';
    if (w.status !== 'available') return 'ไม่เปิดขายตอนนี้';
    return w.price == null ? 'สอบถามราคา' : '';
  }
  function priceText(w) { return statusLabel(w) || baht(w.price); }
  function meta(w) { return [w.year, w.medium, w.size].filter(Boolean).join(' · '); }
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
          : (ids.indexOf(w.id) !== -1 ? '<span class="sold-tag in-cart">อยู่ในตะกร้า</span>' : '');
        return '<a class="shop-card' + (off && w.price != null ? ' sold' : '') + '" href="' + SHOP + w.id + '/">' +
          '<figure class="work">' + tag + '<img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="lazy"></figure>' +
          '<span class="t">' + esc(w.title) + '</span>' +
          '<span class="m">' + esc(meta(w)) + '</span>' +
          '<span class="price">' + priceText(w) + '</span>' +
          '<span class="more">ดูรายละเอียด →</span></a>';
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
    if (!w) { box.innerHTML = '<p class="stub">ไม่พบผลงานนี้ <a class="btn" href="' + SHOP + '">กลับหน้ารวม</a></p>'; return; }
    var ch = D.series.chapters[w.chapter];
    var i = D.works.indexOf(w);
    var prev = D.works[(i - 1 + D.works.length) % D.works.length];
    var next = D.works[(i + 1) % D.works.length];

    function renderBuy() {
      var b = $('buy');
      if (!b) return;
      if (!buyable(w)) {
        b.innerHTML = w.price == null && w.status === 'available'
          ? '<a class="btn" href="mailto:artproducktion@gmail.com?subject=' + encodeURIComponent('สอบถามราคา ' + w.title) + '">สอบถามราคา →</a>'
          : '<button class="btn" type="button" disabled>' + esc(statusLabel(w)) + '</button>';
        if (inCart(w.id) && w.status !== 'available') remove(w.id);   // ขายไปแล้วระหว่างอยู่ในตะกร้า → เอาออกให้
        return;
      }
      b.innerHTML = inCart(w.id)
        ? '<p class="added">✓ อยู่ในตะกร้าแล้ว</p><a class="btn btn-primary" href="' + SHOP + 'cart/">ไปที่ตะกร้า →</a> <button class="btn" type="button" data-remove>เอาออก</button>'
        : '<button class="btn btn-primary" type="button" data-add>ใส่ตะกร้า</button>';
    }

    render = function () {
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
            '<p class="wk-price">' + priceText(w) + '</p>' +
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
        list.innerHTML = '<div class="cart-empty"><p class="muted">ตะกร้ายังว่าง</p><a class="btn" href="' + SHOP + '#works">เลือกชมผลงาน →</a></div>';
        sum.innerHTML = ''; hideAll();
        return;
      }
      list.innerHTML = items.map(function (w) {
        var bad = !buyable(w);
        return '<div class="cart-item' + (bad ? ' sold' : '') + '">' +
          '<a href="' + SHOP + w.id + '/"><img src="' + IMG + esc(w.img) + '" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '" loading="lazy"></a>' +
          '<div><a class="t latin" href="' + SHOP + w.id + '/">' + esc(w.title) + '</a>' +
          '<div class="m">' + esc(meta(w)) + '</div>' +
          (bad ? '<div class="warn">ชิ้นนี้' + esc(statusLabel(w) || 'สั่งซื้อไม่ได้') + ' ไม่นับรวมในยอด</div>' : '') + '</div>' +
          '<div class="cart-right"><span class="price">' + (bad ? '—' : baht(w.price)) + '</span>' +
          '<button class="link-btn" type="button" data-remove="' + esc(w.id) + '">เอาออก</button></div></div>';
      }).join('');

      var sub = ok.reduce(function (s, w) { return s + w.price; }, 0);
      var total = ok.length ? sub + D.shipping : 0;
      sum.innerHTML = ok.length ?
        '<div><span>ราคาผลงาน (' + ok.length + ' ชิ้น)</span><span>' + baht(sub) + '</span></div>' +
        '<div><span>ค่าจัดส่ง (ต่อการสั่งซื้อ)</span><span>' + baht(D.shipping) + '</span></div>' +
        '<div class="total"><span>ยอดรวมที่ต้องโอน</span><b>' + baht(total) + '</b></div>' : '';

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
