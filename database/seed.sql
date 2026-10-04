-- ============================================================
-- SkillConnect – Seed Data (avatars + topics only, no sample users)
-- Run AFTER schema.sql
-- ============================================================

USE skillconnect;

SET FOREIGN_KEY_CHECKS = 0;

-- ─── Avatars ─────────────────────────────────────────────────
INSERT IGNORE INTO avatars (id, name, file_path) VALUES
(1,  'Blue Scholar',    '/avatars/avatar1.svg'),
(2,  'Green Thinker',   '/avatars/avatar2.svg'),
(3,  'Purple Coder',    '/avatars/avatar3.svg'),
(4,  'Orange Builder',  '/avatars/avatar4.svg'),
(5,  'Red Explorer',    '/avatars/avatar5.svg'),
(6,  'Teal Hacker',     '/avatars/avatar6.svg'),
(7,  'Yellow Maker',    '/avatars/avatar7.svg'),
(8,  'Indigo Scientist','/avatars/avatar8.svg'),
(9,  'Pink Designer',   '/avatars/avatar9.svg'),
(10, 'Grey Analyst',    '/avatars/avatar10.svg'),
(11, 'Female',          '/avatars/female.jpg'),
(12, 'Male',            '/avatars/male.jpg');

-- ─── Topics ──────────────────────────────────────────────────
INSERT IGNORE INTO topics (id, name) VALUES
(1, 'Java'),
(2, 'Data Structures & Algorithms'),
(3, 'Database Management'),
(4, 'Operating Systems'),
(5, 'Web Development'),
(6, 'Machine Learning'),
(7, 'Computer Networks'),
(8, 'System Design'),
(9, 'Python'),
(10,'Cybersecurity');

SET FOREIGN_KEY_CHECKS = 1;
