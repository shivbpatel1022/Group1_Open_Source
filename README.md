# Group 1 Forums Backend

Backend API for a forum-style application built with Node.js, Express, TypeScript, MongoDB, JWT authentication, and a simple role system (`user`, `admin`, `super`).

## Features

- User registration and login
- JWT-protected routes
- Create, list, update, and delete forum posts
- Toggle likes on posts
- Create, list, update, and delete comments
- Admin statistics endpoint
- Admin role update endpoint
- Bruno collection for API testing
- Automated test suite with coverage

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JSON Web Tokens
- Bruno

## Project Structure

```text
src/
  application/      business logic and use-cases
  config/           environment configuration
  domain/           entities and interfaces
  infrastructure/   database models, repositories, logging
  presentation/     routes, controllers, middleware
tests/              node:test-based automated tests
bruno/              Bruno API collection and environment
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
copy .env.example .env
```

3. Ensure MongoDB is running locally at the value used in `.env`.

4. Start the development server:

```bash
npm run dev
```

The API runs on `http://localhost:3000` by default.

## Grader Quick Start

1. Run `npm install`
2. Copy `.env.example` to `.env`
3. Start MongoDB locally
4. Run `npm run dev`
5. Open the Bruno collection from [bruno](/C:/OpenSource/Group1_Open_Source/bruno)
6. Select the `Local` environment in Bruno
7. Run the demo flow listed below

## Environment Variables

See [.env.example](/C:/OpenSource/Group1_Open_Source/.env.example).

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/forumsDB
JWT_SECRET=your_jwt_secret_here
```

## Scripts

```bash
npm run dev
npm test
npm run test:coverage
```

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Posts

- `GET /api/posts`
- `POST /api/posts`
- `PUT /api/posts/:postId`
- `DELETE /api/posts/:postId`
- `POST /api/posts/:postId/like`

### Comments

- `GET /api/posts/:postId/comments`
- `POST /api/posts/:postId/comments`
- `PUT /api/posts/:postId/comments/:commentId`
- `DELETE /api/posts/:postId/comments/:commentId`

### Admin

- `GET /api/admin/stats`
- `PATCH /api/admin/users/:userId/role`

## Roles and Permissions

- `user`: can manage their own posts and comments
- `admin`: can access admin endpoints and can manage comments on posts they own
- `super`: full access to post/comment moderation and admin actions

## Bruno Testing

The Bruno collection is stored in [bruno](/C:/OpenSource/Group1_Open_Source/bruno).

Recommended demo order:

1. `auth/Register User`
2. `auth/Login User`
3. `posts/Create Post`
4. `posts/List Posts`
5. `posts/Toggle Like`
6. `comments/Create Comment`
7. `comments/List Comments`
8. `comments/Update Comment`
9. `admin/Admin Stats`
10. `admin/Update User Role`

Use [bruno/environments/Local.bru](/C:/OpenSource/Group1_Open_Source/bruno/environments/Local.bru) to store `token`, `adminToken`, `postId`, `commentId`, and `userId`.

## Demo Script

Use this exact presentation order for a clean walkthrough:

1. Register a new user and mention password hashing plus role defaults
2. Log in and mention JWT-based authentication
3. Create a post and mention protected write routes
4. List posts and show persisted data
5. Toggle a like and show the updated count
6. Create and list a comment
7. Update or delete the comment to show comment moderation
8. Log in as an admin or super user
9. Run `Admin Stats`
10. Run `Update User Role`

Suggested talking points:

- layered backend architecture
- authentication and authorization
- role-based moderation
- automated tests and coverage
- Bruno collection included for reproducible API testing

## Testing

The project uses Node's built-in test runner with repository methods patched in tests so the core behavior can be validated without requiring the API server to be running.

Current command:

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

## Current Deliverable Status

- Backend routes and business logic: implemented
- Bruno API collection: implemented
- Automated tests: implemented
- Admin routes: implemented
- Jira: handled separately by teammate

## Team Contributions

- Meet Gaekwad
  Contributed the majority of the backend feature implementation, including project architecture setup, authentication and JWT flow, posts, comments, likes, admin analytics, role-management endpoints, route wiring, logging, Bruno API collection, configuration fixes, and final project polish.

- Shiv Patel
  Contributed automated test coverage and final validation work, including auth/posts tests, comments/likes controller edge cases, admin-related test additions, and final integration checks before submission.

- Vivek Chaudhary
  Contributed documentation and supporting validation work, including setup and usage documentation, API/testing guide content, demo walkthrough preparation, and admin/super-role coverage additions.

## External Evidence Checklist

Prepare these items outside the repo if your rubric asks for them:

- Jira board link or screenshots
- short demo recording or screenshots if required
- names of teammates and contribution breakdown
- deployed API link if your class requires deployment

## Notes

- Admin and super roles should use a fresh login token after any role change because JWT payloads include the current role.
- MongoDB ObjectIds used in Bruno environment values must be raw ids only, without prefixes like `id:`.
