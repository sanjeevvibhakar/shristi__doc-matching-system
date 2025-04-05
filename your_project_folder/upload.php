<?php
$targetDir = "../uploads/";
$targetFile = $targetDir . basename($_FILES["document"]["name"]);

if (move_uploaded_file($_FILES["document"]["tmp_name"], $targetFile)) {
    echo "File has been uploaded successfully.<br>";
    echo "<a href='user_dashboard.php'>Go to Dashboard</a>";
} else {
    echo "Sorry, there was an error uploading your file.";
}
?>
