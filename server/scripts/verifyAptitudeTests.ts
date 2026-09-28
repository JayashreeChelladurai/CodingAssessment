import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyTests() {
  console.log("=== Verifying AT1 and AT2 Tests in Database ===");

  const at1 = await prisma.assessment.findUnique({
    where: { code: "AT1" },
    include: { questions: true },
  });

  const at2 = await prisma.assessment.findUnique({
    where: { code: "AT2" },
    include: { questions: true },
  });

  if (!at1) throw new Error("Assessment AT1 not found!");
  if (!at2) throw new Error("Assessment AT2 not found!");

  console.log(`AT1: "${at1.title}", Total Questions: ${at1.questions.length}, Duration: ${at1.durationMinutes} mins`);
  console.log(`AT2: "${at2.title}", Total Questions: ${at2.questions.length}, Duration: ${at2.durationMinutes} mins`);

  if (at1.questions.length !== 150) throw new Error(`AT1 does not have 150 questions! Found: ${at1.questions.length}`);
  if (at2.questions.length !== 150) throw new Error(`AT2 does not have 150 questions! Found: ${at2.questions.length}`);

  // Check formatting of questions
  for (const q of at1.questions) {
    const opts = JSON.parse(q.options);
    const correct = JSON.parse(q.correctAnswers);
    if (!opts || opts.length !== 4) throw new Error(`Invalid options in AT1 question: ${q.title}`);
    if (!correct || correct.length !== 1) throw new Error(`Invalid correct answers in AT1 question: ${q.title}`);
  }
  console.log("✓ AT1: All 150 questions have valid options and answer keys.");

  for (const q of at2.questions) {
    const opts = JSON.parse(q.options);
    const correct = JSON.parse(q.correctAnswers);
    if (!opts || opts.length !== 4) throw new Error(`Invalid options in AT2 question: ${q.title}`);
    if (!correct || correct.length !== 1) throw new Error(`Invalid correct answers in AT2 question: ${q.title}`);
  }
  console.log("✓ AT2: All 150 questions have valid options and answer keys.");

  console.log("=== All Assessments Verified Successfully! ===");
}

verifyTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
