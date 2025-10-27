
// 進場動畫（進入視窗才淡入）
document.addEventListener('DOMContentLoaded',()=>{
  const cards=[...document.querySelectorAll('.flow-card')];
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.15});
  cards.forEach(c=>io.observe(c));
});
