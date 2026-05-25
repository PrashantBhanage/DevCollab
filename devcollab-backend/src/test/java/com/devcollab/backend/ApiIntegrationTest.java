package com.devcollab.backend;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.devcollab.backend.model.User;
import com.devcollab.backend.model.Workspace;
import com.devcollab.backend.repository.UserRepository;
import com.devcollab.backend.repository.WorkspaceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(properties = "app.gemini.api-key=test-gemini-key")
@AutoConfigureMockMvc
class ApiIntegrationTest {

	private static HttpServer geminiStubServer;
	private static String geminiBaseUrl;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		startGeminiStubServer();
	}

	@AfterAll
	static void tearDown() {
		if (geminiStubServer != null) {
			geminiStubServer.stop(0);
		}
	}

	@DynamicPropertySource
	static void registerProperties(DynamicPropertyRegistry registry) {
		startGeminiStubServer();
		registry.add("app.gemini.base-url", () -> geminiBaseUrl);
	}

	@Test
	void authenticatedUserCanUseWorkspaceChannelTaskAndAiEndpoints() throws Exception {
		Long joinableWorkspaceId = createJoinableWorkspaceFixture();

		String token = registerAndLogin();
		String bearerToken = "Bearer " + token;

		MvcResult createWorkspaceResult = mockMvc.perform(
			post("/api/workspaces")
				.header(AUTHORIZATION, bearerToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"name", "Core Workspace",
					"description", "Main project workspace"
				)))
		)
			.andExpect(status().isCreated())
			.andReturn();

		Long workspaceId = readLong(createWorkspaceResult, "id");

		mockMvc.perform(
			get("/api/workspaces")
				.header(AUTHORIZATION, bearerToken)
		)
			.andExpect(status().isOk());

		mockMvc.perform(
			get("/api/workspaces/{id}", workspaceId)
				.header(AUTHORIZATION, bearerToken)
		)
			.andExpect(status().isOk());

		mockMvc.perform(
			post("/api/workspaces/join")
				.header(AUTHORIZATION, bearerToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("workspaceId", joinableWorkspaceId)))
		)
			.andExpect(status().isOk());

		MvcResult createChannelResult = mockMvc.perform(
			post("/api/workspaces/{id}/channels", workspaceId)
				.header(AUTHORIZATION, bearerToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("name", "backend")))
		)
			.andExpect(status().isCreated())
			.andReturn();

		readLong(createChannelResult, "id");

		mockMvc.perform(
			get("/api/workspaces/{id}/channels", workspaceId)
				.header(AUTHORIZATION, bearerToken)
		)
			.andExpect(status().isOk());

		MvcResult createTaskResult = mockMvc.perform(
			post("/api/workspaces/{id}/tasks", workspaceId)
				.header(AUTHORIZATION, bearerToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"title", "Ship integration flow",
					"description", "Verify the full backend flow",
					"status", "TODO"
				)))
		)
			.andExpect(status().isCreated())
			.andReturn();

		Long taskId = readLong(createTaskResult, "id");

		mockMvc.perform(
			get("/api/workspaces/{id}/tasks", workspaceId)
				.header(AUTHORIZATION, bearerToken)
		)
			.andExpect(status().isOk());

		mockMvc.perform(
			put("/api/tasks/{taskId}", taskId)
				.header(AUTHORIZATION, bearerToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"title", "Ship integration flow",
					"description", "Task moved forward",
					"status", "IN_PROGRESS",
					"workspaceId", workspaceId
				)))
		)
			.andExpect(status().isOk());

		MvcResult createConversationResult = mockMvc.perform(
			post("/api/ai/conversations")
				.header(AUTHORIZATION, bearerToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("workspaceId", workspaceId)))
		)
			.andExpect(status().isCreated())
			.andReturn();

		Long conversationId = readLong(createConversationResult, "id");

		mockMvc.perform(
			post("/api/ai/conversations/{id}/messages", conversationId)
				.header(AUTHORIZATION, bearerToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("content", "How should I organize this workspace?")))
		)
			.andExpect(status().isOk());

		mockMvc.perform(
			get("/api/ai/conversations/{id}/messages", conversationId)
				.header(AUTHORIZATION, bearerToken)
		)
			.andExpect(status().isOk());
	}

	private String registerAndLogin() throws Exception {
		mockMvc.perform(
			post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"username", "Ava Patel",
					"email", "ava.patel@example.com",
					"password", "password123"
				)))
		)
			.andExpect(status().isCreated());

		MvcResult loginResult = mockMvc.perform(
			post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"email", "ava.patel@example.com",
					"password", "password123"
				)))
		)
			.andExpect(status().isOk())
			.andReturn();

		return readString(loginResult, "token");
	}

	private Long createJoinableWorkspaceFixture() {
		User owner = new User();
		owner.setName("Fixture Owner");
		owner.setEmail("fixture.owner@example.com");
		owner.setPassword(passwordEncoder.encode("fixturePass123"));
		User savedOwner = userRepository.save(owner);

		Workspace workspace = new Workspace();
		workspace.setName("Shared Workspace");
		workspace.setDescription("Workspace available for join testing");
		workspace.setOwnerId(savedOwner.getId());
		return workspaceRepository.save(workspace).getId();
	}

	private Long readLong(MvcResult result, String fieldName) throws Exception {
		return readJson(result).get(fieldName).asLong();
	}

	private String readString(MvcResult result, String fieldName) throws Exception {
		return readJson(result).get(fieldName).asText();
	}

	private JsonNode readJson(MvcResult result) throws Exception {
		return objectMapper.readTree(result.getResponse().getContentAsString());
	}

	private static synchronized void startGeminiStubServer() {
		if (geminiStubServer != null) {
			return;
		}

		try {
			geminiStubServer = HttpServer.create(new InetSocketAddress(0), 0);
			geminiStubServer.createContext("/v1beta/models/gemini-2.0-flash:generateContent", ApiIntegrationTest::handleGeminiRequest);
			geminiStubServer.start();
			geminiBaseUrl = "http://localhost:" + geminiStubServer.getAddress().getPort();
		}
		catch (Exception exception) {
			throw new IllegalStateException("Failed to start Gemini stub server", exception);
		}
	}

	private static void handleGeminiRequest(HttpExchange exchange) {
		String response = """
			{
			  "candidates": [
			    {
			      "content": {
			        "parts": [
			          { "text": "Use the new task and channel setup for the next step." }
			        ]
			      }
			    }
			  ]
			}
			""";

		try {
			byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
			exchange.getResponseHeaders().add("Content-Type", MediaType.APPLICATION_JSON_VALUE);
			exchange.sendResponseHeaders(200, responseBytes.length);
			try (OutputStream outputStream = exchange.getResponseBody()) {
				outputStream.write(responseBytes);
			}
		}
		catch (Exception exception) {
			throw new IllegalStateException("Failed to respond from Gemini stub server", exception);
		}
		finally {
			exchange.close();
		}
	}
}
