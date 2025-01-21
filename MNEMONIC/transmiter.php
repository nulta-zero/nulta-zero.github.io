<?php
header("Content-Type: application/json");
$v = json_decode(file_get_contents("php://input" ) );     //stripslashes(
$txt = json_encode($v, JSON_PRETTY_PRINT);
file_put_contents('list.json', $txt);
?>
