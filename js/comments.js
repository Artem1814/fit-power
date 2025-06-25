(async () => {

  /* вспомогательное ожи­дание любого условия */
  const wait = (test, t = 4000) =>
    new Promise(res => {
      const s = Date.now();
      (function loop () {
        if (test()) return res(true);
        if (Date.now() - s > t) return res(false);
        requestAnimationFrame(loop);
      })();
    });

  /* 1. slug статьи, выставленный article‑load.js */
  if (!await wait(() => window.currentPostSlug)) {
    document.getElementById('comment-list')
      ?.insertAdjacentHTML('beforeend',
        '<p style="color:red;">Не удалось определить статью для комментариев.</p>');
    return;
  }

  const postId   = window.currentPostSlug;                 // идентификатор статьи
  const list     = document.getElementById('comment-list');
  const form     = document.getElementById('comment-form');
  const textArea = document.getElementById('comment-text');
  const btnSend  = document.getElementById('submit-comment');
  const userId   = localStorage.getItem('user_id');        // UUID текущего юзера

  /* скрыть форму для гостей */
  if (!userId && form) form.style.display = 'none';

  const BASE = 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1/comments';

  /* ───────────────────── Загрузка списка ─────────────────────────────── */
  async function loadComments () {
    list.innerHTML = '<p style="opacity:.6;">Загрузка…</p>';

    const resp = await fetch(`${BASE}/list?post_id=${encodeURIComponent(postId)}`);
    const dat  = await resp.json();

    if (!resp.ok || dat.error) {
      list.innerHTML = '<p style="color:red;">Ошибка загрузки комментариев.</p>';
      console.error(dat.error); return;
    }

    /* сортировка — свежие вверх */
    dat.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    list.innerHTML = dat.comments.length
      ? dat.comments.map(c => `
        <div class="comment-card" data-id="${c.id}">
          <div class="comment-header">
            <img src="${c.user.avatar_url || '/img/default-avatar.png'}"
                 alt="avatar" class="comment-avatar">
            <div class="comment-author">
              ${c.user.display_name || c.user.email || 'Аноним'}
            </div>
          </div>

          <div class="comment-text">${c.body}</div>

          <div class="comment-footer">
            <span class="comment-date">
              ${new Date(c.created_at)
                  .toLocaleString('ru-RU',{year:'numeric',month:'long',
                                           day:'numeric',hour:'2-digit',minute:'2-digit'})}
            </span>
            ${
              (userId && userId === c.user_id)
                ? '<button class="comment-del">Удалить</button>'
                : ''
            }
          </div>
        </div>`).join('')
      : '<p>Комментариев пока нет.</p>';
  }
  await loadComments();

  /* ───────────────────── Удаление (делегировано) ─────────────────────── */
  list.addEventListener('click', async e => {
    const btn = e.target.closest('.comment-del');
    if (!btn) return;

    const card = btn.closest('.comment-card');
    const cid  = card.dataset.id;

    try {
      const resp = await fetch(`${BASE}/delete?comment_id=${cid}`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ comment_id: cid })
      });
      const dat = await resp.json();

      if (!resp.ok || dat.error) throw new Error(dat.error || resp.statusText);

      /* визуально убираем карточку */
      card.remove();
      if (!list.querySelector('.comment-card')) list.innerHTML = '<p>Комментариев пока нет.</p>';

    } catch (err) {
      alert('Не удалось удалить комментарий: ' + err.message);
    }
  });

  /* ───────────────────── Добавление нового ──────────────────────────── */
  btnSend?.addEventListener('click', async e => {
    e.preventDefault();
    if (!userId) return alert('Авторизуйтесь, чтобы писать комментарии.');

    const body = (textArea.value || '').trim();
    if (!body)  return alert('Введите текст комментария');

    try {
      const resp = await fetch(`${BASE}/add`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ user_id: userId, post_id: postId, body })
      });
      const dat = await resp.json();

      if (!resp.ok || dat.error) throw new Error(dat.error || resp.statusText);

      textArea.value = '';
      await loadComments();

    } catch (err) {
      alert('Ошибка отправки: ' + err.message);
    }
  });

})();