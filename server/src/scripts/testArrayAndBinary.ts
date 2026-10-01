import { arrayStarters, binaryStarters } from "./starters/arrayAndBinaryStarters";
import { verifyAndApplyStarters } from "./starters/verifyStarters";
import { prisma } from "../db";

async function main() {
  console.log("=== VERIFYING BINARY STARTERS ===");
  const ok1 = await verifyAndApplyStarters(binaryStarters, true);
  console.log(`Binary result: ${ok1 ? "ALL PASSED" : "FAILED"}`);

  console.log("\n=== VERIFYING ARRAY STARTERS ===");
  const ok2 = await verifyAndApplyStarters(arrayStarters, true);
  console.log(`Array result: ${ok2 ? "ALL PASSED" : "FAILED"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
