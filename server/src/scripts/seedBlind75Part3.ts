import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export async function seedBlind75Part3() {
  console.log("Starting Blind 75 Part 3 Seed (Questions 29-52)...");

  const codingRoot = await prisma.questionFolder.findFirst({ where: { name: "Coding", parentId: null } });
  if (!codingRoot) throw new Error("Coding root folder not found");

  const easyFolder = await prisma.questionFolder.findFirst({ where: { name: "Easy", parentId: codingRoot.id } });
  const medFolder = await prisma.questionFolder.findFirst({ where: { name: "Medium", parentId: codingRoot.id } });
  const hardFolder = await prisma.questionFolder.findFirst({ where: { name: "Hard", parentId: codingRoot.id } });

  if (!easyFolder || !medFolder || !hardFolder) throw new Error("Difficulty folders not found");

  const easyArray = await prisma.questionFolder.findFirst({ where: { name: "Array", parentId: easyFolder.id } });
  const easyBinary = await prisma.questionFolder.findFirst({ where: { name: "Binary", parentId: easyFolder.id } });
  const easyHeap = await prisma.questionFolder.findFirst({ where: { name: "Heap", parentId: easyFolder.id } });

  const medString = await prisma.questionFolder.findFirst({ where: { name: "String", parentId: medFolder.id } });
  const medLinkedList = await prisma.questionFolder.findFirst({ where: { name: "Linked list", parentId: medFolder.id } });
  const medIntervals = await prisma.questionFolder.findFirst({ where: { name: "Intervals", parentId: medFolder.id } });
  const medTree = await prisma.questionFolder.findFirst({ where: { name: "Tree", parentId: medFolder.id } });

  if (!easyArray || !easyBinary || !easyHeap || !medString || !medLinkedList || !medIntervals || !medTree) {
    throw new Error("Target subfolders not found");
  }

  async function insertQuestion(folderId: string, q: QuestionData) {
    const cleanedTitle = cleanText(q.title);
    const cleanedDesc = cleanText(q.description);
    const cleanedTags = cleanText(q.tags);

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

    console.log(`Inserted [${q.difficulty}]: ${cleanedTitle}`);
  }

  // -------------------------------------------------------------
  // EASY > ARRAY (6 Questions)
  // -------------------------------------------------------------

  await insertQuestion(easyArray.id, {
    title: "Product of Array Except Self",
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.
You must write an algorithm that runs in O(n) time and without using the division operation.

Input Format:
First line contains integer n, the number of elements.
Second line contains n space-separated integers.

Output Format:
Print the resulting array elements separated by spaces.`,
    difficulty: "EASY",
    tags: "Array, Prefix Sum",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", isPublic: true, weight: 1 },
      { input: "5\n-1 1 0 -3 3", expectedOutput: "0 0 9 0 0", isPublic: true, weight: 1 },
      { input: "2\n2 3", expectedOutput: "3 2", isPublic: false, weight: 1 },
      { input: "3\n0 0 2", expectedOutput: "0 0 0", isPublic: false, weight: 1 },
      { input: "4\n1 -1 1 -1", expectedOutput: "-1 1 -1 1", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "Maximum Product Subarray",
    description: `Given an integer array nums, find a subarray that has the largest product, and return the product.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print the maximum product as an integer.`,
    difficulty: "EASY",
    tags: "Array, Dynamic Programming",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "4\n2 3 -2 4", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "3\n-2 0 -1", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "1\n-3", expectedOutput: "-3", isPublic: false, weight: 1 },
      { input: "4\n-2 3 -4 -1", expectedOutput: "24", isPublic: false, weight: 1 },
      { input: "5\n0 2 0 3 0", expectedOutput: "3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "Find Minimum in Rotated Sorted Array",
    description: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times.
Notice that rotating an array [a[0], a[1], ..., a[n-1]] 1 time results in the array [a[n-1], a[0], a[1], ...].
Given the sorted rotated array nums of unique elements, return the minimum element of this array.
You must write an algorithm that runs in O(log n) time.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print the minimum element in the array.`,
    difficulty: "EASY",
    tags: "Array, Binary Search",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "5\n3 4 5 1 2", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "7\n4 5 6 7 0 1 2", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "4\n11 13 15 17", expectedOutput: "11", isPublic: false, weight: 1 },
      { input: "1\n5", expectedOutput: "5", isPublic: false, weight: 1 },
      { input: "2\n2 1", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "Search in Rotated Sorted Array",
    description: `There is an integer array nums sorted in ascending order with distinct values.
Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.
You must write an algorithm with O(log n) runtime complexity.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.
Third line contains integer target.

Output Format:
Print the zero-based index of target, or -1 if not found.`,
    difficulty: "EASY",
    tags: "Array, Binary Search",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }
    int target;
    scanf("%d", &target);

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "7\n4 5 6 7 0 1 2\n0", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "7\n4 5 6 7 0 1 2\n3", expectedOutput: "-1", isPublic: true, weight: 1 },
      { input: "1\n1\n0", expectedOutput: "-1", isPublic: false, weight: 1 },
      { input: "3\n5 1 3\n5", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "5\n1 2 3 4 5\n4", expectedOutput: "3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "3Sum",
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.
Notice that the solution set must not contain duplicate triplets.
Print each triplet on a new line with elements in non-decreasing order, sorted lexicographically. If no triplets exist, print none.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print each unique triplet on a new line with space-separated numbers, or none if empty.`,
    difficulty: "EASY",
    tags: "Array, Two Pointers, Sorting",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "6\n-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2\n-1 0 1", isPublic: true, weight: 1 },
      { input: "3\n0 1 1", expectedOutput: "none", isPublic: true, weight: 1 },
      { input: "3\n0 0 0", expectedOutput: "0 0 0", isPublic: false, weight: 1 },
      { input: "5\n-2 0 1 1 2", expectedOutput: "-2 0 2\n-2 1 1", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyArray.id, {
    title: "Container With Most Water",
    description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).
Find two lines that together with the x-axis form a container, such that the container contains the most water.
Return the maximum amount of water a container can store.

Input Format:
First line contains integer n.
Second line contains n space-separated integers representing heights.

Output Format:
Print the maximum water area as an integer.`,
    difficulty: "EASY",
    tags: "Array, Two Pointers, Greedy",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] height = new int[n];
        for (int i = 0; i < n; i++) {
            height[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> height(n);
    for (int i = 0; i < n; i++) {
        cin >> height[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *height = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &height[i]);
    }

    // Write your logic here

    free(height);
    return 0;
}`,
    },
    testCases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49", isPublic: true, weight: 1 },
      { input: "2\n1 1", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "4\n4 3 2 14", expectedOutput: "12", isPublic: false, weight: 1 },
      { input: "5\n1 2 1 2 1", expectedOutput: "4", isPublic: false, weight: 1 },
      { input: "3\n2 3 10", expectedOutput: "4", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // EASY > BINARY (1 Question: Sum of Two Integers)
  // -------------------------------------------------------------

  await insertQuestion(easyBinary.id, {
    title: "Sum of Two Integers",
    description: `Given two integers a and b, return the sum of the two integers without using the operators + and -.

Input Format:
A single line containing two space-separated integers a and b.

Output Format:
Print the sum as an integer.`,
    difficulty: "EASY",
    tags: "Binary, Bit Manipulation",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int a = sc.nextInt();
        int b = sc.nextInt();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (!(cin >> a >> b)) return 0;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "1 2", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "2 3", expectedOutput: "5", isPublic: true, weight: 1 },
      { input: "-1 1", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "-5 -7", expectedOutput: "-12", isPublic: false, weight: 1 },
      { input: "0 42", expectedOutput: "42", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // EASY > HEAP (2 Questions: Find Median from Data Stream, Merge K Sorted Lists)
  // -------------------------------------------------------------

  await insertQuestion(easyHeap.id, {
    title: "Find Median from Data Stream",
    description: `The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.
Process a sequence of n numbers inserted one by one. After each insertion, print the current median formatted to 1 decimal place.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print n lines, where each line contains the running median formatted with one decimal place.`,
    difficulty: "EASY",
    tags: "Heap, Priority Queue, Design",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "3\n1 2 3", expectedOutput: "1.0\n1.5\n2.0", isPublic: true, weight: 1 },
      { input: "4\n5 15 1 3", expectedOutput: "5.0\n10.0\n5.0\n4.0", isPublic: true, weight: 1 },
      { input: "1\n10", expectedOutput: "10.0", isPublic: false, weight: 1 },
      { input: "2\n2 8", expectedOutput: "2.0\n5.0", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(easyHeap.id, {
    title: "Merge K Sorted Lists",
    description: `You are given an array of k linked-lists, each linked-list is sorted in ascending order.
Merge all the linked-lists into one sorted linked-list and return it.

Input Format:
First line contains integer k.
Next k lines each begin with integer m (number of elements in that list), followed by m space-separated integers.

Output Format:
Print the merged sorted list elements separated by spaces. If empty, print empty.`,
    difficulty: "EASY",
    tags: "Heap, Priority Queue, Linked List",
    marks: 10,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int k = sc.nextInt();
        List<List<Integer>> lists = new ArrayList<>();
        for (int i = 0; i < k; i++) {
            int m = sc.nextInt();
            List<Integer> list = new ArrayList<>();
            for (int j = 0; j < m; j++) {
                list.add(sc.nextInt());
            }
            lists.add(list);
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int k;
    if (!(cin >> k)) return 0;
    vector<vector<int>> lists(k);
    for (int i = 0; i < k; i++) {
        int m;
        cin >> m;
        lists[i].resize(m);
        for (int j = 0; j < m; j++) {
            cin >> lists[i][j];
        }
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int k;
    if (scanf("%d", &k) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", expectedOutput: "1 1 2 3 4 4 5 6", isPublic: true, weight: 1 },
      { input: "1\n0", expectedOutput: "empty", isPublic: true, weight: 1 },
      { input: "2\n2 2 8\n2 1 9", expectedOutput: "1 2 8 9", isPublic: false, weight: 1 },
      { input: "3\n1 5\n1 1\n1 3", expectedOutput: "1 3 5", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // MEDIUM > STRING (7 Questions)
  // -------------------------------------------------------------

  await insertQuestion(medString.id, {
    title: "Longest Repeating Character Replacement",
    description: `You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.
Return the length of the longest substring containing the same letter you can get after performing the above operations.

Input Format:
First line contains string s consisting of uppercase English letters.
Second line contains integer k.

Output Format:
Print the maximum length of substring with repeating characters.`,
    difficulty: "MEDIUM",
    tags: "String, Sliding Window",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        int k = sc.nextInt();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    int k;
    if (!(cin >> s >> k)) return 0;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100005];
    int k;
    if (scanf("%s %d", s, &k) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "ABAB\n2", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "AABABBA\n1", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "AAAA\n2", expectedOutput: "4", isPublic: false, weight: 1 },
      { input: "ABBB\n2", expectedOutput: "4", isPublic: false, weight: 1 },
      { input: "BAAA\n0", expectedOutput: "3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medString.id, {
    title: "Minimum Window Substring",
    description: `Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return an empty string.

Input Format:
First line contains string s.
Second line contains string t.

Output Format:
Print the minimum window substring, or empty if none exists.`,
    difficulty: "MEDIUM",
    tags: "String, Sliding Window, Hash Table",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String t = sc.next();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100005], t[100005];
    if (scanf("%s %s", s, t) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "ADOBECODEBANC\nABC", expectedOutput: "BANC", isPublic: true, weight: 1 },
      { input: "a\na", expectedOutput: "a", isPublic: true, weight: 1 },
      { input: "a\naa", expectedOutput: "empty", isPublic: false, weight: 1 },
      { input: "ab\nb", expectedOutput: "b", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medString.id, {
    title: "Group Anagrams",
    description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.
Print each group sorted alphabetically on a separate line, with words in each group separated by spaces and sorted alphabetically.

Input Format:
First line contains integer n.
Second line contains n space-separated strings.

Output Format:
Print each group of anagrams on a new line sorted alphabetically.`,
    difficulty: "MEDIUM",
    tags: "String, Hash Table, Sorting",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] strs = new String[n];
        for (int i = 0; i < n; i++) {
            strs[i] = sc.next();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> strs(n);
    for (int i = 0; i < n; i++) {
        cin >> strs[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "6\neat tea tan ate nat bat", expectedOutput: "bat\nnat tan\nate eat tea", isPublic: true, weight: 1 },
      { input: "1\na", expectedOutput: "a", isPublic: true, weight: 1 },
      { input: "2\nab ba", expectedOutput: "ab ba", isPublic: false, weight: 1 },
      { input: "3\na b c", expectedOutput: "a\nb\nc", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medString.id, {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if open brackets are closed by the same type of brackets and closed in the correct order.

Input Format:
A single line containing string s.

Output Format:
Print true if s is valid, otherwise print false.`,
    difficulty: "MEDIUM",
    tags: "String, Stack",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[10005];
    if (scanf("%s", s) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "()", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "()[]{}", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "(]", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "([)]", expectedOutput: "false", isPublic: false, weight: 1 },
      { input: "{[]}", expectedOutput: "true", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medString.id, {
    title: "Longest Palindromic Substring",
    description: `Given a string s, return the longest palindromic substring in s.

Input Format:
A single line containing string s.

Output Format:
Print the longest palindromic substring. If multiple exist with equal length, print the first one.`,
    difficulty: "MEDIUM",
    tags: "String, Dynamic Programming, Two Pointers",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1005];
    if (scanf("%s", s) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "babad", expectedOutput: "bab", isPublic: true, weight: 1 },
      { input: "cbbd", expectedOutput: "bb", isPublic: true, weight: 1 },
      { input: "a", expectedOutput: "a", isPublic: false, weight: 1 },
      { input: "ac", expectedOutput: "a", isPublic: false, weight: 1 },
      { input: "racecar", expectedOutput: "racecar", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medString.id, {
    title: "Palindromic Substrings",
    description: `Given a string s, return the number of palindromic substrings in it.
A string is a palindrome when it reads the same backward as forward.
A substring is a contiguous sequence of characters within the string.

Input Format:
A single line containing string s.

Output Format:
Print the integer count of palindromic substrings.`,
    difficulty: "MEDIUM",
    tags: "String, Dynamic Programming",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1005];
    if (scanf("%s", s) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "abc", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "aaa", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "a", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "aba", expectedOutput: "4", isPublic: false, weight: 1 },
      { input: "abccba", expectedOutput: "9", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medString.id, {
    title: "Encode and Decode Strings",
    description: `Design an algorithm to encode a list of strings to a single string, and decode that string back to the original list of strings.
Input provides n strings. Print the decoded strings, one per line.

Input Format:
First line contains integer n.
Next n lines each contain a string.

Output Format:
Print each decoded string on a separate line.`,
    difficulty: "MEDIUM",
    tags: "String, Design",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        List<String> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            list.add(sc.next());
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> list(n);
    for (int i = 0; i < n; i++) {
        cin >> list[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "2\nlint\ncode", expectedOutput: "lint\ncode", isPublic: true, weight: 1 },
      { input: "4\nwe\nsay\n:\nyes", expectedOutput: "we\nsay\n:\nyes", isPublic: true, weight: 1 },
      { input: "1\nhello", expectedOutput: "hello", isPublic: false, weight: 1 },
      { input: "3\napple\nbanana\norange", expectedOutput: "apple\nbanana\norange", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // MEDIUM > LINKED LIST (3 Questions)
  // -------------------------------------------------------------

  await insertQuestion(medLinkedList.id, {
    title: "Linked List Cycle",
    description: `Given head, the head of a linked list, determine if the linked list has a cycle in it.
There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.
pos is the index of the node that tail's next pointer is connected to (-1 if no cycle).

Input Format:
First line contains integer n (number of nodes) and pos (index of cycle target, or -1).
Second line contains n space-separated node values.

Output Format:
Print true if there is a cycle, otherwise print false.`,
    difficulty: "MEDIUM",
    tags: "Linked List, Two Pointers",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int pos = sc.nextInt();
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) {
            vals[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, pos;
    if (!(cin >> n >> pos)) return 0;
    vector<int> vals(n);
    for (int i = 0; i < n; i++) {
        cin >> vals[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n, pos;
    if (scanf("%d %d", &n, &pos) != 2) return 0;
    int *vals = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &vals[i]);
    }

    // Write your logic here

    free(vals);
    return 0;
}`,
    },
    testCases: [
      { input: "4 1\n3 2 0 -4", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "2 0\n1 2", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "1 -1\n1", expectedOutput: "false", isPublic: false, weight: 1 },
      { input: "3 -1\n1 2 3", expectedOutput: "false", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medLinkedList.id, {
    title: "Remove Nth Node From End of List",
    description: `Given the head of a linked list, remove the nth node from the end of the list and return its head.

Input Format:
First line contains integer total nodes count and integer k (1-indexed from end).
Second line contains space-separated node values.

Output Format:
Print the resulting linked list values separated by spaces. If list becomes empty, print empty.`,
    difficulty: "MEDIUM",
    tags: "Linked List, Two Pointers",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) {
            vals[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    vector<int> vals(n);
    for (int i = 0; i < n; i++) {
        cin >> vals[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;
    int *vals = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &vals[i]);
    }

    // Write your logic here

    free(vals);
    return 0;
}`,
    },
    testCases: [
      { input: "5 2\n1 2 3 4 5", expectedOutput: "1 2 3 5", isPublic: true, weight: 1 },
      { input: "1 1\n1", expectedOutput: "empty", isPublic: true, weight: 1 },
      { input: "2 1\n1 2", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "3 3\n1 2 3", expectedOutput: "2 3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medLinkedList.id, {
    title: "Reorder List",
    description: `You are given the head of a singly linked-list:
L0 -> L1 -> ... -> Ln-1 -> Ln
Reorder the list to be on the following form:
L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...

Input Format:
First line contains integer n.
Second line contains n space-separated node values.

Output Format:
Print the reordered linked list values separated by spaces.`,
    difficulty: "MEDIUM",
    tags: "Linked List, Two Pointers, Stack",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) {
            vals[i] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> vals(n);
    for (int i = 0; i < n; i++) {
        cin >> vals[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *vals = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &vals[i]);
    }

    // Write your logic here

    free(vals);
    return 0;
}`,
    },
    testCases: [
      { input: "4\n1 2 3 4", expectedOutput: "1 4 2 3", isPublic: true, weight: 1 },
      { input: "5\n1 2 3 4 5", expectedOutput: "1 5 2 4 3", isPublic: true, weight: 1 },
      { input: "1\n10", expectedOutput: "10", isPublic: false, weight: 1 },
      { input: "2\n1 2", expectedOutput: "1 2", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // MEDIUM > INTERVALS (4 Questions)
  // -------------------------------------------------------------

  await insertQuestion(medIntervals.id, {
    title: "Insert Interval",
    description: `You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] sorted in ascending order by starti.
You are also given an interval newInterval = [start, end].
Insert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals (merge overlapping intervals if necessary).

Input Format:
First line contains integer n (number of existing intervals).
Next n lines each contain two space-separated integers representing an interval.
Last line contains two integers representing newInterval.

Output Format:
Print each merged interval on a new line with start and end separated by space.`,
    difficulty: "MEDIUM",
    tags: "Intervals, Array",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
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
        int newStart = sc.nextInt();
        int newEnd = sc.nextInt();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (int i = 0; i < n; i++) {
        cin >> intervals[i][0] >> intervals[i][1];
    }
    int newStart, newEnd;
    cin >> newStart >> newEnd;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "2\n1 3\n6 9\n2 5", expectedOutput: "1 5\n6 9", isPublic: true, weight: 1 },
      { input: "5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8", expectedOutput: "1 2\n3 10\n12 16", isPublic: true, weight: 1 },
      { input: "0\n5 7", expectedOutput: "5 7", isPublic: false, weight: 1 },
      { input: "1\n1 5\n2 3", expectedOutput: "1 5", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medIntervals.id, {
    title: "Non-overlapping Intervals",
    description: `Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.

Input Format:
First line contains integer n.
Next n lines each contain two space-separated integers start and end.

Output Format:
Print the minimum number of removed intervals as an integer.`,
    difficulty: "MEDIUM",
    tags: "Intervals, Greedy, Sorting",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
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

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (int i = 0; i < n; i++) {
        cin >> intervals[i][0] >> intervals[i][1];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "4\n1 2\n2 3\n3 4\n1 3", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "3\n1 2\n1 2\n1 2", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "2\n1 2\n2 3", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "3\n1 10\n2 3\n3 4", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medIntervals.id, {
    title: "Meeting Rooms",
    description: `Given an array of meeting time intervals consisting of start and end times [[s1,e1],[s2,e2],...], determine if a person could attend all meetings.

Input Format:
First line contains integer n.
Next n lines each contain two space-separated integers start and end.

Output Format:
Print true if the person can attend all meetings, otherwise print false.`,
    difficulty: "MEDIUM",
    tags: "Intervals, Sorting",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
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

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (int i = 0; i < n; i++) {
        cin >> intervals[i][0] >> intervals[i][1];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "3\n0 30\n5 10\n15 20", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "2\n7 10\n2 4", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "1\n1 5", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "3\n1 4\n4 5\n5 8", expectedOutput: "true", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medIntervals.id, {
    title: "Meeting Rooms II",
    description: `Given an array of meeting time intervals consisting of start and end times [[s1,e1],[s2,e2],...], find the minimum number of conference rooms required.

Input Format:
First line contains integer n.
Next n lines each contain two space-separated integers start and end.

Output Format:
Print the minimum number of conference rooms required as an integer.`,
    difficulty: "MEDIUM",
    tags: "Intervals, Heap, Greedy",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
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

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (int i = 0; i < n; i++) {
        cin >> intervals[i][0] >> intervals[i][1];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "3\n0 30\n5 10\n15 20", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "2\n7 10\n2 4", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "3\n1 5\n2 6\n3 7", expectedOutput: "3", isPublic: false, weight: 1 },
      { input: "1\n5 10", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // MEDIUM > TREE (1 Question: Invert Binary Tree)
  // -------------------------------------------------------------

  await insertQuestion(medTree.id, {
    title: "Invert Binary Tree",
    description: `Given the root of a binary tree, invert the tree, and return its root.
Tree is represented in level order traversal using null for missing nodes.

Input Format:
First line contains integer n (number of nodes in level order representation).
Second line contains n space-separated tokens representing node values or null.

Output Format:
Print the inverted tree in level order separated by spaces (trim trailing nulls).`,
    difficulty: "MEDIUM",
    tags: "Tree, Binary Tree, BFS, DFS",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] nodes = new String[n];
        for (int i = 0; i < n; i++) {
            nodes[i] = sc.next();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> nodes(n);
    for (int i = 0; i < n; i++) {
        cin >> nodes[i];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "7\n4 2 7 1 3 6 9", expectedOutput: "4 7 2 9 6 3 1", isPublic: true, weight: 1 },
      { input: "3\n2 1 3", expectedOutput: "2 3 1", isPublic: true, weight: 1 },
      { input: "1\n1", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  console.log("Blind 75 Part 3 Seed completed successfully!");
}

seedBlind75Part3()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
