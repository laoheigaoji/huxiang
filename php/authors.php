<?php
// authors.php
header('Content-Type: application/json');
$json = file_get_contents('../data/authors.json');
echo $json;
?>
