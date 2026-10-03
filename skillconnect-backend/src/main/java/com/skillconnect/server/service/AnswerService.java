package com.skillconnect.server.service;

import com.skillconnect.server.dto.response.AnswerResponse;
import com.skillconnect.server.entity.*;
import com.skillconnect.server.entity.Question.QuestionStatus;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnswerService {

    private final AnswerRepository answerRepo;
    private final QuestionRepository questionRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final UserActivityRepository activityRepo;
    private final UserScoreRepository scoreRepo;
    private final QuestionService questionService;

    @Transactional
    public AnswerResponse submitAnswer(Long questionId, String answererUsername, String content) {
        User answerer = userRepo.findByUsername(answererUsername).orElseThrow();
        Question question = questionRepo.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found"));

        // Cannot answer own question
        if (question.getCreator().getId().equals(answerer.getId()))
            throw new IllegalArgumentException("Cannot answer your own question");

        // Must be a recipient
        boolean isRecipient = question.getRecipients().stream()
            .anyMatch(r -> r.getId().equals(answerer.getId()));
        if (!isRecipient)
            throw new IllegalArgumentException("Not a recipient of this question");

        // Check at service level (DB UNIQUE is the final guard)
        if (answerRepo.existsByQuestionId(questionId))
            throw new IllegalStateException("An answer already exists for this question");

        Answer answer = new Answer();
        answer.setQuestion(question);
        answer.setAnswerer(answerer);
        answer.setContent(content);
        answer = answerRepo.save(answer);

        // Update question status
        question.setStatus(QuestionStatus.ANSWERED);
        questionRepo.save(question);

        // Update user score total_answers
        UserScore score = scoreRepo.findByUserId(answerer.getId()).orElseGet(() -> {
            UserScore s = new UserScore(); s.setUser(answerer); return s;
        });
        score.setTotalAnswers(score.getTotalAnswers() + 1);
        scoreRepo.save(score);

        // Notify question creator
        notificationService.create(question.getCreator(), "ANSWER_SUBMITTED",
            answerer.getUsername() + " answered your question: \"" + question.getTitle() + "\"",
            answer.getId(), "ANSWER");

        // Log activity
        UserActivity activity = new UserActivity();
        activity.setUser(answerer);
        activity.setActivityType("ANSWER_SUBMITTED");
        activity.setReferenceId(answer.getId());
        activity.setReferenceType("ANSWER");
        activityRepo.save(activity);

        return questionService.toAnswerResponse(answer);
    }

    public AnswerResponse getAnswerForQuestion(Long questionId) {
        Answer answer = answerRepo.findByQuestionId(questionId)
            .orElseThrow(() -> new RuntimeException("No answer found"));
        return questionService.toAnswerResponse(answer);
    }
}
