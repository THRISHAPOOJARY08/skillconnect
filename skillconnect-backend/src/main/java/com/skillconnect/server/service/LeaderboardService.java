package com.skillconnect.server.service;

import com.skillconnect.server.entity.*;
import com.skillconnect.server.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final ConnectionRepository connectionRepo;
    private final UserRepository userRepo;
    private final UserScoreRepository scoreRepo;
    private final EvaluationRepository evalRepo;
    private final AnswerRepository answerRepo;

    public List<Map<String,Object>> getLeaderboard(Long currentUserId, String filter, Long topicId) {
        // Get peer ids (connections + self)
        List<Long> peerIds = new ArrayList<>(connectionRepo.findAcceptedConnectionIds(currentUserId));
        peerIds.add(currentUserId);

        LocalDateTime since = switch (filter == null ? "overall" : filter.toLowerCase()) {
            case "weekly"  -> LocalDateTime.now().minusWeeks(1);
            case "monthly" -> LocalDateTime.now().minusMonths(1);
            default        -> LocalDateTime.of(2000, 1, 1, 0, 0);
        };

        List<Map<String,Object>> result = new ArrayList<>();
        for (Long uid : peerIds) {
            User user = userRepo.findById(uid).orElse(null);
            if (user == null) continue;

            int pts = evalRepo.sumPointsByAnswererSince(uid, since);
            long answersCount = answerRepo.findByAnswererId(uid).size();
            double avg = answersCount > 0
                ? evalRepo.countByAnswerer(uid) > 0 ? (double) pts / evalRepo.countByAnswerer(uid) : 0
                : 0;

            Map<String,Object> entry = new LinkedHashMap<>();
            entry.put("userId",      uid);
            entry.put("username",    user.getUsername());
            entry.put("fullName",    user.getFullName());
            entry.put("avatarPath",  user.getAvatar() != null ? user.getAvatar().getFilePath() : null);
            entry.put("totalPoints", pts);
            entry.put("answersCount", answersCount);
            entry.put("avgScore",    Math.round(avg * 10.0) / 10.0);
            result.add(entry);
        }

        result.sort((a, b) -> Integer.compare((int) b.get("totalPoints"), (int) a.get("totalPoints")));

        // Add rank
        for (int i = 0; i < result.size(); i++) {
            result.get(i).put("rank", i + 1);
        }
        return result;
    }
}
