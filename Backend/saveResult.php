<?php
include "db.php";

$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$score = $data->score;
$total = $data->total;
$date = $data->date;

$sql = "INSERT INTO results (email, score, total, date)
VALUES ('$email','$score','$total','$date')";

$conn->query($sql);
?>