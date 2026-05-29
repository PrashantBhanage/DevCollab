package com.devcollab.backend.service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devcollab.backend.dto.CreateWorkspaceRequest;
import com.devcollab.backend.dto.JoinWorkspaceRequest;
import com.devcollab.backend.dto.WorkspaceMemberResponse;
import com.devcollab.backend.dto.WorkspaceResponse;
import com.devcollab.backend.exception.ResourceNotFoundException;
import com.devcollab.backend.model.User;
import com.devcollab.backend.model.Workspace;
import com.devcollab.backend.model.WorkspaceMember;
import com.devcollab.backend.repository.UserRepository;
import com.devcollab.backend.repository.WorkspaceMemberRepository;
import com.devcollab.backend.repository.WorkspaceRepository;

@Service
public class WorkspaceService {

        private final WorkspaceRepository workspaceRepository;
        private final WorkspaceMemberRepository workspaceMemberRepository;
        private final WorkspaceAccessService workspaceAccessService;
        private final UserRepository userRepository;

        public WorkspaceService(
                WorkspaceRepository workspaceRepository,
                WorkspaceMemberRepository workspaceMemberRepository,
                WorkspaceAccessService workspaceAccessService,
                UserRepository userRepository
        ) {
                this.workspaceRepository = workspaceRepository;
                this.workspaceMemberRepository = workspaceMemberRepository;
                this.workspaceAccessService = workspaceAccessService;
                this.userRepository = userRepository;
        }

        @Transactional
        public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request) {
                User currentUser = workspaceAccessService.getCurrentUser();

                Workspace workspace = Workspace.builder()
                        .name(request.name().trim())
                        .description(trimToNull(request.description()))
                        .inviteCode(generateInviteCode())
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

        @Transactional(readOnly = true)
        public List<WorkspaceMemberResponse> getWorkspaceMembers(Long workspaceId) {
                Workspace workspace = workspaceAccessService.requireWorkspaceMember(workspaceId);
                List<WorkspaceMemberResponse> members = new java.util.ArrayList<>();

                userRepository.findById(workspace.getOwnerId()).ifPresent(owner ->
                        members.add(new WorkspaceMemberResponse(
                                owner.getId(),
                                owner.getName(),
                                owner.getEmail(),
                                WorkspaceMember.Role.OWNER.name(),
                                false
                        ))
                );

                for (WorkspaceMember member : workspaceMemberRepository.findByWorkspaceId(workspaceId)) {
                        if (member.getUserId().equals(workspace.getOwnerId())) {
                                continue;
                        }
                        userRepository.findById(member.getUserId()).ifPresent(user ->
                                members.add(new WorkspaceMemberResponse(
                                        user.getId(),
                                        user.getName(),
                                        user.getEmail(),
                                        member.getRole().name(),
                                        false
                                ))
                        );
                }

                return members;
        }

        @Transactional
        public WorkspaceResponse joinWorkspace(JoinWorkspaceRequest request) {
                String code = request.inviteCode().trim();
                Workspace workspace = workspaceRepository.findByInviteCode(code)
                        .orElseThrow(() -> new ResourceNotFoundException("Invalid invite code"));
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

        private String generateInviteCode() {
                return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        }

        private String trimToNull(String value) {
                if (value == null) {
                        return null;
                }
                String trimmed = value.trim();
                return trimmed.isEmpty() ? null : trimmed;
        }
}
