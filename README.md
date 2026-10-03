# SkillConnect 🚀
### Peer Learning & Knowledge Assessment Platform

A full-stack web application where students learn from each other through questions, answers, peer evaluation, social connections, groups, and performance tracking.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Bootstrap 5, Recharts, Lucide Icons |
| Backend | Java 17, Spring Boot 3, Spring Security, JWT |
| Database | MySQL 8.0, Spring Data JPA / Hibernate |
| Auth | BCrypt password hashing, JWT tokens |

---

## ✨ Features

- 🔐 **Authentication** — Register/Login with JWT, BCrypt hashed passwords, unique username validation
- 🤝 **Connections** — LinkedIn-style connect, accept, reject, and discover users
- ❓ **Questions** — Ask questions to connections with difficulty levels, topics, and max points
- ✍️ **Answers** — One-answer-per-question enforcement at DB and backend level
- ⭐ **Evaluation** — Question creators evaluate answers and award marks
- 🏆 **Leaderboard** — Rankings scoped to your connections with weekly/monthly filters
- 📊 **Progress Tracker** — Topic-wise performance graphs using Recharts
- 👥 **Groups** — Create learning groups, post group questions, group leaderboard
- 🔔 **Notifications** — In-app notifications with unread count badge
- 📢 **Announcements** — Post messages to all connections or a specific person
- 🕵️ **Activity Monitoring** — Tab switches, copy/paste, time spent tracked during answers
- 🔍 **Search** — Search users, questions, groups across the platform
- 🎭 **Avatars** — Female / Male avatar selection throughout the app

---

## 📋 Prerequisites

| Tool | Version |
|------|---------|
| Java JDK | 17+ |
| Apache Maven | 3.8+ |
| Node.js | 18+ |
| MySQL Server | 8.0+ |

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/THRISHAPOOJARY08/skillconnect.git
cd skillconnect
```

### 2. Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE skillconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run the schema and seed scripts:

```powershell
mysqlsh --sql -u root -pYOUR_PASSWORD --file database/schema.sql
mysqlsh --sql -u root -pYOUR_PASSWORD --file database/seed.sql
mysqlsh --sql -u root -pYOUR_PASSWORD --file database/add_announcements.sql
mysqlsh --sql -u root -pYOUR_PASSWORD --file database/add_photo_avatars.sql
```

### 3. Backend Setup

Create a file at `skillconnect-backend/.env.local` with your secrets:

```
DB_PASSWORD=your_mysql_password
JWT_SECRET=YourSuperSecretKeyAtLeast32CharactersLong
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
```

Load environment variables and start the backend:

```powershell
Get-Content skillconnect-backend\.env.local | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2])
  }
}
cd skillconnect-backend
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

### 4. Frontend Setup

```bash
cd skillconnect-frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 👤 Sample Login Credentials

| Username | Password |
|----------|----------|
| alice | password |
| bob | password |
| carol | password |
| david | password |
| eve | password |

---

## 📁 Project Structure

```
skillconnect/
├── database/
│   ├── schema.sql                  # All table definitions
│   ├── seed.sql                    # Sample users and data
│   ├── add_announcements.sql       # Announcements table migration
│   └── add_photo_avatars.sql       # Photo avatar DB entries
├── skillconnect-backend/           # Spring Boot 3 REST API
│   └── src/main/java/com/skillconnect/server/
│       ├── config/                 # Security & CORS config
│       ├── controller/             # REST API controllers
│       ├── dto/                    # Request & Response DTOs
│       ├── entity/                 # JPA entities
│       ├── repository/             # Spring Data JPA interfaces
│       ├── service/                # Business logic
│       ├── security/               # JWT filter & utils
│       └── exception/              # Global error handler
├── skillconnect-frontend/          # React 18 + Vite
│   └── src/
│       ├── api/                    # Axios API client
│       ├── components/             # Sidebar, Navbar, Cards
│       ├── context/                # AuthContext
│       ├── hooks/                  # useActivityMonitor
│       ├── pages/                  # All route pages
│       └── utils/avatar.js         # Smart avatar helper
├── .gitignore
└── README.md
```

---

## 🔒 Security

- Passwords hashed with **BCrypt** — never stored in plain text
- **JWT tokens** for stateless authentication
- All API endpoints (except `/api/auth/**`) require a valid JWT
- Secrets managed via **environment variables** — never hardcoded
- Database-level constraints prevent duplicate answers
- Username uniqueness enforced at DB and API level with live availability check

---

## 🚀 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/check-username` | Check username availability |
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/users/all` | Get all users with connection status |
| GET | `/api/users/search?q=` | Search users |
| POST | `/api/connections/request/{id}` | Send connection request |
| PUT | `/api/connections/{id}/accept` | Accept request |
| GET | `/api/questions` | Get questions feed |
| POST | `/api/questions` | Ask a question |
| POST | `/api/answers/{questionId}` | Submit an answer |
| POST | `/api/evaluations/{answerId}` | Evaluate and award marks |
| GET | `/api/leaderboard` | Get connection leaderboard |
| GET | `/api/progress/topic-scores` | Get topic-wise progress |
| GET | `/api/announcements` | Get announcements feed |
| POST | `/api/announcements` | Post announcement |
| GET | `/api/notifications` | Get notifications |

---

## 📄 License

This project was built for educational purposes.
