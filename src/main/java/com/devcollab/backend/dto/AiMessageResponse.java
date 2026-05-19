package com.devcollab.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devcollab.backend.model.AiMessage;

public record AiMessageResponse(
	UUID id,
	UUID conversationId,
	AiMessage.Role role,
	String content,
	LocalDateTime createdAt
) {
}
