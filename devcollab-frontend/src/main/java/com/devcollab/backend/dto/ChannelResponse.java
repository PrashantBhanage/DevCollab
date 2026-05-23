package com.devcollab.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChannelResponse(
	UUID id,
	String name,
	Long workspaceId,
	Long createdBy,
	LocalDateTime createdAt
) {
}
