-- ============================================================
-- SkillConnect – Seed Data
-- Passwords are BCrypt-hashed from "Password1!"
-- Run AFTER schema.sql:
--   mysqlsh --sql -u root -pPASSWORD -h 127.0.0.1 -P 3306 --file="database/seed.sql"
-- ============================================================

USE skillconnect;

SET FOREIGN_KEY_CHECKS = 0;

-- ─── Avatars ─────────────────────────────────────────────────
INSERT IGNORE INTO avatars (id, name, file_path) VALUES
(1,  'Blue Scholar',   '/avatars/avatar1.svg'),
(2,  'Green Thinker',  '/avatars/avatar2.png'),
(3,  'Purple Coder',   '/avatars/avatar3.png'),
(4,  'Orange Builder', '/avatars/avatar4.png'),
(5,  'Red Explorer',   '/avatars/avatar5.png'),
(6,  'Teal Hacker',    '/avatars/avatar6.png'),
(7,  'Yellow Maker',   '/avatars/avatar7.png'),
(8,  'Indigo Scientist','/avatars/avatar8.png'),
(9,  'Pink Designer',  '/avatars/avatar9.png'),
(10, 'Grey Analyst',   '/avatars/avatar10.png');

-- ─── Topics ──────────────────────────────────────────────────
INSERT IGNORE INTO topics (id, name) VALUES
(1, 'Java'),
(2, 'Data Structures & Algorithms'),
(3, 'Database Management'),
(4, 'Operating Systems'),
(5, 'Web Development'),
(6, 'Machine Learning'),
(7, 'Computer Networks'),
(8, 'System Design');

-- ─── Users (BCrypt hash of "Password1!") ─────────────────────
INSERT IGNORE INTO users (id, username, email, password_hash, full_name, bio, college, avatar_id) VALUES
(1, 'alice',  'alice@example.com',  '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PbpMtSASQ4CMi', 'Alice Johnson',   'CS student passionate about algorithms and competitive programming.', 'MIT',    1),
(2, 'bob',    'bob@example.com',    '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PbpMtSASQ4CMi', 'Bob Smith',       'Backend developer. Loves Spring Boot and distributed systems.',      'Stanford',2),
(3, 'carol',  'carol@example.com',  '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PbpMtSASQ4CMi', 'Carol Williams',  'Frontend wizard. React and CSS enthusiast.',                         'CMU',    3),
(4, 'david',  'david@example.com',  '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PbpMtSASQ4CMi', 'David Lee',       'Interested in machine learning and data science.',                    'Berkeley',4),
(5, 'eve',    'eve@example.com',    '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PbpMtSASQ4CMi', 'Eve Martinez',    'Systems programmer. OS and networking deep-diver.',                  'Georgia Tech',5);

-- ─── User Profiles ───────────────────────────────────────────
INSERT IGNORE INTO user_profiles (user_id, skills, interests) VALUES
(1, 'Java,Python,DSA,Competitive Programming',      'Algorithms,Open Source,Robotics'),
(2, 'Java,Spring Boot,MySQL,System Design',         'Backend,DevOps,Cloud'),
(3, 'React,JavaScript,CSS,HTML,Bootstrap',          'UI/UX,Web Design,Animation'),
(4, 'Python,Machine Learning,TensorFlow,Pandas',    'AI,Data Science,Research'),
(5, 'C,C++,Linux,Networking,OS Internals',          'Low Level Programming,Security,CTF');

-- ─── User Scores (initial zeros) ─────────────────────────────
INSERT IGNORE INTO user_scores (user_id, total_points, total_answers, total_evaluated) VALUES
(1, 0, 0, 0),
(2, 0, 0, 0),
(3, 0, 0, 0),
(4, 0, 0, 0),
(5, 0, 0, 0);

-- ─── Connections ─────────────────────────────────────────────
-- alice <-> bob  (ACCEPTED)
INSERT IGNORE INTO connections (id, requester_id, addressee_id, status) VALUES
(1, 1, 2, 'ACCEPTED'),
(2, 1, 3, 'ACCEPTED'),
(3, 2, 4, 'ACCEPTED'),
(4, 3, 5, 'ACCEPTED'),
(5, 1, 4, 'PENDING'),
(6, 5, 2, 'PENDING');

-- ─── Questions ───────────────────────────────────────────────
INSERT IGNORE INTO questions (id, creator_id, topic_id, title, description, difficulty, max_points, status) VALUES
(1, 1, 1, 'Explain Java Memory Model',
   'Can you explain the Java Memory Model (JMM) and how it affects multi-threaded programming? Include happens-before relationships.',
   'HARD', 20, 'EVALUATED'),

(2, 2, 2, 'What is the time complexity of QuickSort?',
   'Explain the best, average, and worst-case time complexity of QuickSort. When would you prefer MergeSort over QuickSort?',
   'MEDIUM', 15, 'ANSWERED'),

(3, 1, 3, 'Difference between INNER JOIN and LEFT JOIN',
   'Explain the difference between INNER JOIN and LEFT JOIN in SQL with examples.',
   'EASY', 10, 'PENDING'),

(4, 3, 5, 'React useEffect Cleanup',
   'Why is cleanup important in React useEffect? Give an example where missing cleanup causes a memory leak.',
   'MEDIUM', 18, 'PENDING'),

(5, 2, 8, 'Design a URL Shortener',
   'How would you design a URL shortening service like bit.ly? Discuss the database schema, algorithm for generating short codes, and scalability considerations.',
   'HARD', 25, 'EVALUATED');

-- ─── Question Recipients ─────────────────────────────────────
INSERT IGNORE INTO question_recipients (question_id, user_id) VALUES
(1, 2),   -- alice asked bob
(2, 1),   -- bob asked alice
(3, 2),   -- alice asked bob
(3, 3),   -- alice also asked carol
(4, 1),   -- carol asked alice
(5, 1),   -- bob asked alice
(5, 3);   -- bob also asked carol

-- ─── Answers ─────────────────────────────────────────────────
INSERT IGNORE INTO answers (id, question_id, answerer_id, content, submitted_at) VALUES
(1, 1, 2,
 'The Java Memory Model defines how threads interact through memory. The key concept is the happens-before relationship: if action A happens-before action B, then A''s effects are visible to B. This is guaranteed by synchronized blocks, volatile variables, thread start/join, and java.util.concurrent locks. For example, writing to a volatile variable happens-before any subsequent read of that variable by another thread. Without JMM guarantees, the JIT compiler and CPU can reorder instructions for optimization, leading to visibility bugs.',
 DATE_SUB(NOW(), INTERVAL 2 DAY)),

(2, 2, 1,
 'QuickSort time complexities: Best case O(n log n) - pivot always divides array evenly. Average case O(n log n) - random pivot. Worst case O(n²) - sorted array with last element as pivot. MergeSort is preferred when: 1) Stability is required (MergeSort is stable), 2) Worst-case guarantee needed (O(n log n) always), 3) Sorting linked lists (MergeSort works without random access). QuickSort is preferred for in-place sorting of arrays due to better cache performance.',
 DATE_SUB(NOW(), INTERVAL 1 DAY)),

(3, 5, 1,
 'A URL shortener design: 1) Database: table with (short_code VARCHAR(8) PK, original_url TEXT, created_at, user_id, click_count). 2) Short code generation: Base62 encoding of an auto-increment ID (62^7 = 3.5 trillion codes). Alternatively use MD5 hash and take first 7 chars, checking for collisions. 3) Scalability: Use a distributed counter (Redis INCR), add a CDN for redirect caching, read replicas for the DB. The redirect endpoint must be fast - cache hot URLs in Redis with TTL. For analytics, write click events asynchronously to a message queue.',
 DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- ─── Evaluations ─────────────────────────────────────────────
INSERT IGNORE INTO evaluations (id, answer_id, evaluator_id, awarded_points, feedback, evaluated_at) VALUES
(1, 1, 1, 18, 'Excellent explanation of JMM! Great coverage of happens-before. Could also mention final field semantics.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 3, 2, 22, 'Very thorough design! Good mention of Base62 encoding and Redis caching. Excellent answer.', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- ─── Update user scores after seed evaluations ───────────────
UPDATE user_scores SET total_points = 18, total_answers = 2, total_evaluated = 1 WHERE user_id = 2;  -- bob answered Q1 (18pts) + Q2 (pending)
UPDATE user_scores SET total_points = 22, total_answers = 2, total_evaluated = 1 WHERE user_id = 1;  -- alice answered Q2 + Q5 (22pts evaluated)

-- ─── Topic scores ────────────────────────────────────────────
INSERT IGNORE INTO topic_scores (user_id, topic_id, earned_points, max_points) VALUES
(2, 1, 18, 20),   -- bob: Java topic (Q1 evaluated 18/20)
(1, 8, 22, 25);   -- alice: System Design (Q5 evaluated 22/25)

-- ─── Groups ──────────────────────────────────────────────────
INSERT IGNORE INTO `groups` (id, name, description, topic_id, visibility, creator_id) VALUES
(1, 'Java Enthusiasts', 'A group for Java learners and professionals to share knowledge.', 1, 'PUBLIC', 1),
(2, 'DSA Prep', 'Competitive programming and DSA interview preparation.', 2, 'PUBLIC', 2);

-- ─── Group Members ───────────────────────────────────────────
INSERT IGNORE INTO group_members (group_id, user_id, role) VALUES
(1, 1, 'ADMIN'),
(1, 2, 'MEMBER'),
(1, 3, 'MEMBER'),
(2, 2, 'ADMIN'),
(2, 1, 'MEMBER'),
(2, 4, 'MEMBER');

-- ─── Notifications ───────────────────────────────────────────
INSERT IGNORE INTO notifications (id, recipient_id, type, message, is_read, reference_id, reference_type) VALUES
(1, 2, 'CONNECTION_REQUEST',  'alice sent you a connection request.',              FALSE, 1, 'CONNECTION'),
(2, 1, 'CONNECTION_ACCEPTED', 'bob accepted your connection request.',             TRUE,  1, 'CONNECTION'),
(3, 2, 'NEW_QUESTION',        'alice asked you a new question: "Explain Java Memory Model"', FALSE, 1, 'QUESTION'),
(4, 1, 'ANSWER_SUBMITTED',    'bob answered your question: "Explain Java Memory Model"',     FALSE, 1, 'ANSWER'),
(5, 2, 'EVALUATION_RECEIVED', 'Your answer was evaluated! You earned 18/20 points.',         FALSE, 1, 'EVALUATION'),
(6, 1, 'CONNECTION_REQUEST',  'carol sent you a connection request.',              FALSE, 2, 'CONNECTION'),
(7, 1, 'NEW_QUESTION',        'bob asked you a question: "What is the time complexity of QuickSort?"', FALSE, 2, 'QUESTION'),
(8, 2, 'NEW_QUESTION',        'bob asked you a question: "Design a URL Shortener"', FALSE, 5, 'QUESTION');

-- ─── User Activities ─────────────────────────────────────────
INSERT IGNORE INTO user_activities (user_id, activity_type, reference_id, reference_type) VALUES
(1, 'QUESTION_ASKED',      1, 'QUESTION'),
(2, 'ANSWER_SUBMITTED',    1, 'ANSWER'),
(1, 'EVALUATION_GIVEN',    1, 'EVALUATION'),
(2, 'QUESTION_ASKED',      2, 'QUESTION'),
(1, 'ANSWER_SUBMITTED',    2, 'ANSWER'),
(1, 'QUESTION_ASKED',      3, 'QUESTION'),
(2, 'QUESTION_ASKED',      5, 'QUESTION'),
(1, 'ANSWER_SUBMITTED',    3, 'ANSWER'),
(2, 'EVALUATION_GIVEN',    2, 'EVALUATION'),
(1, 'GROUP_CREATED',       1, 'GROUP'),
(2, 'GROUP_CREATED',       2, 'GROUP');

SET FOREIGN_KEY_CHECKS = 1;
