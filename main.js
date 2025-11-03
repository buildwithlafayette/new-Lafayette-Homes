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
    lbImg.src = '';
  };
  lbClose?.addEventListener('click', closeLB);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLB(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });
}

// ---------- Builds modal with next/prev ----------
function initBuildModal(id) {
  const modal = document.getElementById(`build-${id}`);
  if (!modal) return;

  const dialog = modal.querySelector('.build-modal-dialog');
  const slidesWrap = modal.querySelector('.build-slides');
  const imgs = Array.from(slidesWrap.querySelectorAll('img'));
  const prev = slidesWrap.querySelector('.prev');
  const next = slidesWrap.querySelector('.next');
  const closeBtn = modal.querySelector('.build-close');

  let idx = 0;
  const show = (i) => {
    imgs.forEach((im, n) => im.classList.toggle('active', n === i));
  };
  const open = () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    idx = 0;
    show(idx);
  };
  const close = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };

  prev.addEventListener('click', () => { idx = (idx - 1 + imgs.length) % imgs.length; show(idx); });
  next.addEventListener('click', () => { idx = (idx + 1) % imgs.length; show(idx); });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (modal.classList.contains('show') && e.key === 'Escape') close(); });

  // public open hook
  return { open };
}

// wire up all build cards
document.querySelectorAll('.open-build').forEach(btn => {
  const id = btn.dataset.build;
  const api = initBuildModal(id);
  btn.addEventListener('click', () => api?.open());
});

// make non-input text not caret-editable (kills “blinking cursor” feeling)
document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
  .forEach(el => {
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'A') {
      el.setAttribute('contenteditable', 'false');
      el.style.caretColor = 'transparent';
    }
  });
