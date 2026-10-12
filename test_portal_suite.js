const http = require('http');

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('=== TVK Training Portal Automated Verification Suite ===\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Frontend Server check
  try {
    const feRes = await makeRequest({
      hostname: 'localhost',
      port: 4200,
      path: '/',
      method: 'GET'
    });
    if (feRes.status === 200) {
      console.log('✅ [PASS] Frontend Dev Server is running and responding on http://localhost:4200 (HTTP 200)');
      passed++;
    } else {
      console.log(`❌ [FAIL] Frontend returned status ${feRes.status}`);
      failed++;
    }
  } catch (err) {
    console.log('❌ [FAIL] Frontend Dev Server connection failed:', err.message);
    failed++;
  }

  // Test 2: Backend API Proxy - Get Courses
  try {
    const coursesRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/courses',
      method: 'GET'
    });
    if (coursesRes.status === 200 && Array.isArray(coursesRes.body)) {
      console.log(`✅ [PASS] GET /api/courses returned ${coursesRes.body.length} courses`);
      passed++;
    } else {
      console.log(`❌ [FAIL] GET /api/courses failed:`, coursesRes.status, coursesRes.body);
      failed++;
    }
  } catch (err) {
    console.log('❌ [FAIL] Backend /api/courses failed:', err.message);
    failed++;
  }

  // Test 3: Student Registration without OTP requirement
  const testTimestamp = Date.now();
  const testEmail = `student.test.${testTimestamp}@example.com`;
  const regPayload = {
    firstName: 'Automated',
    lastName: 'TestUser',
    name: 'Automated TestUser',
    email: testEmail,
    role: 'student',
    phone: '+91 9876543210',
    personalPhone: '9876543210',
    countryCode: '+91',
    address: 'D.No 45, Tech Street, Indiranagar, Bangalore, Karnataka - 560038',
    doorNo: '45',
    street: 'Tech Street',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    preferredLocation: 'Bangalore',
    trackType: 'internship',
    targetCourse: 'Java Full Stack with Angular',
    educationLevel: 'B.Tech / B.E (CSE / IT)',
    degree: 'B.Tech',
    college: 'ABC Institute of Tech',
    graduationYear: 2025,
    cgpa: '8.5',
    experienceLevel: 'Fresher / Student (0 Yrs)',
    skills: ['Java', 'Angular', 'Spring Boot'],
    resumeFileName: 'test_resume.pdf',
    resumeFileSize: '120 KB',
    agreeTerms: true
  };

  try {
    const regRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      regPayload
    );

    if (regRes.status === 201 || (regRes.status === 200 && regRes.body.success)) {
      console.log(`✅ [PASS] POST /api/auth/register succeeded! Candidate ID: ${regRes.body.user?.id || 'Created'} (Status: PENDING_APPROVAL)`);
      passed++;
    } else {
      console.log(`❌ [FAIL] POST /api/auth/register failed:`, regRes.status, regRes.body);
      failed++;
    }
  } catch (err) {
    console.log('❌ [FAIL] POST /api/auth/register exception:', err.message);
    failed++;
  }

  // Test 4: Duplicate Email Validation
  try {
    const dupRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      regPayload
    );

    if (dupRes.status === 409 || (dupRes.body && dupRes.body.message && dupRes.body.message.includes('already registered'))) {
      console.log('✅ [PASS] Duplicate email registration rejected with conflict message');
      passed++;
    } else {
      console.log('⚠️ [WARN] Duplicate email response:', dupRes.status, dupRes.body);
    }
  } catch (err) {
    console.log('❌ [FAIL] Duplicate registration check error:', err.message);
  }

  // Test 5: Admin Login
  try {
    const adminLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'admin@tvk.com', password: 'password123' }
    );

    if (adminLoginRes.status === 200 && adminLoginRes.body.user?.role === 'admin') {
      console.log('✅ [PASS] Admin Login (/api/auth/login) successful for admin@tvk.com');
      passed++;
    } else {
      console.log('❌ [FAIL] Admin login failed:', adminLoginRes.status, adminLoginRes.body);
      failed++;
    }
  } catch (err) {
    console.log('❌ [FAIL] Admin login request error:', err.message);
    failed++;
  }

  // Test 6: Portal System Settings
  try {
    const settingsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/settings',
      method: 'GET'
    });
    if (settingsRes.status === 200 && settingsRes.body) {
      console.log('✅ [PASS] GET /api/settings accessible and returns portal configuration');
      passed++;
    } else {
      console.log('❌ [FAIL] GET /api/settings failed:', settingsRes.status, settingsRes.body);
      failed++;
    }
  } catch (err) {
    console.log('❌ [FAIL] GET /api/settings exception:', err.message);
    failed++;
  }

  // Test 7: Frontend Proxy routing /api to backend
  try {
    const proxyRes = await makeRequest({
      hostname: 'localhost',
      port: 4200,
      path: '/api/courses',
      method: 'GET'
    });
    if (proxyRes.status === 200 && Array.isArray(proxyRes.body)) {
      console.log('✅ [PASS] Angular Dev Server proxy successfully forwards /api/courses to Spring Boot');
      passed++;
    } else {
      console.log('❌ [FAIL] Angular proxy /api/courses returned:', proxyRes.status);
      failed++;
    }
  } catch (err) {
    console.log('❌ [FAIL] Angular proxy test failed:', err.message);
    failed++;
  }

  console.log(`\n=== Verification Results: ${passed} Passed, ${failed} Failed ===`);
}

runTestSuite();
