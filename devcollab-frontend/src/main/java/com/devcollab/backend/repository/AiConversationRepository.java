package com.devcollab.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcollab.backend.model.AiConversation;

public interface AiConversationRepository extends JpaRepository<AiConversation, UUID> {

	List<AiConversation> findByUserIdOrderByCreatedAtDesc(Long userId);

	List<AiConversation> findByWorkspaceIdAndUserIdOrderByCreatedAtDesc(Long workspaceId, Long userId);
}
