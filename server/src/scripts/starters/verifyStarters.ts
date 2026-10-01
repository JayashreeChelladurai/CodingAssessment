import { prisma } from "../../db";
import { StarterDefinition } from "./linkedListStarters";
import { prepareAndCompileCode, runCompiledBinary, normalizeOutput } from "../../services/codeRunner";
import fs from "fs/promises";

export async function verifyAndApplyStarters(starters: StarterDefinition[], applyToDb: boolean = false) {
  let passedAll = true;

  for (const s of starters) {
    const q = await prisma.bankQuestion.findFirst({
      where: { title: s.title },
      include: { testCases: { orderBy: { order: "asc" } } },
    });

    if (!q) {
      console.error(`❌ Question not found: ${s.title}`);
      passedAll = false;
      continue;
    }

    // 1. Verify starter code compiles as-is (with empty function body)
    const compileEmpty = await prepareAndCompileCode("JAVA", s.starterCode);
    if (!compileEmpty.success) {
      console.error(`❌ Starter code failed to compile for [${s.title}]:\n${compileEmpty.compilationError}`);
      passedAll = false;
      continue;
    }
    await fs.rm(compileEmpty.tempDir, { recursive: true, force: true }).catch(() => {});

    // 2. Inject testSolution to verify against test cases
    let fullCode = s.starterCode.replace(
      /\/\/\s*Write your logic here[\s\S]*?(?=\n    \})/m,
      s.testSolution
    );
    if ((s as any).testSolution2) {
      fullCode = fullCode.replace(
        /\/\/\s*Write your (?:deserialize|addNum|decode) logic here[\s\S]*?(?=\n    \})/m,
        (s as any).testSolution2
      );
    }
    if ((s as any).testSolution3) {
      fullCode = fullCode.replace(
        /\/\/\s*Write your findMedian logic here[\s\S]*?(?=\n    \})/m,
        (s as any).testSolution3
      );
    }
    const compileFull = await prepareAndCompileCode("JAVA", fullCode);
    if (!compileFull.success) {
      console.error(`❌ Solution failed to compile for [${s.title}]:\n${compileFull.compilationError}`);
      passedAll = false;
      continue;
    }

    let allTcPassed = true;
    for (let i = 0; i < q.testCases.length; i++) {
      const tc = q.testCases[i];
      const runRes = await runCompiledBinary(compileFull.runCmd, compileFull.runArgs, compileFull.tempDir, tc.input);
      const normActual = normalizeOutput(runRes.stdout);
      const normExpected = normalizeOutput(tc.expectedOutput);
      if (normActual !== normExpected) {
        console.error(`❌ TC ${i + 1} Failed for [${s.title}]:\n  Input: ${JSON.stringify(tc.input)}\n  Expected: ${JSON.stringify(normExpected)}\n  Actual:   ${JSON.stringify(normActual)}`);
        allTcPassed = false;
        passedAll = false;
        break;
      }
    }
    await fs.rm(compileFull.tempDir, { recursive: true, force: true }).catch(() => {});

    if (allTcPassed) {
      console.log(`✅ [PASS] ${s.title} (${q.testCases.length}/${q.testCases.length} test cases passed)`);
      if (applyToDb) {
        await prisma.bankQuestion.update({
          where: { id: q.id },
          data: {
            allowedLanguages: "JAVA",
            starterCode: s.starterCode,
            starterCodes: JSON.stringify({ JAVA: s.starterCode }),
          },
        });
        // Also update any question copies in existing assessments
        await prisma.question.updateMany({
          where: { title: s.title },
          data: {
            allowedLanguages: "JAVA",
            starterCode: s.starterCode,
            starterCodes: JSON.stringify({ JAVA: s.starterCode }),
          },
        });
      }
    }
  }

  return passedAll;
}
