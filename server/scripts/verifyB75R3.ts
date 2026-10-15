import { prisma } from "../src/db.js";
import {
  allocateQuestionsForStudentAttempt,
  getStudentPreviouslySeenQuestionKeys,
} from "../src/routes/student.js";
import { generateSebConfig } from "../src/services/sebService.js";

async function main() {
  console.log("=================================================");
  console.log("🧪 VERIFYING B75-R3 ASSESSMENT & ANTI-COLLISION");
  console.log("=================================================");

  // 1. Verify B75-R3 Assessment Record
  const b75R3 = await prisma.assessment.findUnique({
    where: { code: "B75-R3" },
    include: {
      sections: true,
      questions: { where: { templateQuestionId: null } },
    },
  });

  if (!b75R3) {
    throw new Error("❌ B75-R3 assessment not found in DB!");
  }

  console.log(`✅ Assessment Found: ${b75R3.title} (${b75R3.code})`);
  console.log(`   - ID: ${b75R3.id}`);
  console.log(`   - Duration: ${b75R3.durationMinutes} minutes (Expected: 90)`);
  console.log(`   - SEB Mandatory: ${b75R3.requireSeb} (Expected: true)`);
  console.log(`   - SEB Quit Password: ${b75R3.sebQuitPassword} (Expected: exit123)`);
  console.log(`   - Randomized Flag: ${b75R3.isRandomized} (Expected: true)`);
  console.log(`   - Sections: ${b75R3.sections.length}`);
  console.log(`   - Template Slots: ${b75R3.questions.length} (Expected: 3 slots)`);

  if (b75R3.durationMinutes !== 90) throw new Error("Duration is not 90 minutes!");
  if (!b75R3.requireSeb) throw new Error("requireSeb is not true!");
  if (b75R3.questions.length !== 3) throw new Error("Template slots count is not 3!");

  // Verify SEB config generation
  const sebConfigXml = generateSebConfig({
    startUrl: `http://localhost:3000/student/exam/${b75R3.code}`,
    quitPassword: b75R3.sebQuitPassword || "exit123",
    title: b75R3.title,
  });
  if (!sebConfigXml.includes("B75-R3") || !sebConfigXml.includes("quitURLConfirm")) {
    throw new Error("SEB config generation failed or missing required tags!");
  }
  console.log(`✅ SEB .seb configuration generates valid plist XML (${sebConfigXml.length} bytes)`);

  // 2. Fetch Students who took BLIND75-RANDOM and/or B75-R2
  const blind75 = await prisma.assessment.findUnique({
    where: { code: "BLIND75-RANDOM" },
    include: {
      attempts: true,
    },
  });

  if (!blind75) {
    throw new Error("❌ BLIND75-RANDOM assessment not found!");
  }

  const b75R2 = await prisma.assessment.findUnique({
    where: { code: "B75-R2" },
    include: {
      attempts: true,
    },
  });

  const studentsWithAttempts = blind75.attempts.slice(0, 5);
  console.log(`\nFound ${blind75.attempts.length} attempts in BLIND75-RANDOM and ${b75R2?.attempts.length || 0} attempts in B75-R2.`);
  console.log(`Testing anti-collision allocation on sample of ${studentsWithAttempts.length} students...`);

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

    // Get their B75-R2 questions if they took R2
    let r2Titles: string[] = [];
    if (b75R2) {
      const r2Att = b75R2.attempts.find((a) => a.rollNo === rollNo);
      if (r2Att) {
        const r2QIds = JSON.parse(r2Att.questionOrder || "[]");
        const r2Questions = await prisma.question.findMany({
          where: { id: { in: r2QIds } },
          select: { id: true, title: true, marks: true },
        });
        r2Titles = r2Questions.map((q) => q.title.trim().toLowerCase());
      }
    }

    console.log(`\n-------------------------------------------------`);
    console.log(`👤 Student: ${name} (${rollNo})`);
    console.log(`   Round 1 (BLIND75-RANDOM) Problems (${r1Questions.length}):`);
    r1Questions.forEach((q, i) => console.log(`     [${i + 1}] ${q.title} (${q.marks}m)`));

    if (r2Titles.length > 0) {
      console.log(`   Round 2 (B75-R2) Problems (${r2Titles.length}):`);
      r2Titles.forEach((t, i) => console.log(`     [${i + 1}] ${t}`));
    }

    // Test getStudentPreviouslySeenQuestionKeys
    const { seenBankQuestionIds, seenTitles } = await getStudentPreviouslySeenQuestionKeys(
      rollNo,
      b75R3.id
    );
    console.log(`   Identified Previously Seen: ${seenBankQuestionIds.size} Bank IDs, ${seenTitles.size} Titles`);

    // Verify all R1 titles are in seenTitles
    for (const title of r1Titles) {
      if (!seenTitles.has(title)) {
        throw new Error(`Title "${title}" from BLIND75-RANDOM was not captured in seenTitles!`);
      }
    }

    // Verify all R2 titles are in seenTitles
    for (const title of r2Titles) {
      if (!seenTitles.has(title)) {
        throw new Error(`Title "${title}" from B75-R2 was not captured in seenTitles!`);
      }
    }

    // Allocate questions for Round 3 (B75-R3)
    const alloc = await allocateQuestionsForStudentAttempt(b75R3.id, rollNo);
    const r3QuestionIds = alloc.questionOrder;

    if (r3QuestionIds.length !== 3) {
      throw new Error(`Student ${rollNo} received ${r3QuestionIds.length} questions, expected 3!`);
    }

    const r3Questions = await prisma.question.findMany({
      where: { id: { in: r3QuestionIds } },
      select: { id: true, title: true, marks: true, bankQuestionId: true },
    });

    console.log(`   Round 3 (B75-R3) Problems Allocated (${r3Questions.length}):`);
    const r3Marks: number[] = [];
    for (let i = 0; i < r3Questions.length; i++) {
      const q = r3Questions[i];
      r3Marks.push(q.marks);
      console.log(`     [${i + 1}] ${q.title} (${q.marks}m)`);

      // STRICT COLLISION CHECK AGAINST BLIND75-RANDOM
      if (r1Titles.includes(q.title.trim().toLowerCase())) {
        throw new Error(`🚨 COLLISION DETECTED! Student ${rollNo} was re-assigned "${q.title}" from BLIND75-RANDOM in B75-R3!`);
      }

      // STRICT COLLISION CHECK AGAINST B75-R2
      if (r2Titles.includes(q.title.trim().toLowerCase())) {
        throw new Error(`🚨 COLLISION DETECTED! Student ${rollNo} was re-assigned "${q.title}" from B75-R2 in B75-R3!`);
      }
    }

    // Check that marks cover 25 (Easy), 35 (Medium), and 40 (Hard)
    r3Marks.sort((a, b) => a - b);
    console.log(`   Difficulty Marks Breakdown: ${r3Marks.join("m, ")}m (Expected: 25m, 35m, 40m)`);
    if (r3Marks[0] !== 25 || r3Marks[1] !== 35 || r3Marks[2] !== 40) {
      throw new Error(`Marks distribution does not match 25, 35, 40! Received: ${r3Marks.join(", ")}`);
    }

    console.log(`   ✅ 100% Zero Collision Confirmed for student ${rollNo} against BLIND75-RANDOM and B75-R2!`);
  }

  // 3. Test Student Attempt Creation & Professor Code Visibility
  console.log(`\n=================================================`);
  console.log(`🔍 VERIFYING PROFESSOR CODE INSPECTION FOR B75-R3`);
  console.log(`=================================================`);

  const testRollNo = "TEST_STUDENT_B75_R3";
  const testStudentName = "Verification Student B75-R3";

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
  const testAlloc = await allocateQuestionsForStudentAttempt(b75R3.id, testRollNo);
  const testQIds = testAlloc.questionOrder;

  const testAttempt = await prisma.studentAttempt.upsert({
    where: {
      assessmentId_rollNo: {
        assessmentId: b75R3.id,
        rollNo: testRollNo,
      },
    },
    update: {
      status: "SUBMITTED",
      questionOrder: JSON.stringify(testQIds),
      remainingSeconds: 4200,
    },
    create: {
      assessmentId: b75R3.id,
      rollNo: testRollNo,
      studentName: testStudentName,
      status: "SUBMITTED",
      questionOrder: JSON.stringify(testQIds),
      remainingSeconds: 4200,
    },
  });

  // Create mock code submissions for the allocated questions
  const targetQId = testQIds[0];
  const sampleJavaCode = `import java.util.*;

public class Solution {
    // Solved Problem for B75-R3 Assessment
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("B75-R3 Solved Successfully!");
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
          executionTimeMs: 38,
          input: "[1, 2, 3, 4], 5",
          expectedOutput: "[0, 3]",
          stdout: "[0, 3]",
        },
      ]),
    },
  });

  console.log(`Created mock submission: ${submission.id} for question ${targetQId}`);

  // Fetch results as professor would via GET /api/results/:assessmentId
  const assessmentWithResults = await prisma.assessment.findUnique({
    where: { id: b75R3.id },
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

  if (!studentSub.code.includes("B75-R3 Solved Successfully!")) {
    throw new Error("Submitted code content does not match!");
  }

  // Cleanup verification student and attempt so assessment is clean
  await prisma.submission.deleteMany({ where: { attemptId: testAttempt.id } });
  await prisma.studentAttempt.delete({ where: { id: testAttempt.id } });
  await prisma.student.delete({ where: { rollNo: testRollNo } });
  console.log(`🧹 Cleaned up temporary verification student attempt.`);

  console.log(`\n=================================================`);
  console.log(`🎉 ALL B75-R3 VERIFICATIONS PASSED SUCCESSFULLY!`);
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
