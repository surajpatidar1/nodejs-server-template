# 📦 Getting Started

## 👨‍💻 Author

```text
Suraj Patidar

GitHub: surajpatidar1
```

---

# 1. Clone the Template

Clone the repository:

```bash
git clone https://github.com/surajpatidar1/nodejs-server-template.git

cd nodejs-server-template
```

---

# 2. Environment Setup

Create your environment file:

```bash
cp .env.example .env
```

On Windows:

```cmd
copy .env.example .env
```

Configure the required values in `.env`.

> **Important:** `.env` must be configured before running `npm install` because the project automatically runs the Prisma seed during installation.

---

# 3. Install Dependencies

Install all project dependencies:

```bash
npm install
```

After installation, the `postinstall` script runs automatically:

```text
npm install
     ↓
prisma generate
     ↓
prisma db seed
     ↓
Check Admin
     ↓
Admin exists → Skip
Admin missing → Create default Admin
```

The configured script is:

```json
"postinstall": "prisma generate && npm run db:seed"
```

Therefore, you **do not need to manually run** `npm run db:generate` or `npm run db:seed` during the initial setup.

> The database must be accessible and the required environment variables must be configured before running `npm install`.

---

# 🗄️ Database

The template uses:

```text
PostgreSQL
Prisma ORM
```

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/server_template"
```

## Prisma Commands

### Initialize Prisma

Use this only when setting up Prisma in a new project:

```bash
npm run db:init
```

### Generate Prisma Client

```bash
npm run db:generate
```

This is normally executed automatically during `npm install`.

### Development Migration

Create and apply a migration during development:

```bash
npm run db:migrate
```

or:

```bash
npm run db:migrate:dev
```

### Deploy Migrations

For production:

```bash
npm run db:migrate:deploy
```

### Reset Database

> **Development only. This deletes existing database data.**

```bash
npm run db:reset
```

### Seed Database

Run the database seed manually when required:

```bash
npm run db:seed
```

The admin seed is idempotent:

```text
Admin exists
    ↓
Skip seed

Admin does not exist
    ↓
Create default Admin
```

### Prisma Studio

```bash
npm run db:studio
```

### Format Prisma Schema

```bash
npm run db:format
```

### Validate Prisma Schema

```bash
npm run db:validate
```

---

# 🔴 Redis

Redis is used by the application and BullMQ.

Example:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Redis can be started through Docker:

```bash
npm run docker:dev
```

---

# 📧 Mail

Mail is handled through:

```text
Nodemailer
BullMQ
```

Configure SMTP:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
```

The mail worker starts automatically when:

```env
NODE_ENV=production
```

Mail jobs are processed through BullMQ with configurable concurrency.

```env
QUEUE_CONCURRENCY=5
QUEUE_ATTEMPTS=3
QUEUE_BACKOFF_DELAY=1000
```

---

# 🔐 Authentication

The template includes:

- JWT access tokens
- JWT refresh tokens
- HTTP cookie handling
- Password hashing
- OTP support
- OAuth support

Configure JWT:

```env
ACCESS_TOKEN_SECRET=your-super-secret-access-key
ACCESS_TOKEN_EXPIRES_IN=15m

REFRESH_TOKEN_SECRET=your-super-secret-refresh-key
REFRESH_TOKEN_EXPIRES_IN=7d
```

Password hashing configuration:

```env
SALT_LENGTH=16
KEY_LENGTH=64
```

## Default Admin

The template contains default admin credentials through environment configuration:

```env
ADMIN_EMAIL=admin@gmail.com

ADMIN_PASSWORD_HASH=your-password-hash
ADMIN_PASSWORD_SALT=your-password-salt
```

During `npm install`, the admin seed runs automatically.

The seed first checks whether an admin already exists.

```text
                 npm install
                     ↓
                Admin Seed
                     ↓
            Admin already exists?
               /             \
             YES              NO
              ↓               ↓
            Skip          Create Admin
```

This prevents duplicate admin records when the seed is executed multiple times.

> For production deployments, use a strong unique password and securely generated secrets.

---

# 🔑 OAuth

The OAuth layer is provider-independent.

Currently, Google OAuth is supported:

```env
OAUTH_GOOGLE_CLIENT_ID=your-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-client-secret
OAUTH_GOOGLE_CALLBACK_URL=http://localhost:7001/api/auth/google/callback
```

---

# 📁 File Uploads

Uploads use:

```text
Multer
Storage abstraction
```

Supported storage providers:

```text
Local
AWS S3
Cloudinary
```

Select the provider through environment configuration.

## Local Storage

```env
STORAGE_PROVIDER=local
STORAGE_LOCAL_DESTINATION=storage
```

## AWS S3

```env
STORAGE_PROVIDER=aws

STORAGE_S3_ENDPOINT=
STORAGE_S3_REGION=ap-south-1
STORAGE_S3_BUCKET=
STORAGE_S3_ACCESS_KEY=
STORAGE_S3_SECRET_KEY=
```

## Cloudinary

```env
STORAGE_PROVIDER=cloudinary

STORAGE_CLOUDINARY_CLOUD_NAME=
STORAGE_CLOUDINARY_API_KEY=
STORAGE_CLOUDINARY_API_SECRET=
```

Application code communicates with the storage service rather than directly with a specific storage provider.

---

# 🐳 Docker

The template provides separate Docker Compose configurations for development and production.

## Development

```bash
npm run docker:dev
```

Stop development containers:

```bash
npm run docker:dev:down
```

## Production

```bash
npm run docker:prod
```

Stop production containers:

```bash
npm run docker:prod:down
```

Docker is used for infrastructure such as PostgreSQL and Redis.

---

# ▶️ Running the Application

## Development

Start the development server:

```bash
npm run start:dev
```

The development server runs TypeScript using `tsx`.

---

# 🏭 Production

## Build

Build the application:

```bash
npm run build
```

The build process:

```text
Clean dist
   ↓
TypeScript compilation
   ↓
tsc-alias
   ↓
Copy assets
```

## Start

Start the compiled application:

```bash
npm start
```

---

# 🧪 Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage:

```bash
npm run test:coverage
```

---

# 🔍 Type Checking

Run TypeScript validation:

```bash
npm run typecheck
```

---

# 🧹 Code Quality

## Lint

```bash
npm run lint
```

## Fix Lint Issues

```bash
npm run lint:fix
```

## Format

```bash
npm run format
```

## Check Formatting

```bash
npm run format:check
```

## Run All Checks

```bash
npm run check
```

The check command runs:

```text
TypeScript typecheck
       ↓
ESLint
       ↓
Prettier check
```

## Verify

Run all checks and build:

```bash
npm run verify
```

---

# 📝 Commit Convention

This template uses **Conventional Commits** with Commitlint.

Supported commit types include:

```text
feat: add authentication

fix: resolve redis connection

refactor: simplify storage service

chore: update dependencies

docs: update readme

test: add mail tests
```

Example:

```bash
git commit -m "feat: add user authentication"
```

Invalid commit messages are rejected by Commitlint.

Husky runs the configured Git hooks automatically.

---

# 📚 Swagger

Swagger is included for API documentation.

After starting the server, open:

```text
http://localhost:7001/api-docs
```

The Swagger endpoint can be changed through the Swagger configuration.

---

# 🏗️ How to Use This Template

After cloning the template, follow this flow:

```text
Clone Template
      ↓
cd nodejs-server-template
      ↓
Configure .env
      ↓
npm install
      ↓
Prisma Client Generated
      ↓
Admin Seed Runs Automatically
      ↓
Start PostgreSQL + Redis
      ↓
Run Development Migration
      ↓
Start Backend
```

## Step 1 — Clone

```bash
git clone https://github.com/surajpatidar1/nodejs-server-template.git
cd nodejs-server-template
```

## Step 2 — Configure Environment

Create `.env`:

```bash
cp .env.example .env
```

Configure:

```text
Application
Database
Redis
JWT
Cookies
Mail
OAuth
Storage
```

## Step 3 — Install Dependencies

```bash
npm install
```

This automatically executes:

```text
prisma generate
      ↓
prisma db seed
```

The seed creates the default admin only when no admin exists.

## Step 4 — Start Infrastructure

For development:

```bash
npm run docker:dev
```

## Step 5 — Run Database Migration

```bash
npm run db:migrate
```

## Step 6 — Start Backend

```bash
npm run start:dev
```

---

# 🔄 Production Configuration

Before deploying to production:

## 1. Set Production Environment

```env
NODE_ENV=production
```

## 2. Configure Production Services

Configure:

```text
Production PostgreSQL
Production Redis
JWT secrets
Mail credentials
OAuth credentials
Storage provider
```

## 3. Generate Prisma Client

```bash
npm run db:generate
```

## 4. Deploy Database Migrations

```bash
npm run db:migrate:deploy
```

## 5. Build Application

```bash
npm run build
```

## 6. Start Application

```bash
npm start
```

> `npm install` automatically runs the admin seed through the `postinstall` hook. The seed is safe to run multiple times because it skips creation when an admin already exists.

---

# 🧹 What You Usually Need to Change

After cloning this template, most projects only need to customize:

```text
.env

prisma/schema.prisma

src/
```

Add your application-specific:

```text
modules
controllers
routes
services
repositories
schemas
business logic
```

The existing infrastructure can generally be reused without major changes.

---

# 📌 Recommended Development Flow

```text
Clone Template
      ↓
Configure .env
      ↓
npm install
      ↓
Prisma Generate
      ↓
Admin Seed
      ↓
Start PostgreSQL + Redis
      ↓
Run Database Migration
      ↓
Start Development Server
      ↓
Build Application Modules
      ↓
Run Typecheck
      ↓
Run Lint
      ↓
Format Code
      ↓
Commit
      ↓
Husky + Commitlint
```

---

# 🛠️ Useful Commands

## Application

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Build
npm run build

# Production
npm start

# Type check
npm run typecheck

# Lint
npm run lint

# Fix lint
npm run lint:fix

# Format
npm run format

# Check project
npm run check

# Verify and build
npm run verify
```

## Database

```bash
# Initialize Prisma
npm run db:init

# Generate Prisma Client
npm run db:generate

# Development migration
npm run db:migrate

# Development migration
npm run db:migrate:dev

# Deploy migrations
npm run db:migrate:deploy

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Prisma Studio
npm run db:studio

# Format Prisma schema
npm run db:format

# Validate Prisma schema
npm run db:validate
```

## Docker

```bash
# Development
npm run docker:dev

# Stop development
npm run docker:dev:down

# Production
npm run docker:prod

# Stop production
npm run docker:prod:down
```

## Testing

```bash
# Run tests
npm test

# Watch tests
npm run test:watch

# Test coverage
npm run test:coverage
```

---

# ⚡ Automatic Installation Flow

The template is configured so that database initialization related to the default admin happens automatically after dependency installation.

```text
npm install
    │
    ├── Install dependencies
    │
    └── postinstall
          │
          ├── prisma generate
          │
          └── prisma db seed
                    │
                    └── seedAdmin()
                          │
                          ├── Admin exists
                          │       └── Skip
                          │
                          └── Admin does not exist
                                  └── Create Admin
```

Therefore, a new developer only needs to:

```bash
git clone https://github.com/surajpatidar1/nodejs-server-template.git

cd nodejs-server-template

cp .env.example .env

npm install
```

After installation, the Prisma Client is generated and the default admin seed is executed automatically.
