import { graphStarters, matrixStarters } from "./starters/graphAndMatrixStarters";
import { verifyAndApplyStarters } from "./starters/verifyStarters";
import { prisma } from "../db";

async function main() {
  console.log("=== VERIFYING GRAPH STARTERS ===");
  const ok1 = await verifyAndApplyStarters(graphStarters, true);
  console.log(`Graph result: ${ok1 ? "ALL PASSED" : "FAILED"}`);

  console.log("\n=== VERIFYING MATRIX STARTERS ===");
  const ok2 = await verifyAndApplyStarters(matrixStarters, true);
  console.log(`Matrix result: ${ok2 ? "ALL PASSED" : "FAILED"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
