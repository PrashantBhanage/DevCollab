package com.devcollab.backend.dto;

import com.devcollab.backend.model.Task;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Task.Status status,
        LocalDate dueDate,
        Long workspaceId,
        Long assignedTo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
