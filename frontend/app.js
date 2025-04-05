const serverUrl = 'http://localhost:3000'; // Your backend server URL

let allFiles = []; // Store all files globally

// Handle file upload
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('document', file);

  try {
    const response = await axios.post(`${serverUrl}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log(response.data);
    alert('File uploaded successfully!');
    fileInput.value = '';
    loadFiles();
  } catch (error) {
    console.error(error);
    alert(error.response.data.message || 'Failed to upload file.');
  }
}

// Load all uploaded files
async function loadFiles() {
  try {
    const response = await axios.get(`${serverUrl}/files`);
    allFiles = response.data.files; // Save to global variable
    renderFiles(allFiles);
  } catch (error) {
    console.error(error);
    alert('Failed to load files.');
  }
}

// Render files on the page
function renderFiles(files) {
  let fileCards = '';

  if (files.length === 0) {
    fileCards = `<p class="text-center text-muted">No files found.</p>`;
  } else {
    files.forEach(file => {
      fileCards += `
        <div class="col-md-3 file-card">
          <div class="card mb-4 shadow-sm">
            <div class="card-body text-center">
              <h6 class="card-title text-truncate" style="max-width: 100%;">${file.file_name}</h6>
              <a href="${serverUrl}/download/${file.id}" class="btn btn-success btn-sm mb-2" target="_blank">Download</a>
              <button class="btn btn-primary btn-sm mb-2" onclick="openPreview(${file.id})">Preview</button>
              <button class="btn btn-danger btn-sm" onclick="deleteFile(${file.id})">Delete</button>
            </div>
          </div>
        </div>
      `;
    });
  }

  document.getElementById('fileList').innerHTML = `<div class="row">${fileCards}</div>`;
}

// Delete a file
async function deleteFile(fileId) {
  if (!confirm('Are you sure you want to delete this file?')) {
    return;
  }

  try {
    await axios.delete(`${serverUrl}/delete/${fileId}`);
    alert('File deleted successfully!');
    loadFiles();
  } catch (error) {
    console.error(error);
    alert('Failed to delete file.');
  }
}

// Open Preview Modal
function openPreview(fileId) {
  const previewFrame = document.getElementById('previewFrame');
  previewFrame.src = `${serverUrl}/preview/${fileId}`;
  const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
  previewModal.show();
}

// Search files live
document.getElementById('searchInput').addEventListener('input', function (e) {
  const query = e.target.value.toLowerCase();
  const filteredFiles = allFiles.filter(file => file.file_name.toLowerCase().includes(query));
  renderFiles(filteredFiles);
});

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  loadFiles();
});

// Handle form submit
document.getElementById('uploadForm').addEventListener('submit', function (e) {
  e.preventDefault();
  uploadFile();
});
