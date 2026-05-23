package com.devcollab.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devcollab.backend.model.Message;

public record MessageResponse(
	UUID id,
	String content,
	Message.Type type,
	String language,
	UUID channelId,
	Long senderId,
	LocalDateTime createdAt
) {
}
