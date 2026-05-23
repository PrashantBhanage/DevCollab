package com.devcollab.backend.dto;

import jakarta.validation.constraints.NotNull;

public record JoinWorkspaceRequest(
	@NotNull(message = "Workspace id is required")
	Long workspaceId
) {
}
