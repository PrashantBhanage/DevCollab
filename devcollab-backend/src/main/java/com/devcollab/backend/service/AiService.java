package com.devcollab.backend.service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.lang.NonNull;

import com.devcollab.backend.dto.AiConversationResponse;
import com.devcollab.backend.dto.AiMessageResponse;
import com.devcollab.backend.dto.CreateAiConversationRequest;
import com.devcollab.backend.dto.SendAiMessageRequest;
import com.devcollab.backend.exception.ResourceNotFoundException;
import com.devcollab.backend.model.AiConversation;
import com.devcollab.backend.model.AiMessage;
import com.devcollab.backend.model.User;
import com.devcollab.backend.repository.AiConversationRepository;
import com.devcollab.backend.repository.AiMessageRepository;

@Service
public class AiService {

        private final AiConversationRepository aiConversationRepository;
        private final AiMessageRepository aiMessageRepository;
        private final WorkspaceAccessService workspaceAccessService;
        private final RestClient.Builder restClientBuilder;
        private final String geminiApiKey;
        private final String geminiModel;
        private final String geminiBaseUrl;

        public AiService(
                AiConversationRepository aiConversationRepository,
                AiMessageRepository aiMessageRepository,
                WorkspaceAccessService workspaceAccessService,
                RestClient.Builder restClientBuilder,
                @Value("${app.gemini.api-key:}") String geminiApiKey,
                @Value("${app.gemini.model:gemini-2.0-flash}") String geminiModel,
                @Value("${app.gemini.base-url:https://generativelanguage.googleapis.com}") String geminiBaseUrl
        ) {
                this.aiConversationRepository = aiConversationRepository;
                this.aiMessageRepository = aiMessageRepository;
                this.workspaceAccessService = workspaceAccessService;
                this.restClientBuilder = restClientBuilder;
                this.geminiApiKey = geminiApiKey;
                this.geminiModel = geminiModel;
                this.geminiBaseUrl = geminiBaseUrl;
        }

        @Transactional
        @NonNull
        public AiConversationResponse createConversation(@NonNull CreateAiConversationRequest request) {
                if (request.workspaceId() == null) {
                        throw new IllegalArgumentException("Workspace ID is required");
                }
                workspaceAccessService.requireWorkspaceMember(request.workspaceId());
                User currentUser = workspaceAccessService.getCurrentUser();

                AiConversation conversation = AiConversation.builder()
                        .workspaceId(request.workspaceId())
                        .userId(currentUser.getId())
                        .title(request.title() != null && !request.title().isBlank() ? request.title() : "New Conversation")
                        .build();

                return toResponse(aiConversationRepository.save(conversation));
        }

        @Transactional
        @NonNull
        public AiMessageResponse sendMessage(@NonNull Long conversationId, @NonNull SendAiMessageRequest request) {
                if (request.content() == null || request.content().isBlank()) {
                        throw new IllegalArgumentException("Message content cannot be empty");
                }
                AiConversation conversation = getConversationForCurrentUser(conversationId);

                AiMessage userMessage = AiMessage.builder()
                        .conversationId(conversation.getId())
                        .role(AiMessage.Role.USER)
                        .content(request.content().trim())
                        .build();
                aiMessageRepository.save(userMessage);

                List<AiMessage> history = aiMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
                String aiResponseText = generateAiResponse(history);

                AiMessage aiMessage = AiMessage.builder()
                        .conversationId(conversation.getId())
                        .role(AiMessage.Role.AI)
                        .content(aiResponseText)
                        .build();

                return toMessageResponse(aiMessageRepository.save(aiMessage));
        }

        @Transactional(readOnly = true)
        @NonNull
        public List<AiMessageResponse> getMessages(@NonNull Long conversationId) {
                AiConversation conversation = getConversationForCurrentUser(conversationId);
                return aiMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                        .stream()
                        .map(this::toMessageResponse)
                        .toList();
        }

        @Transactional(readOnly = true)
        @NonNull
        public List<AiConversationResponse> getConversations(Long workspaceId) {
                User currentUser = workspaceAccessService.getCurrentUser();
                if (workspaceId != null) {
                        workspaceAccessService.requireWorkspaceMember(workspaceId);
                        return aiConversationRepository.findByWorkspaceIdAndUserIdOrderByCreatedAtDesc(workspaceId, currentUser.getId())
                                .stream()
                                .map(this::toResponse)
                                .toList();
                }

                return aiConversationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                        .stream()
                        .map(this::toResponse)
                        .toList();
        }

        @NonNull
        private AiConversation getConversationForCurrentUser(@NonNull Long conversationId) {
                AiConversation conversation = aiConversationRepository.findById(conversationId)
                        .orElseThrow(() -> new ResourceNotFoundException("AI conversation not found"));
                User currentUser = workspaceAccessService.getCurrentUser();
                if (!conversation.getUserId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("You do not have access to this conversation");
                }
                workspaceAccessService.requireWorkspaceMember(conversation.getWorkspaceId());
                return conversation;
        }

        @NonNull
        private String generateAiResponse(@NonNull List<AiMessage> history) {
                if (geminiApiKey == null || geminiApiKey.isBlank()) {
                        throw new IllegalStateException("Gemini API key is not configured");
                }

                GeminiGenerateContentRequest request = new GeminiGenerateContentRequest(
                        history.stream()
                                .map(this::toGeminiContent)
                                .toList()
                );

                try {
                        GeminiGenerateContentResponse response = restClientBuilder
                                .baseUrl(geminiBaseUrl)
                                .build()
                                .post()
                                .uri("/v1beta/models/{model}:generateContent", geminiModel)
                                .header("x-goog-api-key", geminiApiKey)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(request)
                                .retrieve()
                                .body(GeminiGenerateContentResponse.class);

                        return extractText(response);
                }
                catch (RestClientResponseException exception) {
                        String body = exception.getResponseBodyAsString();
                        throw new IllegalStateException("Gemini request failed: " + (body == null || body.isBlank() ? exception.getMessage() : body), exception);
                }
        }

        @NonNull
        private GeminiContent toGeminiContent(@NonNull AiMessage message) {
                String role = message.getRole() == AiMessage.Role.AI ? "model" : "user";
                return new GeminiContent(role, List.of(new GeminiPart(message.getContent())));
        }

        @NonNull
        private String extractText(GeminiGenerateContentResponse response) {
                if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
                        throw new IllegalStateException("Gemini returned no response");
                }

                GeminiCandidate candidate = response.candidates().get(0);
                if (candidate.content() == null || candidate.content().parts() == null || candidate.content().parts().isEmpty()) {
                        throw new IllegalStateException("Gemini returned an empty response");
                }

                return candidate.content().parts().stream()
                        .map(GeminiPart::text)
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(part -> !part.isEmpty())
                        .reduce((left, right) -> left + "\n\n" + right)
                        .orElseThrow(() -> new IllegalStateException("Gemini returned an empty response"));
        }

        @NonNull
        private AiConversationResponse toResponse(@NonNull AiConversation conversation) {
                return new AiConversationResponse(
                        conversation.getId(),
                        conversation.getWorkspaceId(),
                        conversation.getUserId(),
                        conversation.getTitle(),
                        conversation.getCreatedAt()
                );
        }

        @NonNull
        private AiMessageResponse toMessageResponse(@NonNull AiMessage message) {
                return new AiMessageResponse(
                        message.getId(),
                        message.getConversationId(),
                        message.getRole().name(),
                        message.getContent(),
                        message.getCreatedAt()
                );
        }

        private record GeminiGenerateContentRequest(List<GeminiContent> contents) {
        }

        private record GeminiGenerateContentResponse(List<GeminiCandidate> candidates) {
        }

        private record GeminiCandidate(GeminiContent content) {
        }

        private record GeminiContent(String role, List<GeminiPart> parts) {
        }

        private record GeminiPart(String text) {
        }
}
 record GeminiPart(String text) {
        }

