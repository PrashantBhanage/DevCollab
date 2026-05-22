package com.devcollab.backend.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.devcollab.backend.model.Message;

public interface MessageRepository extends JpaRepository<Message, UUID> {

	Page<Message> findByChannelIdOrderByCreatedAtAsc(UUID channelId, Pageable pageable);

	void deleteByChannelId(UUID channelId);
}
