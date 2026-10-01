import {test,expect} from '@playwright/test';

test('user can login', async ({ page }) => {
    await page.goto('http://localhost:4200/login');
    await page.getByLabel('Username').fill('alice1');
    await page.getByLabel('Password').fill('mission123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/users/);
});