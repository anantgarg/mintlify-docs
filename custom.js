// content/custom.js
(() => {
  /* ───────────────────────── CONFIG ───────────────────────── */
  const NAV_SEL = '.nav-tabs';   // Mintlify’s top-bar wrapper
  const POP_W   = 280;           // pop-over width  (px)
  const RADIUS  = 20;            // corner radius   (px)
  const GAP     = 10;            // gap below trigger → pop-over (px)

  const ITEMS = [
    { label: '↗️ React UI Kit',   href: '/docs/fundamentals/overview', heading: true },
    { label: '✨ Angular UI Kit', href: '/docs/changelog',             heading: true },
    { divider: true },
    { label: 'Fundamentals',     href: '/docs/notifications/logs' }
  ];
  /* ────────────────────────────────────────────────────────── */

  const nav = document.querySelector(NAV_SEL);
  if (!nav) { console.warn('[custom-nav] .nav-tabs not found'); return; }

  /* 1 ▸ wipe stock links, add “Explore ▾” */
  nav.innerHTML = '';
  const trigger = Object.assign(document.createElement('a'), {
    href       : '#',
    textContent: 'Explore ▾',
    className  : 'link nav-tabs-item relative h-full flex items-center ' +
                 'font-medium text-gray-600 dark:text-gray-400 ' +
                 'hover:text-gray-800 dark:hover:text-gray-300',
    style      : 'cursor:pointer'
  });
  trigger.setAttribute('tabindex', '0');
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  nav.appendChild(trigger);

  /* 2 ▸ build pop-over & backdrop */
  const menu   = document.createElement('nav');
  const backdrop = Object.assign(document.createElement('div'), {
    className: 'cc-nav-backdrop', style: 'display:none'
  });
  menu.className = 'cc-nav-pop';
  menu.style.width = `${POP_W}px`;
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.append(menu, backdrop);

  /* helper renders menu list with correct “active” bolding */
  const renderMenu = () => {
    const cur = window.location.pathname.replace(/\/$/, '');
    menu.innerHTML = `<ul>${
      ITEMS.map(i => i.divider
        ? '<li class="divider" role="separator"></li>'
        : `<li role="none"><a role="menuitem" href="${i.href}" tabindex="-1"
              class="${i.heading ? 'heading' : 'link'}${cur.startsWith(i.href) ? ' active' : ''}">
              ${i.label}</a></li>`).join('')}</ul>`;
  };
  renderMenu();

  /* 3 ▸ one-time CSS */
  if (!document.getElementById('cc-nav-style')) {
    const style = document.createElement('style');
    style.id = 'cc-nav-style';
    style.textContent = `
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
    document.head.appendChild(style);
  }

  /* 4 ▸ positioning helpers */
  const place = () => {
    const { left, bottom } = trigger.getBoundingClientRect();
    menu.style.left = `${left}px`;
    menu.style.top  = `${bottom + GAP}px`;
  };

  /* 5 ▸ open / close logic */
  const open = () => {
    renderMenu();
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
  const toggle = () => (menu.classList.contains('open') ? close() : open());

  /* 6 ▸ wire events */
  trigger.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggle(); });
  trigger.addEventListener('keydown', e => { if (['Enter',' '].includes(e.key)) { e.preventDefault(); open(); } });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* a) keyboard loop in pop-over */
  menu.addEventListener('keydown', e => {
    const links = [...menu.querySelectorAll('a[role="menuitem"]')];
    const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown'){ e.preventDefault(); links[(i+1)%links.length].focus(); }
    if (e.key === 'ArrowUp')  { e.preventDefault(); links[(i-1+links.length)%links.length].focus(); }
    if (e.key === 'Home')     { e.preventDefault(); links[0].focus(); }
    if (e.key === 'End')      { e.preventDefault(); links.at(-1).focus(); }
  });

  /* b) SPA navigation for menu items (Mintlify router) */
  menu.addEventListener('click', e => {
    const a = e.target.closest('a[role="menuitem"]');
    if (!a) return;
    e.preventDefault();
    close();
    const href = a.getAttribute('href');
    if (href && href !== window.location.pathname) {
      history.pushState({}, '', href);                                       // update URL
      window.dispatchEvent(new CustomEvent('mintlify:navigate',{detail:{url:href}})); // tell router
      // fallback: hard reload if router fails (rare)
      setTimeout(() => {
        if (window.location.pathname === href &&
            !document.querySelector('main [data-page]')) {
          window.location.assign(href);
        }
      }, 200);
    }
  });

  /* c) re-highlight active row after Mintlify’s client-side page swap */
  document.addEventListener('mintlify:pageUpdate', renderMenu);

  /* 7 ▸ reveal nav (kills first-paint opacity cloak) */
  nav.classList.add('cc-ready');
})();
