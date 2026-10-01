import { prisma } from "../db";

async function main() {
  const topics = [
    "Array",
    "Binary",
    "Heap",
    "String",
    "Linked list",
    "Intervals",
    "Tree",
    "DP",
    "Graph",
    "Matrix",
  ];

  console.log("================ STARTER CODE AUDIT BY TOPIC ================\n");

  for (const topic of topics) {
    const questions = await prisma.bankQuestion.findMany({
      where: { folder: { name: topic } },
      include: { folder: { include: { parent: true } } },
      orderBy: { title: "asc" },
    });

    console.log(`\n============================================================`);
    console.log(`TOPIC: ${topic} (${questions.length} questions) - Difficulty: ${questions[0]?.difficulty || "Mixed"}`);
    console.log(`============================================================`);

    for (const q of questions) {
      console.log(`\n📌 [${q.title}] (Marks: ${q.marks}, Lang: ${q.allowedLanguages})`);
      
      // Extract function signature from Solution class
      const lines = q.starterCode.split("\n");
      const solClassIdx = lines.findIndex((l) => l.includes("public class Solution") || l.includes("class Solution"));
      const customClasses = lines.filter((l) => l.startsWith("class ") && !l.includes("class Solution"));

      if (customClasses.length > 0) {
        console.log(`   🧱 Custom Data Structure: ${customClasses.map((c) => c.trim()).join(", ")}`);
      }

      // Find method signatures inside Solution
      const methodSignatures = lines.filter((l, idx) => {
        return (
          idx > solClassIdx &&
          l.trim().startsWith("public ") &&
          !l.includes("static void main") &&
          !l.includes("static TreeNode buildTree") &&
          !l.includes("static void printTree") &&
          !l.includes("static TreeNode findNode")
        );
      });

      console.log(`   ⚡ Required Function Block(s) for Student:`);
      for (const m of methodSignatures) {
        console.log(`      • ${m.trim()}`);
      }

      const hasEmptyPlaceholder = q.starterCode.includes("// Write your logic here") || q.starterCode.includes("// Write your serialize logic here");
      const hasDriver = q.starterCode.includes("public static void main");

      console.log(`   ✅ Empty Function Placeholder: ${hasEmptyPlaceholder ? "YES" : "NO"}`);
      console.log(`   ✅ Automated Test Driver (main): ${hasDriver ? "YES" : "NO"}`);
    }
  }

  // Also check Fibonacci
  const fib = await prisma.bankQuestion.findFirst({
    where: { title: "Fibonacci Number" },
  });
  if (fib) {
    console.log(`\n📌 [Fibonacci Number] (Marks: ${fib.marks}, Lang: ${fib.allowedLanguages})`);
    console.log(`   ⚡ Required Function Block: public int fib(int n)`);
    console.log(`   ✅ Empty Function Placeholder: ${fib.starterCode.includes("// Write your logic here") ? "YES" : "NO"}`);
    console.log(`   ✅ Automated Test Driver (main): ${fib.starterCode.includes("public static void main") ? "YES" : "NO"}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
