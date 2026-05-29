package com.devcollab.backend.dto;

import jakarta.validation.constraints.NotNull;

public record CreateAiConversationRequest(
	@NotNull(message = "Workspace ID is required")
	Long workspaceId,
	String title
) {
}
