import { prisma } from "../src/db.js";
import {
  allocateQuestionsForStudentAttempt,
  getStudentPreviouslySeenQuestionKeys,
} from "../src/routes/student.js";

async function main() {
  console.log("=================================================");
  console.log("🧪 VERIFYING B75-R2 ASSESSMENT & ANTI-COLLISION");
  console.log("=================================================");

  // 1. Verify B75-R2 Assessment Record
  const b75R2 = await prisma.assessment.findUnique({
    where: { code: "B75-R2" },
    include: {
      sections: true,
      questions: { where: { templateQuestionId: null } },
    },
  });

  if (!b75R2) {
    throw new Error("❌ B75-R2 assessment not found in DB!");
  }

  console.log(`✅ Assessment Found: ${b75R2.title} (${b75R2.code})`);
  console.log(`   - ID: ${b75R2.id}`);
  console.log(`   - Duration: ${b75R2.durationMinutes} minutes (Expected: 90)`);
  console.log(`   - SEB Mandatory: ${b75R2.requireSeb} (Expected: true)`);
  console.log(`   - Randomized Flag: ${b75R2.isRandomized} (Expected: true)`);
  console.log(`   - Sections: ${b75R2.sections.length}`);
  console.log(`   - Template Slots: ${b75R2.questions.length} (Expected: 3 slots)`);

  if (b75R2.durationMinutes !== 90) throw new Error("Duration is not 90 minutes!");
  if (!b75R2.requireSeb) throw new Error("requireSeb is not true!");
  if (b75R2.questions.length !== 3) throw new Error("Template slots count is not 3!");

  // 2. Fetch Students who took BLIND75-RANDOM
  const blind75 = await prisma.assessment.findUnique({
    where: { code: "BLIND75-RANDOM" },
    include: {
      attempts: true,
    },
  });

  if (!blind75) {
    throw new Error("❌ BLIND75-RANDOM assessment not found!");
  }

  const studentsWithAttempts = blind75.attempts.slice(0, 5);
  console.log(`\nFound ${blind75.attempts.length} attempts in BLIND75-RANDOM. Testing sample of ${studentsWithAttempts.length} students...`);

  for (const att of studentsWithAttempts) {
    const rollNo = att.rollNo;
    const name = att.studentName;

    // Get their BLIND75 questions
    const r1QIds = JSON.parse(att.questionOrder || "[]");
    const r1Questions = await prisma.question.findMany({
      where: { id: { in: r1QIds } },
      select: { id: true, title: true, marks: true },
    });
    const r1Titles = r1Questions.map((q) => q.title.trim().toLowerCase());

    console.log(`\n-------------------------------------------------`);
    console.log(`👤 Student: ${name} (${rollNo})`);
    console.log(`   Round 1 (BLIND75-RANDOM) Problems (${r1Questions.length}):`);
    r1Questions.forEach((q, i) => console.log(`     [${i + 1}] ${q.title} (${q.marks}m)`));

    // Test getStudentPreviouslySeenQuestionKeys
    const { seenBankQuestionIds, seenTitles } = await getStudentPreviouslySeenQuestionKeys(
      rollNo,
      b75R2.id
    );
    console.log(`   Identified Previously Seen: ${seenBankQuestionIds.size} Bank IDs, ${seenTitles.size} Titles`);

    // Verify all R1 titles are in seenTitles
    for (const title of r1Titles) {
      if (!seenTitles.has(title)) {
        throw new Error(`Title "${title}" was not captured in seenTitles!`);
      }
    }

    // Allocate questions for Round 2 (B75-R2)
    const alloc = await allocateQuestionsForStudentAttempt(b75R2.id, rollNo);
    const r2QuestionIds = alloc.questionOrder;

    if (r2QuestionIds.length !== 3) {
      throw new Error(`Student ${rollNo} received ${r2QuestionIds.length} questions, expected 3!`);
    }

    const r2Questions = await prisma.question.findMany({
      where: { id: { in: r2QuestionIds } },
      select: { id: true, title: true, marks: true, bankQuestionId: true },
    });

    console.log(`   Round 2 (B75-R2) Problems Allocated (${r2Questions.length}):`);
    const r2Marks: number[] = [];
    for (let i = 0; i < r2Questions.length; i++) {
      const q = r2Questions[i];
      r2Marks.push(q.marks);
      console.log(`     [${i + 1}] ${q.title} (${q.marks}m)`);

      // STRICT COLLISION CHECK
      if (r1Titles.includes(q.title.trim().toLowerCase())) {
        throw new Error(`🚨 COLLISION DETECTED! Student ${rollNo} was re-assigned "${q.title}" in B75-R2!`);
      }
    }

    // Check that marks cover 25 (Easy), 35 (Medium), and 40 (Hard)
    r2Marks.sort((a, b) => a - b);
    console.log(`   Difficulty Marks Breakdown: ${r2Marks.join("m, ")}m (Expected: 25m, 35m, 40m)`);
    if (r2Marks[0] !== 25 || r2Marks[1] !== 35 || r2Marks[2] !== 40) {
      throw new Error(`Marks distribution does not match 25, 35, 40! Received: ${r2Marks.join(", ")}`);
    }

    console.log(`   ✅ 100% Zero Collision Confirmed for student ${rollNo}!`);
  }

  // 3. Test Student Attempt Creation & Professor Code Visibility
  console.log(`\n=================================================`);
  console.log(`🔍 VERIFYING PROFESSOR CODE INSPECTION FOR B75-R2`);
  console.log(`=================================================`);

  const testRollNo = "TEST_STUDENT_001";
  const testStudentName = "Verification Student";

  // Ensure test student exists
  await prisma.student.upsert({
    where: { rollNo: testRollNo },
    update: {},
    create: {
      rollNo: testRollNo,
      name: testStudentName,
      password: "hashedPassword123",
    },
  });

  // Allocate questions for test student
  const testAlloc = await allocateQuestionsForStudentAttempt(b75R2.id, testRollNo);
  const testQIds = testAlloc.questionOrder;

  const testAttempt = await prisma.studentAttempt.upsert({
    where: {
      assessmentId_rollNo: {
        assessmentId: b75R2.id,
        rollNo: testRollNo,
      },
    },
    update: {
      status: "SUBMITTED",
      questionOrder: JSON.stringify(testQIds),
      remainingSeconds: 3600,
    },
    create: {
      assessmentId: b75R2.id,
      rollNo: testRollNo,
      studentName: testStudentName,
      status: "SUBMITTED",
      questionOrder: JSON.stringify(testQIds),
      remainingSeconds: 3600,
    },
  });

  // Create a mock code submission on the first question
  const targetQId = testQIds[0];
  const sampleJavaCode = `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Solved DSA Problem for B75-R2
        System.out.println("Hello from B75-R2!");
    }
}`;

  await prisma.submission.deleteMany({
    where: { attemptId: testAttempt.id },
  });

  const submission = await prisma.submission.create({
    data: {
      attemptId: testAttempt.id,
      questionId: targetQId,
      type: "CODING",
      language: "JAVA",
      code: sampleJavaCode,
      score: 25,
      maxScore: 25,
      passedTestCases: 5,
      totalTestCases: 5,
      status: "ACCEPTED",
      testCaseResults: JSON.stringify([
        {
          passed: true,
          status: "PASSED",
          executionTimeMs: 42,
          input: "[2, 7, 11, 15], 9",
          expectedOutput: "[0, 1]",
          stdout: "[0, 1]",
        },
      ]),
    },
  });

  console.log(`Created mock submission: ${submission.id} for question ${targetQId}`);

  // Fetch results as professor would via GET /api/results/:assessmentId
  const assessmentWithResults = await prisma.assessment.findUnique({
    where: { id: b75R2.id },
    include: {
      questions: true,
      attempts: {
        where: { id: testAttempt.id },
        include: {
          submissions: true,
        },
      },
    },
  });

  const studentAtt = assessmentWithResults?.attempts[0];
  if (!studentAtt) throw new Error("Attempt not retrieved in results query!");

  const studentSub = studentAtt.submissions.find((s) => s.questionId === targetQId);
  if (!studentSub) throw new Error("Submission not found for target question!");

  console.log(`\nProfessor Gradebook Check:`);
  console.log(`   - Student: ${studentAtt.studentName} (${studentAtt.rollNo})`);
  console.log(`   - Status: ${studentAtt.status}`);
  console.log(`   - Code Submitted Present: ${Boolean(studentSub.code)}`);
  console.log(`   - Code Length: ${studentSub.code.length} characters`);
  console.log(`   - Score: ${studentSub.score} / ${studentSub.maxScore}`);
  console.log(`   - Submissions Recorded: ${studentAtt.submissions.length}`);
  console.log(`   - First line of code: ${studentSub.code.split("\n")[0]}`);

  if (!studentSub.code.includes("Hello from B75-R2!")) {
    throw new Error("Submitted code content does not match!");
  }

  console.log(`\n=================================================`);
  console.log(`🎉 ALL B75-R2 VERIFICATIONS PASSED SUCCESSFULLY!`);
  console.log(`=================================================`);
}

main()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
