package com.devcollab.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devcollab.backend.model.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findByChannelIdOrderByCreatedAtAsc(Long channelId, Pageable pageable);
    void deleteByChannelId(Long channelId);
}
