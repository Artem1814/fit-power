/*  3 последние статьи для главной  */
(async () => {
  const wrap = document.getElementById('article-preview-list');
  if (!wrap) return;

  /* ждём клиента */
  const ok = await new Promise(r => {
    const s = Date.now();
    (function loop () {
      if (window.supabaseClient?.from) return r(true);
      if (Date.now() - s > 4000)      return r(false);
      requestAnimationFrame(loop);
    })();
  });
  if (!ok) { console.error('SupabaseClient not ready'); return; }

  const db = window.supabaseClient;

  const { data, error } = await db
    .from('articles')
    .select('slug,title,cover_url,date_pub,time_read')
    .order('date_pub', { ascending: false })
    .limit(3);

  if (error || !data) { console.error(error); return; }

  wrap.innerHTML = data.map(a => `
    <a href="/article.html?slug=${a.slug}" class="article-card w-inline-block">
      <img src="${a.cover_url}" width="70" loading="lazy"
           alt="${a.title}" class="article-image">
      <h3 class="article-title">${a.title}</h3>
      <div class="article-meta">
        <div class="article-time">${a.time_read}&nbsp;мин</div>
        <div class="article-date">${new Date(a.date_pub).toLocaleDateString('ru-RU')}</div>
      </div>
    </a>`).join('');
})();