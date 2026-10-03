-- ============================================================
-- SkillConnect – MySQL 8.0 Database Schema
-- Run: mysqlsh --sql -u root -pPASSWORD -h 127.0.0.1 -P 3306 --file="database/schema.sql"
-- ============================================================

CREATE DATABASE IF NOT EXISTS skillconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skillconnect;

SET FOREIGN_KEY_CHECKS = 0;

-- ─── avatars ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avatars (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(80)  NOT NULL,
  file_path  VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                   BIGINT        NOT NULL AUTO_INCREMENT,
  username             VARCHAR(50)   NOT NULL,
  email                VARCHAR(120)  NOT NULL,
  password_hash        VARCHAR(255)  NOT NULL,
  full_name            VARCHAR(120)  NOT NULL,
  bio                  TEXT,
  college              VARCHAR(200),
  avatar_id            BIGINT,
  is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
  reset_token          VARCHAR(255),
  reset_token_expiry   DATETIME,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username),
  UNIQUE KEY uk_users_email (email),
  CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_id) REFERENCES avatars (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── user_profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id    BIGINT       NOT NULL,
  skills     TEXT,
  interests  TEXT,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── user_scores ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_scores (
  user_id         BIGINT   NOT NULL,
  total_points    INT      NOT NULL DEFAULT 0,
  total_answers   INT      NOT NULL DEFAULT 0,
  total_evaluated INT      NOT NULL DEFAULT 0,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_scores_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── topics ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topics (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  name       VARCHAR(80) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_topics_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── topic_scores ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topic_scores (
  id             BIGINT NOT NULL AUTO_INCREMENT,
  user_id        BIGINT NOT NULL,
  topic_id       BIGINT NOT NULL,
  earned_points  INT    NOT NULL DEFAULT 0,
  max_points     INT    NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_topic_scores (user_id, topic_id),
  CONSTRAINT fk_ts_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
  CONSTRAINT fk_ts_topic FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── connections ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
  id           BIGINT      NOT NULL AUTO_INCREMENT,
  requester_id BIGINT      NOT NULL,
  addressee_id BIGINT      NOT NULL,
  status       ENUM('PENDING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_connections (requester_id, addressee_id),
  CONSTRAINT fk_conn_requester FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_conn_addressee FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_no_self_connect CHECK (requester_id <> addressee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_connections_addressee ON connections (addressee_id);
CREATE INDEX idx_connections_status    ON connections (status);

-- ─── questions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  creator_id  BIGINT       NOT NULL,
  topic_id    BIGINT       NOT NULL,
  group_id    BIGINT,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  difficulty  ENUM('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
  max_points  INT          NOT NULL,
  status      ENUM('PENDING','ANSWERED','EVALUATED','CLOSED') NOT NULL DEFAULT 'PENDING',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_q_creator FOREIGN KEY (creator_id) REFERENCES users  (id) ON DELETE RESTRICT,
  CONSTRAINT fk_q_topic   FOREIGN KEY (topic_id)   REFERENCES topics (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_q_creator ON questions (creator_id);
CREATE INDEX idx_q_topic   ON questions (topic_id);
CREATE INDEX idx_q_status  ON questions (status);
CREATE INDEX idx_q_group   ON questions (group_id);

-- ─── question_recipients ────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_recipients (
  question_id BIGINT NOT NULL,
  user_id     BIGINT NOT NULL,
  PRIMARY KEY (question_id, user_id),
  CONSTRAINT fk_qr_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
  CONSTRAINT fk_qr_user     FOREIGN KEY (user_id)     REFERENCES users     (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── answers ────────────────────────────────────────────────
-- UNIQUE on question_id enforces one-answer-per-question at DB level
CREATE TABLE IF NOT EXISTS answers (
  id           BIGINT   NOT NULL AUTO_INCREMENT,
  question_id  BIGINT   NOT NULL,
  answerer_id  BIGINT   NOT NULL,
  content      TEXT     NOT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_answers_question (question_id),
  CONSTRAINT fk_ans_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
  CONSTRAINT fk_ans_answerer FOREIGN KEY (answerer_id) REFERENCES users     (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ans_answerer ON answers (answerer_id);

-- ─── evaluations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evaluations (
  id              BIGINT   NOT NULL AUTO_INCREMENT,
  answer_id       BIGINT   NOT NULL,
  evaluator_id    BIGINT   NOT NULL,
  awarded_points  INT      NOT NULL,
  feedback        TEXT,
  evaluated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_eval_answer (answer_id),
  CONSTRAINT fk_eval_answer    FOREIGN KEY (answer_id)    REFERENCES answers (id) ON DELETE CASCADE,
  CONSTRAINT fk_eval_evaluator FOREIGN KEY (evaluator_id) REFERENCES users   (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_eval_evaluator    ON evaluations (evaluator_id);
CREATE INDEX idx_eval_evaluated_at ON evaluations (evaluated_at);

-- ─── groups ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `groups` (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  topic_id    BIGINT,
  avatar      VARCHAR(255),
  visibility  ENUM('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PUBLIC',
  creator_id  BIGINT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_grp_creator FOREIGN KEY (creator_id) REFERENCES users  (id) ON DELETE RESTRICT,
  CONSTRAINT fk_grp_topic   FOREIGN KEY (topic_id)   REFERENCES topics (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── group_members ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
  group_id  BIGINT NOT NULL,
  user_id   BIGINT NOT NULL,
  role      ENUM('ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id),
  CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES `groups` (id) ON DELETE CASCADE,
  CONSTRAINT fk_gm_user  FOREIGN KEY (user_id)  REFERENCES users    (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  recipient_id    BIGINT       NOT NULL,
  type            VARCHAR(60)  NOT NULL,
  message         TEXT         NOT NULL,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  reference_id    BIGINT,
  reference_type  VARCHAR(60),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_notif_recipient ON notifications (recipient_id, is_read);

-- ─── activity_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  answer_id        BIGINT       NOT NULL,
  user_id          BIGINT       NOT NULL,
  event_type       VARCHAR(60)  NOT NULL,
  event_timestamp  DATETIME     NOT NULL,
  metadata         JSON,
  PRIMARY KEY (id),
  CONSTRAINT fk_al_answer FOREIGN KEY (answer_id) REFERENCES answers (id) ON DELETE CASCADE,
  CONSTRAINT fk_al_user   FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_al_answer ON activity_logs (answer_id);

-- ─── user_activities ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activities (
  id             BIGINT      NOT NULL AUTO_INCREMENT,
  user_id        BIGINT      NOT NULL,
  activity_type  VARCHAR(80) NOT NULL,
  reference_id   BIGINT,
  reference_type VARCHAR(60),
  created_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ua_user ON user_activities (user_id, created_at);

-- ── Announcements ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id           BIGINT NOT NULL AUTO_INCREMENT,
  sender_id    BIGINT NOT NULL,
  recipient_id BIGINT NULL,
  message      TEXT   NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ann_sender    FOREIGN KEY (sender_id)    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ann_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ann_sender    ON announcements (sender_id);
CREATE INDEX idx_ann_recipient ON announcements (recipient_id);

SET FOREIGN_KEY_CHECKS = 1;
