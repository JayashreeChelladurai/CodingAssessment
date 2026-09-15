import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("================================================================================");
  console.log("   🚀 GENERATING ASSESSMENT 'Test2' (LeetCode 350 & 136)                        ");
  console.log("================================================================================");

  const existing = await prisma.assessment.findUnique({
    where: { code: "TEST2" },
  });

  if (existing) {
    console.log("⚠️ Assessment with code 'TEST2' already exists. Re-creating fresh...");
    await prisma.assessment.delete({ where: { code: "TEST2" } });
  }

  // 1. Create Assessment Test2
  const assessment = await prisma.assessment.create({
    data: {
      title: "Test2",
      code: "TEST2",
      description: "Coding assessment featuring LeetCode 350 (Intersection of Two Arrays II) and LeetCode 136 (Single Number).",
      durationMinutes: 60,
      startTime: new Date(),
      endTime: null,
      shuffleQuestions: false,
      requireSeb: false,
      sebQuitPassword: "exit123",
      isReviewUnlocked: false,
    },
  });

  // 2. Create Section
  const section = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section A: Algorithmic Challenges",
      description: "Solve algorithmic programming problems in Java, C, or C++ with automated test evaluation.",
      order: 0,
    },
  });

  // 3. Question 1: LeetCode 350 - Intersection of Two Arrays II
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Intersection of Two Arrays II (LeetCode 350)",
      description: `### Problem Statement
Given two integer arrays \`nums1\` and \`nums2\`, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays.

To ensure deterministic evaluation, please print the elements of the intersection sorted in **non-decreasing (ascending) order**, separated by spaces. If there is no intersection, print an empty line.

---

### Input Format
- **Line 1**: An integer \`n\` ($1 \\le n \\le 10,000$), the size of the first array \`nums1\`.
- **Line 2**: \`n\` space-separated integers representing \`nums1\`.
- **Line 3**: An integer \`m\` ($1 \\le m \\le 10,000$), the size of the second array \`nums2\`.
- **Line 4**: \`m\` space-separated integers representing \`nums2\`.

### Output Format
- Print the elements of the intersection in non-decreasing order separated by a single space. If no elements intersect, output nothing or a blank line.

### Constraints
- $1 \\le n, m \\le 10,000$
- $-10^9 \\le \\text{nums1}[i], \\text{nums2}[j] \\le 10^9$

---

### Example & Detailed Test Case Explanation

**Sample Input:**
\`\`\`text
4
1 2 2 1
2
2 2
\`\`\`

**Sample Output:**
\`\`\`text
2 2
\`\`\`

**Step-by-Step Explanation:**
- In \`nums1 = [1, 2, 2, 1]\`, the frequencies are: \`1\` appears 2 times, \`2\` appears 2 times.
- In \`nums2 = [2, 2]\`, the frequencies are: \`2\` appears 2 times.
- The intersection frequency for each number is $\\min(\\text{count in } nums1, \\text{count in } nums2)$:
  - For element \`1\`: $\\min(2, 0) = 0$
  - For element \`2\`: $\\min(2, 2) = 2$
- Result is \`[2, 2]\`. Sorted in non-decreasing order: \`2 2\`.`,
      marks: 50,
      order: 0,
      allowedLanguages: "JAVA,C,CPP",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums1 = new int[n];
        for (int i = 0; i < n; i++) {
            nums1[i] = sc.nextInt();
        }
        int m = sc.nextInt();
        int[] nums2 = new int[m];
        for (int i = 0; i < m; i++) {
            nums2[i] = sc.nextInt();
        }

        // TODO: Find the intersection of nums1 and nums2, sort in non-decreasing order, and print space-separated

    }
}`,
        C: `#include <stdio.h>
#include <stdlib.h>

int compare(const void *a, const void *b) {
    return (*(int *)a - *(int *)b);
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums1 = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums1[i]);
    }
    int m;
    if (scanf("%d", &m) != 1) return 0;
    int *nums2 = (int *)malloc(m * sizeof(int));
    for (int i = 0; i < m; i++) {
        scanf("%d", &nums2[i]);
    }

    // TODO: Find the intersection of nums1 and nums2, sort in non-decreasing order, and print space-separated

    free(nums1);
    free(nums2);
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
#include <algorithm>
#include <unordered_map>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums1(n);
    for (int i = 0; i < n; i++) {
        cin >> nums1[i];
    }
    int m;
    if (!(cin >> m)) return 0;
    vector<int> nums2(m);
    for (int i = 0; i < m; i++) {
        cin >> nums2[i];
    }

    // TODO: Find the intersection of nums1 and nums2, sort in non-decreasing order, and print space-separated

    return 0;
}`,
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "4\n1 2 2 1\n2\n2 2", expectedOutput: "2 2", isPublic: true, weight: 1.0, order: 0 },
          { input: "3\n4 9 5\n5\n9 4 9 8 4", expectedOutput: "4 9", isPublic: true, weight: 1.0, order: 1 },
          { input: "5\n1 2 3 4 5\n3\n3 4 5", expectedOutput: "3 4 5", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "3\n1 2 3\n3\n4 5 6", expectedOutput: "", isPublic: false, weight: 1.0, order: 3 },
          { input: "1\n1\n1\n1", expectedOutput: "1", isPublic: false, weight: 1.0, order: 4 },
          { input: "4\n1 1 1 1\n2\n1 1", expectedOutput: "1 1", isPublic: false, weight: 1.0, order: 5 },
          { input: "5\n10 20 30 40 50\n5\n50 40 30 20 10", expectedOutput: "10 20 30 40 50", isPublic: false, weight: 1.0, order: 6 },
          { input: "6\n3 1 2 3 1 2\n4\n1 1 2 2", expectedOutput: "1 1 2 2", isPublic: false, weight: 1.0, order: 7 },
          { input: "6\n1 2 2 3 3 3\n5\n2 2 3 3 4", expectedOutput: "2 2 3 3", isPublic: false, weight: 1.0, order: 8 },
          { input: "8\n100 200 100 300 400 100 200 500\n6\n100 100 200 600 700 800", expectedOutput: "100 100 200", isPublic: false, weight: 1.0, order: 9 },
        ],
      },
    },
  });

  // 4. Question 2: LeetCode 136 - Single Number
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Single Number (LeetCode 136)",
      description: `### Problem Statement
Given a non-empty array of integers \`nums\`, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity $O(n)$ and use only constant extra space $O(1)$ (Hint: Bitwise XOR operation).

---

### Input Format
- **Line 1**: An integer \`n\` ($1 \\le n \\le 30,000$), representing the number of elements in the array (guaranteed to be odd).
- **Line 2**: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the element that appears exactly once.

### Constraints
- $1 \\le n \\le 30,000$ ($n$ is odd)
- $-30,000 \\le \\text{nums}[i] \\le 30,000$
- Each element in the array appears twice except for one element which appears only once.

---

### Example & Detailed Test Case Explanation

**Sample Input:**
\`\`\`text
5
4 1 2 1 2
\`\`\`

**Sample Output:**
\`\`\`text
4
\`\`\`

**Step-by-Step Explanation:**
Using the XOR bitwise property ($a \\oplus a = 0$ and $a \\oplus 0 = a$):
- Start with $\\text{result} = 0$.
- $\\text{result} = 0 \\oplus 4 = 4$
- $\\text{result} = 4 \\oplus 1 = 5$
- $\\text{result} = 5 \\oplus 2 = 7$
- $\\text{result} = 7 \\oplus 1 = 6$ (since $1 \\oplus 1 = 0$)
- $\\text{result} = 6 \\oplus 2 = 4$ (since $2 \\oplus 2 = 0$)

The duplicates cancel each other out, leaving only the unique element **\`4\`**.`,
      marks: 50,
      order: 1,
      allowedLanguages: "JAVA,C,CPP",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
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

        // TODO: Find the element that appears only once and print it

    }
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

    // TODO: Find the element that appears only once and print it

    free(nums);
    return 0;
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

    // TODO: Find the element that appears only once and print it

    return 0;
}`,
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "3\n2 2 1", expectedOutput: "1", isPublic: true, weight: 1.0, order: 0 },
          { input: "5\n4 1 2 1 2", expectedOutput: "4", isPublic: true, weight: 1.0, order: 1 },
          { input: "1\n1", expectedOutput: "1", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "3\n-1 -1 -2", expectedOutput: "-2", isPublic: false, weight: 1.0, order: 3 },
          { input: "5\n10 20 10 30 20", expectedOutput: "30", isPublic: false, weight: 1.0, order: 4 },
          { input: "7\n1 3 1 -1 3 -1 99", expectedOutput: "99", isPublic: false, weight: 1.0, order: 5 },
          { input: "7\n0 1 2 0 1 2 7", expectedOutput: "7", isPublic: false, weight: 1.0, order: 6 },
          { input: "9\n1000 2000 3000 4000 5000 4000 3000 2000 1000", expectedOutput: "5000", isPublic: false, weight: 1.0, order: 7 },
          { input: "5\n-100 50 -100 50 0", expectedOutput: "0", isPublic: false, weight: 1.0, order: 8 },
          { input: "11\n9 8 7 6 5 4 5 6 7 8 9", expectedOutput: "4", isPublic: false, weight: 1.0, order: 9 },
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
  console.log(`   - Total Questions: ${fullAssessment?.sections[0].questions.length}`);
  for (const q of fullAssessment?.sections[0].questions || []) {
    const openCount = q.testCases.filter((tc) => tc.isPublic).length;
    const closedCount = q.testCases.filter((tc) => !tc.isPublic).length;
    console.log(`     * ${q.title} (${q.marks} Marks): ${openCount} Open + ${closedCount} Closed = ${q.testCases.length} Testcases`);
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
