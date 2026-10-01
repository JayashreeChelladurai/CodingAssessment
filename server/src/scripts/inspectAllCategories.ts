import { prisma } from "../db";

async function main() {
  const folders = await prisma.questionFolder.findMany({
    include: {
      questions: {
        include: {
          testCases: {
            take: 2,
          },
        },
      },
    },
  });

  for (const f of folders) {
    if (f.questions.length === 0) continue;
    console.log(`\n=================== FOLDER: ${f.name} (${f.questions.length} questions) ===================`);
    for (const q of f.questions.slice(0, 2)) {
      console.log(`\n--- Question: ${q.title} (${q.difficulty}) ---`);
      console.log(`Starter Code:\n${q.starterCode}`);
      console.log(`Test Cases (sample):`);
      for (const tc of q.testCases) {
        console.log(`  Input: ${JSON.stringify(tc.input)}`);
        console.log(`  Expected Output: ${JSON.stringify(tc.expectedOutput)}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
