/* include-partials.js
   ───────────────────
   Вставляет общий header / footer и
   перезапускает скрипты, которые содержатся в частичных файлах.
*/
(() => {
  const PARTS = {
    "#header-placeholder": "/partials/header.html",
    "#footer-placeholder": "/partials/footer.html",
  };

  /** вставить html и выполнить скрипты внутри */
  function inject(selector, url) {
    const host = document.querySelector(selector);
    if (!host) return;

    fetch(url)
      .then(res => res.ok ? res.text() : Promise.reject(res.status))
      .then(html => {
        host.innerHTML = html;

        /* клонируем каждый <script>, чтобы браузер его выполнил */
        host.querySelectorAll("script").forEach(old => {
          const s = document.createElement("script");
          /* копируем атрибуты (src, type и т. д.) */
          [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
          /* переносим inline‑код */
          s.textContent = old.textContent;
          old.replaceWith(s);
        });
      })
      .catch(e => console.error("include‑partials:", url, e));
  }

  document.addEventListener("DOMContentLoaded", () => {
    for (const [sel, url] of Object.entries(PARTS)) inject(sel, url);
  });
})();