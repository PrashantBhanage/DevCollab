package com.devcollab.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcollab.backend.model.AiMessage;

public interface AiMessageRepository extends JpaRepository<AiMessage, UUID> {

	List<AiMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
}
