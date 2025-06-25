<h2 class="comm-head">Комментарии сайта</h2>

<div id="comm-list">
  <?php foreach ($comments as $c): ?>
    <article class="comm-card" id="c<?= $c['id'] ?>" data-id="<?= $c['id'] ?>">
      <div class="comm-avatar">
        <img src="<?= htmlspecialchars($c['user']['avatar_url']) ?>" alt="" loading="lazy">
      </div>

      <div class="comm-body">
        <header>
          <span class="comm-user"><?= htmlspecialchars($c['user']['display_name']) ?></span>
          <time class="comm-date"><?= date('d.m.Y H:i', strtotime($c['created_at'])) ?></time>
          <span class="comm-post">post_id: <?= $c['post_id'] ?></span>
        </header>
        <p class="comm-text"><?= nl2br(htmlspecialchars($c['body'])) ?></p>
      </div>

      <button class="comm-del" title="Удалить">✕</button>
    </article>
  <?php endforeach; ?>
</div>

<script>
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.comm-del');
  if (!btn) return;

  const card = btn.closest('.comm-card');
  const id   = card.dataset.id;

  //if (!confirm(`Удалить комментарий №${id}?`)) return;
  if (!confirm(`Вы действительно хотите удалить комментарий?`)) return;
  try {
    // передаём id и в query, и в теле
    const endpoint = '<?= EDGE_COMMENTS_URL ?>/delete?comment_id=' + encodeURIComponent(id);

    const res = await fetch(endpoint, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({ comment_id: id })
    });

    const j = await res.json();
    if (!res.ok || !j.success) throw new Error(j.error || 'Ошибка удаления');

    card.style.transition = 'opacity .25s';
    card.style.opacity = '0';
    setTimeout(() => card.remove(), 250);

  } catch (err) {
    alert(err);
  }
});
</script>
