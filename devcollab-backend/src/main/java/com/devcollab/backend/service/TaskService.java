package com.devcollab.backend.service;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devcollab.backend.dto.TaskRequest;
import com.devcollab.backend.dto.TaskResponse;
import com.devcollab.backend.exception.ResourceNotFoundException;
import com.devcollab.backend.model.Task;
import com.devcollab.backend.repository.TaskRepository;

@Service
public class TaskService {

        private final TaskRepository taskRepository;
        private final WorkspaceAccessService workspaceAccessService;

        public TaskService(TaskRepository taskRepository, WorkspaceAccessService workspaceAccessService) {
                this.taskRepository = taskRepository;
                this.workspaceAccessService = workspaceAccessService;
        }

        @Transactional
        @NonNull
        public TaskResponse createTask(@NonNull Long workspaceId, @NonNull TaskRequest request) {
                if (request.title() == null || request.title().isBlank()) {
                        throw new IllegalArgumentException("Task title cannot be empty");
                }
                workspaceAccessService.requireWorkspaceMember(workspaceId);
                workspaceAccessService.ensureWorkspaceParticipant(workspaceId, request.assignedTo());

                Task task = Task.builder()
                        .title(request.title().trim())
                        .description(trimToNull(request.description()))
                        .status(request.status() == null ? Task.Status.TODO : request.status())
                        .workspaceId(workspaceId)
                        .assignedTo(request.assignedTo())
                        .dueDate(request.dueDate())
                        .build();

                return toResponse(taskRepository.save(task));
        }

        @Transactional(readOnly = true)
        @NonNull
        public List<TaskResponse> getTasksByWorkspace(@NonNull Long workspaceId, Task.Status status) {
                workspaceAccessService.requireWorkspaceMember(workspaceId);
                List<Task> tasks = status == null
                        ? taskRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId)
                        : taskRepository.findByWorkspaceIdAndStatusOrderByCreatedAtDesc(workspaceId, status);

                return tasks.stream()
                        .map(this::toResponse)
                        .toList();
        }

        @Transactional
        @NonNull
        public TaskResponse updateTask(@NonNull Long taskId, @NonNull TaskRequest request) {
                if (request.title() == null || request.title().isBlank()) {
                        throw new IllegalArgumentException("Task title cannot be empty");
                }
                Task task = getTask(taskId);
                workspaceAccessService.requireWorkspaceMember(task.getWorkspaceId());
                workspaceAccessService.ensureWorkspaceParticipant(task.getWorkspaceId(), request.assignedTo());

                task.setTitle(request.title().trim());
                task.setDescription(trimToNull(request.description()));
                task.setAssignedTo(request.assignedTo());
                task.setDueDate(request.dueDate());
                if (request.status() != null) {
                        task.setStatus(request.status());
                }

                return toResponse(taskRepository.save(task));
        }

        @Transactional
        public void deleteTask(@NonNull Long taskId) {
                Task task = getTask(taskId);
                workspaceAccessService.requireWorkspaceOwner(task.getWorkspaceId());
                taskRepository.delete(task);
        }

        @NonNull
        private Task getTask(@NonNull Long taskId) {
                return taskRepository.findById(taskId)
                        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        }

        @NonNull
        private TaskResponse toResponse(@NonNull Task task) {
                return new TaskResponse(
                        task.getId(),
                        task.getTitle(),
                        task.getDescription(),
                        task.getStatus(),
                        task.getDueDate(),
                        task.getWorkspaceId(),
                        task.getAssignedTo(),
                        task.getCreatedAt(),
                        task.getUpdatedAt()
                );
        }

        private String trimToNull(String value) {
                if (value == null) {
                        return null;
                }
                String trimmed = value.trim();
                return trimmed.isEmpty() ? null : trimmed;
        }
}
