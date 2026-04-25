const axios = require('axios');

function test(baseURL, url) {
  const instance = axios.create({ baseURL });
  const fullURL = instance.getUri({ url });
  console.log(`baseURL: "${baseURL}", url: "${url}" => result: "${fullURL}"`);
}

console.log("--- Testing Axios URL Joining ---");
test('http://localhost:3000/api', '/courses');
test('http://localhost:3000/api/', '/courses');
test('http://localhost:3000/api', 'courses');
test('http://localhost:3000/api/', 'courses');
test('http://localhost:3000/api', '/attendance/sessions/active');
