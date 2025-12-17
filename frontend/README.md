# Rural LMS Frontend

Minimal React frontend for the Rural LMS, designed for accessibility and low-bandwidth environments.

## Features

✅ **Implemented:**
- React 18 with Vite
- React Router for navigation
- Three main pages: Home, Course, Lesson
- API service layer for backend communication
- Loading and error states
- Minimal, clean CSS styling
- Responsive design

❌ **Not Yet Implemented (Phase 3):**
- User authentication
- Enrollment functionality
- Progress tracking
- Advanced state management
- Offline support

## Prerequisites

- Node.js 18+ (LTS recommended)
- Backend server running on `http://localhost:3000`

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd /home/fate/prj/rural-lms/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx         # Lists all courses
│   │   ├── HomePage.css
│   │   ├── CoursePage.jsx       # Course details + lesson list
│   │   ├── CoursePage.css
│   │   ├── LessonPage.jsx       # Lesson content viewer
│   │   └── LessonPage.css
│   ├── services/
│   │   └── api.js               # Backend API wrapper
│   ├── App.jsx                  # Main app with routing
│   ├── App.css                  # Global styles
│   └── main.jsx                 # Entry point
├── package.json
└── vite.config.js
```

## Pages

### Home Page (`/`)
- Lists all available courses
- Shows course title, description, and lesson count
- Click a course to view details

### Course Page (`/courses/:id`)
- Shows course title and description
- Lists all lessons in order
- Click a lesson to read content
- Back button to return to home

### Lesson Page (`/lessons/:id`)
- Displays lesson title and full text content
- Shows course context
- Back button to return to course

## API Integration

The frontend connects to the backend via the API service layer:

| Frontend Action | Backend Endpoint | Method |
|----------------|------------------|--------|
| Load all courses | `/api/courses` | GET |
| Load course details | `/api/courses/:id` | GET |
| Load lesson content | `/api/lessons/:id` | GET |

### API Service (`src/services/api.js`)

```javascript
import { courseAPI, lessonAPI } from './services/api';

// Get all courses
const courses = await courseAPI.getAll();

// Get course with lessons
const course = await courseAPI.getById(courseId);

// Get single lesson
const lesson = await lessonAPI.getById(lessonId);
```

## Component Structure

### HomePage
- **State**: courses, loading, error
- **Effect**: Fetches all courses on mount
- **Renders**: Course grid with cards

### CoursePage
- **State**: course, loading, error
- **Effect**: Fetches course by ID from URL params
- **Renders**: Course header + lesson list

### LessonPage
- **State**: lesson, loading, error
- **Effect**: Fetches lesson by ID from URL params
- **Renders**: Lesson content with formatted text

## Styling Approach

- **Plain CSS** (no frameworks)
- **CSS Variables** for theming
- **Mobile-first** responsive design
- **Minimal animations** for better performance
- **Text-first** optimized for readability

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Backend Connection

The frontend expects the backend to be running at:
```
http://localhost:3000
```

To change this, edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## Error Handling

All pages handle three states:
1. **Loading**: Shows "Loading..." message
2. **Error**: Shows error message with retry button
3. **Success**: Renders the content

## Next Steps (Phase 3)

- [ ] Add user authentication
- [ ] Implement enrollment system
- [ ] Add progress tracking
- [ ] Create instructor dashboard
- [ ] Add offline support
- [ ] Implement AI summaries (future)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
