// Theme toggle (light/dark)
(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const LS = 'lh-theme';
  const set = (t)=>{
    root.setAttribute('data-theme', t);
    if (toggle){
      toggle.setAttribute('aria-pressed', String(t !== 'light'));
      const lbl = toggle.querySelector('.label'); if(lbl) lbl.textContent = t==='light' ? 'Light' : 'Dark';
      const emo = toggle.querySelector('.emoji'); if(emo) emo.textContent = t==='light' ? '☀️' : '🌙';
    }
  };
  const saved = localStorage.getItem(LS);
  if (saved) set(saved);
  if (toggle){
    toggle.addEventListener('click', ()=>{
      const next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      set(next); localStorage.setItem(LS, next);
    });
  }
})();

// Simple lightbox for inline gallery tiles
(function(){
  const box = document.getElementById('lightbox');
  if(!box) return;
  const img = box.querySelector('img');
  const closeBtn = box.querySelector('.lightbox-close');

  function open(src, alt){ img.src = src; img.alt = alt || ''; box.classList.add('show'); document.body.classList.add('modal-open'); }
  function close(){ box.classList.remove('show'); document.body.classList.remove('modal-open'); img.src=''; }

  document.addEventListener('click', (e)=>{
    const t = e.target.closest('.glight');
    if(t){ open(t.src, t.alt); }
  });
  box.addEventListener('click', (e)=>{ if(e.target === box) close(); });
  closeBtn?.addEventListener('click', close);
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
})();

// Builds modal (carousel)
(function(){
  const openBtn = document.querySelector('.open-build[data-build="1"]');
  const modal = document.getElementById('build-1');
  if(!openBtn || !modal) return;

  const track = modal.querySelector('.track');
  const slides = Array.from(modal.querySelectorAll('.slide'));
  const prev = modal.querySelector('.prev');
  const next = modal.querySelector('.next');
  const closeBtn = modal.querySelector('.build-close');
  const counter = modal.querySelector('.counter');
  const thumbs = Array.from(modal.querySelectorAll('.thumb'));

  let i = 0;

  function setIndex(n){
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-i * 100}%)`;
    if(counter) counter.textContent = `${i+1} / ${slides.length}`;
    thumbs.forEach((t,idx)=> t.classList.toggle('active', idx===i));
  }
  function open(){ modal.classList.add('show'); document.body.classList.add('modal-open'); setIndex(i); }
  function close(){ modal.classList.remove('show'); document.body.classList.remove('modal-open'); }

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });
  prev?.addEventListener('click', ()=> setIndex(i-1));
  next?.addEventListener('click', ()=> setIndex(i+1));
  window.addEventListener('keydown', (e)=>{
    if(!modal.classList.contains('show')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') setIndex(i-1);
    if(e.key === 'ArrowRight') setIndex(i+1);
  });
  thumbs.forEach(t=> t.addEventListener('click', ()=> setIndex(+t.dataset.i || 0)));
})();
