import { heapStarters, intervalStarters } from "./starters/heapAndIntervalsStarters";
import { verifyAndApplyStarters } from "./starters/verifyStarters";
import { prisma } from "../db";

async function main() {
  console.log("=== VERIFYING HEAP STARTERS ===");
  const ok1 = await verifyAndApplyStarters(heapStarters, true);
  console.log(`Heap result: ${ok1 ? "ALL PASSED" : "FAILED"}`);

  console.log("\n=== VERIFYING INTERVALS STARTERS ===");
  const ok2 = await verifyAndApplyStarters(intervalStarters, true);
  console.log(`Intervals result: ${ok2 ? "ALL PASSED" : "FAILED"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
