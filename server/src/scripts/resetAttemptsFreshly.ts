import { PrismaClient } from "@prisma/client";
import { populateRandomQuestionsForAssessment } from "../routes/student.js";

const prisma = new PrismaClient();

async function main() {
  console.log("=== RESETTING ASSESSMENT & STUDENT ATTEMPTS FRESHLY ===");

  const assessmentCode = "BLIND75-RANDOM";

  // 1. Update Assessment duration to 90 minutes
  const assessment = await prisma.assessment.findUnique({
    where: { code: assessmentCode },
  });

  if (!assessment) {
    console.error(`Assessment ${assessmentCode} not found!`);
    process.exit(1);
  }

  await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      durationMinutes: 90,
      isRandomized: true,
      shuffleQuestions: true,
    },
  });

  console.log(`Updated assessment "${assessment.title}" (${assessment.code}) durationMinutes to 90.`);

  // 2. Fetch all student attempts for this assessment
  const attempts = await prisma.studentAttempt.findMany({
    where: { assessmentId: assessment.id },
  });

  console.log(`Found ${attempts.length} attempts to reset freshly with 90m timer and randomized questions.`);

  const now = new Date();

  for (const att of attempts) {
    // Resolve all violations for this attempt
    await prisma.violation.updateMany({
      where: { attemptId: att.id, resolved: false },
      data: { resolved: true, resolvedAt: now },
    });

    // Delete any old submissions from previous aborted test
    await prisma.submission.deleteMany({
      where: { attemptId: att.id },
    });

    // Populate fresh 3 random questions (1 Easy, 1 Medium, 1 Hard) from Question Bank
    const { questionOrder, optionOrders } = await populateRandomQuestionsForAssessment(
      assessment.id,
      assessment.randomConfig
    );

    // Verify the 3 questions
    const qs = await prisma.question.findMany({
      where: { id: { in: questionOrder } },
      select: { title: true, marks: true },
    });

    await prisma.studentAttempt.update({
      where: { id: att.id },
      data: {
        status: "IN_PROGRESS",
        remainingSeconds: 5400, // 90 minutes
        startedAt: now,
        lastHeartbeat: now,
        submittedAt: null,
        violationCount: 0,
        drafts: "{}",
        questionOrder: JSON.stringify(questionOrder),
        optionOrders: JSON.stringify(optionOrders),
      },
    });

    console.log(
      `Reset attempt for ${att.studentName} (${att.rollNo}): 5400s (90m), questions: ${qs.map((q) => `${q.title} (${q.marks}m)`).join(", ")}`
    );
  }

  console.log("\n=== ALL ATTEMPTS SUCCESSFULLY RESET FRESHLY TO 90 MINUTES WITH RANDOM QUESTIONS! ===");
}

main()
  .catch((err) => {
    console.error("Error during reset:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
