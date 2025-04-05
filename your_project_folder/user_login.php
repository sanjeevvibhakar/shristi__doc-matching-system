<?php
session_start();
include("uconfig.php");
$message = '';

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        header("Location: user_dashboard.php");
        exit();
    } else {
        $message = "Invalid username or password.";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>User Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
    <h2>User Login</h2>
    <?php if ($message) echo "<div class='alert alert-danger'>$message</div>"; ?>
    <form method="post" class="w-50">
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input name="username" required class="form-control" />
        </div>
        <div class="mb-3">
            <label class="form-label">Password</label>
            <input name="password" type="password" required class="form-control" />
        </div>
        <button class="btn btn-success">Login</button>
        <a href="register.php" class="btn btn-link">Create an account</a>
    </form>
</div>
</body>
</html>