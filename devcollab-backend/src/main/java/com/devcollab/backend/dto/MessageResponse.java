package com.devcollab.backend.dto;

import com.devcollab.backend.model.Message;
import java.time.LocalDateTime;

public record MessageResponse(
	Long id,
	String content,
	LocalDateTime createdAt,
	Long channelId,
	Long senderId,
	String senderName,
	Message.Type type,
	String language
) {
}
