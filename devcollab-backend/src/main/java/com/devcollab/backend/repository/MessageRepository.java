package com.devcollab.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.Message;

public interface MessageRepository extends JpaRepository<Message, String> {
    Page<Message> findByChannelIdOrderByCreatedAtAsc(String channelId, Pageable pageable);
    void deleteByChannelId(String channelId);
}
