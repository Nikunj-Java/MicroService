import { expect, test } from '@playwright/test';

type AppRole = 'MISSION_ADMIN' | 'MISSION_OPERATOR' | 'MISSION_VIEW';

const accounts = [
  { id: 1, name: 'Alice Account', balance: 1500 },
  { id: 2, name: 'Bob Account', balance: 2600 },
];

const corsHeaders = {
  'access-control-allow-origin': 'http://localhost:4200',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
};

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

async function mockApis(page: import('@playwright/test').Page) {
  await page.route('http://localhost:8083/login', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders,
      });
      return;
    }

    const body = route.request().postDataJSON() as { username?: string; password?: string };
    const username = body.username ?? '';

    const roleMap: Record<string, AppRole[]> = {
      alice1: ['MISSION_ADMIN'],
      alice2: ['MISSION_OPERATOR'],
      alice3: ['MISSION_VIEW'],
      alice4: ['MISSION_OPERATOR', 'MISSION_VIEW'],
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify({
        accessToken: createAccessToken(username, roleMap[username] ?? ['MISSION_VIEW']),
      }),
    });
  });

  await page.route('http://localhost:8081/v1/accounts/', async (route) => {
    const method = route.request().method();

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders,
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(accounts),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify({ id: 99, name: 'Created User', balance: 4000 }),
    });
  });

  await page.route('http://localhost:8081/v1/accounts/*', async (route) => {
    const method = route.request().method();

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders,
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          account: accounts[0],
          transaction: [],
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify('ok'),
    });
  });
}

async function login(page: import('@playwright/test').Page, username: string) {
  await mockApis(page);
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill('mission123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/users$/);
}

test('admin can see role, users, and management actions', async ({ page }) => {
  await login(page, 'alice1');

  await expect(page.getByText('alice1')).toBeVisible();
  await expect(page.getByText('Role: MISSION_ADMIN')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'User Directory' })).toBeVisible();
  await expect(page.getByText('Alice Account')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Register User' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh Data' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Update' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' }).first()).toBeVisible();
});

test('view role can see accounts but not management buttons', async ({ page }) => {
  await login(page, 'alice3');

  await expect(page.getByText('Role: MISSION_VIEW')).toBeVisible();
  await expect(page.getByText('Alice Account')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh Data' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Details' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Register User' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Update' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
});