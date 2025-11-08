// main.js — Lafayette Homes (v8)
// Lightbox + Builds modal slider using exact per-slide offsets (no drift).

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

/* ---------- Homepage gallery lightbox ---------- */
(function initLightbox() {
  const lightbox = $('#lightbox');
  if (!lightbox) return;
  const img = $('img', lightbox);
  const closeBtn = $('.lightbox-close', lightbox);
  let prevFocus = null;

  function open(src, alt) {
    img.src = src;
    img.alt = alt || '';
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

/* ---------- Builds modal + slider (offset-based, clamped) ---------- */
(function initBuildsModal() {
  const openers = $$('.open-build');
  if (!openers.length) return;

  const modals = new Map();

  function initModal(modal) {
    if (!modal || modals.has(modal)) return modals.get(modal);

    const viewport = $('.build-slides', modal);   // visible frame
    const track = $('.track', modal);
    const slides = $$('.slide', modal);
    const thumbs = $$('.thumb', modal);
    const prevBtn = $('.prev', modal);
    const nextBtn = $('.next', modal);
    const closeBtn = $('.build-close', modal);
    const counter = $('.counter', modal);

    let index = 0;
    let prevFocus = null;
    let offsets = [];

    function computeOffsets() {
      // exact left offset for each slide in track coordinates
      offsets = slides.map(s => s.offsetLeft);
    }

    function setActiveThumb() {
      thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    }

    function updateCounter() {
      if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
    }

    function goTo(i, { smooth = true } = {}) {
      index = Math.max(0, Math.min(i, slides.length - 1));
      const x = offsets[index] || 0;
      track.style.transitionDuration = smooth ? '220ms' : '0ms';
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      setActiveThumb();
      updateCounter();
      // update disabled state for arrows
      prevBtn?.toggleAttribute('disabled', index === 0);
      nextBtn?.toggleAttribute('disabled', index === slides.length - 1);
    }

    function open(at = 0) {
      computeOffsets();
      goTo(at, { smooth: false });
      modal.classList.add('show');
      document.body.classList.add('modal-open');
      prevFocus = document.activeElement;
      closeBtn.focus();
      // re-measure after fonts/layout settle
      requestAnimationFrame(() => { computeOffsets(); goTo(index, { smooth: false }); });
    }

    function close() {
      modal.classList.remove('show');
      document.body.classList.remove('modal-open');
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }

    // Controls
    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));
    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Thumbs
    thumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => (modal.classList.contains('show') ? goTo(i) : open(i)));
    });

    // Keep position correct on resize/orientation change
    window.addEventListener('resize', () => {
      if (!modal.classList.contains('show')) return;
      const old = offsets[index] || 0;
      computeOffsets();
      // keep the same slide centered after reflow
      const x = offsets[index] || 0;
      // If width changed a lot, snap without animation to prevent the “two images” flash
      const smooth = Math.abs(x - old) < 8;
      goTo(index, { smooth });
    });

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') return close();
      if (e.key === 'ArrowLeft') return goTo(index - 1);
      if (e.key === 'ArrowRight') return goTo(index + 1);
      if (e.key === 'Tab') return trapFocusKeydown(e, modal);
    });

    const api = { openAt: open, close, goTo };
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
