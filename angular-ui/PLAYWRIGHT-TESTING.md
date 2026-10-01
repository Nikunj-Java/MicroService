# Playwright End-to-End Testing Guide

This document explains how Playwright was added to this Angular application, how the first end-to-end tests work, and how to extend them.

## What Was Added

The Playwright setup for this project consists of these files:

- `package.json`
- `playwright.config.ts`
- `tests/e2e/auth-and-users.spec.ts`

## Why Playwright

Playwright is a good fit here because it can:

- open the real Angular application in a browser
- intercept network requests to mock backend APIs
- verify routing, login flow, and role-based UI behavior
- run locally and in CI with the same commands

For this application, mocking the backend is the simplest way to get stable tests because the UI depends on:

- `http://localhost:8083/login`
- `http://localhost:8081/v1/accounts/`

## Step 1: Install Playwright

Run these commands from the `angular-ui` folder:

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

What this does:

- installs the Node package dependencies
- downloads the Chromium browser used by Playwright tests

## Step 2: Add NPM Scripts

The following scripts were added to `package.json`:

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:headed": "playwright test --headed",
    "e2e:ui": "playwright test --ui"
  }
}
```

Use them like this:

```powershell
npm.cmd run e2e
npm.cmd run e2e:headed
npm.cmd run e2e:ui
```

## Step 3: Add Playwright Configuration

The file `playwright.config.ts` starts the Angular dev server automatically before tests run.

```ts
import { defineConfig } from '@playwright/test';

const isWindows = process.platform === 'win32';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: isWindows
      ? 'npm.cmd run start -- --host localhost --port 4200'
      : 'npm run start -- --host localhost --port 4200',
    url: 'http://localhost:4200/login',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
```

Why this matters:

- `baseURL` lets tests use paths like `/login`
- `webServer` starts Angular automatically
- `reuseExistingServer` avoids restarting the app unnecessarily during local work

## Step 4: Add the First End-to-End Test

The first spec file is `tests/e2e/auth-and-users.spec.ts`.

It tests:

- login flow
- route redirection to `/users`
- role display in the navbar
- role-based visibility of action buttons
- user list rendering from mocked backend data

### JWT Mocking Strategy

The application reads roles from the access token. To test that behavior without a real backend, the Playwright test creates a small fake JWT payload:

```ts
function createAccessToken(username: string, roles: AppRole[]): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: username,
    roles,
  };

  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');

  return `${encode(header)}.${encode(payload)}.signature`;
}
```

This is enough for UI testing because the frontend only needs to decode the token payload.

### API Mocking Strategy

The spec intercepts browser requests and returns mock responses:

```ts
const corsHeaders = {
  'access-control-allow-origin': 'http://localhost:4200',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
};

await page.route('http://localhost:8083/login', async (route) => {
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({ status: 204, headers: corsHeaders });
    return;
  }

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: corsHeaders,
    body: JSON.stringify({
      accessToken: createAccessToken('alice1', ['MISSION_ADMIN']),
    }),
  });
});

await page.route('http://localhost:8081/v1/accounts/', async (route) => {
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({ status: 204, headers: corsHeaders });
    return;
  }

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: corsHeaders,
    body: JSON.stringify([
      { id: 1, name: 'Alice Account', balance: 1500 },
      { id: 2, name: 'Bob Account', balance: 2600 }
    ]),
  });
});
```

This makes the tests deterministic and removes any dependency on live backend services.

The CORS headers matter because the Angular app calls `localhost:8083` and `localhost:8081` from `localhost:4200`. Without handling `OPTIONS` and returning CORS headers, the browser will block the mocked responses.

## Step 5: Current Test Scenarios

### Scenario 1: Admin user

User: `alice1`

Expected behavior:

- login succeeds
- app navigates to `/users`
- navbar shows `Role: MISSION_ADMIN`
- user table loads mock accounts
- `Register User`, `Update`, and `Delete` are visible

### Scenario 2: View-only user

User: `alice3`

Expected behavior:

- login succeeds
- navbar shows `Role: MISSION_VIEW`
- user table loads mock accounts
- `Details` is visible
- `Register User`, `Update`, and `Delete` are not rendered

## Step 6: Run the Tests

From the `angular-ui` folder:

```powershell
npm.cmd run e2e
```

To watch the browser while tests run:

```powershell
npm.cmd run e2e:headed
```

To open the Playwright UI runner:

```powershell
npm.cmd run e2e:ui
```

## Step 7: Read the Report

After test execution, Playwright generates an HTML report. Open it with:

```powershell
npx.cmd playwright show-report
```

## How To Add More Tests

To extend the suite, follow this pattern:

1. Add or reuse a `page.route(...)` mock for the API call.
2. Navigate to the screen under test.
3. Perform the user action.
4. Assert the visible result.

Examples you can add next:

1. operator can create a user but cannot delete
2. logout returns the user to `/login`
3. invalid login shows the error message
4. edit flow loads the selected user into the form

## Suggested Next Test Example

If you want to test logout, the structure would look like this:

```ts
test('logout sends the user back to login', async ({ page }) => {
  await login(page, 'alice1');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
```

## Summary

This Playwright setup gives you:

- a repeatable Angular E2E test workflow
- mocked authentication and account APIs
- validation for login, routing, role display, and role-based UI behavior
- a base structure that can be extended as the application grows