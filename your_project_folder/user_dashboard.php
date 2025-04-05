<?php
session_start();
include("config.php");

if (!isset($_SESSION['user_id'])) {
    header("Location: user_login.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$user = [];

// Fetch user data from database
$userQuery = $conn->query("SELECT * FROM users WHERE id = $user_id");
if ($userQuery && $userQuery->num_rows > 0) {
    $user = $userQuery->fetch_assoc();
} else {
    die("User not found.");
}

// Set safe defaults if columns are missing
$user['daily_scans'] = isset($user['daily_scans']) ? $user['daily_scans'] : 0;
$user['credits'] = isset($user['credits']) ? $user['credits'] : 0;
$user['last_scan_date'] = isset($user['last_scan_date']) ? $user['last_scan_date'] : null;

$today = date('Y-m-d');

// Reset daily scans if it's a new day
if ($user['last_scan_date'] !== $today) {
    $conn->query("UPDATE users SET daily_scans = 0, last_scan_date = '$today' WHERE id = $user_id");
    $user['daily_scans'] = 0;
    $user['last_scan_date'] = $today;
}

$message = "";

// Handle credit request
if (isset($_POST['request_credit'])) {
    $check = $conn->query("SELECT * FROM credit_requests WHERE user_id = $user_id AND status = 'pending'");
    if ($check && $check->num_rows == 0) {
        $insert = $conn->query("INSERT INTO credit_requests (user_id, amount) VALUES ($user_id, 10)");
        if (!$insert) {
            $message = " Error: " . $conn->error;
        } else {
            $message = " Credit request submitted!";
        }
    } else {
        $message = " You already have a pending request.";
    }
}


?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container py-4">
    <h2 class="mb-4"> Welcome, <?= htmlspecialchars($user['username']) ?></h2>

    <?php if ($message): ?>
        <div class="alert alert-info"><?= $message ?></div>
    <?php endif; ?>

    <div class="row g-4 mb-3">
        <div class="col-md-4">
            <div class="card border-success text-center">
                <div class="card-body">
                    <h5 class="card-title">Daily Scans</h5>
                    <p class="display-6"><?= (int)$user['daily_scans'] ?> / 20</p>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-primary text-center">
                <div class="card-body">
                    <h5 class="card-title">Credits</h5>
                    <p class="display-6"><?= (int)$user['credits'] ?></p>
                </div>
            </div>
        </div>
		<hr>
<h4>Your Uploaded Documents</h4>
<?php
$user_id = $_SESSION['user_id'];
$result = $conn->query("SELECT filename, uploaded_at FROM uploads WHERE user_id = $user_id ORDER BY uploaded_at DESC");

if ($result && $result->num_rows > 0) {
    echo "<ul class='list-group'>";
    while ($row = $result->fetch_assoc()) {
        echo "<li class='list-group-item d-flex justify-content-between align-items-center'>";
        echo "<a href='uploads/" . htmlspecialchars($row['filename']) . "' target='_blank'>" . htmlspecialchars($row['filename']) . "</a>";
        echo "<small class='text-muted'>" . $row['uploaded_at'] . "</small>";
        echo "</li>";
    }
    echo "</ul>";
} else {
    echo "<p class='text-muted'>No documents uploaded yet.</p>";
}
?>


        <div class="col-md-4 d-flex align-items-center">
            <form method="post" class="w-100">
    <button type="submit" name="request_credit" class="btn btn-warning w-100">Request More Credits</button>
</form>

        </div>
    </div>

    <a href="logout.php" class="btn btn-secondary">Logout</a>
</div>

</body>
</html>
