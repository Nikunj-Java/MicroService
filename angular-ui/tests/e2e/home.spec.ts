import {test,expect} from '@playwright/test';
test('Angular application loads',async({page})=>{
    await page.goto('http://localhost:4200');
    await expect(page).toHaveTitle(/AngularUi/);
})