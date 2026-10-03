package com.skillconnect.server.service;

import com.skillconnect.server.dto.request.CreateQuestionRequest;
import com.skillconnect.server.dto.response.GroupResponse;
import com.skillconnect.server.dto.response.QuestionResponse;
import com.skillconnect.server.entity.*;
import com.skillconnect.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepo;
    private final UserRepository userRepo;
    private final TopicRepository topicRepo;
    private final QuestionService questionService;
    private final NotificationService notificationService;

    @Transactional
    public GroupResponse createGroup(String username, Map<String,Object> req) {
        User creator = userRepo.findByUsername(username).orElseThrow();
        Group group = new Group();
        group.setName((String) req.get("name"));
        group.setDescription((String) req.get("description"));
        group.setCreator(creator);
        if (req.get("topicId") != null) {
            topicRepo.findById(Long.valueOf(req.get("topicId").toString()))
                .ifPresent(group::setTopic);
        }
        if (req.get("visibility") != null)
            group.setVisibility(Group.Visibility.valueOf(req.get("visibility").toString()));
        group.getMembers().add(creator);
        Group savedGroup = groupRepo.save(group);

        // Invite members
        if (req.get("memberIds") instanceof List<?> ids) {
            for (Object idObj : ids) {
                Long mid = Long.valueOf(idObj.toString());
                userRepo.findById(mid).ifPresent(m -> {
                    savedGroup.getMembers().add(m);
                    notificationService.create(m, "GROUP_INVITE",
                        creator.getUsername() + " invited you to join group: " + savedGroup.getName(),
                        savedGroup.getId(), "GROUP");
                });
            }
            groupRepo.save(savedGroup);
        }

        return toResponse(savedGroup, creator.getId());
    }

    public List<GroupResponse> getMyGroups(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return groupRepo.findByMemberId(user.getId()).stream()
            .map(g -> toResponse(g, user.getId())).toList();
    }

    public GroupResponse getById(Long id, String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Group group = groupRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        return toResponse(group, user.getId());
    }

    @Transactional
    public QuestionResponse postGroupQuestion(Long groupId, String username, CreateQuestionRequest req) {
        Group group = groupRepo.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        User creator = userRepo.findByUsername(username).orElseThrow();

        // Set all group members (except creator) as recipients
        List<Long> recipientIds = new ArrayList<>();
        for (User m : group.getMembers()) {
            if (!m.getId().equals(creator.getId())) recipientIds.add(m.getId());
        }
        req.setGroupId(groupId);
        req.setRecipientIds(recipientIds);

        return questionService.createQuestion(username, req);
    }

    public List<QuestionResponse> getGroupQuestions(Long groupId) {
        return questionService.getQuestionRepo().findByGroupIdOrderByCreatedAtDesc(groupId)
            .stream().map(questionService::toResponse).toList();
    }

    public GroupResponse toResponse(Group g, Long currentUserId) {
        GroupResponse r = new GroupResponse();
        r.setId(g.getId());
        r.setName(g.getName());
        r.setDescription(g.getDescription());
        r.setTopicName(g.getTopic() != null ? g.getTopic().getName() : null);
        r.setVisibility(g.getVisibility().name());
        r.setCreatorId(g.getCreator().getId());
        r.setCreatorUsername(g.getCreator().getUsername());
        r.setMemberCount(g.getMembers().size());
        r.setMember(g.getMembers().stream().anyMatch(m -> m.getId().equals(currentUserId)));
        r.setCreatedAt(g.getCreatedAt());
        return r;
    }
}
