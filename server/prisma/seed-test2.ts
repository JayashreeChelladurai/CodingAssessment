import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("================================================================================");
  console.log("   🚀 GENERATING ASSESSMENT 'Test2' (5 Java Questions, 10 Testcases Each)       ");
  console.log("================================================================================");

  const existing = await prisma.assessment.findUnique({
    where: { code: "TEST2" },
  });

  if (existing) {
    console.log("⚠️ Assessment with code 'TEST2' already exists. Re-creating fresh...");
    await prisma.assessment.delete({ where: { code: "TEST2" } });
  }

  // Set start time to today at 11:00 AM
  const today11am = new Date();
  today11am.setHours(11, 0, 0, 0);

  // 1. Create Assessment Test2
  const assessment = await prisma.assessment.create({
    data: {
      title: "Test2",
      code: "TEST2",
      description: "Java Programming Assessment featuring Binary Search, Decimal to Binary, 2 Sum with Collections, Anagram Check, and Merge Sorted Arrays.",
      durationMinutes: 63, // 1 hour 3 minutes
      startTime: today11am,
      endTime: null,
      shuffleQuestions: false,
      requireSeb: true, // Enable SEB
      sebQuitPassword: "exit123",
      isReviewUnlocked: false,
    },
  });

  // 2. Create Section
  const section = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section A: Java Programming Challenges",
      description: "Solve the following 5 algorithmic problems in Java. Complete the logic inside the provided function.",
      order: 0,
    },
  });

  // ============================================================================
  // QUESTION 1: Binary Search
  // ============================================================================
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Binary Search",
      description: `Problem Statement:
Given a sorted array of integers in non-decreasing order and a target value, write a function to search for the target in the array. If the target exists, return its 0-based index. If the target does not exist, return -1.

Input Format:
Line 1: An integer n, the number of elements in the array.
Line 2: n space-separated integers representing the sorted array.
Line 3: An integer target, the value to search for.

Output Format:
Print a single integer: the 0-based index of target if found, or -1 if not found.

Constraints:
1 <= n <= 100000
-1000000000 <= arr[i], target <= 1000000000
Array elements are sorted in ascending order.

Sample Input 1:
6
-1 0 3 5 9 12
9

Sample Output 1:
4

Explanation:
The element 9 exists in the array at index 4 (0-based: arr[0]=-1, arr[1]=0, arr[2]=3, arr[3]=5, arr[4]=9, arr[5]=12).`,
      marks: 20,
      order: 0,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    // Write your binary search logic inside this function
    public static int binarySearch(int[] arr, int target) {
        // TODO: Implement binary search logic here
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
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "6\n-1 0 3 5 9 12\n9", expectedOutput: "4", isPublic: true, weight: 1.0, order: 0 },
          { input: "6\n-1 0 3 5 9 12\n2", expectedOutput: "-1", isPublic: true, weight: 1.0, order: 1 },
          { input: "1\n5\n5", expectedOutput: "0", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "1\n5\n3", expectedOutput: "-1", isPublic: false, weight: 1.0, order: 3 },
          { input: "2\n2 5\n2", expectedOutput: "0", isPublic: false, weight: 1.0, order: 4 },
          { input: "2\n2 5\n5", expectedOutput: "1", isPublic: false, weight: 1.0, order: 5 },
          { input: "5\n10 20 30 40 50\n10", expectedOutput: "0", isPublic: false, weight: 1.0, order: 6 },
          { input: "5\n10 20 30 40 50\n50", expectedOutput: "4", isPublic: false, weight: 1.0, order: 7 },
          { input: "7\n-50 -30 -10 0 15 45 100\n-30", expectedOutput: "1", isPublic: false, weight: 1.0, order: 8 },
          { input: "8\n1 3 5 7 9 11 13 15\n100", expectedOutput: "-1", isPublic: false, weight: 1.0, order: 9 },
        ],
      },
    },
  });

  // ============================================================================
  // QUESTION 2: Decimal to Binary
  // ============================================================================
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Decimal to Binary",
      description: `Problem Statement:
Given a non-negative decimal integer n, write a function to convert it into its binary representation and return it as a string.

Input Format:
Line 1: A non-negative integer n.

Output Format:
Print a string representing the binary equivalent of n without leading zeros (except for the number 0 which should output 0).

Constraints:
0 <= n <= 1000000000

Sample Input 1:
13

Sample Output 1:
1101

Explanation:
13 in decimal is equal to 8 + 4 + 0 + 1 = 2^3 + 2^2 + 0 + 2^0, which corresponds to binary 1101.`,
      marks: 20,
      order: 1,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    // Write your decimal to binary conversion logic inside this function
    public static String decimalToBinary(int n) {
        // TODO: Implement decimal to binary conversion logic here
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        String result = decimalToBinary(n);
        System.out.println(result);
    }
}`,
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "13", expectedOutput: "1101", isPublic: true, weight: 1.0, order: 0 },
          { input: "0", expectedOutput: "0", isPublic: true, weight: 1.0, order: 1 },
          { input: "1", expectedOutput: "1", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "2", expectedOutput: "10", isPublic: false, weight: 1.0, order: 3 },
          { input: "7", expectedOutput: "111", isPublic: false, weight: 1.0, order: 4 },
          { input: "16", expectedOutput: "10000", isPublic: false, weight: 1.0, order: 5 },
          { input: "255", expectedOutput: "11111111", isPublic: false, weight: 1.0, order: 6 },
          { input: "1024", expectedOutput: "10000000000", isPublic: false, weight: 1.0, order: 7 },
          { input: "1000000", expectedOutput: "11110100001001000000", isPublic: false, weight: 1.0, order: 8 },
          { input: "1000000000", expectedOutput: "111011100110101100101000000000", isPublic: false, weight: 1.0, order: 9 },
        ],
      },
    },
  });

  // ============================================================================
  // QUESTION 3: 2 Sum with Collections
  // ============================================================================
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "2 Sum with Collections",
      description: `Problem Statement:
Given an array of integers and a target sum, use Java Collections (such as HashMap) to find the 0-based indices of two numbers that add up to the target.

If a valid pair exists, return their 0-based indices in ascending order (index1 index2, where index1 < index2). If no such pair exists, return -1 -1.
You may assume that each input has at most one valid pair, and you cannot use the same element twice.

Input Format:
Line 1: An integer n, the number of elements in the array.
Line 2: n space-separated integers representing the array.
Line 3: An integer target, the target sum.

Output Format:
Print two space-separated integers representing the 0-based indices in ascending order (index1 index2), or -1 -1 if no pair exists.

Constraints:
2 <= n <= 100000
-1000000000 <= arr[i], target <= 1000000000

Sample Input 1:
4
2 7 11 15
9

Sample Output 1:
0 1

Explanation:
arr[0] + arr[1] = 2 + 7 = 9. The 0-based indices are 0 and 1.`,
      marks: 20,
      order: 2,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    // Write your two sum logic using Java Collections (e.g. HashMap) inside this function
    public static int[] twoSum(int[] nums, int target) {
        // TODO: Implement two sum using HashMap/Collections here
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
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isPublic: true, weight: 1.0, order: 0 },
          { input: "3\n3 2 4\n6", expectedOutput: "1 2", isPublic: true, weight: 1.0, order: 1 },
          { input: "2\n3 3\n6", expectedOutput: "0 1", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "4\n1 2 3 4\n10", expectedOutput: "-1 -1", isPublic: false, weight: 1.0, order: 3 },
          { input: "5\n-3 4 3 90 2\n0", expectedOutput: "0 2", isPublic: false, weight: 1.0, order: 4 },
          { input: "6\n0 4 3 0 2 8\n0", expectedOutput: "0 3", isPublic: false, weight: 1.0, order: 5 },
          { input: "4\n-10 -15 -30 -40\n-50", expectedOutput: "0 3", isPublic: false, weight: 1.0, order: 6 },
          { input: "6\n10 50 20 40 30 60\n100", expectedOutput: "3 5", isPublic: false, weight: 1.0, order: 7 },
          { input: "5\n100000000 -50000000 50000000 200000000 300000000\n0", expectedOutput: "1 2", isPublic: false, weight: 1.0, order: 8 },
          { input: "7\n1 9 4 8 2 5 7\n17", expectedOutput: "1 3", isPublic: false, weight: 1.0, order: 9 },
        ],
      },
    },
  });

  // ============================================================================
  // QUESTION 4: Check if 2 Strings are Anagram
  // ============================================================================
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Check if 2 Strings are Anagram",
      description: `Problem Statement:
Given two strings s1 and s2, write a function to check whether s2 is an anagram of s1. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Comparison should be case-sensitive and consider all characters including spaces and symbols.

Input Format:
Line 1: String s1
Line 2: String s2

Output Format:
Print true if s2 is an anagram of s1, or false otherwise.

Constraints:
1 <= length of s1, s2 <= 50000
Strings can contain any printable ASCII characters.

Sample Input 1:
anagram
nagaram

Sample Output 1:
true

Explanation:
Both strings contain the characters: 'a' 3 times, 'g' 1 time, 'm' 1 time, 'n' 1 time, and 'r' 1 time.`,
      marks: 20,
      order: 3,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    // Write your anagram checking logic inside this function
    public static boolean isAnagram(String s1, String s2) {
        // TODO: Implement anagram checking logic here
        return false;
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
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "anagram\nnagaram", expectedOutput: "true", isPublic: true, weight: 1.0, order: 0 },
          { input: "rat\ncar", expectedOutput: "false", isPublic: true, weight: 1.0, order: 1 },
          { input: "a\na", expectedOutput: "true", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "ab\na", expectedOutput: "false", isPublic: false, weight: 1.0, order: 3 },
          { input: "Listen\nSilent", expectedOutput: "false", isPublic: false, weight: 1.0, order: 4 },
          { input: "listen\nsilent", expectedOutput: "true", isPublic: false, weight: 1.0, order: 5 },
          { input: "hello world\nworld hello", expectedOutput: "true", isPublic: false, weight: 1.0, order: 6 },
          { input: "aabbcc\nabcabc", expectedOutput: "true", isPublic: false, weight: 1.0, order: 7 },
          { input: "aabbcc\naabbcd", expectedOutput: "false", isPublic: false, weight: 1.0, order: 8 },
          { input: "1234567890\n0987654321", expectedOutput: "true", isPublic: false, weight: 1.0, order: 9 },
        ],
      },
    },
  });

  // ============================================================================
  // QUESTION 5: Merge 2 Sorted Arrays
  // ============================================================================
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Merge 2 Sorted Arrays",
      description: `Problem Statement:
Given two sorted integer arrays arr1 of size n and arr2 of size m in non-decreasing order, write a function to merge them into a single sorted array in non-decreasing order.

Input Format:
Line 1: An integer n, the number of elements in the first array.
Line 2: n space-separated integers representing arr1 (or blank line if n is 0).
Line 3: An integer m, the number of elements in the second array.
Line 4: m space-separated integers representing arr2 (or blank line if m is 0).

Output Format:
Print all elements of the merged sorted array on a single line separated by spaces. If both arrays are empty, print nothing.

Constraints:
0 <= n, m <= 50000
1 <= n + m <= 100000
-1000000000 <= arr1[i], arr2[j] <= 1000000000
arr1 and arr2 are sorted in non-decreasing order.

Sample Input 1:
3
1 3 5
3
2 4 6

Sample Output 1:
1 2 3 4 5 6

Explanation:
Merging sorted arrays [1, 3, 5] and [2, 4, 6] produces [1, 2, 3, 4, 5, 6].`,
      marks: 20,
      order: 4,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    // Write your logic to merge two sorted arrays inside this function
    public static int[] mergeSortedArrays(int[] arr1, int[] arr2) {
        // TODO: Implement merge sorted arrays logic here
        return new int[0];
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
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "3\n1 3 5\n3\n2 4 6", expectedOutput: "1 2 3 4 5 6", isPublic: true, weight: 1.0, order: 0 },
          { input: "3\n1 2 3\n3\n2 5 6", expectedOutput: "1 2 2 3 5 6", isPublic: true, weight: 1.0, order: 1 },
          { input: "1\n1\n1\n2", expectedOutput: "1 2", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "1\n2\n1\n1", expectedOutput: "1 2", isPublic: false, weight: 1.0, order: 3 },
          { input: "4\n1 1 1 1\n3\n1 1 1", expectedOutput: "1 1 1 1 1 1 1", isPublic: false, weight: 1.0, order: 4 },
          { input: "3\n-5 -3 -1\n3\n-6 -4 -2", expectedOutput: "-6 -5 -4 -3 -2 -1", isPublic: false, weight: 1.0, order: 5 },
          { input: "4\n10 20 30 40\n4\n1 2 3 4", expectedOutput: "1 2 3 4 10 20 30 40", isPublic: false, weight: 1.0, order: 6 },
          { input: "4\n1 2 3 4\n4\n10 20 30 40", expectedOutput: "1 2 3 4 10 20 30 40", isPublic: false, weight: 1.0, order: 7 },
          { input: "5\n-10 0 10 20 30\n5\n-20 -5 0 5 25", expectedOutput: "-20 -10 -5 0 0 5 10 20 25 30", isPublic: false, weight: 1.0, order: 8 },
          { input: "6\n2 4 6 8 10 12\n4\n1 3 5 7", expectedOutput: "1 2 3 4 5 6 7 8 10 12", isPublic: false, weight: 1.0, order: 9 },
        ],
      },
    },
  });

  const fullAssessment = await prisma.assessment.findUnique({
    where: { id: assessment.id },
    include: {
      sections: {
        include: {
          questions: {
            include: {
              testCases: true,
            },
          },
        },
      },
    },
  });

  console.log(`✅ Assessment '${fullAssessment?.title}' created successfully!`);
  console.log(`   - Code: ${fullAssessment?.code}`);
  console.log(`   - Duration: ${fullAssessment?.durationMinutes} minutes`);
  console.log(`   - Start Time: ${fullAssessment?.startTime}`);
  console.log(`   - Require SEB: ${fullAssessment?.requireSeb}`);
  console.log(`   - Total Questions: ${fullAssessment?.sections[0].questions.length}`);
  for (const q of fullAssessment?.sections[0].questions || []) {
    const openCount = q.testCases.filter((tc) => tc.isPublic).length;
    const closedCount = q.testCases.filter((tc) => !tc.isPublic).length;
    console.log(`     * ${q.title} (${q.marks} Marks, Lang: ${q.allowedLanguages}): ${openCount} Open + ${closedCount} Closed = ${q.testCases.length} Testcases`);
  }
  console.log("================================================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
