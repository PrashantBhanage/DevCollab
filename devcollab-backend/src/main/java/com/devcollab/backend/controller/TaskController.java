package com.devcollab.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devcollab.backend.dto.TaskRequest;
import com.devcollab.backend.dto.TaskResponse;
import com.devcollab.backend.model.Task;
import com.devcollab.backend.service.TaskService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api")
public class TaskController {

        private final TaskService taskService;

        public TaskController(TaskService taskService) {
                this.taskService = taskService;
        }

        @PostMapping("/workspaces/{id}/tasks")
        public ResponseEntity<TaskResponse> createTask(
                @PathVariable Long id,
                @Valid @RequestBody TaskRequest request
        ) {
                return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(id, request));
        }

        @GetMapping("/workspaces/{id}/tasks")
        public ResponseEntity<List<TaskResponse>> getTasks(
                @PathVariable Long id,
                @RequestParam(required = false) Task.Status status
        ) {
                return ResponseEntity.ok(taskService.getTasksByWorkspace(id, status));
        }

        @PutMapping("/tasks/{taskId}")
        public ResponseEntity<TaskResponse> updateTask(
                @PathVariable Long taskId,
                @Valid @RequestBody TaskRequest request
        ) {
                return ResponseEntity.ok(taskService.updateTask(taskId, request));
        }

        @DeleteMapping("/tasks/{taskId}")
        public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
                taskService.deleteTask(taskId);
                return ResponseEntity.noContent().build();
        }
}
