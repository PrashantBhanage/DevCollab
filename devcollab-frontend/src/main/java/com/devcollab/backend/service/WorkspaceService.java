package com.devcollab.backend.service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devcollab.backend.dto.CreateWorkspaceRequest;
import com.devcollab.backend.dto.JoinWorkspaceRequest;
import com.devcollab.backend.dto.WorkspaceResponse;
import com.devcollab.backend.model.User;
import com.devcollab.backend.model.Workspace;
import com.devcollab.backend.model.WorkspaceMember;
import com.devcollab.backend.repository.WorkspaceMemberRepository;
import com.devcollab.backend.repository.WorkspaceRepository;

@Service
public class WorkspaceService {

	private static final String OWNER_ROLE = "OWNER";
	private static final String MEMBER_ROLE = "MEMBER";

	private final WorkspaceRepository workspaceRepository;
	private final WorkspaceMemberRepository workspaceMemberRepository;
	private final WorkspaceAccessService workspaceAccessService;

	public WorkspaceService(
		WorkspaceRepository workspaceRepository,
		WorkspaceMemberRepository workspaceMemberRepository,
		WorkspaceAccessService workspaceAccessService
	) {
		this.workspaceRepository = workspaceRepository;
		this.workspaceMemberRepository = workspaceMemberRepository;
		this.workspaceAccessService = workspaceAccessService;
	}

	@Transactional
	public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request) {
		User currentUser = workspaceAccessService.getCurrentUser();

		Workspace workspace = new Workspace();
		workspace.setName(request.name().trim());
		workspace.setDescription(trimToNull(request.description()));
		workspace.setOwner(currentUser);

		return toResponse(workspaceRepository.save(workspace), OWNER_ROLE);
	}

	@Transactional(readOnly = true)
	public List<WorkspaceResponse> getWorkspaces() {
		User currentUser = workspaceAccessService.getCurrentUser();
		Map<Long, WorkspaceResponse> workspaces = new LinkedHashMap<>();

		for (Workspace workspace : workspaceRepository.findByOwnerId(currentUser.getId())) {
			workspaces.put(workspace.getId(), toResponse(workspace, OWNER_ROLE));
		}

		for (WorkspaceMember member : workspaceMemberRepository.findByUserId(currentUser.getId())) {
			Workspace workspace = member.getWorkspace();
			workspaces.putIfAbsent(workspace.getId(), toResponse(workspace, member.getRole()));
		}

		return workspaces.values().stream()
			.sorted(Comparator.comparing(WorkspaceResponse::createdAt).reversed())
			.toList();
	}

	@Transactional(readOnly = true)
	public WorkspaceResponse getWorkspaceById(Long workspaceId) {
		Workspace workspace = workspaceAccessService.requireWorkspaceMember(workspaceId);
		User currentUser = workspaceAccessService.getCurrentUser();
		String role = workspace.getOwner().getId().equals(currentUser.getId())
			? OWNER_ROLE
			: workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
				.map(WorkspaceMember::getRole)
				.orElse(MEMBER_ROLE);
		return toResponse(workspace, role);
	}

	@Transactional
	public WorkspaceResponse joinWorkspace(JoinWorkspaceRequest request) {
		Workspace workspace = workspaceAccessService.getWorkspace(request.workspaceId());
		User currentUser = workspaceAccessService.getCurrentUser();

		if (workspace.getOwner().getId().equals(currentUser.getId())) {
			return toResponse(workspace, OWNER_ROLE);
		}

		WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
			.orElseGet(() -> {
				WorkspaceMember newMember = new WorkspaceMember();
				newMember.setWorkspace(workspace);
				newMember.setUser(currentUser);
				newMember.setRole(MEMBER_ROLE);
				return workspaceMemberRepository.save(newMember);
			});

		return toResponse(workspace, member.getRole());
	}

	private WorkspaceResponse toResponse(Workspace workspace, String role) {
		return new WorkspaceResponse(
			workspace.getId(),
			workspace.getName(),
			workspace.getDescription(),
			workspace.getOwner().getId(),
			role,
			workspace.getCreatedAt()
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
