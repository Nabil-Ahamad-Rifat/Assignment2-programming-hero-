# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative REST API platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** `https://devpulse-api.vercel.app`  
**GitHub:** `https://github.com/yourusername/devpulse`

---

## Features

- User registration and login with JWT authentication
- Role-based access control: `contributor` and `maintainer`
- Create, read, update, and delete issues (bugs & feature requests)
- Filter issues by type and status; sort by newest or oldest
- Centralized error handling with consistent JSON response format

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js 24.x | LTS runtime |
| TypeScript | Strict typing, no `any` |
| Express.js | Modular router architecture |
| PostgreSQL | Relational database via native `pg` driver |
| Raw SQL | Direct `pool.query()` calls, no ORM |
| bcrypt | Password hashing (10 salt rounds) |
| jsonwebtoken | JWT generation & verification |
| http-status-codes | Consistent HTTP status references |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```
DATABASE_URL=postgresql://user:password@host:5432/devpulse
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
```

### 3. Set up the database

Run `schema.sql` against your PostgreSQL instance (NeonDB / Supabase / local):

```bash
psql $DATABASE_URL -f schema.sql
```

### 4. Start the dev server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
npm start
```

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| POST | `/api/issues` | Authenticated | Create a new issue |
| GET | `/api/issues` | Public | Get all issues (filter + sort) |
| GET | `/api/issues/:id` | Public | Get a single issue |
| PATCH | `/api/issues/:id` | Authenticated | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters for GET /api/issues

| Param | Values | Default |
|-------|--------|---------|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | — |
| `status` | `open`, `in_progress`, `resolved` | — |

### Authorization Header

```
Authorization: <JWT_TOKEN>
```

---

## Database Schema

### users

| Field | Type | Notes |
|-------|------|-------|
| id | SERIAL | Auto-increment PK |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique, required |
| password | VARCHAR(255) | Hashed, never returned |
| role | VARCHAR(20) | `contributor` (default) or `maintainer` |
| created_at | TIMESTAMPTZ | Auto-set on insert |
| updated_at | TIMESTAMPTZ | Updated on each change |

### issues

| Field | Type | Notes |
|-------|------|-------|
| id | SERIAL | Auto-increment PK |
| title | VARCHAR(150) | Required, max 150 chars |
| description | TEXT | Required, min 20 chars |
| type | VARCHAR(20) | `bug` or `feature_request` |
| status | VARCHAR(20) | `open` (default), `in_progress`, `resolved` |
| reporter_id | INTEGER | References users.id (app-level validation) |
| created_at | TIMESTAMPTZ | Auto-set on insert |
| updated_at | TIMESTAMPTZ | Updated on each change |
