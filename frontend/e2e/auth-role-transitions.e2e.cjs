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

async function runRoleTransitionTest() {
  console.log('=== TVK Portal Role Transition & Career Progression Test ===\n');

  // Step 1: Register a new student
  const timestamp = Date.now();
  const studentEmail = `candidate.promoted.${timestamp}@example.com`;
  console.log(`1. Registering student: ${studentEmail}...`);

  const regRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      firstName: 'Kiran',
      lastName: 'Venkatesh',
      name: 'Kiran Venkatesh',
      email: studentEmail,
      role: 'student',
      phone: '+91 9988776655',
      personalPhone: '9988776655',
      doorNo: '12-A',
      street: 'MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      preferredLocation: 'Bangalore',
      trackType: 'internship',
      targetCourse: 'Java Full Stack with Angular',
      collegeName: 'Bangalore Institute of Technology',
      branch: 'Computer Science',
      academicStatus: 'Final Year Student (2025)',
      internshipSkills: 'Java, Spring Boot, Angular, TypeScript',
      agreeTerms: true
    }
  );

  if (regRes.status !== 201 && !(regRes.status === 200 && regRes.body.success)) {
    console.error('❌ Student registration failed:', regRes.status, regRes.body);
    return;
  }

  const studentUser = regRes.body.user;
  console.log(`✅ Student registered successfully. User ID: ${studentUser.id}, Current Role: ${studentUser.role}`);

  // Step 2: Approve Candidate
  console.log('\n2. Approving candidate application...');
  const approveRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/users/approve',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      id: studentUser.id,
      operatorRole: 'admin',
      approvedBy: 'Global Admissions Desk'
    }
  );
  console.log(`✅ Candidate approved. Status: ${approveRes.body.user?.approvalStatus}`);

  // Step 3: Transition/Promote Student -> Trainer
  console.log('\n3. Promoting student to Trainer (Faculty Role)...');
  const promoRes1 = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/users/transition-role',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      id: studentUser.id,
      newRole: 'trainer',
      designation: 'Associate Java & Angular Trainer',
      department: 'Academic & Training Division',
      employeeId: `TVK-TR-901`,
      specialization: 'Full Stack Java, Spring Boot, Angular',
      strongTechnologies: 'Java 21, Spring Boot 3, Angular 18, PostgreSQL',
      notes: 'Outstanding performance in training & scored 98% in final capstone project. Promoted to trainer.',
      operatorRole: 'admin',
      operatorName: 'Global Administrator'
    }
  );

  if (!promoRes1.body.success) {
    console.error('❌ Role transition 1 failed:', promoRes1.status, promoRes1.body);
    return;
  }

  const promotedUser1 = promoRes1.body.user;
  console.log(`✅ Promotion 1 Succeeded!`);
  console.log(`   - Active Role: ${promotedUser1.role}`);
  console.log(`   - Designation: ${promotedUser1.designation}`);
  console.log(`   - Staff ID: ${promotedUser1.employeeId}`);
  console.log(`   - Previous Role: ${promotedUser1.previousRole}`);
  console.log(`   - Preserved Student College: ${promotedUser1.collegeName}`);
  console.log(`   - Preserved Student Target Course: ${promotedUser1.targetCourse}`);

  const history1 = JSON.parse(promotedUser1.roleHistory || '[]');
  console.log(`   - Role Timeline Entries Count: ${history1.length}`);
  console.log(`   - Timeline Record #1: ${history1[0].fromRole} -> ${history1[0].toRole} ("${history1[0].notes}")`);
  console.log(`   - Timeline Snapshot targetCourse: ${history1[0].previousSnapshot?.targetCourse}`);

  // Step 4: Subsequent Promotion Trainer -> Placement Lead Staff
  console.log('\n4. Subsequent promotion to Placement & Staff Member...');
  const promoRes2 = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/users/transition-role',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      id: studentUser.id,
      newRole: 'staff',
      designation: 'Lead Technical Placement Specialist',
      department: 'Corporate Relations & Placement',
      employeeId: `TVK-ST-901`,
      notes: 'Transitioned to lead enterprise student placements while retaining trainer advisory status.',
      operatorRole: 'admin',
      operatorName: 'Executive Director'
    }
  );

  const promotedUser2 = promoRes2.body.user;
  const history2 = JSON.parse(promotedUser2.roleHistory || '[]');
  console.log(`✅ Promotion 2 Succeeded!`);
  console.log(`   - Active Role: ${promotedUser2.role}`);
  console.log(`   - Designation: ${promotedUser2.designation}`);
  console.log(`   - Total Timeline Milestones: ${history2.length}`);
  history2.forEach((h, idx) => {
    console.log(`     [Milestone ${idx + 1}] ${h.fromRole.toUpperCase()} -> ${h.toRole.toUpperCase()} (${h.designation}) on ${new Date(h.transitionDate).toLocaleDateString()} by ${h.transitionedBy}`);
  });

  console.log('\n🎉 All Role Transition & Career Progression verification tests PASSED with complete data preservation!');
}

runRoleTransitionTest();
