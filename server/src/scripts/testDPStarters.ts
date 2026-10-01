import { dpStarters } from "./starters/dpStarters";
import { verifyAndApplyStarters } from "./starters/verifyStarters";
import { prisma } from "../db";

async function main() {
  console.log("=== VERIFYING DP STARTERS ===");
  const ok = await verifyAndApplyStarters(dpStarters, true);
  console.log(`DP result: ${ok ? "ALL PASSED" : "FAILED"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
