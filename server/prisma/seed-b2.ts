import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// 1. CANONICAL REFERENCE ALGORITHMS (Guarantees 100% accurate expected outputs)
// ============================================================================

/**
 * Problem 1: Maximum Product Subarray
 * Uses Kadane's / DP tracking min and max product at each index with BigInt.
 */
function solveMaxProduct(nums: number[]): string {
  if (nums.length === 0) return "0";
  let maxSoFar = BigInt(nums[0]);
  let minSoFar = BigInt(nums[0]);
  let result = BigInt(nums[0]);

  for (let i = 1; i < nums.length; i++) {
    const curr = BigInt(nums[i]);
    if (curr < 0n) {
      const temp = maxSoFar;
      maxSoFar = minSoFar;
      minSoFar = temp;
    }
    const prodMax = maxSoFar * curr;
    maxSoFar = curr > prodMax ? curr : prodMax;

    const prodMin = minSoFar * curr;
    minSoFar = curr < prodMin ? curr : prodMin;

    if (maxSoFar > result) {
      result = maxSoFar;
    }
  }
  return result.toString();
}

/**
 * Problem 2: Counting Bits
 * ans[i] = ans[i >> 1] + (i & 1)
 */
function solveCountBits(n: number): string {
  const ans: number[] = new Array(n + 1);
  ans[0] = 0;
  for (let i = 1; i <= n; i++) {
    ans[i] = ans[i >> 1] + (i & 1);
  }
  return ans.join(" ");
}

/**
 * Problem 3: Grid Unique Paths
 * C(m + n - 2, min(m - 1, n - 1)) computed using BigInt
 */
function solveUniquePaths(m: number, n: number): string {
  const N = m + n - 2;
  const K = Math.min(m - 1, n - 1);
  let res = 1n;
  for (let i = 1; i <= K; i++) {
    res = (res * BigInt(N - i + 1)) / BigInt(i);
  }
  return res.toString();
}

// ============================================================================
// 2. TEST CASE DATA STRUCTURE
// ============================================================================

interface RawTestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  weight: number;
}

// ============================================================================
// 3. GENERATE 100 TEST CASES FOR MAXIMUM PRODUCT SUBARRAY
// ============================================================================

function generateMaxProductCases(): RawTestCase[] {
  const arrays: number[][] = [
    // 1-10: Sample & Public cases
    [2, 3, -2, 4],
    [-2, 0, -1],
    [-2],
    [0],
    [3, -1, 4],
    [2, -5, -2, -4, 3],
    [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    [1, 2, 3, 4],
    [-1, -2, -3, -4],
    [-2, 3, -4],

    // 11-20: Single element corner cases
    [5],
    [-10],
    [1],
    [-1],
    [100],
    [-100],
    [7],
    [-8],
    [42],
    [-99],

    // 21-30: Two elements corner cases
    [0, 2],
    [-2, 0],
    [0, 0],
    [-3, -4],
    [3, 4],
    [-5, 5],
    [2, -2],
    [-1, 1],
    [10, -10],
    [-1, -1],

    // 31-40: Three elements corner cases
    [-1, -2, -3],
    [1, 2, 3],
    [-1, 0, -2],
    [2, 0, 3],
    [0, 0, 0],
    [-2, -3, 0],
    [0, -2, -3],
    [-4, 2, -3],
    [5, -2, 4],
    [-2, 3, 4],

    // 41-50: Zeroes in various positions
    [2, 0, 3, 4],
    [0, 2, 3, -1],
    [-1, -2, 0, 4, 5],
    [0, 0, 5, 0, 0],
    [-2, 0, -1, 0, -3],
    [1, 0, -1, 0, 1],
    [0, -3, 1, 1],
    [3, -1, 0, 2, -2, 0, 4],
    [0, -2, 0, -3, 0],
    [7, 0, -4, -5, 0, 3],

    // 51-60: Odd number of negative numbers
    [-1, 2, 3, 4],
    [2, 3, 4, -1],
    [2, -1, 3, 4],
    [-2, 3, -4, -1, 2],
    [1, -2, 3, -4, 5, -6, 7],
    [-3, -1, -1],
    [2, -5, 3, 1, -4, 0, -2],
    [-2, -3, -4, -5, -6],
    [1, 2, -1, 4, 5],
    [-5, 2, 3, 2],

    // 61-70: Even number of negative numbers
    [-1, -2],
    [-2, -3, -4, -5],
    [-1, 2, -3, 4],
    [-2, -3, 2, -4, -5],
    [-1, -1, -1, -1],
    [-2, 1, 1, -2],
    [3, -2, -3, 4],
    [-1, -2, -3, 0, -4, -5],
    [-4, -3, -2, -1],
    [2, -1, 1, -1, 2],

    // 71-80: Alternating signs
    [1, -1, 1, -1, 1],
    [-1, 1, -1, 1, -1],
    [2, -2, 2, -2, 2],
    [-2, 2, -2, 2, -2],
    [3, -1, 3, -1, 3],
    [-1, 4, -1, 4, -1],
    [2, -3, 4, -5],
    [-5, 4, -3, 2],
    [1, -2, 3, -4, 5],
    [-1, 2, -3, 4, -5],

    // 81-90: Long sequences with 1s and -1s
    [1, 1, 1, 1, 1],
    [-1, -1, -1, -1, -1, -1],
    [1, -1, 1, -1, 1, -1],
    [0, 1, 0, 1, 0],
    [2, 1, 1, 1, 2],
    [-1, 1, 1, 1, 1, -1],
    [1, 1, -1, 1, 1],
    [-1, -1, 1, 1, -1, -1],
    [1, 2, 0, 3, 4, 0, 5, 6],
    [-2, 0, -3, 0, -4, 0, -5],

    // 91-100: Larger arrays
    [6, -3, -10, 0, 2],
    [-1, -3, -10, 0, 60],
    [-2, -3, 0, -2, -40],
    [1, -2, 3, -4, 5, 0, -1, -2, -3],
    [2, 3, -1, 4, -2, 0, 5, -2, 3],
    [10, -20, 30, -1, 2, 0, 5],
    [-1, 0, -2, 0, -3, 0, 4, 5],
    [2, 4, 6, -1, 2, 3, 0, 10, 2],
    [-3, 2, -1, 4, -2, 1, -3, 2, -1],
    [1, 2, -3, 4, -5, 6, -7, 8, -9, 10],
  ];

  return arrays.map((arr) => {
    const input = `${arr.length}\n${arr.join(" ")}`;
    const expectedOutput = solveMaxProduct(arr);
    return {
      input,
      expectedOutput,
      isPublic: true,
      weight: 1.0,
    };
  });
}

// ============================================================================
// 4. GENERATE 100 TEST CASES FOR COUNTING BITS
// ============================================================================

function generateCountBitsCases(): RawTestCase[] {
  const nValues: number[] = [
    // 0 to 10 (11 cases)
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,

    // Powers of 2 (10 cases)
    16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192,

    // Powers of 2 minus 1 (10 cases)
    15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191,

    // Powers of 2 plus 1 (10 cases)
    17, 33, 65, 129, 257, 513, 1025, 2049, 4097, 8193,

    // Multiples and round numbers (20 cases)
    20, 25, 50, 75, 100, 125, 150, 175, 200, 250,
    300, 350, 400, 450, 500, 600, 700, 800, 900, 1000,

    // Prime numbers (25 cases)
    11, 13, 19, 23, 29, 37, 41, 43, 47, 53,
    59, 61, 67, 71, 73, 79, 83, 89, 97, 101,
    103, 107, 109, 113, 131,

    // Higher scale numbers (14 cases)
    1234, 1500, 1789, 2000, 2345, 2500, 3000, 3333, 3500, 4000,
    4321, 4500, 4999, 5000,
  ];

  return nValues.map((n) => {
    const input = `${n}`;
    const expectedOutput = solveCountBits(n);
    return {
      input,
      expectedOutput,
      isPublic: true,
      weight: 1.0,
    };
  });
}

// ============================================================================
// 5. GENERATE 100 TEST CASES FOR GRID UNIQUE PATHS
// ============================================================================

function generateUniquePathsCases(): RawTestCase[] {
  const gridPairs: [number, number][] = [
    // 1x1 base case (1 case)
    [1, 1],

    // 1xN boundary cases (11 cases)
    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 15], [1, 20],

    // Mx1 boundary cases (11 cases)
    [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [15, 1], [20, 1],

    // Small and medium square grids (12 cases)
    [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [12, 12], [15, 15], [20, 20],

    // Standard rectangular grids (20 cases)
    [3, 7], [7, 3], [3, 2], [2, 3], [4, 5], [5, 4], [2, 5], [5, 2], [2, 10], [10, 2],
    [3, 5], [5, 3], [3, 10], [10, 3], [4, 8], [8, 4], [5, 6], [6, 5], [5, 10], [10, 5],

    // Additional symmetric pairs covering diverse grid dimensions (45 cases)
    [2, 4], [4, 2], [2, 6], [6, 2], [2, 8], [8, 2], [2, 12], [12, 2], [2, 15], [15, 2],
    [3, 4], [4, 3], [3, 6], [6, 3], [3, 8], [8, 3], [3, 9], [9, 3], [3, 12], [12, 3],
    [4, 6], [6, 4], [4, 7], [7, 4], [4, 9], [9, 4], [4, 10], [10, 4], [5, 7], [7, 5],
    [5, 8], [8, 5], [5, 9], [9, 5], [6, 7], [7, 6], [6, 8], [8, 6], [6, 9], [9, 6],
    [7, 8], [8, 7], [7, 9], [9, 7], [8, 9]
  ];

  return gridPairs.map(([m, n]) => {
    const input = `${m} ${n}`;
    const expectedOutput = solveUniquePaths(m, n);
    return {
      input,
      expectedOutput,
      isPublic: true,
      weight: 1.0,
    };
  });
}

// ============================================================================
// 6. MAIN SEED RUNNER
// ============================================================================

async function main() {
  console.log("============================================================================");
  console.log("🚀 Seeding Assessment B2 (Maximum Product Subarray, Counting Bits, Grid Unique Path)");
  console.log("============================================================================");

  // Check if B2 exists
  const existing = await prisma.assessment.findUnique({
    where: { code: "B2" },
    include: { attempts: true },
  });

  if (existing) {
    if (existing.attempts.length > 0) {
      console.log(`⚠️ Assessment 'B2' already has ${existing.attempts.length} active student attempts.`);
      console.log("Refusing to delete to protect student exam submissions.");
      return;
    }
    console.log("⚠️ Assessment 'B2' already exists with 0 attempts. Purging and recreating fresh...");
    await prisma.assessment.delete({ where: { code: "B2" } });
  }

  // 1. Create Assessment B2
  const assessment = await prisma.assessment.create({
    data: {
      title: "B2",
      code: "B2",
      description: "Comprehensive 1-Hour Algorithmic Assessment: Maximum Product Subarray in an Array, Counting Bits, and Grid Unique Paths with 100 verified automated test cases per problem.",
      durationMinutes: 60,
      startTime: new Date(),
      endTime: null,
      shuffleQuestions: false,
      requireSeb: true,
      sebQuitPassword: "exit123",
      isReviewUnlocked: false,
    },
  });

  console.log(`✅ Assessment created: ID=${assessment.id}, Code=${assessment.code}`);

  // 2. Create Section
  const section = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Core Algorithmic Problems",
      description: "Solve algorithmic programming challenges in Java. 100 automated test cases evaluate correctness, edge cases, and performance.",
      order: 0,
    },
  });

  // 3. Question 1: Maximum Product Subarray in an Array
  const q1Cases = generateMaxProductCases();
  console.log(`Generating Q1 (Maximum Product Subarray) with ${q1Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Maximum Product Subarray in an Array",
      description: `Problem Statement:
Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return that product.

A subarray is a contiguous non-empty sequence of elements within an array.

Input Format:
The first line contains an integer n, denoting the number of elements in the array.
The second line contains n space-separated integers, representing the elements of the array.

Output Format:
Print a single integer representing the maximum product of a contiguous subarray.

Constraints:
1 <= n <= 20000
-10 <= nums[i] <= 10
The product of any prefix or suffix of nums is guaranteed to fit in a 64-bit integer.

Examples:

Example 1:
Input:
4
2 3 -2 4
Output:
6
Explanation: The contiguous subarray [2, 3] has the largest product 6.

Example 2:
Input:
3
-2 0 -1
Output:
0
Explanation: The result cannot be 2, because [-2, -1] is not a contiguous subarray.

Example 3:
Input:
1
-2
Output:
-2
Explanation: The only subarray is [-2], which has product -2.

Example 4:
Input:
3
-2 3 -4
Output:
24
Explanation: The contiguous subarray [-2, 3, -4] has product (-2) x 3 x (-4) = 24.
`,
      marks: 35.0,
      order: 0,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = scanner.nextInt();
        }
        
        System.out.println(maxProduct(nums));
    }

    public static long maxProduct(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
      }),
      starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = scanner.nextInt();
        }
        
        System.out.println(maxProduct(nums));
    }

    public static long maxProduct(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
      testCases: {
        create: q1Cases.map((tc, idx) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isPublic: tc.isPublic,
          weight: tc.weight,
          order: idx,
        })),
      },
    },
  });

  // 4. Question 2: Counting Bits
  const q2Cases = generateCountBitsCases();
  console.log(`Generating Q2 (Counting Bits) with ${q2Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Counting Bits",
      description: `Problem Statement:
Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.

Input Format:
A single line containing the non-negative integer n.

Output Format:
Print n + 1 space-separated integers, where the i-th integer represents the number of 1's in the binary representation of i (from 0 to n).

Constraints:
0 <= n <= 100000

Examples:

Example 1:
Input:
2
Output:
0 1 1
Explanation:
0 --> 0 (0 ones)
1 --> 1 (1 one)
2 --> 10 (1 one)

Example 2:
Input:
5
Output:
0 1 1 2 1 2
Explanation:
0 --> 0 (0 ones)
1 --> 1 (1 one)
2 --> 10 (1 one)
3 --> 11 (2 ones)
4 --> 100 (1 one)
5 --> 101 (2 ones)
`,
      marks: 30.0,
      order: 1,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        
        int[] result = countBits(n);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb.toString());
    }

    public static int[] countBits(int n) {
        // Write your solution here
        return new int[n + 1];
    }
}`,
      }),
      starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        
        int[] result = countBits(n);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb.toString());
    }

    public static int[] countBits(int n) {
        // Write your solution here
        return new int[n + 1];
    }
}`,
      testCases: {
        create: q2Cases.map((tc, idx) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isPublic: tc.isPublic,
          weight: tc.weight,
          order: idx,
        })),
      },
    },
  });

  // 5. Question 3: Grid Unique Path
  const q3Cases = generateUniquePathsCases();
  console.log(`Generating Q3 (Grid Unique Path) with ${q3Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Grid Unique Path",
      description: `Problem Statement:
There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot attempts to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.

Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.

Input Format:
A single line containing two space-separated integers, m and n, representing the number of rows and columns of the grid respectively.

Output Format:
Print a single integer representing the total number of unique paths from the top-left corner to the bottom-right corner.

Constraints:
1 <= m, n <= 20
The answer will fit in a 64-bit integer.

Examples:

Example 1:
Input:
3 7
Output:
28

Example 2:
Input:
3 2
Output:
3
Explanation: From the top-left corner, there are a total of 3 ways to reach the bottom-right corner:
1. Right -> Down -> Down
2. Down -> Down -> Right
3. Down -> Right -> Down

Example 3:
Input:
1 1
Output:
1
Explanation: The robot is already at the destination grid[0][0].
`,
      marks: 35.0,
      order: 2,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int m = scanner.nextInt();
        int n = scanner.nextInt();
        
        System.out.println(uniquePaths(m, n));
    }

    public static long uniquePaths(int m, int n) {
        // Write your solution here
        return 0;
    }
}`,
      }),
      starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int m = scanner.nextInt();
        int n = scanner.nextInt();
        
        System.out.println(uniquePaths(m, n));
    }

    public static long uniquePaths(int m, int n) {
        // Write your solution here
        return 0;
    }
}`,
      testCases: {
        create: q3Cases.map((tc, idx) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isPublic: tc.isPublic,
          weight: tc.weight,
          order: idx,
        })),
      },
    },
  });

  console.log("============================================================================");
  console.log("🎉 Assessment B2 Seeding Completed Successfully!");
  console.log("• Assessment Code: B2");
  console.log("• Require SEB: true (Quit Password: exit123)");
  console.log("• Duration: 60 minutes (1 hour)");
  console.log("• Total Questions: 3");
  console.log(`• Total Test Cases: ${q1Cases.length + q2Cases.length + q3Cases.length} (100 per problem)`);
  console.log("• Total Marks: 100 (35 + 30 + 35)");
  console.log("============================================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
