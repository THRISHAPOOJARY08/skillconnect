package com.skillconnect.server.service;

import com.skillconnect.server.entity.*;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final EvaluationRepository evalRepo;
    private final AnswerRepository answerRepo;
    private final QuestionRepository questionRepo;
    private final TopicScoreRepository topicScoreRepo;
    private final UserRepository userRepo;

    public Map<String,Object> getSummary(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Long uid = user.getId();

        int totalEarned    = evalRepo.sumPointsByAnswerer(uid);
        long answers       = answerRepo.findByAnswererId(uid).size();
        long evaluated     = evalRepo.countByAnswerer(uid);
        double avg         = evaluated > 0 ? (double) totalEarned / evaluated : 0;

        return Map.of(
            "totalPointsEarned", totalEarned,
            "totalAnswers",      answers,
            "totalEvaluated",    evaluated,
            "averageScore",      Math.round(avg * 10.0) / 10.0
        );
    }

    public List<Map<String,Object>> getTopicScores(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return topicScoreRepo.findByUserId(user.getId()).stream().map(ts -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("topicId",      ts.getTopic().getId());
            m.put("topicName",    ts.getTopic().getName());
            m.put("earnedPoints", ts.getEarnedPoints());
            m.put("maxPoints",    ts.getMaxPoints());
            m.put("percentage",   ts.getMaxPoints() > 0
                ? Math.round((double) ts.getEarnedPoints() / ts.getMaxPoints() * 100.0) : 0);
            return m;
        }).toList();
    }

    public List<Map<String,Object>> getTimeSeries(String username, String period) {
        User user = userRepo.findByUsername(username).orElseThrow();
        LocalDateTime since = "monthly".equalsIgnoreCase(period)
            ? LocalDateTime.now().minusMonths(12)
            : LocalDateTime.now().minusWeeks(12);

        List<Object[]> rows = evalRepo.timeSeries(user.getId(), since);
        return rows.stream().map(row -> Map.<String,Object>of(
            "date",   row[0].toString(),
            "points", ((Number) row[1]).intValue()
        )).toList();
    }
}
