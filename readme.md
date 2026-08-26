# 📦 Getting Started

## 👨‍💻 Author

```
Suraj Patidar

GitHub: surajpatidar1
```

## 1. Clone the Template

```bash
git clone https://github.com/surajpatidar1/nodejs-server-template
cd nodejs-server-template
```

Install dependencies:

```bash
npm install
```

---

# ⚙️ Environment Setup

Create your environment file:

```bash
cp .env.example .env
```

On Windows:

```cmd
copy .env.example .env
```

Then configure the required values in `.env`.

---

# 🗄️ Database

The template uses **PostgreSQL + Prisma**.

Example:

```env
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/app_db
```

### Initialize Prisma

For a fresh project setup:

```bash
npm run db:init
```

### Generate Prisma Client

```bash
npm run db:generate
```

### Create and Apply Migration

During development:

```bash
npm run db:migrate
```

### Deploy Migrations

For production:

```bash
npm run db:migrate:deploy
```

### Reset Database

> Development only. This deletes the database data.

```bash
npm run db:reset
```

### Seed Database

```bash
npm run db:seed
```

### Prisma Studio

```bash
npm run db:studio
```

### Format Prisma Schema

```bash
npm run db:format
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

Mail is handled through **Nodemailer + BullMQ**.

Configure:

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

---

# 🔐 Authentication

The template contains:

* JWT access tokens
* JWT refresh tokens
* HTTP cookie handling
* OTP support
* OAuth support

Configure JWT:

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
```

The OAuth layer is provider-independent.

Currently, Google OAuth is supported:

```env
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_GOOGLE_CALLBACK_URL=
```

---

# 📁 File Uploads

Uploads use **Multer** and a provider-independent storage abstraction.

Supported providers:

```text
Local
AWS S3
Cloudinary
```

Select the provider through environment configuration.

### Local Storage

```env
STORAGE_PROVIDER=local
```

### AWS S3

```env
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=
```

### Cloudinary

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Application code communicates with the storage service rather than directly with a specific provider.

---

# 🐳 Docker

The template provides separate Docker Compose configurations for development and production.

### Development

```bash
npm run docker:dev
```

Stop development containers:

```bash
npm run docker:dev:down
```

### Production

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

```bash
npm run dev
```

The development server runs TypeScript using `tsx`.

---

## Production

Build the application:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

---

# 🧪 Type Checking

Run TypeScript validation:

```bash
npm run typecheck
```

This is also executed automatically before commits through Husky.

---

# 🎨 Formatting

Format the project:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
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

Husky also runs the configured pre-commit checks automatically.

---

# 📚 Swagger

Swagger is included for API documentation.

After starting the server, open:

```text
http://localhost:7001/api-docs
```

The endpoint can be changed through the Swagger configuration.

---

# 🏗️ How to Use This Template

After cloning the template, follow this order.

### Step 1 — Install Dependencies

```bash
npm install
```

### Step 2 — Configure Environment

Create `.env` and configure:

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

### Step 3 — Start Infrastructure

For development:

```bash
npm run docker:dev
```

### Step 4 — Setup Database

Generate Prisma Client:

```bash
npm run db:generate
```

Create and apply the development migration:

```bash
npm run db:migrate
```

### Step 5 — Start Backend

```bash
npm run dev
```

### Step 6 — Build Your Application

Add your application-specific:

```text
modules
controllers
routes
services
repositories
schemas
```

The existing infrastructure can be reused without modification in most cases.

---

# 🔄 Production Configuration

Before deploying to production:

### 1. Set production environment

```env
NODE_ENV=production
```

### 2. Configure production services

Configure:

```text
Production PostgreSQL
Production Redis
JWT secrets
Mail credentials
OAuth credentials
Storage provider
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Deploy Database Migrations

```bash
npm run db:migrate:deploy
```

### 5. Build Application

```bash
npm run build
```

### 6. Start Application

```bash
npm start
```

When running in production, the mail worker starts automatically.

---

# 🧹 What You Usually Need to Change

After cloning this template, most projects only need to customize:

```text
.env
prisma/schema.prisma
src/
```

Add your application-specific modules, controllers, routes, services, repositories, and business logic.

The existing infrastructure can generally remain unchanged.

---

# 📌 Recommended Development Flow

```text
Clone Template
      ↓
Install Dependencies
      ↓
Configure .env
      ↓
Start PostgreSQL + Redis
      ↓
Generate Prisma Client
      ↓
Run Database Migration
      ↓
Start Development Server
      ↓
Build Application Modules
      ↓
Run Typecheck
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
npm run dev

# Build
npm run build

# Production
npm start

# Type check
npm run typecheck
```

## Database

```bash
# Initialize Prisma
npm run db:init

# Generate Prisma Client
npm run db:generate

# Development migration
npm run db:migrate

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

## Code Quality

```bash
# Format
npm run format

# Check formatting
npm run format:check
```
