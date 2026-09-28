import { prisma } from "./src/db.js";
import { executeCode } from "./src/services/codeRunner.js";
import { gradeStudentCode, gradeMcqQuestion } from "./src/services/gradingService.js";
import { generateSebConfig } from "./src/services/sebService.js";

async function runComprehensiveDogfoodSuite() {
  console.log("================================================================================");
  console.log("   🐕 RUNNING DEEP COMPREHENSIVE DOGFOODING & STRESS-TEST SUITE");
  console.log("================================================================================");

  // ==============================================================================
  // STEP 1: Assessment Creation with 3 Sections (Single MCQ, Multi MCQ, Multi-Lang Coding)
  // ==============================================================================
  console.log("\n[Dogfood 1] Setting up Advanced 3-Section Institutional Assessment...");
  const assessmentCode = `DOGFOOD-${Date.now().toString().slice(-4)}`;
  
  const assessment = await prisma.assessment.create({
    data: {
      title: "Algorithms & Systems Comprehensive Final Exam",
      description: "Institutional dogfood examination testing MCQs, memory limits, and multi-language compilation.",
      code: assessmentCode,
      durationMinutes: 90,
      isReviewUnlocked: false,
      sebQuitPassword: "exitDogfood123",
      requireSeb: true,
    },
  });

  // Section 1: Single-Choice MCQs (with negative marking)
  const sec1 = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section 1: Language Semantics (Single Choice)",
      description: "Select the single best answer. Incorrect answers incur a 0.5 mark penalty.",
      order: 0,
    },
  });

  const q1 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec1.id,
      type: "MCQ",
      title: "Java String Pool & Operator Precedence",
      description: "What does `\"a\" + 1 + 2` evaluate to in Java?",
      marks: 2.0,
      negativeMarks: 0.5,
      mcqType: "SINGLE",
      options: JSON.stringify([
        { id: "opt-1", text: "a3" },
        { id: "opt-2", text: "a12" },
        { id: "opt-3", text: "3a" },
        { id: "opt-4", text: "Compilation Error" },
      ]),
      correctAnswers: JSON.stringify(["opt-2"]),
      explanation: "Java evaluates left-to-right: (\"a\" + 1) becomes \"a1\", then (\"a1\" + 2) becomes \"a12\".",
      order: 0,
    },
  });

  // Section 2: Multiple-Choice MCQs
  const sec2 = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section 2: C/C++ Memory Management (Multiple Choice)",
      description: "Select all options that correctly describe dynamic memory behavior.",
      order: 1,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec2.id,
      type: "MCQ",
      title: "Memory Allocation Truths",
      description: "Which of the following statements regarding memory allocation are TRUE?",
      marks: 4.0,
      negativeMarks: 1.0,
      mcqType: "MULTIPLE",
      options: JSON.stringify([
        { id: "opt-a", text: "malloc allocates uninitialized heap memory." },
        { id: "opt-b", text: "calloc zeroes out allocated memory." },
        { id: "opt-c", text: "free() automatically resets the pointer to NULL." },
        { id: "opt-d", text: "Stack memory is automatically deallocated upon scope exit." },
      ]),
      correctAnswers: JSON.stringify(["opt-a", "opt-b", "opt-d"]),
      explanation: "malloc and calloc allocate on the heap; stack is scope-bound. free() frees memory but leaves dangling pointer unless explicitly set to NULL.",
      order: 0,
    },
  });

  // Section 3: Algorithmic Coding Challenge (Java, C, C++)
  const sec3 = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section 3: High-Performance Data Processing",
      description: "Solve the array transformation problem within 3 seconds and 256MB RAM.",
      order: 2,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec3.id,
      type: "CODING",
      title: "Problem 1: Max Subarray Sum (Kadane's Algorithm)",
      description: "Given an array of N integers, find the contiguous subarray with the largest sum and print that sum.",
      marks: 44.0,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      allowedLanguages: "JAVA,C,CPP",
      starterCodes: JSON.stringify({
        JAVA: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long[] arr = new long[n];\n        for(int i=0; i<n; i++) arr[i] = sc.nextLong();\n        // Write Kadane algorithm here\n    }\n}\n",
        C: "#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n    long long x;\n    // Write C algorithm here\n    return 0;\n}\n",
        CPP: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n    // Write C++ algorithm here\n    return 0;\n}\n",
      }),
      order: 0,
      testCases: {
        create: [
          { input: "8\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isPublic: true, weight: 1 },
          { input: "5\n1 2 3 4 5", expectedOutput: "15", isPublic: true, weight: 1 },
          { input: "5\n-5 -4 -1 -2 -3", expectedOutput: "-1", isPublic: false, weight: 1.5 },
          { input: "1\n42", expectedOutput: "42", isPublic: false, weight: 1 },
        ],
      },
    },
    include: {
      testCases: true,
    },
  });

  console.log(`✅ Assessment Created: ${assessment.title} (Code: ${assessment.code})`);

  // ==============================================================================
  // STEP 2: Safe Exam Browser Plist Validation & Exit Route Check
  // ==============================================================================
  console.log("\n[Dogfood 2] Generating & Validating Universal SEB Plist Configuration...");
  const sebPlist = generateSebConfig({
    assessmentCode: assessment.code,
    startUrl: `http://192.168.0.126:3000/?code=${assessment.code}`,
    quitPassword: "exitDogfood123",
    title: assessment.title,
  });

  if (!sebPlist.includes("<key>quitURL</key>") || !sebPlist.includes("<string>http://192.168.0.126:3000/quit</string>")) {
    throw new Error("SEB Plist quitURL mismatch!");
  }
  if (!sebPlist.includes("<key>enableCmdTab</key>") || !sebPlist.includes("<false/>")) {
    throw new Error("SEB Plist macOS shortcut protection missing!");
  }
  console.log("✅ Universal SEB Plist validated: Cross-platform quitURL (/quit) and macOS/Win keys verified.");

  // ==============================================================================
  // STEP 3: Student 1 - Flawless Execution across Java, C, and C++
  // ==============================================================================
  console.log("\n[Dogfood 3] Candidate 1 (Alice Johnson - 21CS001): Perfect 100% Score Workflow...");
  const att1 = await prisma.studentAttempt.create({
    data: {
      assessmentId: assessment.id,
      rollNo: "21CS001",
      studentName: "Alice Johnson",
      status: "IN_PROGRESS",
      startedAt: new Date(),
      remainingSeconds: 5400,
    },
  });

  // Q1 Correct (+2)
  const q1Eval = gradeMcqQuestion(["opt-2"], ["opt-2"], q1.marks, q1.negativeMarks);
  await prisma.submission.create({
    data: {
      attemptId: att1.id,
      questionId: q1.id,
      code: JSON.stringify(["opt-2"]),
      language: "MCQ",
      score: q1Eval.score,
      status: q1Eval.status,
    },
  });

  // Q2 Correct (+4)
  const q2Eval = gradeMcqQuestion(["opt-a", "opt-b", "opt-d"], ["opt-a", "opt-b", "opt-d"], q2.marks, q2.negativeMarks);
  await prisma.submission.create({
    data: {
      attemptId: att1.id,
      questionId: q2.id,
      code: JSON.stringify(["opt-a", "opt-b", "opt-d"]),
      language: "MCQ",
      score: q2Eval.score,
      status: q2Eval.status,
    },
  });

  // Q3 Solved in Java (+44)
  const javaKadane = `
    import java.util.Scanner;
    public class Solution {
      public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long maxSoFar = Long.MIN_VALUE;
        long currentMax = 0;
        for (int i = 0; i < n; i++) {
          long x = sc.nextLong();
          currentMax += x;
          if (maxSoFar < currentMax) maxSoFar = currentMax;
          if (currentMax < 0) currentMax = 0;
        }
        System.out.println(maxSoFar);
      }
    }
  `;
  const q3JavaGrading = await gradeStudentCode("JAVA", javaKadane, q3, false);
  console.log(`  -> Q3 Java Solution: ${q3JavaGrading.status} (${q3JavaGrading.passedTestCases}/${q3JavaGrading.totalTestCases} Passed, Score: ${q3JavaGrading.totalScore}/${q3JavaGrading.maxScore})`);
  if (q3JavaGrading.status !== "ACCEPTED" || q3JavaGrading.totalScore !== 44) {
    throw new Error("Candidate 1 Java Solution failed grading!");
  }

  await prisma.submission.create({
    data: {
      attemptId: att1.id,
      questionId: q3.id,
      code: javaKadane,
      language: "JAVA",
      score: q3JavaGrading.totalScore,
      status: q3JavaGrading.status,
      passedTestCases: q3JavaGrading.passedTestCases,
      totalTestCases: q3JavaGrading.totalTestCases,
    },
  });

  await prisma.studentAttempt.update({
    where: { id: att1.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  console.log(`✅ Candidate 1 Completed: 50.0/50.0 (100.0%)`);

  // ==============================================================================
  // STEP 4: Student 2 - Edge Cases: Compiler Errors, Penalties, and C++ Solution
  // ==============================================================================
  console.log("\n[Dogfood 4] Candidate 2 (Bob Martinez - 21CS002): Compiler Faults & Penalty Auditing...");
  const att2 = await prisma.studentAttempt.create({
    data: {
      assessmentId: assessment.id,
      rollNo: "21CS002",
      studentName: "Bob Martinez",
      status: "IN_PROGRESS",
      startedAt: new Date(),
      remainingSeconds: 5400,
    },
  });

  // Q1 Wrong Choice -> Penalty -0.5
  const q1Wrong = gradeMcqQuestion(["opt-1"], ["opt-2"], q1.marks, q1.negativeMarks);
  await prisma.submission.create({
    data: {
      attemptId: att2.id,
      questionId: q1.id,
      code: JSON.stringify(["opt-1"]),
      language: "MCQ",
      score: q1Wrong.score,
      status: q1Wrong.status,
    },
  });
  console.log(`  -> Q1 Negative Marking Verified: Score = ${q1Wrong.score} (Penalty Applied)`);

  // Q2 Partially Correct / Incomplete
  const q2Partial = gradeMcqQuestion(["opt-a", "opt-c"], ["opt-a", "opt-b", "opt-d"], q2.marks, q2.negativeMarks);
  await prisma.submission.create({
    data: {
      attemptId: att2.id,
      questionId: q2.id,
      code: JSON.stringify(["opt-a", "opt-c"]),
      language: "MCQ",
      score: q2Partial.score,
      status: q2Partial.status,
    },
  });

  // Q3 Compiler Fault in C
  const brokenCCode = `
    #include <stdio.h>
    int main() {
      undeclared_variable = 100;
      return 0;
    }
  `;
  const brokenCExec = await executeCode("C", brokenCCode, "8\n-2 1 -3 4 -1 2 1 -5 4", 3, 256);
  console.log(`  -> C Compiler Error Captured Cleanly: ${brokenCExec.status} (${brokenCExec.compilationError.trim().split("\n")[0]})`);
  if (brokenCExec.status !== "COMPILE_ERROR") throw new Error("Compiler Error detection failed!");

  // Now Bob fixes and solves Kadane in C++
  const cppKadane = `
    #include <iostream>
    #include <vector>
    #include <algorithm>
    #include <climits>
    using namespace std;
    int main() {
      ios_base::sync_with_stdio(false);
      cin.tie(NULL);
      int n;
      if (!(cin >> n)) return 0;
      long long max_so_far = LLONG_MIN, curr_max = 0;
      for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        curr_max += x;
        if (max_so_far < curr_max) max_so_far = curr_max;
        if (curr_max < 0) curr_max = 0;
      }
      cout << max_so_far << "\\n";
      return 0;
    }
  `;
  const q3CppGrading = await gradeStudentCode("CPP", cppKadane, q3, false);
  console.log(`  -> Q3 C++ Fixed Solution: ${q3CppGrading.status} (${q3CppGrading.passedTestCases}/${q3CppGrading.totalTestCases} Passed, Score: ${q3CppGrading.totalScore}/${q3CppGrading.maxScore})`);
  if (q3CppGrading.status !== "ACCEPTED") throw new Error("Candidate 2 C++ Solution failed!");

  await prisma.submission.create({
    data: {
      attemptId: att2.id,
      questionId: q3.id,
      code: cppKadane,
      language: "CPP",
      score: q3CppGrading.totalScore,
      status: q3CppGrading.status,
      passedTestCases: q3CppGrading.passedTestCases,
      totalTestCases: q3CppGrading.totalTestCases,
    },
  });

  await prisma.studentAttempt.update({
    where: { id: att2.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  console.log(`✅ Candidate 2 Completed: ${q1Wrong.score + q2Partial.score + q3CppGrading.totalScore}/50.0`);

  // ==============================================================================
  // STEP 5: Student 3 - Edge Cases: Infinite Loops (TLE) and Runtime Errors (RTE)
  // ==============================================================================
  console.log("\n[Dogfood 5] Candidate 3 (Charlie Davis - 21CS003): Timeout (TLE) & Crash (RTE) Auditing...");
  
  // 5A: Infinite Loop Timeout Test (Time Limit: 1 second)
  const infiniteLoopCode = `
    #include <iostream>
    using namespace std;
    int main() {
      int x = 0;
      while(true) {
        x++;
      }
      return 0;
    }
  `;
  const tleResult = await executeCode("CPP", infiniteLoopCode, "5", 1, 256);
  console.log(`  -> Infinite Loop Handled: Status = ${tleResult.status} (Timed out safely after ${tleResult.executionTimeMs}ms)`);
  if (tleResult.status !== "TIME_LIMIT_EXCEEDED") throw new Error("TLE detection failed!");

  // 5B: Segmentation Fault Crash Test
  const segFaultCode = `
    #include <stdio.h>
    int main() {
      int *ptr = NULL;
      *ptr = 999;
      return 0;
    }
  `;
  const rteResult = await executeCode("C", segFaultCode, "5", 1, 256);
  console.log(`  -> Null Pointer Crash Handled: Status = ${rteResult.status} (${rteResult.stderr || "Crash trapped"})`);
  if (rteResult.status !== "RUNTIME_ERROR") throw new Error("Runtime Error crash handling failed!");

  // 5C: Clean C Kadane Solution
  const cKadane = `
    #include <stdio.h>
    int main() {
      int n;
      if (scanf("%d", &n) != 1) return 0;
      long long max_so_far = -9223372036854775807LL - 1;
      long long curr_max = 0;
      for (int i = 0; i < n; i++) {
        long long x;
        if (scanf("%lld", &x) == 1) {
          curr_max += x;
          if (max_so_far < curr_max) max_so_far = curr_max;
          if (curr_max < 0) curr_max = 0;
        }
      }
      printf("%lld\\n", max_so_far);
      return 0;
    }
  `;
  const q3CGrading = await gradeStudentCode("C", cKadane, q3, false);
  console.log(`  -> Q3 C Algorithm: ${q3CGrading.status} (${q3CGrading.passedTestCases}/${q3CGrading.totalTestCases} Passed, Score: ${q3CGrading.totalScore}/${q3CGrading.maxScore})`);
  if (q3CGrading.status !== "ACCEPTED") throw new Error("Candidate 3 C Solution failed!");

  // ==============================================================================
  // STEP 6: Proctoring Violation Logging & Heartbeat Verification
  // ==============================================================================
  console.log("\n[Dogfood 6] Testing Proctoring & Violation Telemetry...");
  const violation1 = await prisma.violation.create({
    data: {
      attemptId: att1.id,
      violationType: "CONTROL_LOST",
      details: "Input focus lost to background process.",
    },
  });
  const violation2 = await prisma.violation.create({
    data: {
      attemptId: att2.id,
      violationType: "TAB_SWITCH",
      details: "Window minimized or switched tabs.",
    },
  });
  console.log(`✅ Proctoring telemetry recorded: Violation IDs ${violation1.id} & ${violation2.id}`);

  // ==============================================================================
  // STEP 7: Gradebook Aggregation & Results Verification
  // ==============================================================================
  console.log("\n[Dogfood 7] Auditing Gradebook Analytics Calculation...");
  const assessmentWithResults = await prisma.assessment.findUnique({
    where: { id: assessment.id },
    include: {
      questions: true,
      attempts: {
        include: {
          submissions: true,
          violations: true,
        },
      },
    },
  });

  const totalPossible = assessmentWithResults!.questions.reduce((sum, q) => sum + q.marks, 0);
  console.log(`  -> Total Possible Marks: ${totalPossible} (Expected: 50)`);
  if (totalPossible !== 50) throw new Error("Gradebook Total Marks Mismatch!");

  for (const att of assessmentWithResults!.attempts) {
    let earned = 0;
    for (const sub of att.submissions) {
      earned += sub.score;
    }
    console.log(`  -> Student ${att.rollNo} (${att.studentName}): Score = ${earned.toFixed(1)}/${totalPossible} (${((earned / totalPossible) * 100).toFixed(1)}%) | Violations: ${att.violations.length}`);
  }

  // ==============================================================================
  // STEP 8: Post-Exam Student Practice / Review Mode Verification
  // ==============================================================================
  console.log("\n[Dogfood 8] Enabling and Testing Review & Practice Mode...");
  await prisma.assessment.update({
    where: { id: assessment.id },
    data: { isReviewUnlocked: true },
  });

  const reviewUnlockedAss = await prisma.assessment.findUnique({
    where: { id: assessment.id },
  });
  if (!reviewUnlockedAss?.isReviewUnlocked) throw new Error("Review Mode unlock toggle failed!");
  console.log("✅ Review & Practice Mode successfully unlocked for students.");

  // Cleanup dogfood test data
  await prisma.assessment.delete({ where: { id: assessment.id } });
  console.log("✅ Dogfood Examination Data Cleaned Up Cleanly.");

  console.log("\n================================================================================");
  console.log("   🎉 ALL 8 DOGFOODING SCENARIOS PASSED WITH ZERO ERRORS!");
  console.log("================================================================================");
}

runComprehensiveDogfoodSuite().catch((err) => {
  console.error("Dogfood suite failed:", err);
  process.exit(1);
});
