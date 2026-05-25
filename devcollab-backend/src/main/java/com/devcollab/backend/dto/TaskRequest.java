package com.devcollab.backend.dto;

import com.devcollab.backend.model.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description,
        @NotNull(message = "Status is required")
        Task.Status status,
        LocalDate dueDate,
        Long assignedTo,
        @NotNull(message = "Workspace ID is required")
        Long workspaceId
) {
}
