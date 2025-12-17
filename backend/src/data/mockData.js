/**
 * Mock Data Store (In-Memory)
 * 
 * TODO: Phase 2 - Replace with actual database models
 * This will be replaced with proper database queries using Knex.js or similar ORM
 */

const courses = [
    {
        id: 1,
        title: "Introduction to Web Development",
        description: "Learn the basics of HTML, CSS, and JavaScript. Perfect for beginners who want to build their first website.",
        instructor_id: 1,
        is_published: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
    },
    {
        id: 2,
        title: "Basic Computer Literacy",
        description: "Essential computer skills including file management, internet browsing, and email communication.",
        instructor_id: 1,
        is_published: true,
        created_at: "2024-01-20T10:00:00Z",
        updated_at: "2024-01-20T10:00:00Z"
    },
    {
        id: 3,
        title: "English Grammar Fundamentals",
        description: "Master the fundamentals of English grammar with simple, text-based lessons and exercises.",
        instructor_id: 2,
        is_published: true,
        created_at: "2024-02-01T10:00:00Z",
        updated_at: "2024-02-01T10:00:00Z"
    }
];

const lessons = [
    // Course 1: Introduction to Web Development
    {
        id: 1,
        course_id: 1,
        title: "What is the Web?",
        content: `The World Wide Web (WWW) is a system of interconnected documents and resources, linked by hyperlinks and URLs.

Key Concepts:
- The web is accessed through browsers like Chrome, Firefox, or Safari
- Websites are made up of HTML, CSS, and JavaScript
- HTML provides structure, CSS provides styling, and JavaScript adds interactivity

In this course, you'll learn how to create your own web pages from scratch.`,
        order_index: 1,
        created_at: "2024-01-15T11:00:00Z",
        updated_at: "2024-01-15T11:00:00Z"
    },
    {
        id: 2,
        course_id: 1,
        title: "Introduction to HTML",
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
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z"
    },
    {
        id: 3,
        course_id: 1,
        title: "Introduction to CSS",
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
        created_at: "2024-01-15T13:00:00Z",
        updated_at: "2024-01-15T13:00:00Z"
    },

    // Course 2: Basic Computer Literacy
    {
        id: 4,
        course_id: 2,
        title: "Understanding Files and Folders",
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
        created_at: "2024-01-20T11:00:00Z",
        updated_at: "2024-01-20T11:00:00Z"
    },
    {
        id: 5,
        course_id: 2,
        title: "Internet Basics",
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
        created_at: "2024-01-20T12:00:00Z",
        updated_at: "2024-01-20T12:00:00Z"
    },

    // Course 3: English Grammar Fundamentals
    {
        id: 6,
        course_id: 3,
        title: "Parts of Speech",
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
        created_at: "2024-02-01T11:00:00Z",
        updated_at: "2024-02-01T11:00:00Z"
    },
    {
        id: 7,
        course_id: 3,
        title: "Sentence Structure",
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
        created_at: "2024-02-01T12:00:00Z",
        updated_at: "2024-02-01T12:00:00Z"
    }
];

// TODO: Phase 2 - Add User model and data
// TODO: Phase 2 - Add Enrollment model and data

module.exports = {
    courses,
    lessons
};
