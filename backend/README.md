# Rural LMS Backend - Phase 1

A minimal, text-first Learning Management System backend designed for accessibility and low-bandwidth environments.

## Phase 1 Features

✅ **Implemented:**
- Express.js server with minimal dependencies
- Read-only REST API for courses and lessons
- In-memory mock data (no database yet)
- Health check endpoint
- CORS enabled for frontend integration

❌ **Not Yet Implemented (Phase 2):**
- Database integration
- User authentication and authorization
- Role-based permissions
- Enrollment system
- CRUD operations (create, update, delete)
- Input validation and error handling

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd /home/fate/prj/rural-lms/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if you want to change the port (default: 3000)

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Rural LMS API is running",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development"
}
```

---

### Get All Courses
```bash
GET /api/courses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Introduction to Web Development",
      "description": "Learn the basics of HTML, CSS, and JavaScript...",
      "instructor_id": 1,
      "is_published": true,
      "lesson_count": 3,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 3
}
```

---

### Get Single Course (with lessons)
```bash
GET /api/courses/:id
```

**Example:**
```bash
curl http://localhost:3000/api/courses/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Introduction to Web Development",
    "description": "Learn the basics of HTML, CSS, and JavaScript...",
    "instructor_id": 1,
    "is_published": true,
    "lessons": [
      {
        "id": 1,
        "course_id": 1,
        "title": "What is the Web?",
        "content": "The World Wide Web...",
        "order_index": 1
      }
    ]
  }
}
```

---

### Get Single Lesson
```bash
GET /api/lessons/:id
```

**Example:**
```bash
curl http://localhost:3000/api/lessons/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "course_id": 1,
    "title": "What is the Web?",
    "content": "The World Wide Web is a system...",
    "order_index": 1,
    "course_title": "Introduction to Web Development"
  }
}
```

---

### Authentication Endpoints (Placeholder)
```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

**Response (all auth endpoints):**
```json
{
  "success": false,
  "error": "Authentication not implemented yet (Phase 2)",
  "message": "User login will be available in Phase 2"
}
```

## Testing with curl

```bash
# Health check
curl http://localhost:3000/health

# Get all courses
curl http://localhost:3000/api/courses

# Get specific course
curl http://localhost:3000/api/courses/1

# Get specific lesson
curl http://localhost:3000/api/lessons/1

# Try auth (will return 501)
curl -X POST http://localhost:3000/api/auth/login
```

## Project Structure

```
backend/
├── src/
│   ├── data/
│   │   └── mockData.js          # In-memory courses and lessons
│   ├── routes/
│   │   ├── auth.js              # [PLACEHOLDER] Auth routes
│   │   ├── courses.js           # Course routes
│   │   └── lessons.js           # Lesson routes
│   ├── controllers/
│   │   ├── courseController.js  # Course logic
│   │   └── lessonController.js  # Lesson logic
│   └── server.js                # Express app entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Mock Data

The system includes 3 sample courses:
1. **Introduction to Web Development** (3 lessons)
2. **Basic Computer Literacy** (2 lessons)
3. **English Grammar Fundamentals** (2 lessons)

All data is stored in `src/data/mockData.js` and will be replaced with database queries in Phase 2.

## Next Steps (Phase 2)

- [ ] Set up PostgreSQL/SQLite database
- [ ] Implement user authentication with JWT
- [ ] Add role-based authorization (student/instructor/admin)
- [ ] Implement enrollment system
- [ ] Add CRUD operations for courses and lessons
- [ ] Add input validation and error handling
- [ ] Add security middleware (helmet, rate limiting)
- [ ] Add automated tests

## Contributing

This is Phase 1 - a minimal skeleton. Contributions should focus on:
- Bug fixes
- Documentation improvements
- Clear TODO markers for Phase 2 features

## License

MIT
