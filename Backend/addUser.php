<?php
include "db.php";

$data = json_decode(file_get_contents("php://input"));

$name = $data->name;
$email = $data->email;
$password = $data->password;
$role = $data->role;
$photo = $data->photo;

$sql = "INSERT INTO users (name, email, password, role, photo)
VALUES ('$name','$email','$password','$role','$photo')";

if ($conn->query($sql)) {
    echo "User Added";
} else {
    echo "Error";
}
?>