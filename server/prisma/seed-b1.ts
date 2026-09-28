import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// 1. REFERENCE ALGORITHMS (Used to guarantee 100% correct expected outputs)
// ============================================================================

function solveLongestPalindrome(s: string): string {
  if (!s || s.length < 1) return "";
  let start = 0;
  let maxLen = 1;

  for (let i = 0; i < s.length; i++) {
    // Odd length palindrome centered at i
    let l = i;
    let r = i;
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      if (r - l + 1 > maxLen) {
        start = l;
        maxLen = r - l + 1;
      }
      l--;
      r++;
    }

    // Even length palindrome centered at i, i+1
    l = i;
    r = i + 1;
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      if (r - l + 1 > maxLen) {
        start = l;
        maxLen = r - l + 1;
      }
      l--;
      r++;
    }
  }

  return s.substring(start, start + maxLen);
}

function solveMinWindow(s: string, t: string): string {
  if (s.length < t.length || t.length === 0) return "";

  const target = new Map<string, number>();
  for (const c of t) {
    target.set(c, (target.get(c) || 0) + 1);
  }

  const required = target.size;
  let formed = 0;
  const window = new Map<string, number>();

  let l = 0;
  let r = 0;
  let minLen = -1;
  let bestStart = 0;

  while (r < s.length) {
    const c = s[r];
    window.set(c, (window.get(c) || 0) + 1);

    if (target.has(c) && window.get(c) === target.get(c)) {
      formed++;
    }

    while (l <= r && formed === required) {
      if (minLen === -1 || r - l + 1 < minLen) {
        minLen = r - l + 1;
        bestStart = l;
      }

      const leftChar = s[l];
      window.set(leftChar, (window.get(leftChar) || 0) - 1);
      if (target.has(leftChar) && (window.get(leftChar) || 0) < (target.get(leftChar) || 0)) {
        formed--;
      }
      l++;
    }
    r++;
  }

  return minLen === -1 ? "" : s.substring(bestStart, bestStart + minLen);
}

function solveValidParentheses(s: string): boolean {
  if (s.length % 2 !== 0) return false;
  const stack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") stack.push(")");
    else if (c === "{") stack.push("}");
    else if (c === "[") stack.push("]");
    else {
      if (stack.length === 0 || stack.pop() !== c) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

// ============================================================================
// 2. TEST CASE GENERATORS (100 Cases for each problem)
// ============================================================================

interface RawTestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  weight: number;
}

function generateLongestPalindromeCases(): RawTestCase[] {
  const inputs: string[] = [
    // --- 10 Sample / Public Cases ---
    "babad",
    "cbbd",
    "a",
    "ac",
    "racecar",
    "noon",
    "abacaba",
    "forgeeksskeegfor",
    "banana",
    "abb",

    // --- 90 Evaluation Cases covering all corner cases ---
    // Single characters
    "z",
    "x",
    "m",
    "q",
    "k",
    // Two characters
    "aa",
    "bb",
    "cc",
    "ab",
    "ba",
    "xy",
    // Three characters
    "aaa",
    "aba",
    "abc",
    "aab",
    "baa",
    "cac",
    "dad",
    // Four characters
    "aaaa",
    "abba",
    "baab",
    "abcd",
    "aaba",
    "abaa",
    // All identical long strings
    "aaaaaaaaaa",
    "bbbbbbbbbbbbbbb",
    "cccccccccccccccccccc",
    "zzzzzzzzzzzzzzzzzzzzzzzzz",
    // Palindrome at the very beginning
    "racecartrain",
    "noonmidnight",
    "radarplane",
    "madamimadamhello",
    "levelground",
    // Palindrome at the very end
    "carotracecar",
    "afternoon",
    "aeroplaneradar",
    "hellomadamimadam",
    "steeptenethere",
    // Palindrome strictly in the middle
    "abcdekayakfghij",
    "xyzrotatoruvw",
    "123321456",
    "progreferfun",
    "predeifiedpost",
    // Even-length palindromes
    "abba",
    "redder",
    "peep",
    "deed",
    "noon",
    "pullup",
    "evencancommacmonneve",
    "12344321",
    // Alternating sequences
    "ababababab",
    "cdcdcdcdcdcd",
    "xyxyxyxyxyxyxy",
    "10101010101",
    // Multiple palindromes with identical max length (tie-breaking: first occurrence)
    "abacdfgdcaba",
    "racecar_kayak",
    "noon_peep",
    "apple_kayak_radar",
    "level_rotator_civic",
    // No multi-char palindrome (all length 1, tie-breaker: first char)
    "abcdefghijklmnopqrstuvwxyz",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "1234567890",
    // Mixed alphanumeric / symbols / cases
    "Aa",
    "aA",
    "AbA",
    "aBa",
    "AbaA",
    "Madam",
    "RaceCar",
    "A man a plan a canal Panama".replace(/\s+/g, ""),
    // Medium strings (50 - 150 chars)
    "abcdefghijklmnopqrstuvwxyzyxwvutsrqponmlkjihgfedcba",
    "prefix_" + "a".repeat(40) + "_suffix",
    "xyz_" + "radar" + "_abc_" + "level" + "_123",
    "abc" + "kayak" + "def" + "racecar" + "ghi",
    "start_" + "steponnopets" + "_end",
    "intro_" + "tacocat" + "_outro",
    "1a2b3c4d5e5d4c3b2a1",
    "abcba".repeat(5),
    "defged".repeat(4),
    "ghijihg".repeat(3),
    // Scale / Asymptotic efficiency tests (200 - 500 chars)
    "a".repeat(100),
    "a".repeat(250),
    "a".repeat(500),
    "b" + "a".repeat(200) + "b",
    "c" + "a".repeat(300) + "d",
    "xy" + "z".repeat(150) + "yx",
    Array.from({ length: 150 }, (_, i) => String.fromCharCode(97 + (i % 26))).join(""),
    "leftside_" + "a".repeat(80) + "_rightside",
    "start_" + "civic".repeat(20) + "_finish",
    "begin_" + "deified".repeat(15) + "_done",
    "head_" + "rotator".repeat(12) + "_tail",
    "alpha_" + "repaper".repeat(10) + "_omega",
    "test_" + "noon".repeat(30) + "_pass",
    "prefix_" + "pullup".repeat(20) + "_suffix",
    "base_" + "redder".repeat(18) + "_cap",
    "edge_" + "radar".repeat(25) + "_end",
    "full_" + "racecar".repeat(15) + "_stop",
  ];

  // Trim or slice to precisely 100 cases
  const selected = inputs.slice(0, 100);
  return selected.map((s, idx) => ({
    input: s,
    expectedOutput: solveLongestPalindrome(s),
    isPublic: idx < 10,
    weight: 1.0,
  }));
}

function generateMinWindowCases(): RawTestCase[] {
  const pairs: [string, string][] = [
    // --- 10 Sample / Public Cases ---
    ["ADOBECODEBANC", "ABC"],
    ["a", "a"],
    ["a", "aa"],
    ["ab", "b"],
    ["ab", "a"],
    ["aa", "aa"],
    ["bba", "ab"],
    ["cabwefgewcwaefgcf", "cae"],
    ["aaaaaaaaaaaabbbbbcdd", "abcdd"],
    ["bdab", "ab"],

    // --- 90 Evaluation Cases covering all corner cases ---
    // Exact single match
    ["z", "z"],
    ["x", "y"],
    ["q", "qq"],
    ["m", "m"],
    ["k", "p"],
    // Target is entire string
    ["hello", "hello"],
    ["coding", "gnidoc"],
    ["assessment", "assessment"],
    ["algorithms", "rithmsalgo"],
    // No possible window (missing characters)
    ["abcdef", "g"],
    ["xyz", "a"],
    ["programming", "zz"],
    ["database", "xyz"],
    ["computer", "compz"],
    ["system", "systems"],
    // Target longer than source
    ["abc", "abcd"],
    ["cat", "caterpillar"],
    ["code", "codecode"],
    ["short", "shorterword"],
    // Multiple characters with duplicates in target
    ["AABBC", "ABB"],
    ["AABBC", "AAB"],
    ["AAABBBCCC", "ABC"],
    ["AAABBBCCC", "AABBCC"],
    ["AAABBBCCC", "AAABBBCCC"],
    ["AAABBBCCC", "AAAABBBCCC"],
    ["MISSISSIPPI", "ISSI"],
    ["MISSISSIPPI", "ISP"],
    ["MISSISSIPPI", "SPP"],
    ["MISSISSIPPI", "MIP"],
    // Window at the very beginning of s
    ["ABCDEFGH", "ABC"],
    ["XYZ123456", "XYZ"],
    ["HELLOworld", "HEL"],
    ["DATABASEquery", "DATA"],
    ["JAVASCRIPTweb", "JAVA"],
    // Window at the very end of s
    ["123456XYZ", "XYZ"],
    ["worldHELLO", "HEL"],
    ["queryDATABASE", "DATA"],
    ["webJAVASCRIPT", "JAVA"],
    ["frontbackABC", "ABC"],
    // Window strictly in the middle of s
    ["123ABC456", "ABC"],
    ["leftHELLOright", "HEL"],
    ["prefixXYZsuffix", "XYZ"],
    ["preJAVASCRIPTpost", "JAVA"],
    ["leadTARGETtrail", "TARGET"],
    // Multiple valid windows (must pick minimum length)
    ["A_B_C___ABC___A__B__C", "ABC"],
    ["XX_HELLO_XXXX_HELLO_X", "HELLO"],
    ["XAYBZC_ABC_XYZ", "ABC"],
    ["DABEC_BANC_XYZ", "ABC"],
    ["123_CAT_456_C_A_T_789", "CAT"],
    // Case sensitivity (lowercase vs uppercase are distinct)
    ["AaBbCc", "abc"],
    ["AaBbCc", "ABC"],
    ["AaBbCc", "aA"],
    ["CaseSensitive", "cases"],
    ["CaseSensitive", "Case"],
    ["JavaJava", "JAVA"],
    ["JavaJava", "java"],
    ["Python", "PYTHON"],
    // All identical characters in s and t
    ["aaaaa", "a"],
    ["aaaaa", "aa"],
    ["aaaaa", "aaa"],
    ["aaaaa", "aaaa"],
    ["aaaaa", "aaaaa"],
    ["aaaaa", "aaaaaa"],
    ["bbbbbbbb", "bbb"],
    ["cccccccccc", "ccccc"],
    // Dispersed / interleaved characters
    ["A__B__C__A__B__C", "ABC"],
    ["T___E___S___T", "TEST"],
    ["1a2b3c4d5e", "abcde"],
    ["P.R.O.C.T.O.R", "PROCTOR"],
    ["S.E.B.S.A.F.E", "SEB"],
    // Numeric & alphanumeric strings
    ["0123456789", "567"],
    ["0123456789", "987"],
    ["9876543210", "123"],
    ["a1b2c3d4", "1234"],
    ["a1b2c3d4", "abcd"],
    // Scale tests / Medium to Long strings (100 - 500 chars)
    ["a".repeat(100), "a".repeat(10)],
    ["a".repeat(200), "a".repeat(50)],
    ["a".repeat(300), "a".repeat(100)],
    ["x" + "a".repeat(100) + "y" + "b".repeat(100) + "z", "xyz"],
    ["start_" + "A".repeat(50) + "B".repeat(50) + "_end", "AB"],
    ["alpha" + "beta".repeat(30) + "gamma", "abg"],
    ["foo" + "bar".repeat(40) + "baz", "fbz"],
    ["left" + "middle".repeat(25) + "right", "lmr"],
    ["pre" + "abcdef".repeat(20) + "post", "fedcba"],
    ["h" + "e".repeat(80) + "l" + "l".repeat(80) + "o", "hello"],
    ["w" + "o".repeat(60) + "r" + "l".repeat(60) + "d", "world"],
    ["test" + "case".repeat(30) + "final", "testcase"],
    ["fast" + "slow".repeat(25) + "stop", "fs"],
    ["safe" + "exam".repeat(30) + "browser", "seb"],
    ["anti" + "gravity".repeat(20) + "deepmind", "agd"],
    ["lock" + "down".repeat(25) + "shield", "lds"],
    ["zero" + "hero".repeat(30) + "winner", "zhw"],
  ];

  const selected = pairs.slice(0, 100);
  return selected.map(([s, t], idx) => ({
    input: `${s}\n${t}`,
    expectedOutput: solveMinWindow(s, t),
    isPublic: idx < 10,
    weight: 1.0,
  }));
}

function generateValidParenthesesCases(): RawTestCase[] {
  const inputs: string[] = [
    // --- 10 Sample / Public Cases ---
    "()",
    "()[]{}",
    "(]",
    "([)]",
    "{[]}",
    "",
    "(",
    ")",
    "((()))",
    "{[()]}",

    // --- 90 Evaluation Cases covering all corner cases ---
    // Single brackets (must be false)
    "[",
    "]",
    "{",
    "}",
    // Odd length strings (always false)
    "(((",
    ")))",
    "{{{",
    "}}}",
    "[[[",
    "]]]",
    "(()",
    "())",
    "{()",
    "}{}",
    "[{]}",
    "([)",
    "({)",
    "[}]",
    "((((((((((",
    "))))))))))",
    // Starting with closing bracket (false)
    ")( ",
    "}{",
    "][",
    ")(()",
    "}({})",
    "]([])",
    ")[][",
    "}{()",
    // Inverted matching pairs (false)
    ")(",
    "}{",
    "][",
    ")()(",
    "}{}{",
    "][][",
    // Nested symmetric brackets (true)
    "((()))",
    "[[[]]]",
    "{{{}}}",
    "(((())))",
    "[[[[]]]]",
    "{{{{}}}}",
    "((((()))))",
    "({[]})",
    "({[()]})",
    "{[({})]}",
    "[({[]})]",
    "((({{{[[[]]]}}})))",
    // Sequential matching pairs (true)
    "()()",
    "[][]",
    "{}{}",
    "()()()()",
    "[][][][]",
    "{}{}{}{}",
    "()[]{}(())[[[]]]{{{}}}",
    "()[]{}()[]{}",
    "({[]})()[]{}({})",
    // Interleaved valid structures (true)
    "(()())",
    "[[]()]",
    "{{()[]}}",
    "(()(()))",
    "(([])[{}])",
    "{[()]}([])",
    "[{()}]({[]})",
    "({[]})[{()}]",
    // Mismatched closing brackets (false)
    "(}",
    "{)",
    "[)",
    "(]",
    "{]",
    "[}",
    "({[)}]",
    "([)]",
    "[(])",
    "{[}]",
    "{(})",
    "{([)]}",
    "(((((((((()))))))))}",
    "{{{{{{{{{[}}}}}}}}}",
    "[[[[[[[[[(]]]]]]]]]",
    // Incomplete / unclosed structures (false)
    "()(",
    "()()(",
    "[]{}[",
    "{}[",
    "(((((())))))((",
    "{{{{()}}}}[",
    "({[]})(",
    "({[]})[",
    "({[]}){",
    // Extra closing brackets at end (false)
    "())",
    "()())",
    "[]{}]",
    "{}{}}",
    "((())))))",
    "({[]}))",
    "({[]})]",
    "({[]})}",
    // Deeply nested valid scale tests (true)
    "(".repeat(50) + ")".repeat(50),
    "[".repeat(50) + "]".repeat(50),
    "{".repeat(50) + "}".repeat(50),
    "(".repeat(100) + ")".repeat(100),
    "({[".repeat(30) + "]})".repeat(30),
    "()".repeat(100),
    "[]".repeat(100),
    "{}".repeat(100),
    "()[]{}".repeat(50),
    // Deeply nested invalid scale tests (false)
    "(".repeat(50) + ")".repeat(49),
    "(".repeat(49) + ")".repeat(50),
    "[".repeat(100) + "]".repeat(99),
    "{".repeat(100) + "}".repeat(99),
    "(".repeat(50) + "]".repeat(50),
    "({[".repeat(30) + "]})".repeat(29) + "]",
    "()".repeat(50) + "(",
    "[]".repeat(50) + "]",
    "{}".repeat(50) + "}",
  ];

  const selected = inputs.slice(0, 100);
  return selected.map((s, idx) => ({
    input: s,
    expectedOutput: solveValidParentheses(s) ? "true" : "false",
    isPublic: idx < 10,
    weight: 1.0,
  }));
}

// ============================================================================
// 3. MAIN SEEDING FUNCTION
// ============================================================================

async function main() {
  console.log("================================================================================");
  console.log("   🚀 GENERATING ASSESSMENT 'B1' (3 PROBLEMS × 100 TESTCASES = 300 CASES)       ");
  console.log("================================================================================");

  // Clean up any existing assessment with code B1
  const existing = await prisma.assessment.findUnique({
    where: { code: "B1" },
  });

  if (existing) {
    console.log("⚠️ Assessment 'B1' already exists. Purging and recreating fresh...");
    await prisma.assessment.delete({ where: { code: "B1" } });
  }

  // 1. Create Assessment
  const assessment = await prisma.assessment.create({
    data: {
      title: "B1",
      code: "B1",
      description: "Advanced Data Structures & Algorithms Assessment: Longest Palindromic Substring, Minimum Window Substring, and Valid Parentheses with 100 exhaustive corner-case test cases per problem.",
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

  // 3. Question 1: Longest Palindromic Substring
  const q1Cases = generateLongestPalindromeCases();
  console.log(`Generating Q1 (Longest Palindromic Substring) with ${q1Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Longest Palindromic Substring",
      description: `### Problem Statement
Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

A **palindrome** is a string that reads the same backward as forward.

---

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print the longest palindromic substring in \`s\`.
- **Tie-Breaking Rule:** If there are multiple palindromic substrings of the same maximum length, print the one that occurs **first** (with the earliest starting index).

### Constraints
- $1 \\le \\text{length}(s) \\le 1000$
- \`s\` consists of printable ASCII characters or English letters and digits.

---

### Examples

**Example 1:**
- **Input:**
  \`\`\`text
  babad
  \`\`\`
- **Output:**
  \`\`\`text
  bab
  \`\`\`
- **Explanation:** Both \`"bab"\` and \`"aba"\` are palindromes of length 3. Per the tie-breaking rule, \`"bab"\` appears first in \`"babad"\`, so print \`"bab"\`.

**Example 2:**
- **Input:**
  \`\`\`text
  cbbd
  \`\`\`
- **Output:**
  \`\`\`text
  bb
  \`\`\`

**Example 3:**
- **Input:**
  \`\`\`text
  racecar
  \`\`\`
- **Output:**
  \`\`\`text
  racecar
  \`\`\`
`,
      marks: 35.0,
      order: 0,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Find and print the longest palindromic substring in s
        // If multiple have the same max length, print the one with the earliest starting index.

    }
}`,
      }),
      starterCode: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Find and print the longest palindromic substring in s
        // If multiple have the same max length, print the one with the earliest starting index.

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

  // 4. Question 2: Minimum Window Substring
  const q2Cases = generateMinWindowCases();
  console.log(`Generating Q2 (Minimum Window Substring) with ${q2Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Minimum Window Substring",
      description: `### Problem Statement
Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the **minimum window substring** of \`s\` such that every character in \`t\` (**including duplicates**) is included in the window.

If there is no such substring, return an empty string \`""\` (i.e. print nothing / empty line).

---

### Input Format
- **Line 1:** String \`s\`
- **Line 2:** String \`t\`

### Output Format
- Print the minimum window substring. If no such substring exists, leave the output empty.
- **Tie-Breaking Rule:** If there are multiple minimal windows of the same minimum length, print the one that occurs **first** (earliest starting index).

### Constraints
- $1 \\le \\text{length}(s), \\text{length}(t) \\le 10^5$
- \`s\` and \`t\` consist of uppercase and lowercase English letters or printable characters.

---

### Examples

**Example 1:**
- **Input:**
  \`\`\`text
  ADOBECODEBANC
  ABC
  \`\`\`
- **Output:**
  \`\`\`text
  BANC
  \`\`\`
- **Explanation:** The minimum window substring \`"BANC"\` includes \`'A'\`, \`'B'\`, and \`'C'\` from string \`t\`.

**Example 2:**
- **Input:**
  \`\`\`text
  a
  a
  \`\`\`
- **Output:**
  \`\`\`text
  a
  \`\`\`

**Example 3:**
- **Input:**
  \`\`\`text
  a
  aa
  \`\`\`
- **Output:**
  \`\`\`text
  \`\`\`
- **Explanation:** Both \`'a'\` characters from \`t\` must be included in the window. Since \`s\` only has one \`'a'\`, return empty.
`,
      marks: 35.0,
      order: 1,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        if (!sc.hasNext()) return;
        String t = sc.next();

        // TODO: Find and print the minimum window substring of s containing all characters of t
        // If no such substring exists, print nothing.

    }
}`,
      }),
      starterCode: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        if (!sc.hasNext()) return;
        String t = sc.next();

        // TODO: Find and print the minimum window substring of s containing all characters of t
        // If no such substring exists, print nothing.

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

  // 5. Question 3: Valid Parentheses
  const q3Cases = generateValidParenthesesCases();
  console.log(`Generating Q3 (Valid Parentheses) with ${q3Cases.length} testcases...`);
  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: section.id,
      type: "CODING",
      title: "Valid Parentheses",
      description: `### Problem Statement
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is **valid**.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

---

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print \`true\` if the bracket string is valid and correctly balanced, otherwise print \`false\`.

### Constraints
- $1 \\le \\text{length}(s) \\le 10^4$
- \`s\` consists of parentheses only: \`'()[]{}'\`.

---

### Examples

**Example 1:**
- **Input:**
  \`\`\`text
  ()
  \`\`\`
- **Output:**
  \`\`\`text
  true
  \`\`\`

**Example 2:**
- **Input:**
  \`\`\`text
  ()[]{}
  \`\`\`
- **Output:**
  \`\`\`text
  true
  \`\`\`

**Example 3:**
- **Input:**
  \`\`\`text
  (]
  \`\`\`
- **Output:**
  \`\`\`text
  false
  \`\`\`

**Example 4:**
- **Input:**
  \`\`\`text
  ([])
  \`\`\`
- **Output:**
  \`\`\`text
  true
  \`\`\`
`,
      marks: 30.0,
      order: 2,
      allowedLanguages: "JAVA",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      starterCodes: JSON.stringify({
        JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNext() ? sc.next() : "";

        // TODO: Print "true" if brackets are balanced and correctly closed, otherwise "false"

    }
}`,
      }),
      starterCode: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNext() ? sc.next() : "";

        // TODO: Print "true" if brackets are balanced and correctly closed, otherwise "false"

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

  console.log("================================================================================");
  console.log("✅ Assessment 'B1' generated successfully!");
  console.log("   - Code: B1");
  console.log("   - Title: B1");
  console.log("   - Duration: 60 minutes");
  console.log("   - Require SEB: true (Quit password: exit123)");
  console.log("   - Allowed Languages: JAVA");
  console.log("   - Total Questions: 3");
  console.log(`     * Longest Palindromic Substring (35 Marks): ${q1Cases.length} Testcases (10 Open + 90 Closed)`);
  console.log(`     * Minimum Window Substring (35 Marks): ${q2Cases.length} Testcases (10 Open + 90 Closed)`);
  console.log(`     * Valid Parentheses (30 Marks): ${q3Cases.length} Testcases (10 Open + 90 Closed)`);
  console.log("   - Total Test Cases: 300");
  console.log("================================================================================");
}

main()
  .catch((e) => {
    console.error("❌ Error generating assessment B1:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
