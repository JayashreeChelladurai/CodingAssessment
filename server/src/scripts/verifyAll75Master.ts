import { prisma } from "../db";
import { prepareAndCompileCode } from "../services/codeRunner";
import fs from "fs/promises";

async function main() {
  console.log("================ MASTER VERIFICATION ================\n");

  const bankQuestions = await prisma.bankQuestion.findMany({
    include: {
      folder: { include: { parent: true } },
      testCases: true,
    },
    orderBy: [
      { folder: { parent: { name: "asc" } } },
      { folder: { name: "asc" } },
      { title: "asc" },
    ],
  });

  console.log(`Total Question Bank Questions: ${bankQuestions.length}`);

  let totalTestCases = 0;
  let allJavaOnly = true;
  let allCompileCleanly = true;
  let formattingPass = true;
  let helperClassPass = true;
  let emptyBlockPass = true;

  for (const q of bankQuestions) {
    totalTestCases += q.testCases.length;

    // 1. Language check
    if (q.allowedLanguages !== "JAVA") {
      console.error(`❌ [${q.title}] allowedLanguages is '${q.allowedLanguages}', expected 'JAVA'`);
      allJavaOnly = false;
    }

    // 2. Formatting symbols check (* or #)
    if (q.title.includes("*") || q.title.includes("#") || q.description.includes("*") || q.description.includes("#")) {
      console.error(`❌ [${q.title}] contains forbidden symbols '*' or '#'`);
      formattingPass = false;
    }

    // 3. Helper class check
    const folderName = q.folder?.name || "";
    if (folderName === "Linked list" || q.title === "Merge K Sorted Lists") {
      if (!q.starterCode.includes("class ListNode")) {
        console.error(`❌ [${q.title}] Missing 'class ListNode'`);
        helperClassPass = false;
      }
    }
    if (folderName === "Tree") {
      if (!q.starterCode.includes("class TreeNode")) {
        console.error(`❌ [${q.title}] Missing 'class TreeNode'`);
        helperClassPass = false;
      }
    }
    if (q.title === "Clone Graph") {
      if (!q.starterCode.includes("class Node")) {
        console.error(`❌ [${q.title}] Missing 'class Node'`);
        helperClassPass = false;
      }
    }

    // 4. Function block left empty check
    if (!q.starterCode.includes("// Write your logic here") && !q.starterCode.includes("// Write your serialize logic here")) {
      console.error(`❌ [${q.title}] Missing empty function placeholder '// Write your logic here'`);
      emptyBlockPass = false;
    }

    // 5. Standalone compilation check
    const compile = await prepareAndCompileCode("JAVA", q.starterCode);
    if (!compile.success) {
      console.error(`❌ [${q.title}] Starter code failed to compile:\n${compile.compilationError}`);
      allCompileCleanly = false;
    } else {
      await fs.rm(compile.tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  // Also check questions cloned in active assessments
  const activeQuestions = await prisma.question.findMany();
  for (const aq of activeQuestions) {
    if (aq.allowedLanguages !== "JAVA") {
      await prisma.question.update({
        where: { id: aq.id },
        data: { allowedLanguages: "JAVA" },
      });
    }
  }

  console.log(`\n================ SUMMARY RESULTS ================`);
  console.log(`Total Questions:               ${bankQuestions.length}`);
  console.log(`Total Test Cases:              ${totalTestCases}`);
  console.log(`Languages Restricted to Java: ${allJavaOnly ? "100% PASS" : "FAIL"}`);
  console.log(`Clean Formatting (no * or #):  ${formattingPass ? "100% PASS" : "FAIL"}`);
  console.log(`Helper Nodes (ListNode/TreeNode/Node): ${helperClassPass ? "100% PASS" : "FAIL"}`);
  console.log(`Function Blocks Left Empty:    ${emptyBlockPass ? "100% PASS" : "FAIL"}`);
  console.log(`Starter Codes Compilation:     ${allCompileCleanly ? "100% PASS" : "FAIL"}`);
  console.log(`=================================================`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
