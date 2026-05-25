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

                Workspace workspace = Workspace.builder()
                        .name(request.name().trim())
                        .description(trimToNull(request.description()))
                        .ownerId(currentUser.getId())
                        .build();

                return toResponse(workspaceRepository.save(workspace), WorkspaceMember.Role.OWNER.name());
        }

        @Transactional(readOnly = true)
        public List<WorkspaceResponse> getWorkspaces() {
                User currentUser = workspaceAccessService.getCurrentUser();
                Map<Long, WorkspaceResponse> workspaces = new LinkedHashMap<>();

                for (Workspace workspace : workspaceRepository.findByOwnerId(currentUser.getId())) {
                        workspaces.put(workspace.getId(), toResponse(workspace, WorkspaceMember.Role.OWNER.name()));
                }

                for (WorkspaceMember member : workspaceMemberRepository.findByUserId(currentUser.getId())) {
                        Workspace workspace = workspaceRepository.findById(member.getWorkspaceId()).orElse(null);
                        if (workspace != null) {
                                workspaces.putIfAbsent(workspace.getId(), toResponse(workspace, member.getRole().name()));
                        }
                }

                return workspaces.values().stream()
                        .sorted(Comparator.comparing(WorkspaceResponse::createdAt).reversed())
                        .toList();
        }

        @Transactional(readOnly = true)
        public WorkspaceResponse getWorkspaceById(Long workspaceId) {
                Workspace workspace = workspaceAccessService.requireWorkspaceMember(workspaceId);
                User currentUser = workspaceAccessService.getCurrentUser();
                String role = workspace.getOwnerId().equals(currentUser.getId())
                        ? WorkspaceMember.Role.OWNER.name()
                        : workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                                .map(m -> m.getRole().name())
                                .orElse(WorkspaceMember.Role.MEMBER.name());
                return toResponse(workspace, role);
        }

        @Transactional
        public WorkspaceResponse joinWorkspace(JoinWorkspaceRequest request) {
                Workspace workspace = workspaceAccessService.getWorkspace(request.workspaceId());
                User currentUser = workspaceAccessService.getCurrentUser();

                if (workspace.getOwnerId().equals(currentUser.getId())) {
                        return toResponse(workspace, WorkspaceMember.Role.OWNER.name());
                }

                WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
                        .orElseGet(() -> {
                                WorkspaceMember newMember = WorkspaceMember.builder()
                                        .workspaceId(workspace.getId())
                                        .userId(currentUser.getId())
                                        .role(WorkspaceMember.Role.MEMBER)
                                        .build();
                                return workspaceMemberRepository.save(newMember);
                        });

                return toResponse(workspace, member.getRole().name());
        }

        private WorkspaceResponse toResponse(Workspace workspace, String role) {
                return new WorkspaceResponse(
                        workspace.getId(),
                        workspace.getName(),
                        workspace.getDescription(),
                        workspace.getInviteCode(),
                        workspace.getOwnerId(),
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
