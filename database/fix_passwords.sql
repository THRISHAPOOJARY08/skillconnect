USE skillconnect;

-- Update all seed users to use password: "password"
-- This is BCrypt hash of "password" at cost 10, verified by Spring BCryptPasswordEncoder
UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PbpMtSASQ4CMi'
WHERE username IN ('alice','bob','carol','david','eve');

SELECT username, LENGTH(password_hash) AS len FROM users WHERE username IN ('alice','bob','carol','david','eve');
