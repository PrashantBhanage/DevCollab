package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record AiMessageResponse(
	String id,
	String conversationId,
	String role,
	String content,
	LocalDateTime createdAt
) {
}
