/*  Список всех статей + фильтры  */
(async () => {
  const list = document.getElementById('article-list');
  if (!list) return;

  const btns = {
    all : document.getElementById('btn-all-articles'),
    rec : document.getElementById('btn-recovery'),
    trn : document.getElementById('btn-training'),
    nut : document.getElementById('btn-nutrition')
  };

  /* ---------- ждём готового клиента Supabase ---------- */
  const wait = (t = 4000) =>
    new Promise(r => {
      const s = Date.now();
      (function loop () {
        if (window.supabaseClient?.from) return r(true);
        if (Date.now() - s > t)        return r(false);
        requestAnimationFrame(loop);
      })();
    });

  if (!await wait()) {
    list.innerHTML = '<p style="color:red;">Клиент Supabase не инициализирован</p>';
    return;
  }
  const db = window.supabaseClient;

  /* ---------- запрос ---------- */
  const { data, error } = await db
    .from('articles')
    .select('slug, title, cover_url, date_pub, time_read, category')
    .order('date_pub', { ascending: false });

  if (error || !data) {
    list.innerHTML = '<p style="color:red;">Ошибка загрузки статей</p>';
    console.error(error);
    return;
  }

  const html = arr => arr.map(a => `
    <a href="/article.html?slug=${a.slug}"
       class="article-card w-inline-block" data-category="${a.category}">
      <img src="${a.cover_url}" alt="${a.title}"
           width="70" loading="lazy" class="article-image">
      <h3 class="article-title">${a.title}</h3>
      <div class="article-meta">
        <div class="article-time">${a.time_read}&nbsp;мин</div>
        <div class="article-date">${new Date(a.date_pub).toLocaleDateString('ru-RU')}</div>
      </div>
    </a>`).join('');

  /* ---------- отрисовка / фильтр ---------- */
  const activate = key => {
    Object.values(btns).forEach(b => b?.classList.remove('active'));
    btns[key]?.classList.add('active');
  };
  const render = cat => {
    list.innerHTML = html(cat ? data.filter(a => a.category === cat) : data);
  };

  activate('all');      /* первая загрузка */
  render();

  /* обработчики */
  btns.all?.addEventListener('click', e => { e.preventDefault(); activate('all'); render(); });
  btns.rec?.addEventListener('click', e => { e.preventDefault(); activate('rec'); render('recovery'); });
  btns.trn?.addEventListener('click', e => { e.preventDefault(); activate('trn'); render('training'); });
  btns.nut?.addEventListener('click', e => { e.preventDefault(); activate('nut'); render('nutrition'); });
})();