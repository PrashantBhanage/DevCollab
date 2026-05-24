package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record WorkspaceResponse(
	String id,
	String name,
	String description,
	String inviteCode,
	String ownerId,
	LocalDateTime createdAt
) {
}
