# 📁 Document Matcher - PHP Frontend

This is the frontend and user dashboard for the Smart Document Matcher system. Built with PHP + MySQL, it handles user registration, login, credit management, and integration with the Node.js API for document matching.

---

## 🧠 Features

- 🧾 User registration & login  
- 📤 Upload documents for similarity check  
- ⚙️ Calls backend Node.js API for NLP-based matching  
- 🪙 Credit system (1 match = 1 credit)  
- 🛠️ Admin panel to manage users & credits  
- 🗂 Uploads stored securely on the server  

---

## 📦 Folder Structure

/hackathon  
├── index.php            ← Home page  
├── register.php         ← User signup  
├── login.php            ← Login page  
├── dashboard.php        ← User dashboard  
├── match.php            ← Match trigger via curl  
├── logout.php  
├── profile.php  
├── db.php               ← MySQL connection  
├── /uploads             ← Uploaded files (auto-created)  
├── /admin               ← Admin panel  
└── /sql                 ← SQL setup files  

---

## ⚙️ Setup Instructions

### 🔌 1. Local Setup (XAMPP)

- Clone this repo into `htdocs/`:
  git clone https://github.com/YOUR_USERNAME/document-matcher-php.git

- Import the database:
  - Open `phpMyAdmin`
  - Import the SQL from `/sql/create_tables.sql`

- Update `db.php`:
  $conn = new mysqli('localhost', 'root', '', 'your_database_name');

---

### 🔁 2. Connect with Node.js API

Make sure you have the matching Node.js backend running at a public URL (e.g. Render.com).

In `match.php`, update this line:
  $apiURL = 'https://your-api-url.onrender.com/api/match';

---

## 🌐 Live Demo (Optional)

- 🔗 Frontend: https://your-username.000webhostapp.com  
- 🔗 API: https://your-api-url.onrender.com  

---

## 👨‍💻 Credits

Built with ❤️ for Hackathon 2025  
By Team zerotop 🔍

---

## 📄 License

MIT License – free to use, modify, and share.
