package com.devcollab.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAiConversationRequest(
	@NotBlank(message = "Workspace ID is required")
	String workspaceId
) {
}
