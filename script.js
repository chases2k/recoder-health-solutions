/* Recoder Health Solutions · Karla Hernandez
   Small, dependency-free helpers. Everything degrades gracefully if this file fails to load.
   (Language switching itself lives in lang.js; the text here is the English / Spanish for messages
   that are created by script rather than written in the HTML.) */
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

  /* ---------------- Text made by script (English / Español) ---------------- */
  const TEXT = {
    en: {
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      announceSpecial: 'Life changes? You may qualify for a Special Enrollment Period. Let’s check.',   // Jan 1 – Sep 30
      announceSoon: 'Marketplace Open Enrollment begins Nov 1. Book your free consultation early.',       // Oct 1 – Oct 31
      announceOpen: 'Open Enrollment is underway. Book a free call before your deadline.',                // Nov 1 – Dec 31
      formNeed: 'Please add your name and a valid email so Karla can reply.',
      sending: 'Sending…',
      sent: 'Thank you! Your message is on its way, and Karla will be in touch soon.',
      failed: 'That didn’t go through. Opening an email draft instead.',
      draftOpening: `Opening your email app. If nothing opens, email ${EMAIL} or call ${PHONE_DISPLAY}.`,
      subject: (name) => `Website inquiry from ${name}`,
      labels: { name: 'Name', phone: 'Phone', email: 'Email', topic: 'Interested in', language: 'Preferred language' },
      langName: 'English'
    },
    es: {
      menuOpen: 'Abrir menú',
      menuClose: 'Cerrar menú',
      announceSpecial: '¿Cambios en su vida? Podría calificar para un Período Especial de Inscripción. Revisémoslo.',
      announceSoon: 'La Inscripción Abierta del Marketplace comienza el 1 de nov. Reserve su consulta gratis con tiempo.',
      announceOpen: 'La Inscripción Abierta está en marcha. Reserve una llamada gratis antes de su fecha límite.',
      formNeed: 'Por favor, agregue su nombre y un correo electrónico válido para que Karla pueda responderle.',
      sending: 'Enviando…',
      sent: '¡Gracias! Su mensaje va en camino y Karla se comunicará con usted pronto.',
      failed: 'No se pudo enviar. Abriremos un borrador de correo en su lugar.',
      draftOpening: `Abriendo su aplicación de correo. Si no se abre, escriba a ${EMAIL} o llame al ${PHONE_DISPLAY}.`,
      subject: (name) => `Mensaje desde el sitio web de ${name}`,
      labels: { name: 'Nombre', phone: 'Teléfono', email: 'Correo', topic: 'Interesado(a) en', language: 'Idioma preferido' },
      langName: 'Español'
    }
  };
  const lang = () => (window.RHS_LANG ? window.RHS_LANG.get() : 'en');
  const tx = () => TEXT[lang()] || TEXT.en;

  /* ---------------- Footer year ---------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------- Seasonal announcement bar ----------------
     Swaps the message depending on the date so the site never looks stale.   */
  const renderAnnounce = () => {
    const el = $('#announceText');
    if (!el) return;
    const now = new Date();
    const day = (now.getMonth() + 1) * 100 + now.getDate();   // Oct 15 -> 1015
    const t = tx();
    el.textContent = day >= 1101 ? t.announceOpen : day >= 1001 ? t.announceSoon : t.announceSpecial;
  };
  renderAnnounce();

  /* ---------------- Header: scrolled state + mobile menu ---------------- */
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('#navToggle');
  const menuLabel = () => {
    if (toggle) toggle.setAttribute('aria-label', toggle.getAttribute('aria-expanded') === 'true' ? tx().menuClose : tx().menuOpen);
  };
  const setMenu = (open) => {
    if (!header || !toggle) return;
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menuLabel();
  };
  if (toggle) {
    menuLabel();
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
      data.language = tx().langName;           // lets Karla see which language the visitor was reading

      let ok = true;
      ['name', 'email'].forEach((n) => {
        const input = form.elements[n];
        const bad = !input.value.trim() || (n === 'email' && !input.checkValidity());
        input.closest('.field').classList.toggle('invalid', bad);
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (!ok) { say(tx().formNeed, true); return; }

      const openEmailDraft = () => {
        const t = tx();
        const body = [
          `${t.labels.name}: ${data.name}`,
          `${t.labels.phone}: ${data.phone || '-'}`,
          `${t.labels.email}: ${data.email}`,
          `${t.labels.topic}: ${data.topic}`,
          `${t.labels.language}: ${data.language}`,
          '',
          data.message || ''
        ].join('\n');
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(t.subject(data.name))}&body=${encodeURIComponent(body)}`;
        say(t.draftOpening);
      };

      if (!FORM_ENDPOINT) { openEmailDraft(); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      say(tx().sending);
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say(tx().sent);
      } catch (err) {
        say(tx().failed, true);
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

  /* ---------------- Language change: refresh the text this script owns ---------------- */
  window.addEventListener('langchange', () => {
    renderAnnounce();
    menuLabel();
    if (status) { status.textContent = ''; status.classList.remove('error'); }
  });
})();
