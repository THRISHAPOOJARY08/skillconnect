# SkillConnect – Implementation Plan

## Top-Level Overview

Build **SkillConnect**, a full-stack peer-learning and knowledge-assessment platform from scratch in an empty workspace.

| Layer | Technology |
|---|---|
| Frontend | React 18, Bootstrap 5, Recharts, Lucide-react, React Router v6 |
| Backend | Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA |
| Database | MySQL 8.0 |
| Email | Mailtrap SMTP (free dev tier, password reset only) |
| Build tools | Vite (frontend), Maven (backend) |
| Dev environment | Local only (no Docker) |

**Avatars:** predefined set only (no file upload).  
**Styling:** Bootstrap 5 component library.  
**Charts:** Recharts (React-native).

The application is developed in 10 ordered phases. Each phase produces a working, testable slice. Phase deliverables are cumulative — later phases extend earlier ones without breaking them.

---

## Sub-Task 1 — Repository Structure and Project Scaffolding

**Status:** [x] done

### Intent
Establish the monorepo folder layout, tooling configs, and empty project skeletons so every subsequent phase has a clear home for its files.

### Expected Outcomes
- `/skillconnect-backend/` — Maven Spring Boot 3 project compiles with `mvn clean install`.
- `/skillconnect-frontend/` — Vite + React 18 project runs with `npm run dev`.
- `/database/` — empty folder ready for SQL scripts.
- `README.md` exists at repo root with setup instructions skeleton.
- `.gitignore` covers Java, Node, IDE artefacts.

### Todo List
1. Create `skillconnect-backend/` using Spring Initializr conventions (Maven, Java 17, Spring Boot 3.x). Include dependencies: Spring Web, Spring Security, Spring Data JPA, MySQL Driver, Lombok, Validation, JavaMailSender.
2. Create `skillconnect-frontend/` using Vite React template (`npm create vite@latest`). Install: react-router-dom, bootstrap, bootstrap-icons, recharts, lucide-react, axios.
3. Create `database/` folder with placeholder `schema.sql` and `seed.sql` files.
4. Add root `README.md` with "Prerequisites", "Database setup", "Backend setup", "Frontend setup", and "Running the app" sections (content added as the phases progress).
5. Add `.gitignore` covering `target/`, `node_modules/`, `.env`, `*.class`, IDE files.

### Relevant Context
- No existing files — pure greenfield.
- Backend port: `8080`. Frontend port: `5173`. Configure CORS in Spring to allow `http://localhost:5173`.

---

## Sub-Task 2 — Database Schema and Sample Data

**Status:** [x] done

### Intent
Define the complete MySQL schema up front so the JPA entities in later phases have a stable target. Providing sample data enables manual testing from Phase 1 onward.

### Expected Outcomes
- `database/schema.sql` creates all 17 tables with correct PKs, FKs, constraints, and indexes.
- `database/seed.sql` inserts at least 5 sample users, topics, avatars, connections, questions, answers, and evaluations.
- All constraints that enforce business rules (one answer per question, no self-connections, evaluation uniqueness) exist at the DB level.

### Todo List
1. Write `users` table (id, username, email, password_hash, full_name, bio, college, avatar_id, created_at, is_active, reset_token, reset_token_expiry).
2. Write `avatars` table (id, name, file_path) with 10 predefined rows in seed.
3. Write `user_profiles` table (user_id PK/FK, skills TEXT, interests TEXT, updated_at).
4. Write `connections` table (id, requester_id FK, addressee_id FK, status ENUM[PENDING,ACCEPTED,REJECTED], created_at, updated_at) with UNIQUE(requester_id, addressee_id).
5. Write `topics` table (id, name UNIQUE, created_at).
6. Write `questions` table (id, creator_id FK, topic_id FK, title, description, difficulty ENUM[EASY,MEDIUM,HARD], max_points INT, status ENUM[PENDING,ANSWERED,EVALUATED,CLOSED], created_at).
7. Write `question_recipients` table (question_id FK, user_id FK, PK is composite) — supports multiple recipients.
8. Write `answers` table (id, question_id FK UNIQUE — enforces one answer per question, answerer_id FK, content TEXT, submitted_at). The UNIQUE on question_id is the DB-level one-answer guard.
9. Write `evaluations` table (id, answer_id FK UNIQUE, evaluator_id FK, awarded_points INT, feedback TEXT, evaluated_at). UNIQUE on answer_id prevents double evaluation.
10. Write `user_scores` table (user_id PK/FK, total_points INT DEFAULT 0, total_answers INT DEFAULT 0, total_evaluated INT DEFAULT 0, updated_at).
11. Write `topic_scores` table (id, user_id FK, topic_id FK, earned_points INT, max_points INT, UNIQUE(user_id, topic_id)).
12. Write `groups` table (id, name, description, topic_id FK, avatar, visibility ENUM[PUBLIC,PRIVATE], creator_id FK, created_at).
13. Write `group_members` table (group_id FK, user_id FK, role ENUM[ADMIN,MEMBER], joined_at, PK composite).
14. Write `group_questions` table — same fields as `questions` plus `group_id FK`; enforce one-answer via `answers.question_id` UNIQUE (reuse the same `answers` table).
15. Write `notifications` table (id, recipient_id FK, type VARCHAR, message TEXT, is_read BOOLEAN, created_at, reference_id, reference_type).
16. Write `activity_logs` table (id, answer_id FK, user_id FK, event_type VARCHAR, event_timestamp DATETIME, metadata JSON).
17. Write `user_activities` table (id, user_id FK, activity_type VARCHAR, reference_id, created_at) for dashboard feed.
18. Add foreign key indexes on all FK columns. Add index on `questions.status`, `questions.topic_id`, `connections.status`.
19. Write `seed.sql` with: 5 users (BCrypt-hashed passwords), 10 avatars, 5 topics, 3 connections, 4 questions, 2 answers, 1 evaluation, sample notifications.

### Relevant Context
- UNIQUE constraint on `answers.question_id` is the primary integrity guard for the one-answer rule.
- UNIQUE on `evaluations.answer_id` prevents duplicate point award.
- Connections table uses `status` field — never delete rows on rejection; update status instead.

---

## Sub-Task 3 — Backend Foundation: Auth, Security, and User APIs

**Status:** [x] done

### Intent
Build the authentication layer (JWT, BCrypt), user registration/login, and the Spring Security filter chain so all subsequent phases can add secured endpoints behind it.

### Expected Outcomes
- `POST /api/auth/register` creates a user and returns JWT.
- `POST /api/auth/login` validates credentials and returns JWT.
- `POST /api/auth/forgot-password` sends a reset email via Mailtrap.
- `POST /api/auth/reset-password` validates token and updates password.
- All endpoints except `/api/auth/**` require a valid `Authorization: Bearer <token>` header.
- Passwords are BCrypt-hashed. Plain-text passwords never stored.
- Duplicate username/email returns HTTP 409 with a message.

### Todo List
1. Create JPA entities: `User`, `UserProfile`, `Avatar`, `UserScore`.
2. Create Spring Data JPA repositories for each entity.
3. Implement `UserDetailsService` backed by the `users` table.
4. Write `JwtUtil` (generate, validate, extract claims). Use HS256, configurable secret and expiry in `application.properties`.
5. Write `JwtAuthenticationFilter` — reads `Authorization` header, validates token, sets `SecurityContext`.
6. Configure `SecurityFilterChain`: permit `/api/auth/**`, require auth for everything else, stateless session, disable CSRF, add JWT filter.
7. Write `AuthController` with `/register`, `/login`, `/forgot-password`, `/reset-password`.
8. Write `UserController` with `GET /api/users/me`, `PUT /api/users/me` (profile update), `GET /api/users/{id}` (public profile), `GET /api/users/search?q=`.
9. Configure Mailtrap SMTP in `application.properties` (host, port, username, password as placeholders, to be filled by developer).
10. Write `EmailService` that sends password reset links.
11. Add `GlobalExceptionHandler` using `@RestControllerAdvice` for validation errors, not-found, and conflict responses.
12. Add `application.properties` with DB connection, JPA settings, JWT secret placeholder, and mail settings.

### Relevant Context
- Use `spring-boot-starter-mail` for email.
- Store `reset_token` and `reset_token_expiry` in `users` table (added in Sub-Task 2).
- All controllers annotated with `@RequestMapping("/api/...")`.

---

## Sub-Task 4 — Frontend Foundation: Routing, Auth Pages, and Layout Shell

**Status:** [x] done

### Intent
Build the React application shell — public auth pages (register, login, forgot/reset password) and the private layout (sidebar + navbar) that all dashboard pages will live inside.

### Expected Outcomes
- `/register` shows a multi-field registration form with avatar picker (predefined grid).
- `/login` shows login form with show/hide password and "Remember me".
- `/forgot-password` and `/reset-password` pages exist.
- After login, JWT stored in `localStorage`; user redirected to `/dashboard`.
- `PrivateRoute` component redirects unauthenticated users to `/login`.
- Layout shell renders sidebar + top navbar with notification icon (badge counter placeholder).
- All 11 sidebar navigation items render as links (pages are stubs initially).
- Bootstrap 5 applied globally; custom CSS variables for the navy/light-blue palette.

### Todo List
1. Set up React Router v6 with route definitions for all application pages.
2. Create `AuthContext` (React Context) providing `user`, `token`, `login()`, `logout()`.
3. Create `apiClient` (axios instance) that attaches `Authorization` header from `localStorage` token automatically.
4. Build `RegisterPage` — form with all required fields, avatar picker grid showing 10 predefined avatar images, client-side validation.
5. Build `LoginPage` — username/email + password, show/hide toggle, remember-me checkbox, forgot-password link.
6. Build `ForgotPasswordPage` and `ResetPasswordPage`.
7. Build `MainLayout` component: fixed sidebar + top navbar + content `<Outlet />`.
8. Build `Sidebar` with all 11 navigation items using Lucide icons; highlight active route.
9. Build `Navbar` with username, avatar, notification bell (badge), and logout button.
10. Add `PrivateRoute` wrapper.
11. Wire Register/Login to backend endpoints via `apiClient`; store JWT and user info in `AuthContext` on success.
12. Add Bootstrap 5 CDN/npm import; define CSS custom properties for the color palette in `index.css`.

### Relevant Context
- Predefined avatar images can be served as static assets in `public/avatars/` (10 PNG files with simple illustrated faces or colored initials).
- JWT stored in `localStorage` under key `skillconnect_token`.

---

## Sub-Task 5 — Dashboard Home and User Profile Pages

**Status:** [x] done

### Intent
Build the personalized dashboard home page and the user profile page so users immediately see their stats and can edit their information after login.

### Expected Outcomes
- `GET /api/dashboard/summary` returns: questions asked, answers received, answers evaluated, total points, connection rank, connections count, recent activities.
- Dashboard home displays all summary cards with real data from the backend.
- My Profile page shows all profile fields and an Edit Profile form.
- `PUT /api/users/me` updates profile and returns updated user.
- Topic-wise progress table visible on profile (populated by evaluation data).

### Todo List
1. Create `DashboardController` with `GET /api/dashboard/summary` — aggregate query across questions, answers, evaluations, connections, and user_scores for the logged-in user.
2. Create `DashboardService` that computes recent activity feed from `user_activities` table.
3. Build `DashboardHome` React page: welcome banner, 6 stat cards (questions asked, answers, evaluated, points, rank, connections), recent activity list, quick-action buttons (Ask Question, Find Connections, Create Group).
4. Build `MyProfilePage`: display all fields, skills tags, interests, college. Include "Edit Profile" button that opens an inline form.
5. Connect Edit Profile form to `PUT /api/users/me`; update `AuthContext` user on success.
6. Add `GET /api/users/{id}/topic-scores` endpoint; display topic-wise progress table on profile.

### Relevant Context
- Dashboard summary aggregates need efficient SQL — consider a single native query or JPQL with joins rather than multiple round trips.
- Connection rank = position of logged-in user when all accepted connections (plus the user) are sorted by total_points DESC.

---

## Sub-Task 6 — Connection System

**Status:** [x] done

### Intent
Implement the LinkedIn-style connection system so users can discover peers, send/accept/reject requests, and build the network that gates question exchange.

### Expected Outcomes
- `POST /api/connections/request/{userId}` sends a request.
- `PUT /api/connections/{id}/accept` accepts; `PUT /api/connections/{id}/reject` rejects.
- `DELETE /api/connections/{id}` removes an accepted connection.
- `GET /api/connections` returns accepted connections of the logged-in user.
- `GET /api/connections/pending` returns incoming pending requests.
- `GET /api/users/search?q=` returns users with connection status for each.
- Self-request prevented at service layer and DB level.
- Connections page shows: search bar, user cards with Connect/Pending/Connected/Reject buttons, pending requests panel.

### Todo List
1. Create `Connection` JPA entity and `ConnectionRepository`.
2. Write `ConnectionService` with `sendRequest`, `acceptRequest`, `rejectRequest`, `removeConnection`, `getConnections`, `getPendingRequests`. Validate no self-request, no duplicate request.
3. Write `ConnectionController` mapping all above endpoints.
4. Write `UserSearchService` that queries users by name/username/skills and annotates each result with connection status relative to the requesting user.
5. Build `ConnectionsPage` React page: search input, user card grid (avatar, name, username, bio, skills, total points, connect button), pending requests section.
6. Build reusable `UserCard` component.
7. On "Connect" click, POST to backend and update button state to "Pending".
8. On "Accept/Reject" in pending panel, PUT to backend and refresh list.
9. Trigger notification creation on request sent and accepted (call `NotificationService` from `ConnectionService`).

### Relevant Context
- Connection status is stored in `connections` table with `status` column — never hard-delete rejected connections; update status.
- Mutual connections: users A-B and A-C have a mutual connection if B and C are also connected. Show count on user cards.

---

## Sub-Task 7 — Ask Question and Answer Submission

**Status:** [x] done

### Intent
Implement the core learning loop: creating questions directed at connections, submitting answers, and enforcing the one-answer-per-question rule at both DB and service layers.

### Expected Outcomes
- `POST /api/questions` creates a question; inserts rows in `question_recipients` and `user_activities`.
- `GET /api/questions/received` returns questions assigned to the logged-in user (with status).
- `GET /api/questions/sent` returns questions created by the logged-in user.
- `POST /api/answers/{questionId}` submits an answer; returns HTTP 409 if answer already exists.
- Question status auto-updates to ANSWERED when first answer arrives.
- Answer submission triggers a notification to the question creator.
- A user cannot answer their own question.

### Todo List
1. Create JPA entities: `Question`, `QuestionRecipient`, `Answer`.
2. Write `QuestionService`: `createQuestion` (validates recipients are connections), `getReceivedQuestions`, `getSentQuestions`, `getQuestionById`.
3. Write `AnswerService`: `submitAnswer` — checks `answers` table for existing row by `question_id` (UNIQUE constraint will also throw at DB level if race condition), checks answerer is a recipient, prevents self-answer.
4. Write `QuestionController` and `AnswerController`.
5. Build `AskQuestionPage` React page: form with title, description, topic dropdown (fetched from backend), difficulty select, max_points input, multi-select connection picker.
6. Build `AnswerQuestionsPage` — feed of received questions showing status badges. "Reply" button opens `AnswerEditorPage`.
7. Build `AnswerEditorPage`: displays original question, large textarea for answer, submit/cancel buttons. On load, warn user that activity monitoring is active.
8. Build `MyQuestionsPage` — sent questions with status badges and answer/evaluation preview.
9. On answer submission success, navigate user back to feed and show toast.

### Relevant Context
- `answers.question_id` has a UNIQUE constraint (Sub-Task 2) — the DB is the final guard.
- Activity log entries (tab switches, copy/paste) are written to `activity_logs` by the frontend monitor component built in Sub-Task 10.

---

## Sub-Task 8 — Answer Evaluation and Score System

**Status:** [x] done

### Intent
Allow question creators to review submitted answers, award marks, and write feedback. Awarded marks flow into `user_scores`, `topic_scores`, and update the leaderboard.

### Expected Outcomes
- `POST /api/evaluations/{answerId}` creates evaluation; returns 409 if already evaluated.
- Awarded points cannot exceed `questions.max_points`.
- `user_scores.total_points` incremented atomically.
- `topic_scores` row upserted for the answerer's topic.
- Question status updated to EVALUATED.
- Notification sent to answer author.
- Only the question creator can call the evaluation endpoint.

### Todo List
1. Create `Evaluation` JPA entity and `EvaluationRepository`.
2. Write `EvaluationService.evaluate()`: loads answer → question, checks caller is question creator, checks `awarded_points <= max_points`, checks no existing evaluation (UNIQUE constraint backup), updates `user_scores` and `topic_scores` in a `@Transactional` method, updates question status, creates notification.
3. Write `EvaluationController` with `POST /api/evaluations/{answerId}` and `GET /api/evaluations/answer/{answerId}`.
4. Write `ScoreService` for score aggregation queries (used by dashboard and leaderboard).
5. Build `EvaluationPanel` React component shown on `MyQuestionsPage` when answer is submitted: displays answer text, awarded-marks input (max enforced client-side too), feedback textarea, submit button.
6. Display awarded marks and feedback inline on the evaluated question card.
7. After evaluation, update local state to show EVALUATED badge.

### Relevant Context
- `@Transactional` is critical here — score update and evaluation insert must be atomic.
- `user_scores` has one row per user. Use `save()` after fetch-and-increment; or a native UPDATE query with `+= awarded_points`.

---

## Sub-Task 9 — Leaderboard and Progress Tracker

**Status:** [x] done

### Intent
Surface performance data: personal progress dashboard with Recharts graphs, and a connection-scoped leaderboard with weekly/monthly/topic filters.

### Expected Outcomes
- `GET /api/leaderboard?filter=overall|weekly|monthly&topic=` returns ranked list of user + connections.
- `GET /api/progress/summary` returns overall stats.
- `GET /api/progress/topic-scores` returns per-topic breakdown.
- `GET /api/progress/time-series?period=weekly|monthly` returns time-bucketed point data for line chart.
- Progress page shows 4 charts: overall progress line, topic bar, monthly comparison bar, activity counts bar.
- Leaderboard page shows table with rank, avatar, username, total_points, questions answered, avg score. Rank changes display a delta badge.
- Filters (overall, weekly, monthly, topic) update leaderboard results.

### Todo List
1. Write `LeaderboardService`: query accepted connections of logged-in user + self, rank by `total_points` DESC, apply date filter for weekly/monthly using `evaluations.evaluated_at`.
2. Write `ProgressService`: overall summary, topic scores, time-series aggregation grouped by day/week/month.
3. Write `LeaderboardController` and `ProgressController`.
4. Build `LeaderboardPage` React page: filter tabs, ranked table with avatar + color-coded rank change badge.
5. Build `ProgressTrackerPage` with 4 Recharts charts: `<LineChart>` for points over time, `<BarChart>` for topic scores, `<BarChart>` for monthly comparison, `<BarChart>` for activity counts.
6. Build topic-wise progress table (topic, earned, max, percentage with a progress bar).
7. Add loading skeletons for chart areas.

### Relevant Context
- Time-series data: aggregate `evaluations.awarded_points` grouped by `DATE(evaluated_at)` for the answerer.
- Leaderboard ranking only counts evaluated (awarded) points — not unsubmitted or unevaluated.

---

## Sub-Task 10 — Group Learning Module

**Status:** [x] done

### Intent
Allow users to create learning groups, post questions to multiple group members, and enforce the one-answer rule in the group context using the same `answers` table UNIQUE constraint.

### Expected Outcomes
- `POST /api/groups` creates a group, adds creator as ADMIN member.
- `POST /api/groups/{id}/invite` invites connections.
- `GET /api/groups` returns groups the user belongs to.
- `POST /api/groups/{id}/questions` creates a group question; recipients are all group members.
- Answer submission and evaluation work identically to direct questions (same `answers` table, same UNIQUE constraint).
- Group page shows member list, discussion feed of questions, group leaderboard.

### Todo List
1. Create JPA entities: `Group`, `GroupMember`. (Group questions reuse `Question` entity with a nullable `group_id FK`.)
2. Write `GroupService`: `createGroup`, `inviteMembers`, `getGroups`, `getGroupById`, `getGroupMembers`.
3. Write `GroupQuestionService` — wraps `QuestionService.createQuestion` but sets `group_id` and adds all group members as recipients.
4. Write `GroupController`.
5. Build `GroupsPage` React: list of joined groups, "Create Group" button opens a modal form (name, description, topic, visibility, invite picker).
6. Build `GroupDetailPage`: tabs for Feed (question cards), Members (user cards), Leaderboard.
7. Reuse existing `QuestionCard`, `AnswerEditorPage`, and `EvaluationPanel` components in the group feed context.

### Relevant Context
- Group questions are stored in the same `questions` table with `group_id` set. This avoids duplicating evaluation and scoring logic.
- Group leaderboard: same `LeaderboardService` filtered to `group_id` scope.

---

## Sub-Task 11 — Activity Monitoring, Notifications, and Search

**Status:** [x] done

### Intent
Complete the remaining cross-cutting features: activity monitoring during answer sessions, the notification bell with real-time unread count, and global search.

### Expected Outcomes
- Activity monitor captures tab visibility changes, window blur, copy/paste within the answer editor, and time elapsed; POSTs a batch to `POST /api/activity-logs/{answerId}` on answer submission.
- Activity summary visible to question creator on evaluation panel.
- Notification bell shows unread count; clicking opens a dropdown list; "Mark all read" button.
- `GET /api/notifications` returns notifications for logged-in user.
- `PUT /api/notifications/read-all` marks all read.
- Search bar in navbar queries `GET /api/search?q=&type=users|questions|groups` and displays categorized results.

### Todo List
1. Write `ActivityLogController` with `POST /api/activity-logs/{answerId}` (bulk insert) and `GET /api/activity-logs/answer/{answerId}` (for evaluator).
2. Write `NotificationController` with `GET /api/notifications`, `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`.
3. Write `SearchController` with `GET /api/search?q=&type=` — delegates to user search, question search, group search services.
4. Build `ActivityMonitor` React hook (`useActivityMonitor`) — uses Page Visibility API and `document` events. Returns event log. Display a non-intrusive info banner: "Activity is being recorded for transparency purposes."
5. Plug `useActivityMonitor` into `AnswerEditorPage`; on submit, POST the event log.
6. Add `ActivitySummary` display in `EvaluationPanel`.
7. Build `NotificationDropdown` component in `Navbar`; poll `GET /api/notifications?unread=true` every 30 seconds for unread count.
8. Build `SearchResultsPage` showing tabbed results (Users, Questions, Groups).
9. Wire search input in `Navbar` to navigate to `/search?q=...`.

### Relevant Context
- Page Visibility API: `document.addEventListener('visibilitychange', ...)`.
- Activity report must be neutral — label events as "activity indicators", not evidence of cheating.
- Polling every 30 seconds is sufficient for local dev; WebSocket upgrade is future work.

---

## Sub-Task 12 — Settings Page, Sample Data, Testing, and README

**Status:** [x] done

### Intent
Finalize the application: settings page (change password, notification preferences), complete the seed data to demonstrate a full multi-user workflow, validate all features end-to-end, and write the README.

### Expected Outcomes
- Settings page lets users change password and toggle notification preferences.
- `database/seed.sql` contains 5 users with accepted connections, 6 questions (mix of statuses), 3 answers, 2 evaluations, group with 3 members and 1 group question, and 10 notifications.
- README covers: prerequisites, MySQL setup, backend setup, frontend setup, running the app, and sample login credentials.
- All major flows manually verified: register → connect → ask → answer → evaluate → see score/leaderboard/progress.

### Todo List
1. Write `SettingsController` with `PUT /api/users/me/password` (validates old password, hashes new).
2. Build `SettingsPage` React: change-password form, avatar re-select, notification preferences (future stub).
3. Expand `database/seed.sql` with complete multi-user demo workflow data as described above.
4. Verify: BCrypt hashed passwords in seed match documented test credentials.
5. Cross-check all API endpoints against the frontend `apiClient` calls — fix any URL mismatches.
6. Test the one-answer UNIQUE constraint by attempting a second POST to `/api/answers/{questionId}`.
7. Test score integrity: verify `user_scores.total_points` equals sum of all `evaluations.awarded_points` for that user.
8. Write full `README.md`: prerequisites (Java 17, Node 18, MySQL 8), step-by-step setup, sample credentials table, screenshots placeholder.
9. Final responsive design pass: verify sidebar collapses to hamburger on mobile, cards stack vertically on small screens.
10. Review and tighten Spring Security authorization rules: no endpoint leaks unauthenticated data.

### Relevant Context
- Sample credentials to document (BCrypt hashes for seed): `alice/Password1!`, `bob/Password1!`, `carol/Password1!`.
- README should be written for a developer who has MySQL and Java/Node already installed.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Browser  (React 18 + Vite, port 5173)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │Auth Pages│  │Dashboard │  │Question  │  │Progress /    │ │
│  │Register  │  │Home      │  │Ask/Answer│  │Leaderboard   │ │
│  │Login     │  │Profile   │  │Evaluate  │  │Groups        │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│         │              │              │              │        │
│         └──────────────┴──────────────┴──────────────┘       │
│                         axios + JWT                          │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP REST
┌─────────────────────────────────────────────────────────────┐
│  Spring Boot 3  (port 8080)                                  │
│  SecurityFilterChain → JwtFilter → Controllers              │
│  AuthController  QuestionController  EvaluationController   │
│  ConnectionController  GroupController  ProgressController   │
│  LeaderboardController  NotificationController  SearchCtrl  │
│                │                                             │
│         Spring Data JPA                                      │
└─────────────────────────────────────────────────────────────┘
                              │ JDBC
┌─────────────────────────────────────────────────────────────┐
│  MySQL 8.0  (port 3306, database: skillconnect)              │
│  users · avatars · connections · questions · answers         │
│  evaluations · user_scores · topic_scores · groups           │
│  group_members · notifications · activity_logs               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| One-answer guard | UNIQUE on `answers.question_id` | DB constraint is race-condition proof |
| Double-evaluation guard | UNIQUE on `evaluations.answer_id` | Prevents duplicate points even on retry |
| Score update | `@Transactional` in `EvaluationService` | Atomic: evaluation row + score increment |
| Auth | JWT stateless, HS256 | Stateless, easy local dev |
| Password reset | DB token + Mailtrap email | Simple, no Redis needed |
| Notifications | Polling every 30s | Simple; WebSocket upgrade is future work |
| File upload | Skipped; predefined avatar set | Reduces Phase 1 complexity |
| Styling | Bootstrap 5 | Faster prototyping than Tailwind |
| Charts | Recharts | React-native, no D3 knowledge needed |
