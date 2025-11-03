// Remove “blinking text cursor” on headings/paragraphs by blurring non-input clicks
document.addEventListener('mousedown', (e) => {
  const tag = e.target.tagName;
  const interactive = ['INPUT','TEXTAREA','SELECT','BUTTON','A','LABEL','IMG'];
  if (!interactive.includes(tag)) document.activeElement?.blur?.();
});

// Smooth anchor scroll (for “See the look”, “Process”, etc.)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(el){
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// Shared Lightbox (home projects + builds page)
const lb = document.querySelector('.lightbox');
if (lb){
  const imgEl = lb.querySelector('.lightbox-img');
  const prev = lb.querySelector('.lightbox-prev');
  const next = lb.querySelector('.lightbox-next');
  const closeBtn = lb.querySelector('.lightbox-close');
  const backdrop = lb.querySelector('.lightbox-backdrop');
  let photos = [], idx = 0;

  function openLightbox(list, start=0){
    photos = list; idx = start;
    imgEl.src = photos[idx];
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lb.hidden = true; document.body.style.overflow = '';
  }
  function nav(d){ idx = (idx + d + photos.length) % photos.length; imgEl.src = photos[idx]; }

  // Home project grid (just open single image)
  document.querySelectorAll('.zoomable').forEach((img, i, all)=>{
    img.addEventListener('click', ()=>openLightbox([...all].map(x=>x.src), i));
  });

  // Builds cards (use data-gallery)
  document.querySelectorAll('.build-card').forEach(card=>{
    const gallery = JSON.parse(card.dataset.gallery || "[]");
    const openers = card.querySelectorAll('.open-gallery,.build-thumb');
    openers.forEach(op => op.addEventListener('click', ()=>openLightbox(gallery,0)));
  });

  prev?.addEventListener('click', ()=>nav(-1));
  next?.addEventListener('click', ()=>nav(1));
  closeBtn?.addEventListener('click', closeLightbox);
  backdrop?.addEventListener('click', closeLightbox);
  window.addEventListener('keydown', e=>{
    if(lb.hidden) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowRight') nav(1);
    if(e.key==='ArrowLeft') nav(-1);
  });
}

