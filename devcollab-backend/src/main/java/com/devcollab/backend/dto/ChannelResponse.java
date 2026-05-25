package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record ChannelResponse(
	Long id,
	String name,
	Long workspaceId,
	Long createdBy,
	LocalDateTime createdAt
) {
}
