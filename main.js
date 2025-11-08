// ---------- Simple gallery lightbox for home ----------
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbClose = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.glight').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lightbox.classList.add('show');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  const closeLB = () => {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  lbClose?.addEventListener('click', closeLB);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLB();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('show')) closeLB();
  });
}

// ---------- Smooth scroll for in-page anchors ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---------- Build modal slider (robust) ----------
(function () {
  const modals = document.querySelectorAll('.build-modal');

  function initSlider(root) {
    const slidesEl = root.querySelector('.build-slides');
    if (!slidesEl) return;
    const track = slidesEl.querySelector('.track');
    const slides = Array.from(track.querySelectorAll('.slide'));
    const prevBtn = slidesEl.querySelector('.prev');
    const nextBtn = slidesEl.querySelector('.next');
    const counter = slidesEl.querySelector('.counter');
    const thumbs = Array.from(slidesEl.querySelectorAll('.thumb'));
    let index = 0;
    let touchStart = null;

    function render() {
      track.style.transform = `translateX(${-index * 100}%)`;
      if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
      thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    }

    function prev() { index = (index - 1 + slides.length) % slides.length; render(); }
    function next() { index = (index + 1) % slides.length; render(); }
    function go(i) { index = Math.max(0, Math.min(slides.length - 1, i)); render(); }

    // Buttons
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Thumbs
    thumbs.forEach(t => t.addEventListener('click', () => go(parseInt(t.dataset.i, 10))));

    // Swipe
    slidesEl.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
    }, { passive: true });

    slidesEl.addEventListener('touchend', (e) => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) (dx > 0 ? prev() : next());
      touchStart = null;
    });

    // Keyboard
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'Escape') closeModal(root);
    });

    render();
    return { go, next, prev };
  }

  function openModal(root) {
    root.classList.add('show');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    root.querySelector('.build-modal-dialog')?.setAttribute('tabindex', '-1');
    root.querySelector('.build-modal-dialog')?.focus();
  }

  function closeModal(root) {
    root.classList.remove('show');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Wire up triggers and one-time modal init
  document.querySelectorAll('.open-build').forEach(btn => {
    const id = btn.dataset.build;
    const modal = document.getElementById(`build-${id}`);
    if (!modal) return;

    if (!modal.__inited) {
      const closeBtn = modal.querySelector('.build-close');
      closeBtn?.addEventListener('click', () => closeModal(modal));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal); // click outside dialog
      });
      initSlider(modal);
      modal.__inited = true;
    }

    btn.addEventListener('click', () => openModal(modal));
  });
})();
