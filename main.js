/* Year in footer */
document.querySelectorAll('#year').forEach(n => n.textContent = new Date().getFullYear());

/* Smooth scroll for [data-scroll] and hash links to sections */
document.querySelectorAll('a[data-scroll], a[href^="/#"], a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href) return;
    const id = href.startsWith('/#') ? href.slice(2) : href.startsWith('#') ? href.slice(1) : null;
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth', block:'start'});
    history.replaceState(null, '', `/#${id}`);
  });
});

/* LIGHTBOX (gallery + builds modal) */
(function(){
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const img = lightbox.querySelector('.lb-img');
  const btnClose = lightbox.querySelector('.lb-close');
  const btnPrev = lightbox.querySelector('.lb-prev');
  const btnNext = lightbox.querySelector('.lb-next');

  let list = [];  // array of srcs
  let idx = 0;

  function open(srcs, startAt=0){
    list = srcs;
    idx = startAt;
    update();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  }
  function update(){
    img.src = list[idx];
  }
  function close(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    img.src = '';
  }
  function next(){ idx = (idx+1) % list.length; update(); }
  function prev(){ idx = (idx-1+list.length) % list.length; update(); }

  // From gallery grid on home
  const gridImgs = Array.from(document.querySelectorAll('.lightbox-trigger'));
  if (gridImgs.length){
    const srcs = gridImgs.map(el => el.getAttribute('src'));
    gridImgs.forEach((el, i) => el.addEventListener('click', () => open(srcs, i)));
  }

  // From builds page "View photos" button
  document.querySelectorAll('.open-gallery').forEach(btn => {
    btn.addEventListener('click', () => {
      try{
        const arr = JSON.parse(btn.dataset.gallery);
        if (Array.isArray(arr) && arr.length) open(arr, 0);
      }catch{}
    });
  });

  btnClose.addEventListener('click', close);
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();

/* Kill stray text cursor anywhere that is not input/textarea */
document.addEventListener('mousedown', (e)=>{
  if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
    document.activeElement && document.activeElement.blur?.();
  }
});
