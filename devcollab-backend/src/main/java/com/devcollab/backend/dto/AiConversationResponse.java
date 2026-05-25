package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record AiConversationResponse(
	Long id,
	Long workspaceId,
	Long userId,
	LocalDateTime createdAt
) {
}
