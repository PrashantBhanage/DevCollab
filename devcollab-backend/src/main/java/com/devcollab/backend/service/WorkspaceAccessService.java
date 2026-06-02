package com.devcollab.backend.service;

import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devcollab.backend.exception.ResourceNotFoundException;
import com.devcollab.backend.model.User;
import com.devcollab.backend.model.Workspace;
import com.devcollab.backend.repository.UserRepository;
import com.devcollab.backend.repository.WorkspaceMemberRepository;
import com.devcollab.backend.repository.WorkspaceRepository;

@Service
public class WorkspaceAccessService {

	private final WorkspaceRepository workspaceRepository;
	private final WorkspaceMemberRepository workspaceMemberRepository;
	private final UserRepository userRepository;

	public WorkspaceAccessService(
		WorkspaceRepository workspaceRepository,
		WorkspaceMemberRepository workspaceMemberRepository,
		UserRepository userRepository
	) {
		this.workspaceRepository = workspaceRepository;
		this.workspaceMemberRepository = workspaceMemberRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	@NonNull
	public User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
			throw new IllegalStateException("Authenticated user not found");
		}

		return userRepository.findByEmail(authentication.getName())
			.orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
	}

	@Transactional(readOnly = true)
	@NonNull
	public Workspace requireWorkspaceMember(@NonNull Long workspaceId) {
		Workspace workspace = getWorkspace(workspaceId);
		Long userId = getCurrentUser().getId();
		if (userId != null && belongsToWorkspace(workspace, userId)) {
			return workspace;
		}
		throw new AccessDeniedException("You do not have access to this workspace");
	}

	@Transactional(readOnly = true)
	@NonNull
	public Workspace requireWorkspaceOwner(@NonNull Long workspaceId) {
		Workspace workspace = getWorkspace(workspaceId);
		Long userId = getCurrentUser().getId();
		if (userId != null && userId.equals(workspace.getOwnerId())) {
			return workspace;
		}
		throw new AccessDeniedException("Only the workspace owner can perform this action");
	}

	@Transactional(readOnly = true)
	public void ensureWorkspaceParticipant(@NonNull Long workspaceId, Long userId) {
		if (userId == null) {
			return;
		}
		if (!userRepository.existsById(userId)) {
			throw new ResourceNotFoundException("User not found");
		}

		Workspace workspace = getWorkspace(workspaceId);
		if (!belongsToWorkspace(workspace, userId)) {
			throw new IllegalArgumentException("Assigned user is not part of this workspace");
		}
	}

	@Transactional(readOnly = true)
	@NonNull
	public Workspace getWorkspace(@NonNull Long workspaceId) {
		return workspaceRepository.findById(workspaceId)
			.orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
	}

	private boolean belongsToWorkspace(@NonNull Workspace workspace, @NonNull Long userId) {
		if (userId.equals(workspace.getOwnerId())) {
			return true;
		}
		return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), userId).isPresent();
	}
}
