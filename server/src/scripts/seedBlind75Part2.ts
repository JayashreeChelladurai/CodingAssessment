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

export async function seedBlind75Part2() {
  console.log("Starting Blind 75 Part 2 Seed...");

  // Lookup existing folders
  const codingRoot = await prisma.questionFolder.findFirst({ where: { name: "Coding", parentId: null } });
  if (!codingRoot) throw new Error("Coding root folder not found");

  const easyFolder = await prisma.questionFolder.findFirst({ where: { name: "Easy", parentId: codingRoot.id } });
  const medFolder = await prisma.questionFolder.findFirst({ where: { name: "Medium", parentId: codingRoot.id } });
  const hardFolder = await prisma.questionFolder.findFirst({ where: { name: "Hard", parentId: codingRoot.id } });

  if (!easyFolder || !medFolder || !hardFolder) throw new Error("Difficulty folders not found");

  const easyBinary = await prisma.questionFolder.findFirst({ where: { name: "Binary", parentId: easyFolder.id } });
  const easyHeap = await prisma.questionFolder.findFirst({ where: { name: "Heap", parentId: easyFolder.id } });

  const medString = await prisma.questionFolder.findFirst({ where: { name: "String", parentId: medFolder.id } });
  const medLinkedList = await prisma.questionFolder.findFirst({ where: { name: "Linked list", parentId: medFolder.id } });
  const medIntervals = await prisma.questionFolder.findFirst({ where: { name: "Intervals", parentId: medFolder.id } });
  const medTree = await prisma.questionFolder.findFirst({ where: { name: "Tree", parentId: medFolder.id } });

  const hardDP = await prisma.questionFolder.findFirst({ where: { name: "DP", parentId: hardFolder.id } });
  const hardGraph = await prisma.questionFolder.findFirst({ where: { name: "Graph", parentId: hardFolder.id } });
  const hardMatrix = await prisma.questionFolder.findFirst({ where: { name: "Matrix", parentId: hardFolder.id } });

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

    console.log(`Inserted [${q.difficulty}] ${cleanedTitle} (${q.testCases.length} test cases)`);
  }

  // -------------------------------------------------------------
  // Easy / Binary: Reverse Bits
  // -------------------------------------------------------------
  if (easyBinary) {
    await insertQuestion(easyBinary.id, {
      title: "Reverse Bits",
      difficulty: "EASY",
      tags: "Divide and Conquer, Bit Manipulation",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
Reverse bits of a given 32 bits unsigned integer.

Input Format:
A single non-negative integer n.

Output Format:
Print the integer value obtained after reversing the 32 bits of n.

Example 1:
Input:
43261596
Output:
964176192
Explanation: The input binary string 00000010100101000001111010011100 in reversed order is 00111001011110000010100101000000 which represents 964176192.

Example 2:
Input:
1
Output:
2147483648

Constraints:
The input integer is a 32-bit unsigned integer.`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLong()) return;
        long n = sc.nextLong();
        long rev = 0;
        for (int i = 0; i < 32; i++) {
            rev = (rev << 1) | (n & 1);
            n >>= 1;
        }
        System.out.println(rev);
    }
}`,
        C: `#include <stdio.h>

int main() {
    unsigned int n;
    if (scanf("%u", &n) != 1) return 0;
    unsigned int rev = 0;
    for (int i = 0; i < 32; i++) {
        rev = (rev << 1) | (n & 1);
        n >>= 1;
    }
    printf("%u\n", rev);
    return 0;
}`,
        CPP: `#include <iostream>
using namespace std;

int main() {
    unsigned int n;
    if (!(cin >> n)) return 0;
    unsigned int rev = 0;
    for (int i = 0; i < 32; i++) {
        rev = (rev << 1) | (n & 1);
        n >>= 1;
    }
    cout << rev << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "43261596", expectedOutput: "964176192", isPublic: true, weight: 1 },
        { input: "1", expectedOutput: "2147483648", isPublic: true, weight: 1 },
        { input: "0", expectedOutput: "0", isPublic: false, weight: 1 },
        { input: "2147483648", expectedOutput: "1", isPublic: false, weight: 1 },
        { input: "4294967295", expectedOutput: "4294967295", isPublic: false, weight: 1 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Easy / Heap: Top K Frequent Elements
  // -------------------------------------------------------------
  if (easyHeap) {
    await insertQuestion(easyHeap.id, {
      title: "Top K Frequent Elements",
      difficulty: "EASY",
      tags: "Array, Hash Table, Divide and Conquer, Sorting, Heap, Bucket Sort",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
Given an integer array nums and an integer k, return the k most frequent elements.
You can return the answer in any order.

Input Format:
Line 1: An integer n representing array length.
Line 2: n space-separated integers representing nums.
Line 3: An integer k.

Output Format:
Print the k most frequent integers separated by space, ordered from highest frequency to lowest frequency.

Example 1:
Input:
6
1 1 1 2 2 3
2
Output:
1 2

Example 2:
Input:
1
1
1
Output:
1

Constraints:
1 <= nums.length <= 100000
k is in the range [1, the number of unique elements in the array].
It is guaranteed that the answer is unique.`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Map<Integer, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            count.put(x, count.getOrDefault(x, 0) + 1);
        }
        int k = sc.nextInt();

        PriorityQueue<Map.Entry<Integer, Integer>> pq = new PriorityQueue<>(
            (a, b) -> a.getValue().equals(b.getValue()) ? Integer.compare(b.getKey(), a.getKey()) : Integer.compare(b.getValue(), a.getValue())
        );
        pq.addAll(count.entrySet());

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < k; i++) {
            if (i > 0) sb.append(" ");
            sb.append(pq.poll().getKey());
        }
        System.out.println(sb.toString());
    }
}`,
        C: `#include <stdio.h>
#include <stdlib.h>

typedef struct { int val, freq; } Item;

int cmp(const void *a, const void *b) {
    Item *x = (Item*)a;
    Item *y = (Item*)b;
    return y->freq - x->freq;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    int k;
    scanf("%d", &k);

    Item items[10000];
    int size = 0;
    for (int i = 0; i < n; i++) {
        int found = 0;
        for (int j = 0; j < size; j++) {
            if (items[j].val == arr[i]) {
                items[j].freq++;
                found = 1;
                break;
            }
        }
        if (!found) {
            items[size].val = arr[i];
            items[size].freq = 1;
            size++;
        }
    }
    qsort(items, size, sizeof(Item), cmp);
    for (int i = 0; i < k; i++) {
        printf("%d%c", items[i].val, i == k - 1 ? '\n' : ' ');
    }
    free(arr);
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    unordered_map<int, int> count;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        count[x]++;
    }
    int k;
    cin >> k;

    auto comp = [](const pair<int, int>& a, const pair<int, int>& b) {
        return a.second < b.second;
    };
    priority_queue<pair<int, int>, vector<pair<int, int>>, decltype(comp)> pq(comp);
    for (auto &entry : count) pq.push(entry);

    for (int i = 0; i < k; i++) {
        cout << pq.top().first << (i == k - 1 ? "" : " ");
        pq.pop();
    }
    cout << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "6\n1 1 1 2 2 3\n2", expectedOutput: "1 2", isPublic: true, weight: 1 },
        { input: "1\n1\n1", expectedOutput: "1", isPublic: true, weight: 1 },
        { input: "7\n4 4 4 4 5 5 6\n1", expectedOutput: "4", isPublic: false, weight: 1 },
        { input: "6\n10 20 10 30 20 10\n2", expectedOutput: "10 20", isPublic: false, weight: 1 },
        { input: "5\n-1 -1 -1 2 2\n2", expectedOutput: "-1 2", isPublic: false, weight: 1 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Medium / String: Valid Palindrome
  // -------------------------------------------------------------
  if (medString) {
    await insertQuestion(medString.id, {
      title: "Valid Palindrome",
      difficulty: "MEDIUM",
      tags: "Two Pointers, String",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.
Alphanumeric characters include letters and numbers.
Given a string s, return true if it is a palindrome, or false otherwise.

Input Format:
A single line string s.

Output Format:
Print true if s is a palindrome; otherwise print false.

Example 1:
Input:
A man, a plan, a canal: Panama
Output:
true
Explanation: "amanaplanacanalpanama" is a palindrome.

Example 2:
Input:
race a car
Output:
false
Explanation: "raceacar" is not a palindrome.

Example 3:
Input:
 
Output:
true
Explanation: s is an empty string "" after removing non-alphanumeric characters, which is a palindrome.

Constraints:
1 <= s.length <= 200000
s consists only of printable ASCII characters.`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) {
                System.out.println("false");
                return;
            }
            l++;
            r--;
        }
        System.out.println("true");
    }
}`,
        C: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main() {
    char s[200005];
    if (!fgets(s, sizeof(s), stdin)) {
        printf("true\n");
        return 0;
    }
    int l = 0, r = strlen(s) - 1;
    while (l < r) {
        while (l < r && !isalnum((unsigned char)s[l])) l++;
        while (l < r && !isalnum((unsigned char)s[r])) r--;
        if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) {
            printf("false\n");
            return 0;
        }
        l++;
        r--;
    }
    printf("true\n");
    return 0;
}`,
        CPP: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    int l = 0, r = (int)s.size() - 1;
    while (l < r) {
        while (l < r && !isalnum(s[l])) l++;
        while (l < r && !isalnum(s[r])) r--;
        if (tolower(s[l]) != tolower(s[r])) {
            cout << "false" << endl;
            return 0;
        }
        l++;
        r--;
    }
    cout << "true" << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isPublic: true, weight: 1 },
        { input: "race a car", expectedOutput: "false", isPublic: true, weight: 1 },
        { input: " ", expectedOutput: "true", isPublic: false, weight: 1 },
        { input: "0P", expectedOutput: "false", isPublic: false, weight: 1 },
        { input: "Was it a car or a cat I saw?", expectedOutput: "true", isPublic: false, weight: 1 },
        { input: "Madam, I'm Adam", expectedOutput: "true", isPublic: false, weight: 1 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Medium / Linked list: Merge Two Sorted Lists
  // -------------------------------------------------------------
  if (medLinkedList) {
    await insertQuestion(medLinkedList.id, {
      title: "Merge Two Sorted Lists",
      difficulty: "MEDIUM",
      tags: "Linked List, Recursion",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
You are given the heads of two sorted linked lists list1 and list2.
Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.
Return the head of the merged linked list.

Input Format:
Line 1: An integer n representing number of elements in list1.
Line 2: n space-separated sorted integers (or empty line if n == 0).
Line 3: An integer m representing number of elements in list2.
Line 4: m space-separated sorted integers (or empty line if m == 0).

Output Format:
Print the merged sorted list separated by space, or "empty" if both lists are empty.

Example 1:
Input:
3
1 2 4
3
1 3 4
Output:
1 1 2 3 4 4

Example 2:
Input:
0
0
Output:
empty

Constraints:
The number of nodes in both lists is in the range [0, 50].
-100 <= Node.val <= 100
Both list1 and list2 are sorted in non-decreasing order.`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int m = sc.nextInt();
        int[] b = new int[m];
        for (int i = 0; i < m; i++) b[i] = sc.nextInt();

        if (n == 0 && m == 0) {
            System.out.println("empty");
            return;
        }

        int i = 0, j = 0;
        List<Integer> res = new ArrayList<>();
        while (i < n && j < m) {
            if (a[i] <= b[j]) res.add(a[i++]);
            else res.add(b[j++]);
        }
        while (i < n) res.add(a[i++]);
        while (j < m) res.add(b[j++]);

        for (int k = 0; k < res.size(); k++) {
            System.out.print(res.get(k) + (k == res.size() - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
        C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int m;
    scanf("%d", &m);
    int b[100];
    for (int i = 0; i < m; i++) scanf("%d", &b[i]);

    if (n == 0 && m == 0) {
        printf("empty\n");
        return 0;
    }
    int i = 0, j = 0, first = 1;
    while (i < n && j < m) {
        if (!first) printf(" ");
        if (a[i] <= b[j]) printf("%d", a[i++]);
        else printf("%d", b[j++]);
        first = 0;
    }
    while (i < n) {
        if (!first) printf(" ");
        printf("%d", a[i++]);
        first = 0;
    }
    while (j < m) {
        if (!first) printf(" ");
        printf("%d", b[j++]);
        first = 0;
    }
    printf("\n");
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int m;
    cin >> m;
    vector<int> b(m);
    for (int i = 0; i < m; i++) cin >> b[i];

    if (n == 0 && m == 0) {
        cout << "empty" << endl;
        return 0;
    }
    int i = 0, j = 0;
    bool first = true;
    while (i < n && j < m) {
        if (!first) cout << " ";
        if (a[i] <= b[j]) cout << a[i++];
        else cout << b[j++];
        first = false;
    }
    while (i < n) {
        if (!first) cout << " ";
        cout << a[i++];
        first = false;
    }
    while (j < m) {
        if (!first) cout << " ";
        cout << b[j++];
        first = false;
    }
    cout << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "3\n1 2 4\n3\n1 3 4", expectedOutput: "1 1 2 3 4 4", isPublic: true, weight: 1 },
        { input: "0\n0", expectedOutput: "empty", isPublic: true, weight: 1 },
        { input: "0\n1\n0", expectedOutput: "0", isPublic: false, weight: 1 },
        { input: "2\n5 10\n3\n1 6 9", expectedOutput: "1 5 6 9 10", isPublic: false, weight: 1 },
        { input: "1\n-5\n1\n-3", expectedOutput: "-5 -3", isPublic: false, weight: 1 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Medium / Tree: Same Tree
  // -------------------------------------------------------------
  if (medTree) {
    await insertQuestion(medTree.id, {
      title: "Same Tree",
      difficulty: "MEDIUM",
      tags: "Tree, Depth-First Search, Breadth-First Search, Binary Tree",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
Given the roots of two binary trees p and q represented in level order, check if they are the same or not.
Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.

Input Format:
Line 1: An integer n representing number of elements in tree p.
Line 2: n space-separated tokens for tree p (null representing missing child).
Line 3: An integer m representing number of elements in tree q.
Line 4: m space-separated tokens for tree q.

Output Format:
Print true if both trees are identical; otherwise print false.

Example 1:
Input:
3
1 2 3
3
1 2 3
Output:
true

Example 2:
Input:
3
1 2 null
3
1 null 2
Output:
false

Constraints:
The number of nodes in both trees is in the range [0, 100].
-10000 <= Node.val <= 10000`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] a = new String[n];
        for (int i = 0; i < n; i++) a[i] = sc.next();
        int m = sc.nextInt();
        String[] b = new String[m];
        for (int i = 0; i < m; i++) b[i] = sc.next();

        if (n != m) {
            System.out.println("false");
            return;
        }
        for (int i = 0; i < n; i++) {
            if (!a[i].equals(b[i])) {
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
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char a[105][20];
    for (int i = 0; i < n; i++) scanf("%s", a[i]);
    int m;
    scanf("%d", &m);
    char b[105][20];
    for (int i = 0; i < m; i++) scanf("%s", b[i]);

    if (n != m) {
        printf("false\n");
        return 0;
    }
    for (int i = 0; i < n; i++) {
        if (strcmp(a[i], b[i]) != 0) {
            printf("false\n");
            return 0;
        }
    }
    printf("true\n");
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int m;
    cin >> m;
    vector<string> b(m);
    for (int i = 0; i < m; i++) cin >> b[i];

    if (a == b) cout << "true" << endl;
    else cout << "false" << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "3\n1 2 3\n3\n1 2 3", expectedOutput: "true", isPublic: true, weight: 1 },
        { input: "3\n1 2 null\n3\n1 null 2", expectedOutput: "false", isPublic: true, weight: 1 },
        { input: "0\n0", expectedOutput: "true", isPublic: false, weight: 1 },
        { input: "3\n1 2 1\n3\n1 1 2", expectedOutput: "false", isPublic: false, weight: 1 },
        { input: "1\n10\n1\n10", expectedOutput: "true", isPublic: false, weight: 1 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Hard / DP: Climbing Stairs
  // -------------------------------------------------------------
  if (hardDP) {
    await insertQuestion(hardDP.id, {
      title: "Climbing Stairs",
      difficulty: "HARD",
      tags: "Math, Dynamic Programming, Memoization",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
You are climbing a staircase. It takes n steps to reach the top.
Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Input Format:
A single positive integer n.

Output Format:
Print an integer representing the total number of distinct ways to reach the top.

Example 1:
Input:
2
Output:
2
Explanation: There are two ways to climb to the top:
1. 1 step + 1 step
2. 2 steps

Example 2:
Input:
3
Output:
3
Explanation: There are three ways to climb to the top:
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step

Constraints:
1 <= n <= 45`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n <= 2) {
            System.out.println(n);
            return;
        }
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        System.out.println(b);
    }
}`,
        C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    if (n <= 2) {
        printf("%d\n", n);
        return 0;
    }
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    printf("%d\n", b);
    return 0;
}`,
        CPP: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    if (n <= 2) {
        cout << n << endl;
        return 0;
    }
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    cout << b << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "2", expectedOutput: "2", isPublic: true, weight: 1 },
        { input: "3", expectedOutput: "3", isPublic: true, weight: 1 },
        { input: "1", expectedOutput: "1", isPublic: false, weight: 1 },
        { input: "5", expectedOutput: "8", isPublic: false, weight: 1 },
        { input: "10", expectedOutput: "89", isPublic: false, weight: 1 },
        { input: "20", expectedOutput: "10946", isPublic: false, weight: 1 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Hard / DP: Longest Common Subsequence
  // -------------------------------------------------------------
  if (hardDP) {
    await insertQuestion(hardDP.id, {
      title: "Longest Common Subsequence",
      difficulty: "HARD",
      tags: "String, Dynamic Programming",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.
A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.
A common subsequence of two strings is a subsequence that is common to both strings.

Input Format:
Line 1: String text1.
Line 2: String text2.

Output Format:
Print an integer representing the length of the longest common subsequence.

Example 1:
Input:
abcde
ace
Output:
3
Explanation: The longest common subsequence is "ace" and its length is 3.

Example 2:
Input:
abc
abc
Output:
3
Explanation: The longest common subsequence is "abc" and its length is 3.

Example 3:
Input:
abc
def
Output:
0
Explanation: There is no such common subsequence, so the result is 0.

Constraints:
1 <= text1.length, text2.length <= 1000
text1 and text2 consist of only lowercase English characters.`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s1 = sc.next();
        String s2 = sc.next();
        int m = s1.length(), n = s2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        System.out.println(dp[m][n]);
    }
}`,
        C: `#include <stdio.h>
#include <string.h>

int dp[1005][1005];

int main() {
    char s1[1005], s2[1005];
    if (scanf("%s %s", s1, s2) != 2) return 0;
    int m = strlen(s1), n = strlen(s2);
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i - 1] == s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
        }
    }
    printf("%d\n", dp[m][n]);
    return 0;
}`,
        CPP: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string s1, s2;
    if (!(cin >> s1 >> s2)) return 0;
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i - 1] == s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    cout << dp[m][n] << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "abcde\nace", expectedOutput: "3", isPublic: true, weight: 1 },
        { input: "abc\nabc", expectedOutput: "3", isPublic: true, weight: 1 },
        { input: "abc\ndef", expectedOutput: "0", isPublic: true, weight: 1 },
        { input: "ezupkr\nubmrapg", expectedOutput: "2", isPublic: false, weight: 1 },
        { input: "oxcp\npxo", expectedOutput: "1", isPublic: false, weight: 1 },
        { input: "longestcommon\nsubsequence", expectedOutput: "4", isPublic: false, weight: 2 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Hard / DP: Unique Paths
  // -------------------------------------------------------------
  if (hardDP) {
    await insertQuestion(hardDP.id, {
      title: "Unique Paths",
      difficulty: "HARD",
      tags: "Math, Dynamic Programming, Combinatorics",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
There is a robot on an m x n grid. The robot is initially located at the top-left corner (grid[0][0]).
The robot tries to move to the bottom-right corner (grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.
Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.

Input Format:
Two space-separated integers m and n representing grid dimensions.

Output Format:
Print an integer representing the number of unique paths.

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
Explanation: From top-left corner, there are a total of 3 ways to reach bottom-right corner:
1. Right -> Down -> Down
2. Down -> Down -> Right
3. Down -> Right -> Down

Constraints:
1 <= m, n <= 20`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        long[][] dp = new long[m][n];
        for (int i = 0; i < m; i++) dp[i][0] = 1;
        for (int j = 0; j < n; j++) dp[0][j] = 1;
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
        System.out.println(dp[m - 1][n - 1]);
    }
}`,
        C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    long long dp[25][25];
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    printf("%lld\n", dp[m - 1][n - 1]);
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<long long>> dp(m, vector<long long>(n, 1));
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    cout << dp[m - 1][n - 1] << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "3 7", expectedOutput: "28", isPublic: true, weight: 1 },
        { input: "3 2", expectedOutput: "3", isPublic: true, weight: 1 },
        { input: "1 1", expectedOutput: "1", isPublic: false, weight: 1 },
        { input: "7 3", expectedOutput: "28", isPublic: false, weight: 1 },
        { input: "3 3", expectedOutput: "6", isPublic: false, weight: 1 },
        { input: "10 10", expectedOutput: "48620", isPublic: false, weight: 2 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Hard / Graph: Course Schedule
  // -------------------------------------------------------------
  if (hardGraph) {
    await insertQuestion(hardGraph.id, {
      title: "Course Schedule",
      difficulty: "HARD",
      tags: "Depth-First Search, Breadth-First Search, Graph, Topological Sort",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1.
You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.
Return true if you can finish all courses. Otherwise, return false.

Input Format:
Line 1: Two integers numCourses and m (number of prerequisite pairs).
Next m lines: Two integers ai and bi representing prerequisites[i] = [ai, bi].

Output Format:
Print true if all courses can be finished; otherwise print false.

Example 1:
Input:
2 1
1 0
Output:
true
Explanation: There are 2 courses to take. To take course 1 you should have finished course 0. So it is possible.

Example 2:
Input:
2 2
1 0
0 1
Output:
false
Explanation: There are 2 courses to take. To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.

Constraints:
1 <= numCourses <= 2000
0 <= prerequisites.length <= 5000
prerequisites[i].length == 2
0 <= ai, bi < numCourses
All the pairs prerequisites[i] are unique.`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int m = sc.nextInt();
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[n];
        for (int i = 0; i < m; i++) {
            int a = sc.nextInt(), b = sc.nextInt();
            adj.get(b).add(a);
            inDegree[a]++;
        }

        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < n; i++) {
            if (inDegree[i] == 0) q.offer(i);
        }
        int count = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            count++;
            for (int v : adj.get(u)) {
                if (--inDegree[v] == 0) q.offer(v);
            }
        }
        System.out.println(count == n ? "true" : "false");
    }
}`,
        C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    int in_degree[2005] = {0};
    int head[2005], to[5005], next[5005], edge_cnt = 0;
    for (int i = 0; i < n; i++) head[i] = -1;

    for (int i = 0; i < m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        in_degree[a]++;
        to[edge_cnt] = a;
        next[edge_cnt] = head[b];
        head[b] = edge_cnt++;
    }

    int q[2005], front = 0, rear = 0;
    for (int i = 0; i < n; i++) {
        if (in_degree[i] == 0) q[rear++] = i;
    }
    int visited = 0;
    while (front < rear) {
        int u = q[front++];
        visited++;
        for (int e = head[u]; e != -1; e = next[e]) {
            int v = to[e];
            if (--in_degree[v] == 0) q[rear++] = v;
        }
    }
    printf("%s\n", visited == n ? "true" : "false");
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<int>> adj(n);
    vector<int> inDegree(n, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[b].push_back(a);
        inDegree[a]++;
    }

    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) q.push(i);
    }
    int count = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        count++;
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    cout << (count == n ? "true" : "false") << endl;
    return 0;
}`,
      },
      testCases: [
        { input: "2 1\n1 0", expectedOutput: "true", isPublic: true, weight: 1 },
        { input: "2 2\n1 0\n0 1", expectedOutput: "false", isPublic: true, weight: 1 },
        { input: "1 0", expectedOutput: "true", isPublic: false, weight: 1 },
        { input: "3 2\n1 0\n2 1", expectedOutput: "true", isPublic: false, weight: 1 },
        { input: "3 3\n1 0\n2 1\n0 2", expectedOutput: "false", isPublic: false, weight: 1 },
      ],
    });
  }

  // -------------------------------------------------------------
  // Hard / Matrix: Rotate Image
  // -------------------------------------------------------------
  if (hardMatrix) {
    await insertQuestion(hardMatrix.id, {
      title: "Rotate Image",
      difficulty: "HARD",
      tags: "Array, Math, Matrix",
      marks: 10,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      description: `Problem Statement:
You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).
You have to rotate the image in place, which means you have to modify the input 2D matrix directly.

Input Format:
Line 1: An integer n representing the dimension of the n x n matrix.
Next n lines: Each line contains n space-separated integers.

Output Format:
Print the rotated n x n matrix with each row on a new line and elements separated by space.

Example 1:
Input:
3
1 2 3
4 5 6
7 8 9
Output:
7 4 1
8 5 2
9 6 3

Example 2:
Input:
4
5 1 9 11
2 4 8 10
13 3 6 7
15 14 12 16
Output:
15 13 2 5
14 3 4 1
12 6 8 9
16 7 10 11

Constraints:
n == matrix.length == matrix[i].length
1 <= n <= 20
-1000 <= matrix[i][j] <= 1000`,
      starterCodes: {
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] mat = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) mat[i][j] = sc.nextInt();
        }

        // Transpose
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int tmp = mat[i][j];
                mat[i][j] = mat[j][i];
                mat[j][i] = tmp;
            }
        }
        // Reverse each row
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n / 2; j++) {
                int tmp = mat[i][j];
                mat[i][j] = mat[i][n - 1 - j];
                mat[i][n - 1 - j] = tmp;
            }
        }

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                System.out.print(mat[i][j] + (j == n - 1 ? "" : " "));
            }
            System.out.println();
        }
    }
}`,
        C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int mat[25][25];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) scanf("%d", &mat[i][j]);
    }
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int t = mat[i][j];
            mat[i][j] = mat[j][i];
            mat[j][i] = t;
        }
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n / 2; j++) {
            int t = mat[i][j];
            mat[i][j] = mat[i][n - 1 - j];
            mat[i][n - 1 - j] = t;
        }
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            printf("%d%c", mat[i][j], j == n - 1 ? '\n' : ' ');
        }
    }
    return 0;
}`,
        CPP: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> mat(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) cin >> mat[i][j];
    }
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) swap(mat[i][j], mat[j][i]);
    }
    for (int i = 0; i < n; i++) reverse(mat[i].begin(), mat[i].end());
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << mat[i][j] << (j == n - 1 ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}`,
      },
      testCases: [
        { input: "3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "7 4 1\n8 5 2\n9 6 3", isPublic: true, weight: 1 },
        { input: "4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16", expectedOutput: "15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11", isPublic: true, weight: 1 },
        { input: "1\n1", expectedOutput: "1", isPublic: false, weight: 1 },
        { input: "2\n1 2\n3 4", expectedOutput: "3 1\n4 2", isPublic: false, weight: 1 },
      ],
    });
  }

  console.log("Blind 75 Part 2 Seed completed successfully!");
}

if (require.main === module) {
  seedBlind75Part2()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
