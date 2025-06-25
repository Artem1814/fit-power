<?php if (!isset($_POST['show'])): ?>
  <h3>Полный HTML‑код</h3>
  <form method="post">
    <label><input type="checkbox" name="show" required> Я понимаю, что могу сломать страницу</label><br><br>
    <button class="btn">Показать код</button>
  </form>
<?php else: ?>
  <form method="post" action="?mode=6">
    <textarea name="code"><?= htmlspecialchars($html) ?></textarea><br>
    <button class="btn">Сохранить</button>
  </form>
<?php endif ?>
