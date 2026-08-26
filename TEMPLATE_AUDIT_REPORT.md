# Node.js Server Template — Comprehensive Audit & Study Guide

This document catalogs the bugs, architectural flaws, security considerations, and missing concepts identified across the codebase. Use this guide to review, study, and systematically improve the template for production reusability.

---

## Table of Contents
1. [Critical Runtime Bugs](#1-critical-runtime-bugs)
   - [1.1 Error Middleware Swallows Custom Status Codes & Messages](#11-error-middleware-swallows-custom-status-codes--messages)
   - [1.2 Hanging Requests on Password Endpoints](#12-hanging-requests-on-password-endpoints)
   - [1.3 Admin Service Mutates the Wrong Database Table](#13-admin-service-mutates-the-wrong-database-table)
   - [1.4 Inverted Middleware Order in Admin Protected Routes](#14-inverted-middleware-order-in-admin-protected-routes)
   - [1.5 Spelling Typo in Registration Drops `dialCode`](#15-spelling-typo-in-registration-drops-dialcode)
   - [1.6 GET Endpoint Validates Request Body Instead of Query Params](#16-get-endpoint-validates-request-body-instead-of-query-params)
   - [1.7 Production Build Crashes Due to Unresolved TypeScript Path Aliases (`@/*`)](#17-production-build-crashes-due-to-unresolved-typescript-path-aliases-)
2. [Subtle Flaws & Edge Cases](#2-subtle-flaws--edge-cases)
   - [2.1 Mail Worker Inactive in Development Mode](#21-mail-worker-inactive-in-development-mode)
   - [2.2 Pug Email Templates Missing in Production Deployments](#22-pug-email-templates-missing-in-production-deployments)
   - [2.3 Incomplete Cookie Invalidation on Single Clear](#23-incomplete-cookie-invalidation-on-single-clear)
   - [2.4 Unwired Google OAuth Service](#24-unwired-google-oauth-service)
3. [Missing Architectural Concepts for a Production Reusable Template](#3-missing-architectural-concepts-for-a-production-reusable-template)
   - [3.1 Rate Limiting & Brute-Force Protection](#31-rate-limiting--brute-force-protection)
   - [3.2 Unified Request Validation Middleware (`body`, `query`, `params`)](#32-unified-request-validation-middleware-body-query-params)
   - [3.3 Comprehensive Health Check Probes](#33-comprehensive-health-check-probes)
   - [3.4 Distributed Tracing & Correlation IDs](#34-distributed-tracing--correlation-ids)
   - [3.5 Database Seeding Mechanism](#35-database-seeding-mechanism)
   - [3.6 Automated Temporary Storage Pruning (TTL)](#36-automated-temporary-storage-pruning-ttl)
4. [Action Plan & Quick Reference Checklist](#4-action-plan--quick-reference-checklist)

---

## 1. Critical Runtime Bugs

### 1.1 Error Middleware Swallows Custom Status Codes & Messages
* **File:** `src/middleware/global.middleware.ts` (Lines 35–44)
* **Problem:** Custom exceptions created via `src/utils/exceptions.ts` (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, `ConflictException`, `ValidationException`) attach a `.statusCode` property (e.g. `400`, `401`, `404`, `409`, `422`).
  However, `errorMiddleware` only checks `if (error instanceof Error)` and unconditionally returns a `500` status with a generic `'Internal Server Error'` string:
  ```typescript
  // Current flawed implementation
  if (error instanceof Error) {
    logger.error(error);

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });

    return;
  }
  ```
* **Impact:** Every single client-side error (invalid credentials, expired token, duplicate email, invalid OTP, etc.) is masked and returned to the client as a **`500 Internal Server Error`**. The client never receives actionable feedback.
* **Solution:** Check if `statusCode` exists on the error:
  ```typescript
  interface AppError extends Error {
    statusCode?: number;
  }

  export function errorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          success: false,
          message: 'File size exceeds the allowed limit',
        });
        return;
      }
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    if (error instanceof Error) {
      const appErr = error as AppError;
      const statusCode = appErr.statusCode && appErr.statusCode >= 400 && appErr.statusCode < 600
        ? appErr.statusCode
        : 500;

      if (statusCode === 500) {
        logger.error(error);
      }

      res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal Server Error' : error.message,
      });
      return;
    }

    logger.error(new Error('Unknown error occurred'));
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
  ```

---

### 1.2 Hanging Requests on Password Endpoints
* **Files:**
  - `src/module/user/user.controller.ts` (Lines 46–55)
  - `src/module/admin/admin.controller.ts` (Lines 35–44)
* **Problem:** In Express, route handlers must explicitly call `res.send()`, `res.json()`, `res.end()`, or pass an error to `next()`. The `changePassword` and `forgotPassword` controllers return the promise directly:
  ```typescript
  // Current flawed implementation
  export const changePassword = async (req: Request, res: Response) => {
    const userId = Number(req.user.sub);
    const data = req.body;
    return await userService.changePassword(userId, data); // ❌ No res.status().json()!
  };

  export const forgotPassword = async (req: Request, res: Response) => {
    const data = req.body;
    return await userService.forgotPassword(data); // ❌ No res.status().json()!
  };
  ```
* **Impact:** Any client invoking `PATCH /user/change-password`, `PATCH /user/forgot-password`, `PATCH /admin/change-password`, or `PATCH /admin/forgot-password` **hangs indefinitely** until the connection times out.
* **Solution:**
  ```typescript
  export const changePassword = async (req: Request, res: Response) => {
    const userId = Number(req.user.sub);
    const data = req.body;
    const result = await userService.changePassword(userId, data);
    return res.status(200).json(result);
  };

  export const forgotPassword = async (req: Request, res: Response) => {
    const data = req.body;
    const result = await userService.forgotPassword(data);
    return res.status(200).json(result);
  };
  ```

---

### 1.3 Admin Service Mutates the Wrong Database Table
* **File:** `src/module/admin/admin.service.ts` (Line 52)
* **Problem:** In `adminService.update()`, the query checks for an Admin record, but the update query executes on `databaseService.client.user`:
  ```typescript
  // Current flawed implementation
  async update(userId: number, data: { firstname?: string; lastname?: string; }) {
    const user = await databaseService.client.admin.findUnique({
      where: { id: userId },
    });

    if (!user) throw NotFoundException('User not found.');

    return databaseService.client.user.update({ // ❌ Updates 'user' table instead of 'admin'!
      where: { id: userId },
      data: {
        ...(data.firstname !== undefined && { firstname: data.firstname }),
        ...(data.lastname !== undefined && { lastname: data.lastname }),
      },
    });
  }
  ```
* **Impact:** When an administrator updates their first/last name, it modifies an arbitrary regular User with that ID instead of the Admin record.
* **Solution:** Change `databaseService.client.user.update` to `databaseService.client.admin.update`.

---

### 1.4 Inverted Middleware Order in Admin Protected Routes
* **File:** `src/module/admin/admin.route.ts` (Line 28)
* **Problem:** The middleware stack applies `guard` before `authMiddleware`:
  ```typescript
  // Current flawed implementation
  adminRouter.use(guard(UserType.ADMIN), authMiddleware); // ❌ guard runs before authMiddleware
  ```
  Inside `src/middleware/guard.middleware.ts`:
  ```typescript
  export const guard = (...allowedTypes: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const user = req.user;
      if (!user) {
        throw UnauthorizedException();
      }
      if (!allowedTypes.includes(user.type)) {
        throw ForbiddenException();
      }
      next();
    };
  };
  ```
* **Impact:** `req.user` is only populated by `authMiddleware`. Because `guard` executes first, `req.user` is always `undefined`. As a result, **every single protected admin route is rejected with 401 Unauthorized**.
* **Solution:** Swap the order:
  ```typescript
  adminRouter.use(authMiddleware, guard(UserType.ADMIN));
  ```

---

### 1.5 Spelling Typo in Registration Drops `dialCode`
* **File:** `src/module/auth/auth.service.ts` (Line 76)
* **Problem:** The Zod validator in `auth.validator.ts` specifies `dialCode`, and `userService.create` expects `dialCode`. However, `authService.register` types the parameter as `dailcode`:
  ```typescript
  // Current flawed implementation
  async register(data: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    dailcode: string; // ❌ Typo: 'dailcode' instead of 'dialCode'
    mobile: string;
    profileImage?: string;
    country: string;
    code: string;
  }): Promise<User> { ... }
  ```
* **Impact:** When `req.body` (containing `dialCode`) is passed to `userService.create(data)`, `data.dialCode` evaluates to `undefined`, so `dialCode` is always inserted as `null` in PostgreSQL.
* **Solution:** Rename `dailcode` to `dialCode: string` in `auth.service.ts`.

---

### 1.6 GET Endpoint Validates Request Body Instead of Query Params
* **File:** `src/module/user/user.route.ts` (Line 50)
* **Problem:** `getAllUsersValidator` contains pagination and search rules (`search`, `skip`, `take`), but it is passed to `validateBody`:
  ```typescript
  // Current flawed implementation
  userRouter.get('/', validateBody(getAllUsersValidator), getAllUser);
  ```
  `validateBody` parses `req.body` via `schema.safeParse(req.body)`.
* **Impact:** HTTP `GET` requests have no body. `req.body` is `{}`. The validation either ignores query parameters entirely or fails if default/coercion logic is expected.
* **Solution:** Create and use a dedicated `validateQuery` middleware for `GET` requests (or a unified `validateRequest` middleware).

---

### 1.7 Production Build Crashes Due to Unresolved TypeScript Path Aliases (`@/*`)
* **File:** `package.json` (Lines 11–12) & `tsconfig.json`
* **Problem:** `tsconfig.json` uses `"paths": { "@/*": ["./src/*"] }`. The build script runs:
  ```json
  "build": "tsc"
  ```
  The TypeScript compiler `tsc` does **not** rewrite path aliases to relative paths during emission. In `dist/main.js`, imports remain `import { logger } from '@/utils/index.js';`.
* **Impact:** Running `npm start` (`node dist/main.js`) in production immediately crashes with:
  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/utils/index.js'
  ```
* **Solution:** `tsc-alias` is already in `devDependencies`. Update `package.json`:
  ```json
  "scripts": {
    "build": "tsc && tsc-alias",
    "start": "node dist/main.js"
  }
  ```

---

## 2. Subtle Flaws & Edge Cases

### 2.1 Mail Worker Inactive in Development Mode
* **File:** `src/lifecycle/compose.up.ts` (Lines 74–80)
* **Problem:** The BullMQ mail processor worker is conditionally started only in production:
  ```typescript
  if (environmentService.isProduction()) {
    mailProcessor = await loadService('Mail Processor', async () => {
      const { createMailProcessor } = await import('@/services/mail/mail.processor.js');
      return createMailProcessor();
    });
  }
  ```
* **Impact:** During local development (`NODE_ENV=development`), when a user registers or requests a password reset OTP, `mailService.enqueueTemplate()` pushes the job to the Redis queue, but **no worker ever processes the queue**. The developer never receives the OTP email.
* **Recommendation:** Start the mail worker in development as well, or implement a local dev logger transport (fallback) when SMTP credentials are not configured.

---

### 2.2 Pug Email Templates Missing in Production Deployments
* **File:** `src/services/mail/renderer.ts` (Lines 9–13)
* **Problem:** The template path is hardcoded relative to `src/`:
  ```typescript
  const filePath = path.join(
    process.cwd(),
    'src/services/mail/templates',
    `${template}.pug`,
  );
  ```
* **Impact:** `tsc` only copies TypeScript files to `dist/`. In standalone Docker containers or CI/CD pipelines where only the `dist/` directory and production `node_modules` are shipped, `src/` does not exist, causing email rendering to throw `ENOENT: no such file or directory`.
* **Recommendation:** Copy email templates to `dist/` during the build step (e.g. `cpx "src/services/mail/templates/**/*" dist/services/mail/templates`) and resolve templates relative to `import.meta.url`.

---

### 2.3 Incomplete Cookie Invalidation on Single Clear
* **File:** `src/services/cookie/cookie.service.ts` (Lines 24–34)
* **Problem:** `cookieService.clear()` calls `response.clearCookie(name)` without the matching options:
  ```typescript
  clear(response: Response, type: TokenType): void {
    const name = type === TokenType.ACCESS_TOKEN
      ? configCookie.ACCESS_TOKEN_NAME
      : configCookie.REFRESH_TOKEN_NAME;

    response.clearCookie(name); // ❌ Missing cookie options
  }
  ```
  Meanwhile, `clearAll()` (lines 36–46) correctly passes the options (`configCookie.ACCESS_TOKEN_OPTIONS`).
* **Impact:** If cookies were set with specific `domain`, `path`, or `sameSite` flags, calling `clearCookie` without those identical flags fails to remove the cookie in many modern web browsers.
* **Solution:** Pass the corresponding options in `cookieService.clear()`.

---

### 2.4 Unwired Google OAuth Service
* **Files:** `src/services/oauth/` & `src/module/auth/auth.route.ts`
* **Problem:** A complete Google OAuth provider and service exist in `src/services/oauth/`, but there are no corresponding route handlers (`/auth/google`, `/auth/google/callback`) or controller methods in the authentication module.
* **Recommendation:** Expose OAuth endpoints or document OAuth usage in the template README.

---

## 3. Missing Architectural Concepts for a Production Reusable Template

### 3.1 Rate Limiting & Brute-Force Protection
* **Why it's critical:** Without rate limiting, the server is vulnerable to:
  1. Brute-force credential attacks on `POST /auth/login`.
  2. OTP spam / email service exhaustion on `POST /auth/send-code`.
  3. Disk and network exhaustion on `POST /upload`.
* **Recommendation:** Add `express-rate-limit` with differentiated limiters:
  - Auth rate limiter (e.g. 5 attempts / 15 min per IP/account).
  - OTP request rate limiter (e.g. 3 requests / 10 min per IP/email).
  - General API rate limiter (e.g. 100 requests / min).

---

### 3.2 Unified Request Validation Middleware (`body`, `query`, `params`)
* **Why it's critical:** Currently, only `validateBody` exists. Endpoints with query parameters or URL route parameters (`:userId`, `:id`) cannot validate their inputs declaratively with Zod.
* **Recommendation:** Implement a unified validator:
  ```typescript
  import { z, ZodTypeAny } from 'zod';
  import { Request, Response, NextFunction } from 'express';

  interface RequestSchema {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
  }

  export const validateRequest = (schema: RequestSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
        req.body = result.data;
      }
      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
        req.query = result.data;
      }
      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
        req.params = result.data;
      }
      next();
    };
  };
  ```

---

### 3.3 Comprehensive Health Check Probes
* **Why it's critical:** In Kubernetes / Docker environments, `/healthz` is used as a readiness and liveness probe. If the database or Redis crashes, `/healthz` still returns `200 OK`, preventing orchestrators from detecting dead instances.
* **Recommendation:**
  ```typescript
  app.get('/healthz', async (_req: Request, res: Response) => {
    try {
      await databaseService.client.$queryRaw`SELECT 1`;
      await redisService.client.ping();
      res.status(200).json({ status: 'ok', database: 'healthy', redis: 'healthy' });
    } catch (error) {
      res.status(503).json({ status: 'degraded', error: (error as Error).message });
    }
  });
  ```

---

### 3.4 Distributed Tracing & Correlation IDs
* **Why it's critical:** When debugging production issues, matching frontend requests to backend log lines is difficult without a unique Request ID.
* **Recommendation:** Add a lightweight correlation ID middleware:
  ```typescript
  import crypto from 'node:crypto';

  app.use((req, res, next) => {
    const correlationId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    req.headers['x-request-id'] = correlationId;
    res.setHeader('x-request-id', correlationId);
    next();
  });
  ```

---

### 3.5 Database Seeding Mechanism
* **Why it's critical:** The database schema defines an `Admin` model, but no seed script (`prisma/seed.ts`) exists. On a fresh clone/deployment, there is no way to create the initial root admin account through the API without manually injecting records into PostgreSQL.
* **Recommendation:** Add a `prisma/seed.ts` script executed via `npx prisma db seed` that creates a default administrator if none exists.

---

### 3.6 Automated Temporary Storage Pruning (TTL)
* **Why it's critical:** The `/upload` route creates temporary files (`tmp/{uuid}.ext`) before registration or profile updates. If a user uploads an image but abandons the registration form, the file remains in storage indefinitely.
* **Recommendation:** Use a scheduled BullMQ repeatable job or cloud lifecycle rule (e.g. S3 Lifecycle Rule to auto-expire `tmp/` objects after 24 hours).

---

## 4. Action Plan & Quick Reference Checklist

| Priority | Issue / Task | Affected File(s) | Status / Fix |
|:---:|---|---|---|
| 🔴 **P0** | Fix Error Middleware status code handling | `src/middleware/global.middleware.ts` | Return `error.statusCode` instead of hardcoded `500` |
| 🔴 **P0** | Fix hanging password route controllers | `src/module/user/user.controller.ts`<br>`src/module/admin/admin.controller.ts` | Add `res.status(200).json(...)` |
| 🔴 **P0** | Fix admin update targeting `user` table | `src/module/admin/admin.service.ts` | Update `admin` table instead of `user` |
| 🔴 **P0** | Fix inverted admin middleware order | `src/module/admin/admin.route.ts` | Order: `authMiddleware, guard(UserType.ADMIN)` |
| 🔴 **P0** | Fix `tsc` build script path aliases | `package.json` | Change build script to `"tsc && tsc-alias"` |
| 🟡 **P1** | Fix registration `dialCode` property typo | `src/module/auth/auth.service.ts` | Rename `dailcode` to `dialCode` |
| 🟡 **P1** | Add `validateQuery` / `validateParams` | `src/middleware/body.validate.middleware.ts`<br>`src/module/user/user.route.ts` | Validate `req.query` for GET routes |
| 🟡 **P1** | Enable mail processor worker in dev | `src/lifecycle/compose.up.ts` | Remove production-only gate for mail worker |
| 🟡 **P1** | Fix template file path resolution | `src/services/mail/renderer.ts` | Copy templates to `dist/` and resolve dynamically |
| 🟢 **P2** | Add initial Admin database seed script | `prisma/seed.ts`<br>`package.json` | Create default admin seed |
| 🟢 **P2** | Add rate limiting on auth & upload | `src/middleware/rate-limit.middleware.ts` | Throttle brute-force and upload spam |
| 🟢 **P2** | Enhance health check with DB/Redis probes | `src/app.ts` | Add ping checks for PostgreSQL and Redis |
