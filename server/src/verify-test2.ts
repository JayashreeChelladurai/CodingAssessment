import { PrismaClient } from "@prisma/client";
import { gradeStudentCode } from "./services/gradingService.js";

const prisma = new PrismaClient();

const solutions: Record<string, string> = {
  "Binary Search": `import java.util.*;

public class Solution {
    public static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int target = sc.nextInt();

        int result = binarySearch(arr, target);
        System.out.println(result);
    }
}`,

  "Decimal to Binary": `import java.util.*;

public class Solution {
    public static String decimalToBinary(int n) {
        if (n == 0) return "0";
        StringBuilder sb = new StringBuilder();
        while (n > 0) {
            sb.append(n % 2);
            n /= 2;
        }
        return sb.reverse().toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        String result = decimalToBinary(n);
        System.out.println(result);
    }
}`,

  "2 Sum with Collections": `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();

        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`,

  "Check if 2 Strings are Anagram": `import java.util.*;

public class Solution {
    public static boolean isAnagram(String s1, String s2) {
        if (s1.length() != s2.length()) return false;
        char[] a1 = s1.toCharArray();
        char[] a2 = s2.toCharArray();
        Arrays.sort(a1);
        Arrays.sort(a2);
        return Arrays.equals(a1, a2);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s1 = sc.nextLine();
        String s2 = sc.hasNextLine() ? sc.nextLine() : "";

        boolean result = isAnagram(s1, s2);
        System.out.println(result);
    }
}`,

  "Merge 2 Sorted Arrays": `import java.util.*;

public class Solution {
    public static int[] mergeSortedArrays(int[] arr1, int[] arr2) {
        int n = arr1.length;
        int m = arr2.length;
        int[] res = new int[n + m];
        int i = 0, j = 0, k = 0;
        while (i < n && j < m) {
            if (arr1[i] <= arr2[j]) {
                res[k++] = arr1[i++];
            } else {
                res[k++] = arr2[j++];
            }
        }
        while (i < n) {
            res[k++] = arr1[i++];
        }
        while (j < m) {
            res[k++] = arr2[j++];
        }
        return res;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr1 = new int[n];
        for (int i = 0; i < n; i++) {
            arr1[i] = sc.nextInt();
        }
        int m = sc.nextInt();
        int[] arr2 = new int[m];
        for (int i = 0; i < m; i++) {
            arr2[i] = sc.nextInt();
        }

        int[] result = mergeSortedArrays(arr1, arr2);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb.toString());
    }
}`,
};

async function verify() {
  console.log("================================================================================");
  console.log("   🧪 VERIFYING ALL 5 QUESTIONS IN 'Test2' (COMPILATION & 50 TESTCASES)         ");
  console.log("================================================================================");

  const assessment = await prisma.assessment.findUnique({
    where: { code: "TEST2" },
    include: {
      sections: {
        include: {
          questions: {
            include: { testCases: true },
          },
        },
      },
    },
  });

  if (!assessment) {
    console.error("❌ Assessment TEST2 not found!");
    return;
  }

  let allPassed = true;

  for (const q of assessment.sections[0].questions) {
    const code = solutions[q.title];
    if (!code) {
      console.error(`❌ No solution found for ${q.title}`);
      allPassed = false;
      continue;
    }

    console.log(`\n▶️ Testing Question: ${q.title} (${q.testCases.length} Test Cases)...`);
    const grading = await gradeStudentCode("JAVA", code, {
      id: q.id,
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
    });

    console.log(`   Status: ${grading.status}`);
    console.log(`   Score: ${grading.totalScore}/${grading.maxScore}`);
    console.log(`   Passed: ${grading.passedTestCases}/${grading.totalTestCases}`);

    if (grading.status !== "ACCEPTED" || grading.passedTestCases !== q.testCases.length) {
      allPassed = false;
      console.error(`   ❌ Failed test cases:`);
      for (let i = 0; i < grading.results.length; i++) {
        const r = grading.results[i];
        if (!r.passed) {
          console.error(`      Case #${i + 1} (${r.isPublic ? "Public" : "Hidden"}): Status=${r.status}`);
          console.error(`        Input: ${JSON.stringify(r.input)}`);
          console.error(`        Expected: ${JSON.stringify(r.expectedOutput)}`);
          console.error(`        Actual: ${JSON.stringify(r.stdout)}`);
          if (r.stderr) console.error(`        Stderr: ${JSON.stringify(r.stderr)}`);
        }
      }
    } else {
      console.log(`   ✅ ALL ${grading.totalTestCases} TEST CASES PASSED PERFECTLY!`);
    }
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("   🎉 ALL 5 QUESTIONS AND 50 TEST CASES PASSED VERIFICATION WITH 100% SCORE!    ");
  } else {
    console.error("   ❌ SOME TEST CASES FAILED VERIFICATION.                                     ");
  }
  console.log("================================================================================");
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
