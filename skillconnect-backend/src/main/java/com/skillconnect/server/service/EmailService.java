package com.skillconnect.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordReset(String toEmail, String token) {
        String resetLink = baseUrl + "/reset-password?token=" + token;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(toEmail);
        msg.setSubject("SkillConnect – Password Reset");
        msg.setText(
            "Hi,\n\n" +
            "We received a request to reset your SkillConnect password.\n\n" +
            "Click the link below to set a new password:\n\n" +
            resetLink + "\n\n" +
            "This link expires in 1 hour.\n\n" +
            "If you did not request a password reset, please ignore this email.\n\n" +
            "— The SkillConnect Team"
        );
        mailSender.send(msg);
    }
}
