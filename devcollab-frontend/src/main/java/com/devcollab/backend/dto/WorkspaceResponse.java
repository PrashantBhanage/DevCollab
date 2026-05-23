package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record WorkspaceResponse(
	Long id,
	String name,
	String description,
	Long ownerId,
	String role,
	LocalDateTime createdAt
) {
}
