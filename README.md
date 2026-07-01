# QuizMaster

QuizMaster is a full-stack, enterprise-grade quiz application featuring a **Java Spring Boot** backend engine, a responsive **Vite + React** frontend interface, and a **PostgreSQL** database managed via Flyway database migrations. The platform supports student quiz execution with active timers, automated answer evaluation, scoreboards, and administrative controls for quiz generation and CSV-based question bulk uploads.

---

## 🚀 Tech Stack

### Backend Engine
* **Language & Framework:** Java 17 / 21, Spring Boot 3.x
* **Security & Auth:** Spring Security, JWT (JSON Web Tokens), Validation API
* **Data Layer:** Spring Data JPA, Hibernate, PostgreSQL Driver
* **Migrations:** Flyway DB (`db/migration`)
* **Build Tool:** Maven / Gradle

### Frontend Portal
* **Tooling & Engine:** Vite, React 18, React Router DOM
* **State & Network:** React Context API, Custom Hooks, Axios (with Bearer Token Interceptors)
* **Styling & Charts:** Tailwind CSS, Recharts

### Infrastructure
* **Database:** PostgreSQL

---

## 📁 Repository Structure

```text
QuizMaster/
├── backend/
│   └── src/main/
│       ├── java/com/quizmaster/
│       │   ├── config/         # System configurations (Security, CORS, Web)
│       │   ├── controller/     # REST Endpoints (Auth, Quizzes, Attempts, API Layer)
│       │   ├── dto/            # Data Transfer Objects for Request/Response payloads
│       │   ├── entity/         # JPA Database Entities
│       │   ├── exception/      # Global Exception Handlers & Custom Exceptions
│       │   ├── mapper/         # Object-to-Object transformation layer (Entities <-> DTOs)
│       │   ├── repository/     # Spring Data JPA Repositories (Database Access)
│       │   ├── service/        # Core Business Logic Layer
│       │   ├── scheduler/      # Automated Background Tasks & Cron jobs
│       │   ├── security/       # JWT Filters, UserDetailsService, and Password Encoders
│       │   ├── util/           # Common utilities (JWT tokens, String manipulation)
│       │   └── validation/     # Custom Validation annotations and helpers
│       └── resources/
│           └── db/migration/   # Flyway SQL versioned migration scripts
└── frontend/
    └── src/
        ├── assets/             # Images, logos, and global static styles
        ├── components/         # Reusable UI Atoms and Molecules (Cards, Navbars, Charts)
        ├── constants/          # Application-wide static rules and Route definitions
        ├── context/            # Shared Application State (Authentication, Active Session)
        ├── hooks/              # Custom React Hooks (useAuth, contextual wrappers)
        ├── layouts/            # Page shell wrappers (Admin shells, Student layout structures)
        ├── pages/              # Primary view compositions and route destinations
        ├── routes/             # App Routing registry and Protected Route blocks
        ├── services/           # Axios network configurations and API client modules
        └── utils/              # Data parsing, formatting helpers, and Axios instances
