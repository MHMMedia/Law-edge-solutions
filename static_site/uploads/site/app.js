/* ===========================================================
   Law Edge Solutions ,  local rebuild interactivity
   Vanilla JS, no dependencies. Loaded on every page.
   =========================================================== */
(function () {
  'use strict';

  /* ---- Sticky header shadow on scroll ---- */
  var header = document.querySelector('header.site');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile drawer ---- */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('open');
      drawer.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open');
        drawer.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.qa').forEach(function (qa) {
    var btn = qa.querySelector('button');
    var ans = qa.querySelector('.ans');
    if (!btn || !ans) return;
    btn.addEventListener('click', function () {
      var isOpen = qa.classList.contains('open');
      // close siblings within the same .faq group for an accordion feel
      var group = qa.closest('.faq');
      if (group) {
        group.querySelectorAll('.qa.open').forEach(function (o) {
          if (o !== qa) {
            o.classList.remove('open');
            o.querySelector('.ans').style.maxHeight = null;
            var ob = o.querySelector('button'); if (ob) ob.setAttribute('aria-expanded', 'false');
          }
        });
      }
      qa.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      ans.style.maxHeight = isOpen ? null : ans.scrollHeight + 'px';
    });
  });

  /* ---- Testimonial rotator ---- */
  var stage = document.querySelector('.tstage');
  if (stage) {
    var slides = Array.prototype.slice.call(stage.querySelectorAll('.tslide'));
    var dotsWrap = document.querySelector('.tnav');
    var i = 0, timer = null;
    var go = function (n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
      if (dotsWrap) dotsWrap.querySelectorAll('.tdot').forEach(function (d, k) {
        d.classList.toggle('active', k === i);
      });
    };
    if (dotsWrap) {
      slides.forEach(function (_, k) {
        var d = document.createElement('button');
        d.className = 'tdot' + (k === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Testimonial ' + (k + 1));
        d.addEventListener('click', function () { go(k); restart(); });
        dotsWrap.appendChild(d);
      });
    }
    var restart = function () { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6000); };
    go(0); restart();
  }

  /* ---- Blog category filter ---- */
  var chips = document.querySelectorAll('.chip');
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var cat = chip.getAttribute('data-cat');
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        document.querySelectorAll('.post').forEach(function (p) {
          var show = cat === 'all' || (p.getAttribute('data-cat') || '').indexOf(cat) > -1;
          p.style.display = show ? 'flex' : 'none';
        });
      });
    });
  }

  /* ---- Contact form validation ----
     Forms marked [data-remote] POST to form.action; the rest stay front-end only. */
  var form = document.querySelector('form.contact-form');
  if (form) {
    var ok = form.querySelector('.form-ok');
    var err = form.querySelector('.form-err');
    var remote = form.hasAttribute('data-remote');
    var sending = false;

    var showError = function (msg) {
      if (err) { err.textContent = msg; err.classList.add('show'); }
      else { alert(msg); }
    };
    var succeed = function () {
      if (err) err.classList.remove('show');
      if (ok) { ok.classList.add('show'); ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      form.reset();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        var bad = !input.value.trim();
        if (input.type === 'email' && input.value) {
          bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        }
        if (field) field.classList.toggle('invalid', bad);
        if (bad) valid = false;
      });
      if (!valid) return;

      if (!remote) { succeed(); return; }

      var btn = form.querySelector('button[type=submit]');
      sending = true;
      if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.textContent = 'Sending…'; }
      if (err) err.classList.remove('show');

      fetch(form.action, { method: 'POST', body: new FormData(form) })
        .then(function (res) {
          return res.json().catch(function () { return {}; })
            .then(function (data) { return { res: res, data: data }; });
        })
        .then(function (r) {
          if (r.res.ok) succeed();
          else showError(r.data.error || 'Something went wrong. Please email us directly.');
        })
        .catch(function () {
          showError('Network error. Please email us directly.');
        })
        .then(function () {
          sending = false;
          if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.label; }
          if (window.turnstile) window.turnstile.reset();
        });
    });
    form.querySelectorAll('input,textarea,select').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('invalid');
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = null;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }
})();
