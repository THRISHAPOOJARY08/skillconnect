package com.skillconnect.server.service;

import com.skillconnect.server.entity.*;
import com.skillconnect.server.dto.response.UserResponse;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserMapper {

    private final UserProfileRepository profileRepo;
    private final UserScoreRepository scoreRepo;

    public UserResponse toResponse(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setUsername(user.getUsername());
        r.setEmail(user.getEmail());
        r.setFullName(user.getFullName());
        r.setBio(user.getBio());
        r.setCollege(user.getCollege());

        if (user.getAvatar() != null) {
            r.setAvatarPath(user.getAvatar().getFilePath());
            r.setAvatarId(user.getAvatar().getId());
        }

        profileRepo.findByUserId(user.getId()).ifPresent(p -> {
            r.setSkills(p.getSkills());
            r.setInterests(p.getInterests());
        });

        scoreRepo.findByUserId(user.getId()).ifPresent(s -> {
            r.setTotalPoints(s.getTotalPoints());
            r.setTotalAnswers(s.getTotalAnswers());
            r.setTotalEvaluated(s.getTotalEvaluated());
        });

        return r;
    }
}
