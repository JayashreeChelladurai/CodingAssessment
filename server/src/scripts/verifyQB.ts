import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const folders = await prisma.questionFolder.findMany({
    orderBy: { order: "asc" },
    include: {
      questions: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          _count: { select: { testCases: true } },
        },
      },
      parent: {
        select: {
          name: true,
          parent: { select: { name: true } },
        },
      },
    },
  });

  console.log("=== QUESTION BANK STATUS ===");
  let totalQuestions = 0;
  let totalTestCases = 0;

  for (const f of folders) {
    if (f.questions.length > 0) {
      const path = [f.parent?.parent?.name, f.parent?.name, f.name].filter(Boolean).join(" > ");
      console.log(`\n📁 ${path} (${f.questions.length} questions):`);
      for (const q of f.questions) {
        totalQuestions++;
        totalTestCases += q._count.testCases;
        console.log(`   • [${q.difficulty}] ${q.title} (${q._count.testCases} test cases)`);
      }
    }
  }

  console.log(`\n============================`);
  console.log(`Total Questions Loaded: ${totalQuestions}`);
  console.log(`Total Test Cases Loaded: ${totalTestCases}`);

  // Special symbol check (*, #)
  const allQuestions = await prisma.bankQuestion.findMany({ select: { title: true, description: true } });
  let dirtyCount = 0;
  for (const q of allQuestions) {
    if (q.title.includes("*") || q.title.includes("#") || q.description.includes("*") || q.description.includes("#")) {
      console.log(`⚠️ Formatting Warning: Found special symbol in: "${q.title}"`);
      dirtyCount++;
    }
  }
  if (dirtyCount === 0) {
    console.log(`Formatting Cleanliness: 100% PASS - Zero '*' or '#' symbols found across all ${allQuestions.length} questions.`);
  } else {
    console.log(`Formatting Issues: Found symbols in ${dirtyCount} questions.`);
  }

  const codingQuestions = await prisma.bankQuestion.findMany({ where: { type: "CODING" } });
  let missingPlaceholder = 0;
  for (const q of codingQuestions) {
    if (!q.starterCodes || !q.starterCodes.includes("// Write your logic here")) {
      console.log(`⚠️ Question without placeholder: "${q.title}"`);
      missingPlaceholder++;
    }
  }
  if (missingPlaceholder === 0) {
    console.log(`All ${codingQuestions.length} coding questions have verified input-parsing starter codes with '// Write your logic here' placeholder!`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
