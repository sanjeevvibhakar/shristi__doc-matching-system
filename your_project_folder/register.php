<?php
include("uconfig.php");
$message = '';

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $username = trim($_POST['username']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $check = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $check->bind_param("s", $username);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $password);
        $stmt->execute();
        $message = "Registration successful. <a href='user_login.php'>Login now</a>";
    } else {
        $message = "Username already exists.";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
    <h2>User Registration</h2>
    <?php if ($message) echo "<div class='alert alert-info'>$message</div>"; ?>
    <form method="post" class="w-50">
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input name="username" required class="form-control" />
        </div>
        <div class="mb-3">
            <label class="form-label">Password</label>
            <input name="password" type="password" required class="form-control" />
        </div>
        <button class="btn btn-primary">Register</button>
        <a href="user_login.php" class="btn btn-link">Already have an account?</a>
    </form>
</div>
</body>
</html>