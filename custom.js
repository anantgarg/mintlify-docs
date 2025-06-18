// content/custom.js
(() => {
  /* === Config ======================================================= */
  const TRIGGER_SEL = '.nav-tabs';
  const LABEL       = 'Explore ▾';
  const WIDTH       = 280;   // px
  const RADIUS      = 20;    // px
  const GAP         = 10;    // px between trigger bottom and menu

  const ITEMS = [
    { label: '↗️ React UI Kit',            href: '/fundamentals/overview',   heading: true },
    { label: '✨ Angular UI Kit', href: '/changelog',       heading: true },
    { divider: true },
    { label: 'Fundamentals',       href: '/notifications/logs' }
  ];
  /* ================================================================== */

  const trigger = document.querySelector(TRIGGER_SEL);
  if (!trigger) { console.warn('[custom-nav] .nav-tabs not found'); return; }

  /* 1 — prepare the trigger ------------------------------------------------ */
  trigger.textContent = LABEL;
  trigger.style.cursor = 'pointer';
  trigger.setAttribute('tabindex', '0');
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');

  /* 2 — build pop-over + backdrop ---------------------------------------- */
  const menu = document.createElement('nav');
  menu.className = 'cc-nav-pop';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-hidden', 'true');
  menu.style.width = `${WIDTH}px`;

  menu.innerHTML = `
    <ul>
      ${ITEMS.map(it =>
        it.divider
          ? '<li class="divider" role="separator"></li>'
          : `<li role="none">
               <a role="menuitem" href="${it.href}" tabindex="-1"
                  class="${it.heading ? 'heading' : 'link'}">${it.label}</a>
             </li>`
      ).join('')}
    </ul>
  `;

  const backdrop = document.createElement('div');
  backdrop.className = 'cc-nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.style.display = 'none';

  document.body.append(menu, backdrop);   // <-- append to <body>, not inside nav

  /* 3 — CSS (only injected once) ----------------------------------------- */
  if (!document.querySelector('#cc-nav-style')) {
    const style = document.createElement('style');
    style.id = 'cc-nav-style';
    style.textContent = `
      .cc-nav-pop{
        position:fixed; /* anchored to viewport, not to trigger box */
        background:#fff; border-radius:${RADIUS}px;
        box-shadow:0 12px 32px rgba(0,0,0,.12);
        padding:24px 28px; z-index:1002; display:none;
        transform:translateY(-8px); opacity:0;
        transition:transform .12s ease, opacity .12s ease;
        font-family:Inter,system-ui,sans-serif;
      }
      .cc-nav-pop.open{display:block; transform:translateY(0); opacity:1;}
      .cc-nav-pop ul{margin:0;padding:0;list-style:none;}
      .cc-nav-pop li{margin:0;}
      .cc-nav-pop .heading{
        display:block;font-weight:600;font-size:17px;line-height:24px;
        padding:8px 0 10px;color:#000;
      }
      .cc-nav-pop .link{
        display:block;font-size:16px;line-height:24px;
        padding:10px 0;color:#111;text-decoration:none;
        border-radius:8px;transition:background .08s;
      }
      .cc-nav-pop .link:hover,
      .cc-nav-pop .link:focus{background:#f5f6fa;outline:none;}
      .cc-nav-pop .divider{
        margin:16px 0;border-top:1px solid #e5e5e5;height:0;
      }
      .cc-nav-backdrop{
        position:fixed;inset:0;background:rgba(0,0,0,.3);
        z-index:1001;backdrop-filter:blur(1px);
      }
      @media (prefers-color-scheme:dark){
        .cc-nav-pop{background:#141414;box-shadow:0 12px 32px rgba(0,0,0,.6);}
        .cc-nav-pop .heading{color:#fff;}
        .cc-nav-pop .link{color:#eee;}
        .cc-nav-pop .link:hover,
        .cc-nav-pop .link:focus{background:#1e1e1e;}
        .cc-nav-pop .divider{border-color:#222;}
      }`;
    document.head.appendChild(style);
  }

  /* 4 — helpers ----------------------------------------------------------- */
  const positionMenu = () => {
    const rect = trigger.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top  = `${rect.bottom + GAP}px`;
  };
  const open = () => {
    positionMenu();
    menu.classList.add('open');
    backdrop.style.display = 'block';
    trigger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.querySelector('a[role="menuitem"]')?.focus();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
  };
  const close = () => {
    menu.classList.remove('open');
    backdrop.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    trigger.focus();
    window.removeEventListener('resize', positionMenu);
    window.removeEventListener('scroll', positionMenu, true);
  };
  const toggle = () => menu.classList.contains('open') ? close() : open();

  /* 5 — events ----------------------------------------------------------- */
  trigger.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('mintlify:pageUpdate', close);

  /* keyboard arrow loop inside the menu */
  menu.addEventListener('keydown', e => {
    const items = [...menu.querySelectorAll('a[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus();}
    if (e.key === 'ArrowUp')  {e.preventDefault();items[(i-1+items.length)%items.length].focus();}
    if (e.key === 'Home')     {e.preventDefault();items[0].focus();}
    if (e.key === 'End')      {e.preventDefault();items.at(-1).focus();}
  });

  /* 6 — remove preload cloak */
  trigger.classList.add('cc-ready');
})();
