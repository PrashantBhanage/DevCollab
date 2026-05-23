package com.devcollab.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWorkspaceRequest(
	@NotBlank(message = "Workspace name is required")
	@Size(max = 120, message = "Workspace name must be at most 120 characters")
	String name,
	String description
) {
}
