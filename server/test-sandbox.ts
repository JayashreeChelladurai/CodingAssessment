import { executeCode } from "./src/services/codeRunner.js";
import { gradeStudentCode, gradeMcqQuestion } from "./src/services/gradingService.js";
import { generateSebConfig } from "./src/services/sebService.js";

async function runTests() {
  console.log("==================================================");
  console.log("   🧪 TESTING FULL ACADEMIC ENGINE & SANDBOX");
  console.log("==================================================");

  // 1. Test Java Execution
  console.log("\n[Test 1] Running Java Code...");
  const javaCode = `
    import java.util.Scanner;
    public class Solution {
      public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
      }
    }
  `;
  const resJava = await executeCode("JAVA", javaCode, "20 30", 3, 256);
  console.log("Java Result:", resJava.status, "Output:", resJava.stdout.trim(), `(${resJava.executionTimeMs}ms)`);
  if (resJava.status !== "ACCEPTED" || resJava.stdout.trim() !== "50") {
    throw new Error("Java Test Failed!");
  }

  // 2. Test MCQ Grading (Correct Answer)
  console.log("\n[Test 2] Testing MCQ Grading (Correct)...");
  const mcqCorrect = gradeMcqQuestion(["opt-2"], ["opt-2"], 2.0, 0.5);
  console.log("MCQ Correct Score:", mcqCorrect.score, "Status:", mcqCorrect.status);
  if (mcqCorrect.score !== 2.0 || mcqCorrect.status !== "CORRECT") {
    throw new Error("MCQ Correct Test Failed!");
  }

  // 3. Test MCQ Grading (Incorrect with Negative Marking)
  console.log("\n[Test 3] Testing MCQ Grading (Incorrect Negative Marking)...");
  const mcqWrong = gradeMcqQuestion(["opt-1"], ["opt-2"], 2.0, 0.5);
  console.log("MCQ Wrong Penalty:", mcqWrong.score, "Status:", mcqWrong.status);
  if (mcqWrong.score !== -0.5 || mcqWrong.status !== "INCORRECT") {
    throw new Error("MCQ Negative Marking Test Failed!");
  }

  // 4. Test SEB XML Configuration Generation
  console.log("\n[Test 4] Testing SEB XML Config Generation...");
  const sebXml = generateSebConfig({
    assessmentCode: "JAVA-DEMO-101",
    startUrl: "http://localhost:3000/?code=JAVA-DEMO-101",
    quitPassword: "exit123",
    title: "Midterm Exam",
  });
  const hasPlist = sebXml.includes("<!DOCTYPE plist");
  const hasQuitPw = sebXml.includes("<key>hashedQuitPassword</key>");
  console.log("SEB XML Generated Cleanly:", hasPlist && hasQuitPw);
  if (!hasPlist || !hasQuitPw) {
    throw new Error("SEB XML Generation Failed!");
  }

  // 5. Test Multi-Testcase Partial Grading
  console.log("\n[Test 5] Testing Multi-Testcase Partial Grading...");
  const question = {
    id: "q-alg-1",
    marks: 48,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "YES", isPublic: true, weight: 1 },
      { input: "3\n1 2 3\n7", expectedOutput: "NO", isPublic: true, weight: 1 },
      { input: "5\n10 20 30 40 50\n70", expectedOutput: "YES", isPublic: false, weight: 1.5 },
      { input: "6\n-5 -2 0 3 8 12\n1", expectedOutput: "YES", isPublic: false, weight: 1.5 },
    ],
  };

  const studentSolution = `
    import java.util.*;
    public class Solution {
      public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for(int i=0; i<n; i++) a[i] = sc.nextInt();
        int target = sc.nextInt();
        HashSet<Integer> set = new HashSet<>();
        boolean ok = false;
        for(int x : a) {
          if (set.contains(target - x)) { ok = true; break; }
          set.add(x);
        }
        System.out.println(ok ? "YES" : "NO");
      }
    }
  `;

  const grading = await gradeStudentCode("JAVA", studentSolution, question, false);
  console.log(`Coding Passed: ${grading.passedTestCases}/${grading.totalTestCases} | Score: ${grading.totalScore}/${grading.maxScore}`);

  if (grading.status !== "ACCEPTED" || grading.totalScore !== 48) {
    throw new Error("Coding Grading Failed!");
  }

  console.log("\n==================================================");
  console.log("   🎉 ALL TESTS (JAVA, MCQs, SEB, SCORING) PASSED!");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
