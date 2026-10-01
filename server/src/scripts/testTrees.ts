import { treeStarters } from "./starters/treeStarters";
import { verifyAndApplyStarters } from "./starters/verifyStarters";
import { prisma } from "../db";

async function main() {
  console.log("=== VERIFYING TREE STARTERS ===");
  const ok = await verifyAndApplyStarters(treeStarters, true);
  console.log(`Tree result: ${ok ? "ALL PASSED" : "FAILED"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
