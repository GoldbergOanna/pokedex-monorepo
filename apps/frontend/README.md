# 🧩 Pokédex UI (Angular 19)

A modern **Angular 19 frontend application** for the Pokédex project.  
Implements a reactive, type-safe UI using **Angular Signals**, **RxJS**, **Angular Material**, and **route guards** for secure navigation.  
Built for scalability, strict typing, and clean separation of concerns.

---

## 📘 Overview

The Pokédex UI allows authenticated users to:

- Browse and search Pokémon using **server-side pagination**  
- Filter Pokémon by **type** or **description**  
- View detailed Pokémon stats and evolution chains  
- Mark Pokémon as **owned** (syncing ownership with evolutions)  
- Access protected routes only after authentication  

The frontend communicates with a REST API exposed by the backend service and is fully typed via shared interfaces.

---

## 🧠 Low-Level Design & Architecture
```text
apps/frontend/
├─ src/
│  ├─ app/
│  │  ├─ core/           # Core providers: auth, interceptors, guards
│  │  ├─ features/
│  │  │  ├─ auth/        # Login, register, token handling
│  │  │  ├─ pokedex/     # Pokémon list, filters, pagination
│  │  │  ├─ detail/      # Pokémon detail view
│  │  │  └─ collection/  # Owned Pokémon list
│  │  ├─ shared/         # Common UI components and models
│  │  └─ app.config.ts   # App bootstrap & route configuration
│  └─ main.ts

```

### **Core Design Principles**

- **Standalone Components** – modular, fast, no NgModules overhead.  
- **Signals + Computed()** – declarative UI reactivity for derived state.  
- **RxJS Service Layer (State Management)** –  
  a centralized reactive store built on `BehaviorSubject` and `combineLatest`, managing pagination, filters, ownership state, and caching.  
- **Authentication Guard + Interceptor** –  
  guards protect feature routes post-login; interceptor injects JWT tokens and triggers refresh logic when tokens expire.  
- **Persistent Authentication** –  
  tokens stored in `localStorage` and refreshed automatically to maintain sessions.  
- **Reusable Paginator Component** –  
  a shared component wrapping `MatPaginator` for unified pagination behavior across the app.  
- **Local Caching Layer** –  
  the service layer caches recent Pokémon pages and filters to reduce API calls.  
- **Angular Material** –  
  consistent, accessible UI patterns with responsive SCSS.  
- **Strict Typing** –  
  shared DTOs and models from `@pokedex/shared-types` ensure compile-time safety across UI and backend.

This structure keeps components **stateless and declarative**, routes **secure**, and state **predictable and testable**.

---

## 🧩 UI Features

| Feature | Description |
|----------|-------------|
| **Authentication Guard** | Protects all routes beyond login/register; redirects unauthenticated users. |
| **Persistent Session** | Refresh tokens maintain login state after reload. |
| **Pagination** | Unified paginator component triggers API updates. |
| **Search & Filter** | Reactive service layer streams update instantly. |
| **Local Caching** | Previously viewed pages are cached for quick reloads. |
| **Signals** | Computed UI state for clean, reactive data flow. |
| **Material Design** | Responsive layout built with Angular Material. |
| **Type Safety** | Shared interfaces from `@pokedex/shared-types`. |

---

## 🧰 Tooling

| Tool | Purpose |
|------|----------|
| **Angular 19** | Modern standalone architecture with Signals |
| **RxJS 7+** | Reactive data and lightweight state management |
| **Angular Material 17+** | UI library for pagination and layouts |
| **TypeScript 5.6+** | Strict typing and modern syntax |
| **Prettier + ESLint** | Consistent formatting and linting |
| **Jest + Angular Testing Library** | Fast, reliable unit testing framework |

---

## 🧪 Running the UI App

### Prerequisites
- Node ≥ 20  
- pnpm ≥ 9  
- Backend API running at `http://localhost:3000`

### Commands
```bash
# Install dependencies (from repo root)
pnpm install

# Start only the frontend
pnpm --filter frontend start

# Build for production
pnpm --filter frontend build
Default Dev URL:
👉 http://localhost:4200

🧾 Environment Variables
Create a .env file in /apps/frontend:

bash

API_URL=http://localhost:3000
Used in environment.ts for all HTTP communication.

🧩 Future Improvements
Complete AuthService + Refresh Token flow

Integrate custom reusable paginator component across features

Add local caching layer for Pokémon pages

Configure Jest + Angular Testing Library for unit tests

Implement dark mode and improve accessibility

🧱 Summary
A clean, reactive, and maintainable Angular 19 SPA featuring:

Signals + RxJS for state and data management

Secure route guards and persistent authentication

Reusable pagination and local caching

Type-safe models shared with backend

Modular, testable, and scalable architecture
