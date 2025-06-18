// content/custom.js
(() => {
  /* ── config ────────────────────────────────────────── */
  const NAV_SEL = '.nav-tabs';
  const WIDTH   = 280;     // popover width (px)
  const RADIUS  = 20;      // corner radius  (px)
  const GAP     = 10;      // gap between trigger + menu (px)

  const ITEMS = [
    { label: '↗️ React UI Kit',    href: '/docs/fundamentals/overview', heading: true },
    { label: '✨ Angular UI Kit',  href: '/docs/changelog',             heading: true },
    { divider: true },
    { label: 'Fundamentals',      href: '/docs/notifications/logs' }
  ];
  /* ──────────────────────────────────────────────────── */

  const nav = document.querySelector(NAV_SEL);
  if (!nav) return console.warn('[custom-nav] .nav-tabs not found');

  /* 1 ▸ wipe stock links, insert “Explore ▾” */
  nav.innerHTML = '';
  const trigger = Object.assign(document.createElement('a'), {
    href: '#',
    textContent: 'Explore ▾',
    className:
      'link nav-tabs-item relative h-full flex items-center font-medium ' +
      'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300',
  });
  trigger.style.cursor = 'pointer';
  trigger.setAttribute('tabindex', '0');
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  nav.appendChild(trigger);

  /* 2 ▸ build popover & backdrop */
  const menu = document.createElement('nav');
  menu.className = 'cc-nav-pop';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-hidden', 'true');
  menu.style.width = `${WIDTH}px`;

  const cur = window.location.pathname.replace(/\/$/, '');
  menu.innerHTML = `
    <ul>
      ${ITEMS.map(i => i.divider
        ? '<li class="divider" role="separator"></li>'
        : `<li role="none">
             <a role="menuitem"
                href="${i.href}"
                tabindex="-1"
                class="${i.heading ? 'heading' : 'link'}${cur.startsWith(i.href) ? ' active' : ''}">
               ${i.label}
             </a>
           </li>`).join('')}
    </ul>`;

  const backdrop = Object.assign(document.createElement('div'), {
    className : 'cc-nav-backdrop',
    style     : 'display:none'
  });
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.append(menu, backdrop);

  /* 3 ▸ static CSS (inject once) */
  if (!document.getElementById('cc-nav-style')) {
    const css = `
      .cc-nav-pop{
        position:fixed;background:#fff;border-radius:${RADIUS}px;
        box-shadow:0 12px 32px rgba(0,0,0,.12);padding:24px 28px;
        z-index:1002;display:none;transform:translateY(-8px);opacity:0;
        transition:transform .12s ease,opacity .12s ease;font-family:Inter,sans-serif;
      }
      .cc-nav-pop.open{display:block;transform:translateY(0);opacity:1;}
      .cc-nav-pop ul{margin:0;padding:0;list-style:none;}
      .cc-nav-pop .heading{font-weight:600;font-size:17px;line-height:24px;
                           padding:8px 0 10px;color:#000;}
      .cc-nav-pop .link{font-size:16px;line-height:24px;padding:10px 0;
                        color:#111;text-decoration:none;border-radius:8px;
                        transition:background .08s;}
      .cc-nav-pop .link:hover,.cc-nav-pop .link:focus{background:#f5f6fa;outline:none;}
      .cc-nav-pop .link.active{font-weight:600;}
      .cc-nav-pop .divider{margin:16px 0;border-top:1px solid #e5e5e5;height:0;}
      .cc-nav-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.3);
                       z-index:1001;backdrop-filter:blur(1px);}
      @media (prefers-color-scheme:dark){
        .cc-nav-pop{background:#141414;box-shadow:0 12px 32px rgba(0,0,0,.6);}
        .cc-nav-pop .heading{color:#fff;}
        .cc-nav-pop .link{color:#eee;}
        .cc-nav-pop .link:hover,.cc-nav-pop .link:focus{background:#1e1e1e;}
        .cc-nav-pop .divider{border-color:#222;}
      }`;
    Object.assign(document.head.appendChild(document.createElement('style')), {
      id: 'cc-nav-style', textContent: css
    });
  }

  /* 4 ▸ positioning helpers */
  const place = () => {
    const {left, bottom} = trigger.getBoundingClientRect();
    menu.style.left = `${left}px`;
    menu.style.top  = `${bottom + GAP}px`;
  };

  /* 5 ▸ open / close logic */
  const open = () => {
    place();
    menu.classList.add('open');
    backdrop.style.display = 'block';
    trigger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.querySelector('a')?.focus();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
  };
  const close = () => {
    menu.classList.remove('open');
    backdrop.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    trigger.focus();
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
  };
  const toggle = () => menu.classList.contains('open') ? close() : open();

  /* 6 ▸ events */
  trigger.addEventListener('click',  e => { e.preventDefault(); e.stopPropagation(); toggle(); });
  trigger.addEventListener('keydown',e => { if(['Enter',' '].includes(e.key)){ e.preventDefault(); open(); }});
  backdrop.addEventListener('click',close);
  document.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
  document.addEventListener('mintlify:pageUpdate', close);          // close on client-side nav

  /* SPA navigation for menu items */
  menu.addEventListener('click', e => {
    const a = e.target.closest('a[role="menuitem"]');
    if (!a) return;
    e.preventDefault();
    close();
    if (window.location.pathname !== a.pathname) {
      history.pushState({}, '', a.getAttribute('href'));
      window.dispatchEvent(new Event('popstate'));  // Mintlify listens to this
    }
  });

  /* keyboard loop inside popover */
  menu.addEventListener('keydown', e => {
    const items = [...menu.querySelectorAll('a[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown'){ e.preventDefault(); items[(i+1)%items.length].focus(); }
    if (e.key === 'ArrowUp')  { e.preventDefault(); items[(i-1+items.length)%items.length].focus(); }
    if (e.key === 'Home')     { e.preventDefault(); items[0].focus(); }
    if (e.key === 'End')      { e.preventDefault(); items.at(-1).focus(); }
  });

  /* 7 ▸ lift the preload cloak */
  nav.classList.add('cc-ready');
})();
