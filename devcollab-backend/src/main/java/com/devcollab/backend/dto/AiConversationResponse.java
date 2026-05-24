package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record AiConversationResponse(
	String id,
	String workspaceId,
	String userId,
	LocalDateTime createdAt
) {
}
