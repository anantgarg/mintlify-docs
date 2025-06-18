// content/custom.js
(() => {
  console.log('[custom-nav] script loaded');

  /* -------- menu markup you want to inject -------- */
  const menuHTML = `
    <nav class="cc-custom-nav">
      <ul>
        <li class="cc-heading">↗️ Popular</li>
        <li class="cc-heading">✨ New and Noteworthy</li>
        <hr />
        <li><a href="/product-design">Product Design</a></li>
        <li><a href="/web-design">Web Design</a></li>
        <li><a href="/animation">Animation</a></li>
        <li><a href="/branding">Branding</a></li>
        <li><a href="/illustration">Illustration</a></li>
        <li><a href="/mobile">Mobile</a></li>
        <li><a href="/typography">Typography</a></li>
        <li><a href="/print">Print</a></li>
      </ul>
    </nav>
  `;

  /* -------- styles (scoped) -------- */
  const injectStyles = () => {
    if (document.querySelector('#cc-nav-style')) return;       // run once
    const style = document.createElement('style');
    style.id = 'cc-nav-style';
    style.textContent = `
      .cc-custom-nav {
        width: 260px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 20px rgba(0,0,0,.06);
        padding: 20px 24px;
        font-family: Inter, sans-serif;
      }
      .cc-custom-nav ul         { margin: 0; padding: 0; list-style: none; }
      .cc-custom-nav li         { padding: 10px 0; font-size: 16px; }
      .cc-custom-nav li a       { color: inherit; text-decoration: none; }
      .cc-custom-nav li a:hover { color: #7444ff; }
      .cc-custom-nav .cc-heading{ font-weight: 600; display: flex; align-items: center; }
      .cc-custom-nav hr         { border: none; border-top: 1px solid #e5e5e5; margin: 14px 0; }
    `;
    document.head.appendChild(style);
  };

  /* -------- helper to swap markup -------- */
  const replaceNav = target => {
    target.innerHTML = menuHTML;
    injectStyles();
    console.log('[custom-nav] menu injected');
  };

  /* -------- 1) try immediately -------- */
  const firstTry = document.querySelector('.nav-tabs');
  if (firstTry) return replaceNav(firstTry);

  /* -------- 2) watch for it to appear -------- */
  const observer = new MutationObserver(() => {
    const t = document.querySelector('.nav-tabs');
    if (t) {
      replaceNav(t);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
