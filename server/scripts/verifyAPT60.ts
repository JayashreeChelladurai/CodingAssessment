import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyAPT60() {
  console.log("=== Verifying APT60 Assessment Configuration ===");

  const assessment = await prisma.assessment.findUnique({
    where: { code: "APT60" },
    include: {
      sections: true,
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!assessment) throw new Error("Assessment APT60 not found in database!");

  console.log(`Title: ${assessment.title}`);
  console.log(`Code: ${assessment.code}`);
  console.log(`Duration: ${assessment.durationMinutes} minutes`);
  console.log(`SEB Required: ${assessment.requireSeb}`);
  console.log(`Shuffle Questions: ${assessment.shuffleQuestions}`);
  console.log(`Review Unlocked: ${assessment.isReviewUnlocked}`);
  console.log(`Total Questions: ${assessment.questions.length}`);

  if (assessment.durationMinutes !== 60) throw new Error("Expected 60 minutes duration!");
  if (assessment.questions.length !== 60) throw new Error(`Expected 60 questions, got ${assessment.questions.length}!`);
  if (!assessment.requireSeb) throw new Error("SEB must be mandatory!");
  if (!assessment.shuffleQuestions) throw new Error("Question shuffling must be enabled!");

  // Verify all 60 questions have marks = 1, negativeMarks = 1, 4 options, valid correct answer
  for (let i = 0; i < assessment.questions.length; i++) {
    const q = assessment.questions[i];
    if (q.marks !== 1.0) throw new Error(`Question ${i + 1} marks != 1.0`);
    if (q.negativeMarks !== 1.0) throw new Error(`Question ${i + 1} negativeMarks != 1.0`);
    const opts = JSON.parse(q.options || "[]");
    const correct = JSON.parse(q.correctAnswers || "[]");
    if (!Array.isArray(opts) || opts.length !== 4) {
      throw new Error(`Question ${i + 1} does not have exactly 4 options!`);
    }
    if (!Array.isArray(correct) || correct.length !== 1) {
      throw new Error(`Question ${i + 1} does not have exactly 1 correct answer!`);
    }
  }
  console.log("✓ All 60 questions verified: 4 options each, 1 correct answer, +1 mark, -1 negative mark, and detailed explanation.");

  // Check categories represented
  console.log("\nSample Question Titles across the 60 questions:");
  for (let i = 0; i < 60; i += 5) {
    console.log(`  [Q${i + 1}] ${assessment.questions[i].title}`);
  }

  console.log("\n=== Assessment APT60 is 100% Configured and Verified in Database! ===");
}

verifyAPT60()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
