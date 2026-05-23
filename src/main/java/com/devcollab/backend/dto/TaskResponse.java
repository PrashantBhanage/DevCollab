package com.devcollab.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devcollab.backend.model.Task;

public record TaskResponse(
	UUID id,
	String title,
	String description,
	Task.Status status,
	Long workspaceId,
	Long assignedTo,
	Long createdBy,
	LocalDateTime dueDate,
	LocalDateTime createdAt
) {
}
