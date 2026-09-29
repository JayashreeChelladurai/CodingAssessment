import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// 1. CANONICAL REFERENCE ALGORITHMS
// ============================================================================

/**
 * Problem 1: Contains Duplicate
 * Given an array of integers, return true if any value appears at least twice.
 */
function solveContainsDuplicate(nums: number[]): string {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(x)) return "true";
    seen.add(x);
  }
  return "false";
}

/**
 * Problem 2: Reverse Bits
 * Reverse bits of a 32-bit unsigned integer and return decimal value.
 */
function solveReverseBits(nStr: string): string {
  const n = BigInt(nStr);
  let res = 0n;
  for (let i = 0n; i < 32n; i++) {
    res = (res << 1n) | ((n >> i) & 1n);
  }
  return res.toString();
}

/**
 * Problem 3: Combination Sum
 * Find all unique combinations of candidates that sum to target.
 * Output: combinations sorted lexicographically, each sorted ascending, or NONE.
 */
function solveCombinationSum(candidates: number[], target: number): string {
  const sorted = [...candidates].sort((a, b) => a - b);
  const result: number[][] = [];

  function backtrack(remain: number, start: number, current: number[]) {
    if (remain === 0) {
      result.push([...current]);
      return;
    }
    if (remain < 0) return;
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remain) break;
      current.push(sorted[i]);
      backtrack(remain - sorted[i], i, current);
      current.pop();
    }
  }

  backtrack(target, 0, []);
  if (result.length === 0) return "NONE";
  return result.map((c) => c.join(" ")).join("\n");
}

// ============================================================================
// 2. TEST CASE STRUCTURE
// ============================================================================

interface RawTestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  weight: number;
}

// ============================================================================
// 3. GENERATE 100 TEST CASES FOR CONTAINS DUPLICATE
// ============================================================================

function generateContainsDuplicateCases(): RawTestCase[] {
  const testArrays: number[][] = [
    // 1-10: Sample & Public cases
    [1, 2, 3, 1],
    [1, 2, 3, 4],
    [1, 1, 1, 3, 3, 4, 3, 2, 4, 2],
    [1, 2],
    [1, 1],
    [2, 14, 18, 22, 22],
    [3, 3],
    [1, 5, -2, -4, 0],
    [-1, -1],
    [0, 0],

    // 11-20: Boundary, single and empty elements
    [],
    [0],
    [1],
    [-1],
    [1000000000],
    [-1000000000],
    [42],
    [-999999999],
    [7],
    [123456789],

    // 21-40: Two and three elements, zeros, extremes
    [1000000000, 1000000000],
    [1000000000, -1000000000],
    [-1000000000, -1000000000],
    [0, 1000000000],
    [0, -1000000000],
    [0, 1, 0],
    [-1, 0, 1],
    [-5, -5, -5],
    [10, 20, 30, 40, 50],
    [10, 20, 30, 40, 10],
    [50, 40, 30, 20, 10],
    [50, 40, 30, 20, 50],
    [-10, -20, -30, -40, -50],
    [-10, -20, -30, -40, -10],
    [1, -1, 2, -2, 3, -3],
    [1, -1, 2, -2, 1, -3],
    [0, 1, 2, 3, 4, 5, 0],
    [9, 8, 7, 6, 5, 4, 3, 2, 1],
    [9, 8, 7, 6, 5, 4, 3, 2, 9],
    [100, 200, 300, 400, 500, 600, 700, 800, 900, 100],

    // 41-60: Systematic patterns & duplicates
    [1, 1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5, 5],
    [1, 2, 3, 3, 4, 5],
    [7, 7, 7, 7, 7],
    [2, 4, 6, 8, 10, 12, 14, 16],
    [2, 4, 6, 8, 10, 12, 14, 2],
    [-100, 0, 100],
    [-100, 0, -100],
    [5, -5, 5],
    [123, 456, 789, 123],
    [99, 98, 97, 96, 95],
    [99, 98, 97, 96, 99],
    [1, 3, 5, 7, 9, 11, 13, 15],
    [1, 3, 5, 7, 9, 11, 13, 1],
    [-1, -2, -3, -4, -5, -6],
    [-1, -2, -3, -4, -5, -1],
    [8, 6, 4, 2, 0, -2, -4],
    [8, 6, 4, 2, 0, -2, 8],
    [314159, 271828, 141421, 314159],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],

    // 61-80: Varied lengths and duplicate positions
    [5, 5, 1, 2, 3, 4],
    [1, 2, 5, 5, 3, 4],
    [1, 2, 3, 4, 5, 5],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 1],
    [10, 20, 10, 20, 10, 20],
    [100, 99, 98, 97, 96, 95, 94, 93, 92, 91],
    [100, 99, 98, 97, 96, 95, 94, 93, 92, 100],
    [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50],
    [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, -50],
    [11, 22, 33, 44, 55, 66, 77, 88, 99],
    [11, 22, 33, 44, 55, 66, 77, 88, 11],
    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
    [2, 3, 5, 7, 11, 13, 17, 19, 23, 2],
    [1000, 2000, 3000, 4000, 5000],
    [1000, 2000, 3000, 4000, 1000],
    [-7, -14, -21, -28, -35],
    [-7, -14, -21, -28, -7],
    [1, 2, 3, 4, 1, 2, 3, 4],
    [999, 888, 777, 666, 555, 444, 333, 222, 111],
  ];

  // 81-100: Larger generated sequences testing scalability and boundaries
  while (testArrays.length < 100) {
    const idx = testArrays.length;
    const len = (idx - 80) * 100; // lengths 100 to 2000
    const hasDuplicate = idx % 2 === 1;

    const arr: number[] = [];
    for (let k = 0; k < len; k++) {
      arr.push(k * 3 + 1);
    }
    if (hasDuplicate) {
      arr[len - 1] = arr[0]; // create duplicate between first and last
    }
    testArrays.push(arr);
  }

  return testArrays.map((arr) => {
    let input: string;
    if (arr.length === 0) {
      input = "0\n";
    } else {
      input = `${arr.length}\n${arr.join(" ")}`;
    }
    const expectedOutput = solveContainsDuplicate(arr);
    return {
      input,
      expectedOutput,
      isPublic: true,
      weight: 1.0,
    };
  });
}

// ============================================================================
// 4. GENERATE 100 TEST CASES FOR REVERSE BITS
// ============================================================================

function generateReverseBitsCases(): RawTestCase[] {
  const numbers: string[] = [
    // 1-10: Samples & foundational cases
    "43261596",
    "1",
    "4294967293",
    "0",
    "4294967295",
    "2147483648",
    "2",
    "1073741824",
    "3",
    "2863311530", // 0xAAAAAAAA

    // 11-42: Single bit set at each bit position 0 to 31
    ...Array.from({ length: 32 }, (_, i) => (1n << BigInt(i)).toString()),

    // 43-55: Palindromic, alternating, and block bit patterns
    "1431655765", // 0x55555555
    "252645135",  // 0x0F0F0F0F
    "4042322160", // 0xF0F0F0F0
    "65535",      // 0x0000FFFF
    "4294901760", // 0xFFFF0000
    "16711935",   // 0x00FF00FF
    "4278255360", // 0xFF00FF00
    "2147483649", // bit 0 and bit 31 set
    "3221225472", // bit 30 and 31 set
    "15",         // lowest 4 bits set
    "240",        // bits 4-7 set
    "3840",       // bits 8-11 set
    "61440",      // bits 12-15 set

    // 56-70: Powers of 2 minus 1 (all lower k bits set)
    ...Array.from({ length: 15 }, (_, i) => ((1n << BigInt(i + 16)) - 1n).toString()),
  ];

  // 71-100: Deterministic pseudo-random values covering various bit distributions
  let seed = 123456789n;
  while (numbers.length < 100) {
    seed = (seed * 1103515245n + 12345n) % 4294967296n;
    numbers.push(seed.toString());
  }

  return numbers.map((nStr) => ({
    input: nStr,
    expectedOutput: solveReverseBits(nStr),
    isPublic: true,
    weight: 1.0,
  }));
}

// ============================================================================
// 5. GENERATE 100 TEST CASES FOR COMBINATION SUM
// ============================================================================

interface CombCaseInput {
  candidates: number[];
  target: number;
}

function generateCombinationSumCases(): RawTestCase[] {
  const cases: CombCaseInput[] = [
    // 1-10: Samples and basic edge cases
    { candidates: [2, 3, 6, 7], target: 7 },
    { candidates: [2, 3, 5], target: 8 },
    { candidates: [2], target: 1 },
    { candidates: [1], target: 1 },
    { candidates: [1], target: 2 },
    { candidates: [1], target: 5 },
    { candidates: [2], target: 4 },
    { candidates: [3], target: 9 },
    { candidates: [4], target: 7 },
    { candidates: [5, 10], target: 15 },

    // 11-25: Small targets, exact match, impossible targets
    { candidates: [7], target: 7 },
    { candidates: [8], target: 5 },
    { candidates: [3, 5], target: 7 },
    { candidates: [3, 5], target: 8 },
    { candidates: [3, 5], target: 11 },
    { candidates: [2, 4], target: 7 }, // all even, odd target -> NONE
    { candidates: [2, 4, 6], target: 9 }, // all even, odd target -> NONE
    { candidates: [2, 4], target: 6 },
    { candidates: [2, 4], target: 8 },
    { candidates: [2, 3], target: 5 },
    { candidates: [2, 3], target: 6 },
    { candidates: [2, 3], target: 7 },
    { candidates: [3, 7], target: 10 },
    { candidates: [3, 7], target: 14 },
    { candidates: [4, 5], target: 13 },

    // 26-45: Multi-candidate varied sets
    { candidates: [2, 3, 7], target: 12 },
    { candidates: [2, 5, 8], target: 10 },
    { candidates: [3, 4, 5], target: 12 },
    { candidates: [2, 3, 4], target: 10 },
    { candidates: [5, 7, 9], target: 19 },
    { candidates: [2, 3, 6, 7], target: 10 },
    { candidates: [2, 3, 5, 7], target: 12 },
    { candidates: [3, 5, 7, 9], target: 15 },
    { candidates: [2, 4, 8], target: 16 },
    { candidates: [3, 6, 9], target: 18 },
    { candidates: [4, 6, 9], target: 15 },
    { candidates: [5, 8, 11], target: 21 },
    { candidates: [2, 5], target: 14 },
    { candidates: [3, 8], target: 17 },
    { candidates: [4, 7], target: 19 },
    { candidates: [2, 3, 5], target: 11 },
    { candidates: [2, 3, 5], target: 13 },
    { candidates: [3, 5, 8], target: 16 },
    { candidates: [2, 7, 10], target: 14 },
    { candidates: [3, 4, 7], target: 14 },

    // 46-65: Unsorted input order, larger targets
    { candidates: [7, 2, 6, 3], target: 7 },
    { candidates: [5, 2, 3], target: 8 },
    { candidates: [8, 3, 5], target: 11 },
    { candidates: [10, 5, 2], target: 15 },
    { candidates: [9, 7, 5, 3], target: 12 },
    { candidates: [6, 4, 2], target: 12 },
    { candidates: [11, 7, 5, 2], target: 14 },
    { candidates: [13, 8, 5, 3], target: 16 },
    { candidates: [12, 7, 4, 2], target: 15 },
    { candidates: [15, 10, 5], target: 20 },
    { candidates: [8, 6, 4], target: 14 },
    { candidates: [9, 6, 3], target: 15 },
    { candidates: [7, 5, 3, 2], target: 10 },
    { candidates: [8, 5, 3, 2], target: 11 },
    { candidates: [10, 7, 4, 2], target: 13 },
    { candidates: [6, 5, 4, 3], target: 12 },
    { candidates: [7, 6, 5, 2], target: 14 },
    { candidates: [9, 8, 4, 3], target: 15 },
    { candidates: [11, 6, 5, 2], target: 16 },
    { candidates: [10, 8, 6, 4, 2], target: 12 },

    // 66-85: Target cannot be formed or larger single candidate
    { candidates: [6, 7, 8, 9, 10], target: 5 },
    { candidates: [11, 13, 17, 19], target: 10 },
    { candidates: [4, 6, 8, 10], target: 17 }, // all even, odd target
    { candidates: [5, 10, 15, 20], target: 23 }, // multiples of 5, target not multiple of 5
    { candidates: [7, 14, 21], target: 25 },
    { candidates: [9, 18, 27], target: 30 },
    { candidates: [12, 15, 18], target: 20 },
    { candidates: [8, 12, 16], target: 22 },
    { candidates: [10, 20, 30], target: 35 },
    { candidates: [15, 25, 35], target: 40 },
    { candidates: [2, 3, 6, 7], target: 18 },
    { candidates: [2, 3, 5, 7], target: 15 },
    { candidates: [2, 4, 6, 8], target: 14 },
    { candidates: [3, 5, 7, 11], target: 17 },
    { candidates: [4, 5, 6, 7], target: 16 },
    { candidates: [2, 5, 7, 9], target: 18 },
    { candidates: [3, 4, 6, 8], target: 15 },
    { candidates: [2, 3, 4, 5, 6], target: 12 },
    { candidates: [2, 3, 5, 8], target: 17 },
    { candidates: [3, 5, 7, 9, 11], target: 20 },
  ];

  // 86-100: Edge cases and structured combinations
  const additionalCases: CombCaseInput[] = [
    { candidates: [1, 2], target: 6 },
    { candidates: [1, 3], target: 7 },
    { candidates: [1, 2, 3], target: 6 },
    { candidates: [2, 5, 10], target: 20 },
    { candidates: [3, 7, 11], target: 21 },
    { candidates: [4, 7, 11], target: 22 },
    { candidates: [5, 8, 13], target: 26 },
    { candidates: [6, 9, 15], target: 27 },
    { candidates: [2, 4, 7], target: 15 },
    { candidates: [3, 6, 8], target: 17 },
    { candidates: [4, 5, 9], target: 18 },
    { candidates: [2, 3, 8], target: 14 },
    { candidates: [3, 5, 12], target: 20 },
    { candidates: [4, 7, 10], target: 21 },
    { candidates: [5, 6, 11], target: 22 },
  ];

  cases.push(...additionalCases);

  return cases.map((c) => {
    const input = `${c.candidates.length}\n${c.candidates.join(" ")}\n${c.target}`;
    const expectedOutput = solveCombinationSum(c.candidates, c.target);
    return {
      input,
      expectedOutput,
      isPublic: true,
      weight: 1.0,
    };
  });
}

// ============================================================================
// 6. MAIN SEEDING ROUTINE
// ============================================================================

async function main() {
  console.log("============================================================================");
  console.log("🚀 Seeding Assessment B3 (Contains Duplicate, Reverse Bits, Combination Sum)");
  console.log("============================================================================");

  // Check if assessment B3 already exists
  const existingB3 = await prisma.assessment.findUnique({
    where: { code: "B3" },
    include: { attempts: true },
  });

  if (existingB3) {
    if (existingB3.attempts.length > 0) {
      console.log(`⚠️ Assessment 'B3' already has ${existingB3.attempts.length} student attempts.`);
      console.log("Refusing to delete to protect student exam submissions.");
      return;
    }
    console.log("⚠️ Assessment 'B3' already exists with 0 attempts. Purging and recreating fresh...");
    await prisma.assessment.delete({ where: { code: "B3" } });
  }

  // 1. Create Assessment B3
  const assessment = await prisma.assessment.create({
    data: {
      title: "B3",
      code: "B3",
      description: "Comprehensive 1-Hour Algorithmic Assessment: Contains Duplicate, Reverse Bits, and Combination Sum with 100 verified automated test cases per problem.",
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

  // 3. Question 1: Contains Duplicate
  const q1Cases = generateContainsDuplicateCases();
  console.log(`Generating Q1 (Contains Duplicate) with ${q1Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Contains Duplicate",
      description: `Problem Statement:
Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Input Format:
The first line contains an integer n, denoting the number of elements in the array.
The second line contains n space-separated integers representing the elements of the array.
If n is 0, the second line is empty and the output should be false.

Output Format:
Print true if the array contains at least one duplicate value, otherwise print false.

Constraints:
0 <= n <= 100000
-1000000000 <= nums[i] <= 1000000000

Examples:

Example 1:
Input:
4
1 2 3 1
Output:
true
Explanation: The element 1 occurs at indices 0 and 3.

Example 2:
Input:
4
1 2 3 4
Output:
false
Explanation: All elements are distinct.

Example 3:
Input:
10
1 1 1 3 3 4 3 2 4 2
Output:
true
Explanation: Multiple elements appear more than once.
`,
      marks: 30.0,
      order: 0,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.Scanner;
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
        // Write your solution here
        return false;
    }
}`,
      }),
      starterCode: `import java.util.Scanner;
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
        // Write your solution here
        return false;
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
  console.log(`✅ Question 1 seeded: 30 Marks, ${q1Cases.length} Test Cases`);

  // 4. Question 2: Reverse Bits
  const q2Cases = generateReverseBitsCases();
  console.log(`Generating Q2 (Reverse Bits) with ${q2Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Reverse Bits",
      description: `Problem Statement:
Reverse the bits of a given 32-bit unsigned integer.

Input Format:
A single line containing an unsigned 32-bit integer n represented in decimal format.

Output Format:
Print the resulting decimal value after reversing the 32 bits of n.

Constraints:
0 <= n <= 4294967295

Examples:

Example 1:
Input:
43261596
Output:
964176192
Explanation: The 32-bit binary representation of 43261596 is 00000010100101000001111010011100. When reversed, it becomes 00111001011110000010100101000000, which evaluates to decimal 964176192.

Example 2:
Input:
1
Output:
2147483648
Explanation: The 32-bit binary representation of 1 is 00000000000000000000000000000001. When reversed, it becomes 10000000000000000000000000000000, which evaluates to decimal 2147483648.

Example 3:
Input:
4294967293
Output:
3221225471
Explanation: The 32-bit binary representation of 4294967293 is 11111111111111111111111111111101. When reversed, it becomes 10111111111111111111111111111111, which evaluates to decimal 3221225471.
`,
      marks: 35.0,
      order: 1,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextLong()) return;
        long n = scanner.nextLong();
        
        System.out.println(reverseBits(n));
    }

    public static long reverseBits(long n) {
        // Write your solution here
        return 0;
    }
}`,
      }),
      starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextLong()) return;
        long n = scanner.nextLong();
        
        System.out.println(reverseBits(n));
    }

    public static long reverseBits(long n) {
        // Write your solution here
        return 0;
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
  console.log(`✅ Question 2 seeded: 35 Marks, ${q2Cases.length} Test Cases`);

  // 5. Question 3: Combination Sum
  const q3Cases = generateCombinationSumCases();
  console.log(`Generating Q3 (Combination Sum) with ${q3Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Combination Sum",
      description: `Problem Statement:
Given an array of distinct integers candidates and a target integer target, find all unique combinations of candidates where the chosen numbers sum to target.

You may choose the same candidate an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

Sorting and Output Requirement:
Sort each combination in non-decreasing order.
Sort the list of all combinations in lexicographical order.
Print each combination on a new line with space-separated numbers.
If no valid combination exists, print NONE.

Input Format:
The first line contains an integer n, the number of candidates.
The second line contains n space-separated distinct integers.
The third line contains an integer target.

Output Format:
Print each combination on a new line with space-separated integers, sorted lexicographically.
If no combination sums to target, print NONE.

Constraints:
1 <= n <= 30
1 <= candidates[i] <= 50
All elements of candidates are distinct.
1 <= target <= 40

Examples:

Example 1:
Input:
4
2 3 6 7
7
Output:
2 2 3
7
Explanation:
2 and 3 can be combined: 2 + 2 + 3 = 7.
7 is a candidate: 7 = 7.
These are the only two combinations.

Example 2:
Input:
3
2 3 5
8
Output:
2 2 2 2
2 3 3
3 5

Example 3:
Input:
1
2
1
Output:
NONE
Explanation: The target is 1, but the smallest candidate is 2, so no combination is possible.
`,
      marks: 35.0,
      order: 2,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

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
        // Write your solution here
        return new ArrayList<>();
    }
}`,
      }),
      starterCode: `import java.util.*;

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
        // Write your solution here
        return new ArrayList<>();
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
  console.log(`✅ Question 3 seeded: 35 Marks, ${q3Cases.length} Test Cases`);

  console.log("\n============================================================================");
  console.log("🎉 Assessment B3 successfully created with 300 testcases (100 per problem)!");
  console.log("============================================================================");
}

main()
  .catch((err) => {
    console.error("❌ Error seeding Assessment B3:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
