package com.devcollab.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);
    List<Task> findByWorkspaceIdAndStatusOrderByCreatedAtDesc(Long workspaceId, Task.Status status);
}
