/* ===== Simple Lightbox / Gallery =====
   Works for:
   1) Clicking any image in .gallery-grid (collects all images on that page)
   2) Clicking any element with [data-gallery] that contains a CSV of image URLs
*/

(() => {
  const body = document.body;

  // Build the lightbox once
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lightbox-inner">
      <button class="lb-btn lb-close" aria-label="Close">✕</button>
      <button class="lb-btn lb-prev"  aria-label="Previous">‹</button>
      <img class="lightbox-img" alt="">
      <button class="lb-btn lb-next"  aria-label="Next">›</button>
    </div>
  `;
  body.appendChild(lb);

  const imgEl   = lb.querySelector('.lightbox-img');
  const btnPrev = lb.querySelector('.lb-prev');
  const btnNext = lb.querySelector('.lb-next');
  const btnClose= lb.querySelector('.lb-close');

  let photos = [];  // array of URLs
  let idx = 0;

  function openLightbox(list, startIndex = 0) {
    photos = list;
    idx = Math.max(0, Math.min(startIndex, photos.length-1));
    render();
    lb.classList.add('open');
  }

  function closeLightbox() {
    lb.classList.remove('open');
  }

  function render() {
    if (!photos.length) return;
    imgEl.src = photos[idx];
  }

  function next() { idx = (idx + 1) % photos.length; render(); }
  function prev() { idx = (idx - 1 + photos.length) % photos.length; render(); }

  // Wire controls
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  btnClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => {
    // click outside image closes; buttons are pointer-events: auto
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Basic swipe on touch
  let startX = 0;
  imgEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, {passive:true});
  imgEl.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
  });

  // Open from gallery grid (collects all images on the page)
  const gridImgs = Array.from(document.querySelectorAll('.gallery-grid img'));
  gridImgs.forEach((img, i) => {
    img.addEventListener('click', () => {
      const list = gridImgs.map(n => n.src);
      openLightbox(list, i);
    });
  });

  // Open from any trigger with [data-gallery]="url1,url2,..."
  document.querySelectorAll('[data-gallery]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const list = trigger.dataset.gallery
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      openLightbox(list, 0);
    });
  });

  /* ===== Minor UX niceties ===== */

  // Make phone call chip actually call
  document.querySelectorAll('[data-tel]').forEach(el => {
    el.addEventListener('click', () => {
      const num = el.getAttribute('data-tel');
      window.location.href = `tel:${num}`;
    });
  });

})();
