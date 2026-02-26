# 🚀 AI Student Hub: Complete Product Architecture & Engineering Design

This document serves as the master blueprint for the **AI Student Hub**. It is designed from the perspective of a Senior Product Architect, UI/UX Designer, Security Expert, and Systems Engineer to ensure the system is built as a highly scalable, production-ready startup product, not a basic college project.

---

## 1️⃣ PROJECT OVERVIEW

### Core Vision
To build a singular, highly contextual, AI-driven workspace that unifies the fragmented digital tools students use daily. The platform eliminates context-switching by combining AI study assistants, code compilation, resume building, and interview prep into one seamless, zero-reload ecosystem.

### Target Users
*   **University Students:** Seeking automated note-taking, assignment help, and organized study materials.
*   **Computer Science & Bootcamp Students:** Requiring an integrated code assistant (Dev-C++ 5.11), algorithmic help, and coding interview prep.
*   **Job Seekers:** Needing ATS-optimized resumes and mock interview practice.

### Complete Feature List
1.  **Dashboard Hub:** Centralized landing area with quick-access tool cards and recent activity.
2.  **AI Chat Assistant:** Context-aware LLM interface for general academic queries.
3.  **Smart Notes Generator:** Converts uploaded PDFs or YouTube links into structured, Cornell-style Markdown notes.
4.  **Code Assistant:** In-browser IDE integrated with local Dev-C++ 5.11 via WebSockets for real-time compilation and AI-driven linting/suggestions.
5.  **Resume Builder:** Dynamic, ATS-scoring resume generator based on job descriptions.
6.  **Interview Simulator:** AI-driven mock interviews using the STAR method.
7.  **Smart Search:** Unified vector search across all past chats, generated notes, and saved code.

### User Flow
`Landing Page (Marketing) → Signup/Login → Onboarding (Optional Profile Setup) → Main Dashboard → Click Tool (Zero-Reload SPA Transition) → Tool Interface → Auto-Save to DB → Return to Dashboard.`

---

## 2️⃣ SYSTEM ARCHITECTURE

The platform uses a **Modular Monolith** approach on the backend, communicating with a **Single Page Application (SPA)** frontend, preparing for a future microservices evolution.

### High-Level Architecture Diagram

```mermaid
graph TD
    Client[Next.js Frontend (SPA)]
    API_Gateway[Nginx / API Gateway]
    Client -->|HTTPS/REST/GraphQL| API_Gateway
    Client -->|WebSockets| Code_Service
    
    API_Gateway --> Auth_Service[Auth & Profile Layer]
    API_Gateway --> Core_API[Express.js Core Business Logic]
    
    Core_API --> AI_Logic[LangChain / AI Service]
    Core_API --> DB[(MongoDB - Primary Store)]
    Core_API --> Redis[(Redis - Caching & Sessions)]
    
    AI_Logic --> OpenAI[LLM APIs (OpenAI/Anthropic)]
    AI_Logic --> Pinecone[(Pinecone Vector DB)]
    
    Code_Service[Local/Cloud Compiler Daemon] --> DevCpp[Dev-C++ 5.11 Core]
```

### Low-Level Component Breakdown
*   **Frontend Tier:** Next.js (App Router) managing UI, caching, and routing.
*   **Backend Tier:** Node.js + Express handling RESTful endpoints, business logic, and WebSocket handshakes.
*   **Database Tier:** MongoDB (NoSQL) for unstructured user data; Redis for high-speed caching and rate-limiting.
*   **AI Tier:** LangChain acts as the orchestrator to format prompts, handle RAG (Retrieval), and interact with external LLMs.

---

## 3️⃣ TECH STACK WITH JUSTIFICATION

| Category | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (React) | Provides Server-Side Rendering (SSR) for fast initial loads, excellent SEO for the landing page, and App Router for seamless SPA transitions. |
| **UI Component Library** | Tailwind CSS + Shadcn UI | Tailwind ensures zero-bloat modular styling. Shadcn provides accessible, unstyled, enterprise-grade baseline components. |
| **State Management** | Zustand + React Query | Zustand for lightweight synchronous client state (theme, sidebar toggle). React Query for server-state caching, automatic retries, and background refetching. |
| **Backend Framework** | Node.js + Express | Highly scalable asynchronous event-driven architecture. Huge ecosystem for AI libraries (LangChain JS). |
| **Database** | MongoDB + Mongoose | Perfect for storing highly dynamic, schema-less data like JSON chat histories, flexible resume structures, and hierarchical notes. |
| **Caching / Queues** | Redis + BullMQ | Redis handles JWT blocklisting and rate-limiting. BullMQ manages heavy background tasks (e.g., parsing a 100-page PDF). |
| **Real-Time Comm.** | Socket.io / WebSockets | Required for streaming AI responses token-by-token and maintaining the persistent tunnel with Dev-C++ 5.11. |

---

## 4️⃣ UI / UX DESIGN SYSTEM

Designed with a **"Focus & Flow"** philosophy. The interface must feel like a premium hybrid of Linear, Vercel, and Notion.

### Visual Language
*   **Color Palette:**
    *   *Primary (Brand):* Electric Indigo (`#4F46E5`)
    *   *Accent:* Teal Splash (`#14B8A6`)
    *   *Light Mode Surface:* Pure White (`#FFFFFF`) with Off-White (`#F8FAFC`) background.
    *   *Dark Mode Surface:* Glassy Slate (`#1E293B`) with Midnight Navy (`#020617`) background.
*   **Typography:**
    *   *Headings/Logos:* **`Outfit`** (Clean, startup-ready geometric sans-serif).
    *   *Body/UI:* **`Inter`** (Optimal legibility at small sizes).
    *   *Code:* **`JetBrains Mono`** (Beautiful ligatures).
*   **Spacing System:** Uses an 8pt grid system. (e.g., 8px, 16px, 24px, 32px padding/margins) to ensure mathematical alignment.
*   **Micro-interactions:** Buttons scale to `0.97` on click. Tool cards lift by `-4px` with an expanded shadow on hover.

### Page Layout Structure
*   **Dashboard:** 250px Collapsible Sidebar (Nav) + Top Navbar (Smart Search, Theme Toggle, Profile) + Main Content Fluid Grid.
*   **Skeleton Screens:** "Pulse Skeletons" mimic exact page layouts during API fetches instead of generic spinning circles.

---

## 5️⃣ FRONTEND ARCHITECTURE

The frontend is a strictly typed React application utilizing a Feature-Sliced folder structure.

### Folder Structure
```text
src/
├── app/                  # Next.js App Router (Pages, Layouts)
│   ├── (auth)/login/     # Auth routes
│   └── (dashboard)/      # Protected workspace
├── components/           # Global UI components
│   ├── ui/               # Shadcn primitives (Buttons, Inputs)
│   └── shared/           # Loading screens, Navigation bars
├── features/             # Domain logic (The Core Modules)
│   ├── chat/
│   ├── notes-generator/
│   └── code-editor/
├── hooks/                # Custom React Hooks
├── store/                # Zustand State Stores
└── lib/                  # Axios instances, utilities
```

### Core Mechanisms
*   **SPA Navigation:** Next.js `<Link>` component pre-fetches pages. Navigating from "Chat" to "Code" replaces the main content component without reloading the Sidebar, Navbar, or browser window.
*   **Lazy Loading Strategy:** Heavy components like the `Monaco Code Editor` or `PDF.js Viewer` are dynamically imported (`next/dynamic`) and deferred until the exact moment the user clicks the respective tool.

---

## 6️⃣ BACKEND ARCHITECTURE

The backend follows a strict **Service-Oriented Architecture (SOA)** pattern to decouple logic from HTTP transport, making it highly testable.

### Folder Structure
```text
server/
├── src/
│   ├── controllers/      # Extract HTTP Req/Res, pass to services
│   ├── services/         # Core business logic & DB calls
│   ├── routes/           # Express Router definitions
│   ├── models/           # Mongoose Schemas definitions
│   ├── middlewares/      # Auth, Error processing, Rate limiting
│   ├── utils/            # Hashers, token generators
│   └── config/           # Environment and DB connection setup
```

### Flow Example (Updating Name):
1.  **Route:** `PUT /api/users/profile` triggers `updateProfileController`.
2.  **Middleware:** `requireAuth` validates JWT. `validateBody` (Zod/Joi) ensures name format is correct.
3.  **Controller:** Extracts `req.body.name` and calls `UserService.updateName(userId, name)`.
4.  **Service:** Interacts with `UserModel.findByIdAndUpdate()`. Returns updated user.
5.  **Controller:** Sends HTTP 200 JSON response to frontend.

---

## 7️⃣ DATABASE DESIGN (MongoDB)

### 1. `users` Collection
```json
{
  "_id": "ObjectId",
  "email": "student@gmail.com", // Indexed, Unique
  "passwordHash": "$2b$10$...",
  "displayName": "Alex",
  "role": "student",
  "refreshTokenActive": "token_string", 
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2. `notes` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId(User)", // Indexed
  "title": "Data Structures - Trees",
  "sourceType": "pdf | youtube",
  "originalSourceUrl": "s3://url...",
  "markdownContent": "## Binary Trees \n...",
  "tags": ["CS101", "Algorithms"] // Indexed for fast search
}
```

### Scalability Strategy
*   **Indexes:** Compound indexes applied to queries involving `userId` and `createdAt` (e.g., fetching a user's recent notes).
*   **Pagination:** Cursor-based pagination for chat history to prevent heavy memory usage on large query results.

---

## 8️⃣ AUTHENTICATION & 24-HOUR PERSISTENT LOGIN

Implements industry-standard stateless JWT Authentication with dual tokens.

### The Flow
1.  **Login:** User authenticates. Backend generates:
    *   `AccessToken` (JWT, Expires in 15 mins).
    *   `RefreshToken` (JWT, Expires in 24 hours).
2.  **Storage:**
    *   `AccessToken` is sent in the JSON payload and stored in **React Memory** (Zustand variable). This prevents XSS attacks (JS cannot be scraped from memory).
    *   `RefreshToken` is set exclusively via an **HTTP-Only, Secure, SameSite=Strict Cookie**. The JS runtime cannot read it.
3.  **API Requests:** Frontend attaches `AccessToken` via Axios Interceptor to the `Authorization: Bearer` header.
4.  **Seamless Refresh (Zero Login Prompts):**
    *   When the 15-minute `AccessToken` expires, the backend throws a `401 Unauthorized`.
    *   The Axios Response Interceptor catches the 401, pauses the request, and hits the `/api/auth/refresh` endpoint in the background.
    *   The browser automatically includes the HTTP-Only `RefreshToken` cookie.
    *   Backend issues a new `AccessToken`. Axios interceptor resumes the paused request. The user notices nothing.
5.  **24-Hour Expiration:** If 24 hours pass, the `RefreshToken` cookie expires. The refresh endpoint fails, and the frontend forcefully redirects to `/login`.

---

## 9️⃣ PERFORMANCE & SCALABILITY

1.  **Code Splitting:** Rely heavily on Next.js automatic Webpack chunking. Only the JS required for the current view is sent over the network.
2.  **CDN Caching:** Static assets (images, standard CSS) served via AWS CloudFront or Vercel Edge Network.
3.  **Database Connection Pooling:** Mongoose configured with a connection pool size of 100 to handle concurrent user requests without waiting for TCP handshakes.
4.  **Background Processing:** Any request taking longer than 1 second (e.g., generating 5 pages of AI notes) is handed off to BullMQ. The server responds `202 Accepted` immediately, and the client polls or listens to a WebSocket for completion.

---

## 🔟 SECURITY IMPLEMENTATION

*   **Password Hashing:** `bcryptjs` with a cost/salt factor of 10.
*   **Input Sanitization:** Comprehensive `Zod` validation on all Express routes. `express-mongo-sanitize` middleware to prevent NoSQL Injection (stripping `$` operators from request bodies).
*   **Rate Limiting:** `express-rate-limit` backed by Redis. E.g., Maximum 5 login attempts per IP per 10 minutes. 50 AI requests per user per hour to prevent API bankruptcy.
*   **CORS:** Strictly configured to only allow requests from the specific production frontend domain.
*   **Helmet:** Express middleware injecting secure HTTP headers (HSTS, Content Security Policy).

---

## 1️⃣1️⃣ EXTRA STARTUP-LEVEL FEATURES

*   **Global Command Palette `(Ctrl/Cmd + K)`:** A Spotlight-like search unifies navigation. Typying "React" instantly shows chat logs mentioning React, Notes titled React, and quick-links to the React Code Environment.
*   **Real-time Notifications:** WebSockets push alerts like "Your AI Resume Analysis is complete."
*   **Activity Heatmap:** A GitHub-style contribution graph on the profile page showing active study/coding days to gamify learning.

---

## 1️⃣2️⃣ STEP-BY-STEP IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Days 1-3)
1. Initialize GitHub repo. Setup Monorepo or separate front/back folders.
2. Configure **Next.js 14**, Tailwind, Shadcn CLI.
3. Setup **Node.js, Express**, Connect to MongoDB.
4. Build the UI/UX Design System (Typography, Colors, Base Components).

### Phase 2: Auth & Core Hub (Days 4-7)
1. Build `UserModel` and Auth Controllers.
2. Implement dual-token JWT logic + HTTP-Only Cookies.
3. Build Login/Signup UI with React Hook Form + Zod.
4. Create Dashboard Layout (Sidebar, Protected Route Middleware).

### Phase 3: AI Modules (Days 8-14)
1. Setup OpenAI/LangChain connection on backend.
2. Build **Chat Assistant** (streaming UI, Markdown rendering).
3. Build **Notes Generator** (File upload → Text Extract → AI Summarize).
4. Implement Zustand store to retain active chat context.

### Phase 4: Dev-C++ 5.11 Integration (Days 15-18)
1. Create a lightweight Node daemon script to run locally on the user's PC.
2. Establish WebSocket connection from Web UI → Cloud Backend → Local Daemon.
3. Integrate Monaco Editor in Next.js.
4. Pipe Monaco code → Daemon → `g++.exe` → Read stdout → Pipe back to UI.

### Phase 5: Polish & Security (Days 19-21)
1. Implement Rate Limiting and Helmet.
2. Add Skeleton loaders, Framer Motion micro-interactions.
3. Perform cross-browser and mobile responsive testing.
4. Dockerize backend. Deploy Frontend to Vercel. Deploy Backend to AWS/Render.

---
*End of Document. This architecture is designed to scale from prototype to 1M+ users effortlessly.*
