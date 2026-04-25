require('dotenv').config();
const http = require('http');

// Simulate the full flow:
// 1. POST /api/attendance/scan/public with a valid session
// 2. Verify 201 response
// 3. Try same regNo again — should get 400 "already marked"

const active_sessionId = 'session_1777031245409'; // from our check-sessions
const courseId = '69e88ef8f7624c67595186cc';
const date = '2026-04-24';
const regNo = 'IT/2021/TEST';
const studentName = 'John Test';

function post(body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname: '172.28.15.158', // Using network IP like phone would
      port: 3000,
      path: '/api/attendance/scan/public',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Origin': 'http://172.28.15.158:5174' // Simulate cross-origin from phone
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function run() {
  console.log('--- Test 1: Mark attendance using network IP (simulating phone) ---');
  const r1 = await post({ courseId, sessionId: active_sessionId, date, regNo, studentName });
  console.log('Status:', r1.status);
  console.log('Response:', JSON.stringify(r1.body, null, 2));
  
  console.log('\n--- Test 2: Try to mark again (should fail with duplicate error) ---');
  const r2 = await post({ courseId, sessionId: active_sessionId, date, regNo, studentName });
  console.log('Status:', r2.status);
  console.log('Response:', r2.body);
  
  console.log('\n--- Test 3: Invalid/expired session ---');
  const r3 = await post({ courseId, sessionId: 'session_invalid_99999', date, regNo: 'IT/2021/TEST2', studentName });
  console.log('Status:', r3.status);
  console.log('Response:', r3.body);
}

run().catch(console.error);
