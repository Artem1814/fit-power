<h2>Список тренеров</h2>

<table class="tr-table">
  <thead>
    <tr>
      <th>ID</th><th>Email</th><th>Имя</th><th>Фамилия</th><th>Secret&nbsp;Key</th><th></th>
    </tr>
  </thead>
  <tbody>
  <?php foreach ($trainers as $t): ?>
    <tr data-id="<?= $t['id'] ?>">
      <td><?= $t['id'] ?></td>
      <td><?= htmlspecialchars($t['email']) ?></td>
      <td><?= htmlspecialchars($t['first_name']) ?></td>
      <td><?= htmlspecialchars($t['last_name']) ?></td>
      <td><code><?= htmlspecialchars($t['trainer_key']) ?></code></td>
      <td class="tr-actions">
        <button class="tr-btn del" onclick="delTrainer('<?= $t['id'] ?>')">Удалить</button>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>

<p><a class="btn" href="?mode=41">+ Добавить тренера</a></p>

<script>
function delTrainer(id){
  if(!confirm('Удалить тренера?')) return;
  location.href = '?mode=43&id='+encodeURIComponent(id);
}
</script>
