<?php
header("Access-Control-Allow-Origin: *");

include "db.php"; // ✅ VERY IMPORTANT

$result = $conn->query("SELECT * FROM questions");

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
?>