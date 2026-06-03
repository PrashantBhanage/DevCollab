package com.devcollab.backend.dto;

import com.devcollab.backend.model.Task;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description,
        Task.Status status,
        LocalDate dueDate,
        Long assignedTo,
        Long workspaceId
) {
}
