# QuizMaster

QuizMaster is a web-based learning and assessment platform that enables students to practice quizzes, receive instant feedback, track learning progress, compete on leaderboards, and receive personalized quiz recommendations. Built as part of the Agile Software Processes course (M.Tech, BITS WILP).

- **Architecture:** 3-Tier Monolithic (React Frontend → Spring Boot Backend → PostgreSQL)
- **Methodology:** Agile Scrum (2 Sprints)
- **Status:** Approved for Development (v1.0)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Backend Controllers & Services](#backend-controllers--services)
- [Frontend Components & API Services](#frontend-components--api-services)
- [Getting Started](#getting-started)

---

## Tech Stack

**Backend**
- Java 17, Spring Boot 3+
- Spring Security, JWT Authentication
- Spring Data JPA, PostgreSQL
- Flyway migrations
- Lombok, Jakarta Validation

**Frontend**
- React (functional components) + Vite
- React Router, Axios
- Tailwind CSS
- Context API for auth state
- Recharts for analytics visualization

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → Neon PostgreSQL
- CI/CD → GitHub Actions

---

## File Structure

### Backend — `backend/src/main`

```
backend/src/main
├── java
│   └── com
│       └── quizmaster
│           ├── config
│           ├── controller
│           ├── dto
│           ├── entity
│           ├── exception
│           ├── mapper
│           ├── repository
│           ├── service
│           ├── scheduler
│           ├── security
│           ├── util
│           └── validation
└── resources
    └── db
        └── migration
```

### Frontend — `frontend/src`

```
frontend/src
├── context
├── constants
├── utils
├── styles
├── components
├── layouts
├── hooks
├── assets
├── pages
├── routes
└── services
```

---

## Backend Controllers & Services

### Controllers

**AuthController.java**
| Method | Description |
|---|---|
| `public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request)` | Registers a new user. |
| `public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request)` | Authenticates a user and returns JWT token. |
| `public ResponseEntity<ApiResponse<UserDto>> getProfile()` | Retrieves the profile of the currently authenticated user. |

**AttemptController.java**
| Method | Description |
|---|---|
| `public ResponseEntity<ApiResponse<AttemptResponse>> startAttempt(@Valid @RequestBody AttemptStartRequest request)` | Starts a new quiz attempt for the current user. |
| `public ResponseEntity<ApiResponse<ResultResponse>> submitAttempt(@Valid @RequestBody AttemptSubmitRequest request)` | Submits answers for an attempt and calculates the result. |
| `public ResponseEntity<ApiResponse<List<ResultResponse>>> getAttemptHistory()` | Retrieves the attempt history for the current user. |

**CategoryController.java**
| Method | Description |
|---|---|
| `public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories()` | Retrieves a list of all categories. |
| `public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id)` | Retrieves a specific category by its ID. |
| `public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request)` | Creates a new category (admin only). |
| `public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request)` | Updates an existing category (admin only). |
| `public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id)` | Deletes a category by its ID (admin only). |

**HealthCheckController.java**
| Method | Description |
|---|---|
| `public ResponseEntity<Map<String, String>> health()` | Returns the application health status. |

**QuizController.java**
| Method | Description |
|---|---|
| `public ResponseEntity<ApiResponse<List<QuizResponse>>> getQuizzes()` | Retrieves a list of quizzes (published for students, all for admins). |
| `public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(@PathVariable("id") Long id)` | Retrieves a specific quiz by ID with appropriate authorization. |
| `public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(@Valid @RequestBody QuizRequest request)` | Creates a new quiz (admin only). |
| `public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(@PathVariable("id") Long id, @Valid @RequestBody QuizRequest request)` | Updates an existing quiz (admin only). |
| `public ResponseEntity<ApiResponse<QuizResponse>> publishQuiz(@PathVariable("id") Long id)` | Publishes a quiz making it available for students (admin only). |
| `public ResponseEntity<ApiResponse<QuizResponse>> archiveQuiz(@PathVariable("id") Long id)` | Archives a quiz (admin only). |
| `public ResponseEntity<ApiResponse<Void>> uploadQuestions(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file)` | Uploads questions for a quiz from a CSV file (admin only). |

**ScoringController.java**
| Method | Description |
|---|---|
| `public ResponseEntity<ApiResponse<ResultResponse>> getResult(@PathVariable Long attemptId)` | Retrieves the result for a specific attempt if the user is authorized. |

### Services

**AuthService.java**
| Method | Description |
|---|---|
| `public AuthResponse register(RegisterRequest request)` | Registers a new user, encodes password, and returns JWT token. |
| `public AuthResponse login(LoginRequest request)` | Authenticates user credentials and returns JWT token. |
| `public UserDto getUserProfile(String email)` | Retrieves user details by email. |

**AttemptService.java**
| Method | Description |
|---|---|
| `public AttemptResponse startAttempt(Long userId, Long quizId)` | Creates a new attempt record for the user and quiz. |
| `public ResultResponse submitAttempt(Long userId, Long attemptId, AttemptSubmitRequest request)` | Processes submitted answers, calculates score, and updates the attempt. |
| `public List<ResultResponse> getAttemptHistory(Long userId)` | Retrieves list of past attempts for the user. |

**CategoryService.java**
| Method | Description |
|---|---|
| `public List<CategoryResponse> getAllCategories()` | Returns all categories. |
| `public CategoryResponse getCategoryById(Long id)` | Returns a category by ID. |
| `public CategoryResponse createCategory(CategoryRequest request)` | Creates a new category. |
| `public CategoryResponse updateCategory(Long id, CategoryRequest request)` | Updates an existing category. |
| `public Void deleteCategory(Long id)` | Deletes a category by ID. |

**QuizService.java**
| Method | Description |
|---|---|
| `public List<QuizResponse> getQuizzesForAdmin()` | Returns all quizzes for admin view. |
| `public List<QuizResponse> getQuizzesForStudent()` | Returns only published quizzes for students. |
| `public QuizResponse getQuizById(Long id, boolean isAdmin)` | Returns a quiz by ID with authorization check. |
| `public QuizResponse createQuiz(QuizRequest request, Long createdBy)` | Creates a new quiz. |
| `public QuizResponse updateQuiz(Long id, QuizRequest request)` | Updates an existing quiz. |
| `public QuizResponse publishQuiz(Long id)` | Publishes a quiz. |
| `public QuizResponse archiveQuiz(Long id)` | Archives a quiz. |
| `public Void uploadQuestions(Long id, MultipartFile file)` | Uploads questions for a quiz from a CSV file. |

**ScoringService.java**
| Method | Description |
|---|---|
| `public ResultResponse getResultById(Long attemptId, Long userId)` | Retrieves the result for a specific attempt if the user is authorized. |

---

## Frontend Components & API Services

### Components

| File | Purpose |
|---|---|
| `frontend/src/components/Navbar.jsx` | Displays the navigation bar with user info and links. |
| `frontend/src/components/Layout.jsx` | Provides a common layout wrapper for pages. |
| `frontend/src/components/QuizCard.jsx` | Displays a quiz item with title, description, and actions. |
| `frontend/src/components/QuestionCard.jsx` | Renders a single question with answer options. |
| `frontend/src/components/ResultChart.jsx` | Visualizes quiz results using Recharts. |

### Pages

| File | Purpose |
|---|---|
| `frontend/src/pages/LoginPage.jsx` | Handles user login with form validation and authentication. |
| `frontend/src/pages/RegisterPage.jsx` | Handles user registration with form validation. |
| `frontend/src/pages/Dashboard.jsx` | Shows user's quiz history, recommended quizzes, and notifications. |
| `frontend/src/pages/QuizListPage.jsx` | Lists available quizzes for the student to attempt. |
| `frontend/src/pages/QuizAttemptPage.jsx` | Manages the quiz taking process with timer and answer submission. |
| `frontend/src/pages/ResultPage.jsx` | Displays the quiz result, score, and feedback. |
| `frontend/src/pages/LeaderboardPage.jsx` | Shows top users based on points or scores. |
| `frontend/src/pages/NotificationsPage.jsx` | Lists in-app notifications for the user. |
| `frontend/src/pages/CreateQuizPage.jsx` | Allows admins to create a new quiz and upload questions. |
| `frontend/src/pages/AdminDashboard.jsx` | Provides admin overview of quiz statistics and user activity. |

### Services

| File | Purpose |
|---|---|
| `frontend/src/services/authApi.js` | Handles authentication-related API calls (login, register, profile). |
| `frontend/src/services/quizApi.js` | Manages quiz-related operations (fetch, create, update, publish, archive, upload questions). |
| `frontend/src/services/attemptApi.js` | Handles quiz attempt operations (start, submit, get history). |
| `frontend/src/services/resultApi.js` | Fetches quiz results and detailed analytics. |
| `frontend/src/services/categoryApi.js` | Manages category operations (list, create, update, delete). |

### Context, Hooks, Utils & Routes

| File | Purpose |
|---|---|
| `frontend/src/context/AuthContext.js` | Provides authentication state (user, token) and login/logout functions across the app. |
| `frontend/src/hooks/useAuth.js` | Custom hook to access auth context and perform auth-related actions. |
| `frontend/src/utils/api.js` | Configures Axios instance with base URL and interceptors for token handling. |
| `frontend/src/constants/routes.js` | Defines application route paths and navigation structure. |
| `frontend/src/routes/App.jsx` | Sets up React Router with all page routes and protection. |

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15
- Maven 3.9+

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Flyway migrations run automatically on startup against the configured PostgreSQL database.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Notes

> ⚠️ This README reflects the intended full project structure and API surface as documented for QuizMaster v1.0. Some files/methods listed above may correspond to planned or in-progress work rather than code verified in this session — cross-check against the actual repository contents before relying on this document as a build reference.
