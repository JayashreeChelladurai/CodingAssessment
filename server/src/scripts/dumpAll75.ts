import { prisma } from "../db";

async function main() {
  const questions = await prisma.bankQuestion.findMany({
    include: {
      folder: {
        include: { parent: true },
      },
      testCases: true,
    },
    orderBy: [
      { folder: { name: "asc" } },
      { title: "asc" },
    ],
  });

  console.log(`Found ${questions.length} questions in Question Bank.\n`);

  for (const q of questions) {
    const parent = q.folder?.parent?.name || "";
    const folder = q.folder?.name || "";
    console.log(`================================================================`);
    console.log(`ID: ${q.id}`);
    console.log(`Path: ${parent} > ${folder}`);
    console.log(`Title: ${q.title} (${q.difficulty})`);
    console.log(`Allowed Languages: ${q.allowedLanguages}`);
    console.log(`Test Cases count: ${q.testCases.length}`);
    if (q.testCases.length > 0) {
      console.log(`Sample Test Case 1:`);
      console.log(`  Input: ${JSON.stringify(q.testCases[0].input)}`);
      console.log(`  Output: ${JSON.stringify(q.testCases[0].expectedOutput)}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
