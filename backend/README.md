# 🎓 LMS Platform Backend (Strapi Headless CMS)

A robust, scalable, and fully configured backend for a modern Learning Management System (LMS) built with **Strapi (v5)**, **Cloudinary**, and **Nodemailer (Gmail SMTP)**.

---

## 🌟 Key Features

* **Authentication & RBAC:** User registration, login, profile view (`/api/users/me`), role-based permissions (`Student`, `Instructor`, `Admin`).
* **Password Management:** Complete forgot password, reset password flow via email tokens, and authenticated password changes.
* **Course & Content Architecture:** Nested structures for courses, lessons, and video content.
* **Enrollment & Progress Tracking:** Auto-bound user enrollments, duplicate enrollment prevention, and completed lesson tracking.
* **Quiz Engine:** Dynamic quiz questions and student quiz result submissions.
* **Cloud Media Storage:** Direct media (image/video/doc) uploads powered by **Cloudinary**.
* **Transactional Emails:** Automated emails for password reset and notifications via **Gmail SMTP**.

---

## 🛠️ Tech Stack & Plugins

* **Core:** [Strapi v5](https://strapi.io/) (Headless CMS)
* **Language:** TypeScript / JavaScript
* **Database:** SQLite (Development) / PostgreSQL (Production ready)
* **Media Provider:** `@strapi/provider-upload-cloudinary`
* **Email Provider:** `@strapi/provider-email-nodemailer`

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/lms-backend-strapi.git
cd lms-backend-strapi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```env
# Server
HOST=0.0.0.0
PORT=1337

# Secrets (Generate your own or use Strapi defaults)
APP_KEYS="yourAppKey1,yourAppKey2"
API_TOKEN_SALT=yourApiTokenSalt
ADMIN_JWT_SECRET=yourAdminJwtSecret
TRANSFER_TOKEN_SALT=yourTransferTokenSalt
JWT_SECRET=yourJwtSecret

# Cloudinary Setup
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Email Configuration (Nodemailer - Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM=your-email@gmail.com
SMTP_REPLY_TO=your-email@gmail.com
```

### 4. Run the development server

```bash
npm run develop
```

Open `http://localhost:1337/admin` to register the first admin user and explore the Strapi Dashboard.

---

## 📡 API Endpoints Reference

### 🔐 Authentication & Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/local/register` | Register new student/user | No |
| POST | `/api/auth/local` | User login (returns JWT) | No |
| GET | `/api/users/me` | Fetch logged-in user profile | Yes (Bearer Token) |
| POST | `/api/auth/forgot-password` | Request password reset email | No |
| POST | `/api/auth/reset-password` | Reset password using email code | No |
| POST | `/api/auth/change-password` | Change password while logged in | Yes (Bearer Token) |

### 📚 Courses & Enrollments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses?populate=*` | Get all published courses | Optional |
| GET | `/api/courses/:id?populate=*` | Get specific course with lessons | Optional |
| POST | `/api/enrollments` | Enroll into a course (auto-links user) | Yes (Bearer Token) |
| GET | `/api/enrollments?populate=*` | Get user enrollments and progress | Yes (Bearer Token) |
| PUT | `/api/enrollments/:id` | Update completed lessons | Yes (Bearer Token) |

### 📝 Quizzes & Results

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/quizzes?populate=*` | Fetch quiz with questions | Yes (Bearer Token) |
| POST | `/api/quiz-results` | Submit quiz score/answers | Yes (Bearer Token) |

---

## ⚙️ Available Scripts

```bash
npm run develop   # Starts the Strapi server with auto-reload
npm run build     # Builds the Strapi admin UI for production
npm run start     # Runs the pre-built application in production mode
npm run strapi    # Runs Strapi CLI commands
```

---

## 📁 Project Structure

```text
lms-backend-strapi/
├── config/
├── database/
├── src/
│   ├── api/
│   │   ├── course/
│   │   ├── lesson/
│   │   ├── enrollment/
│   │   ├── quiz/
│   │   └── quiz-result/
│   └── extensions/
├── public/
├── .env.example
├── package.json
└── README.md
```

---

## 🔒 Authentication

For protected endpoints, include the JWT token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Example:

```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## ☁️ Cloudinary

Uploaded images, videos, and documents are stored using Cloudinary.

Required environment variables:

```env
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

---

## 📧 Gmail SMTP

Nodemailer is configured to send transactional emails through Gmail SMTP.

Use a **Google App Password** instead of your normal Gmail password.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM=your-email@gmail.com
SMTP_REPLY_TO=your-email@gmail.com
```

---

## 🚀 Production

For production deployment:

```bash
npm run build
npm run start
```

The project is designed to use:

- **PostgreSQL** for production database
- **Cloudinary** for media storage
- **Gmail SMTP / Nodemailer** for transactional emails
- **Strapi v5** as the headless CMS and backend API

---

## 👨‍💻 Author

LMS Platform Backend built with Rabbi Hasan. For any questions or contributions, feel free to reach out or submit a pull request.