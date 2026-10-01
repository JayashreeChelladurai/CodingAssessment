import { stringStarters } from "./starters/stringStarters";
import { verifyAndApplyStarters } from "./starters/verifyStarters";
import { prisma } from "../db";

async function main() {
  console.log("=== VERIFYING STRING STARTERS ===");
  const ok = await verifyAndApplyStarters(stringStarters, true);
  console.log(`String result: ${ok ? "ALL PASSED" : "FAILED"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
