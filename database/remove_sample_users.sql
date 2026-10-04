-- Run this on Railway to remove all sample users and their data
-- mysqlsh --sql -u root -pPASSWORD -h maglev.proxy.rlwy.net -P 11344 --file D:\Quiz\database\remove_sample_users.sql

USE skillconnect;

SET FOREIGN_KEY_CHECKS = 0;

-- Remove all sample user data (cascade via FK or manual)
DELETE FROM user_activities   WHERE user_id IN (1,2,3,4,5);
DELETE FROM topic_scores      WHERE user_id IN (1,2,3,4,5);
DELETE FROM evaluations       WHERE evaluator_id IN (1,2,3,4,5);
DELETE FROM answers           WHERE answerer_id IN (1,2,3,4,5);
DELETE FROM question_recipients WHERE user_id IN (1,2,3,4,5);
DELETE FROM questions         WHERE creator_id IN (1,2,3,4,5);
DELETE FROM notifications     WHERE recipient_id IN (1,2,3,4,5);
DELETE FROM group_members     WHERE user_id IN (1,2,3,4,5);
DELETE FROM `groups`          WHERE creator_id IN (1,2,3,4,5);
DELETE FROM connections       WHERE requester_id IN (1,2,3,4,5) OR addressee_id IN (1,2,3,4,5);
DELETE FROM user_scores       WHERE user_id IN (1,2,3,4,5);
DELETE FROM user_profiles     WHERE user_id IN (1,2,3,4,5);
DELETE FROM users             WHERE id IN (1,2,3,4,5);

-- Make sure photo avatars exist
INSERT IGNORE INTO avatars (id, name, file_path) VALUES
(11, 'Female', '/avatars/female.jpg'),
(12, 'Male',   '/avatars/male.jpg');

-- Make sure all topics exist
INSERT IGNORE INTO topics (id, name) VALUES
(9,  'Python'),
(10, 'Cybersecurity');

SET FOREIGN_KEY_CHECKS = 1;
