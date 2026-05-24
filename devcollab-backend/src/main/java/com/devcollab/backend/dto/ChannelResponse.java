package com.devcollab.backend.dto;

import java.time.LocalDateTime;

public record ChannelResponse(
	String id,
	String name,
	String workspaceId,
	String createdBy,
	LocalDateTime createdAt
) {
}
