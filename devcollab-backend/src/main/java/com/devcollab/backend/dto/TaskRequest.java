package com.devcollab.backend.dto;

import com.devcollab.backend.model.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record TaskRequest(
	@NotBlank(message = "Title is required")
	String title,
	String description,
	@NotNull(message = "Status is required")
	Task.Status status,
	@NotNull(message = "Priority is required")
	Task.Priority priority,
	LocalDateTime dueDate,
	String assignedTo,
	@NotBlank(message = "Workspace ID is required")
	String workspaceId
) {
}
