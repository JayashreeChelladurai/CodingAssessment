import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to remove any accidental * or # symbols from text
function cleanText(text: string): string {
  return text.replace(/[*#]/g, "");
}

interface TestCaseData {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  weight: number;
}

interface QuestionData {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string;
  marks: number;
  timeLimitSeconds: number;
  memoryLimitMb: number;
  starterCodes: {
    JAVA: string;
    C: string;
    CPP: string;
  };
  testCases: TestCaseData[];
}

export async function seedBlind75() {
  console.log("Starting Blind 75 Question Bank Seed...");

  // 1. Root Coding Folder
  let codingRoot = await prisma.questionFolder.findFirst({
    where: { name: "Coding", parentId: null },
  });
  if (!codingRoot) {
    codingRoot = await prisma.questionFolder.create({
      data: {
        name: "Coding",
        description: "Hands-on programming and algorithmic problems",
        order: 1,
      },
    });
  }

  // Helper to ensure subfolder exists
  async function ensureFolder(name: string, parentId: string, description: string = "", order: number = 0) {
    let folder = await prisma.questionFolder.findFirst({
      where: { name, parentId },
    });
    if (!folder) {
      folder = await prisma.questionFolder.create({
        data: { name, parentId, description, order },
      });
    }
    return folder;
  }

  // Level 1 Difficulty Folders
  const easyFolder = await ensureFolder("Easy", codingRoot.id, "Fundamental & warm-up algorithmic problems", 0);
  const mediumFolder = await ensureFolder("Medium", codingRoot.id, "Core data structures & interview problems", 1);
  const hardFolder = await ensureFolder("Hard", codingRoot.id, "Advanced algorithmic challenges & optimization", 2);

  // Level 2 Topic Folders as requested:
  // Under Easy: Array, Binary, Heap
  const easyArray = await ensureFolder("Array", easyFolder.id, "Array manipulation and searching", 0);
  const easyBinary = await ensureFolder("Binary", easyFolder.id, "Bit manipulation and binary arithmetic", 1);
  const easyHeap = await ensureFolder("Heap", easyFolder.id, "Priority queues and min/max heap problems", 2);

  // Under Medium: String, Linked list, Intervals, Tree
  const medString = await ensureFolder("String", mediumFolder.id, "String algorithms and anagrams", 0);
  const medLinkedList = await ensureFolder("Linked list", mediumFolder.id, "Pointer manipulation and linked lists", 1);
  const medIntervals = await ensureFolder("Intervals", mediumFolder.id, "Interval merging and scheduling", 2);
  const medTree = await ensureFolder("Tree", mediumFolder.id, "Binary trees and binary search trees", 3);

  // Under Hard: DP, Graph, Matrix
  const hardDP = await ensureFolder("DP", hardFolder.id, "Dynamic programming and memoization", 0);
  const hardGraph = await ensureFolder("Graph", hardFolder.id, "Graph traversals and topological sorting", 1);
  const hardMatrix = await ensureFolder("Matrix", hardFolder.id, "2D grids and matrix operations", 2);

  console.log("Folder hierarchy created successfully.");

  // Helper to insert or update question with test cases
  async function insertQuestion(folderId: string, q: QuestionData) {
    const cleanedTitle = cleanText(q.title);
    const cleanedDesc = cleanText(q.description);
    const cleanedTags = cleanText(q.tags);

    // Delete existing question with same title in this folder to allow clean re-runs
    const existing = await prisma.bankQuestion.findFirst({
      where: { folderId, title: cleanedTitle },
    });
    if (existing) {
      await prisma.bankQuestion.delete({ where: { id: existing.id } });
    }

    await prisma.bankQuestion.create({
      data: {
        folderId,
        type: "CODING",
        title: cleanedTitle,
        description: cleanedDesc,
        difficulty: q.difficulty,
        tags: cleanedTags,
        marks: q.marks,
        negativeMarks: 0,
        allowedLanguages: "JAVA,C,CPP",
        starterCodes: JSON.stringify(q.starterCodes),
        starterCode: q.starterCodes.JAVA,
        timeLimitSeconds: q.timeLimitSeconds,
        memoryLimitMb: q.memoryLimitMb,
        testCases: {
          create: q.testCases.map((tc, idx) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isPublic: tc.isPublic,
            weight: tc.weight,
            order: idx,
          })),
        },
      },
    });

    console.log(`Inserted [${q.difficulty}] ${cleanedTitle} (${q.testCases.length} test cases)`);
  }

  // =========================================================================
  // 1. EASY / ARRAY
  // =========================================================================
  await insertQuestion(easyArray.id, {
    title: "Two Sum",
    difficulty: "EASY",
    tags: "Array, Hash Table",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

Input Format:
Line 1: An integer n representing array length.
Line 2: n space-separated integers representing the array nums.
Line 3: An integer target.

Output Format:
Print the two 0-indexed positions separated by a space in ascending order.

Example 1:
Input:
4
2 7 11 15
9
Output:
0 1
Explanation: nums[0] + nums[1] == 2 + 7 == 9, so output is 0 1.

Example 2:
Input:
3
3 2 4
6
Output:
1 2

Constraints:
2 <= nums.length <= 10000
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Exactly one valid answer exists.`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                int first = map.get(comp);
                int second = i;
                System.out.println(Math.min(first, second) + " " + Math.max(first, second));
                return;
            }
            map.put(nums[i], i);
        }
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    int target;
    scanf("%d", &target);

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\n", i, j);
                free(nums);
                return 0;
            }
        }
    }
    free(nums);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int comp = target - nums[i];
        if (seen.count(comp)) {
            cout << min(seen[comp], i) << " " << max(seen[comp], i) << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`,
    },
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isPublic: true, weight: 1 },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isPublic: true, weight: 1 },
      { input: "2\n3 3\n6", expectedOutput: "0 1", isPublic: false, weight: 1 },
      { input: "5\n-1 -2 -3 -4 -5\n-8", expectedOutput: "2 4", isPublic: false, weight: 1 },
      { input: "6\n100 200 500 10 20 30\n50", expectedOutput: "4 5", isPublic: false, weight: 1 },
      { input: "4\n0 4 3 0\n0", expectedOutput: "0 3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "EASY",
    tags: "Array, Dynamic Programming",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
You are given an array prices where prices[i] is the price of a given stock on the ith day.
You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.
Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Input Format:
Line 1: An integer n representing number of days.
Line 2: n space-separated integers representing stock prices.

Output Format:
Print a single integer representing the maximum profit possible.

Example 1:
Input:
6
7 1 5 3 6 4
Output:
5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.

Example 2:
Input:
5
7 6 4 3 1
Output:
0
Explanation: In this case, no transactions are done and max profit is 0.

Constraints:
1 <= prices.length <= 100000
0 <= prices[i] <= 10000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int i = 0; i < n; i++) {
            int p = sc.nextInt();
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
        }
        System.out.println(maxProfit);
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int min_price = 1000000000;
    int max_profit = 0;
    for (int i = 0; i < n; i++) {
        int p;
        scanf("%d", &p);
        if (p < min_price) min_price = p;
        else if (p - min_price > max_profit) max_profit = p - min_price;
    }
    printf("%d\n", max_profit);
    return 0;
}`,
      CPP: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    int min_val = 1e9, ans = 0;
    for (int i = 0; i < n; i++) {
        int p;
        cin >> p;
        min_val = min(min_val, p);
        ans = max(ans, p - min_val);
    }
    cout << ans << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "6\n7 1 5 3 6 4", expectedOutput: "5", isPublic: true, weight: 1 },
      { input: "5\n7 6 4 3 1", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "2\n2 4", expectedOutput: "2", isPublic: false, weight: 1 },
      { input: "1\n10", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "6\n3 2 6 5 0 3", expectedOutput: "4", isPublic: false, weight: 1 },
      { input: "7\n1 2 3 4 5 6 7", expectedOutput: "6", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "Contains Duplicate",
    difficulty: "EASY",
    tags: "Array, Hash Table, Sorting",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Input Format:
Line 1: An integer n representing array length.
Line 2: n space-separated integers representing nums.

Output Format:
Print true if any value appears at least twice; otherwise print false.

Example 1:
Input:
4
1 2 3 1
Output:
true

Example 2:
Input:
4
1 2 3 4
Output:
false

Constraints:
1 <= nums.length <= 100000
-10^9 <= nums[i] <= 10^9`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Set<Integer> set = new HashSet<>();
        boolean duplicate = false;
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            if (!set.add(val)) duplicate = true;
        }
        System.out.println(duplicate ? "true" : "false");
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int cmp(const void *a, const void *b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    qsort(arr, n, sizeof(int), cmp);
    for (int i = 1; i < n; i++) {
        if (arr[i] == arr[i - 1]) {
            printf("true\n");
            free(arr);
            return 0;
        }
    }
    printf("false\n");
    free(arr);
    return 0;
}`,
      CPP: `#include <iostream>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    unordered_set<int> seen;
    bool found = false;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (seen.count(x)) found = true;
        seen.insert(x);
    }
    cout << (found ? "true" : "false") << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "4\n1 2 3 4", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "10\n1 1 1 3 3 4 3 2 4 2", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "1\n50", expectedOutput: "false", isPublic: false, weight: 1 },
      { input: "5\n-1 -2 -3 -4 -1", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "6\n0 10 20 30 40 50", expectedOutput: "false", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "Maximum Subarray",
    difficulty: "EASY",
    tags: "Array, Divide and Conquer, Dynamic Programming",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an integer array nums, find the subarray with the largest sum, and return its sum.
A subarray is a contiguous non-empty sequence of elements within an array.

Input Format:
Line 1: An integer n representing array length.
Line 2: n space-separated integers representing nums.

Output Format:
Print a single integer representing the maximum subarray sum.

Example 1:
Input:
9
-2 1 -3 4 -1 2 1 -5 4
Output:
6
Explanation: The subarray [4, -1, 2, 1] has the largest sum 6.

Example 2:
Input:
1
1
Output:
1

Example 3:
Input:
5
5 4 -1 7 8
Output:
23

Constraints:
1 <= nums.length <= 100000
-10000 <= nums[i] <= 10000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long maxSoFar = Long.MIN_VALUE;
        long current = 0;
        for (int i = 0; i < n; i++) {
            long x = sc.nextLong();
            current += x;
            if (current > maxSoFar) maxSoFar = current;
            if (current < 0) current = 0;
        }
        System.out.println(maxSoFar);
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    long long max_so_far = -1000000000LL;
    long long current = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        scanf("%lld", &x);
        current += x;
        if (current > max_so_far) max_so_far = current;
        if (current < 0) current = 0;
    }
    printf("%lld\n", max_so_far);
    return 0;
}`,
      CPP: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    long long max_sum = -1e18, curr = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        curr += x;
        max_sum = max(max_sum, curr);
        if (curr < 0) curr = 0;
    }
    cout << max_sum << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "1\n1", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "5\n5 4 -1 7 8", expectedOutput: "23", isPublic: false, weight: 1 },
      { input: "3\n-3 -2 -1", expectedOutput: "-1", isPublic: false, weight: 1 },
      { input: "4\n-2 -1 -3 -4", expectedOutput: "-1", isPublic: false, weight: 1 },
      { input: "6\n1 2 3 -10 4 5", expectedOutput: "9", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 2. EASY / BINARY
  // =========================================================================
  await insertQuestion(easyBinary.id, {
    title: "Number of 1 Bits",
    difficulty: "EASY",
    tags: "Bit Manipulation, Divide and Conquer",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Write a function that takes the positive integer n and returns the number of set bits (also known as the Hamming weight).

Input Format:
A single non-negative integer n.

Output Format:
Print the number of set bits (1s) in the binary representation of n.

Example 1:
Input:
11
Output:
3
Explanation: The binary representation of 11 is 1011, which has 3 set bits.

Example 2:
Input:
128
Output:
1
Explanation: The binary representation of 128 is 10000000, which has 1 set bit.

Constraints:
0 <= n <= 2^31 - 1`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLong()) return;
        long n = sc.nextLong();
        int count = 0;
        while (n > 0) {
            count += (n & 1);
            n >>= 1;
        }
        System.out.println(count);
    }
}`,
      C: `#include <stdio.h>

int main() {
    unsigned long long n;
    if (scanf("%llu", &n) != 1) return 0;
    int count = 0;
    while (n > 0) {
        count += (n & 1);
        n >>= 1;
    }
    printf("%d\n", count);
    return 0;
}`,
      CPP: `#include <iostream>
using namespace std;

int main() {
    unsigned long long n;
    if (!(cin >> n)) return 0;
    int count = 0;
    while (n > 0) {
        count += (n & 1);
        n >>= 1;
    }
    cout << count << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "11", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "128", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "2147483645", expectedOutput: "30", isPublic: false, weight: 1 },
      { input: "0", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "7", expectedOutput: "3", isPublic: false, weight: 1 },
      { input: "15", expectedOutput: "4", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyBinary.id, {
    title: "Counting Bits",
    difficulty: "EASY",
    tags: "Bit Manipulation, Dynamic Programming",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1s in the binary representation of i.

Input Format:
A single non-negative integer n.

Output Format:
Print n + 1 space-separated integers where the ith integer represents the count of 1s in the binary representation of i.

Example 1:
Input:
2
Output:
0 1 1
Explanation:
0 --> 0
1 --> 1
2 --> 10 (one 1)

Example 2:
Input:
5
Output:
0 1 1 2 1 2

Constraints:
0 <= n <= 100000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] ans = new int[n + 1];
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i <= n; i++) {
            ans[i] = ans[i >> 1] + (i & 1);
            if (i > 0) sb.append(" ");
            sb.append(ans[i]);
        }
        System.out.println(sb.toString());
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *ans = (int*)malloc((n + 1) * sizeof(int));
    ans[0] = 0;
    printf("0");
    for (int i = 1; i <= n; i++) {
        ans[i] = ans[i >> 1] + (i & 1);
        printf(" %d", ans[i]);
    }
    printf("\n");
    free(ans);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> ans(n + 1, 0);
    cout << 0;
    for (int i = 1; i <= n; i++) {
        ans[i] = ans[i >> 1] + (i & 1);
        cout << " " << ans[i];
    }
    cout << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "2", expectedOutput: "0 1 1", isPublic: true, weight: 1 },
      { input: "5", expectedOutput: "0 1 1 2 1 2", isPublic: true, weight: 1 },
      { input: "0", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "1", expectedOutput: "0 1", isPublic: false, weight: 1 },
      { input: "7", expectedOutput: "0 1 1 2 1 2 2 3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyBinary.id, {
    title: "Missing Number",
    difficulty: "EASY",
    tags: "Array, Hash Table, Math, Binary, Bit Manipulation",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.

Input Format:
Line 1: An integer n representing array length.
Line 2: n space-separated integers representing nums.

Output Format:
Print a single integer representing the missing number.

Example 1:
Input:
3
3 0 1
Output:
2
Explanation: n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number.

Example 2:
Input:
2
0 1
Output:
2

Example 3:
Input:
9
9 6 4 2 3 5 7 0 1
Output:
8

Constraints:
n == nums.length
1 <= n <= 10000
0 <= nums[i] <= n
All numbers of nums are unique.`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int xor = 0;
        for (int i = 0; i <= n; i++) xor ^= i;
        for (int i = 0; i < n; i++) xor ^= sc.nextInt();
        System.out.println(xor);
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int xor_val = 0;
    for (int i = 0; i <= n; i++) xor_val ^= i;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        xor_val ^= x;
    }
    printf("%d\n", xor_val);
    return 0;
}`,
      CPP: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    int xor_val = 0;
    for (int i = 0; i <= n; i++) xor_val ^= i;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        xor_val ^= x;
    }
    cout << xor_val << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "3\n3 0 1", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "2\n0 1", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "9\n9 6 4 2 3 5 7 0 1", expectedOutput: "8", isPublic: false, weight: 1 },
      { input: "1\n0", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "1\n1", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "4\n0 1 2 4", expectedOutput: "3", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 3. EASY / HEAP
  // =========================================================================
  await insertQuestion(easyHeap.id, {
    title: "Kth Largest Element in an Array",
    difficulty: "EASY",
    tags: "Array, Divide and Conquer, Sorting, Heap, Priority Queue",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an integer array nums and an integer k, return the kth largest element in the array.
Note that it is the kth largest element in the sorted order, not the kth distinct element.
Can you solve it without sorting?

Input Format:
Line 1: An integer n representing array length.
Line 2: n space-separated integers representing nums.
Line 3: An integer k.

Output Format:
Print a single integer representing the kth largest element.

Example 1:
Input:
6
3 2 1 5 6 4
2
Output:
5

Example 2:
Input:
9
3 2 3 1 2 4 5 5 6
4
Output:
4

Constraints:
1 <= k <= nums.length <= 100000
-10000 <= nums[i] <= 10000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int k = sc.nextInt();
        
        for (int num : nums) {
            pq.offer(num);
            if (pq.size() > k) pq.poll();
        }
        System.out.println(pq.peek());
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int cmp(const void *a, const void *b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    if (x < y) return 1;
    if (x > y) return -1;
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    int k;
    scanf("%d", &k);
    qsort(arr, n, sizeof(int), cmp);
    printf("%d\n", arr[k - 1]);
    free(arr);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int k;
    cin >> k;

    priority_queue<int, vector<int>, greater<int>> pq;
    for (int x : nums) {
        pq.push(x);
        if (pq.size() > k) pq.pop();
    }
    cout << pq.top() << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "6\n3 2 1 5 6 4\n2", expectedOutput: "5", isPublic: true, weight: 1 },
      { input: "9\n3 2 3 1 2 4 5 5 6\n4", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "1\n100\n1", expectedOutput: "100", isPublic: false, weight: 1 },
      { input: "5\n-5 -2 -1 -4 -3\n2", expectedOutput: "-2", isPublic: false, weight: 1 },
      { input: "5\n10 10 10 10 10\n3", expectedOutput: "10", isPublic: false, weight: 1 },
      { input: "7\n7 6 5 4 3 2 1\n7", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 4. MEDIUM / STRING
  // =========================================================================
  await insertQuestion(medString.id, {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    tags: "Hash Table, String, Sliding Window",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given a string s, find the length of the longest substring without repeating characters.

Input Format:
A single line string s.

Output Format:
Print an integer representing the maximum length of a non-repeating substring.

Example 1:
Input:
abcabcbb
Output:
3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input:
bbbbb
Output:
1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input:
pwwkew
Output:
3
Explanation: The answer is "wke", with the length of 3.

Constraints:
0 <= s.length <= 50000
s consists of English letters, digits, symbols and spaces.`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        Map<Character, Integer> last = new HashMap<>();
        int maxLen = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (last.containsKey(c)) {
                start = Math.max(start, last.get(c) + 1);
            }
            last.put(c, i);
            maxLen = Math.max(maxLen, i - start + 1);
        }
        System.out.println(maxLen);
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[60000];
    if (!fgets(s, sizeof(s), stdin)) {
        printf("0\n");
        return 0;
    }
    int len = strlen(s);
    if (len > 0 && s[len - 1] == '\n') s[--len] = '\0';

    int last[256];
    for (int i = 0; i < 256; i++) last[i] = -1;

    int max_len = 0, start = 0;
    for (int i = 0; i < len; i++) {
        unsigned char c = (unsigned char)s[i];
        if (last[c] >= start) start = last[c] + 1;
        last[c] = i;
        int cur = i - start + 1;
        if (cur > max_len) max_len = cur;
    }
    printf("%d\n", max_len);
    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    vector<int> last(256, -1);
    int max_len = 0, start = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        unsigned char c = s[i];
        if (last[c] >= start) start = last[c] + 1;
        last[c] = i;
        max_len = max(max_len, i - start + 1);
    }
    cout << max_len << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "abcabcbb", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "bbbbb", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "pwwkew", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "au", expectedOutput: "2", isPublic: false, weight: 1 },
      { input: "dvdf", expectedOutput: "3", isPublic: false, weight: 1 },
      { input: "abcdefghij", expectedOutput: "10", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medString.id, {
    title: "Valid Anagram",
    difficulty: "MEDIUM",
    tags: "Hash Table, String, Sorting",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given two strings s and t, return true if t is an anagram of s, and false otherwise.
An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Input Format:
Line 1: String s.
Line 2: String t.

Output Format:
Print true if t is an anagram of s; otherwise print false.

Example 1:
Input:
anagram
nagaram
Output:
true

Example 2:
Input:
rat
car
Output:
false

Constraints:
1 <= s.length, t.length <= 50000
s and t consist of lowercase English letters.`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String t = sc.next();
        if (s.length() != t.length()) {
            System.out.println("false");
            return;
        }
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        for (char c : t.toCharArray()) {
            counts[c - 'a']--;
            if (counts[c - 'a'] < 0) {
                System.out.println("false");
                return;
            }
        }
        System.out.println("true");
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[60000], t[60000];
    if (scanf("%s %s", s, t) != 2) return 0;
    if (strlen(s) != strlen(t)) {
        printf("false\n");
        return 0;
    }
    int cnt[26] = {0};
    for (int i = 0; s[i]; i++) cnt[s[i] - 'a']++;
    for (int i = 0; t[i]; i++) {
        cnt[t[i] - 'a']--;
        if (cnt[t[i] - 'a'] < 0) {
            printf("false\n");
            return 0;
        }
    }
    printf("true\n");
    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;
    if (s.size() != t.size()) {
        cout << "false" << endl;
        return 0;
    }
    vector<int> cnt(26, 0);
    for (char c : s) cnt[c - 'a']++;
    for (char c : t) {
        if (--cnt[c - 'a'] < 0) {
            cout << "false" << endl;
            return 0;
        }
    }
    cout << "true" << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "anagram\nnagaram", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "rat\ncar", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "a\na", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "ab\na", expectedOutput: "false", isPublic: false, weight: 1 },
      { input: "listen\nsilent", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "triangle\nintegral", expectedOutput: "true", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 5. MEDIUM / LINKED LIST
  // =========================================================================
  await insertQuestion(medLinkedList.id, {
    title: "Reverse Linked List",
    difficulty: "MEDIUM",
    tags: "Linked List, Recursion",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given the head of a singly linked list represented as an array of values, reverse the list, and return the reversed list.

Input Format:
Line 1: An integer n representing number of nodes in list.
Line 2: n space-separated integers representing the node values.

Output Format:
Print the values of the reversed linked list separated by space.

Example 1:
Input:
5
1 2 3 4 5
Output:
5 4 3 2 1

Example 2:
Input:
2
1 2
Output:
2 1

Example 3:
Input:
0
Output:
empty

Constraints:
0 <= n <= 5000
-5000 <= Node.val <= 5000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println("empty");
            return;
        }
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        StringBuilder sb = new StringBuilder();
        for (int i = n - 1; i >= 0; i--) {
            if (i < n - 1) sb.append(" ");
            sb.append(arr[i]);
        }
        System.out.println(sb.toString());
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    if (n == 0) {
        printf("empty\n");
        return 0;
    }
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    for (int i = n - 1; i >= 0; i--) {
        printf("%d%c", arr[i], i == 0 ? '\n' : ' ');
    }
    free(arr);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    if (n == 0) {
        cout << "empty" << endl;
        return 0;
    }
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    for (int i = n - 1; i >= 0; i--) {
        cout << arr[i] << (i == 0 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isPublic: true, weight: 1 },
      { input: "2\n1 2", expectedOutput: "2 1", isPublic: true, weight: 1 },
      { input: "0", expectedOutput: "empty", isPublic: false, weight: 1 },
      { input: "1\n42", expectedOutput: "42", isPublic: false, weight: 1 },
      { input: "4\n-1 -2 -3 -4", expectedOutput: "-4 -3 -2 -1", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 6. MEDIUM / INTERVALS
  // =========================================================================
  await insertQuestion(medIntervals.id, {
    title: "Merge Intervals",
    difficulty: "MEDIUM",
    tags: "Array, Sorting, Intervals",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Input Format:
Line 1: An integer n representing number of intervals.
Next n lines: Each line contains two integers representing start and end of interval.

Output Format:
Print each merged interval on a new line with start and end separated by space, ordered by start time.

Example 1:
Input:
4
1 3
2 6
8 10
15 18
Output:
1 6
8 10
15 18
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

Example 2:
Input:
2
1 4
4 5
Output:
1 5

Constraints:
1 <= intervals.length <= 10000
intervals[i].length == 2
0 <= starti <= endi <= 10000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        int[] cur = intervals[0];
        merged.add(cur);
        for (int i = 1; i < n; i++) {
            if (intervals[i][0] <= cur[1]) {
                cur[1] = Math.max(cur[1], intervals[i][1]);
            } else {
                cur = intervals[i];
                merged.add(cur);
            }
        }
        for (int[] interval : merged) {
            System.out.println(interval[0] + " " + interval[1]);
        }
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

typedef struct { int start, end; } Interval;

int cmp(const void *a, const void *b) {
    Interval *x = (Interval*)a;
    Interval *y = (Interval*)b;
    return x->start - y->start;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    Interval *arr = (Interval*)malloc(n * sizeof(Interval));
    for (int i = 0; i < n; i++) scanf("%d %d", &arr[i].start, &arr[i].end);
    qsort(arr, n, sizeof(Interval), cmp);

    int cur_start = arr[0].start;
    int cur_end = arr[0].end;
    for (int i = 1; i < n; i++) {
        if (arr[i].start <= cur_end) {
            if (arr[i].end > cur_end) cur_end = arr[i].end;
        } else {
            printf("%d %d\n", cur_start, cur_end);
            cur_start = arr[i].start;
            cur_end = arr[i].end;
        }
    }
    printf("%d %d\n", cur_start, cur_end);
    free(arr);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; i++) cin >> intervals[i].first >> intervals[i].second;
    sort(intervals.begin(), intervals.end());

    vector<pair<int, int>> merged;
    merged.push_back(intervals[0]);
    for (int i = 1; i < n; i++) {
        if (intervals[i].first <= merged.back().second) {
            merged.back().second = max(merged.back().second, intervals[i].second);
        } else {
            merged.push_back(intervals[i]);
        }
    }
    for (auto &p : merged) {
        cout << p.first << " " << p.second << endl;
    }
    return 0;
}`,
    },
    testCases: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", expectedOutput: "1 6\n8 10\n15 18", isPublic: true, weight: 1 },
      { input: "2\n1 4\n4 5", expectedOutput: "1 5", isPublic: true, weight: 1 },
      { input: "1\n1 10", expectedOutput: "1 10", isPublic: false, weight: 1 },
      { input: "3\n1 5\n2 3\n4 6", expectedOutput: "1 6", isPublic: false, weight: 1 },
      { input: "3\n5 8\n1 3\n2 4", expectedOutput: "1 4\n5 8", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 7. MEDIUM / TREE
  // =========================================================================
  await insertQuestion(medTree.id, {
    title: "Maximum Depth of Binary Tree",
    difficulty: "MEDIUM",
    tags: "Tree, Depth-First Search, Breadth-First Search, Binary Tree",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given the level-order traversal of a binary tree, find its maximum depth.
A binary tree maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.
Null nodes in input are represented by the string null.

Input Format:
Line 1: An integer n representing number of elements in level order.
Line 2: n space-separated tokens (integers or null).

Output Format:
Print an integer representing the maximum depth of the binary tree.

Example 1:
Input:
7
3 9 20 null null 15 7
Output:
3

Example 2:
Input:
2
1 null
Output:
1

Constraints:
The number of nodes in the tree is in the range [0, 10000].
-100 <= Node.val <= 100`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    static class Node {
        int val;
        Node left, right;
        Node(int val) { this.val = val; }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println(0);
            return;
        }
        String[] tokens = new String[n];
        for (int i = 0; i < n; i++) tokens[i] = sc.next();
        if (tokens[0].equals("null")) {
            System.out.println(0);
            return;
        }

        Node root = new Node(Integer.parseInt(tokens[0]));
        Queue<Node> q = new LinkedList<>();
        q.offer(root);
        int idx = 1;
        while (!q.isEmpty() && idx < n) {
            Node curr = q.poll();
            if (idx < n && !tokens[idx].equals("null")) {
                curr.left = new Node(Integer.parseInt(tokens[idx]));
                q.offer(curr.left);
            }
            idx++;
            if (idx < n && !tokens[idx].equals("null")) {
                curr.right = new Node(Integer.parseInt(tokens[idx]));
                q.offer(curr.right);
            }
            idx++;
        }
        System.out.println(maxDepth(root));
    }

    static int maxDepth(Node root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    int val;
    struct Node *left, *right;
} Node;

int max_depth(Node *root) {
    if (!root) return 0;
    int l = max_depth(root->left);
    int r = max_depth(root->right);
    return 1 + (l > r ? l : r);
}

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n == 0) {
        printf("0\n");
        return 0;
    }
    char token[32];
    scanf("%s", token);
    if (strcmp(token, "null") == 0) {
        printf("0\n");
        return 0;
    }
    Node *root = (Node*)malloc(sizeof(Node));
    root->val = atoi(token);
    root->left = root->right = NULL;

    Node **q = (Node**)malloc(n * sizeof(Node*));
    int head = 0, tail = 0;
    q[tail++] = root;

    int i = 1;
    while (head < tail && i < n) {
        Node *cur = q[head++];
        if (i < n) {
            scanf("%s", token);
            if (strcmp(token, "null") != 0) {
                cur->left = (Node*)malloc(sizeof(Node));
                cur->left->val = atoi(token);
                cur->left->left = cur->left->right = NULL;
                q[tail++] = cur->left;
            }
            i++;
        }
        if (i < n) {
            scanf("%s", token);
            if (strcmp(token, "null") != 0) {
                cur->right = (Node*)malloc(sizeof(Node));
                cur->right->val = atoi(token);
                cur->right->left = cur->right->right = NULL;
                q[tail++] = cur->right;
            }
            i++;
        }
    }
    printf("%d\n", max_depth(root));
    free(q);
    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

struct Node {
    int val;
    Node *left = nullptr, *right = nullptr;
    Node(int v) : val(v) {}
};

int maxDepth(Node* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}

int main() {
    int n;
    if (!(cin >> n) || n == 0) {
        cout << 0 << endl;
        return 0;
    }
    string first;
    cin >> first;
    if (first == "null") {
        cout << 0 << endl;
        return 0;
    }
    Node* root = new Node(stoi(first));
    queue<Node*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < n) {
        Node* cur = q.front();
        q.pop();
        if (i < n) {
            string s;
            cin >> s;
            if (s != "null") {
                cur->left = new Node(stoi(s));
                q.push(cur->left);
            }
            i++;
        }
        if (i < n) {
            string s;
            cin >> s;
            if (s != "null") {
                cur->right = new Node(stoi(s));
                q.push(cur->right);
            }
            i++;
        }
    }
    cout << maxDepth(root) << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "7\n3 9 20 null null 15 7", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "2\n1 null", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "0", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "1\n5", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "5\n1 2 3 4 5", expectedOutput: "3", isPublic: false, weight: 1 },
      { input: "7\n1 2 null 3 null 4 null", expectedOutput: "4", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 8. HARD / DP
  // =========================================================================
  await insertQuestion(hardDP.id, {
    title: "Coin Change",
    difficulty: "HARD",
    tags: "Array, Dynamic Programming, Breadth-First Search",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.
Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.
You may assume that you have an infinite number of each kind of coin.

Input Format:
Line 1: An integer n representing number of coin denominations.
Line 2: n space-separated integers representing the coin denominations.
Line 3: An integer amount.

Output Format:
Print the fewest number of coins needed, or -1 if impossible.

Example 1:
Input:
3
1 2 5
11
Output:
3
Explanation: 11 = 5 + 5 + 1 (3 coins).

Example 2:
Input:
1
2
3
Output:
-1

Example 3:
Input:
1
1
0
Output:
0

Constraints:
1 <= coins.length <= 12
1 <= coins[i] <= 2^31 - 1
0 <= amount <= 10000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) coins[i] = sc.nextInt();
        int amount = sc.nextInt();

        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i >= coin) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        System.out.println(dp[amount] > amount ? -1 : dp[amount]);
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int coins[20];
    for (int i = 0; i < n; i++) scanf("%d", &coins[i]);
    int amount;
    scanf("%d", &amount);

    int dp[10005];
    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int j = 0; j < n; j++) {
            if (i >= coins[j]) {
                int cand = dp[i - coins[j]] + 1;
                if (cand < dp[i]) dp[i] = cand;
            }
        }
    }
    printf("%d\n", dp[amount] > amount ? -1 : dp[amount]);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> coins(n);
    for (int i = 0; i < n; i++) cin >> coins[i];
    int amount;
    cin >> amount;

    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int c : coins) {
            if (i >= c) dp[i] = min(dp[i], dp[i - c] + 1);
        }
    }
    cout << (dp[amount] > amount ? -1 : dp[amount]) << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "3\n1 2 5\n11", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "1\n2\n3", expectedOutput: "-1", isPublic: true, weight: 1 },
      { input: "1\n1\n0", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "4\n1 3 4 5\n7", expectedOutput: "2", isPublic: false, weight: 1 },
      { input: "3\n2 5 10\n15", expectedOutput: "2", isPublic: false, weight: 1 },
      { input: "3\n186 419 83\n6249", expectedOutput: "20", isPublic: false, weight: 2 },
    ],
  });

  await insertQuestion(hardDP.id, {
    title: "Longest Increasing Subsequence",
    difficulty: "HARD",
    tags: "Array, Binary Search, Dynamic Programming",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an integer array nums, return the length of the longest strictly increasing subsequence.
A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.

Input Format:
Line 1: An integer n representing array length.
Line 2: n space-separated integers representing nums.

Output Format:
Print a single integer representing the length of the longest strictly increasing subsequence.

Example 1:
Input:
8
10 9 2 5 3 7 101 18
Output:
4
Explanation: The longest increasing subsequence is [2, 3, 7, 101], therefore the length is 4.

Example 2:
Input:
6
0 1 0 3 2 3
Output:
4

Example 3:
Input:
7
7 7 7 7 7 7 7
Output:
1

Constraints:
1 <= nums.length <= 2500
-10000 <= nums[i] <= 10000`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        List<Integer> tails = new ArrayList<>();
        for (int x : nums) {
            int idx = Collections.binarySearch(tails, x);
            if (idx < 0) idx = -(idx + 1);
            if (idx == tails.size()) tails.add(x);
            else tails.set(idx, x);
        }
        System.out.println(tails.size());
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    int *dp = (int*)malloc(n * sizeof(int));
    int max_len = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
            }
        }
        if (dp[i] > max_len) max_len = dp[i];
    }
    printf("%d\n", max_len);
    free(nums);
    free(dp);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    cout << tails.size() << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "8\n10 9 2 5 3 7 101 18", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "6\n0 1 0 3 2 3", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "7\n7 7 7 7 7 7 7", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "1\n50", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "5\n5 4 3 2 1", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "6\n1 3 6 7 9 4", expectedOutput: "5", isPublic: false, weight: 2 },
    ],
  });

  // =========================================================================
  // 9. HARD / GRAPH
  // =========================================================================
  await insertQuestion(hardGraph.id, {
    title: "Number of Islands",
    difficulty: "HARD",
    tags: "Array, Depth-First Search, Breadth-First Search, Union Find, Matrix",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.
An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

Input Format:
Line 1: Two integers m and n representing rows and columns.
Next m lines: Each line contains n characters (0 or 1) separated by spaces.

Output Format:
Print an integer representing the total count of islands.

Example 1:
Input:
4 5
1 1 1 1 0
1 1 0 1 0
1 1 0 0 0
0 0 0 0 0
Output:
1

Example 2:
Input:
4 5
1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1
Output:
3

Constraints:
m == grid.length
n == grid[i].length
1 <= m, n <= 300
grid[i][j] is '0' or '1'`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        char[][] grid = new char[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = sc.next().charAt(0);
            }
        }
        int islands = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    islands++;
                    dfs(grid, i, j, m, n);
                }
            }
        }
        System.out.println(islands);
    }

    static void dfs(char[][] g, int r, int c, int m, int n) {
        if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] != '1') return;
        g[r][c] = '0';
        dfs(g, r + 1, c, m, n);
        dfs(g, r - 1, c, m, n);
        dfs(g, r, c + 1, m, n);
        dfs(g, r, c - 1, m, n);
    }
}`,
      C: `#include <stdio.h>

void dfs(char g[305][305], int r, int c, int m, int n) {
    if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] != '1') return;
    g[r][c] = '0';
    dfs(g, r + 1, c, m, n);
    dfs(g, r - 1, c, m, n);
    dfs(g, r, c + 1, m, n);
    dfs(g, r, c - 1, m, n);
}

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    char g[305][305];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            char ch[4];
            scanf("%s", ch);
            g[i][j] = ch[0];
        }
    }
    int count = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (g[i][j] == '1') {
                count++;
                dfs(g, i, j, m, n);
            }
        }
    }
    printf("%d\n", count);
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

void dfs(vector<vector<char>> &g, int r, int c, int m, int n) {
    if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] != '1') return;
    g[r][c] = '0';
    dfs(g, r + 1, c, m, n);
    dfs(g, r - 1, c, m, n);
    dfs(g, r, c + 1, m, n);
    dfs(g, r, c - 1, m, n);
}

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<char>> g(m, vector<char>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> g[i][j];
        }
    }
    int count = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (g[i][j] == '1') {
                count++;
                dfs(g, i, j, m, n);
            }
        }
    }
    cout << count << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "1 1\n0", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "1 1\n1", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "3 3\n1 0 1\n0 1 0\n1 0 1", expectedOutput: "5", isPublic: false, weight: 1 },
      { input: "3 3\n1 1 1\n1 1 1\n1 1 1", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  // =========================================================================
  // 10. HARD / MATRIX
  // =========================================================================
  await insertQuestion(hardMatrix.id, {
    title: "Set Matrix Zeroes",
    difficulty: "HARD",
    tags: "Array, Hash Table, Matrix",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0s.
You must do it in place.

Input Format:
Line 1: Two integers m and n representing matrix rows and columns.
Next m lines: Each line contains n space-separated integers.

Output Format:
Print the resulting m x n matrix with each row on a new line and elements separated by space.

Example 1:
Input:
3 3
1 1 1
1 0 1
1 1 1
Output:
1 0 1
0 0 0
1 0 1

Example 2:
Input:
3 4
0 1 2 0
3 4 5 2
1 3 1 5
Output:
0 0 0 0
0 4 5 0
0 3 1 0

Constraints:
m == matrix.length
n == matrix[0].length
1 <= m, n <= 200
-2^31 <= matrix[i][j] <= 2^31 - 1`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] mat = new int[m][n];
        boolean firstRowZero = false, firstColZero = false;

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                mat[i][j] = sc.nextInt();
                if (mat[i][j] == 0) {
                    if (i == 0) firstRowZero = true;
                    if (j == 0) firstColZero = true;
                    mat[i][0] = 0;
                    mat[0][j] = 0;
                }
            }
        }

        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (mat[i][0] == 0 || mat[0][j] == 0) {
                    mat[i][j] = 0;
                }
            }
        }

        if (firstRowZero) {
            for (int j = 0; j < n; j++) mat[0][j] = 0;
        }
        if (firstColZero) {
            for (int i = 0; i < m; i++) mat[i][0] = 0;
        }

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                System.out.print(mat[i][j] + (j == n - 1 ? "" : " "));
            }
            System.out.println();
        }
    }
}`,
      C: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int mat[205][205];
    bool first_row_zero = false, first_col_zero = false;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &mat[i][j]);
            if (mat[i][j] == 0) {
                if (i == 0) first_row_zero = true;
                if (j == 0) first_col_zero = true;
                mat[i][0] = 0;
                mat[0][j] = 0;
            }
        }
    }

    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            if (mat[i][0] == 0 || mat[0][j] == 0) {
                mat[i][j] = 0;
            }
        }
    }

    if (first_row_zero) {
        for (int j = 0; j < n; j++) mat[0][j] = 0;
    }
    if (first_col_zero) {
        for (int i = 0; i < m; i++) mat[i][0] = 0;
    }

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            printf("%d%c", mat[i][j], j == n - 1 ? '\n' : ' ');
        }
    }
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<int>> mat(m, vector<int>(n));
    bool first_row_zero = false, first_col_zero = false;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> mat[i][j];
            if (mat[i][j] == 0) {
                if (i == 0) first_row_zero = true;
                if (j == 0) first_col_zero = true;
                mat[i][0] = 0;
                mat[0][j] = 0;
            }
        }
    }

    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            if (mat[i][0] == 0 || mat[0][j] == 0) mat[i][j] = 0;
        }
    }

    if (first_row_zero) for (int j = 0; j < n; j++) mat[0][j] = 0;
    if (first_col_zero) for (int i = 0; i < m; i++) mat[i][0] = 0;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cout << mat[i][j] << (j == n - 1 ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}`,
    },
    testCases: [
      { input: "3 3\n1 1 1\n1 0 1\n1 1 1", expectedOutput: "1 0 1\n0 0 0\n1 0 1", isPublic: true, weight: 1 },
      { input: "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5", expectedOutput: "0 0 0 0\n0 4 5 0\n0 3 1 0", isPublic: true, weight: 1 },
      { input: "1 1\n5", expectedOutput: "5", isPublic: false, weight: 1 },
      { input: "1 1\n0", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "2 2\n1 2\n3 4", expectedOutput: "1 2\n3 4", isPublic: false, weight: 1 },
      { input: "2 2\n0 1\n2 3", expectedOutput: "0 0\n0 3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardMatrix.id, {
    title: "Spiral Matrix",
    difficulty: "HARD",
    tags: "Array, Matrix, Simulation",
    marks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    description: `Problem Statement:
Given an m x n matrix, return all elements of the matrix in spiral order.

Input Format:
Line 1: Two integers m and n representing matrix rows and columns.
Next m lines: Each line contains n space-separated integers.

Output Format:
Print all elements in spiral order separated by spaces.

Example 1:
Input:
3 3
1 2 3
4 5 6
7 8 9
Output:
1 2 3 6 9 8 7 4 5

Example 2:
Input:
3 4
1 2 3 4
5 6 7 8
9 10 11 12
Output:
1 2 3 4 8 12 11 10 9 5 6 7

Constraints:
m == matrix.length
n == matrix[i].length
1 <= m, n <= 10
-100 <= matrix[i][j] <= 100`,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] mat = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) mat[i][j] = sc.nextInt();
        }

        List<Integer> res = new ArrayList<>();
        int top = 0, bottom = m - 1, left = 0, right = n - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) res.add(mat[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) res.add(mat[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) res.add(mat[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) res.add(mat[i][left]);
                left++;
            }
        }
        for (int i = 0; i < res.size(); i++) {
            System.out.print(res.get(i) + (i == res.size() - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int mat[20][20];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) scanf("%d", &mat[i][j]);
    }
    int top = 0, bottom = m - 1, left = 0, right = n - 1;
    int first = 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) {
            if (!first) printf(" ");
            printf("%d", mat[top][j]);
            first = 0;
        }
        top++;
        for (int i = top; i <= bottom; i++) {
            if (!first) printf(" ");
            printf("%d", mat[i][right]);
            first = 0;
        }
        right--;
        if (top <= bottom) {
            for (int j = right; j >= left; j--) {
                if (!first) printf(" ");
                printf("%d", mat[bottom][j]);
                first = 0;
            }
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) {
                if (!first) printf(" ");
                printf("%d", mat[i][left]);
                first = 0;
            }
            left++;
        }
    }
    printf("\n");
    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<int>> mat(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) cin >> mat[i][j];
    }
    int top = 0, bottom = m - 1, left = 0, right = n - 1;
    bool first = true;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) {
            if (!first) cout << " ";
            cout << mat[top][j];
            first = false;
        }
        top++;
        for (int i = top; i <= bottom; i++) {
            if (!first) cout << " ";
            cout << mat[i][right];
            first = false;
        }
        right--;
        if (top <= bottom) {
            for (int j = right; j >= left; j--) {
                if (!first) cout << " ";
                cout << mat[bottom][j];
                first = false;
            }
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) {
                if (!first) cout << " ";
                cout << mat[i][left];
                first = false;
            }
            left++;
        }
    }
    cout << endl;
    return 0;
}`,
    },
    testCases: [
      { input: "3 3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "1 2 3 6 9 8 7 4 5", isPublic: true, weight: 1 },
      { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12", expectedOutput: "1 2 3 4 8 12 11 10 9 5 6 7", isPublic: true, weight: 1 },
      { input: "1 1\n42", expectedOutput: "42", isPublic: false, weight: 1 },
      { input: "1 4\n1 2 3 4", expectedOutput: "1 2 3 4", isPublic: false, weight: 1 },
      { input: "4 1\n1\n2\n3\n4", expectedOutput: "1 2 3 4", isPublic: false, weight: 1 },
      { input: "2 2\n1 2\n3 4", expectedOutput: "1 2 4 3", isPublic: false, weight: 1 },
    ],
  });

  console.log("Blind 75 Question Bank Seed completed successfully!");
}

if (require.main === module) {
  seedBlind75()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
