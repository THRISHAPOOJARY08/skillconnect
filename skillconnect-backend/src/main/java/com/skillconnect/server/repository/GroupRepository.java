package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("""
        SELECT g FROM Group g JOIN g.members m
        WHERE m.id = :userId
        ORDER BY g.createdAt DESC
        """)
    List<Group> findByMemberId(@Param("userId") Long userId);

    @Query("""
        SELECT g FROM Group g
        WHERE LOWER(g.name) LIKE LOWER(CONCAT('%',:q,'%'))
        ORDER BY g.createdAt DESC
        """)
    List<Group> searchGroups(@Param("q") String q);
}
