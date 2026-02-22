#!/usr/bin/env node

/**
 * AI Student Hub - API Testing Suite
 * Tests all endpoints and functionality
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';
let testResults = [];

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            body: json
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test function
async function test(name, method, path, body = null, headers = {}, expectedStatus = 200) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const result = await makeRequest(method, path, body, headers);
    
    const passed = result.statusCode === expectedStatus;
    testResults.push({
      name,
      passed,
      statusCode: result.statusCode,
      expectedStatus
    });

    if (passed) {
      console.log(`✅ PASSED (${result.statusCode})`);
      console.log('Response:', JSON.stringify(result.body, null, 2).substring(0, 500));
    } else {
      console.log(`❌ FAILED - Expected ${expectedStatus}, got ${result.statusCode}`);
      console.log('Response:', result.body);
    }

    return result.body;
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
    testResults.push({
      name,
      passed: false,
      error: err.message
    });
    return null;
  }
}

// Main test suite
async function runTests() {
  console.log('🚀 AI Student Hub API Testing Suite\n');
  console.log('=' * 50);

  // 1. Test home endpoint
  await test('GET / - Home endpoint', 'GET', '/');

  // 2. Test API documentation
  await test('GET /api/docs - API Documentation', 'GET', '/api/docs');

  // 3. Register new user
  const userEmail = `student${Date.now()}@hub.ai`;
  const registerResult = await test(
    'POST /api/users/create - Register new user',
    'POST',
    '/api/users/create',
    {
      name: 'Test Student',
      email: userEmail,
      password: 'testPassword123'
    },
    {},
    201
  );

  // 4. Login with the new user
  const loginResult = await test(
    'POST /api/users/login - Login user',
    'POST',
    '/api/users/login',
    {
      email: userEmail,
      password: 'testPassword123'
    }
  );

  let authToken = null;
  if (loginResult && loginResult.token) {
    authToken = loginResult.token;
    console.log(`\n🔐 Auth Token: ${authToken.substring(0, 20)}...`);
  }

  if (!authToken) {
    console.log('\n⚠️ Could not obtain auth token, skipping authenticated tests');
  } else {
    // 5. Get dashboard
    await test(
      'GET /api/dashboard - User Dashboard',
      'GET',
      '/api/dashboard',
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );

    // 6. Get user's tools
    await test(
      'GET /api/tools/mytools - Get connected tools',
      'GET',
      '/api/tools/mytools',
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );

    // 7. Connect a tool (ChatGPT)
    await test(
      'POST /api/tools/connect/chatGPT - Connect ChatGPT',
      'POST',
      '/api/tools/connect/chatGPT',
      { apiKey: 'sk-test-key-123' },
      { 'Authorization': `Bearer ${authToken}` },
      200
    );

    // 8. Get updated tools
    await test(
      'GET /api/tools/mytools - Get tools after connection',
      'GET',
      '/api/tools/mytools',
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );

    // 9. Search dashboard
    await test(
      'POST /api/dashboard/search - Search tools',
      'POST',
      '/api/dashboard/search',
      { query: 'create presentation' },
      { 'Authorization': `Bearer ${authToken}` }
    );

    // 10. Get recommendations
    await test(
      'POST /api/tools/recommend - Get recommendations',
      'POST',
      '/api/tools/recommend',
      { userQuery: 'I need to code an app', category: 'coding' },
      { 'Authorization': `Bearer ${authToken}` }
    );

    // 11. Get learning resources
    await test(
      'GET /api/dashboard/resources - Learning resources',
      'GET',
      '/api/dashboard/resources',
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );

    // 12. Redirect to tool
    await test(
      'GET /api/tools/redirect/chatGPT - Tool redirection',
      'GET',
      '/api/tools/redirect/chatGPT?query=explain machine learning',
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );

    // 13. Connect GitHub
    await test(
      'POST /api/tools/connect/github - Connect GitHub',
      'POST',
      '/api/tools/connect/github',
      { token: 'github-token-123', username: 'teststudent' },
      { 'Authorization': `Bearer ${authToken}` },
      200
    );

    // 14. Disconnect a tool
    await test(
      'POST /api/tools/disconnect/chatGPT - Disconnect tool',
      'POST',
      '/api/tools/disconnect/chatGPT',
      null,
      { 'Authorization': `Bearer ${authToken}` },
      200
    );

    // 15. Get all users
    await test(
      'GET /api/users - Get all users',
      'GET',
      '/api/users'
    );
  }

  // 16. Test 404 endpoint
  await test(
    'GET /api/nonexistent - 404 handling',
    'GET',
    '/api/nonexistent',
    null,
    {},
    404
  );

  // Print summary
  console.log('\n\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY\n');

  const passed = testResults.filter(t => t.passed).length;
  const total = testResults.length;
  const percentage = ((passed / total) * 100).toFixed(2);

  testResults.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${result.name}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`\n🎯 Results: ${passed}/${total} tests passed (${percentage}%)\n`);

  if (passed === total) {
    console.log('🎉 All tests passed! AI Student Hub is working perfectly!');
  } else {
    console.log(`⚠️ ${total - passed} test(s) failed. Please check the errors above.`);
  }

  process.exit(passed === total ? 0 : 1);
}

// Run tests after a short delay to allow server to start
setTimeout(runTests, 2000);
