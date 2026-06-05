<p align="center">
  <strong>A platform built for developers, with integrated AI code assistance, real-time WebSocket chat, and workspace-based team management.</strong>
</p>

<p align="center">
  <a href="https://github.com/PrashantBhanage/DevCollab">
    <img src="https://img.shields.io/github/repo-size/PrashantBhanage/DevCollab?style=flat-square&label=Repo+Size" alt="Repository size">
  </a>
  <a href="https://github.com/PrashantBhanage/DevCollab/issues">
    <img src="https://img.shields.io/github/issues/PrashantBhanage/DevCollab?style=flat-square" alt="Issues">
  </a>
  <a href="https://github.com/PrashantBhanage/DevCollab/stargazers">
    <img src="https://img.shields.io/github/stars/PrashantBhanage/DevCollab?style=flat-square" alt="Stars">
  </a>
  <a href="https://github.com/PrashantBhanage/DevCollab/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/PrashantBhanage/DevCollab?style=flat-square" alt="License">
  </a>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
- [Architecture](#-architecture)
  - [Module 1: Authentication System](#module-1-authentication-system)
  - [Module 2: Workspaces & Teams](#module-2-workspaces--teams)
  - [Module 3: Real-Time Chat](#module-3-real-time-chat)
  - [Module 4: Code Snippet Sharing](#module-4-code-snippet-sharing)
  - [Module 5: AI Coding Assistant](#module-5-ai-coding-assistant)
  - [Module 6: Task Management](#module-6-task-management)
  - [Notifications](#notifications)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🚀 Features

- ✅ **JWT Authentication** — Secure stateless auth with Spring Security
- 🏢 **Workspace Management** — Create teams, generate invite codes, manage members with roles (OWNER/MEMBER)
- 💬 **Real-Time Chat** — WebSocket-powered instant messaging with STOMP protocol
- 📝 **Code Snippet Sharing** — Syntax highlighting for Java, Python, JS, and more
- 🤖 **AI Coding Assistant** — Integrated Gemini AI for debugging help and code explanations
- 📋 **Task Board** — Create, assign, and track tasks (TODO → IN_PROGRESS → DONE)
- 🔔 **Real-Time Notifications** — WebSocket push notifications for events
- 👥 **Online Status** — Live presence tracking in channels

---

## 🛠 Tech Stack

### Backend

- **Framework:** Spring Boot 3.x
- **Security:** Spring Security + JWT
- **Real-Time:** Spring WebSocket + STOMP + SockJS
- **Database:** PostgreSQL
- **ORM:** Spring Data JPA / Hibernate
- **AI Integration:** Google Gemini API
- **Build Tool:** Maven

### Frontend

- **Framework:** React
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **WebSocket Client:** @stomp/stompjs + sockjs-client
- **Syntax Highlighting:** react-syntax-highlighter
- **Build Tool:** Vite

### DevOps

- **Database:** PostgreSQL
- **Deployment:** Railway (backend) + Vercel (frontend)

---

## 📂 Project Structure

```
DevCollab/
├── backend/                    # Spring Boot API
│   ├── src/main/java/
│   │   └── com/devcollab/
│   │       ├── config/        # Security, WebSocket config
│   │       ├── controller/    # REST controllers
│   │       ├── dto/           # Data Transfer Objects
│   │       ├── entity/        # JPA entities
│   │       ├── repository/    # Data access
│   │       ├── service/       # Business logic
│   │       └── Security/      # JWT & auth filters
│   └── pom.xml
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API & WebSocket services
│   │   ├── stores/           # Zustand stores
│   │   └── utils/            # Helpers
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🏁 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/PrashantBhanage/DevCollab.git
cd DevCollab
```

2. **Set up the backend:**

```bash
cd backend

# Create PostgreSQL database
createdb devcollab

# Configure application properties
# Edit src/main/resources/application.yml with your DB credentials

# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

3. **Set up the frontend:**

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### Running the Project

```bash
# Terminal 1 - Backend (runs on port 8080)
cd backend && ./mvnw spring-boot:run

# Terminal 2 - Frontend (runs on port 5173)
cd frontend && npm run dev
```

---

## 🏗 Architecture

### Module 1: Authentication System

**Features:**
- User registration with name, email, password
- BCrypt password hashing
- JWT-based stateless authentication
- Role-based access control (OWNER, MEMBER)

**Security Implementation:**
```
Client → Login Request → Validated → JWT Token Generated → Stored in Header
Request → JWT in Header → Security Filter → Token Validated → Resource Access
```

---

### Module 2: Workspaces & Teams

**Features:**
- Create workspaces (creator becomes OWNER)
- Generate invite codes for team joining
- Role enforcement: Only OWNER can delete workspace or remove members

**Data Model:**
```
User ←→ UserWorkspace ←→ Workspace
         (role: OWNER/MEMBER)
```

---

### Module 3: Real-Time Chat

**Features:**
- WebSocket connections with STOMP protocol
- Channel-based messaging
- Message persistence to PostgreSQL
- Typing indicators (ephemeral events)
- Online/offline presence tracking

**Architecture:**
```
Client (WebSocket) → STOMP Broker → Message Handler → Database
                                    ↓
                              Broadcast to Subscribers
```

**Why WebSocket over HTTP polling?**
> WebSocket maintains a persistent connection, allowing the server to push updates instantly instead of the client constantly asking — reducing server load significantly.

---

### Module 4: Code Snippet Sharing

**Implementation:**
- Message has `type`: `TEXT` or `CODE`
- `CODE` messages include `language` field
- Frontend renders with syntax highlighting (Prism.js/react-syntax-highlighter)

```json
{
  "type": "CODE",
  "language": "java",
  "content": "public class Main { ... }",
  "channelId": "channelId"
}
```

---

### Module 5: AI Coding Assistant

**Features:**
- Gemini API integration via backend (protects API key)
- Rate limiting per user
- Conversation history storage
- Beginner-friendly prompts

**Flow:**
```
User Question → Backend → Gemini API → Response → Frontend
```

**Backend Prompt Structure:**
```
You are a coding assistant helping a developer debug their code.
Be concise, practical, and beginner-friendly.
User question: [input]
Code: [pasted code if any]
```

---

### Module 6: Task Management

**Features:**
- Create tasks with title, description, assignee, due date
- Status workflow: TODO → IN_PROGRESS → DONE
- Only OWNER can delete tasks
- Tasks scoped to workspace

---

### Notifications

**Implementation:**
- WebSocket push for real-time notification delivery
- Events: new message, task assigned, AI response ready
- Frontend displays toast/badges

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get JWT |

### Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/workspaces` | Create workspace |
| `GET` | `/api/workspaces` | List user's workspaces |
| `POST` | `/api/workspaces/join` | Join via invite code |
| `DELETE` | `/api/workspaces/{id}` | Delete (OWNER only) |

### Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/workspaces/{id}/channels` | Create channel |
| `GET` | `/api/workspaces/{id}/channels` | List channels |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/channels/{id}/messages` | Get message history (paginated) |
| `POST` | `/api/channels/{id}/messages` | Send message |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/workspaces/{id}/tasks` | Create task |
| `GET` | `/api/workspaces/{id}/tasks` | List tasks |
| `PUT` | `/api/tasks/{id}` | Update task status |
| `DELETE` | `/api/tasks/{id}` | Delete task (OWNER only) |

### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/chat` | Send question to Gemini |

---

## 🗄 Database Schema

### Core Tables

- **users** — id, name, email, password_hash, created_at
- **workspaces** — id, name, invite_code, owner_id, created_at
- **user_workspaces** — user_id, workspace_id, role (OWNER/MEMBER)
- **channels** — id, name, workspace_id, created_at
- **messages** — id, content, type (TEXT/CODE), language, channel_id, user_id, created_at
- **tasks** — id, title, description, status, assignee_id, workspace_id, due_date, created_at

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Spring Boot & Spring Security documentation
- STOMP over WebSocket protocol
- Google Gemini API
- React & Vite communities

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/PrashantBhanage">PrashantBhanage</a>
</p>


