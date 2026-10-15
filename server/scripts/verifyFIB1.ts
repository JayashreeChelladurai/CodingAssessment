import { prisma } from "../src/db.js";
import { gradeFibQuestion } from "../src/services/gradingService.js";

async function verify() {
  console.log("🔍 Verifying C-FIB-10 Assessment and Grading Engine...\n");

  const assessment = await prisma.assessment.findUnique({
    where: { code: "C-FIB-10" },
    include: {
      sections: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new Error("Assessment C-FIB-10 not found!");
  }

  console.log(`✅ Assessment Found: "${assessment.title}" (Code: ${assessment.code})`);
  const questions = assessment.sections[0]?.questions || [];
  console.log(`✅ Questions Count: ${questions.length} / 10\n`);

  if (questions.length !== 10) {
    throw new Error(`Expected 10 questions, found ${questions.length}`);
  }

  let totalScore = 0;
  let maxScore = 0;

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    if (q.type !== "FIB") {
      throw new Error(`Question ${idx + 1} (${q.title}) has type '${q.type}', expected 'FIB'`);
    }

    const blanks = JSON.parse(q.options);
    const correctAnswers = JSON.parse(q.correctAnswers);

    console.log(`[Q${idx + 1}] ${q.title}`);
    console.log(`      Blanks: ${blanks.length}, Marks: ${q.marks}`);

    // Simulate perfect student answers (picking first accepted answer for each blank)
    const perfectAnswers = blanks.map((b: any) => b.acceptedAnswers[0]);
    const gradeResult = gradeFibQuestion(perfectAnswers, q.correctAnswers, q.marks, q.negativeMarks || 0);

    console.log(`      Candidate Answers: ${JSON.stringify(perfectAnswers)}`);
    console.log(`      Score Awarded: ${gradeResult.score} / ${q.marks} (Passed: ${gradeResult.correctCount} / ${gradeResult.totalBlanks})`);

    if (gradeResult.score !== q.marks) {
      throw new Error(`Grading mismatch on Q${idx + 1}: expected ${q.marks}, got ${gradeResult.score}`);
    }

    totalScore += gradeResult.score;
    maxScore += q.marks;
  }

  console.log(`\n=================================================`);
  console.log(`🎯 TOTAL SCORE: ${totalScore} / ${maxScore} (100% Passed)`);
  console.log(`=================================================`);

  // Verify Case-Insensitivity & Whitespace Normalization
  console.log("\n🧪 Testing Normalization & Case-Insensitivity...");
  const normGrade = gradeFibQuestion(["   266    -1   10  "], questions[0].correctAnswers, 10, 0);
  if (normGrade.score !== 10) {
    throw new Error("Whitespace normalization failed!");
  }
  console.log("   ✓ Whitespace normalization passed.");

  const caseGrade = gradeFibQuestion(["linker error"], questions[6].correctAnswers, 10, 0);
  if (caseGrade.score !== 10) {
    throw new Error("Case-insensitive matching failed!");
  }
  console.log("   ✓ Lowercase matching for 'linker error' passed.");

  // Verify Partial Credit on Multi-Blank Question (Q9)
  console.log("\n🧪 Testing Partial Credit (Q9)...");
  const partialGrade = gradeFibQuestion(["printf(\"%c\", pa->ch[2]);", "wrong_answer"], questions[8].correctAnswers, 10, 0);
  if (partialGrade.score !== 5 || partialGrade.correctCount !== 1) {
    throw new Error(`Partial credit failed! Expected 5, got ${partialGrade.score}`);
  }
  console.log(`   ✓ Partial credit correctly awarded: ${partialGrade.score} / 10 marks (1 / 2 blanks).`);

  // Verify Question Bank
  const folder = await prisma.questionFolder.findFirst({
    where: { name: "C Programming FIB" },
    include: { questions: true },
  });

  if (!folder || folder.questions.length < 10) {
    throw new Error("Question Bank folder verification failed!");
  }

  console.log(`\n✅ Question Bank Folder "${folder.name}" contains ${folder.questions.length} reusable FIB questions.`);
  console.log("🚀 All Verification Checks & Grading Tests Passed Successfully!");
}

verify()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
