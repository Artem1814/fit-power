/*  Загрузка статьи по slug  */
(async () => {
  /* ========= utilities ========== */
  const waitFor = (test, t = 5000) =>
    new Promise(res => {
      const s = Date.now();
      (function loop () {
        if (test()) return res(true);
        if (Date.now() - s > t) return res(false);
        requestAnimationFrame(loop);
      })();
    });

  /* ========= 0. Клиент Supabase ========= */
  if (!await waitFor(() => window.supabaseClient?.from)) {
    console.error('supabaseClient not ready'); return;
  }
  const db = window.supabaseClient;

  /* ========= 1. slug ========= */
  const slug = new URLSearchParams(location.search).get('slug')?.trim();
  if (!slug) {
    document.querySelector('.article-page-section')
      ?.insertAdjacentHTML('afterbegin',
        '<p style="color:red;text-align:center">Статья не найдена.</p>');
    return;
  }
  window.currentPostSlug = slug;   // для comments.js

  /* ========= 2. запрос ========= */
  const { data: art, error } = await db
    .from('articles')
    .select('title, cover_url, date_pub, time_read, content_html')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !art) {
    console.error(error || 'Article not found');
    document.querySelector('.article-page-section')
      ?.insertAdjacentHTML('afterbegin',
        '<p style="color:red;text-align:center">Ошибка загрузки статьи.</p>');
    return;
  }

  /* ========= 3. вёрстка ========= */
  const bodyEl = document.getElementById('article-body');
  if (!bodyEl) return;

  bodyEl.innerHTML = `
      <div class="article-meta">
        <div id="article-date"  class="article-date  article-date--page"></div>
        <div id="article-time"  class="article-time  article-time--page"></div>
      </div>
      <h2 id="article-title" class="article-title article-title--page"></h2>
      <div id="article-content" class="article-content"></div>
  `;

  /* ========= 4. заполнение ========= */
  const byId = id => document.getElementById(id);

  byId('article-title').textContent     = art.title;
  byId('article-date') .textContent     = new Date(art.date_pub)
                                          .toLocaleDateString('ru-RU');
  byId('article-time') .textContent     = `${art.time_read} мин`;
  byId('article-content').innerHTML     = art.content_html || '';

  /* картинка */
  const img = document.getElementById('article-image');
  if (img) { img.src = art.cover_url; img.alt = art.title; }

  /* мета‑title и хлебные крошки */
  const t = document.getElementById('meta-title');
  if (t) t.textContent = art.title;

  const crumbs = document.getElementById('bread-crumbs');
  if (crumbs) crumbs.innerHTML = `
      <a href="/" class="bread-link">Главная</a> / 
      <a href="/articles-insights" class="bread-link">Статьи</a> / 
      ${art.title}
  `;
})();