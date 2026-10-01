import { prisma } from "../db";

async function main() {
  await prisma.bankTestCase.updateMany({
    where: { input: "4\n1 -1 1 -1" },
    data: { expectedOutput: "1 -1 1 -1" },
  });
  await prisma.testCase.updateMany({
    where: { input: "4\n1 -1 1 -1" },
    data: { expectedOutput: "1 -1 1 -1" },
  });
  console.log("Updated Product of Array Except Self TC 5 successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
