-- Add female and male photo avatars to the avatars table
-- Run once: mysqlsh --sql -u root -pTHRISHA --file D:\Quiz\database\add_photo_avatars.sql
USE skillconnect;

INSERT IGNORE INTO avatars (id, name, file_path) VALUES
(11, 'Female', '/avatars/female.jpg'),
(12, 'Male',   '/avatars/male.jpg');
