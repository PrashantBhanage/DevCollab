package com.devcollab.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record SendAiMessageRequest(
	@NotBlank(message = "Message content is required")
	String content
) {
}
