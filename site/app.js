/* xWriter's proxy websites (26 section 8.4): the language switch, the ages counted from the
   times in the page, Copy and the QR box. Every template's page carries the same data-*
   attributes (internal/sitebuild, doc.go); the page reads well without this script. */
(function () {
  'use strict';
  var T = {"en":{"checked":"checked {ago}","close":"Close","connect":"Connect","copied":"Copied","copy":"Copy","copy_failed":"Not copied","day":"{n} days ago","day_one":"1 day ago","empty":"No working proxy right now. Check again soon.","failed":"Failed to connect","failed_from":"Failed to connect from {place}","hour":"{n} hours ago","hour_one":"1 hour ago","lang":"Language","min":"{n} minutes ago","min_one":"1 minute ago","now":"just now","number":"#{n}","offline":"Offline","ping":"{n} ms","qr":"QR code","qr_hint":"Point your phone's camera at the code: Telegram opens with this proxy.","qr_title":"Scan to connect","since":"went offline {ago}","speed_fair":"Fair","speed_fast":"Fast","speed_slow":"Slow","summary":"{count} · updated {ago}","unknown":"Unknown","updated":"Updated {time}","working":"{n} working proxies","working_one":"1 working proxy"},"fa":{"checked":"آخرین بررسی {ago}","close":"بستن","connect":"اتصال","copied":"کپی شد","copy":"کپی","copy_failed":"کپی نشد","day":"{n} روز پیش","day_one":"{n} روز پیش","empty":"فعلاً پروکسی فعالی نیست. کمی بعد دوباره سر بزنید.","failed":"اتصال برقرار نشد","failed_from":"اتصال از {place} برقرار نشد","hour":"{n} ساعت پیش","hour_one":"{n} ساعت پیش","lang":"زبان","min":"{n} دقیقه پیش","min_one":"{n} دقیقه پیش","now":"همین حالا","number":"#{n}","offline":"آفلاین","ping":"{n} میلی‌ثانیه","qr":"کد QR","qr_hint":"دوربین گوشی را روی کد بگیرید تا تلگرام با این پروکسی باز شود.","qr_title":"برای اتصال اسکن کنید","since":"آفلاین از {ago}","speed_fair":"متوسط","speed_fast":"سریع","speed_slow":"کند","summary":"{count} · به‌روزشده {ago}","unknown":"نامشخص","updated":"به‌روزشده در {time}","working":"{n} پروکسی فعال","working_one":"{n} پروکسی فعال"},"digits":"۰۱۲۳۴۵۶۷۸۹"};
  var doc = document;
  var root = doc.documentElement;
  var KEY = 'xw-lang';
  var lang = root.getAttribute('lang') === 'fa' ? 'fa' : 'en';
  if (!T) {
    return;
  }
  root.classList.add('js');

  // The visitor's choice of language, read in a try: a blocked storage only means the site's
  // own language.
  function stored() {
    try {
      return window.localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }
  function store(l) {
    try {
      window.localStorage.setItem(KEY, l);
    } catch (e) {
      /* a blocked storage only forgets the choice */
    }
  }
  function all(selector) {
    return Array.prototype.slice.call(doc.querySelectorAll(selector));
  }
  // digits writes the digits of s in the shown language: Persian digits in Persian.
  function digits(s) {
    s = String(s);
    if (lang !== 'fa') {
      return s;
    }
    return s.replace(/[0-9]/g, function (d) {
      return T.digits.charAt(+d);
    });
  }
  function text(key, vars) {
    var s = T[lang][key] || '';
    if (!vars) {
      return s;
    }
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      return Object.prototype.hasOwnProperty.call(vars, k) ? vars[k] : m;
    });
  }
  // ago says how long ago the time iso was, counted now in the visitor's browser.
  function ago(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) {
      return '';
    }
    var s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 45) {
      return text('now');
    }
    var m = Math.round(s / 60);
    if (m < 60) {
      return text(m === 1 ? 'min_one' : 'min', { n: digits(m) });
    }
    var h = Math.round(s / 3600);
    if (h < 24) {
      return text(h === 1 ? 'hour_one' : 'hour', { n: digits(h) });
    }
    var d = Math.round(s / 86400);
    return text(d === 1 ? 'day_one' : 'day', { n: digits(d) });
  }
  // when writes the time iso in the visitor's own time zone; Persian takes its own calendar.
  function when(iso) {
    var t = new Date(iso);
    if (isNaN(t.getTime())) {
      return '';
    }
    try {
      return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-GB', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(t);
    } catch (e) {
      return digits(iso.slice(0, 16).replace('T', ' ')) + ' UTC';
    }
  }
  function at(el) {
    return el.getAttribute('data-at') || '';
  }
  // The texts made of numbers and times, by data-f.
  var formats = {
    summary: function (el) {
      var n = +el.getAttribute('data-n');
      var count = text(n === 1 ? 'working_one' : 'working', { n: digits(n) });
      return at(el) ? text('summary', { count: count, ago: ago(at(el)) }) : count;
    },
    ping: function (el) {
      return text('ping', { n: digits(el.getAttribute('data-n')) });
    },
    num: function (el) {
      return digits(el.getAttribute('data-n'));
    },
    number: function (el) {
      return text('number', { n: digits(el.getAttribute('data-n')) });
    },
    checked: function (el) {
      return text('checked', { ago: ago(at(el)) });
    },
    since: function (el) {
      return text('since', { ago: ago(at(el)) });
    },
    updated: function (el) {
      return text('updated', { time: when(at(el)) });
    },
    failed: function (el) {
      var name = el.getAttribute('data-' + lang);
      if (!name) {
        return text('failed');
      }
      var flag = el.getAttribute('data-place-flag');
      return text('failed_from', { place: (flag ? flag + ' ' : '') + name });
    }
  };
  function times() {
    all('[data-f]').forEach(function (el) {
      var format = formats[el.getAttribute('data-f')];
      if (format) {
        el.textContent = format(el);
      }
    });
  }
  // apply shows the page in l, in place: the direction, the texts, the owner's texts and the
  // countries' names in l, the switch, and the numbers and times.
  function apply(l) {
    lang = l === 'fa' ? 'fa' : 'en';
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    all('[data-t]').forEach(function (el) {
      el.textContent = text(el.getAttribute('data-t'));
    });
    all('[data-ta]').forEach(function (el) {
      el.setAttribute('aria-label', text(el.getAttribute('data-ta')));
    });
    all('[data-en]:not([data-f])').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v !== null) {
        el.textContent = v;
      }
    });
    all('[data-set-lang]').forEach(function (el) {
      el.setAttribute('aria-pressed', el.getAttribute('data-set-lang') === lang ? 'true' : 'false');
    });
    times();
  }

  // Copy copies the card's link; without the clipboard of a secure page, through a hidden box.
  function legacyCopy(link) {
    return new Promise(function (resolve, reject) {
      var box = doc.createElement('textarea');
      box.value = link;
      box.setAttribute('readonly', '');
      box.className = 'xw-copy';
      doc.body.appendChild(box);
      box.select();
      var done = false;
      try {
        done = doc.execCommand('copy');
      } catch (e) {
        done = false;
      }
      doc.body.removeChild(box);
      if (done) {
        resolve();
      } else {
        reject(new Error('not copied'));
      }
    });
  }
  function copy(link) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(link).catch(function () {
        return legacyCopy(link);
      });
    }
    return legacyCopy(link);
  }
  // flash shows Copied (or Not copied) on the button for a moment.
  function flash(button, key) {
    var label = button.querySelector('[data-t]');
    var icon = button.querySelector('use');
    var live = doc.getElementById('xw-live');
    if (label) {
      label.textContent = text(key);
    }
    if (icon && key === 'copied') {
      icon.setAttribute('href', '#i-check');
    }
    if (live) {
      live.textContent = text(key);
    }
    button.classList.remove('done', 'fail');
    button.classList.add(key === 'copied' ? 'done' : 'fail');
    clearTimeout(button.xwTimer);
    button.xwTimer = setTimeout(function () {
      if (label) {
        label.textContent = text(label.getAttribute('data-t'));
      }
      if (icon) {
        icon.setAttribute('href', '#i-copy');
      }
      button.classList.remove('done', 'fail');
    }, 1600);
  }

  // The QR box: its picture is loaded only when it opens.
  var qrBox = doc.getElementById('xw-qr');
  var qrImage = doc.getElementById('xw-qr-img');
  var qrFor = doc.getElementById('xw-qr-for');
  var opener = null;
  function openQR(button) {
    if (!qrBox || !qrImage) {
      return;
    }
    qrImage.src = button.getAttribute('data-qr');
    var row = button.closest('[data-proxy]');
    if (qrFor && row) {
      var flag = row.querySelector('[data-flag]');
      var number = row.querySelector('[data-f="number"]');
      var name = row.querySelector('[data-cname]');
      qrFor.textContent = (flag && flag.textContent ? flag.textContent + ' ' : '') +
        (number ? number.textContent + ' ' : '') + (name ? name.textContent : '');
    }
    opener = button;
    if (typeof qrBox.showModal === 'function') {
      qrBox.showModal();
    } else {
      qrBox.setAttribute('open', '');
    }
  }
  function closeQR() {
    if (!qrBox) {
      return;
    }
    if (typeof qrBox.close === 'function') {
      qrBox.close();
    } else {
      qrBox.removeAttribute('open');
      if (opener) {
        opener.focus();
        opener = null;
      }
    }
  }
  if (qrBox) {
    qrBox.addEventListener('click', function (e) {
      if (e.target === qrBox) {
        closeQR();
      }
    });
    qrBox.addEventListener('close', function () {
      if (opener) {
        opener.focus();
        opener = null;
      }
    });
  }

  doc.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-set-lang],[data-copy],[data-qr],[data-qr-close]') : null;
    if (!el) {
      return;
    }
    if (el.hasAttribute('data-set-lang')) {
      apply(el.getAttribute('data-set-lang'));
      store(lang);
    } else if (el.hasAttribute('data-copy')) {
      copy(el.getAttribute('data-copy')).then(function () {
        flash(el, 'copied');
      }, function () {
        flash(el, 'copy_failed');
      });
    } else if (el.hasAttribute('data-qr')) {
      openQR(el);
    } else {
      closeQR();
    }
  });

  var chosen = stored();
  apply(chosen === 'en' || chosen === 'fa' ? chosen : lang);
  setInterval(times, 30000);
  doc.addEventListener('visibilitychange', function () {
    if (!doc.hidden) {
      times();
    }
  });
})();
