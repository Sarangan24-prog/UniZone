import { test, expect, type Dialog } from '@playwright/test';

const API = 'http://localhost:3000/api';

const ADMIN_EMAIL = 'teststaff@test.com';
const ADMIN_PASSWORD = 'password123';
const TEST_EMAIL = 'finalstudent@test.com';
const TEST_PASSWORD = 'password123';

let createdEquipmentId: string;
let adminToken: string;

test.describe('Equipment Booking Workflow', () => {
  test.beforeAll(async ({ request }) => {
    // Register staff user (ignore if already exists)
    await request.post(`${API}/auth/register`, {
      data: { name: 'Test Staff', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'staff', roleCreateKey: 'admin123' },
    });

    // Login as staff to get token
    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const loginData = await loginRes.json();
    adminToken = loginData.token;

    // Create test equipment
    const equipRes = await request.post(`${API}/equipment`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Playwright Test Bat', sportCategory: 'Cricket', totalQuantity: 10, description: 'Created by Playwright test' },
    });
    const equip = await equipRes.json();
    createdEquipmentId = equip._id;

    // Register student user (ignore if already exists)
    await request.post(`${API}/auth/register`, {
      data: { name: 'Final Student', email: TEST_EMAIL, password: TEST_PASSWORD, role: 'student' },
    });
  });

  test.afterAll(async ({ request }) => {
    if (createdEquipmentId && adminToken) {
      await request.delete(`${API}/equipment/${createdEquipmentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  });

  test('should allow a student to book available equipment', async ({ page }) => {
    // 1. Login as student
    await page.goto('/login');
    await page.fill('label:has-text("Email") input, input[placeholder*="@"]', TEST_EMAIL);
    await page.fill('label:has-text("Password") input, input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/');

    // 2. Navigate to Equipment Page
    await page.goto('/sports/equipment');

    // 3. Click "Book Now" on the seeded equipment
    const bookNowButton = page.locator('button:has-text("Book Now")').first();
    await expect(bookNowButton).toBeVisible({ timeout: 15000 });
    await bookNowButton.click();

    // 4. Fill the Booking Modal
    await expect(page.locator('h3:has-text("Book")')).toBeVisible();
    await page.fill('label:has-text("Quantity") input', '1');
    await page.fill('label:has-text("Pickup Time") input', '10:00');
    await page.fill('label:has-text("Special Requests / Notes") textarea', 'Testing with Playwright');

    // 5. Handle alert and submit
    page.on('dialog', async (dialog: Dialog) => {
      expect(dialog.message()).toContain('Booking request submitted');
      await dialog.accept();
    });
    await page.click('button:has-text("Submit Booking Request")');

    // 6. Verify modal closed and booking appears in the table
    await expect(page.locator('h3:has-text("Book")')).not.toBeVisible();
    await expect(page.locator('text=My Bookings')).toBeVisible();
    await expect(page.locator('td:has-text("Playwright Test Bat")').first()).toBeVisible();
  });
});
