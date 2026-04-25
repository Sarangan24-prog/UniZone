require('dotenv').config();
const http = require('http');

const body = JSON.stringify({
  courseId: '69e88ef8f7624c67595186cc',
  sessionId: 'session_1777031245409',
  date: '2026-04-24',
  regNo: 'TEST456',
  studentName: 'Test Student 2'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/attendance/scan/public',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
