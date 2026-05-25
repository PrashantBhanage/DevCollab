package com.devcollab.backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
public class Task {

	public enum Status {
		TODO,
		IN_PROGRESS,
		DONE
	}

	@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

	@Column(name = "workspace_id", nullable = false)
	private Long workspaceId;

	@Column(name = "assignee_id")
private Long assignedTo;

	@Column(name = "created_by", nullable = false)
	private Long createdBy;

	@Column(nullable = false, length = 150)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private Status status = Status.TODO;

	private LocalDateTime dueDate;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
