package com.devcollab.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devcollab.backend.dto.CreateWorkspaceRequest;
import com.devcollab.backend.dto.JoinWorkspaceRequest;
import com.devcollab.backend.dto.WorkspaceResponse;
import com.devcollab.backend.service.WorkspaceService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

	private final WorkspaceService workspaceService;

	public WorkspaceController(WorkspaceService workspaceService) {
		this.workspaceService = workspaceService;
	}

	@PostMapping
	public ResponseEntity<WorkspaceResponse> createWorkspace(@Valid @RequestBody CreateWorkspaceRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.createWorkspace(request));
	}

	@GetMapping
	public ResponseEntity<List<WorkspaceResponse>> getWorkspaces() {
		return ResponseEntity.ok(workspaceService.getWorkspaces());
	}

	@GetMapping("/{id}")
	public ResponseEntity<WorkspaceResponse> getWorkspace(@PathVariable Long id) {
		return ResponseEntity.ok(workspaceService.getWorkspaceById(id));
	}

	@PostMapping("/join")
	public ResponseEntity<WorkspaceResponse> joinWorkspace(@Valid @RequestBody JoinWorkspaceRequest request) {
		return ResponseEntity.ok(workspaceService.joinWorkspace(request));
	}
}
