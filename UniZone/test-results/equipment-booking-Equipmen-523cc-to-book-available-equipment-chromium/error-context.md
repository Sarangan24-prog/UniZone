# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: equipment-booking.spec.ts >> Equipment Booking Workflow >> should allow a student to book available equipment
- Location: UniZone\tests\equipment-booking.spec.ts:49:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect, type Dialog } from '@playwright/test';
  2  | 
  3  | const API = 'http://localhost:3000/api';
  4  | 
  5  | const ADMIN_EMAIL = 'teststaff@test.com';
  6  | const ADMIN_PASSWORD = 'password123';
  7  | const TEST_EMAIL = 'finalstudent@test.com';
  8  | const TEST_PASSWORD = 'password123';
  9  | 
  10 | let createdEquipmentId: string;
  11 | let adminToken: string;
  12 | 
  13 | test.describe('Equipment Booking Workflow', () => {
  14 |   test.beforeAll(async ({ request }) => {
  15 |     // Register staff user (ignore if already exists)
  16 |     await request.post(`${API}/auth/register`, {
  17 |       data: { name: 'Test Staff', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'staff', roleCreateKey: 'admin123' },
  18 |     });
  19 | 
  20 |     // Login as staff to get token
  21 |     const loginRes = await request.post(`${API}/auth/login`, {
  22 |       data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  23 |     });
  24 |     const loginData = await loginRes.json();
  25 |     adminToken = loginData.token;
  26 | 
  27 |     // Create test equipment
  28 |     const equipRes = await request.post(`${API}/equipment`, {
  29 |       headers: { Authorization: `Bearer ${adminToken}` },
  30 |       data: { name: 'Playwright Test Bat', sportCategory: 'Cricket', totalQuantity: 10, description: 'Created by Playwright test' },
  31 |     });
  32 |     const equip = await equipRes.json();
  33 |     createdEquipmentId = equip._id;
  34 | 
  35 |     // Register student user (ignore if already exists)
  36 |     await request.post(`${API}/auth/register`, {
  37 |       data: { name: 'Final Student', email: TEST_EMAIL, password: TEST_PASSWORD, role: 'student' },
  38 |     });
  39 |   });
  40 | 
  41 |   test.afterAll(async ({ request }) => {
  42 |     if (createdEquipmentId && adminToken) {
  43 |       await request.delete(`${API}/equipment/${createdEquipmentId}`, {
  44 |         headers: { Authorization: `Bearer ${adminToken}` },
  45 |       });
  46 |     }
  47 |   });
  48 | 
  49 |   test('should allow a student to book available equipment', async ({ page }) => {
  50 |     // 1. Login as student
> 51 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  52 |     await page.fill('label:has-text("Email") input, input[placeholder*="@"]', TEST_EMAIL);
  53 |     await page.fill('label:has-text("Password") input, input[type="password"]', TEST_PASSWORD);
  54 |     await page.click('button:has-text("Sign In")');
  55 |     await expect(page).toHaveURL('/');
  56 | 
  57 |     // 2. Navigate to Equipment Page
  58 |     await page.goto('/sports/equipment');
  59 | 
  60 |     // 3. Click "Book Now" on the seeded equipment
  61 |     const bookNowButton = page.locator('button:has-text("Book Now")').first();
  62 |     await expect(bookNowButton).toBeVisible({ timeout: 15000 });
  63 |     await bookNowButton.click();
  64 | 
  65 |     // 4. Fill the Booking Modal
  66 |     await expect(page.locator('h3:has-text("Book")')).toBeVisible();
  67 |     await page.fill('label:has-text("Quantity") input', '1');
  68 |     await page.fill('label:has-text("Pickup Time") input', '10:00');
  69 |     await page.fill('label:has-text("Special Requests / Notes") textarea', 'Testing with Playwright');
  70 | 
  71 |     // 5. Handle alert and submit
  72 |     page.on('dialog', async (dialog: Dialog) => {
  73 |       expect(dialog.message()).toContain('Booking request submitted');
  74 |       await dialog.accept();
  75 |     });
  76 |     await page.click('button:has-text("Submit Booking Request")');
  77 | 
  78 |     // 6. Verify modal closed and booking appears in the table
  79 |     await expect(page.locator('h3:has-text("Book")')).not.toBeVisible();
  80 |     await expect(page.locator('text=My Bookings')).toBeVisible();
  81 |     await expect(page.locator('td:has-text("Playwright Test Bat")').first()).toBeVisible();
  82 |   });
  83 | });
  84 | 
```