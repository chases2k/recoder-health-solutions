/* Recoder Health Solutions · Karla Hernandez
   Small, dependency-free helpers. Everything degrades gracefully if this file fails to load. */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     SETTINGS: the only things you need to touch
     ------------------------------------------------------------------ */
  // To get contact-form messages delivered straight to your inbox (instead of opening an email
  // draft), create a free form at formspree.io (or similar) and paste its URL here, e.g.
  //   const FORM_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
  const FORM_ENDPOINT = '';
  const EMAIL = 'recoderhealth@gmail.com';
  const PHONE_DISPLAY = '832-366-4080';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------- Seasonal announcement bar ----------------
     Swaps the message depending on the date so the site never looks stale.   */
  (() => {
    const el = $('#announceText');
    if (!el) return;
    const now = new Date();
    const day = (now.getMonth() + 1) * 100 + now.getDate();   // Oct 15 -> 1015
    let msg = 'Life changes? You may qualify for a Special Enrollment Period. Let’s check.';   // Jan 1 – Sep 30
    if (day >= 1101)      msg = 'Open Enrollment is underway. Book a free call before your deadline.';              // Nov 1 – Dec 31
    else if (day >= 1001) msg = 'Marketplace Open Enrollment begins Nov 1. Book your free consultation early.';    // Oct 1 – Oct 31
    el.textContent = msg;
  })();

  /* ---------------- Header: scrolled state + mobile menu ---------------- */
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('#navToggle');
  const setMenu = (open) => {
    if (!header || !toggle) return;
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (toggle) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => { if (header && !header.contains(e.target)) setMenu(false); });
  }

  /* ---------------- Scroll reveal (with stagger inside grids) ---------------- */
  $$('[data-stagger]').forEach((group) => {
    $$('.reveal', group).forEach((el, i) => el.style.setProperty('--rd', `${i * 0.09}s`));
  });
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------------- Current-section highlight in the nav ---------------- */
  (() => {
    if (!('IntersectionObserver' in window)) return;
    const links = new Map($$('#nav a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
    const sections = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const a = links.get(en.target.id);
        if (a && en.isIntersecting) { links.forEach((l) => l.classList.remove('is-current')); a.classList.add('is-current'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  })();

  /* ---------------- Gentle parallax on the hero (desktop, pointer only) ---------------- */
  (() => {
    const visual = $('.hero-visual');
    if (!visual || reduceMotion || !window.matchMedia('(hover: hover) and (min-width: 961px)').matches) return;
    const layers = $$('[data-depth]', visual);
    let raf = 0;
    visual.closest('.hero').addEventListener('pointermove', (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => layers.forEach((l) => {
        const k = parseFloat(l.dataset.depth);
        l.style.translate = `${(x * k).toFixed(1)}px ${(y * k).toFixed(1)}px`;
      }));
    });
  })();

  /* ---------------- Contact tabs (Book a call / Send a message) ---------------- */
  const tabs = $$('.tab');
  const panels = { schedule: $('#panel-schedule'), message: $('#panel-message') };
  const selectTab = (name, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    Object.entries(panels).forEach(([k, p]) => { if (p) p.hidden = k !== name; });
    if (name === 'schedule') loadCalendly();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t.dataset.tab));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].dataset.tab, true);
      }
    });
  });
  // Any link with data-tab (e.g. "Book a free call") jumps to the contact section on that tab.
  $$('a[data-tab]').forEach((a) => a.addEventListener('click', () => selectTab(a.dataset.tab)));

  /* ---------------- Calendly (loaded only when the contact area is near) ---------------- */
  let calendlyLoaded = false;
  function loadCalendly() {
    if (calendlyLoaded) return;
    calendlyLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    document.head.appendChild(s);
  }
  const contact = $('#contact');
  if (contact && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { loadCalendly(); io.disconnect(); }
    }, { rootMargin: '900px 0px' });
    io.observe(contact);
  } else {
    loadCalendly();
  }

  /* ---------------- Contact form ---------------- */
  const form = $('#contactForm');
  const status = $('#formStatus');
  if (form) {
    const say = (text, isError = false) => {
      status.textContent = text;
      status.classList.toggle('error', isError);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      say('');
      if (form.elements.website && form.elements.website.value) return;       // honeypot: bots only

      const data = Object.fromEntries(new FormData(form).entries());
      delete data.website;

      let ok = true;
      ['name', 'email'].forEach((n) => {
        const input = form.elements[n];
        const bad = !input.value.trim() || (n === 'email' && !input.checkValidity());
        input.closest('.field').classList.toggle('invalid', bad);
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (!ok) { say('Please add your name and a valid email so Karla can reply.', true); return; }

      const openEmailDraft = () => {
        const subject = `Website inquiry from ${data.name}`;
        const body = [
          `Name: ${data.name}`,
          `Phone: ${data.phone || '-'}`,
          `Email: ${data.email}`,
          `Interested in: ${data.topic}`,
          '',
          data.message || ''
        ].join('\n');
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        say(`Opening your email app. If nothing opens, email ${EMAIL} or call ${PHONE_DISPLAY}.`);
      };

      if (!FORM_ENDPOINT) { openEmailDraft(); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      say('Sending…');
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say('Thank you! Your message is on its way, and Karla will be in touch soon.');
      } catch (err) {
        say('That didn’t go through. Opening an email draft instead.', true);
        openEmailDraft();
      } finally {
        btn.disabled = false;
      }
    });

    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f) f.classList.remove('invalid');
    });
  }
})();
