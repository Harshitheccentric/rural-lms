const Database = require('better-sqlite3');
const path = require('path');

/**
 * Database Configuration
 * 
 * Using SQLite for Phase 3a
 * 
 * TODO: Phase 4 - Migrate to PostgreSQL for production
 * TODO: Phase 4 - Add connection pooling
 * TODO: Phase 4 - Add query logging
 * TODO: Phase 4 - Add performance monitoring
 */

// Database file path (stored in backend root directory)
const DB_PATH = path.join(__dirname, '../../rural-lms.db');

// Initialize database connection
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Create tables if they don't exist
 */
function initializeTables() {
  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      instructor_id INTEGER NOT NULL,
      category TEXT DEFAULT 'General',
      is_published BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Lessons table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  // Users table (Phase 3b)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Enrollments table (Phase 3c)
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(user_id, course_id)
    )
  `);

  // Lesson Progress table (Phase 4a)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      completed_at TEXT,
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      UNIQUE(enrollment_id, lesson_id)
    )
  `);

  // Achievements table (Phase 5)
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_type TEXT NOT NULL,
      earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, achievement_type)
    )
  `);

  // Content Variants table (Phase 6 - Adaptive Content Delivery)
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      bandwidth_type TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_url TEXT,
      content_text TEXT,
      file_size_mb REAL DEFAULT 0,
      quality TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
  `);

  // TODO: Phase 4 - Add role field to users table (student/instructor/admin)
  // TODO: Phase 5 - Add indexes for performance
  // TODO: Phase 5 - Add time_spent field to lesson_progress
  // TODO: Phase 5 - Add quiz_scores table

  console.log('✓ Database tables initialized');
}

/**
 * Seed initial data if database is empty
 */
function seedData() {
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get();

  if (courseCount.count > 0) {
    console.log('✓ Database already contains data, skipping seed');
    return;
  }

  console.log('Seeding database with initial data...');

  // Seed users first (Phase 3b)
  const bcrypt = require('bcrypt');
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const users = [
    {
      email: 'instructor@example.com',
      password: 'password123',
      full_name: 'John Instructor',
      created_at: '2024-01-01T10:00:00Z'
    },
    {
      email: 'student@example.com',
      password: 'password123',
      full_name: 'Jane Student',
      created_at: '2024-01-02T10:00:00Z'
    }
  ];

  const insertManyUsers = db.transaction((users) => {
    for (const user of users) {
      const password_hash = bcrypt.hashSync(user.password, 10);
      insertUser.run(
        user.email,
        password_hash,
        user.full_name,
        user.created_at
      );
    }
  });

  insertManyUsers(users);

  // Insert courses
  const insertCourse = db.prepare(`
    INSERT INTO courses (title, description, instructor_id, category, is_published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const courses = [
    {
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript. Perfect for beginners who want to build their first website.',
      instructor_id: 1,
      category: 'Web Development',
      is_published: 1,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      title: 'Basic Computer Literacy',
      description: 'Essential computer skills including file management, internet browsing, and email communication.',
      instructor_id: 1,
      category: 'Computer Skills',
      is_published: 1,
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z'
    },
    {
      title: 'English Grammar Fundamentals',
      description: 'Master the fundamentals of English grammar with simple, text-based lessons and exercises.',
      instructor_id: 2,
      category: 'Language',
      is_published: 1,
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z'
    }
  ];

  const insertMany = db.transaction((courses) => {
    for (const course of courses) {
      insertCourse.run(
        course.title,
        course.description,
        course.instructor_id,
        course.category,
        course.is_published,
        course.created_at,
        course.updated_at
      );
    }
  });

  insertMany(courses);

  // Insert lessons
  const insertLesson = db.prepare(`
    INSERT INTO lessons (course_id, title, content, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const lessons = [
    // Course 1: Introduction to Web Development
    {
      course_id: 1,
      title: 'What is the Web?',
      content: `The World Wide Web (WWW) is a system of interconnected documents and resources, linked by hyperlinks and URLs.

Key Concepts:
- The web is accessed through browsers like Chrome, Firefox, or Safari
- Websites are made up of HTML, CSS, and JavaScript
- HTML provides structure, CSS provides styling, and JavaScript adds interactivity

In this course, you'll learn how to create your own web pages from scratch.`,
      order_index: 1,
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:00Z'
    },
    {
      course_id: 1,
      title: 'Introduction to HTML',
      content: `HTML (HyperText Markup Language) is the standard language for creating web pages.

Basic HTML Structure:
<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
  </body>
</html>

Key HTML Elements:
- <h1> to <h6>: Headings
- <p>: Paragraphs
- <a>: Links
- <img>: Images
- <div>: Container elements`,
      order_index: 2,
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:00:00Z'
    },
    {
      course_id: 1,
      title: 'Introduction to CSS',
      content: `CSS (Cascading Style Sheets) is used to style and layout web pages.

Basic CSS Syntax:
selector {
  property: value;
}

Example:
h1 {
  color: blue;
  font-size: 24px;
}

Common CSS Properties:
- color: Text color
- background-color: Background color
- font-size: Text size
- margin: Space outside elements
- padding: Space inside elements`,
      order_index: 3,
      created_at: '2024-01-15T13:00:00Z',
      updated_at: '2024-01-15T13:00:00Z'
    },

    // Course 2: Basic Computer Literacy
    {
      course_id: 2,
      title: 'Understanding Files and Folders',
      content: `Files and folders are the basic building blocks of computer organization.

What is a File?
A file is a collection of data stored on your computer. Examples include documents, images, videos, and programs.

What is a Folder?
A folder (also called a directory) is a container that holds files and other folders.

Best Practices:
- Use descriptive names for files and folders
- Organize related files together
- Create a logical folder structure
- Regularly backup important files

Common File Extensions:
- .txt - Text files
- .pdf - PDF documents
- .jpg, .png - Images
- .mp4 - Videos`,
      order_index: 1,
      created_at: '2024-01-20T11:00:00Z',
      updated_at: '2024-01-20T11:00:00Z'
    },
    {
      course_id: 2,
      title: 'Internet Basics',
      content: `The Internet is a global network of computers that allows people to share information and communicate.

Key Concepts:
- Browser: Software used to access websites (Chrome, Firefox, Safari)
- URL: Web address (e.g., www.example.com)
- Search Engine: Tool to find information online (Google, Bing)

How to Browse Safely:
1. Use strong passwords
2. Don't click suspicious links
3. Verify website security (look for https://)
4. Keep your browser updated

Common Internet Activities:
- Searching for information
- Reading news and articles
- Watching educational videos
- Communicating via email`,
      order_index: 2,
      created_at: '2024-01-20T12:00:00Z',
      updated_at: '2024-01-20T12:00:00Z'
    },

    // Course 3: English Grammar Fundamentals
    {
      course_id: 3,
      title: 'Parts of Speech',
      content: `Understanding the parts of speech is fundamental to mastering English grammar.

The 8 Parts of Speech:

1. Noun: Person, place, thing, or idea
   Example: cat, London, happiness

2. Pronoun: Replaces a noun
   Example: he, she, it, they

3. Verb: Action or state of being
   Example: run, is, think

4. Adjective: Describes a noun
   Example: beautiful, large, happy

5. Adverb: Describes a verb, adjective, or other adverb
   Example: quickly, very, well

6. Preposition: Shows relationship between words
   Example: in, on, at, by

7. Conjunction: Connects words or phrases
   Example: and, but, or

8. Interjection: Expresses emotion
   Example: wow, ouch, hey`,
      order_index: 1,
      created_at: '2024-02-01T11:00:00Z',
      updated_at: '2024-02-01T11:00:00Z'
    },
    {
      course_id: 3,
      title: 'Sentence Structure',
      content: `A sentence is a group of words that expresses a complete thought.

Basic Sentence Components:

1. Subject: Who or what the sentence is about
2. Predicate: What the subject does or is

Example: "The cat (subject) sleeps (predicate)."

Types of Sentences:

1. Simple Sentence: One independent clause
   Example: "I like reading."

2. Compound Sentence: Two independent clauses joined by a conjunction
   Example: "I like reading, and she likes writing."

3. Complex Sentence: One independent clause and one dependent clause
   Example: "I like reading because it's relaxing."

Sentence Punctuation:
- Period (.) - Ends a statement
- Question mark (?) - Ends a question
- Exclamation point (!) - Shows strong emotion`,
      order_index: 2,
      created_at: '2024-02-01T12:00:00Z',
      updated_at: '2024-02-01T12:00:00Z'
    }
  ];

  const insertManyLessons = db.transaction((lessons) => {
    for (const lesson of lessons) {
      insertLesson.run(
        lesson.course_id,
        lesson.title,
        lesson.content,
        lesson.order_index,
        lesson.created_at,
        lesson.updated_at
      );
    }
  });

  insertManyLessons(lessons);

  console.log('✓ Database seeded with 2 users, 3 courses, and 7 lessons');
}

/**
 * Initialize database (create tables and seed data)
 */
function initializeDatabase() {
  try {
    initializeTables();
    seedData();
    console.log('✓ Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = {
  db,
  initializeDatabase
};
