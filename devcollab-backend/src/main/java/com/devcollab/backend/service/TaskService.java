package com.devcollab.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devcollab.backend.dto.TaskRequest;
import com.devcollab.backend.dto.TaskResponse;
import com.devcollab.backend.exception.ResourceNotFoundException;
import com.devcollab.backend.model.Task;
import com.devcollab.backend.model.User;
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
	public TaskResponse createTask(String workspaceId, TaskRequest request) {
		workspaceAccessService.requireWorkspaceMember(workspaceId);
		workspaceAccessService.ensureWorkspaceParticipant(workspaceId, request.assignedTo());
		User currentUser = workspaceAccessService.getCurrentUser();

		Task task = Task.builder()
			.title(request.title().trim())
			.description(trimToNull(request.description()))
			.status(request.status() == null ? Task.Status.TODO : request.status())
			.workspaceId(workspaceId)
			.assignedTo(request.assignedTo())
			.createdBy(currentUser.getId())
			.dueDate(request.dueDate())
			.build();

		return toResponse(taskRepository.save(task));
	}

	@Transactional(readOnly = true)
	public List<TaskResponse> getTasksByWorkspace(String workspaceId, Task.Status status) {
		workspaceAccessService.requireWorkspaceMember(workspaceId);
		List<Task> tasks = status == null
			? taskRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId)
			: taskRepository.findByWorkspaceIdAndStatusOrderByCreatedAtDesc(workspaceId, status);

		return tasks.stream()
			.map(this::toResponse)
			.toList();
	}

	@Transactional
	public TaskResponse updateTask(String taskId, TaskRequest request) {
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
	public void deleteTask(String taskId) {
		Task task = getTask(taskId);
		workspaceAccessService.requireWorkspaceOwner(task.getWorkspaceId());
		taskRepository.delete(task);
	}

	private Task getTask(String taskId) {
		return taskRepository.findById(taskId)
			.orElseThrow(() -> new ResourceNotFoundException("Task not found"));
	}

	private TaskResponse toResponse(Task task) {
		return new TaskResponse(
			task.getId(),
			task.getTitle(),
			task.getDescription(),
			task.getStatus(),
			task.getWorkspaceId(),
			task.getAssignedTo(),
			task.getCreatedBy(),
			task.getDueDate(),
			task.getCreatedAt()
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
