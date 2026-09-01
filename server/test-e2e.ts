import { prisma } from "./src/db.js";
import { gradeStudentCode, gradeMcqQuestion } from "./src/services/gradingService.js";
import { generateSebConfig } from "./src/services/sebService.js";

async function runEndToEndAudit() {
  console.log("================================================================");
  console.log("   🧪 RUNNING COMPREHENSIVE END-TO-END AUDIT: PROFESSOR & STUDENT");
  console.log("================================================================");

  // -------------------------------------------------------------
  // STEP 1: Professor Portal Flow (Assessment Setup & Seeding)
  // -------------------------------------------------------------
  console.log("\n[Step 1] Professor Portal: Setting up Hybrid Multi-Language Assessment...");
  const assessmentCode = `AUDIT-${Date.now().toString().slice(-4)}`;
  
  const assessment = await prisma.assessment.create({
    data: {
      title: "Comprehensive Multi-Language Exam (Audit)",
      code: assessmentCode,
      durationMinutes: 60,
      isReviewUnlocked: false,
      sebQuitPassword: "exit123",
    },
  });

  const secA = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section A: Core Concept MCQs",
      description: "Test basic logic and expression evaluations.",
      order: 0,
    },
  });

  const mcqQuestion = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: secA.id,
      type: "MCQ",
      title: "Java & C Post-Increment Evaluation",
      description: "Given `int x = 5; int res = x++ + ++x;`, what is `res`?",
      marks: 2.0,
      negativeMarks: 0.5,
      mcqType: "SINGLE",
      options: JSON.stringify([
        { id: "opt-1", text: "12" },
        { id: "opt-2", text: "11" },
        { id: "opt-3", text: "10" },
        { id: "opt-4", text: "13" },
      ]),
      correctAnswers: JSON.stringify(["opt-1"]),
      explanation: "5 + 7 = 12",
      order: 0,
    },
  });

  const secB = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section B: Coding Challenge",
      description: "Array sum problem solvable in Java, C, or C++.",
      order: 1,
    },
  });

  const codingQuestion = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: secB.id,
      type: "CODING",
      title: "Problem 1: Array Sum",
      description: "Read N, followed by N integers. Print their sum.",
      marks: 48.0,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      allowedLanguages: "JAVA,C,CPP",
      starterCodes: JSON.stringify({
        JAVA: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int sum = 0;\n        for(int i=0; i<n; i++) sum += sc.nextInt();\n        System.out.println(sum);\n    }\n}\n",
        C: "#include <stdio.h>\n\nint main() {\n    int n, x, sum = 0;\n    if(scanf(\"%d\", &n) != 1) return 0;\n    for(int i=0; i<n; i++) { scanf(\"%d\", &x); sum += x; }\n    printf(\"%d\\n\", sum);\n    return 0;\n}\n",
        CPP: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, sum = 0, x;\n    if(!(cin >> n)) return 0;\n    for(int i=0; i<n; i++) { cin >> x; sum += x; }\n    cout << sum << endl;\n    return 0;\n}\n",
      }),
      order: 0,
      testCases: {
        create: [
          { input: "3\n1 2 3", expectedOutput: "6", isPublic: true, weight: 1 },
          { input: "4\n10 20 30 40", expectedOutput: "100", isPublic: false, weight: 1 },
        ],
      },
    },
    include: {
      testCases: true,
    },
  });

  console.log(`✅ Assessment Created: ${assessment.title} (Code: ${assessment.code})`);

  // -------------------------------------------------------------
  // STEP 2: Safe Exam Browser Config Generation
  // -------------------------------------------------------------
  console.log("\n[Step 2] SEB XML Generation & Validation...");
  const sebConfig = generateSebConfig({
    assessmentCode: assessment.code,
    startUrl: `http://192.168.0.126:3000/?code=${assessment.code}`,
    quitPassword: "exit123",
    title: assessment.title,
  });

  if (!sebConfig.includes("<!DOCTYPE plist") || !sebConfig.includes("<key>allowVirtualMachine</key>")) {
    throw new Error("SEB XML validation failed!");
  }
  console.log("✅ Universal Cross-Platform SEB Configuration Generated Cleanly");

  // -------------------------------------------------------------
  // STEP 3: Student Flow (Start Attempt, MCQ, and Multi-Lang Coding)
  // -------------------------------------------------------------
  console.log("\n[Step 3] Student Portal: Starting Attempt for 21CS088 (David Miller)...");
  const attempt = await prisma.studentAttempt.create({
    data: {
      assessmentId: assessment.id,
      rollNo: "21CS088",
      studentName: "David Miller",
      status: "IN_PROGRESS",
      startedAt: new Date(),
      remainingSeconds: 3600,
    },
  });
  console.log(`✅ Student Attempt Initialized: ID ${attempt.id}`);

  // Test MCQ Submission
  console.log("\n[Step 4] Submitting MCQ Question Response...");
  const mcqEval = gradeMcqQuestion(
    ["opt-1"],
    JSON.parse(mcqQuestion.correctAnswers || "[]"),
    mcqQuestion.marks,
    mcqQuestion.negativeMarks
  );
  await prisma.submission.create({
    data: {
      attemptId: attempt.id,
      questionId: mcqQuestion.id,
      code: JSON.stringify(["opt-1"]),
      language: "MCQ",
      score: mcqEval.score,
      status: mcqEval.status,
    },
  });
  console.log(`✅ MCQ Graded: Score = ${mcqEval.score}/${mcqQuestion.marks} (${mcqEval.status})`);

  // Test Multi-Language Execution for Coding Question
  console.log(`\n[Step 5] Testing Multi-Language Execution on Coding Question (${codingQuestion.title})...`);

  // 5A: Test Java Solution
  console.log("  -> Testing Java Solution Execution...");
  const javaSol = `
    import java.util.Scanner;
    public class Solution {
      public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        for(int i = 0; i < n; i++) sum += sc.nextInt();
        System.out.println(sum);
      }
    }
  `;
  const javaGrading = await gradeStudentCode("JAVA", javaSol, codingQuestion, false);
  console.log(`     Java Result: ${javaGrading.status} (${javaGrading.passedTestCases}/${javaGrading.totalTestCases} Testcases Passed, Score: ${javaGrading.totalScore}/${javaGrading.maxScore})`);
  if (javaGrading.status !== "ACCEPTED") throw new Error("Java Solution Failed!");

  // 5B: Test C Solution
  console.log("  -> Testing C Solution Execution...");
  const cSol = `
    #include <stdio.h>
    int main() {
      int n, x, sum = 0;
      if (scanf("%d", &n) != 1) return 0;
      for(int i = 0; i < n; i++) {
        if (scanf("%d", &x) == 1) sum += x;
      }
      printf("%d\\n", sum);
      return 0;
    }
  `;
  const cGrading = await gradeStudentCode("C", cSol, codingQuestion, false);
  console.log(`     C Result: ${cGrading.status} (${cGrading.passedTestCases}/${cGrading.totalTestCases} Testcases Passed, Score: ${cGrading.totalScore}/${cGrading.maxScore})`);
  if (cGrading.status !== "ACCEPTED") throw new Error("C Solution Failed!");

  // 5C: Test C++ Solution
  console.log("  -> Testing C++ Solution Execution...");
  const cppSol = `
    #include <iostream>
    #include <vector>
    using namespace std;
    int main() {
      int n;
      if (!(cin >> n)) return 0;
      int sum = 0, x;
      for(int i = 0; i < n; i++) {
        cin >> x;
        sum += x;
      }
      cout << sum << endl;
      return 0;
    }
  `;
  const cppGrading = await gradeStudentCode("CPP", cppSol, codingQuestion, false);
  console.log(`     C++ Result: ${cppGrading.status} (${cppGrading.passedTestCases}/${cppGrading.totalTestCases} Testcases Passed, Score: ${cppGrading.totalScore}/${cppGrading.maxScore})`);
  if (cppGrading.status !== "ACCEPTED") throw new Error("C++ Solution Failed!");

  // Record Coding Submission
  await prisma.submission.create({
    data: {
      attemptId: attempt.id,
      questionId: codingQuestion.id,
      code: cppSol,
      language: "CPP",
      score: cppGrading.totalScore,
      status: cppGrading.status,
    },
  });

  // -------------------------------------------------------------
  // STEP 6: Final Submission & Gradebook Calculation
  // -------------------------------------------------------------
  console.log("\n[Step 6] Finalizing Assessment Submission and Computing Gradebook Totals...");
  const totalAssessmentMarks = mcqQuestion.marks + codingQuestion.marks; // 2 + 48 = 50
  const finalScore = mcqEval.score + cppGrading.totalScore;
  
  const completedAttempt = await prisma.studentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  console.log(`✅ Attempt Finalized! Status: ${completedAttempt.status}`);
  console.log(`✅ Total Score Calculated: ${finalScore}/${totalAssessmentMarks} (${((finalScore / totalAssessmentMarks) * 100).toFixed(1)}%)`);

  // Cleanup test assessment
  await prisma.assessment.delete({ where: { id: assessment.id } });
  console.log("✅ Audit Test Data Cleaned Up");

  console.log("\n================================================================");
  console.log("   🎉 ALL END-TO-END CHECKS (PROFESSOR & STUDENT) SUCCEEDED!");
  console.log("================================================================");
}

runEndToEndAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
