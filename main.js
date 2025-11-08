// main.js — Lafayette Homes

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function getFocusable(container) {
  return Array.from(
    container.querySelectorAll(
      'a, button, input, textarea, select, details, summary, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);
}
function trapFocusKeydown(e, container) {
  if (e.key !== 'Tab') return;
  const f = getFocusable(container);
  if (!f.length) return e.preventDefault();
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

/* Lightbox on homepage */
(function initLightbox() {
  const lightbox = $('#lightbox');
  if (!lightbox) return;
  const img = $('img', lightbox);
  const closeBtn = $('.lightbox-close', lightbox);
  let prevFocus = null;

  function open(src, alt) {
    img.src = src; img.alt = alt || '';
    lightbox.classList.add('show');
    document.body.classList.add('modal-open');
    prevFocus = document.activeElement;
    closeBtn.focus();
  }
  function close() {
    lightbox.classList.remove('show');
    document.body.classList.remove('modal-open');
    img.src = '';
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }
  $$('.glight').forEach((el) => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => open(el.currentSrc || el.src, el.alt));
  });
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocusKeydown(e, lightbox);
  });
})();

/* Builds modal + slider */
(function initBuildsModal() {
  const openers = $$('.open-build');
  if (!openers.length) return;

  const modals = new Map();

  function initModal(modal) {
    if (!modal || modals.has(modal)) return modals.get(modal);

    const track = $('.track', modal);
    const slides = $$('.slide', modal);
    const thumbs = $$('.thumb', modal);
    const prevBtn = $('.prev', modal);
    const nextBtn = $('.next', modal);
    const closeBtn = $('.build-close', modal);
    const counter = $('.counter', modal);

    let index = 0;
    let prevFocus = null;

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
      thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    }
    function go(n) { index = (n + slides.length) % slides.length; update(); }
    function open(at = 0) {
      index = Math.max(0, Math.min(at, slides.length - 1));
      update();
      modal.classList.add('show');
      document.body.classList.add('modal-open');
      prevFocus = document.activeElement;
      closeBtn.focus();
    }
    function close() {
      modal.classList.remove('show');
      document.body.classList.remove('modal-open');
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }

    prevBtn?.addEventListener('click', () => go(index - 1));
    nextBtn?.addEventListener('click', () => go(index + 1));
    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    thumbs.forEach((btn, i) => btn.addEventListener('click', () => (modal.classList.contains('show') ? go(i) : open(i))));
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') return close();
      if (e.key === 'ArrowLeft') return go(index - 1);
      if (e.key === 'ArrowRight') return go(index + 1);
      if (e.key === 'Tab') return trapFocusKeydown(e, modal);
    });

    const api = { openAt: open, close, go };
    modals.set(modal, api);
    return api;
  }

  openers.forEach((btn) => {
    const id = btn.getAttribute('data-build');
    const modal = document.getElementById(`build-${id}`);
    const api = initModal(modal);
    btn.addEventListener('click', () => api.openAt(0));
  });
})();
