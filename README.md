# CodeVector Internship - Backend Task

**Live Demo URL:** [Replace this with your Render Link]

This project implements a backend API with cursor-based pagination for 200,000 products, satisfying the requirement to efficiently paginate while data is actively changing without skipping or showing duplicate records.

## Stack
- **Backend Language**: Node.js (TypeScript + Express)
- **Database**: PostgreSQL
- **ORM**: Prisma (v6)
- **Frontend UI**: Vanilla JS + HTML + TailwindCSS (Served statically)

## Why Cursor-Based Pagination?
Standard offset-based pagination (`OFFSET X LIMIT Y`) is unstable when data is rapidly changing. If a user is on page 1 and 50 items are added, the offsets shift, causing the user to see duplicate items when they load page 2.

This project implements **Cursor-Based Pagination** using a composite cursor of `(createdAt, id)`. 
By passing the `createdAt` and `id` of the *last item* seen on the previous page, the backend can safely fetch the *next* set of items using the `WHERE (createdAt, id) < (cursor.createdAt, cursor.id)` logical equivalent. This guarantees stability.

### Fast Pagination via Indexing
To ensure this cursor query is fast across 200,000+ rows, the database schema includes composite indexes:
- `@@index([createdAt(sort: Desc), id(sort: Desc)])` for global pagination.
- `@@index([category, createdAt(sort: Desc), id(sort: Desc)])` for category-filtered pagination.

## Setup Instructions (Local)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your PostgreSQL connection string.
   ```bash
   cp .env.example .env
   ```
   Example: `DATABASE_URL="postgresql://user:password@localhost:5432/codevector?schema=public"`

3. **Initialize Database Schema**:
   Run Prisma db push to create the tables and indexes.
   ```bash
   npx prisma db push
   ```

4. **Seed the Database**:
   Generate and insert 200,000 products. This script uses Prisma's `createMany` in batches of 10,000 to ensure fast execution without running out of memory.
   ```bash
   npm run seed
   ```

5. **Start the Server**:
   ```bash
   npm start
   ```

6. **View the UI**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Render & Neon / Supabase

1. Set up a free PostgreSQL database on Neon or Supabase and get the connection string.
2. Create a new Web Service on Render and link this GitHub repository.
3. Set the Build Command: `npm install && npx prisma generate`
4. Set the Start Command: `npx prisma db push && npm start`
   *(Alternatively, you can run `db push` and `seed` locally pointing to the remote DB before deploying the app).*
5. Add the `DATABASE_URL` environment variable in Render.
