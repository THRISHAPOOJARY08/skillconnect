package com.skillconnect.server.service;

import com.skillconnect.server.dto.response.EvaluationResponse;
import com.skillconnect.server.entity.*;
import com.skillconnect.server.entity.Question.QuestionStatus;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evalRepo;
    private final AnswerRepository answerRepo;
    private final QuestionRepository questionRepo;
    private final UserRepository userRepo;
    private final UserScoreRepository scoreRepo;
    private final TopicScoreRepository topicScoreRepo;
    private final NotificationService notificationService;
    private final UserActivityRepository activityRepo;
    private final QuestionService questionService;

    @Transactional
    public EvaluationResponse evaluate(Long answerId, String evaluatorUsername, int awardedPoints, String feedback) {
        User evaluator = userRepo.findByUsername(evaluatorUsername).orElseThrow();
        Answer answer = answerRepo.findById(answerId)
            .orElseThrow(() -> new RuntimeException("Answer not found"));
        Question question = answer.getQuestion();

        // Only question creator can evaluate
        if (!question.getCreator().getId().equals(evaluator.getId()))
            throw new IllegalArgumentException("Only the question creator can evaluate answers");

        // Cannot evaluate own answer (shouldn't happen, but defensive)
        if (question.getCreator().getId().equals(answer.getAnswerer().getId()))
            throw new IllegalArgumentException("Invalid evaluation");

        // Check awarded points <= max points
        if (awardedPoints > question.getMaxPoints())
            throw new IllegalArgumentException("Awarded points cannot exceed " + question.getMaxPoints());
        if (awardedPoints < 0)
            throw new IllegalArgumentException("Awarded points cannot be negative");

        // Prevent double evaluation (UNIQUE in DB is the final guard)
        if (evalRepo.existsByAnswerId(answerId))
            throw new IllegalStateException("This answer has already been evaluated");

        Evaluation eval = new Evaluation();
        eval.setAnswer(answer);
        eval.setEvaluator(evaluator);
        eval.setAwardedPoints(awardedPoints);
        eval.setFeedback(feedback);
        eval = evalRepo.save(eval);

        // Update question status
        question.setStatus(QuestionStatus.EVALUATED);
        questionRepo.save(question);

        // Update user_scores for answerer (ATOMIC)
        User answerer = answer.getAnswerer();
        UserScore score = scoreRepo.findByUserId(answerer.getId()).orElseGet(() -> {
            UserScore s = new UserScore(); s.setUser(answerer); return s;
        });
        score.setTotalPoints(score.getTotalPoints() + awardedPoints);
        score.setTotalEvaluated(score.getTotalEvaluated() + 1);
        scoreRepo.save(score);

        // Update topic_scores
        Topic topic = question.getTopic();
        TopicScore ts = topicScoreRepo.findByUserIdAndTopicId(answerer.getId(), topic.getId())
            .orElseGet(() -> {
                TopicScore t = new TopicScore(); t.setUser(answerer); t.setTopic(topic); return t;
            });
        ts.setEarnedPoints(ts.getEarnedPoints() + awardedPoints);
        ts.setMaxPoints(ts.getMaxPoints() + question.getMaxPoints());
        topicScoreRepo.save(ts);

        // Notify answerer
        notificationService.create(answerer, "EVALUATION_RECEIVED",
            "Your answer was evaluated! You earned " + awardedPoints + "/" + question.getMaxPoints() + " points.",
            eval.getId(), "EVALUATION");

        // Log activity
        UserActivity activity = new UserActivity();
        activity.setUser(evaluator);
        activity.setActivityType("EVALUATION_GIVEN");
        activity.setReferenceId(eval.getId());
        activity.setReferenceType("EVALUATION");
        activityRepo.save(activity);

        return questionService.toEvalResponse(eval, question.getMaxPoints());
    }

    public EvaluationResponse getByAnswerId(Long answerId) {
        Evaluation eval = evalRepo.findByAnswerId(answerId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        int maxPoints = eval.getAnswer().getQuestion().getMaxPoints();
        return questionService.toEvalResponse(eval, maxPoints);
    }
}
