import { linkedListStarters } from "./starters/linkedListStarters";
import { verifyAndApplyStarters } from "./starters/verifyStarters";
import { prisma } from "../db";

async function main() {
  console.log("=== VERIFYING LINKED LIST STARTERS ===");
  const ok = await verifyAndApplyStarters(linkedListStarters, true);
  console.log(`Linked list result: ${ok ? "ALL PASSED" : "FAILED"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
