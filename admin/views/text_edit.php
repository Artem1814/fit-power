<h2>Редактирование текста</h2>
<form method="post" action="?mode=4">
  <input type="hidden" name="id" value="<?=$id?>">
  <textarea name="newtext"><?= htmlspecialchars($text) ?></textarea><br>
  <button class="btn">Сохранить</button>
</form>
