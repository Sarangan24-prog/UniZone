import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

const ADMIN_EMAIL = 'teststaff@test.com';
const ADMIN_PASSWORD = 'password123';
const TEST_EMAIL = 'finalstudent@test.com';
const TEST_PASSWORD = 'password123';
const ROLE_CREATE_KEY = 'admin'; // matches backend .env ROLE_CREATE_KEY

let adminToken: string;
let studentToken: string;
let createdCourseId: string;

// ────────────────────────────────────────────────────
//  SETUP
// ────────────────────────────────────────────────────
test.describe('Course Management Workflow', () => {
  test.beforeAll(async ({ request }) => {
    // Register admin/staff (ignore if already exists)
    await request.post(`${API}/auth/register`, {
      data: {
        name: 'Test Staff',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'staff',
        roleCreateKey: ROLE_CREATE_KEY,
      },
    });

    // Register student (ignore if already exists)
    await request.post(`${API}/auth/register`, {
      data: {
        name: 'Final Student',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'student',
        roleCreateKey: ROLE_CREATE_KEY,
      },
    });

    // Login as staff to get admin token
    const adminLogin = await request.post(`${API}/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.token;
    expect(adminToken).toBeTruthy();

    // Login as student to get student token
    const studentLogin = await request.post(`${API}/auth/login`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    const studentData = await studentLogin.json();
    studentToken = studentData.token;
    expect(studentToken).toBeTruthy();
  });

  // ────────────────────────────────────────────────────
  //  AUTH GUARD TESTS
  // ────────────────────────────────────────────────────
  test.describe('Authentication & Authorization', () => {
    test('GET /courses — should reject unauthenticated requests', async ({ request }) => {
      const res = await request.get(`${API}/courses`);
      expect(res.status()).toBe(401);
    });

    test('POST /courses — student should not be able to create a course', async ({ request }) => {
      const res = await request.post(`${API}/courses`, {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {
          title: 'Unauthorized Course',
          code: 'UN001',
          department: 'CSE',
          capacity: 30,
        },
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body.message).toContain('Insufficient permissions');
    });
  });

  // ────────────────────────────────────────────────────
  //  CREATE
  // ────────────────────────────────────────────────────
  test.describe('Create Course (admin/staff)', () => {
    test('POST /courses — should create a new course with valid data', async ({ request }) => {
      const res = await request.post(`${API}/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          title: 'Playwright Test Course',
          code: `PW${Date.now().toString().slice(-6)}`,
          department: 'CSE',
          schedule: 'Monday 9-11am',
          capacity: 40,
          description: 'Created by Playwright test',
          features: ['Online', 'Project-based'],
        },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body._id).toBeTruthy();
      expect(body.title).toBe('Playwright Test Course');
      expect(body.department).toBe('CSE');
      expect(body.enrolledStudents).toHaveLength(0);
      createdCourseId = body._id;
    });

    test('POST /courses — should reject course with missing required fields', async ({ request }) => {
      const res = await request.post(`${API}/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          // missing title, code, department, capacity
          schedule: 'Tuesday',
        },
      });
      expect(res.status()).toBe(400);
    });

    test('POST /courses — should reject invalid department value', async ({ request }) => {
      const res = await request.post(`${API}/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          title: 'Bad Department Course',
          code: 'BAD001',
          department: 'INVALID_DEPT',
          capacity: 30,
        },
      });
      expect(res.status()).toBe(400);
    });
  });

  // ────────────────────────────────────────────────────
  //  READ
  // ────────────────────────────────────────────────────
  test.describe('Read Courses', () => {
    test('GET /courses — should return list of courses for authenticated user', async ({ request }) => {
      const res = await request.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test('GET /courses — should return list for student too', async ({ request }) => {
      const res = await request.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('GET /courses — returned courses should include the created course', async ({ request }) => {
      const res = await request.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await res.json();
      const found = body.find((c: { _id: string }) => c._id === createdCourseId);
      expect(found).toBeTruthy();
      expect(found.title).toBe('Playwright Test Course');
    });
  });

  // ────────────────────────────────────────────────────
  //  UPDATE
  // ────────────────────────────────────────────────────
  test.describe('Update Course (admin/staff)', () => {
    test('PUT /courses/:id — should update course title and description', async ({ request }) => {
      const res = await request.put(`${API}/courses/${createdCourseId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          title: 'Updated Playwright Course',
          description: 'Updated by Playwright test',
          schedule: 'Wednesday 2-4pm',
        },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.title).toBe('Updated Playwright Course');
      expect(body.description).toBe('Updated by Playwright test');
      expect(body.schedule).toBe('Wednesday 2-4pm');
    });

    test('PUT /courses/:id — student should not be able to update a course', async ({ request }) => {
      const res = await request.put(`${API}/courses/${createdCourseId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { title: 'Student Hack Course' },
      });
      expect(res.status()).toBe(403);
    });

    test('PUT /courses/:invalidId — should return 400 or 404 for invalid ID', async ({ request }) => {
      const res = await request.put(`${API}/courses/000000000000000000000000`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { title: 'Ghost Course' },
      });
      expect([400, 404]).toContain(res.status());
    });
  });

  // ────────────────────────────────────────────────────
  //  ENROLLMENT
  // ────────────────────────────────────────────────────
  test.describe('Course Enrollment (student)', () => {
    test('POST /courses/:id/enroll — student should enroll successfully', async ({ request }) => {
      const res = await request.post(`${API}/courses/${createdCourseId}/enroll`, {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {},
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.enrolledStudents.length).toBeGreaterThan(0);
    });

    test('POST /courses/:id/enroll — should reject duplicate enrollment', async ({ request }) => {
      const res = await request.post(`${API}/courses/${createdCourseId}/enroll`, {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {},
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.message).toContain('Already enrolled');
    });

    test('POST /courses/:id/enroll — admin/staff should not be able to enroll', async ({ request }) => {
      const res = await request.post(`${API}/courses/${createdCourseId}/enroll`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {},
      });
      expect(res.status()).toBe(403);
    });
  });

  // ────────────────────────────────────────────────────
  //  DROP
  // ────────────────────────────────────────────────────
  test.describe('Drop Course (student)', () => {
    test('POST /courses/:id/drop — student should drop the course', async ({ request }) => {
      const res = await request.post(`${API}/courses/${createdCourseId}/drop`, {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {},
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const stillEnrolled = body.enrolledStudents.some(
        (s: { _id?: string; toString?: () => string }) =>
          typeof s === 'string' ? s === studentToken : s._id === studentToken
      );
      expect(stillEnrolled).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────
  //  DELETE
  // ────────────────────────────────────────────────────
  test.describe('Delete Course (admin/staff)', () => {
    test('DELETE /courses/:id — student should not be able to delete a course', async ({ request }) => {
      const res = await request.delete(`${API}/courses/${createdCourseId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      expect(res.status()).toBe(403);
    });

    test('DELETE /courses/:id — admin should delete the course', async ({ request }) => {
      const res = await request.delete(`${API}/courses/${createdCourseId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.message).toContain('deleted');
    });

    test('DELETE /courses/:id — deleted course should not appear in list', async ({ request }) => {
      const res = await request.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await res.json();
      const found = body.find((c: { _id: string }) => c._id === createdCourseId);
      expect(found).toBeUndefined();
    });

    test('DELETE /courses/:invalidId — should return 404 for non-existent course', async ({ request }) => {
      const res = await request.delete(`${API}/courses/000000000000000000000000`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status()).toBe(404);
    });
  });
});
