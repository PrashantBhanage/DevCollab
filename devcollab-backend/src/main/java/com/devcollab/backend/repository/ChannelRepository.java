package com.devcollab.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.Channel;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findByWorkspaceIdOrderByCreatedAtAsc(Long workspaceId);
}
