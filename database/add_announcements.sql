-- Run this once to add the announcements table
USE skillconnect;

CREATE TABLE IF NOT EXISTS announcements (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    sender_id    BIGINT       NOT NULL,
    recipient_id BIGINT       NULL,          -- NULL = broadcast to all connections
    message      TEXT         NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ann_sender    FOREIGN KEY (sender_id)    REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ann_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ann_sender    ON announcements (sender_id);
CREATE INDEX idx_ann_recipient ON announcements (recipient_id);
CREATE INDEX idx_ann_created   ON announcements (created_at DESC);
