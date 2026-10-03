package com.skillconnect.server.service;

import com.skillconnect.server.dto.response.UserResponse;
import com.skillconnect.server.entity.*;
import com.skillconnect.server.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final QuestionRepository questionRepo;
    private final AnswerRepository answerRepo;
    private final EvaluationRepository evalRepo;
    private final UserScoreRepository scoreRepo;
    private final ConnectionRepository connectionRepo;
    private final UserActivityRepository activityRepo;
    private final UserRepository userRepo;
    private final UserMapper userMapper;

    public Map<String,Object> getSummary(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Long uid = user.getId();

        long questionsAsked   = questionRepo.countByCreatorId(uid);
        long answersSubmitted = answerRepo.findByAnswererId(uid).size();
        long evaluated        = evalRepo.countByAnswerer(uid);
        int totalPoints       = scoreRepo.findByUserId(uid).map(UserScore::getTotalPoints).orElse(0);
        long connections      = connectionRepo.findAcceptedConnectionIds(uid).size();

        // Connection rank
        List<Long> peerIds = connectionRepo.findAcceptedConnectionIds(uid);
        peerIds.add(uid);
        List<int[]> scores = peerIds.stream()
            .map(id -> scoreRepo.findByUserId(id).map(UserScore::getTotalPoints).orElse(0))
            .map(pts -> new int[]{pts})
            .collect(Collectors.toList());
        int myPts = totalPoints;
        long rank = scores.stream().filter(s -> s[0] > myPts).count() + 1;

        List<UserActivity> activities = activityRepo.findTop20ByUserIdOrderByCreatedAtDesc(uid);

        return Map.of(
            "questionsAsked",   questionsAsked,
            "answersSubmitted", answersSubmitted,
            "answersEvaluated", evaluated,
            "totalPoints",      totalPoints,
            "connectionRank",   rank,
            "connectionCount",  connections,
            "recentActivities", activities.stream().map(a -> Map.of(
                "type",      a.getActivityType(),
                "refId",     a.getReferenceId() != null ? a.getReferenceId() : 0,
                "refType",   a.getReferenceType() != null ? a.getReferenceType() : "",
                "createdAt", a.getCreatedAt().toString()
            )).toList()
        );
    }
}
