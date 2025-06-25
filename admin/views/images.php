<h2>Картинки страницы</h2>
<?php
preg_match_all('/["\'\(]([^"\')]+\.(?:jpg|jpeg|png|gif|webp))["\'\)]/i',$html,$m);
foreach(array_unique($m[1]) as $src){
    $rel = ltrim($src,'/\\');
    $abs = absPath($rel) ?: realpath($pageDir.'/'.$rel);   
    if(!$abs) continue;
    $sz  = @getimagesize($abs); $p = $sz ? "{$sz[0]}×{$sz[1]}" : '—';
    echo "<div class='kartinka'>
            <a href='?mode=1&img=$rel'>
              <img src='/$rel?".rand()."' height='110'>
            </a><br>$rel<br>$p
          </div>";
}
?>