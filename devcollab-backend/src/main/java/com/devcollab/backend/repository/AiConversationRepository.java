package com.devcollab.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.AiConversation;

public interface AiConversationRepository extends JpaRepository<AiConversation, String> {
    List<AiConversation> findByUserIdOrderByCreatedAtDesc(String userId);
    List<AiConversation> findByWorkspaceIdAndUserIdOrderByCreatedAtDesc(String workspaceId, String userId);
}
