package com.devcollab.backend.dto;

import com.devcollab.backend.model.Message;
import java.time.LocalDateTime;

public record MessageResponse(
	String id,
	String content,
	LocalDateTime createdAt,
	String channelId,
	String senderId,
	String senderName,
	Message.Type type,
	String language
) {
}
