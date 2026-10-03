package com.skillconnect.server.repository;

import com.skillconnect.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);

    @Query("""
        SELECT u FROM User u
        WHERE u.id <> :currentUserId
        AND (LOWER(u.username) LIKE LOWER(CONCAT('%',:q,'%'))
          OR LOWER(u.fullName)  LIKE LOWER(CONCAT('%',:q,'%')))
        """)
    List<User> searchUsers(@Param("q") String q, @Param("currentUserId") Long currentUserId);
}
