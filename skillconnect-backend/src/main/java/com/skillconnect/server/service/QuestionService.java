package com.skillconnect.server.service;

import com.skillconnect.server.dto.request.CreateQuestionRequest;
import com.skillconnect.server.dto.response.*;
import com.skillconnect.server.entity.*;
import com.skillconnect.server.entity.Question.*;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepo;
    private final UserRepository userRepo;
    private final TopicRepository topicRepo;
    private final AnswerRepository answerRepo;
    private final EvaluationRepository evalRepo;
    private final ConnectionService connectionService;
    private final NotificationService notificationService;
    private final UserActivityRepository activityRepo;

    @Transactional
    public QuestionResponse createQuestion(String creatorUsername, CreateQuestionRequest req) {
        User creator = userRepo.findByUsername(creatorUsername).orElseThrow();
        Topic topic = topicRepo.findById(req.getTopicId())
            .orElseThrow(() -> new RuntimeException("Topic not found"));

        Question question = new Question();
        question.setCreator(creator);
        question.setTopic(topic);
        question.setTitle(req.getTitle());
        question.setDescription(req.getDescription());
        question.setDifficulty(Difficulty.valueOf(req.getDifficulty().toUpperCase()));
        question.setMaxPoints(req.getMaxPoints());
        question.setGroupId(req.getGroupId());

        // Validate and add recipients
        Set<User> recipients = new HashSet<>();
        for (Long rid : req.getRecipientIds()) {
            if (rid.equals(creator.getId())) continue; // skip self
            // For non-group questions, check connection
            if (req.getGroupId() == null && !connectionService.areConnected(creator.getId(), rid)) {
                throw new IllegalArgumentException("User " + rid + " is not a connection");
            }
            userRepo.findById(rid).ifPresent(recipients::add);
        }
        question.setRecipients(recipients);
        question = questionRepo.save(question);

        // Notify each recipient
        for (User recipient : recipients) {
            notificationService.create(recipient, "NEW_QUESTION",
                creator.getUsername() + " asked you a question: \"" + req.getTitle() + "\"",
                question.getId(), "QUESTION");
        }

        // Log activity
        UserActivity activity = new UserActivity();
        activity.setUser(creator);
        activity.setActivityType("QUESTION_ASKED");
        activity.setReferenceId(question.getId());
        activity.setReferenceType("QUESTION");
        activityRepo.save(activity);

        return toResponse(question);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<QuestionResponse> getSentQuestions(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return questionRepo.findByCreatorIdFetch(user.getId()).stream()
            .map(this::toResponse).toList();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<QuestionResponse> getReceivedQuestions(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return questionRepo.findByRecipientIdFetch(user.getId()).stream()
            .map(this::toResponse).toList();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public QuestionResponse getById(Long id, String username) {
        Question q = questionRepo.findByIdFetch(id).orElseThrow(() -> new RuntimeException("Question not found"));
        User user = userRepo.findByUsername(username).orElseThrow();
        boolean isCreator = q.getCreator().getId().equals(user.getId());
        boolean isRecipient = q.getRecipients().stream().anyMatch(r -> r.getId().equals(user.getId()));
        if (!isCreator && !isRecipient)
            throw new IllegalArgumentException("Not authorized to view this question");
        return toResponse(q);
    }

    public QuestionResponse toResponse(Question q) {
        QuestionResponse r = new QuestionResponse();
        r.setId(q.getId());
        r.setCreatorId(q.getCreator().getId());
        r.setCreatorUsername(q.getCreator().getUsername());
        r.setCreatorFullName(q.getCreator().getFullName());
        if (q.getCreator().getAvatar() != null)
            r.setCreatorAvatarPath(q.getCreator().getAvatar().getFilePath());
        r.setTopicId(q.getTopic().getId());
        r.setTopicName(q.getTopic().getName());
        r.setTitle(q.getTitle());
        r.setDescription(q.getDescription());
        r.setDifficulty(q.getDifficulty().name());
        r.setMaxPoints(q.getMaxPoints());
        r.setStatus(q.getStatus().name());
        r.setCreatedAt(q.getCreatedAt());
        r.setGroupId(q.getGroupId());
        r.setRecipientUsernames(q.getRecipients().stream().map(User::getUsername).toList());

        answerRepo.findByQuestionId(q.getId()).ifPresent(a -> {
            AnswerResponse ar = toAnswerResponse(a);
            evalRepo.findByAnswerId(a.getId()).ifPresent(e -> ar.setEvaluation(toEvalResponse(e, q.getMaxPoints())));
            r.setAnswer(ar);
        });

        return r;
    }

    public AnswerResponse toAnswerResponse(Answer a) {
        AnswerResponse r = new AnswerResponse();
        r.setId(a.getId());
        r.setQuestionId(a.getQuestion().getId());
        r.setAnswererId(a.getAnswerer().getId());
        r.setAnswererUsername(a.getAnswerer().getUsername());
        r.setAnswererFullName(a.getAnswerer().getFullName());
        if (a.getAnswerer().getAvatar() != null)
            r.setAnswererAvatarPath(a.getAnswerer().getAvatar().getFilePath());
        r.setContent(a.getContent());
        r.setSubmittedAt(a.getSubmittedAt());
        return r;
    }

    public QuestionRepository getQuestionRepo() { return questionRepo; }

    public EvaluationResponse toEvalResponse(Evaluation e, int maxPoints) {
        EvaluationResponse r = new EvaluationResponse();
        r.setId(e.getId());
        r.setAnswerId(e.getAnswer().getId());
        r.setEvaluatorId(e.getEvaluator().getId());
        r.setEvaluatorUsername(e.getEvaluator().getUsername());
        r.setAwardedPoints(e.getAwardedPoints());
        r.setMaxPoints(maxPoints);
        r.setFeedback(e.getFeedback());
        r.setEvaluatedAt(e.getEvaluatedAt());
        return r;
    }
}
