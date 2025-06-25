<h2>Текстовые фрагменты</h2>
<?php foreach ($list as $i=>$t): ?>
  <a class="mytext" href="?mode=3&id=<?=$i?>"><?= htmlspecialchars($t) ?></a>
<?php endforeach ?>
