package com.skillconnect.server.repository;

import com.skillconnect.server.entity.Avatar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvatarRepository extends JpaRepository<Avatar, Long> {}
