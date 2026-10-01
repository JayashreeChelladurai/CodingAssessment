import { prisma } from "../db";

async function main() {
  // 1. Fix Coin Change TC 6
  await prisma.bankTestCase.updateMany({
    where: { input: "3\n186 419 83\n6249" },
    data: { input: "4\n186 419 83 408\n6249" },
  });
  await prisma.testCase.updateMany({
    where: { input: "3\n186 419 83\n6249" },
    data: { input: "4\n186 419 83 408\n6249" },
  });

  // 2. Fix Longest Common Subsequence TC 6
  await prisma.bankTestCase.updateMany({
    where: { input: "longestcommon\nsubsequence" },
    data: { expectedOutput: "2" },
  });
  await prisma.testCase.updateMany({
    where: { input: "longestcommon\nsubsequence" },
    data: { expectedOutput: "2" },
  });

  console.log("Fixed DP test cases successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
