<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Upload Document</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container mt-5">
    <h2>Upload a Document</h2>
    <form action="upload.php" method="post" enctype="multipart/form-data">
        <div class="mb-3">
            <label class="form-label">Choose a .txt file</label>
            <input type="file" name="document" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary">Upload</button>
    </form>
</body>
</html>
