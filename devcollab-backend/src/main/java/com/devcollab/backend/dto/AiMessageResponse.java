package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record AiMessageResponse(
	Long id,
	Long conversationId,
	String role,
	String content,
	LocalDateTime createdAt
) {
}
