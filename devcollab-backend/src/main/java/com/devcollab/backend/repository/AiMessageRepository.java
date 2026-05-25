package com.devcollab.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.AiMessage;

public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
    List<AiMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}
