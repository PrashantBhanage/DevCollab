package com.devcollab.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AiConversationResponse(
	UUID id,
	Long workspaceId,
	Long userId,
	LocalDateTime createdAt
) {
}
