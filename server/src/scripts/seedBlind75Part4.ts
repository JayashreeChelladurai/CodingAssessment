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

export async function seedBlind75Part4() {
  console.log("Starting Blind 75 Part 4 Seed (Questions 53-75)...");

  const codingRoot = await prisma.questionFolder.findFirst({ where: { name: "Coding", parentId: null } });
  if (!codingRoot) throw new Error("Coding root folder not found");

  const easyFolder = await prisma.questionFolder.findFirst({ where: { name: "Easy", parentId: codingRoot.id } });
  const medFolder = await prisma.questionFolder.findFirst({ where: { name: "Medium", parentId: codingRoot.id } });
  const hardFolder = await prisma.questionFolder.findFirst({ where: { name: "Hard", parentId: codingRoot.id } });

  if (!easyFolder || !medFolder || !hardFolder) throw new Error("Difficulty folders not found");

  const medTree = await prisma.questionFolder.findFirst({ where: { name: "Tree", parentId: medFolder.id } });
  const hardDP = await prisma.questionFolder.findFirst({ where: { name: "DP", parentId: hardFolder.id } });
  const hardGraph = await prisma.questionFolder.findFirst({ where: { name: "Graph", parentId: hardFolder.id } });
  const hardMatrix = await prisma.questionFolder.findFirst({ where: { name: "Matrix", parentId: hardFolder.id } });

  if (!medTree || !hardDP || !hardGraph || !hardMatrix) {
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
  // MEDIUM > TREE (8 Questions)
  // -------------------------------------------------------------

  await insertQuestion(medTree.id, {
    title: "Binary Tree Maximum Path Sum",
    description: `A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once.
Given the root of a binary tree, return the maximum path sum of any non-empty path.

Input Format:
First line contains integer n (number of tokens in level order).
Second line contains n space-separated tokens representing node values or null.

Output Format:
Print the maximum path sum as an integer.`,
    difficulty: "MEDIUM",
    tags: "Tree, DFS, Dynamic Programming",
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

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "3\n1 2 3", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "5\n-10 9 20 null null 15 7", expectedOutput: "42", isPublic: true, weight: 1 },
      { input: "1\n-3", expectedOutput: "-3", isPublic: false, weight: 1 },
      { input: "2\n2 -1", expectedOutput: "2", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medTree.id, {
    title: "Binary Tree Level Order Traversal",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).
Print each level on a new line with space-separated node values. If empty, print empty.

Input Format:
First line contains integer n.
Second line contains n space-separated tokens in level order.

Output Format:
Print each tree level on a separate line.`,
    difficulty: "MEDIUM",
    tags: "Tree, BFS",
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

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "5\n3 9 20 15 7", expectedOutput: "3\n9 20\n15 7", isPublic: true, weight: 1 },
      { input: "1\n1", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "0", expectedOutput: "empty", isPublic: false, weight: 1 },
      { input: "3\n1 2 3", expectedOutput: "1\n2 3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medTree.id, {
    title: "Serialize and Deserialize Binary Tree",
    description: `Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer.
Design an algorithm to serialize and deserialize a binary tree.
Input provides a level order string. Verify serialization and deserialization by printing the level-order traversal.

Input Format:
First line contains space-separated tokens representing a binary tree in level order.

Output Format:
Print the tree in level-order traversal separated by spaces.`,
    difficulty: "MEDIUM",
    tags: "Tree, Design, BFS",
    marks: 20,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    char line[10005];
    if (!fgets(line, sizeof(line), stdin)) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "1 2 3 null null 4 5", expectedOutput: "1 2 3 null null 4 5", isPublic: true, weight: 1 },
      { input: "null", expectedOutput: "null", isPublic: true, weight: 1 },
      { input: "1", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "1 2", expectedOutput: "1 2", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medTree.id, {
    title: "Subtree of Another Tree",
    description: `Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.

Input Format:
First line contains integer n (tokens in root).
Second line contains n space-separated tokens for root.
Third line contains integer m (tokens in subRoot).
Fourth line contains m space-separated tokens for subRoot.

Output Format:
Print true if subRoot is a subtree of root, otherwise print false.`,
    difficulty: "MEDIUM",
    tags: "Tree, DFS, String Matching",
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
        String[] rootTokens = new String[n];
        for (int i = 0; i < n; i++) rootTokens[i] = sc.next();
        int m = sc.nextInt();
        String[] subTokens = new String[m];
        for (int i = 0; i < m; i++) subTokens[i] = sc.next();

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
    vector<string> rootTokens(n);
    for (int i = 0; i < n; i++) cin >> rootTokens[i];
    int m;
    cin >> m;
    vector<string> subTokens(m);
    for (int i = 0; i < m; i++) cin >> subTokens[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "5\n3 4 5 1 2\n3\n4 1 2", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "7\n3 4 5 1 2 null null 0\n3\n4 1 2", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "1\n1\n1\n1", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "3\n1 2 3\n1\n2", expectedOutput: "true", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medTree.id, {
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    description: `Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree in level order representation.

Input Format:
First line contains integer n.
Second line contains n space-separated integers for preorder.
Third line contains n space-separated integers for inorder.

Output Format:
Print the reconstructed tree in level order separated by spaces.`,
    difficulty: "MEDIUM",
    tags: "Tree, Array, Divide and Conquer",
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
        int[] preorder = new int[n];
        for (int i = 0; i < n; i++) preorder[i] = sc.nextInt();
        int[] inorder = new int[n];
        for (int i = 0; i < n; i++) inorder[i] = sc.nextInt();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> preorder(n), inorder(n);
    for (int i = 0; i < n; i++) cin >> preorder[i];
    for (int i = 0; i < n; i++) cin >> inorder[i];

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
      { input: "5\n3 9 20 15 7\n9 3 15 20 7", expectedOutput: "3 9 20 null null 15 7", isPublic: true, weight: 1 },
      { input: "1\n-1\n-1", expectedOutput: "-1", isPublic: true, weight: 1 },
      { input: "2\n1 2\n2 1", expectedOutput: "1 2", isPublic: false, weight: 1 },
      { input: "3\n1 2 3\n2 1 3", expectedOutput: "1 2 3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medTree.id, {
    title: "Validate Binary Search Tree",
    description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).
A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys strictly less than the node's key.
- The right subtree of a node contains only nodes with keys strictly greater than the node's key.
- Both the left and right subtrees must also be binary search trees.

Input Format:
First line contains integer n.
Second line contains n space-separated tokens in level order.

Output Format:
Print true if the tree is a valid BST, otherwise print false.`,
    difficulty: "MEDIUM",
    tags: "Tree, BST, DFS",
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
        for (int i = 0; i < n; i++) nodes[i] = sc.next();

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
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "3\n2 1 3", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "5\n5 1 4 null null 3 6", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "1\n10", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "3\n2 2 2", expectedOutput: "false", isPublic: false, weight: 1 },
      { input: "3\n1 2 3", expectedOutput: "false", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medTree.id, {
    title: "Kth Smallest Element in a BST",
    description: `Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.

Input Format:
First line contains integer n (tokens in level order) and integer k.
Second line contains n space-separated tokens.

Output Format:
Print the kth smallest integer.`,
    difficulty: "MEDIUM",
    tags: "Tree, BST, DFS",
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
        String[] nodes = new String[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.next();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    vector<string> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "4 1\n3 1 4 null 2", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "6 3\n5 3 6 2 4 null null 1", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "1 1\n7", expectedOutput: "7", isPublic: false, weight: 1 },
      { input: "3 2\n2 1 3", expectedOutput: "2", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(medTree.id, {
    title: "Lowest Common Ancestor of a BST",
    description: `Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes p and q in the BST.
The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).

Input Format:
First line contains integer n (tokens in BST) and values p and q.
Second line contains n space-separated tokens in level order.

Output Format:
Print the value of the LCA node.`,
    difficulty: "MEDIUM",
    tags: "Tree, BST, DFS",
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
        int p = sc.nextInt();
        int q = sc.nextInt();
        String[] nodes = new String[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.next();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n, p, q;
    if (!(cin >> n >> p >> q)) return 0;
    vector<string> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n, p, q;
    if (scanf("%d %d %d", &n, &p, &q) != 3) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "9 2 8\n6 2 8 0 4 7 9 null null 3 5", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "9 2 4\n6 2 8 0 4 7 9 null null 3 5", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "2 2 1\n2 1", expectedOutput: "2", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // HARD > DP (6 Questions)
  // -------------------------------------------------------------

  await insertQuestion(hardDP.id, {
    title: "Word Break",
    description: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.
Notice that the same word in the dictionary may be reused multiple times in the segmentation.

Input Format:
First line contains string s.
Second line contains integer m (number of words in dictionary).
Third line contains m space-separated dictionary words.

Output Format:
Print true if s can be segmented, otherwise print false.`,
    difficulty: "HARD",
    tags: "Dynamic Programming, Trie, Memoization",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        int m = sc.nextInt();
        List<String> dict = new ArrayList<>();
        for (int i = 0; i < m; i++) dict.add(sc.next());

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    int m;
    cin >> m;
    vector<string> dict(m);
    for (int i = 0; i < m; i++) cin >> dict[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    char s[305];
    if (scanf("%s", s) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "leetcode\n2\nleet code", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "applepenapple\n2\napple pen", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "catsandog\n5\ncats dog sand and cat", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "a\n1\na", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "aaaaaaa\n2\naaa aaaa", expectedOutput: "true", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardDP.id, {
    title: "Combination Sum",
    description: `Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.
The same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

Input Format:
First line contains integer n and integer target.
Second line contains n space-separated integers.

Output Format:
Print each combination on a new line with elements sorted and space-separated, sorted lexicographically. If none, print empty.`,
    difficulty: "HARD",
    tags: "Dynamic Programming, Backtracking",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] candidates = new int[n];
        for (int i = 0; i < n; i++) candidates[i] = sc.nextInt();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> candidates(n);
    for (int i = 0; i < n; i++) cin >> candidates[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "4 7\n2 3 6 7", expectedOutput: "2 2 3\n7", isPublic: true, weight: 1 },
      { input: "3 8\n2 3 5", expectedOutput: "2 2 2 2\n2 3 3\n3 5", isPublic: true, weight: 1 },
      { input: "1 2\n2", expectedOutput: "2", isPublic: false, weight: 1 },
      { input: "1 1\n2", expectedOutput: "empty", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardDP.id, {
    title: "House Robber",
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.
Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print the maximum robbed amount as an integer.`,
    difficulty: "HARD",
    tags: "Dynamic Programming",
    marks: 30,
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
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

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
    for (int i = 0; i < n; i++) cin >> nums[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "5\n2 7 9 3 1", expectedOutput: "12", isPublic: true, weight: 1 },
      { input: "1\n5", expectedOutput: "5", isPublic: false, weight: 1 },
      { input: "2\n2 1", expectedOutput: "2", isPublic: false, weight: 1 },
      { input: "5\n2 1 1 2 5", expectedOutput: "8", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardDP.id, {
    title: "House Robber II",
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Meanwhile, adjacent houses have a security system connected, and it will automatically contact the police if two adjacent houses were broken into on the same night.
Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print the maximum money robbed as an integer.`,
    difficulty: "HARD",
    tags: "Dynamic Programming",
    marks: 30,
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
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

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
    for (int i = 0; i < n; i++) cin >> nums[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "3\n2 3 2", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "4\n1 2 3 1", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "3\n1 2 3", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "1\n7", expectedOutput: "7", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardDP.id, {
    title: "Decode Ways",
    description: `A message containing letters from A-Z can be encoded into numbers using the following mapping:
'A' -> "1", 'B' -> "2", ..., 'Z' -> "26".
To decode an encoded message, all the digits must be grouped then mapped back into letters.
Given a string s containing only digits, return the number of ways to decode it.

Input Format:
A single line containing digit string s.

Output Format:
Print the number of ways to decode s as an integer.`,
    difficulty: "HARD",
    tags: "Dynamic Programming, String",
    marks: 30,
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

int main() {
    char s[105];
    if (scanf("%s", s) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "12", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "226", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "06", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "10", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "27", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardDP.id, {
    title: "Jump Game",
    description: `You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.
Return true if you can reach the last index, or false otherwise.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print true if you can reach the last index, otherwise print false.`,
    difficulty: "HARD",
    tags: "Dynamic Programming, Greedy",
    marks: 30,
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
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

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
    for (int i = 0; i < n; i++) cin >> nums[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "5\n2 3 1 1 4", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "5\n3 2 1 0 4", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "1\n0", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "2\n2 0", expectedOutput: "true", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // HARD > GRAPH (6 Questions)
  // -------------------------------------------------------------

  await insertQuestion(hardGraph.id, {
    title: "Clone Graph",
    description: `Given a reference of a node in a connected undirected graph.
Return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list of its neighbors.
Print the adjacency list of the cloned graph in ascending order of node values.

Input Format:
First line contains integer n (number of nodes).
Next n lines each contain space-separated neighbor indices for node i (1-indexed).

Output Format:
Print the adjacency list of each node on a new line.`,
    difficulty: "HARD",
    tags: "Graph, BFS, DFS, Hash Table",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        sc.nextLine();
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String line = sc.nextLine().trim();
            List<Integer> neighbors = new ArrayList<>();
            if (!line.isEmpty()) {
                for (String s : line.split("\\\\s+")) neighbors.add(Integer.parseInt(s));
            }
            adj.add(neighbors);
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <sstream>
#include <string>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    string line;
    getline(cin, line);
    vector<vector<int>> adj(n);
    for (int i = 0; i < n; i++) {
        getline(cin, line);
        stringstream ss(line);
        int v;
        while (ss >> v) adj[i].push_back(v);
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "4\n2 4\n1 3\n2 4\n1 3", expectedOutput: "2 4\n1 3\n2 4\n1 3", isPublic: true, weight: 1 },
      { input: "1\n", expectedOutput: "empty", isPublic: true, weight: 1 },
      { input: "2\n2\n1", expectedOutput: "2\n1", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardGraph.id, {
    title: "Pacific Atlantic Water Flow",
    description: `There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.
Water can only flow from a cell to an adjacent cell if the adjacent cell's height is less than or equal to the current cell's height.
Return a list of grid coordinates where water can flow to both oceans. Print each coordinate on a new line formatted as r c in lexicographical order.

Input Format:
First line contains integers m and n.
Next m lines each contain n space-separated integers representing heights.

Output Format:
Print each valid coordinate (row col) on a new line.`,
    difficulty: "HARD",
    tags: "Graph, BFS, DFS, Matrix",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] heights = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) heights[i][j] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<int>> heights(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) cin >> heights[i][j];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4", expectedOutput: "0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0", isPublic: true, weight: 1 },
      { input: "1 1\n1", expectedOutput: "0 0", isPublic: true, weight: 1 },
      { input: "2 2\n1 1\n1 1", expectedOutput: "0 0\n0 1\n1 0\n1 1", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardGraph.id, {
    title: "Longest Consecutive Sequence",
    description: `Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.
You must write an algorithm that runs in O(n) time.

Input Format:
First line contains integer n.
Second line contains n space-separated integers.

Output Format:
Print the maximum length of consecutive elements as an integer.`,
    difficulty: "HARD",
    tags: "Graph, Array, Hash Table, Union Find",
    marks: 30,
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
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

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
    for (int i = 0; i < n; i++) cin >> nums[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // Write your logic here

    free(nums);
    return 0;
}`,
    },
    testCases: [
      { input: "6\n100 4 200 1 3 2", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "10\n0 3 7 2 5 8 4 6 0 1", expectedOutput: "9", isPublic: true, weight: 1 },
      { input: "0", expectedOutput: "0", isPublic: false, weight: 1 },
      { input: "1\n5", expectedOutput: "1", isPublic: false, weight: 1 },
      { input: "5\n1 2 0 1 2", expectedOutput: "3", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardGraph.id, {
    title: "Alien Dictionary",
    description: `There is a new alien language that uses the English alphabet. However, the order among letters is unknown to you.
You are given a list of strings words from the alien language's dictionary, where the strings in words are sorted lexicographically by the rules of this new language.
Return a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules. If no such order exists, print empty.

Input Format:
First line contains integer n.
Next n lines each contain a word.

Output Format:
Print the determined order of characters as a single string, or empty if invalid.`,
    difficulty: "HARD",
    tags: "Graph, Topological Sort, BFS, DFS",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] words = new String[n];
        for (int i = 0; i < n; i++) words[i] = sc.next();

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
    vector<string> words(n);
    for (int i = 0; i < n; i++) cin >> words[i];

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "5\nwrt\nwrf\ner\nett\nrftt", expectedOutput: "wertf", isPublic: true, weight: 1 },
      { input: "2\nz\nx", expectedOutput: "zx", isPublic: true, weight: 1 },
      { input: "2\nz\nx\nz", expectedOutput: "empty", isPublic: false, weight: 1 },
      { input: "1\nz", expectedOutput: "z", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardGraph.id, {
    title: "Graph Valid Tree",
    description: `Given n nodes labeled from 0 to n - 1 and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.

Input Format:
First line contains integer n (number of nodes) and integer m (number of edges).
Next m lines each contain two space-separated integers representing an edge.

Output Format:
Print true if the graph is a valid tree, otherwise print false.`,
    difficulty: "HARD",
    tags: "Graph, DFS, BFS, Union Find",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int m = sc.nextInt();
        int[][] edges = new int[m][2];
        for (int i = 0; i < m; i++) {
            edges[i][0] = sc.nextInt();
            edges[i][1] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<int>> edges(m, vector<int>(2));
    for (int i = 0; i < m; i++) {
        cin >> edges[i][0] >> edges[i][1];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "5 4\n0 1\n0 2\n0 3\n1 4", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "5 4\n0 1\n1 2\n2 3\n1 3", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "1 0", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "4 2\n0 1\n2 3", expectedOutput: "false", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardGraph.id, {
    title: "Number of Connected Components in an Undirected Graph",
    description: `You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph.
Return the number of connected components in the graph.

Input Format:
First line contains integer n (nodes) and integer m (edges).
Next m lines each contain two space-separated integers representing an edge.

Output Format:
Print the number of connected components as an integer.`,
    difficulty: "HARD",
    tags: "Graph, Union Find, BFS, DFS",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int m = sc.nextInt();
        int[][] edges = new int[m][2];
        for (int i = 0; i < m; i++) {
            edges[i][0] = sc.nextInt();
            edges[i][1] = sc.nextInt();
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<int>> edges(m, vector<int>(2));
    for (int i = 0; i < m; i++) {
        cin >> edges[i][0] >> edges[i][1];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "5 4\n0 1\n1 2\n3 4\n2 0", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "5 3\n0 1\n1 2\n2 3", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "4 0", expectedOutput: "4", isPublic: false, weight: 1 },
      { input: "3 3\n0 1\n1 2\n2 0", expectedOutput: "1", isPublic: false, weight: 1 },
    ],
  });

  // -------------------------------------------------------------
  // HARD > MATRIX (3 Questions)
  // -------------------------------------------------------------

  await insertQuestion(hardMatrix.id, {
    title: "Word Search",
    description: `Given an m x n grid of characters board and a string word, return true if word exists in the grid.
The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

Input Format:
First line contains integers m and n.
Next m lines each contain n space-separated characters.
Last line contains the target word string.

Output Format:
Print true if the word exists, otherwise print false.`,
    difficulty: "HARD",
    tags: "Matrix, Backtracking, DFS",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        char[][] board = new char[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                board[i][j] = sc.next().charAt(0);
            }
        }
        String word = sc.next();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<char>> board(m, vector<char>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) cin >> board[i][j];
    }
    string word;
    cin >> word;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCCED", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "3 4\nA B C E\nS F C S\nA D E E\nSEE", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCB", expectedOutput: "false", isPublic: false, weight: 1 },
      { input: "1 1\nA\nA", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "1 2\nA B\nBA", expectedOutput: "true", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardMatrix.id, {
    title: "Search a 2D Matrix",
    description: `You are given an m x n integer matrix matrix with the following two properties:
- Each row is sorted in non-decreasing order.
- The first integer of each row is greater than the last integer of the previous row.
Given an integer target, return true if target is in matrix or false otherwise.
You must write a solution in O(log(m * n)) time complexity.

Input Format:
First line contains integers m and n.
Next m lines each contain n space-separated integers.
Last line contains integer target.

Output Format:
Print true if target is found, otherwise print false.`,
    difficulty: "HARD",
    tags: "Matrix, Binary Search",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] matrix = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                matrix[i][j] = sc.nextInt();
            }
        }
        int target = sc.nextInt();

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) cin >> matrix[i][j];
    }
    int target;
    cin >> target;

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n3", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n13", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "1 1\n1\n1", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "1 2\n1 3\n3", expectedOutput: "true", isPublic: false, weight: 1 },
      { input: "2 2\n1 4\n5 8\n6", expectedOutput: "false", isPublic: false, weight: 1 },
    ],
  });

  await insertQuestion(hardMatrix.id, {
    title: "Surrounded Regions",
    description: `Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'.
A region is captured by flipping all 'O's into 'X's in that surrounded region.
An 'O' on the border is not flipped, and any 'O' connected to a border 'O' is also not flipped.

Input Format:
First line contains integers m and n.
Next m lines each contain n space-separated characters ('X' or 'O').

Output Format:
Print the resulting board with each row separated by space on a new line.`,
    difficulty: "HARD",
    tags: "Matrix, BFS, DFS, Union Find",
    marks: 30,
    timeLimitSeconds: 2,
    memoryLimitMb: 256,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        char[][] board = new char[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                board[i][j] = sc.next().charAt(0);
            }
        }

        // Write your logic here

    }
}`,
      CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<char>> board(m, vector<char>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) cin >> board[i][j];
    }

    // Write your logic here

    return 0;
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;

    // Write your logic here

    return 0;
}`,
    },
    testCases: [
      { input: "4 4\nX X X X\nX O O X\nX X O X\nX O X X", expectedOutput: "X X X X\nX X X X\nX X X X\nX O X X", isPublic: true, weight: 1 },
      { input: "1 1\nX", expectedOutput: "X", isPublic: true, weight: 1 },
      { input: "2 2\nO O\nO O", expectedOutput: "O O\nO O", isPublic: false, weight: 1 },
      { input: "3 3\nX X X\nX O X\nX X X", expectedOutput: "X X X\nX X X\nX X X", isPublic: false, weight: 1 },
    ],
  });

  console.log("Blind 75 Part 4 Seed completed successfully!");
}

seedBlind75Part4()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
