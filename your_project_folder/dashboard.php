<?php
session_start();
include("config.php");

if (!isset($_SESSION['admin'])) {
    header("Location: login.php");
    exit();
}
// Handle Approve/Reject credit requests
if (isset($_GET['action']) && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $action = $_GET['action'];

    if ($action == "approve") {
        $request = $conn->query("SELECT * FROM credit_requests WHERE id = $id AND status = 'pending'")->fetch_assoc();
        if ($request) {
            $user_id = $request['user_id'];
            $amount = $request['amount'];
            $conn->query("UPDATE users SET credits = credits + $amount WHERE id = $user_id");
            $conn->query("UPDATE credit_requests SET status = 'approved' WHERE id = $id");
        }
    } elseif ($action == "reject") {
        $conn->query("UPDATE credit_requests SET status = 'rejected' WHERE id = $id");
    }
}


// Fetch credit requests
$creditRequests = $conn->query("SELECT credit_requests.id, users.username, credit_requests.status 
                                FROM credit_requests 
                                JOIN users ON credit_requests.user_id = users.id 
                                WHERE credit_requests.status = 'pending'");

// Get total scan count
$scanCount = 0;
$scanResult = $conn->query("SELECT SUM(scans) AS total_scans FROM users");
if ($scanResult && $scanResult->num_rows > 0) {
    $row = $scanResult->fetch_assoc();
    $scanCount = isset($row['total_scans']) ? $row['total_scans'] : 0;
}

// Get top users
$topUsers = $conn->query("SELECT username, scans FROM users ORDER BY scans DESC LIMIT 5");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f4f6f9;
        }
        .card {
            border-radius: 10px;
            box-shadow: 0 0.25rem 1rem rgba(0,0,0,0.05);
        }
        .section-title {
            font-weight: 600;
            font-size: 1.2rem;
        }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#">Admin Dashboard</a>
        <div class="d-flex">
            <a href="logout.php" class="btn btn-outline-light">Logout</a>
        </div>
    </div>
</nav>

<div class="container py-4">
    <div class="row g-4">
        <!-- Total Scans -->
        <div class="col-md-4">
            <div class="card text-bg-success">
                <div class="card-body text-center">
                    <h4 class="card-title">Total Scans</h4>
                    <h1 class="display-4"><?php echo $scanCount; ?></h1>
                </div>
            </div>
        </div>

        <!-- Top Users -->
        <div class="col-md-8">
            <div class="card">
                <div class="card-header bg-primary text-white section-title">Top Users</div>
                <ul class="list-group list-group-flush">
                    <?php if ($topUsers && $topUsers->num_rows > 0): ?>
                        <?php while ($row = $topUsers->fetch_assoc()): ?>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <?php echo htmlspecialchars($row['username']); ?>
                                <span class="badge bg-primary rounded-pill"><?php echo $row['scans']; ?> scans</span>
                            </li>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <li class="list-group-item text-muted">No users found.</li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>

        <!-- Credit Requests -->
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-warning section-title">Pending Credit Requests</div>
                <div class="card-body">
                    <?php if ($creditRequests->num_rows > 0): ?>
                        <?php while ($row = $creditRequests->fetch_assoc()): ?>
                            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                                <span>
                                    <strong><?php echo htmlspecialchars($row['username']); ?></strong> requested more credits
                                </span>
                                <div>
                                    <a href="handle_request.php?id=<?php echo $row['id']; ?>&status=approved" class="btn btn-success btn-sm">Approve</a>
<a href="handle_request.php?id=<?php echo $row['id']; ?>&status=rejected" class="btn btn-danger btn-sm">Reject</a>

                                </div>
                            </div>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <p class="text-muted">No pending requests.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
