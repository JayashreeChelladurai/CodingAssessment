import { prisma } from "../src/db.js";
import { generateSebConfig } from "../src/services/sebService.js";
import { gradeSqlQuestion } from "../src/services/gradingService.js";

async function main() {
  console.log("=================================================");
  console.log("🧪 VERIFYING ASSESSMENT SQL-1 & PROFESSOR VIEWER");
  console.log("=================================================");

  // 1. Verify Assessment Record
  const sqlAssessment = await prisma.assessment.findUnique({
    where: { code: "SQL-1" },
    include: {
      sections: true,
      questions: {
        orderBy: { order: "asc" },
        include: { testCases: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!sqlAssessment) {
    throw new Error("❌ Assessment SQL-1 not found in DB!");
  }

  console.log(`✅ Assessment Found: ${sqlAssessment.title} (${sqlAssessment.code})`);
  console.log(`   - ID: ${sqlAssessment.id}`);
  console.log(`   - Duration: ${sqlAssessment.durationMinutes} minutes (Expected: 30)`);
  console.log(`   - SEB Mandatory: ${sqlAssessment.requireSeb} (Expected: true)`);
  console.log(`   - SEB Quit Password: ${sqlAssessment.sebQuitPassword} (Expected: exit123)`);
  console.log(`   - Questions Count: ${sqlAssessment.questions.length} (Expected: 5)`);

  if (sqlAssessment.durationMinutes !== 30) throw new Error("Duration is not 30 minutes!");
  if (!sqlAssessment.requireSeb) throw new Error("requireSeb is not true!");
  if (sqlAssessment.questions.length !== 5) throw new Error("Question count is not 5!");

  // Verify SEB Configuration Generator
  const sebConfigXml = generateSebConfig({
    startUrl: `http://localhost:3000/student/exam/${sqlAssessment.code}`,
    quitPassword: sqlAssessment.sebQuitPassword || "exit123",
    title: sqlAssessment.title,
  });
  if (!sebConfigXml.includes("SQL-1") || !sebConfigXml.includes("quitURLConfirm")) {
    throw new Error("SEB config generation failed or missing required tags!");
  }
  console.log(`✅ SEB .seb configuration generates valid plist XML (${sebConfigXml.length} bytes)`);

  // Verify Total Marks & Questions
  let totalMarks = 0;
  console.log("\n--- Questions Breakdown ---");
  for (let i = 0; i < sqlAssessment.questions.length; i++) {
    const q = sqlAssessment.questions[i];
    totalMarks += q.marks;
    console.log(`   [Q${i + 1}] ${q.title}`);
    console.log(`        Marks: ${q.marks}m | Type: ${q.type} | Test Cases: ${q.testCases.length}`);
    if (q.type !== "SQL") throw new Error(`Question ${q.id} type is not SQL!`);
    if (q.marks !== 20) throw new Error(`Question ${q.id} marks is not 20!`);
    if (q.testCases.length < 2) throw new Error(`Question ${q.id} must have at least 2 test cases!`);
  }
  console.log(`   Total Assessment Marks: ${totalMarks} / 100`);
  if (totalMarks !== 100) throw new Error("Total marks must equal 100!");

  // 2. Test Grading Engine on All 5 Questions
  console.log("\n=================================================");
  console.log("⚡ TESTING SQL GRADING ENGINE ON ALL 5 QUERIES");
  console.log("=================================================");

  for (let i = 0; i < sqlAssessment.questions.length; i++) {
    const q = sqlAssessment.questions[i];
    console.log(`\nTesting Question #${i + 1}: ${q.title}`);

    // A. Correct canonical query test
    const gradingPass = await gradeSqlQuestion(q, q.solutionSql, false);
    console.log(`   Canonical Query Status: ${gradingPass.status} | Score: ${gradingPass.totalScore}/${gradingPass.maxScore} (${gradingPass.passedTestCases}/${gradingPass.totalTestCases} Test Cases)`);
    if (gradingPass.status !== "ACCEPTED" || gradingPass.totalScore !== q.marks) {
      throw new Error(`Canonical solution failed for Question ${i + 1}: ${JSON.stringify(gradingPass)}`);
    }

    // B. Sample Run test (public test cases only)
    const gradingSample = await gradeSqlQuestion(q, q.solutionSql, true);
    if (gradingSample.totalTestCases !== 1 || !gradingSample.testCaseResults[0].isPublic) {
      throw new Error(`Sample run did not restrict evaluation to public test cases!`);
    }

    // C. Intentional Syntax Error Test
    const gradingSyntaxErr = await gradeSqlQuestion(q, "SELECT FROM WHERE INVALID_SQL;", false);
    if (gradingSyntaxErr.status !== "SQL_SYNTAX_ERROR" || gradingSyntaxErr.totalScore !== 0) {
      throw new Error(`Syntax error was not caught appropriately! Received status: ${gradingSyntaxErr.status}`);
    }

    // D. Intentional Wrong Answer Test
    const gradingWrong = await gradeSqlQuestion(q, "SELECT dept_name FROM departments;", false);
    if (gradingWrong.status === "ACCEPTED" || gradingWrong.totalScore === q.marks) {
      throw new Error(`Wrong answer query was incorrectly marked as accepted!`);
    }
    console.log(`   ✅ Correct Query (Accepted), Sample Run (Verified), Syntax Error (Caught), Wrong Answer (Rejected)`);
  }

  // 3. Test Student Attempt & Professor Code Visibility
  console.log("\n=================================================");
  console.log("🔍 TESTING PROFESSOR CODE INSPECTION FOR SQL-1");
  console.log("=================================================");

  const testRollNo = "TEST_SQL_STUDENT_001";
  const testStudentName = "SQL Candidate Test";

  await prisma.student.upsert({
    where: { rollNo: testRollNo },
    update: {},
    create: {
      rollNo: testRollNo,
      name: testStudentName,
      password: "hashedPassword123",
    },
  });

  const testAttempt = await prisma.studentAttempt.upsert({
    where: {
      assessmentId_rollNo: {
        assessmentId: sqlAssessment.id,
        rollNo: testRollNo,
      },
    },
    update: {
      status: "SUBMITTED",
      remainingSeconds: 1200,
      questionOrder: JSON.stringify(sqlAssessment.questions.map((q) => q.id)),
    },
    create: {
      assessmentId: sqlAssessment.id,
      rollNo: testRollNo,
      studentName: testStudentName,
      status: "SUBMITTED",
      remainingSeconds: 1200,
      questionOrder: JSON.stringify(sqlAssessment.questions.map((q) => q.id)),
    },
  });

  // Submit actual SQL code for all 5 questions
  await prisma.submission.deleteMany({
    where: { attemptId: testAttempt.id },
  });

  for (let i = 0; i < sqlAssessment.questions.length; i++) {
    const q = sqlAssessment.questions[i];
    const grading = await gradeSqlQuestion(q, q.solutionSql, false);

    await prisma.submission.create({
      data: {
        attemptId: testAttempt.id,
        questionId: q.id,
        type: "SQL",
        language: "SQL",
        code: q.solutionSql,
        score: grading.totalScore,
        maxScore: grading.maxScore,
        passedTestCases: grading.passedTestCases,
        totalTestCases: grading.totalTestCases,
        status: grading.status,
        testCaseResults: JSON.stringify(grading.testCaseResults),
      },
    });
  }

  // Query results as professor via Gradebook API
  const assessmentWithResults = await prisma.assessment.findUnique({
    where: { id: sqlAssessment.id },
    include: {
      questions: { orderBy: { order: "asc" } },
      attempts: {
        where: { id: testAttempt.id },
        include: {
          submissions: {
            orderBy: { submittedAt: "asc" },
            include: { question: true },
          },
        },
      },
    },
  });

  const studentAtt = assessmentWithResults?.attempts[0];
  if (!studentAtt) throw new Error("Attempt not retrieved in results query!");

  console.log(`\nProfessor Gradebook Verification:`);
  console.log(`   - Student: ${studentAtt.studentName} (${studentAtt.rollNo})`);
  console.log(`   - Attempt Status: ${studentAtt.status}`);
  console.log(`   - Total Submissions: ${studentAtt.submissions.length} / 5`);

  for (let i = 0; i < studentAtt.submissions.length; i++) {
    const sub = studentAtt.submissions[i];
    const qTitle = sub.question.title;
    console.log(`\n   [Submission ${i + 1}] ${qTitle}`);
    console.log(`     - Type: ${sub.type} | Language: ${sub.language}`);
    console.log(`     - Score: ${sub.score} / ${sub.maxScore} (${sub.status})`);
    console.log(`     - Code Present: ${Boolean(sub.code)} (${sub.code.length} chars)`);
    console.log(`     - First Line: ${sub.code.split("\n")[0]}`);
    console.log(`     - Test Cases Passed: ${sub.passedTestCases} / ${sub.totalTestCases}`);

    if (!sub.code || sub.code.length < 10) {
      throw new Error(`Submitted code is empty or missing for Question #${i + 1}!`);
    }
    if (sub.type !== "SQL" || sub.language !== "SQL") {
      throw new Error(`Submission type/language mismatch!`);
    }
  }

  // Cleanup test attempt & student
  await prisma.submission.deleteMany({ where: { attemptId: testAttempt.id } });
  await prisma.studentAttempt.delete({ where: { id: testAttempt.id } });
  await prisma.student.delete({ where: { rollNo: testRollNo } });
  console.log(`\n🧹 Cleaned up verification test student attempt.`);

  console.log("\n=================================================");
  console.log("🎉 ALL SQL-1 ASSESSMENT VERIFICATIONS PASSED!");
  console.log("=================================================");
}

main()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
