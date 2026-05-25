package com.devcollab.backend.dto;

import jakarta.validation.constraints.NotNull;

public record JoinWorkspaceRequest(
	@NotNull(message = "Workspace ID is required")
	Long workspaceId) {
}
