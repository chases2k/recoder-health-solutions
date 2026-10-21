/* Recoder Health Solutions · English / Español switcher
   ------------------------------------------------------------------
   How it works (no build step):
   - The English text lives in the HTML as normal, so search engines and no-JS visitors always get English.
   - Any element with  data-es="..."  gets that Spanish HTML when Spanish is chosen, and its English back
     when English is chosen.
   - Attributes can be translated too:  data-es-alt, data-es-aria-label, data-es-content, data-es-title,
     data-es-placeholder.
   - The choice is remembered in the visitor's own browser (localStorage).
   - First visit: Spanish if the browser is set to Spanish, otherwise English.
   - Share a Spanish link with  https://recoderhealthsolutions.com/?lang=es
   Exposes window.RHS_LANG = { get(), set(code) } and fires a "langchange" event on window.            */
(() => {
  'use strict';

  const KEY = 'rhs-lang';
  const SUPPORTED = ['en', 'es'];
  const ATTRS = ['alt', 'aria-label', 'content', 'title', 'placeholder'];
  const root = document.documentElement;

  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: just don't remember */ } };

  // Which language to start in: ?lang= link, then saved choice, then the browser's language.
  const fromUrl = new URLSearchParams(location.search).get('lang');
  let lang = SUPPORTED.includes(fromUrl) ? fromUrl : null;
  if (lang) write(lang);
  if (!lang && SUPPORTED.includes(read())) lang = read();
  if (!lang) {
    const nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    lang = nav.startsWith('es') ? 'es' : 'en';
  }

  function setButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang));
    });
  }

  function apply() {
    root.lang = lang;

    document.querySelectorAll('[data-es]').forEach((el) => {
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);   // remember the English
      el.innerHTML = lang === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
    });

    ATTRS.forEach((a) => {
      document.querySelectorAll('[data-es-' + a + ']').forEach((el) => {
        if (!el.hasAttribute('data-en-' + a)) el.setAttribute('data-en-' + a, el.getAttribute(a) || '');
        el.setAttribute(a, el.getAttribute(lang === 'es' ? 'data-es-' + a : 'data-en-' + a));
      });
    });

    setButtons();
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function set(next) {
    if (!SUPPORTED.includes(next) || next === lang) return;
    lang = next;
    write(lang);
    apply();
  }

  window.RHS_LANG = { get: () => lang, set };

  document.querySelectorAll('[data-lang-btn]').forEach((b) => {
    b.addEventListener('click', () => set(b.dataset.langBtn));
  });

  setButtons();
  if (lang === 'es') apply();          // English is already in the HTML, nothing to do for it
})();
