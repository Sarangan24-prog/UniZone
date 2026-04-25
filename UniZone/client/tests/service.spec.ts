import { test, expect, Page, Route } from "@playwright/test";

type Role = "student" | "staff" | "admin";

type MockState = {
  categories: Array<{ _id: string; name: string; description?: string; isActive?: boolean }>;
  hostelMine: any[];
  hostelAll: any[];
  idCardMine: any[];
  certMine: any[];
  complaintMine: any[];
  lostFoundAll: any[];
  genericMine: any[];
  genericAll: any[];
};

type Counters = {
  hostelPost: number;
  idCardPost: number;
  certPost: number;
  complaintPost: number;
  lostFoundPost: number;
  genericPost: number;
  categoryPost: number;
  anyPut: number;
};

function nowIso() {
  return new Date().toISOString();
}

function defaultState(): MockState {
  return {
    categories: [{ _id: "c1", name: "IT Support", description: "Tech help", isActive: true }],
    hostelMine: [],
    hostelAll: [],
    idCardMine: [],
    certMine: [],
    complaintMine: [],
    lostFoundAll: [],
    genericMine: [],
    genericAll: [],
  };
}

function defaultCounters(): Counters {
  return {
    hostelPost: 0,
    idCardPost: 0,
    certPost: 0,
    complaintPost: 0,
    lostFoundPost: 0,
    genericPost: 0,
    categoryPost: 0,
    anyPut: 0,
  };
}

async function setAuth(page: Page, role: Role) {
  // Navigate to base URL to establish origin
  await page.goto("/");
  await page.evaluate((r) => {
    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: "u1",
        name: "Playwright User",
        email: "pw@unizone.test",
        role: r,
      })
    );
    localStorage.setItem("splash-seen", "true");
  }, role);
}

async function mockApi(page: Page, state: MockState, counters: Counters) {
  await page.route("**/api/**", async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    const json = async (data: any, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(data),
      });

    // Categories
    if (path.endsWith("/api/categories") && method === "GET") return json(state.categories);
    if (path.endsWith("/api/categories") && method === "POST") {
      counters.categoryPost += 1;
      const body = req.postDataJSON?.() ?? {};
      const item = { _id: `cat-${Date.now()}`, ...body, isActive: true };
      state.categories.push(item);
      return json(item, 201);
    }

    // Hostel
    if (path.endsWith("/api/services/hostel/mine") && method === "GET") return json(state.hostelMine);
    if (path.endsWith("/api/services/hostel") && method === "GET") return json(state.hostelAll);
    if (path.endsWith("/api/services/hostel") && method === "POST") {
      counters.hostelPost += 1;
      const body = req.postDataJSON?.() ?? {};
      const created = { _id: `h-${Date.now()}`, status: "open", createdAt: nowIso(), ...body };
      state.hostelMine.unshift(created);
      state.hostelAll.unshift({ ...created, userId: { _id: "u1", name: "Playwright User" } });
      return json(created, 201);
    }
    if (/\/api\/services\/hostel\/[^/]+$/.test(path) && method === "PUT") {
      counters.anyPut += 1;
      const body = req.postDataJSON?.() ?? {};
      const id = path.split("/").pop()!;
      const list = [...state.hostelMine, ...state.hostelAll];
      list.forEach((x) => {
        if (x._id === id) x.status = body.status;
      });
      return json({ _id: id, status: body.status });
    }

    // ID Card
    if (path.endsWith("/api/services/idcard/mine") && method === "GET") return json(state.idCardMine);
    if (path.endsWith("/api/services/idcard") && method === "POST") {
      counters.idCardPost += 1;
      const created = { _id: `id-${Date.now()}`, status: "open", createdAt: nowIso(), reason: "New" };
      state.idCardMine.unshift(created);
      return json(created, 201);
    }

    // Certificate
    if (path.endsWith("/api/services/certificate/mine") && method === "GET") return json(state.certMine);
    if (path.endsWith("/api/services/certificate") && method === "POST") {
      counters.certPost += 1;
      const body = req.postDataJSON?.() ?? {};
      const created = { _id: `cert-${Date.now()}`, status: "open", createdAt: nowIso(), ...body };
      state.certMine.unshift(created);
      return json(created, 201);
    }

    // Complaint
    if (path.endsWith("/api/services/complaint/mine") && method === "GET") return json(state.complaintMine);
    if (path.endsWith("/api/services/complaint") && method === "POST") {
      counters.complaintPost += 1;
      const body = req.postDataJSON?.() ?? {};
      const created = { _id: `cmp-${Date.now()}`, status: "open", createdAt: nowIso(), ...body };
      state.complaintMine.unshift(created);
      return json(created, 201);
    }

    // Lost & Found
    if (path.endsWith("/api/services/lostfound") && method === "GET") return json(state.lostFoundAll);
    if (path.endsWith("/api/services/lostfound") && method === "POST") {
      counters.lostFoundPost += 1;
      const body = req.postDataJSON?.() ?? {};
      const created = { _id: `lf-${Date.now()}`, status: "active", createdAt: nowIso(), userId: { _id: "u1" }, ...body };
      state.lostFoundAll.unshift(created);
      return json(created, 201);
    }
    if (/\/api\/services\/lostfound\/[^/]+$/.test(path) && method === "PUT") {
      counters.anyPut += 1;
      const body = req.postDataJSON?.() ?? {};
      const id = path.split("/").pop()!;
      state.lostFoundAll = state.lostFoundAll.map((x) => (x._id === id ? { ...x, status: body.status } : x));
      return json({ _id: id, status: body.status });
    }

    // Generic services
    if (path.endsWith("/api/services/mine") && method === "GET") return json(state.genericMine);
    if (path.endsWith("/api/services") && method === "GET") return json(state.genericAll);
    if (path.endsWith("/api/services") && method === "POST") {
      counters.genericPost += 1;
      const body = req.postDataJSON?.() ?? {};
      const created = { _id: `g-${Date.now()}`, status: "open", createdAt: nowIso(), ...body };
      state.genericMine.unshift(created);
      state.genericAll.unshift({ ...created, userId: { _id: "u1", name: "Playwright User" } });
      return json(created, 201);
    }
    if (/\/api\/services\/[^/]+$/.test(path) && method === "PUT") {
      counters.anyPut += 1;
      return json({ ok: true });
    }

    // Default returns to prevent crashes
    if (method === "GET") {
      if (path.includes("/mine") || path.includes("/services") || path.includes("/categories")) {
        return json([]);
      }
    }

    return json({});
  });
}

async function openServices(page: Page) {
  await page.goto("/services");

  // Wait for the splash screen to finish (it takes 1.8s)
  // We wait for the "Services Management" title with a generous timeout.
  // If we are redirected to /login, this will fail.
  const title = page.getByText("Services Management");
  try {
    await expect(title).toBeVisible({ timeout: 15000 });
  } catch (e) {
    const url = page.url();
    console.log(`Failed to see "Services Management". Current URL: ${url}`);
    if (url.includes("/login")) {
      console.log("Redirected to /login. Auth failed?");
      const token = await page.evaluate(() => localStorage.getItem("token"));
      console.log(`Token in localStorage: ${token}`);
    }
    throw e;
  }
}

test("1) Student can open Services page and see default Hostel tab", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await expect(page.getByRole("button", { name: /Hostel/i })).toBeVisible();
  await expect(page.getByText(/File a New Hostel/i)).toBeVisible();
});

test("2) Hostel validation blocks submit when duration is out of range", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByLabel("Duration (Semesters, 1-8)").fill("0");
  await page.getByRole("button", { name: /Submit Hostel Request/i }).click();

  await expect(page.getByText(/Duration must be between 1 and 8 semesters/i)).toBeVisible();
  expect(counters.hostelPost).toBe(0);
});

test("3) Student can submit Hostel request successfully", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByLabel("Room Type").selectOption("Shared");
  await page.getByLabel("Duration (Semesters, 1-8)").fill("2");
  await page.getByRole("button", { name: /Submit Hostel Request/i }).click();

  expect(counters.hostelPost).toBe(1);
  await expect(page.getByText(/Hostel: Shared Room/i)).toBeVisible();
});

test("4) ID Card (New) requires profile photo file", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /ID Card/i }).click();
  await page.getByLabel("Full Name").fill("Test Student");
  await page.getByLabel("Department").fill("Computer Science");
  await page.getByLabel("Batch/Year").fill("2022");
  await page.getByLabel("Phone Number").fill("0712345678");
  await page.getByLabel("National ID (NIC)").fill("123456789V");
  await page.getByRole("button", { name: /Submit ID Card Request/i }).click();

  await expect(page.getByText(/profile picture is required/i)).toBeVisible();
  expect(counters.idCardPost).toBe(0);
});

test("5) ID Card (Lost) rejects future loss date", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /ID Card/i }).click();
  await page.getByLabel("Application Reason").selectOption("Lost");
  await page.getByLabel("Full Name").fill("Lost User");
  await page.getByLabel("Student ID").fill("STU12345");
  await page.getByLabel("Date of Loss").fill("2099-01-01");
  await page.getByLabel("Location Where Lost").fill("Library");
  await page.getByRole("button", { name: /Submit ID Card Request/i }).click();

  await expect(page.getByText(/cannot be in the future/i)).toBeVisible();
  expect(counters.idCardPost).toBe(0);
});

test("6) Certificate type Other requires description", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /Certificates/i }).click();
  await page.getByLabel("Certificate Type").selectOption("Other");
  await page.getByRole("button", { name: /Submit Certificates Request/i }).click();

  await expect(page.getByText(/description of at least 5 characters is required/i)).toBeVisible();
  expect(counters.certPost).toBe(0);
});

test("7) Complaint validation enforces minimum lengths", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /Complaints/i }).click();
  await page.getByLabel("Subject").fill("Bad");
  await page.getByLabel("Description (min 20 chars)").fill("Too short");
  await page.getByRole("button", { name: /Submit Complaints Request/i }).click();

  await expect(page.getByText(/Subject must be at least 5 characters/i)).toBeVisible();
  await expect(page.getByText(/minimum 20 characters/i)).toBeVisible();
  expect(counters.complaintPost).toBe(0);
});

test("8) Student can submit Lost & Found item", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /Lost & Found/i }).click();
  await page.getByLabel("Report Type").selectOption("Lost");
  await page.getByLabel("Item Name").fill("Black Wallet");
  await page.getByLabel("Location").fill("Main Canteen");
  await page.getByLabel("Date").fill("2026-04-20");
  await page.getByLabel("Contact Email or Phone").fill("0712345678");
  await page.getByLabel("Description").fill("Contains student card and cash");
  await page.getByRole("button", { name: /Submit Lost & Found Request/i }).click();

  expect(counters.lostFoundPost).toBe(1);
  await expect(page.getByText(/Black Wallet/i)).toBeVisible();
});

test("9) General Services shows warning when no categories available", async ({ page }) => {
  const state = defaultState();
  state.categories = [];
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /General Services/i }).click();
  await expect(page.getByText(/No service categories available yet/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Submit General Services Request/i })).toHaveCount(0);
});

test("10) Student can submit General Service request with active category", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /General Services/i }).click();
  await page.getByLabel("Service Category").selectOption("IT Support");
  await page.getByLabel("Detailed Description (min 10 chars)").fill("Need help with campus Wi-Fi in hostel block.");
  await page.getByRole("button", { name: /Submit General Services Request/i }).click();

  expect(counters.genericPost).toBe(1);
  await expect(page.getByText(/Service: IT Support/i)).toBeVisible();
});

test("11) Staff can create service category from General Services tab", async ({ page }) => {
  const state = defaultState();
  const counters = defaultCounters();
  await setAuth(page, "staff");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /General Services/i }).click();
  await expect(page.getByText(/Admin Configuration/i)).toBeVisible();
  await page.getByLabel("New Category Name").fill("Gym Maintenance");
  await page.getByLabel("Category Description (Optional)").fill("Handle gym complaints and maintenance");
  await page.getByRole("button", { name: /Create Service Category/i }).click();

  expect(counters.categoryPost).toBe(1);
  await expect(page.getByText(/Gym Maintenance/i)).toBeVisible();
});

test("12) Staff can update Hostel request status", async ({ page }) => {
  const state = defaultState();
  state.hostelAll = [
    { _id: "h1", roomType: "Single", duration: 2, status: "open", createdAt: nowIso(), userId: { _id: "u2", name: "Student A" } },
  ];
  const counters = defaultCounters();
  await setAuth(page, "staff");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /Hostel/i }).click();
  const statusSelect = page.locator("select").filter({ has: page.locator("option[value='approved']") }).first();
  await statusSelect.selectOption("approved");

  expect(counters.anyPut).toBeGreaterThan(0);
});

test("13) Student can mark own Lost & Found item as resolved", async ({ page }) => {
  const state = defaultState();
  state.lostFoundAll = [
    {
      _id: "lf-own",
      type: "Lost",
      itemName: "Blue Bag",
      description: "Contains books",
      location: "Library",
      date: "2026-04-19T00:00:00.000Z",
      contactInfo: "0700000000",
      status: "active",
      createdAt: nowIso(),
      userId: { _id: "u1", name: "Playwright User" },
    },
  ];
  const counters = defaultCounters();
  await setAuth(page, "student");
  await mockApi(page, state, counters);
  await openServices(page);

  await page.getByRole("button", { name: /Lost & Found/i }).click();
  await page.getByRole("button", { name: /Mark as Resolved/i }).click();

  expect(counters.anyPut).toBeGreaterThan(0);
});