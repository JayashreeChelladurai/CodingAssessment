import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== RUNNING RESTART & RANDOM QUESTION VERIFICATION ===");

  const baseUrl = "http://localhost:5000/api";
  const assessmentCode = "BLIND75-RANDOM";

  // 1. Fetch Assessment Info
  console.log("\n1. Verifying Assessment Public Info...");
  const infoRes = await fetch(`${baseUrl}/student/info/${assessmentCode}`);
  const infoData = await infoRes.json();
  console.log(`   Duration Minutes: ${infoData.assessment?.durationMinutes}`);
  console.log(`   Total Questions: ${infoData.assessment?.totalQuestions}`);
  console.log(`   Total Marks: ${infoData.assessment?.totalMarks}`);

  if (infoData.assessment?.durationMinutes !== 90) {
    throw new Error(`Expected durationMinutes to be 90, got ${infoData.assessment?.durationMinutes}`);
  }
  if (infoData.assessment?.totalQuestions !== 3) {
    throw new Error(`Expected totalQuestions to be 3, got ${infoData.assessment?.totalQuestions}`);
  }
  if (infoData.assessment?.totalMarks !== 100) {
    throw new Error(`Expected totalMarks to be 100, got ${infoData.assessment?.totalMarks}`);
  }

  // 2. Test Login for Alice Smith (21CS001) - Previously expired / canceled
  console.log("\n2. Testing Fresh Login for Student (21CS001 - Alice Smith)...");
  const loginRes = await fetch(`${baseUrl}/student/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "SafeExamBrowser/3.0",
    },
    body: JSON.stringify({
      code: assessmentCode,
      rollNo: "21CS001",
      studentName: "Alice Smith",
      password: "password123",
    }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }

  console.log(`   Attempt ID: ${loginData.attempt.id}`);
  console.log(`   Status: ${loginData.attempt.status}`);
  console.log(`   Remaining Seconds: ${loginData.attempt.remainingSeconds} (~${Math.round(loginData.attempt.remainingSeconds / 60)} minutes)`);
  console.log(`   Started At: ${loginData.attempt.startedAt}`);
  console.log(`   Questions Count: ${loginData.assessment.questions.length}`);
  console.log(`   Total Marks: ${loginData.assessment.totalMarks}`);

  loginData.assessment.questions.forEach((q: any, i: number) => {
    console.log(`      Q${i + 1}: "${q.title}" (${q.marks} Marks, ${q.testCases?.length || 0} sample testcases)`);
  });

  if (loginData.attempt.status !== "IN_PROGRESS") {
    throw new Error(`Expected status to be IN_PROGRESS, got ${loginData.attempt.status}`);
  }
  if (loginData.attempt.remainingSeconds < 5300 || loginData.attempt.remainingSeconds > 5400) {
    throw new Error(`Expected remainingSeconds around 5400 (90m), got ${loginData.attempt.remainingSeconds}`);
  }
  if (loginData.assessment.questions.length !== 3) {
    throw new Error(`Expected exactly 3 questions, got ${loginData.assessment.questions.length}`);
  }

  // 3. Test that re-login after intentional timeout / submit restarts freshly
  console.log("\n3. Testing Fresh Restart if Attempt was Marked SUBMITTED or TIME_EXPIRED...");
  await prisma.studentAttempt.update({
    where: { id: loginData.attempt.id },
    data: {
      status: "TIME_EXPIRED",
      remainingSeconds: 0,
      submittedAt: new Date(),
    },
  });

  const reLoginRes = await fetch(`${baseUrl}/student/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "SafeExamBrowser/3.0",
    },
    body: JSON.stringify({
      code: assessmentCode,
      rollNo: "21CS001",
      studentName: "Alice Smith",
      password: "password123",
    }),
  });

  const reLoginData = await reLoginRes.json();
  if (!reLoginRes.ok) {
    throw new Error(`Re-login failed after TIME_EXPIRED: ${JSON.stringify(reLoginData)}`);
  }

  console.log(`   Re-login Status: ${reLoginData.attempt.status}`);
  console.log(`   Re-login Remaining Seconds: ${reLoginData.attempt.remainingSeconds}`);
  console.log(`   Re-login Questions Count: ${reLoginData.assessment.questions.length}`);

  if (reLoginData.attempt.status !== "IN_PROGRESS") {
    throw new Error(`Expected status to be reset to IN_PROGRESS on login, got ${reLoginData.attempt.status}`);
  }
  if (reLoginData.attempt.remainingSeconds < 5300 || reLoginData.attempt.remainingSeconds > 5400) {
    throw new Error(`Expected fresh remainingSeconds around 5400 (90m), got ${reLoginData.attempt.remainingSeconds}`);
  }

  // 4. Test Check Attempt Status
  console.log("\n4. Testing Attempt Status endpoint for resumed attempt...");
  const statusRes = await fetch(`${baseUrl}/student/attempt-status/${loginData.attempt.id}`, {
    headers: {
      "x-attempt-token": reLoginData.attemptToken,
    },
  });

  const statusData = await statusRes.json();
  console.log(`   Status: ${statusData.status}`);
  console.log(`   Remaining Seconds: ${statusData.remainingSeconds}`);
  console.log(`   Is Locked: ${statusData.isLocked}`);
  console.log(`   Is Expired: ${statusData.isExpired}`);

  if (statusData.status !== "IN_PROGRESS" || statusData.isExpired || statusData.isLocked) {
    throw new Error(`Attempt status endpoint returned unexpected state: ${JSON.stringify(statusData)}`);
  }

  console.log("\n=== ALL VERIFICATIONS PASSED WITH 100% SUCCESS! ===");
}

main()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
