package com.devcollab.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.Task;

public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByWorkspaceIdOrderByCreatedAtDesc(String workspaceId);
    List<Task> findByWorkspaceIdAndStatusOrderByCreatedAtDesc(String workspaceId, Task.Status status);
}
