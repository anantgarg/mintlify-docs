// content/custom.js
(() => {
  /* ——— Settings ———————————————————————————————————————— */
  const NAV_SEL   = '.nav-tabs';
  const WIDTH     = 280;         // menu width  (px)
  const RADIUS    = 20;          // corner‐radius (px)
  const GAP       = 10;          // distance from trigger to menu (px)

  const ITEMS = [
    { label: '↗️ React UI Kit',            href: '/fundamentals/overview',   heading: true },
    { label: '✨ Angular UI Kit', href: '/changelog',       heading: true },
    { divider: true },
    { label: 'Fundamentals',       href: '/notifications/logs' }
  ];
  /* ———————————————————————————————————————————————— */

  const nav = document.querySelector(NAV_SEL);
  if (!nav) return console.warn('[custom-nav] .nav-tabs not found');

  /* 1  Replace the first item with “Explore ▾” */
  nav.querySelector('a')?.remove();                 // remove “Documentation”
  const explore = document.createElement('a');
  explore.id = 'cc-explore';
  explore.className =
    'link nav-tabs-item group relative h-full flex items-center ' +
    'font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 ' +
    'dark:hover:text-gray-300';                     // mirrors stock classes
  explore.textContent = 'Explore ▾';
  explore.href = '#';                               // prevent page jump
  explore.setAttribute('aria-haspopup', 'menu');
  explore.setAttribute('aria-expanded', 'false');
  explore.setAttribute('tabindex', '0');
  nav.prepend(explore);                             // same position, same spacing

  /* 2  Build pop-over & backdrop */
  const menu = document.createElement('nav');
  menu.className = 'cc-nav-pop';
  menu.style.width = `${WIDTH}px`;
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-hidden', 'true');

  menu.innerHTML = `
    <ul>
      ${ITEMS.map(i => i.divider
         ? '<li class="divider" role="separator"></li>'
         : `<li role="none"><a role="menuitem" href="${i.href}" tabindex="-1"
                               class="${i.heading ? 'heading' : 'link'}">
              ${i.label}</a></li>`).join('')}
    </ul>`;

  const backdrop = document.createElement('div');
  backdrop.className = 'cc-nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.style.display = 'none';

  document.body.append(menu, backdrop);

  /* 3  One-time CSS */
  if (!document.querySelector('#cc-nav-style')) {
    const css = `
      .cc-nav-pop{
        position:fixed;background:#fff;border-radius:${RADIUS}px;
        box-shadow:0 12px 32px rgba(0,0,0,.12);padding:24px 28px;
        z-index:1002;display:none;transform:translateY(-8px);opacity:0;
        transition:transform .12s ease,opacity .12s ease;font-family:Inter,sans-serif;
      }
      .cc-nav-pop.open{display:block;transform:translateY(0);opacity:1;}
      .cc-nav-pop ul{margin:0;padding:0;list-style:none;}
      .cc-nav-pop .heading{font-weight:600;font-size:17px;line-height:24px;padding:8px 0 10px;color:#000;}
      .cc-nav-pop .link{font-size:16px;line-height:24px;padding:10px 0;color:#111;text-decoration:none;border-radius:8px;transition:background .08s;}
      .cc-nav-pop .link:hover,.cc-nav-pop .link:focus{background:#f5f6fa;outline:none;}
      .cc-nav-pop .divider{margin:16px 0;border-top:1px solid #e5e5e5;height:0;}
      .cc-nav-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:1001;backdrop-filter:blur(1px);}
      @media (prefers-color-scheme:dark){
        .cc-nav-pop{background:#141414;box-shadow:0 12px 32px rgba(0,0,0,.6);}
        .cc-nav-pop .heading{color:#fff;}
        .cc-nav-pop .link{color:#eee;}
        .cc-nav-pop .link:hover,.cc-nav-pop .link:focus{background:#1e1e1e;}
        .cc-nav-pop .divider{border-color:#222;}
      }`;
    const style = Object.assign(document.createElement('style'), { id:'cc-nav-style', textContent: css });
    document.head.appendChild(style);
  }

  /* 4  Open / close helpers */
  const locMenu = () => {
    const {left, bottom} = explore.getBoundingClientRect();
    menu.style.left = `${left}px`;
    menu.style.top  = `${bottom + GAP}px`;
  };
  const open = () => {
    locMenu();
    menu.classList.add('open');
    backdrop.style.display = 'block';
    explore.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.querySelector('a')?.focus();
    window.addEventListener('resize', locMenu);
    window.addEventListener('scroll', locMenu, true);
  };
  const close = () => {
    menu.classList.remove('open');
    backdrop.style.display = 'none';
    explore.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    explore.focus();
    window.removeEventListener('resize', locMenu);
    window.removeEventListener('scroll', locMenu, true);
  };

  /* 5  Events */
  explore.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); (menu.classList.contains('open') ? close() : open()); });
  explore.addEventListener('keydown', e => { if (['Enter',' '].includes(e.key)) { e.preventDefault(); open(); } });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('mintlify:pageUpdate', close);     // close on client-side nav

  menu.addEventListener('keydown', e => {
    const items = [...menu.querySelectorAll('a[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown'){ e.preventDefault(); items[(i+1)%items.length].focus(); }
    if (e.key === 'ArrowUp')  { e.preventDefault(); items[(i-1+items.length)%items.length].focus(); }
    if (e.key === 'Home')     { e.preventDefault(); items[0].focus(); }
    if (e.key === 'End')      { e.preventDefault(); items.at(-1).focus(); }
  });

  /* 6  Uncloak nav */
  nav.classList.add('cc-ready');
})();
