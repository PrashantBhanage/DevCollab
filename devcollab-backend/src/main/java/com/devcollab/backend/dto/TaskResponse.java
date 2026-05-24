package com.devcollab.backend.dto;

import com.devcollab.backend.model.Task;
import java.time.LocalDateTime;

public record TaskResponse(
	String id,
	String title,
	String description,
	Task.Status status,
	Task.Priority priority,
	LocalDateTime dueDate,
	String workspaceId,
	String assignedTo,
	String createdBy,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {
}
