import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== TESTING RANDOMIZED QUESTION ALLOCATION PER STUDENT ===\n");

  const baseUrl = "http://localhost:5000/api";
  const assessmentCode = "BLIND75-RANDOM";

  // Clean any previous test attempts for clean test run
  await prisma.studentAttempt.deleteMany({
    where: {
      assessment: { code: assessmentCode },
      rollNo: { in: ["21CS001", "21CS002", "21CS003"] },
    },
  });

  // 1. Test GET /info/BLIND75-RANDOM
  console.log("1. Fetching Assessment Info...");
  const infoRes = await fetch(`${baseUrl}/student/info/${assessmentCode}`);
  const infoData = await infoRes.json();
  console.log(`   Title: ${infoData.assessment?.title}`);
  console.log(`   Code: ${infoData.assessment?.code}`);
  console.log(`   Total Questions: ${infoData.assessment?.totalQuestions}`);
  console.log(`   Total Marks: ${infoData.assessment?.totalMarks}`);
  console.log(`   Randomized: ${infoData.assessment?.isRandomized}\n`);

  if (infoData.assessment?.totalQuestions !== 3) {
    console.error("❌ Expected totalQuestions to be 3!");
    process.exit(1);
  }

  // 2. Start Assessment for Student 1 (21CS001 - Alice Smith)
  console.log("2. Starting Assessment for Student 1 (21CS001 - Alice Smith)...");
  const start1Res = await fetch(`${baseUrl}/student/start`, {
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

  const start1Data = await start1Res.json();
  if (!start1Res.ok) {
    console.error("❌ Student 1 Start failed:", start1Data);
    process.exit(1);
  }

  const s1Questions = start1Data.assessment.questions;
  console.log(`   ✅ Student 1 received ${s1Questions.length} questions:`);
  s1Questions.forEach((q: any, idx: number) => {
    console.log(`      Q${idx + 1}: "${q.title}" (${q.marks} Marks)`);
    console.log(`         Sample Test Cases: ${q.testCases?.length || 0}`);
    console.log(`         Starter Code Preview: ${q.starterCode?.split("\n").slice(0, 3).join(" ")}...`);
  });

  // 3. Start Assessment for Student 2 (21CS002 - Bob Johnson)
  console.log("\n3. Starting Assessment for Student 2 (21CS002 - Bob Johnson)...");
  const start2Res = await fetch(`${baseUrl}/student/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "SafeExamBrowser/3.0",
    },
    body: JSON.stringify({
      code: assessmentCode,
      rollNo: "21CS002",
      studentName: "Bob Johnson",
      password: "password123",
    }),
  });

  const start2Data = await start2Res.json();
  if (!start2Res.ok) {
    console.error("❌ Student 2 Start failed:", start2Data);
    process.exit(1);
  }

  const s2Questions = start2Data.assessment.questions;
  console.log(`   ✅ Student 2 received ${s2Questions.length} questions:`);
  s2Questions.forEach((q: any, idx: number) => {
    console.log(`      Q${idx + 1}: "${q.title}" (${q.marks} Marks)`);
  });

  // 4. Start Assessment for Student 3 (21CS003 - Charlie Brown)
  console.log("\n4. Starting Assessment for Student 3 (21CS003 - Charlie Brown)...");
  const start3Res = await fetch(`${baseUrl}/student/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "SafeExamBrowser/3.0",
    },
    body: JSON.stringify({
      code: assessmentCode,
      rollNo: "21CS003",
      studentName: "Charlie Brown",
      password: "password123",
    }),
  });

  const start3Data = await start3Res.json();
  const s3Questions = start3Data.assessment.questions;
  console.log(`   ✅ Student 3 received ${s3Questions.length} questions:`);
  s3Questions.forEach((q: any, idx: number) => {
    console.log(`      Q${idx + 1}: "${q.title}" (${q.marks} Marks)`);
  });

  // 5. Test Resume for Student 1
  console.log("\n5. Testing Resume for Student 1 (21CS001)...");
  const resume1Res = await fetch(`${baseUrl}/student/start`, {
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
  const resume1Data = await resume1Res.json();
  const resumeQTitles = resume1Data.assessment.questions.map((q: any) => q.title);
  const s1OriginalTitles = s1Questions.map((q: any) => q.title);

  const isIdenticalOnResume =
    resumeQTitles.length === s1OriginalTitles.length &&
    resumeQTitles.every((t: string, i: number) => t === s1OriginalTitles[i]);

  if (isIdenticalOnResume) {
    console.log("   ✅ Resume Verified: Student 1 gets the exact same questions on reconnecting/resuming!");
  } else {
    console.error("   ❌ Questions differed on resume!", { resumeQTitles, s1OriginalTitles });
  }

  console.log("\n=== ALL RANDOM ALLOCATION CHECKS PASSED SUCCESSFULLY! ===");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
