import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with Hybrid Assessment (MCQs + Coding in Java, C, C++)...");

  // Clean old sample data
  await prisma.assessment.deleteMany({ where: { code: "JAVA-DEMO-101" } });

  // 1. Create Assessment
  const assessment = await prisma.assessment.create({
    data: {
      title: "Data Structures & Programming Exam (Java / C / C++)",
      description: "Institutional Proctored Examination. Section A consists of Multiple Choice Questions with negative marking. Section B consists of hands-on coding problems in Java, C, or C++ evaluated against open and hidden test cases.",
      code: "JAVA-DEMO-101",
      durationMinutes: 60,
      shuffleQuestions: true,
      requireSeb: true,
      sebQuitPassword: "exit123",
      isReviewUnlocked: false,
    },
  });

  // 2. Create Section A: MCQs
  const sectionA = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section A: Multiple Choice Questions",
      description: "Conceptual questions and code output predictions. Each correct answer carries +2 marks. Incorrect answers carry -0.5 negative marks.",
      order: 0,
    },
  });

  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sectionA.id,
      type: "MCQ",
      title: "Q1: Java String Immutability & Memory Pool",
      description: `What will be the output of the following Java snippet?

\`\`\`java
String s1 = "Hello";
String s2 = new String("Hello");
String s3 = s2.intern();

System.out.println((s1 == s2) + " " + (s1 == s3));
\`\`\`
`,
      marks: 2.0,
      negativeMarks: 0.5,
      order: 0,
      mcqType: "SINGLE",
      options: JSON.stringify([
        { id: "opt-1", text: "true true" },
        { id: "opt-2", text: "false true" },
        { id: "opt-3", text: "false false" },
        { id: "opt-4", text: "true false" },
      ]),
      correctAnswers: JSON.stringify(["opt-2"]),
      explanation: "s1 refers to the String Pool literal. s2 is a newly created heap object, so (s1 == s2) is false. s2.intern() returns the pooled instance (which is s1), so (s1 == s3) is true.",
    },
  });

  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sectionA.id,
      type: "MCQ",
      title: "Q2: Pointer Arithmetic & Array Indexing in C",
      description: `Consider the following C program:

\`\`\`c
#include <stdio.h>
int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *ptr = arr;
    printf("%d", *(ptr + 3) - *ptr);
    return 0;
}
\`\`\`
What is the printed output?`,
      marks: 2.0,
      negativeMarks: 0.5,
      order: 1,
      mcqType: "SINGLE",
      options: JSON.stringify([
        { id: "opt-1", text: "30" },
        { id: "opt-2", text: "40" },
        { id: "opt-3", text: "20" },
        { id: "opt-4", text: "50" },
      ]),
      correctAnswers: JSON.stringify(["opt-1"]),
      explanation: "*(ptr + 3) evaluates to arr[3] which is 40. *ptr evaluates to arr[0] which is 10. 40 - 10 = 30.",
    },
  });

  // 3. Create Section B: Coding Problems
  const sectionB = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section B: Hands-on Programming Problems",
      description: "Solve the algorithmic problems in your choice of language (Java, C, or C++). Read input from stdin and print to stdout.",
      order: 1,
    },
  });

  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sectionB.id,
      type: "CODING",
      title: "Problem 1: Target Pair Sum Detection",
      description: `### Problem Description
Given an integer array and a target value, determine if there exists a pair of distinct elements in the array whose sum equals the target.

### Input Format
- First line contains an integer **N** (number of elements).
- Second line contains **N** space-separated integers.
- Third line contains an integer **Target**.

### Output Format
- Print \`YES\` if a valid pair exists, otherwise print \`NO\`.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^9 \\le \\text{elements}, \\text{Target} \\le 10^9$`,
      marks: 48.0,
      order: 0,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      allowedLanguages: "JAVA,C,CPP",
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int target = sc.nextInt();

        boolean found = false;
        HashSet<Integer> seen = new HashSet<>();
        for (int x : arr) {
            if (seen.contains(target - x)) {
                found = true;
                break;
            }
            seen.add(x);
        }

        System.out.println(found ? "YES" : "NO");
    }
}
`,
        C: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    int target;
    scanf("%d", &target);

    bool found = false;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] + arr[j] == target) {
                found = true;
                break;
            }
        }
        if (found) break;
    }

    printf("%s\\n", found ? "YES" : "NO");
    free(arr);
    return 0;
}
`,
        CPP: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    int target;
    cin >> target;

    unordered_set<int> seen;
    bool found = false;
    for (int x : arr) {
        if (seen.count(target - x)) {
            found = true;
            break;
        }
        seen.insert(x);
    }

    cout << (found ? "YES" : "NO") << endl;
    return 0;
}
`,
      }),
      starterCode: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Java solution\n    }\n}\n`,
      testCases: {
        create: [
          {
            input: "4\n2 7 11 15\n9",
            expectedOutput: "YES",
            isPublic: true,
            weight: 1.0,
            order: 0,
          },
          {
            input: "3\n1 2 3\n7",
            expectedOutput: "NO",
            isPublic: true,
            weight: 1.0,
            order: 1,
          },
          {
            input: "5\n10 20 30 40 50\n70",
            expectedOutput: "YES",
            isPublic: false,
            weight: 1.5,
            order: 2,
          },
          {
            input: "6\n-5 -2 0 3 8 12\n1",
            expectedOutput: "YES",
            isPublic: false,
            weight: 1.5,
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sectionB.id,
      type: "CODING",
      title: "Problem 2: Palindrome String Checker",
      description: `### Problem Description
A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

### Input Format
- A single line containing string **S**.

### Output Format
- Print \`true\` if it is a palindrome, otherwise \`false\`.`,
      marks: 48.0,
      order: 1,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      allowedLanguages: "JAVA,C,CPP",
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) {
            System.out.println("true");
            return;
        }
        String s = sc.nextLine();
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) {
                sb.append(Character.toLowerCase(c));
            }
        }
        String clean = sb.toString();
        String rev = sb.reverse().toString();
        System.out.println(clean.equals(rev) ? "true" : "false");
    }
}
`,
        C: `#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

int main() {
    char s[1000];
    if (!fgets(s, sizeof(s), stdin)) {
        printf("true\\n");
        return 0;
    }
    int l = 0, r = strlen(s) - 1;
    bool isPal = true;
    while (l < r) {
        while (l < r && !isalnum((unsigned char)s[l])) l++;
        while (l < r && !isalnum((unsigned char)s[r])) r--;
        if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) {
            isPal = false;
            break;
        }
        l++;
        r--;
    }
    printf("%s\\n", isPal ? "true" : "false");
    return 0;
}
`,
        CPP: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) {
        cout << "true" << endl;
        return 0;
    }
    int l = 0, r = (int)s.length() - 1;
    bool isPal = true;
    while (l < r) {
        while (l < r && !isalnum(s[l])) l++;
        while (l < r && !isalnum(s[r])) r--;
        if (tolower(s[l]) != tolower(s[r])) {
            isPal = false;
            break;
        }
        l++;
        r--;
    }
    cout << (isPal ? "true" : "false") << endl;
    return 0;
}
`,
      }),
      starterCode: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Java solution\n    }\n}\n`,
      testCases: {
        create: [
          {
            input: "A man, a plan, a canal: Panama",
            expectedOutput: "true",
            isPublic: true,
            weight: 1.0,
            order: 0,
          },
          {
            input: "race a car",
            expectedOutput: "false",
            isPublic: true,
            weight: 1.0,
            order: 1,
          },
          {
            input: "0P",
            expectedOutput: "false",
            isPublic: false,
            weight: 1.5,
            order: 2,
          },
          {
            input: "Was it a car or a cat I saw?",
            expectedOutput: "true",
            isPublic: false,
            weight: 1.5,
            order: 3,
          },
        ],
      },
    },
  });

  console.log(`✅ Hybrid assessment created with Code: ${assessment.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
