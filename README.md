# SkillConnect – Peer Learning & Knowledge Assessment Platform

## Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17+ |
| Apache Maven | 3.8+ |
| Node.js | 18+ |
| MySQL Server | 8.0 |
| (Optional) Mailtrap account | Free tier |

---

## 1. Database Setup

```sql
CREATE DATABASE skillconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the schema and seed scripts:

```bash
mysql -u root -p skillconnect < database/schema.sql
mysql -u root -p skillconnect < database/seed.sql
```

---

## 2. Backend Setup

Edit `skillconnect-backend/src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
app.jwt.secret=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
spring.mail.username=YOUR_MAILTRAP_USERNAME
spring.mail.password=YOUR_MAILTRAP_PASSWORD
```

Build and run:

```bash
cd skillconnect-backend
mvn clean install -DskipTests
mvn spring-boot:run
```

The API will be available at **http://localhost:8080/api**

---

## 3. Frontend Setup

```bash
cd skillconnect-frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:5173**

---

## 4. Sample Login Credentials

| Username | Password    | Role     |
|----------|-------------|----------|
| alice    | Password1!  | Student  |
| bob      | Password1!  | Student  |
| carol    | Password1!  | Student  |
| david    | Password1!  | Student  |
| eve      | Password1!  | Student  |

---

## 5. Project Structure

```
skillconnect/
├── skillconnect-backend/       # Spring Boot 3 API
│   └── src/main/java/com/skillconnect/server/
│       ├── config/             # Security, CORS, JWT config
│       ├── controller/         # REST controllers
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA entities
│       ├── repository/         # Spring Data JPA repos
│       ├── service/            # Business logic
│       └── exception/          # Global error handling
├── skillconnect-frontend/      # React 18 + Vite
│   └── src/
│       ├── api/                # Axios client
│       ├── components/         # Reusable components
│       ├── context/            # Auth context
│       └── pages/              # Route pages
└── database/
    ├── schema.sql              # Table definitions
    └── seed.sql                # Sample data
```

---

## 6. Key Features

- JWT-based authentication with BCrypt password hashing
- Connection system (LinkedIn-style)
- Ask questions to connections with one-answer enforcement
- Answer evaluation and point award system
- Real-time leaderboard scoped to connections
- Topic-wise progress tracking with Recharts graphs
- Group learning with shared question feeds
- Activity monitoring (tab switching, copy/paste) during answers
- In-app notifications with unread badge
- Global search across users, questions, and groups
