package com.devcollab.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.Channel;

public interface ChannelRepository extends JpaRepository<Channel, String> {
    List<Channel> findByWorkspaceIdOrderByCreatedAtAsc(String workspaceId);
}
