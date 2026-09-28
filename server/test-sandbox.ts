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
    throw new Error(`Java Test Failed: ${resJava.stderr || resJava.compilationError}`);
  }

  // 2. Test C Execution
  console.log("\n[Test 2] Running C Code...");
  const cCode = `
    #include <stdio.h>
    int main() {
      int a, b;
      if (scanf("%d %d", &a, &b) == 2) {
        printf("%d\\n", a * b);
      }
      return 0;
    }
  `;
  const resC = await executeCode("C", cCode, "6 7", 3, 256);
  console.log("C Result:", resC.status, "Output:", resC.stdout.trim(), `(${resC.executionTimeMs}ms)`);
  if (resC.status !== "ACCEPTED" || resC.stdout.trim() !== "42") {
    throw new Error(`C Test Failed: ${resC.stderr || resC.compilationError}`);
  }

  // 3. Test C++ Execution
  console.log("\n[Test 3] Running C++ Code...");
  const cppCode = `
    #include <iostream>
    #include <vector>
    #include <numeric>
    using namespace std;
    int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> v(n);
      for(int i = 0; i < n; i++) cin >> v[i];
      int sum = 0;
      for(int x : v) sum += x;
      cout << sum << endl;
      return 0;
    }
  `;
  const resCpp = await executeCode("CPP", cppCode, "4 10 20 30 40", 3, 256);
  console.log("C++ Result:", resCpp.status, "Output:", resCpp.stdout.trim(), `(${resCpp.executionTimeMs}ms)`);
  if (resCpp.status !== "ACCEPTED" || resCpp.stdout.trim() !== "100") {
    throw new Error(`C++ Test Failed: ${resCpp.stderr || resCpp.compilationError}`);
  }

  // 4. Test MCQ Grading (Correct Answer)
  console.log("\n[Test 4] Testing MCQ Grading (Correct)...");
  const mcqCorrect = gradeMcqQuestion(["opt-2"], ["opt-2"], 2.0, 0.5);
  console.log("MCQ Correct Score:", mcqCorrect.score, "Status:", mcqCorrect.status);
  if (mcqCorrect.score !== 2.0 || mcqCorrect.status !== "CORRECT") {
    throw new Error("MCQ Correct Test Failed!");
  }

  // 5. Test MCQ Grading (Incorrect with Negative Marking)
  console.log("\n[Test 5] Testing MCQ Grading (Incorrect Negative Marking)...");
  const mcqWrong = gradeMcqQuestion(["opt-1"], ["opt-2"], 2.0, 0.5);
  console.log("MCQ Wrong Penalty:", mcqWrong.score, "Status:", mcqWrong.status);
  if (mcqWrong.score !== -0.5 || mcqWrong.status !== "INCORRECT") {
    throw new Error("MCQ Negative Marking Test Failed!");
  }

  // 6. Test SEB XML Configuration Generation
  console.log("\n[Test 6] Testing SEB XML Config Generation...");
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

  // 7. Test Multi-Testcase Partial Grading (C++ Solution)
  console.log("\n[Test 7] Testing Multi-Testcase Partial Grading (C++)...");
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

  const studentCppSolution = `
    #include <iostream>
    #include <vector>
    #include <unordered_set>
    using namespace std;
    int main() {
      int n;
      if (!(cin >> n)) return 0;
      vector<int> a(n);
      for(int i = 0; i < n; i++) cin >> a[i];
      int target;
      cin >> target;
      unordered_set<int> seen;
      bool found = false;
      for(int x : a) {
        if (seen.count(target - x)) { found = true; break; }
        seen.insert(x);
      }
      cout << (found ? "YES" : "NO") << endl;
      return 0;
    }
  `;

  const grading = await gradeStudentCode("CPP", studentCppSolution, question, false);
  console.log(`Coding Passed: ${grading.passedTestCases}/${grading.totalTestCases} | Score: ${grading.totalScore}/${grading.maxScore}`);

  if (grading.status !== "ACCEPTED" || grading.totalScore !== 48) {
    throw new Error("Coding Grading Failed!");
  }

  console.log("\n==================================================");
  console.log("   🎉 ALL TESTS (JAVA, C, C++, MCQs, SEB, SCORING) PASSED!");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
