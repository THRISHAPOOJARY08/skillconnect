USE skillconnect;

-- Update avatar paths to use SVG files
UPDATE avatars SET file_path = REPLACE(file_path, '.png', '.svg');

SELECT id, name, file_path FROM avatars;
