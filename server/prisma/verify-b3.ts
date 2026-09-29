import { PrismaClient } from "@prisma/client";
import { gradeStudentCode } from "../src/services/gradingService.js";

const prisma = new PrismaClient();

const JAVA_SOLUTIONS = {
  // Q1: Contains Duplicate
  Q1: `import java.util.Scanner;
import java.util.HashSet;
import java.util.Set;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) {
            System.out.println("false");
            return;
        }
        int n = scanner.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = scanner.nextInt();
        }
        System.out.println(containsDuplicate(nums));
    }

    public static boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (!seen.add(num)) return true;
        }
        return false;
    }
}`,

  // Q2: Reverse Bits
  Q2: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextLong()) return;
        long n = scanner.nextLong();
        System.out.println(reverseBits(n));
    }

    public static long reverseBits(long n) {
        long result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | ((n >> i) & 1L);
        }
        return result;
    }
}`,

  // Q3: Combination Sum
  Q3: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        int[] candidates = new int[n];
        for (int i = 0; i < n; i++) {
            candidates[i] = scanner.nextInt();
        }
        int target = scanner.nextInt();

        List<List<Integer>> result = combinationSum(candidates, target);
        if (result.isEmpty()) {
            System.out.println("NONE");
        } else {
            for (List<Integer> comb : result) {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < comb.size(); i++) {
                    if (i > 0) sb.append(" ");
                    sb.append(comb.get(i));
                }
                System.out.println(sb.toString());
            }
        }
    }

    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    private static void backtrack(int[] candidates, int remain, int start, List<Integer> current, List<List<Integer>> result) {
        if (remain == 0) {
            result.add(new ArrayList<>(current));
            return;
        }
        if (remain < 0) return;
        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > remain) break;
            current.add(candidates[i]);
            backtrack(candidates, remain - candidates[i], i, current, result);
            current.remove(current.size() - 1);
        }
    }
}`
};

async function main() {
  console.log("============================================================================");
  console.log("🔍 Verifying Assessment B3: Formatting, Test Cases & Canonical Solutions");
  console.log("============================================================================");

  const assessment = await prisma.assessment.findUnique({
    where: { code: "B3" },
    include: {
      questions: {
        include: { testCases: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" }
      }
    }
  });

  if (!assessment) {
    console.error("❌ Assessment B3 not found in database!");
    process.exit(1);
  }

  console.log(`Assessment: ${assessment.title} (${assessment.code})`);
  console.log(`requireSeb: ${assessment.requireSeb}, durationMinutes: ${assessment.durationMinutes}`);
  console.log(`Questions count: ${assessment.questions.length}`);

  let allPassed = true;

  for (let idx = 0; idx < assessment.questions.length; idx++) {
    const q = assessment.questions[idx];
    console.log(`\n----------------------------------------------------------------------------`);
    console.log(`Checking Question ${idx + 1}: "${q.title}" (${q.marks} Marks)`);
    console.log(`Test cases: ${q.testCases.length} total, Public: ${q.testCases.filter(tc => tc.isPublic).length}`);

    // 1. Check formatting symbols
    const forbidden = /[*$#]/g;
    const textToCheck = `${q.title} ${q.description}`;
    const matches = textToCheck.match(forbidden);
    if (matches && matches.length > 0) {
      console.error(`❌ FORBIDDEN SYMBOLS FOUND in Q${idx + 1}: ${matches.join(", ")}`);
      allPassed = false;
    } else {
      console.log(`✅ Clean formatting verified: zero *, $, # symbols.`);
    }

    // 2. Check test case count
    if (q.testCases.length !== 100) {
      console.error(`❌ Expected 100 test cases, found ${q.testCases.length}`);
      allPassed = false;
    } else {
      console.log(`✅ 100 test cases verified.`);
    }

    // 3. Test canonical Java solution
    const javaCode = idx === 0 ? JAVA_SOLUTIONS.Q1 : idx === 1 ? JAVA_SOLUTIONS.Q2 : JAVA_SOLUTIONS.Q3;
    console.log(`Running canonical Java solution against all 100 test cases...`);

    const result = await gradeStudentCode(
      "JAVA",
      javaCode,
      {
        id: q.id,
        title: q.title,
        marks: q.marks,
        timeLimitSeconds: q.timeLimitSeconds,
        memoryLimitMb: q.memoryLimitMb,
        testCases: q.testCases.map((tc) => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isPublic: tc.isPublic,
          weight: tc.weight,
        })),
      },
      false
    );

    console.log(`Result: ${result.passedTestCases}/${result.totalTestCases} passed. Status: ${result.status}, Score: ${result.totalScore}/${result.maxScore}`);

    if (result.passedTestCases !== 100 || result.status !== "ACCEPTED") {
      console.error(`❌ Canonical solution failed for Q${idx + 1}!`);
      // Find first failed case
      const firstFail = result.results.find(r => !r.passed);
      if (firstFail) {
        console.error(`First failed case:`);
        console.error(`Input:`, firstFail.input);
        console.error(`Expected:`, firstFail.expectedOutput);
        console.error(`Actual:`, firstFail.stdout);
        console.error(`Error:`, firstFail.stderr);
      }
      allPassed = false;
    } else {
      console.log(`✅ 100/100 test cases passed with 100% score!`);
    }
  }

  console.log("\n============================================================================");
  if (allPassed) {
    console.log("🎉 ALL CHECKS PASSED: Assessment B3 is verified and ready for conduction!");
  } else {
    console.error("❌ Some verification checks failed!");
    process.exit(1);
  }
  console.log("============================================================================");
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
