import { prisma } from "../db";

async function main() {
  console.log("=== UPDATING QUESTION MARKS (EASY: 25, MEDIUM: 35, HARD: 40) ===");

  // 1. Update BankQuestions
  const easyBQ = await prisma.bankQuestion.updateMany({
    where: { difficulty: "EASY" },
    data: { marks: 25 },
  });
  const medBQ = await prisma.bankQuestion.updateMany({
    where: { difficulty: "MEDIUM" },
    data: { marks: 35 },
  });
  const hardBQ = await prisma.bankQuestion.updateMany({
    where: { difficulty: "HARD" },
    data: { marks: 40 },
  });

  console.log(`Updated BankQuestions: ${easyBQ.count} Easy (25m), ${medBQ.count} Medium (35m), ${hardBQ.count} Hard (40m)`);

  // 2. Update Questions in Assessments
  const bankQuestions = await prisma.bankQuestion.findMany({
    select: { title: true, difficulty: true, marks: true },
  });
  const bqMap = new Map<string, number>();
  for (const bq of bankQuestions) {
    bqMap.set(bq.title, bq.marks);
  }

  const activeQuestions = await prisma.question.findMany();
  let updatedQCount = 0;
  for (const q of activeQuestions) {
    const targetMarks = bqMap.get(q.title) || (q.marks < 15 ? 25 : q.marks < 30 ? 35 : 40);
    if (q.marks !== targetMarks) {
      await prisma.question.update({
        where: { id: q.id },
        data: { marks: targetMarks },
      });
      updatedQCount++;
    }
  }
  console.log(`Updated ${updatedQCount} active Assessment Question records to new marks.`);

  // 3. Clear previous test attempts for clean slate
  await prisma.studentAttempt.deleteMany();
  console.log("Cleared test attempts for clean slate.");

  console.log("=== MARKS UPDATE COMPLETE ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
