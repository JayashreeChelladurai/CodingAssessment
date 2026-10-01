import { prisma } from "../db";
import fs from "fs";

async function main() {
  const questions = await prisma.bankQuestion.findMany({
    include: {
      folder: {
        include: { parent: true },
      },
      testCases: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: [
      { folder: { parent: { name: "asc" } } },
      { folder: { name: "asc" } },
      { title: "asc" },
    ],
  });

  const summary = questions.map((q) => ({
    id: q.id,
    difficulty: q.difficulty,
    parentFolder: q.folder?.parent?.name,
    folder: q.folder?.name,
    title: q.title,
    testCasesCount: q.testCases.length,
    sampleInput: q.testCases[0]?.input,
    sampleOutput: q.testCases[0]?.expectedOutput,
  }));

  fs.writeFileSync("all75_summary.json", JSON.stringify(summary, null, 2));
  console.log(`Saved summary of ${questions.length} questions to all75_summary.json`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
