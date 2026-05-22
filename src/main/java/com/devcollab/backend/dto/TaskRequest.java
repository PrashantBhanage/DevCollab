package com.devcollab.backend.dto;

import java.time.LocalDateTime;

import com.devcollab.backend.model.Task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(
	@NotBlank(message = "Task title is required")
	@Size(max = 150, message = "Task title must be at most 150 characters")
	String title,
	String description,
	Task.Status status,
	Long assignedTo,
	LocalDateTime dueDate
) {
}
