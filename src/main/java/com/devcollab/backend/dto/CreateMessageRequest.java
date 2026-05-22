package com.devcollab.backend.dto;

import com.devcollab.backend.model.Message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMessageRequest(
	@NotBlank(message = "Message content is required")
	String content,
	Message.Type type,
	@Size(max = 50, message = "Language must be at most 50 characters")
	String language
) {
}
