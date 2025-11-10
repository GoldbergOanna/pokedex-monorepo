# Pokédex Application

A full-stack TypeScript monorepo application for browsing and collecting Pokémon. Built with Angular 19 (frontend), Hono.js (backend), PostgreSQL, and Docker.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [AI Tool Usage](#ai-tool-usage)

## Features

### Core Requirements (From Task)

✅ **Authentication System**
- User registration with validation
- JWT-based login (1-hour expiration)
- Secure password hashing with bcrypt
- Protected routes with auth guards and interceptors

✅ **Pokémon Browsing**
- Paginated list of all Pokémon (20 per page)
- Search by name
- Filter by type, evolution tier, and description
- Click to view detailed information
- High-quality images and stats display

✅ **Ownership Management**
- Mark Pokémon as owned/released
- **Evolution rule**: Catching an evolved Pokémon automatically marks all pre-evolution forms as owned
- Real-time UI updates across cached pages
- Personal collection view

✅ **Architecture**
- **Modular layered architecture** with clear separation of concerns
- API layer (routes, controllers, validation)
- Service layer (business logic, evolution management)
- Repository layer (data access abstraction)
- Dependency injection throughout backend
- Standalone components in frontend (no NgModules)

✅ **Database**
- PostgreSQL 16 in Docker
- Type-safe queries
- Foreign key constraints
- Efficient ownership tracking

✅ **DevOps**
- Full Docker Compose setup
- One-command startup: `docker compose up`
- Environment variable configuration
- Database initialization script

### Extra Features (Beyond Requirements)

⭐ **Enhanced Type Safety**
- Centralized type definitions in shared package (`@pokedex/shared-types`)
- Strong typing across frontend and backend
- Zod schema validation for API requests

⭐ **Advanced Frontend Architecture**
- Angular 19 with Signals for reactive state management
- RxJS for async operations and caching
- Smart/Dumb component pattern
- HTTP interceptor with automatic token refresh on 401
- Client-side caching for improved performance

⭐ **Evolution Chain Visualization**
- Complete evolution chain display on detail pages
- Recursive evolution relationship mapping
- Visual indicators for owned Pokémon in chain

⭐ **Request Logging**
- Structured logging for each HTTP request (method, path, status, duration)
- Error tracking and debugging support

⭐ **Code Quality**
- ESLint + Prettier for consistent code style
- Git hooks with Husky and lint-staged
- Jest for unit testing
- TypeScript strict mode enabled

## Architecture

### Backend Architecture (Hono.js)

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Requests                            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  API Layer (Routes)                                          │
│  • /auth/register, /auth/login                              │
│  • /pokedex (list with filters), /pokedex/:id (detail)     │
│  • /me/collection, /me/collection/:id/toggle                │
│  • Zod validation, JWT middleware                           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Service Layer (Business Logic)                              │
│  • PokemonService: data composition, evolution chains        │
│  • OwnershipService: toggle logic, pre-evolution marking    │
│  • Evolution utilities: recursive relationship traversal    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Repository Layer (Data Access)                              │
│  • PokemonRepository: filtering, pagination                  │
│  • OwnershipRepository: ownership queries                    │
│  • Abstracted database access (easy to swap DB)             │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                         │
│  • users, pokemon, owned_pokemon tables                      │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Patterns:**
- **Dependency Injection**: Services receive dependencies via constructor
- **Repository Pattern**: Data access abstracted from business logic
- **Middleware Pattern**: Auth middleware injects userId into context
- **Type Safety**: TypeScript interfaces and Zod validation throughout

### Frontend Architecture (Angular 19)

```
┌─────────────────────────────────────────────────────────────┐
│  Pages (Smart Components)                                    │
│  • LoginComponent: registration/login forms                  │
│  • PokedexComponent: list with filters and pagination       │
│  • PokemonDetailsComponent: detail view with evolution      │
│  • TrainerComponent: user profile                           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Core Services (Singleton)                                   │
│  • AuthService: login, registration, token management       │
│  • PokemonService: reactive state with Signals + RxJS       │
│  • ApiService: HTTP client wrapper                          │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Shared Components (Dumb/Presentational)                     │
│  • CardsListComponent: reusable paginated list               │
│  • PokemonCardComponent: individual card UI                  │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Guards & Interceptors                                       │
│  • AuthGuard: route protection                               │
│  • AuthInterceptor: token injection, 401 handling           │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Patterns:**
- **Standalone Components**: No NgModule overhead (Angular 19+)
- **Reactive State Management**: Signals + RxJS BehaviorSubject
- **Smart/Dumb Components**: Pages fetch data, shared components present
- **Dependency Injection**: Angular DI for services
- **Caching**: In-memory cache for API responses

## Project Structure

```
pokedex/
├── apps/
│   ├── backend/                 # Hono.js REST API
│   │   ├── src/
│   │   │   ├── index.ts         # Server entry point
│   │   │   ├── db.ts            # PostgreSQL connection pool
│   │   │   ├── init-db.ts       # Database initialization script
│   │   │   ├── env.ts           # Environment variables
│   │   │   ├── routes/          # API endpoints
│   │   │   │   ├── auth.ts      # POST /auth/register, /auth/login
│   │   │   │   ├── pokedex.ts   # GET /pokedex, /pokedex/:id
│   │   │   │   └── collection.ts # GET/POST /me/collection
│   │   │   ├── services/        # Business logic
│   │   │   │   ├── pokemon.service.ts
│   │   │   │   └── ownership.service.ts
│   │   │   ├── repositories/    # Data access
│   │   │   │   ├── pokemon.repo.ts
│   │   │   │   └── ownership.repo.ts
│   │   │   ├── middleware/      # HTTP middleware
│   │   │   │   └── auth.middleware.ts
│   │   │   ├── models/          # Context types
│   │   │   │   └── context.types.ts
│   │   │   ├── utils/           # Utilities
│   │   │   │   ├── evolution.utils.ts
│   │   │   │   └── evolution.map.ts
│   │   │   └── data/
│   │   │       └── Pokedex.json # Pokemon seed data
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                # Angular 19 SPA
│       ├── src/
│       │   ├── app/
│       │   │   ├── pages/       # Route components (smart)
│       │   │   │   ├── login/
│       │   │   │   ├── pokedex/
│       │   │   │   ├── pokemon-details/
│       │   │   │   └── trainer/
│       │   │   ├── core/        # Singleton services
│       │   │   │   ├── auth/
│       │   │   │   │   ├── service/auth.service.ts
│       │   │   │   │   ├── guard/auth.guard.ts
│       │   │   │   │   └── interceptor/auth.interceptor.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── pokemon.service.ts
│       │   │   │   └── api/
│       │   │   │       └── api.service.ts
│       │   │   ├── shared/      # Reusable components (dumb)
│       │   │   │   ├── cards-list/
│       │   │   │   └── pokemon-card/
│       │   │   ├── app.routes.ts
│       │   │   └── app.config.ts
│       │   └── environments/
│       ├── Dockerfile
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
├── libs/
│   └── shared-types/            # Shared TypeScript types
│       ├── src/
│       │   ├── pokemon.types.ts
│       │   ├── auth.types.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker-compose.yml           # Container orchestration
├── pnpm-workspace.yaml          # Monorepo configuration
├── tsconfig.base.json           # Base TypeScript config
├── package.json                 # Root workspace config
├── .env.example                 # Environment variable template
└── README.md                    # This file
```

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Hono.js 4.x
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Raw SQL with pg
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod 4.x
- **Password Hashing**: bcrypt
- **Pagination**: Server-side pagination with page and limit query params

### Frontend

- **Framework**: Angular 19
- **State Management**: Angular Signals + RxJS
- **HTTP Client**: Angular HttpClient
- **Build Tool**: Vite (via Angular CLI)
- **Styling**: SCSS
- **Routing**: Angular Router with guards
- **Caching**: Client-side caching for improved performance
- **Auth**: JWT refresh on 401 via interceptor
- **Pagination**: Client-side pagination handling with state management

### DevOps & Tools

- **Package Manager**: pnpm (workspaces)
- **Containerization**: Docker + Docker Compose
- **Linting**: ESLint + @typescript-eslint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Testing**: Jest (unit tests)
- **TypeScript**: Strict mode enabled across the entire monorepo

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm 8+ (install via `npm install -g pnpm`)

### Spinning up the project

```bash
pnpm dev
```

This command starts the backend, frontend, and database all together.

## API Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user and receive JWT token
- `GET /pokedex` - Get paginated list of Pokémon with filters (search, type, tier, description)
- `GET /pokedex/:id` - Get detailed information about a specific Pokémon
- `GET /me/collection` - Get list of Pokémon IDs owned by the authenticated user
- `POST /me/collection/:pokemonId/toggle` - Toggle ownership status of a Pokémon

## Development

### Running Tests

```bash
# Backend tests
cd apps/backend
pnpm test

# Frontend tests
cd apps/frontend
pnpm test
```

### Linting & Formatting

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# Auto-fix linting issues
pnpm lint:fix
```

### Building for Production

```bash
# Build backend
cd apps/backend
pnpm build

# Build frontend
cd apps/frontend
pnpm build
```

### Database Management

```bash
# Re-initialize database (WARNING: drops all data)
cd apps/backend
pnpm run init-db

# Connect to database
docker compose exec db psql -U pokemon -d pokedex
```

## AI Tool Usage

This project was developed with assistance from AI tools for the following tasks:

### 1. **Unit Testing**
- AI-assisted generation of Jest test suites for services and components
- Test case design for authentication flows, ownership logic, and API endpoints
- Mock data generation and test fixtures

### 2. **CSS Styling**
- Component styling with SCSS
- Responsive layout design
- Basic UI animations (hover effects, transitions)
- Color scheme and visual consistency

### 3. **Error Handling & Debugging**
- Identifying and fixing TypeScript compilation errors
- Resolving dependency conflicts
- Debugging async/await issues in backend services
- Fixing HTTP interceptor and guard issues in Angular

### 4. **Code Generation**
- Boilerplate code for Angular components and services
- Repository pattern implementation
- Zod validation schemas
- Docker configuration files
- Documentation

**Important Notes:**
- All AI-generated code has been reviewed, tested, and understood by the developer
- AI was used as a productivity tool, not as a replacement for understanding
- Core architecture decisions and business logic were designed by the developer
- The developer can explain and modify any part of the codebase

## License

This project was created as a technical assessment for Monto.

## Contact

For questions or issues, please contact the repository owner.
