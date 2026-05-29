package com.devcollab.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcollab.backend.model.Workspace;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
	List<Workspace> findByOwnerId(Long ownerId);

	Optional<Workspace> findByInviteCode(String inviteCode);
}
