import { prisma } from "../db";

async function main() {
  const category = process.argv[2];
  const questions = await prisma.bankQuestion.findMany({
    where: category ? { folder: { name: category } } : {},
    include: {
      folder: { include: { parent: true } },
      testCases: true,
    },
    orderBy: { title: "asc" },
  });

  for (const q of questions) {
    console.log(`\n======================================================`);
    console.log(`[${q.folder?.parent?.name} > ${q.folder?.name}] ${q.title}`);
    console.log(`Test cases count: ${q.testCases.length}`);
    for (let i = 0; i < q.testCases.length; i++) {
      console.log(`  TC ${i + 1}:`);
      console.log(`    Input:    ${JSON.stringify(q.testCases[i].input)}`);
      console.log(`    Expected: ${JSON.stringify(q.testCases[i].expectedOutput)}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
