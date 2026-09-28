import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("================================================================================");
  console.log("   🚀 GENERATING ASSESSMENT 'test1' WITH 10 TESTCASES & DETAILED EXPLANATIONS   ");
  console.log("================================================================================");

  const existing = await prisma.assessment.findUnique({
    where: { code: "TEST1" },
  });

  if (existing) {
    console.log("⚠️ Assessment with code 'TEST1' already exists. Re-creating fresh...");
    await prisma.assessment.delete({ where: { code: "TEST1" } });
  }

  // 1. Create Assessment
  const assessment = await prisma.assessment.create({
    data: {
      title: "test1",
      code: "TEST1",
      description: "Comprehensive 2-problem coding assessment featuring Trapping Rain Water and Binary to Decimal conversion.",
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

  // 3. Question 1: Trapping Rain Water
  const q1 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Trapping Rain Water",
      description: `### Problem Statement
Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

---

### Input Format
- The first line contains an integer \`n\` ($n \\ge 0$), representing the number of elevation bars.
- The second line contains \`n\` space-separated non-negative integers representing the height of each bar.

### Output Format
- Print a single integer representing the total units of trapped rainwater.

### Constraints
- $0 \\le n \\le 20,000$
- $0 \\le \\text{height}[i] \\le 100,000$

---

### Example & Detailed Test Case Explanation

**Sample Input:**
\`\`\`text
12
0 1 0 2 1 0 1 3 2 1 2 1
\`\`\`

**Sample Output:**
\`\`\`text
6
\`\`\`

**Step-by-Step Explanation:**
The elevation map is represented by the array \`[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]\`.
Water trapped at any index \`i\` is determined by:
$$\\text{water}[i] = \\max(0, \\min(\\text{left\\_max}[i], \\text{right\\_max}[i]) - \\text{height}[i])$$

1. **Index 0 (height 0)**: $\\text{left\\_max}=0, \\text{right\\_max}=3 \\implies \\min(0, 3) - 0 = 0$ units
2. **Index 1 (height 1)**: $\\text{left\\_max}=1, \\text{right\\_max}=3 \\implies \\min(1, 3) - 1 = 0$ units
3. **Index 2 (height 0)**: $\\text{left\\_max}=1, \\text{right\\_max}=3 \\implies \\min(1, 3) - 0 = 1$ unit
4. **Index 3 (height 2)**: $\\text{left\\_max}=2, \\text{right\\_max}=3 \\implies \\min(2, 3) - 2 = 0$ units
5. **Index 4 (height 1)**: $\\text{left\\_max}=2, \\text{right\\_max}=3 \\implies \\min(2, 3) - 1 = 1$ unit
6. **Index 5 (height 0)**: $\\text{left\\_max}=2, \\text{right\\_max}=3 \\implies \\min(2, 3) - 0 = 2$ units
7. **Index 6 (height 1)**: $\\text{left\\_max}=2, \\text{right\\_max}=3 \\implies \\min(2, 3) - 1 = 1$ unit
8. **Index 7 (height 3)**: $\\text{left\\_max}=3, \\text{right\\_max}=2 \\implies \\min(3, 2) - 3 = 0$ units
9. **Index 8 (height 2)**: $\\text{left\\_max}=3, \\text{right\\_max}=2 \\implies \\min(3, 2) - 2 = 0$ units
10. **Index 9 (height 1)**: $\\text{left\\_max}=3, \\text{right\\_max}=2 \\implies \\min(3, 2) - 1 = 1$ unit
11. **Index 10 (height 2)**: $\\text{left\\_max}=3, \\text{right\\_max}=2 \\implies \\min(3, 2) - 2 = 0$ units
12. **Index 11 (height 1)**: $\\text{left\\_max}=3, \\text{right\\_max}=1 \\implies \\min(3, 1) - 1 = 0$ units

**Total Water Trapped** = $0 + 0 + 1 + 0 + 1 + 2 + 1 + 0 + 0 + 1 + 0 + 0 = 6$ units.`,
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
        if (!sc.hasNextInt()) {
            System.out.println(0);
            return;
        }
        int n = sc.nextInt();
        int[] height = new int[n];
        for (int i = 0; i < n; i++) {
            height[i] = sc.nextInt();
        }

        // TODO: Compute and print the total trapped rainwater

    }
}`,
        C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("0\\n");
        return 0;
    }
    int *height = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &height[i]);
    }

    // TODO: Compute and print the total trapped rainwater

    free(height);
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << endl;
        return 0;
    }
    vector<int> height(n);
    for (int i = 0; i < n; i++) {
        cin >> height[i];
    }

    // TODO: Compute and print the total trapped rainwater

    return 0;
}`,
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6", isPublic: true, weight: 1.0, order: 0 },
          { input: "6\n4 2 0 3 2 5", expectedOutput: "9", isPublic: true, weight: 1.0, order: 1 },
          { input: "5\n3 0 2 0 4", expectedOutput: "7", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "0", expectedOutput: "0", isPublic: false, weight: 1.0, order: 3 },
          { input: "3\n1 2 3", expectedOutput: "0", isPublic: false, weight: 1.0, order: 4 },
          { input: "4\n4 3 2 1", expectedOutput: "0", isPublic: false, weight: 1.0, order: 5 },
          { input: "5\n2 0 0 0 2", expectedOutput: "6", isPublic: false, weight: 1.0, order: 6 },
          { input: "6\n5 1 2 1 2 5", expectedOutput: "14", isPublic: false, weight: 1.0, order: 7 },
          { input: "8\n0 2 0 4 0 3 0 1", expectedOutput: "5", isPublic: false, weight: 1.0, order: 8 },
          { input: "10\n10 0 5 0 8 0 3 0 7 0", expectedOutput: "27", isPublic: false, weight: 1.0, order: 9 },
        ],
      },
    },
  });

  // 4. Question 2: Binary to Decimal
  const q2 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Binary to Decimal",
      description: `### Problem Statement
Given a string \`s\` representing a non-empty unsigned binary number (containing only digits \`'0'\` and \`'1'\`), convert this binary representation into its corresponding base-10 decimal integer value.

---

### Input Format
- A single line containing the binary string \`s\`.

### Output Format
- Print a single integer representing the base-10 decimal equivalent of \`s\`.

### Constraints
- $1 \\le \\text{length}(s) \\le 60$
- \`s\` consists exclusively of characters \`'0'\` and \`'1'\`.
- The result fits inside a 64-bit integer (\`long\` in Java, \`long long\` in C/C++).

---

### Example & Detailed Test Case Explanation

**Sample Input:**
\`\`\`text
1101
\`\`\`

**Sample Output:**
\`\`\`text
13
\`\`\`

**Step-by-Step Explanation:**
The binary string is \`1101\`. Each bit represents a power of 2 evaluated from right to left (index $0$ to $k-1$ from LSB):
- **Bit 0** (rightmost \`'1'\`): $1 \\times 2^0 = 1 \\times 1 = 1$
- **Bit 1** (\`'0'\`): $0 \\times 2^1 = 0 \\times 2 = 0$
- **Bit 2** (\`'1'\`): $1 \\times 2^2 = 1 \\times 4 = 4$
- **Bit 3** (leftmost \`'1'\`): $1 \\times 2^3 = 1 \\times 8 = 8$

Summing all contributions:
$$\\text{Decimal Value} = 8 + 4 + 0 + 1 = 13$$`,
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
        if (!sc.hasNext()) return;
        String s = sc.next().trim();

        // TODO: Convert the binary string 's' to decimal and print the result

    }
}`,
        C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    if (scanf("%99s", s) != 1) return 0;

    // TODO: Convert the binary string 's' to decimal and print the result

    return 0;
}`,
        CPP: `#include <iostream>
#include <string>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Convert the binary string 's' to decimal and print the result

    return 0;
}`,
      }),
      testCases: {
        create: [
          // 3 Open (Public) Test Cases
          { input: "1101", expectedOutput: "13", isPublic: true, weight: 1.0, order: 0 },
          { input: "1010", expectedOutput: "10", isPublic: true, weight: 1.0, order: 1 },
          { input: "1111", expectedOutput: "15", isPublic: true, weight: 1.0, order: 2 },
          // 7 Closed (Hidden) Test Cases
          { input: "0", expectedOutput: "0", isPublic: false, weight: 1.0, order: 3 },
          { input: "1", expectedOutput: "1", isPublic: false, weight: 1.0, order: 4 },
          { input: "100000", expectedOutput: "32", isPublic: false, weight: 1.0, order: 5 },
          { input: "11111111", expectedOutput: "255", isPublic: false, weight: 1.0, order: 6 },
          { input: "1010101010", expectedOutput: "682", isPublic: false, weight: 1.0, order: 7 },
          { input: "1100100", expectedOutput: "100", isPublic: false, weight: 1.0, order: 8 },
          { input: "10000000000000000000000000000000", expectedOutput: "2147483648", isPublic: false, weight: 1.0, order: 9 },
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
