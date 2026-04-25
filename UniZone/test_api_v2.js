const axios = require('axios');

const API_URL = 'http://localhost:3000/api/';

const api = axios.create({
  baseURL: API_URL,
});

async function test() {
  try {
    console.log("Testing GET /courses");
    const res1 = await api.get("/courses");
    console.log("SUCCESS:", res1.status);
  } catch (err) {
    console.log("ERROR:", err.response?.status, err.response?.data);
  }

  try {
    console.log("Testing POST /attendance/sessions (without auth, should be 401/403 but not 404)");
    const res2 = await api.post("/attendance/sessions", {});
    console.log("SUCCESS:", res2.status);
  } catch (err) {
    console.log("ERROR:", err.response?.status, err.response?.data);
  }
}

test();
