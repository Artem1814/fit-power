<?php
$rel = ltrim($img,'/\\'); $abs = absPath($rel);
if(!$abs){echo"Неверный путь"; return;}
$sz=@getimagesize($abs);
?>
<div id="banner">Исходные пропорции: <?=$sz[0]?>×<?=$sz[1]?></div>
<img src="/<?=$rel?>?<?=rand()?>" class="bigimg"><p>
<form enctype="multipart/form-data" method="post" action="?mode=2&img=<?=$rel?>">
  <input type="file" name="file" required><br><br>
  <button class="btn">Заменить</button>
</form>
