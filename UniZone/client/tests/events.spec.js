import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Admin credentials
const ADMIN_EMAIL = 'ad24@gmail.com';
const ADMIN_PASSWORD = 'ad24@@';

// Student credentials
const STUDENT_EMAIL = 'sk24@gmail.com';
const STUDENT_PASSWORD = 'sk24@@';

// Helper function to login
async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input').first().fill(email);
  await page.locator('input').nth(1).fill(password);
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);
}

// Test 1: Admin can view Events page
test('Admin can view Events page', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await expect(page.locator('h1')).toContainText('Event Management');
});

// Test 2: Admin can create an event
test('Admin can create an event', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await page.click('button:has-text("NEW EVENT")');
  await page.waitForTimeout(1000);
  await page.locator('input').first().fill('Playwright Test Event');
  await expect(page.locator('text=Create Event')).toBeVisible();
});

// Test 3: Student can view Events page
test('Student can view Events page', async ({ page }) => {
  await login(page, STUDENT_EMAIL, STUDENT_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await expect(page.locator('h1')).toContainText('Event Management');
});

// Test 4: Student can see My Registrations tab
test('Student can see My Registrations tab', async ({ page }) => {
  await login(page, STUDENT_EMAIL, STUDENT_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await expect(page.getByRole('button', { name: /My Registrations/i })).toBeVisible();
});

// Test 5: Student can see Event Statistics
test('Student can see Event Statistics', async ({ page }) => {
  await login(page, STUDENT_EMAIL, STUDENT_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await page.getByRole('button', { name: /Event Statistics/i }).click();
  await expect(page.getByRole('heading', { name: 'Event Statistics' })).toBeVisible();
});

// Test 6: Events page shows stats cards
test('Events page shows stats cards', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await expect(page.locator('text=Total Events')).toBeVisible();
  await expect(page.getByText('Upcoming', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Ended', { exact: true }).first()).toBeVisible();
});

// Test 7: Admin can see Ticket Requests button
test('Admin can see Ticket Requests button', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await expect(page.locator('text=TICKET REQUESTS')).toBeVisible();
});

// Test 8: Events page shows countdown timer column
test('Events page shows countdown timer column', async ({ page }) => {
  await login(page, STUDENT_EMAIL, STUDENT_PASSWORD);
  await page.goto(`${BASE_URL}/events`);
  await expect(page.locator('text=Countdown')).toBeVisible();
});