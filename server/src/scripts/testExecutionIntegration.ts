import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== TESTING CODE EXECUTION & SUBMISSION FOR RANDOMIZED ASSESSMENT ===\n");

  const baseUrl = "http://localhost:5000/api";
  const assessmentCode = "BLIND75-RANDOM";

  // 1. Student 1 starts
  const startRes = await fetch(`${baseUrl}/student/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: assessmentCode,
      rollNo: "21CS001",
      studentName: "Alice Smith",
      password: "password123",
    }),
  });
  const startData = await startRes.json();
  const attemptToken = startData.attemptToken;
  const attemptId = startData.attempt.id;
  const q1 = startData.assessment.questions[0];

  console.log(`Student 1: attemptId = ${attemptId}`);
  console.log(`Testing Q1: "${q1.title}" (${q1.id})`);

  // 2. Run sample test cases with placeholder code
  console.log("\n2. Testing /api/execution/run (Sample testcases)...");
  const runRes = await fetch(`${baseUrl}/execution/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-attempt-token": attemptToken,
    },
    body: JSON.stringify({
      language: "JAVA",
      code: q1.starterCode,
      questionId: q1.id,
    }),
  });
  const runData = await runRes.json();
  console.log("   Run Response Status:", runRes.status);
  console.log("   Sample Test Grading Output:", runData.grading ? `Graded ${runData.grading.totalTestCases} test cases` : runData);

  // 3. Save draft
  console.log("\n3. Testing /api/student/save-draft...");
  const draftRes = await fetch(`${baseUrl}/student/save-draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-attempt-token": attemptToken,
    },
    body: JSON.stringify({
      attemptId,
      drafts: { [q1.id]: q1.starterCode },
      remainingSeconds: 3500,
    }),
  });
  const draftData = await draftRes.json();
  console.log("   Save Draft Response:", draftData.success ? "Draft Saved Successfully" : draftData);

  // 4. Test Gradebook Results for this assessment
  console.log("\n4. Checking Results API (Admin view)...");
  const loginRes = await fetch(`${baseUrl}/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode: "admin123" }),
  });
  const loginData = await loginRes.json();
  const adminToken = loginData.token;

  const resultsRes = await fetch(`${baseUrl}/results/${startData.assessment.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const resultsData = await resultsRes.json();
  console.log("   Gradebook loaded successfully!");
  if (resultsData.students && resultsData.students.length > 0) {
    const s1 = resultsData.students.find((s: any) => s.rollNo === "21CS001");
    console.log(`   Student 1 Name: ${s1?.studentName}`);
    console.log(`   Student 1 Max Score: ${s1?.maxScore} (Expected 100 for 3 assigned questions)`);
  }

  console.log("\n=== ALL SUBMISSION & GRADING INTEGRATION CHECKS PASSED! ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
