// content/custom.js
(() => {
  /* ---------- CONFIG -------------------------------------------------- */
  const triggerSelector = '.nav-tabs';      // element that already sits in the top bar
  const labelText      = 'Explore ▾';       // text you want to show in the bar
  const menuWidth      = 260;               // px

  const menuItems = [
    { label: '↗️ Popular',               href: '/popular',   heading: true },
    { label: '✨ New and Noteworthy',    href: '/new',       heading: true },
    { divider: true },
    { label: 'Product Design',          href: '/product-design' },
    { label: 'Web Design',              href: '/web-design' },
    { label: 'Animation',               href: '/animation' },
    { label: 'Branding',                href: '/branding' },
    { label: 'Illustration',            href: '/illustration' },
    { label: 'Mobile',                  href: '/mobile' },
    { label: 'Typography',              href: '/typography' },
    { label: 'Print',                   href: '/print' }
  ];

  /* ---------- BUILD DOM ----------------------------------------------- */
  const trigger = document.querySelector(triggerSelector);
  if (!trigger) return;                               // nothing to do

  // 1. Replace trigger’s text
  trigger.textContent = labelText;
  trigger.style.cursor = 'pointer';
  trigger.style.position = 'relative';
  trigger.setAttribute('aria-expanded', 'false');

  // 2. Build dropdown
  const drop = document.createElement('nav');
  drop.className = 'cc-nav-drop';
  drop.innerHTML = `
    <ul>
      ${menuItems.map(it =>
        it.divider
          ? `<li class="divider"></li>`
          : `<li class="${it.heading ? 'heading' : ''}">
               <a href="${it.href}">${it.label}</a>
             </li>`
      ).join('')}
    </ul>`;
  trigger.appendChild(drop);

  /* ---------- STYLES -------------------------------------------------- */
  const style = document.createElement('style');
  style.id = 'cc-nav-style';
  style.textContent = `
    .cc-nav-drop{
      position:absolute; top:calc(100% + 12px); left:0;
      width:${menuWidth}px; background:#fff; border-radius:16px;
      box-shadow:0 8px 20px rgba(0,0,0,.06); padding:20px 24px;
      display:none; z-index:1000; font-family:Inter,sans-serif;
    }
    .cc-nav-drop ul        {list-style:none;margin:0;padding:0;}
    .cc-nav-drop li        {padding:10px 0;font-size:16px;}
    .cc-nav-drop li.heading{font-weight:600;display:flex;align-items:center;}
    .cc-nav-drop li.divider{border-top:1px solid #e5e5e5;margin:10px 0;}
    .cc-nav-drop a         {color:#0f0f0f;text-decoration:none;}
    .cc-nav-drop a:hover   {color:#7444ff;}
  `;
  document.head.appendChild(style);

  /* ---------- INTERACTION --------------------------------------------- */
  const open   = () => { drop.style.display = 'block'; trigger.setAttribute('aria-expanded','true'); };
  const close  = () => { drop.style.display = 'none';  trigger.setAttribute('aria-expanded','false'); };

  trigger.addEventListener('click', e => { 
    e.stopPropagation();
    drop.style.display === 'block' ? close() : open();
  });
  trigger.addEventListener('mouseenter', open);
  trigger.addEventListener('mouseleave', e => {
    // close only if mouse truly left both trigger & menu
    if (!trigger.contains(e.relatedTarget)) close();
  });
  document.addEventListener('click', close);          // click-away
  // Mintlify client-side route change guard
  document.addEventListener('mintlify:pageUpdate', close);
})();
