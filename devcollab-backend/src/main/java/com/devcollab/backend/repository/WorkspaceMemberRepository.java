package com.devcollab.backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.WorkspaceMember;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, String> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(String workspaceId, String userId);
    List<WorkspaceMember> findByWorkspaceId(String workspaceId);
    List<WorkspaceMember> findByUserId(String userId);
}
