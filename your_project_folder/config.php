<?php
$host = "localhost"; // or 127.0.0.1
$dbname = "user_system"; // name of the database you created
$username = "root"; // default XAMPP username
$password = ""; // default XAMPP password is empty

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Connected successfully"; // Uncomment this to debug
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
