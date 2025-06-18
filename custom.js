// content/custom.js
(() => {
  /* ========= USER SETTINGS ========================================= */
  const TRIGGER_SEL = '.nav-tabs';        // what you already have in the top bar
  const LABEL       = 'Explore ▾';        // text to keep showing in the bar
  const WIDTH       = 280;                // menu width in px
  const RADIUS      = 20;                 // corner radius

  const ITEMS = [
    { label: '↗️ Popular',            href: '/popular',   heading: true },
    { label: '✨ New and Noteworthy', href: '/new',       heading: true },
    { divider: true },
    { label: 'Product Design',       href: '/product-design' },
    { label: 'Web Design',           href: '/web-design' },
    { label: 'Animation',            href: '/animation' },
    { label: 'Branding',             href: '/branding' },
    { label: 'Illustration',         href: '/illustration' },
    { label: 'Mobile',               href: '/mobile' },
    { label: 'Typography',           href: '/typography' },
    { label: 'Print',                href: '/print' }
  ];
  /* ================================================================= */

  const trigger = document.querySelector(TRIGGER_SEL);
  if (!trigger) return console.warn('[custom-nav] trigger not found');

  /* 1 — swap label & make it operable */
  trigger.textContent = LABEL;
  trigger.style.cursor = 'pointer';
  trigger.setAttribute('tabindex', '0');          // focusable
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.classList.add('cc-nav-trigger');        // for optional styling

  /* 2 — build menu & backdrop */
  const menu = document.createElement('nav');
  menu.className = 'cc-nav-pop';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-hidden', 'true');
  menu.style.width = `${WIDTH}px`;

  const list = document.createElement('ul');
  list.innerHTML = ITEMS.map(it =>
    it.divider
      ? `<li class="divider" role="separator"></li>`
      : `<li role="none">
           <a role="menuitem" href="${it.href}" tabindex="-1"
              class="${it.heading ? 'heading' : 'link'}">${it.label}</a>
         </li>`
  ).join('');
  menu.appendChild(list);

  const backdrop = document.createElement('div');
  backdrop.className = 'cc-nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.style.display = 'none';

  document.body.appendChild(backdrop);
  trigger.appendChild(menu);

  /* 3 — CSS (auto-dark-mode & motion) */
  const css = `
    .cc-nav-pop{
      position:absolute; top:calc(100% + 12px); left:0;
      background:#fff; border-radius:${RADIUS}px;
      box-shadow:0 12px 32px rgba(0,0,0,.12);
      padding:24px 28px; display:none; z-index:1002;
      font-family:Inter,system-ui,sans-serif;
      transform:translateY(-8px); opacity:0;
      transition:transform .12s ease, opacity .12s ease;
    }
    .cc-nav-pop.open{ display:block; transform:translateY(0); opacity:1; }
    .cc-nav-pop ul{margin:0;padding:0;list-style:none;}
    .cc-nav-pop li{margin:0;}
    .cc-nav-pop .heading{
      display:block; font-weight:600; font-size:17px; line-height:24px;
      padding:8px 0 10px; color:#000;
    }
    .cc-nav-pop .link{
      display:block; font-size:16px; line-height:24px;
      padding:10px 0; color:#111; text-decoration:none;
      border-radius:8px; transition:background .08s;
    }
    .cc-nav-pop .link:hover,
    .cc-nav-pop .link:focus{background:#f5f6fa; outline:none;}
    .cc-nav-pop .divider{
      margin:16px 0; border-top:1px solid #e5e5e5; height:0;
    }
    .cc-nav-backdrop{
      position:fixed; inset:0; background:rgba(0,0,0,.3);
      z-index:1001; backdrop-filter:blur(1px);
    }
    @media (prefers-color-scheme:dark){
      .cc-nav-pop{background:#141414; box-shadow:0 12px 32px rgba(0,0,0,.6);}
      .cc-nav-pop .heading{color:#fff;}
      .cc-nav-pop .link{color:#eee;}
      .cc-nav-pop .link:hover,
      .cc-nav-pop .link:focus{background:#1e1e1e;}
      .cc-nav-pop .divider{border-color:#222;}
    }
  `;
  if (!document.querySelector('#cc-nav-style')) {
    const style = document.createElement('style');
    style.id = 'cc-nav-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* 4 — helpers */
  const focusFirst = () => {
    const first = menu.querySelector('a[role="menuitem"]');
    first && first.focus();
  };
  const open = () => {
    menu.classList.add('open');
    backdrop.style.display = 'block';
    trigger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    focusFirst();
  };
  const close = () => {
    menu.classList.remove('open');
    backdrop.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    trigger.focus();
  };
  const toggle = () => (menu.classList.contains('open') ? close() : open());

  /* 5 — wire events */
  trigger.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    if (e.key === 'ArrowDown' && !menu.classList.contains('open')) { open(); }
  });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // Close on route change (Mintlify)
  document.addEventListener('mintlify:pageUpdate', close);

  // Basic arrow-key loop inside the menu
  menu.addEventListener('keydown', e => {
    const items = [...menu.querySelectorAll('a[role="menuitem"]')];
    const idx   = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx+1)%items.length].focus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); items[(idx-1+items.length)%items.length].focus(); }
    if (e.key === 'Home')      { e.preventDefault(); items[0].focus(); }
    if (e.key === 'End')       { e.preventDefault(); items[items.length-1].focus(); }
  });
})();
