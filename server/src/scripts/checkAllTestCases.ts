import { prisma } from "../db";

async function main() {
  const questions = await prisma.bankQuestion.findMany({
    include: {
      folder: { include: { parent: true } },
      testCases: true,
    },
    orderBy: [
      { folder: { parent: { name: "asc" } } },
      { folder: { name: "asc" } },
      { title: "asc" },
    ],
  });

  for (const q of questions) {
    console.log(`\n=== [${q.folder?.parent?.name || "Root"} > ${q.folder?.name}] ${q.title} ===`);
    console.log(`TC count: ${q.testCases.length}`);
    for (let i = 0; i < Math.min(2, q.testCases.length); i++) {
      const tc = q.testCases[i];
      console.log(`  TC ${i + 1} Input: ${JSON.stringify(tc.input)}`);
      console.log(`  TC ${i + 1} Output: ${JSON.stringify(tc.expectedOutput)}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
