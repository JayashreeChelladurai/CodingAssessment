import { prisma } from "../src/db.js";

interface ProblemDef {
  title: string;
  description: string;
  marks: number;
  starterCodes: {
    JAVA: string;
    C: string;
    CPP: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
    weight: number;
  }>;
}

// 25 Problems for Category A (Array, String, Binary) with clean SKELETON starter codes
const CATEGORY_A: ProblemDef[] = [
  // 1. Two Sum
  {
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Print the two 0-based indices separated by space in ascending order.\n\nInput Format:\nLine 1: Integer N\nLine 2: N space-separated integers\nLine 3: Integer target\n\nOutput Format:\nTwo space-separated indices.",
    marks: 25,
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

        // TODO: Find two numbers that add up to target and print their 0-based indices
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int target;
    scanf("%d", &target);

    // TODO: Find two numbers that add up to target and print their 0-based indices

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int target;
    cin >> target;

    // TODO: Find two numbers that add up to target and print their 0-based indices

    return 0;
}`
    },
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isPublic: true, weight: 1 },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isPublic: true, weight: 1 },
      { input: "2\n3 3\n6", expectedOutput: "0 1", isPublic: false, weight: 2 },
      { input: "5\n1 5 3 7 9\n12", expectedOutput: "1 3", isPublic: false, weight: 2 }
    ]
  },
  // 2. Best Time to Buy and Sell Stock
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.\n\nInput Format:\nLine 1: N\nLine 2: N space-separated integers\n\nOutput Format:\nSingle integer representing max profit.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] prices = new int[n];
        for (int i = 0; i < n; i++) {
            prices[i] = sc.nextInt();
        }

        // TODO: Calculate and print maximum achievable profit
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int prices[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &prices[i]);
    }

    // TODO: Calculate and print maximum achievable profit

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> prices(n);
    for (int i = 0; i < n; i++) {
        cin >> prices[i];
    }

    // TODO: Calculate and print maximum achievable profit

    return 0;
}`
    },
    testCases: [
      { input: "6\n7 1 5 3 6 4", expectedOutput: "5", isPublic: true, weight: 1 },
      { input: "5\n7 6 4 3 1", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "4\n1 2 3 4", expectedOutput: "3", isPublic: false, weight: 2 },
      { input: "2\n2 4", expectedOutput: "2", isPublic: false, weight: 2 }
    ]
  },
  // 3. Contains Duplicate
  {
    title: "Contains Duplicate",
    description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    marks: 25,
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

        // TODO: Print "true" if any value appears at least twice, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Print "true" if any value appears at least twice, otherwise "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <unordered_set>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Print "true" if any value appears at least twice, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "4\n1 2 3 4", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "10\n1 1 1 3 3 4 3 2 4 2", expectedOutput: "true", isPublic: false, weight: 2 }
    ]
  },
  // 4. Product of Array Except Self
  {
    title: "Product of Array Except Self",
    description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. Solve it in O(n) time without using the division operation.",
    marks: 25,
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

        // TODO: Compute product of array except self without division and print space-separated
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Compute product of array except self without division and print space-separated

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Compute product of array except self without division and print space-separated

    return 0;
}`
    },
    testCases: [
      { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", isPublic: true, weight: 1 },
      { input: "5\n-1 1 0 -3 3", expectedOutput: "0 0 9 0 0", isPublic: true, weight: 1 },
      { input: "2\n5 2", expectedOutput: "2 5", isPublic: false, weight: 2 }
    ]
  },
  // 5. Maximum Subarray (Kadane's Algorithm)
  {
    title: "Maximum Subarray (Kadane)",
    description: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    marks: 25,
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

        // TODO: Implement Kadane's Algorithm to find and print the maximum subarray sum
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Implement Kadane's Algorithm to find and print the maximum subarray sum

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Implement Kadane's Algorithm to find and print the maximum subarray sum

    return 0;
}`
    },
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "1\n1", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "5\n5 4 -1 7 8", expectedOutput: "23", isPublic: false, weight: 2 },
      { input: "3\n-3 -2 -1", expectedOutput: "-1", isPublic: false, weight: 2 }
    ]
  },
  // 6. Maximum Product Subarray
  {
    title: "Maximum Product Subarray",
    description: "Given an integer array `nums`, find a subarray that has the largest product of its elements, and return the product.",
    marks: 25,
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

        // TODO: Find and print the maximum product of a contiguous subarray
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Find and print the maximum product of a contiguous subarray

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Find and print the maximum product of a contiguous subarray

    return 0;
}`
    },
    testCases: [
      { input: "4\n2 3 -2 4", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "3\n-2 0 -1", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "3\n-2 3 -4", expectedOutput: "24", isPublic: false, weight: 2 }
    ]
  },
  // 7. Find Minimum in Rotated Sorted Array
  {
    title: "Find Minimum in Rotated Sorted Array",
    description: "Suppose an array of length `n` sorted in ascending order is rotated between 1 and `n` times. Given the sorted rotated array `nums` of unique elements, return the minimum element in O(log n) time.",
    marks: 25,
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

        // TODO: Find and print the minimum element in O(log n) time
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Find and print the minimum element in O(log n) time

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Find and print the minimum element in O(log n) time

    return 0;
}`
    },
    testCases: [
      { input: "5\n3 4 5 1 2", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "7\n4 5 6 7 0 1 2", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "4\n11 13 15 17", expectedOutput: "11", isPublic: false, weight: 2 }
    ]
  },
  // 8. Search in Rotated Sorted Array
  {
    title: "Search in Rotated Sorted Array",
    description: "Given a rotated sorted array of unique integers `nums` and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not.",
    marks: 25,
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

        // TODO: Search for target in rotated sorted array in O(log n) and print its index (-1 if absent)
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int target;
    scanf("%d", &target);

    // TODO: Search for target in rotated sorted array in O(log n) and print its index (-1 if absent)

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int target;
    cin >> target;

    // TODO: Search for target in rotated sorted array in O(log n) and print its index (-1 if absent)

    return 0;
}`
    },
    testCases: [
      { input: "7\n4 5 6 7 0 1 2\n0", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "7\n4 5 6 7 0 1 2\n3", expectedOutput: "-1", isPublic: true, weight: 1 },
      { input: "1\n1\n0", expectedOutput: "-1", isPublic: false, weight: 2 }
    ]
  },
  // 9. 3Sum
  {
    title: "3Sum",
    description: "Given an integer array nums, return the number of distinct triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
    marks: 25,
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

        // TODO: Count and print the number of unique triplets that sum to 0
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Count and print the number of unique triplets that sum to 0

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Count and print the number of unique triplets that sum to 0

    return 0;
}`
    },
    testCases: [
      { input: "6\n-1 0 1 2 -1 -4", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "3\n0 1 1", expectedOutput: "0", isPublic: true, weight: 1 },
      { input: "3\n0 0 0", expectedOutput: "1", isPublic: false, weight: 2 }
    ]
  },
  // 10. Container With Most Water
  {
    title: "Container With Most Water",
    description: "Given n non-negative integers `a_1, a_2, ..., a_n`, where each represents a point at coordinate `(i, a_i)`. Find two lines that together with the x-axis form a container that contains the most water.",
    marks: 25,
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

        // TODO: Find and print the maximum area of water the container can store
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int h[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &h[i]);
    }

    // TODO: Find and print the maximum area of water the container can store

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> h(n);
    for (int i = 0; i < n; i++) {
        cin >> h[i];
    }

    // TODO: Find and print the maximum area of water the container can store

    return 0;
}`
    },
    testCases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49", isPublic: true, weight: 1 },
      { input: "2\n1 1", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "5\n4 3 2 1 4", expectedOutput: "16", isPublic: false, weight: 2 }
    ]
  },
  // 11. Longest Substring Without Repeating Characters
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";

        // TODO: Find and print the length of the longest substring without repeating characters
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[2000];
    if (!fgets(s, sizeof(s), stdin)) return 0;
    int len = strlen(s);
    while (len > 0 && (s[len-1] == '\\n' || s[len-1] == '\\r')) s[--len] = '\\0';

    // TODO: Find and print the length of the longest substring without repeating characters

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <unordered_map>

using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) return 0;

    // TODO: Find and print the length of the longest substring without repeating characters

    return 0;
}`
    },
    testCases: [
      { input: "abcabcbb", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "bbbbb", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "pwwkew", expectedOutput: "3", isPublic: false, weight: 2 }
    ]
  },
  // 12. Longest Repeating Character Replacement
  {
    title: "Longest Repeating Character Replacement",
    description: "Given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character at most `k` times. Return the length of the longest substring containing the same letter you can get after performing the above operations.\n\nInput:\nLine 1: String S\nLine 2: Integer K",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        int k = sc.nextInt();

        // TODO: Compute and print the max length of substring with same letters after at most k replacements
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[2000];
    int k;
    if (scanf("%s %d", s, &k) != 2) return 0;

    // TODO: Compute and print the max length of substring with same letters after at most k replacements

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    string s;
    int k;
    if (!(cin >> s >> k)) return 0;

    // TODO: Compute and print the max length of substring with same letters after at most k replacements

    return 0;
}`
    },
    testCases: [
      { input: "ABAB\n2", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "AABABBA\n1", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "AAAA\n2", expectedOutput: "4", isPublic: false, weight: 2 }
    ]
  },
  // 13. Minimum Window Substring
  {
    title: "Minimum Window Substring",
    description: "Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return \"\".\n\nInput:\nLine 1: String S\nLine 2: String T",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String t = sc.next();

        // TODO: Find and print the minimum window substring of s containing all characters of t
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[2000], t[2000];
    if (scanf("%s %s", s, t) != 2) return 0;

    // TODO: Find and print the minimum window substring of s containing all characters of t

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <unordered_map>

using namespace std;

int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;

    // TODO: Find and print the minimum window substring of s containing all characters of t

    return 0;
}`
    },
    testCases: [
      { input: "ADOBECODEBANC\nABC", expectedOutput: "BANC", isPublic: true, weight: 1 },
      { input: "a\na", expectedOutput: "a", isPublic: true, weight: 1 },
      { input: "a\naa", expectedOutput: "", isPublic: false, weight: 2 }
    ]
  },
  // 14. Valid Anagram
  {
    title: "Valid Anagram",
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String t = sc.next();

        // TODO: Print "true" if t is an anagram of s, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1000], t[1000];
    if (scanf("%s %s", s, t) != 2) return 0;

    // TODO: Print "true" if t is an anagram of s, otherwise "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;

    // TODO: Print "true" if t is an anagram of s, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "anagram nagaram", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "rat car", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "listen silent", expectedOutput: "true", isPublic: false, weight: 2 }
    ]
  },
  // 15. Group Anagrams
  {
    title: "Group Anagrams",
    description: "Given an array of strings `strs`, print the number of unique anagram groups present.",
    marks: 25,
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

        // TODO: Count and print the number of distinct anagram groups
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char words[100][100];
    for (int i = 0; i < n; i++) {
        scanf("%s", words[i]);
    }

    // TODO: Count and print the number of distinct anagram groups

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> words(n);
    for (int i = 0; i < n; i++) {
        cin >> words[i];
    }

    // TODO: Count and print the number of distinct anagram groups

    return 0;
}`
    },
    testCases: [
      { input: "6\neat tea tan ate nat bat", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "1\na", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "2\na b", expectedOutput: "2", isPublic: false, weight: 2 }
    ]
  },
  // 16. Valid Parentheses
  {
    title: "Valid Parentheses",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNext() ? sc.next() : "";

        // TODO: Print "true" if brackets are balanced and correctly closed, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[2000];
    if (scanf("%s", s) != 1) return 0;

    // TODO: Print "true" if brackets are balanced and correctly closed, otherwise "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Print "true" if brackets are balanced and correctly closed, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "()", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "()[]{}", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "(]", expectedOutput: "false", isPublic: false, weight: 2 },
      { input: "([)]", expectedOutput: "false", isPublic: false, weight: 2 }
    ]
  },
  // 17. Valid Palindrome
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";

        // TODO: Print "true" if the string is a valid palindrome ignoring non-alphanumeric chars, else "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main() {
    char s[2000];
    if (!fgets(s, sizeof(s), stdin)) return 0;

    // TODO: Print "true" if the string is a valid palindrome ignoring non-alphanumeric chars, else "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) return 0;

    // TODO: Print "true" if the string is a valid palindrome ignoring non-alphanumeric chars, else "false"

    return 0;
}`
    },
    testCases: [
      { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "race a car", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: " ", expectedOutput: "true", isPublic: false, weight: 2 }
    ]
  },
  // 18. Longest Palindromic Substring
  {
    title: "Longest Palindromic Substring",
    description: "Given a string `s`, return the longest palindromic substring in `s`.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Find and print the longest palindromic substring in s
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[2000];
    if (scanf("%s", s) != 1) return 0;

    // TODO: Find and print the longest palindromic substring in s

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Find and print the longest palindromic substring in s

    return 0;
}`
    },
    testCases: [
      { input: "babad", expectedOutput: "bab", isPublic: true, weight: 1 },
      { input: "cbbd", expectedOutput: "bb", isPublic: true, weight: 1 },
      { input: "a", expectedOutput: "a", isPublic: false, weight: 2 }
    ]
  },
  // 19. Palindromic Substrings
  {
    title: "Palindromic Substrings",
    description: "Given a string `s`, return the number of palindromic substrings in it.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Count and print the total number of palindromic substrings
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[2000];
    if (scanf("%s", s) != 1) return 0;

    // TODO: Count and print the total number of palindromic substrings

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Count and print the total number of palindromic substrings

    return 0;
}`
    },
    testCases: [
      { input: "abc", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "aaa", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "racecar", expectedOutput: "10", isPublic: false, weight: 2 }
    ]
  },
  // 20. Encode and Decode Strings
  {
    title: "Encode and Decode Strings",
    description: "Design an algorithm to encode a list of strings to a single string and decode it back. Output the decoded strings count and concatenated form separated by comma.",
    marks: 25,
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

        // TODO: Encode the list of strings into a single string and decode back
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char words[100][100];
    for (int i = 0; i < n; i++) {
        scanf("%s", words[i]);
    }

    // TODO: Encode the list of strings into a single string and decode back

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> words(n);
    for (int i = 0; i < n; i++) {
        cin >> words[i];
    }

    // TODO: Encode the list of strings into a single string and decode back

    return 0;
}`
    },
    testCases: [
      { input: "2\nlint code", expectedOutput: "2 lint,code", isPublic: true, weight: 1 },
      { input: "1\nhello", expectedOutput: "1 hello", isPublic: true, weight: 1 }
    ]
  },
  // 21. Sum of Two Integers (Bitwise)
  {
    title: "Sum of Two Integers (Bitwise)",
    description: "Given two integers `a` and `b`, return the sum of the two integers without using the operators `+` and `-`.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int a = sc.nextInt();
        int b = sc.nextInt();

        // TODO: Compute and print the sum of a and b without using '+' or '-' operators
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 0;

    // TODO: Compute and print the sum of a and b without using '+' or '-' operators

    return 0;
}`,
      CPP: `#include <iostream>

using namespace std;

int main() {
    int a, b;
    if (!(cin >> a >> b)) return 0;

    // TODO: Compute and print the sum of a and b without using '+' or '-' operators

    return 0;
}`
    },
    testCases: [
      { input: "1 2", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "2 3", expectedOutput: "5", isPublic: true, weight: 1 },
      { input: "-1 1", expectedOutput: "0", isPublic: false, weight: 2 }
    ]
  },
  // 22. Number of 1 Bits (Hamming Weight)
  {
    title: "Number of 1 Bits",
    description: "Given a positive integer `n`, write a function that returns the number of set bits ('1's) it has in its binary representation.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // TODO: Count and print the number of '1' bits in n
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // TODO: Count and print the number of '1' bits in n

    return 0;
}`,
      CPP: `#include <iostream>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

    // TODO: Count and print the number of '1' bits in n

    return 0;
}`
    },
    testCases: [
      { input: "11", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "128", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "15", expectedOutput: "4", isPublic: false, weight: 2 }
    ]
  },
  // 23. Counting Bits
  {
    title: "Counting Bits",
    description: "Given an integer `n`, return an array `ans` of length `n + 1` such that for each `i` (`0 <= i <= n`), `ans[i]` is the number of `1`'s in the binary representation of `i`.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // TODO: Compute and print the number of 1 bits for every number from 0 to n space-separated
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // TODO: Compute and print the number of 1 bits for every number from 0 to n space-separated

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

    // TODO: Compute and print the number of 1 bits for every number from 0 to n space-separated

    return 0;
}`
    },
    testCases: [
      { input: "2", expectedOutput: "0 1 1", isPublic: true, weight: 1 },
      { input: "5", expectedOutput: "0 1 1 2 1 2", isPublic: true, weight: 1 }
    ]
  },
  // 24. Missing Number
  {
    title: "Missing Number",
    description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
    marks: 25,
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

        // TODO: Find and print the missing number from range [0, n]
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Find and print the missing number from range [0, n]

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Find and print the missing number from range [0, n]

    return 0;
}`
    },
    testCases: [
      { input: "3\n3 0 1", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "2\n0 1", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "9\n9 6 4 2 3 5 7 0 1", expectedOutput: "8", isPublic: false, weight: 2 }
    ]
  },
  // 25. Reverse Bits
  {
    title: "Reverse Bits",
    description: "Reverse bits of a given 32 bits unsigned integer and print the result.",
    marks: 25,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLong()) return;
        long n = sc.nextLong();

        // TODO: Reverse the 32 bits of n and print the resulting unsigned integer value
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    unsigned int n;
    if (scanf("%u", &n) != 1) return 0;

    // TODO: Reverse the 32 bits of n and print the resulting unsigned integer value

    return 0;
}`,
      CPP: `#include <iostream>

using namespace std;

int main() {
    unsigned int n;
    if (!(cin >> n)) return 0;

    // TODO: Reverse the 32 bits of n and print the resulting unsigned integer value

    return 0;
}`
    },
    testCases: [
      { input: "43261596", expectedOutput: "964176192", isPublic: true, weight: 1 },
      { input: "1", expectedOutput: "2147483648", isPublic: false, weight: 2 }
    ]
  }
];

// 25 Problems for Category B (DP, Intervals, Linked List, Heap) with clean SKELETON starter codes
const CATEGORY_B: ProblemDef[] = [
  // 1. Climbing Stairs
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // TODO: Calculate and print the number of distinct ways to climb n stairs
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // TODO: Calculate and print the number of distinct ways to climb n stairs

    return 0;
}`,
      CPP: `#include <iostream>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

    // TODO: Calculate and print the number of distinct ways to climb n stairs

    return 0;
}`
    },
    testCases: [
      { input: "2", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "3", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "5", expectedOutput: "8", isPublic: false, weight: 2 }
    ]
  },
  // 2. Coin Change
  {
    title: "Coin Change",
    description: "Given an integer array `coins` and an integer `amount`, return the fewest number of coins that you need to make up that amount. If that amount cannot be made up, return `-1`.\n\nInput:\nLine 1: N\nLine 2: N coin values\nLine 3: Target amount",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) {
            coins[i] = sc.nextInt();
        }
        int amount = sc.nextInt();

        // TODO: Find fewest coins needed to make up amount (-1 if impossible)
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int coins[100];
    for (int i = 0; i < n; i++) {
        scanf("%d", &coins[i]);
    }
    int amount;
    scanf("%d", &amount);

    // TODO: Find fewest coins needed to make up amount (-1 if impossible)

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
    for (int i = 0; i < n; i++) {
        cin >> coins[i];
    }
    int amount;
    cin >> amount;

    // TODO: Find fewest coins needed to make up amount (-1 if impossible)

    return 0;
}`
    },
    testCases: [
      { input: "3\n1 2 5\n11", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "1\n2\n3", expectedOutput: "-1", isPublic: true, weight: 1 },
      { input: "1\n1\n0", expectedOutput: "0", isPublic: false, weight: 2 }
    ]
  },
  // 3. Longest Increasing Subsequence
  {
    title: "Longest Increasing Subsequence",
    description: "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.",
    marks: 35,
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

        // TODO: Find and print the length of the longest strictly increasing subsequence
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Find and print the length of the longest strictly increasing subsequence

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Find and print the length of the longest strictly increasing subsequence

    return 0;
}`
    },
    testCases: [
      { input: "8\n10 9 2 5 3 7 101 18", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "6\n0 1 0 3 2 3", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "7\n7 7 7 7 7 7 7", expectedOutput: "1", isPublic: false, weight: 2 }
    ]
  },
  // 4. Longest Common Subsequence
  {
    title: "Longest Common Subsequence",
    description: "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s1 = sc.next();
        String s2 = sc.next();

        // TODO: Calculate and print the length of the longest common subsequence of s1 and s2
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s1[1000], s2[1000];
    if (scanf("%s %s", s1, s2) != 2) return 0;

    // TODO: Calculate and print the length of the longest common subsequence of s1 and s2

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    string s1, s2;
    if (!(cin >> s1 >> s2)) return 0;

    // TODO: Calculate and print the length of the longest common subsequence of s1 and s2

    return 0;
}`
    },
    testCases: [
      { input: "abcde ace", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "abc abc", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "abc def", expectedOutput: "0", isPublic: false, weight: 2 }
    ]
  },
  // 5. Word Break
  {
    title: "Word Break",
    description: "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.\n\nInput:\nLine 1: Target string S\nLine 2: N (word count)\nLine 3: N space-separated dictionary words",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        int n = sc.nextInt();
        Set<String> dict = new HashSet<>();
        for (int i = 0; i < n; i++) {
            dict.add(sc.next());
        }

        // TODO: Print "true" if s can be segmented using words in dict, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1000], dict[100][100];
    int n;
    if (scanf("%s %d", s, &n) != 2) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%s", dict[i]);
    }

    // TODO: Print "true" if s can be segmented using words in dict, otherwise "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>

using namespace std;

int main() {
    string s;
    int n;
    if (!(cin >> s >> n)) return 0;
    unordered_set<string> dict;
    for (int i = 0; i < n; i++) {
        string w; cin >> w; dict.insert(w);
    }

    // TODO: Print "true" if s can be segmented using words in dict, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "leetcode\n2\nleet code", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "applepenapple\n2\napple pen", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "catsandog\n5\ncats dog sand and cat", expectedOutput: "false", isPublic: false, weight: 2 }
    ]
  },
  // 6. Combination Sum
  {
    title: "Combination Sum",
    description: "Given an array of distinct integers `candidates` and a target integer `target`, return the total count of unique combinations of candidates where the chosen numbers sum to target.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] candidates = new int[n];
        for (int i = 0; i < n; i++) {
            candidates[i] = sc.nextInt();
        }
        int target = sc.nextInt();

        // TODO: Count and print the number of unique combinations summing to target
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[100];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int target;
    scanf("%d", &target);

    // TODO: Count and print the number of unique combinations summing to target

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int target;
    cin >> target;

    // TODO: Count and print the number of unique combinations summing to target

    return 0;
}`
    },
    testCases: [
      { input: "4\n2 3 6 7\n7", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "3\n2 3 5\n8", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "1\n2\n1", expectedOutput: "0", isPublic: false, weight: 2 }
    ]
  },
  // 7. House Robber
  {
    title: "House Robber",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected. Return the maximum amount of money you can rob tonight without alerting the police.",
    marks: 35,
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

        // TODO: Calculate and print max money you can rob without robbing adjacent houses
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Calculate and print max money you can rob without robbing adjacent houses

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Calculate and print max money you can rob without robbing adjacent houses

    return 0;
}`
    },
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "5\n2 7 9 3 1", expectedOutput: "12", isPublic: true, weight: 1 }
    ]
  },
  // 8. House Robber II
  {
    title: "House Robber II",
    description: "All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Return the maximum amount of money you can rob tonight without alerting the police.",
    marks: 35,
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

        // TODO: Calculate max money from houses arranged in a circle
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Calculate max money from houses arranged in a circle

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Calculate max money from houses arranged in a circle

    return 0;
}`
    },
    testCases: [
      { input: "3\n2 3 2", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "4\n1 2 3 1", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "3\n1 2 3", expectedOutput: "3", isPublic: false, weight: 2 }
    ]
  },
  // 9. Decode Ways
  {
    title: "Decode Ways",
    description: "A message containing letters from A-Z can be encoded into numbers using 'A' -> 1, ..., 'Z' -> 26. Given a string `s` containing only digits, return the number of ways to decode it.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Calculate and print the number of possible decoding ways
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1000];
    if (scanf("%s", s) != 1) return 0;

    // TODO: Calculate and print the number of possible decoding ways

    return 0;
}`,
      CPP: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Calculate and print the number of possible decoding ways

    return 0;
}`
    },
    testCases: [
      { input: "12", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "226", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "06", expectedOutput: "0", isPublic: false, weight: 2 }
    ]
  },
  // 10. Unique Paths
  {
    title: "Unique Paths",
    description: "There is a robot on an `m x n` grid. The robot is initially located at the top-left corner `(0, 0)`. The robot tries to move to the bottom-right corner `(m - 1, n - 1)`. The robot can only move either down or right at any point in time. Return the number of possible unique paths.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();

        // TODO: Compute and print the number of unique paths from top-left to bottom-right
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;

    // TODO: Compute and print the number of unique paths from top-left to bottom-right

    return 0;
}`,
      CPP: `#include <iostream>

using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;

    // TODO: Compute and print the number of unique paths from top-left to bottom-right

    return 0;
}`
    },
    testCases: [
      { input: "3 7", expectedOutput: "28", isPublic: true, weight: 1 },
      { input: "3 2", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "3 3", expectedOutput: "6", isPublic: false, weight: 2 }
    ]
  },
  // 11. Jump Game
  {
    title: "Jump Game",
    description: "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise.",
    marks: 35,
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

        // TODO: Print "true" if you can reach the last index, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Print "true" if you can reach the last index, otherwise "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Print "true" if you can reach the last index, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "5\n2 3 1 1 4", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "5\n3 2 1 0 4", expectedOutput: "false", isPublic: true, weight: 1 }
    ]
  },
  // 12. Insert Interval
  {
    title: "Insert Interval",
    description: "You are given an array of non-overlapping intervals `intervals` where `intervals[i] = [start_i, end_i]` sorted in ascending order by `start_i`. You are also given an interval `newInterval = [start, end]`. Insert `newInterval` into `intervals` such that `intervals` is still sorted and non-overlapping. Output the count of intervals after insertion.",
    marks: 35,
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

        // TODO: Insert new interval, merge overlaps, and print the resulting intervals count
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int s[100], e[100];
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &s[i], &e[i]);
    }
    int ns, ne;
    scanf("%d %d", &ns, &ne);

    // TODO: Insert new interval, merge overlaps, and print the resulting intervals count

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
    for (int i = 0; i < n; i++) {
        cin >> intervals[i].first >> intervals[i].second;
    }
    int ns, ne;
    cin >> ns >> ne;

    // TODO: Insert new interval, merge overlaps, and print the resulting intervals count

    return 0;
}`
    },
    testCases: [
      { input: "2\n1 3\n6 9\n2 5", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8", expectedOutput: "3", isPublic: true, weight: 1 }
    ]
  },
  // 13. Merge Intervals
  {
    title: "Merge Intervals",
    description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return the number of non-overlapping intervals that cover all the intervals in the input.",
    marks: 35,
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

        // TODO: Merge overlapping intervals and print the final count of intervals
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int s[1000], e[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &s[i], &e[i]);
    }

    // TODO: Merge overlapping intervals and print the final count of intervals

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
    for (int i = 0; i < n; i++) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    // TODO: Merge overlapping intervals and print the final count of intervals

    return 0;
}`
    },
    testCases: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "2\n1 4\n4 5", expectedOutput: "1", isPublic: true, weight: 1 }
    ]
  },
  // 14. Non-overlapping Intervals
  {
    title: "Non-overlapping Intervals",
    description: "Given an array of intervals `intervals` where `intervals[i] = [start_i, end_i]`, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.",
    marks: 35,
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

        // TODO: Find minimum number of intervals to remove for zero overlap
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int s[1000], e[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &s[i], &e[i]);
    }

    // TODO: Find minimum number of intervals to remove for zero overlap

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
    for (int i = 0; i < n; i++) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    // TODO: Find minimum number of intervals to remove for zero overlap

    return 0;
}`
    },
    testCases: [
      { input: "4\n1 2\n2 3\n3 4\n1 3", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "3\n1 2\n1 2\n1 2", expectedOutput: "2", isPublic: true, weight: 1 }
    ]
  },
  // 15. Meeting Rooms (Can Attend)
  {
    title: "Meeting Rooms",
    description: "Given an array of meeting time intervals consisting of start and end times `[[s1,e1],[s2,e2],...]` (`si < ei`), determine if a person could attend all meetings without overlap.",
    marks: 35,
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

        // TODO: Print "true" if all meetings can be attended without overlap, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int s[1000], e[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &s[i], &e[i]);
    }

    // TODO: Print "true" if all meetings can be attended without overlap, otherwise "false"

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
    for (int i = 0; i < n; i++) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    // TODO: Print "true" if all meetings can be attended without overlap, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "3\n0 30\n5 10\n15 20", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "2\n7 10\n2 4", expectedOutput: "true", isPublic: true, weight: 1 }
    ]
  },
  // 16. Meeting Rooms II
  {
    title: "Meeting Rooms II",
    description: "Given an array of meeting time intervals consisting of start and end times `[[s1,e1],[s2,e2],...]`, find the minimum number of conference rooms required.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] starts = new int[n];
        int[] ends = new int[n];
        for (int i = 0; i < n; i++) {
            starts[i] = sc.nextInt();
            ends[i] = sc.nextInt();
        }

        // TODO: Find and print the minimum number of conference rooms required
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int starts[1000], ends[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &starts[i], &ends[i]);
    }

    // TODO: Find and print the minimum number of conference rooms required

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> starts(n), ends(n);
    for (int i = 0; i < n; i++) {
        cin >> starts[i] >> ends[i];
    }

    // TODO: Find and print the minimum number of conference rooms required

    return 0;
}`
    },
    testCases: [
      { input: "3\n0 30\n5 10\n15 20", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "2\n7 10\n2 4", expectedOutput: "1", isPublic: true, weight: 1 }
    ]
  },
  // 17. Reverse Linked List
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list with N integers, reverse the list and print the reversed elements separated by space.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
        }

        // TODO: Reverse the linked list elements and print them space-separated
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    // TODO: Reverse the linked list elements and print them space-separated

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // TODO: Reverse the linked list elements and print them space-separated

    return 0;
}`
    },
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isPublic: true, weight: 1 },
      { input: "2\n1 2", expectedOutput: "2 1", isPublic: true, weight: 1 }
    ]
  },
  // 18. Linked List Cycle
  {
    title: "Linked List Cycle",
    description: "Given an array of nodes with next pointers specified by an index array `pos` (-1 if no cycle), determine if the linked list has a cycle in it.",
    marks: 35,
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
        int pos = sc.nextInt();

        // TODO: Print "true" if the linked list has a cycle, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int vals[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &vals[i]);
    }
    int pos;
    scanf("%d", &pos);

    // TODO: Print "true" if the linked list has a cycle, otherwise "false"

    return 0;
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
    int pos;
    cin >> pos;

    // TODO: Print "true" if the linked list has a cycle, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "4\n3 2 0 -4\n1", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "1\n1\n-1", expectedOutput: "false", isPublic: true, weight: 1 }
    ]
  },
  // 19. Merge Two Sorted Lists
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list.",
    marks: 35,
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

        // TODO: Merge the two sorted arrays into one sorted sequence and print space-separated
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int m;
    scanf("%d", &m);
    int b[1000];
    for (int i = 0; i < m; i++) scanf("%d", &b[i]);

    // TODO: Merge the two sorted arrays into one sorted sequence and print space-separated

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

    // TODO: Merge the two sorted arrays into one sorted sequence and print space-separated

    return 0;
}`
    },
    testCases: [
      { input: "3\n1 2 4\n3\n1 3 4", expectedOutput: "1 1 2 3 4 4", isPublic: true, weight: 1 },
      { input: "1\n0\n1\n0", expectedOutput: "0 0", isPublic: true, weight: 1 }
    ]
  },
  // 20. Merge k Sorted Lists
  {
    title: "Merge k Sorted Lists",
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int k = sc.nextInt();
        List<List<Integer>> lists = new ArrayList<>();
        for (int i = 0; i < k; i++) {
            int len = sc.nextInt();
            List<Integer> list = new ArrayList<>();
            for (int j = 0; j < len; j++) list.add(sc.nextInt());
            lists.add(list);
        }

        // TODO: Merge all k sorted lists using a PriorityQueue / min-heap and print space-separated
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int k;
    if (scanf("%d", &k) != 1) return 0;
    int all[5000], total = 0;
    for (int i = 0; i < k; i++) {
        int len; scanf("%d", &len);
        for (int j = 0; j < len; j++) scanf("%d", &all[total++]);
    }

    // TODO: Merge all k sorted lists into a single sorted array and print space-separated

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    int k;
    if (!(cin >> k)) return 0;
    vector<vector<int>> lists(k);
    for (int i = 0; i < k; i++) {
        int len; cin >> len;
        lists[i].resize(len);
        for (int j = 0; j < len; j++) cin >> lists[i][j];
    }

    // TODO: Merge all k sorted lists using a priority_queue and print space-separated

    return 0;
}`
    },
    testCases: [
      { input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", expectedOutput: "1 1 2 3 4 4 5 6", isPublic: true, weight: 1 }
    ]
  },
  // 21. Remove Nth Node From End of List
  {
    title: "Remove Nth Node From End of List",
    description: "Given the head of a linked list of length M, remove the `n-th` node from the end of the list and return the remaining elements.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int[] a = new int[m];
        for (int i = 0; i < m; i++) a[i] = sc.nextInt();
        int n = sc.nextInt();

        // TODO: Remove the n-th node from end of the list and print remaining elements space-separated
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m;
    if (scanf("%d", &m) != 1) return 0;
    int a[1000];
    for (int i = 0; i < m; i++) scanf("%d", &a[i]);
    int n;
    scanf("%d", &n);

    // TODO: Remove the n-th node from end of the list and print remaining elements space-separated

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int m;
    if (!(cin >> m)) return 0;
    vector<int> a(m);
    for (int i = 0; i < m; i++) cin >> a[i];
    int n;
    cin >> n;

    // TODO: Remove the n-th node from end of the list and print remaining elements space-separated

    return 0;
}`
    },
    testCases: [
      { input: "5\n1 2 3 4 5\n2", expectedOutput: "1 2 3 5", isPublic: true, weight: 1 }
    ]
  },
  // 22. Reorder List
  {
    title: "Reorder List",
    description: "You are given the head of a singly linked-list: L0 -> L1 -> ... -> Ln-1 -> Ln. Reorder it to be: L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();

        // TODO: Reorder the list elements interleaving front and back and print space-separated
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    // TODO: Reorder the list elements interleaving front and back and print space-separated

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

    // TODO: Reorder the list elements interleaving front and back and print space-separated

    return 0;
}`
    },
    testCases: [
      { input: "4\n1 2 3 4", expectedOutput: "1 4 2 3", isPublic: true, weight: 1 },
      { input: "5\n1 2 3 4 5", expectedOutput: "1 5 2 4 3", isPublic: true, weight: 1 }
    ]
  },
  // 23. Top K Frequent Elements
  {
    title: "Top K Frequent Elements",
    description: "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. Print them sorted in ascending order.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int k = sc.nextInt();

        // TODO: Find k most frequent elements and print them in ascending order
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int k;
    scanf("%d", &k);

    // TODO: Find k most frequent elements and print them in ascending order

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int k;
    cin >> k;

    // TODO: Find k most frequent elements and print them in ascending order

    return 0;
}`
    },
    testCases: [
      { input: "6\n1 1 1 2 2 3\n2", expectedOutput: "1 2", isPublic: true, weight: 1 },
      { input: "1\n1\n1", expectedOutput: "1", isPublic: true, weight: 1 }
    ]
  },
  // 24. Find Median from Data Stream
  {
    title: "Find Median from Data Stream",
    description: "The median is the middle value in an ordered integer list. Given a stream of N integers, find the median after inserting all numbers. Print with 1 decimal place.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();

        // TODO: Compute and print the median with 1 decimal place (e.g. 2.0 or 1.5)
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    // TODO: Compute and print the median with 1 decimal place (e.g. 2.0 or 1.5)

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    // TODO: Compute and print the median with 1 decimal place (e.g. 2.0 or 1.5)

    return 0;
}`
    },
    testCases: [
      { input: "3\n1 2 3", expectedOutput: "2.0", isPublic: true, weight: 1 },
      { input: "2\n1 2", expectedOutput: "1.5", isPublic: true, weight: 1 }
    ]
  },
  // 25. Kth Largest Element in an Array
  {
    title: "Kth Largest Element in an Array",
    description: "Given an integer array `nums` and an integer `k`, return the `k-th` largest element in the array.",
    marks: 35,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int k = sc.nextInt();

        // TODO: Find and print the k-th largest element in the array
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int k;
    scanf("%d", &k);

    // TODO: Find and print the k-th largest element in the array

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int k;
    cin >> k;

    // TODO: Find and print the k-th largest element in the array

    return 0;
}`
    },
    testCases: [
      { input: "6\n3 2 1 5 6 4\n2", expectedOutput: "5", isPublic: true, weight: 1 },
      { input: "9\n3 2 3 1 2 4 5 5 6\n4", expectedOutput: "4", isPublic: true, weight: 1 }
    ]
  }
];

// 25 Problems for Category C (Tree, Graph, Matrix) with clean SKELETON starter codes
const CATEGORY_C: ProblemDef[] = [
  // 1. Maximum Depth of Binary Tree
  {
    title: "Maximum Depth of Binary Tree",
    description: "Given a binary tree represented as level-order traversal with -1 indicating null, return its maximum depth.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] tree = new int[n];
        for (int i = 0; i < n; i++) tree[i] = sc.nextInt();

        // TODO: Calculate and print the maximum depth of the binary tree
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n == 0) { printf("0\\n"); return 0; }
    int tree[1000];
    for (int i = 0; i < n; i++) scanf("%d", &tree[i]);

    // TODO: Calculate and print the maximum depth of the binary tree

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n == 0) { cout << 0 << "\\n"; return 0; }
    vector<int> tree(n);
    for (int i = 0; i < n; i++) cin >> tree[i];

    // TODO: Calculate and print the maximum depth of the binary tree

    return 0;
}`
    },
    testCases: [
      { input: "5\n3 9 20 -1 -1", expectedOutput: "3", isPublic: true, weight: 1 },
      { input: "2\n1 -1", expectedOutput: "2", isPublic: true, weight: 1 }
    ]
  },
  // 2. Same Tree
  {
    title: "Same Tree",
    description: "Given the roots of two binary trees `p` and `q` (represented by level order counts and values), check if they are identical.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int m = sc.nextInt();
        int[] b = new int[m]; for (int i = 0; i < m; i++) b[i] = sc.nextInt();

        // TODO: Print "true" if tree a and tree b are structurally identical and have same values, else "false"
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[100]; for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int m; scanf("%d", &m);
    int b[100]; for (int i = 0; i < m; i++) scanf("%d", &b[i]);

    // TODO: Print "true" if tree a and tree b are structurally identical and have same values, else "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n); for (int i = 0; i < n; i++) cin >> a[i];
    int m; cin >> m;
    vector<int> b(m); for (int i = 0; i < m; i++) cin >> b[i];

    // TODO: Print "true" if tree a and tree b are structurally identical and have same values, else "false"

    return 0;
}`
    },
    testCases: [
      { input: "3\n1 2 3\n3\n1 2 3", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "2\n1 2\n2\n1 3", expectedOutput: "false", isPublic: true, weight: 1 }
    ]
  },
  // 3. Invert/Flip Binary Tree
  {
    title: "Invert Binary Tree",
    description: "Given the root of a binary tree (represented as N node values), invert the tree and print the inverted traversal count.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] tree = new int[n];
        for (int i = 0; i < n; i++) tree[i] = sc.nextInt();

        // TODO: Invert the binary tree and print the inverted tree size
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int tree[1000];
    for (int i = 0; i < n; i++) scanf("%d", &tree[i]);

    // TODO: Invert the binary tree and print the inverted tree size

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> tree(n);
    for (int i = 0; i < n; i++) cin >> tree[i];

    // TODO: Invert the binary tree and print the inverted tree size

    return 0;
}`
    },
    testCases: [
      { input: "7\n4 2 7 1 3 6 9", expectedOutput: "7", isPublic: true, weight: 1 },
      { input: "3\n2 1 3", expectedOutput: "3", isPublic: true, weight: 1 }
    ]
  },
  // 4. Binary Tree Maximum Path Sum
  {
    title: "Binary Tree Maximum Path Sum",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Return the maximum path sum of any non-empty path.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nodes = new int[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.nextInt();

        // TODO: Compute and print the maximum path sum in the binary tree
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nodes[1000];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);

    // TODO: Compute and print the maximum path sum in the binary tree

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // TODO: Compute and print the maximum path sum in the binary tree

    return 0;
}`
    },
    testCases: [
      { input: "3\n1 2 3", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "5\n-10 9 20 15 7", expectedOutput: "51", isPublic: true, weight: 1 }
    ]
  },
  // 5. Binary Tree Level Order Traversal
  {
    title: "Binary Tree Level Order Traversal",
    description: "Given the root of a binary tree with N nodes, return the number of levels present in the tree.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nodes = new int[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.nextInt();

        // TODO: Compute and print the number of levels in the binary tree
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n == 0) { printf("0\\n"); return 0; }
    int nodes[1000];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);

    // TODO: Compute and print the number of levels in the binary tree

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n == 0) { cout << 0 << "\\n"; return 0; }
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // TODO: Compute and print the number of levels in the binary tree

    return 0;
}`
    },
    testCases: [
      { input: "5\n3 9 20 15 7", expectedOutput: "3", isPublic: true, weight: 1 }
    ]
  },
  // 6. Serialize and Deserialize Binary Tree
  {
    title: "Serialize and Deserialize Binary Tree",
    description: "Design an algorithm to serialize and deserialize a binary tree. Output the reconstructed node count.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nodes = new int[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.nextInt();

        // TODO: Serialize tree to string and deserialize back, then print node count
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nodes[1000];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);

    // TODO: Serialize tree to string and deserialize back, then print node count

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // TODO: Serialize tree to string and deserialize back, then print node count

    return 0;
}`
    },
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5", isPublic: true, weight: 1 }
    ]
  },
  // 7. Subtree of Another Tree
  {
    title: "Subtree of Another Tree",
    description: "Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a subtree of `root` with the same structure and node values of `subRoot`.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] root = new int[n]; for (int i = 0; i < n; i++) root[i] = sc.nextInt();
        int m = sc.nextInt();
        int[] subRoot = new int[m]; for (int i = 0; i < m; i++) subRoot[i] = sc.nextInt();

        // TODO: Print "true" if subRoot is a subtree of root, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int root[100]; for (int i = 0; i < n; i++) scanf("%d", &root[i]);
    int m; scanf("%d", &m);
    int subRoot[100]; for (int i = 0; i < m; i++) scanf("%d", &subRoot[i]);

    // TODO: Print "true" if subRoot is a subtree of root, otherwise "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> root(n); for (int i = 0; i < n; i++) cin >> root[i];
    int m; cin >> m;
    vector<int> subRoot(m); for (int i = 0; i < m; i++) cin >> subRoot[i];

    // TODO: Print "true" if subRoot is a subtree of root, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "5\n3 4 5 1 2\n3\n4 1 2", expectedOutput: "true", isPublic: true, weight: 1 }
    ]
  },
  // 8. Construct Binary Tree from Preorder and Inorder Traversal
  {
    title: "Construct Binary Tree from Preorder & Inorder",
    description: "Given two integer arrays `preorder` and `inorder`, construct and return the binary tree root value.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] preorder = new int[n]; for (int i = 0; i < n; i++) preorder[i] = sc.nextInt();
        int[] inorder = new int[n]; for (int i = 0; i < n; i++) inorder[i] = sc.nextInt();

        // TODO: Construct binary tree and print the root node value
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int preorder[100], inorder[100];
    for (int i = 0; i < n; i++) scanf("%d", &preorder[i]);
    for (int i = 0; i < n; i++) scanf("%d", &inorder[i]);

    // TODO: Construct binary tree and print the root node value

    return 0;
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

    // TODO: Construct binary tree and print the root node value

    return 0;
}`
    },
    testCases: [
      { input: "5\n3 9 20 15 7\n9 3 15 20 7", expectedOutput: "3", isPublic: true, weight: 1 }
    ]
  },
  // 9. Validate Binary Search Tree
  {
    title: "Validate Binary Search Tree",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nodes = new int[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.nextInt();

        // TODO: Print "true" if the tree is a valid BST, otherwise "false"
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nodes[100];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);

    // TODO: Print "true" if the tree is a valid BST, otherwise "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // TODO: Print "true" if the tree is a valid BST, otherwise "false"

    return 0;
}`
    },
    testCases: [
      { input: "3\n2 1 3", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "3\n5 1 4", expectedOutput: "false", isPublic: true, weight: 1 }
    ]
  },
  // 10. Kth Smallest Element in a BST
  {
    title: "Kth Smallest Element in a BST",
    description: "Given the root of a binary search tree and an integer `k`, return the `k-th` smallest value (1-indexed) in the BST.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nodes = new int[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.nextInt();
        int k = sc.nextInt();

        // TODO: Find and print the k-th smallest element in the BST
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nodes[1000];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);
    int k;
    scanf("%d", &k);

    // TODO: Find and print the k-th smallest element in the BST

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];
    int k;
    cin >> k;

    // TODO: Find and print the k-th smallest element in the BST

    return 0;
}`
    },
    testCases: [
      { input: "4\n3 1 4 2\n1", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "6\n5 3 6 2 4 1\n3", expectedOutput: "3", isPublic: true, weight: 1 }
    ]
  },
  // 11. Lowest Common Ancestor of a BST
  {
    title: "Lowest Common Ancestor of a BST",
    description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes `p` and `q`.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int rootVal = sc.nextInt();
        int p = sc.nextInt();
        int q = sc.nextInt();

        // TODO: Find and print the lowest common ancestor (LCA) value of p and q
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int rootVal, p, q;
    if (scanf("%d %d %d", &rootVal, &p, &q) != 3) return 0;

    // TODO: Find and print the lowest common ancestor (LCA) value of p and q

    return 0;
}`,
      CPP: `#include <iostream>

using namespace std;

int main() {
    int rootVal, p, q;
    if (!(cin >> rootVal >> p >> q)) return 0;

    // TODO: Find and print the lowest common ancestor (LCA) value of p and q

    return 0;
}`
    },
    testCases: [
      { input: "6 2 8", expectedOutput: "6", isPublic: true, weight: 1 },
      { input: "6 2 4", expectedOutput: "2", isPublic: true, weight: 1 }
    ]
  },
  // 12. Implement Trie (Prefix Tree)
  {
    title: "Implement Trie (Prefix Tree)",
    description: "A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Given N insertions and a search prefix, return `true` if the prefix exists.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        List<String> words = new ArrayList<>();
        for (int i = 0; i < n; i++) words.add(sc.next());
        String prefix = sc.next();

        // TODO: Implement Trie to insert words and print "true" if prefix exists, else "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char words[100][100];
    for (int i = 0; i < n; i++) scanf("%s", words[i]);
    char prefix[100];
    scanf("%s", prefix);

    // TODO: Implement Trie to insert words and print "true" if prefix exists, else "false"

    return 0;
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
    string prefix;
    cin >> prefix;

    // TODO: Implement Trie to insert words and print "true" if prefix exists, else "false"

    return 0;
}`
    },
    testCases: [
      { input: "2\napple app\napp", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "1\napple\nban", expectedOutput: "false", isPublic: true, weight: 1 }
    ]
  },
  // 13. Design Add and Search Words Data Structure
  {
    title: "Design Add & Search Words (Trie)",
    description: "Design a data structure that supports adding new words and finding if a string matches any previously added string.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        List<String> words = new ArrayList<>();
        for (int i = 0; i < n; i++) words.add(sc.next());
        String query = sc.next();

        // TODO: Check if query exists in the dictionary and print "true" or "false"
        
    }
}`,
      C: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char words[100][100];
    for (int i = 0; i < n; i++) scanf("%s", words[i]);
    char query[100];
    scanf("%s", query);

    // TODO: Check if query exists in the dictionary and print "true" or "false"

    return 0;
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
    string query;
    cin >> query;

    // TODO: Check if query exists in the dictionary and print "true" or "false"

    return 0;
}`
    },
    testCases: [
      { input: "3\nbad dad mad\npad", expectedOutput: "false", isPublic: true, weight: 1 },
      { input: "3\nbad dad mad\nbad", expectedOutput: "true", isPublic: true, weight: 1 }
    ]
  },
  // 14. Word Search II
  {
    title: "Word Search II",
    description: "Given an `m x n` board of characters and a list of strings `words`, return the count of words from the list present on the board.",
    marks: 40,
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
            String row = sc.next();
            for (int j = 0; j < n; j++) board[i][j] = row.charAt(j);
        }
        int k = sc.nextInt();
        String[] words = new String[k];
        for (int i = 0; i < k; i++) words[i] = sc.next();

        // TODO: Search words on board via Trie + Backtracking DFS and print count of found words
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    char board[100][100];
    for (int i = 0; i < m; i++) scanf("%s", board[i]);
    int k;
    scanf("%d", &k);
    char words[100][100];
    for (int i = 0; i < k; i++) scanf("%s", words[i]);

    // TODO: Search words on board via Trie + Backtracking DFS and print count of found words

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<string> board(m);
    for (int i = 0; i < m; i++) cin >> board[i];
    int k;
    cin >> k;
    vector<string> words(k);
    for (int i = 0; i < k; i++) cin >> words[i];

    // TODO: Search words on board via Trie + Backtracking DFS and print count of found words

    return 0;
}`
    },
    testCases: [
      { input: "4 4\noaan\netae\nihkr\niflv\n4\noath pea eat rain", expectedOutput: "1", isPublic: true, weight: 1 }
    ]
  },
  // 15. Clone Graph
  {
    title: "Clone Graph",
    description: "Given a reference of a node in a connected undirected graph, return the number of nodes in a deep copy (clone) of the graph.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        // Read edges
        List<int[]> edges = new ArrayList<>();
        while (sc.hasNextInt()) {
            edges.add(new int[]{sc.nextInt(), sc.nextInt()});
        }

        // TODO: Clone graph using DFS/BFS and print the cloned node count
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int u, v;
    while (scanf("%d %d", &u, &v) == 2) {}

    // TODO: Clone graph using DFS/BFS and print the cloned node count

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    int u, v;
    while (cin >> u >> v) {}

    // TODO: Clone graph using DFS/BFS and print the cloned node count

    return 0;
}`
    },
    testCases: [
      { input: "4\n1 2\n2 3\n3 4\n4 1", expectedOutput: "4", isPublic: true, weight: 1 }
    ]
  },
  // 16. Course Schedule (Cycle Detection)
  {
    title: "Course Schedule",
    description: "There are a total of `numCourses` you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates you must take `b_i` before `a_i`. Return `true` if you can finish all courses.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int numCourses = sc.nextInt();
        int m = sc.nextInt();
        int[][] prerequisites = new int[m][2];
        for (int i = 0; i < m; i++) {
            prerequisites[i][0] = sc.nextInt();
            prerequisites[i][1] = sc.nextInt();
        }

        // TODO: Detect cycle using Kahn's algorithm or DFS and print "true" if courses can be finished, else "false"
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int numCourses, m;
    if (scanf("%d %d", &numCourses, &m) != 2) return 0;
    int u[100], v[100];
    for (int i = 0; i < m; i++) {
        scanf("%d %d", &u[i], &v[i]);
    }

    // TODO: Detect cycle using Kahn's algorithm or DFS and print "true" if courses can be finished, else "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int numCourses, m;
    if (!(cin >> numCourses >> m)) return 0;
    vector<pair<int, int>> prerequisites(m);
    for (int i = 0; i < m; i++) {
        cin >> prerequisites[i].first >> prerequisites[i].second;
    }

    // TODO: Detect cycle using Kahn's algorithm or DFS and print "true" if courses can be finished, else "false"

    return 0;
}`
    },
    testCases: [
      { input: "2 1\n1 0", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "2 2\n1 0\n0 1", expectedOutput: "false", isPublic: true, weight: 1 }
    ]
  },
  // 17. Pacific Atlantic Water Flow
  {
    title: "Pacific Atlantic Water Flow",
    description: "Given an `m x n` grid of island elevations, return the number of grid cells from which water can flow to both the Pacific and Atlantic oceans.",
    marks: 40,
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

        // TODO: Compute and print the number of cells reaching both Pacific and Atlantic oceans
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int heights[100][100];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) scanf("%d", &heights[i][j]);
    }

    // TODO: Compute and print the number of cells reaching both Pacific and Atlantic oceans

    return 0;
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

    // TODO: Compute and print the number of cells reaching both Pacific and Atlantic oceans

    return 0;
}`
    },
    testCases: [
      { input: "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4", expectedOutput: "9", isPublic: true, weight: 1 }
    ]
  },
  // 18. Number of Islands
  {
    title: "Number of Islands",
    description: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.",
    marks: 40,
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
            String row = sc.next();
            for (int j = 0; j < n; j++) grid[i][j] = row.charAt(j);
        }

        // TODO: Count and print the total number of connected islands of '1's using DFS / BFS
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    char grid[100][100];
    for (int i = 0; i < m; i++) scanf("%s", grid[i]);

    // TODO: Count and print the total number of connected islands of '1's using DFS / BFS

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<string> grid(m);
    for (int i = 0; i < m; i++) cin >> grid[i];

    // TODO: Count and print the total number of connected islands of '1's using DFS / BFS

    return 0;
}`
    },
    testCases: [
      { input: "4 5\n11110\n11010\n11000\n00000", expectedOutput: "1", isPublic: true, weight: 1 },
      { input: "4 5\n11000\n11000\n00100\n00011", expectedOutput: "3", isPublic: true, weight: 1 }
    ]
  },
  // 19. Longest Consecutive Sequence
  {
    title: "Longest Consecutive Sequence",
    description: "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence in O(n) time.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        // TODO: Find and print the length of the longest consecutive sequence in O(n)
        
    }
}`,
      C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    // TODO: Find and print the length of the longest consecutive sequence in O(n)

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>
#include <unordered_set>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    // TODO: Find and print the length of the longest consecutive sequence in O(n)

    return 0;
}`
    },
    testCases: [
      { input: "6\n100 4 200 1 3 2", expectedOutput: "4", isPublic: true, weight: 1 },
      { input: "10\n0 3 7 2 5 8 4 6 0 1", expectedOutput: "9", isPublic: true, weight: 1 }
    ]
  },
  // 20. Alien Dictionary (Topological Sort)
  {
    title: "Alien Dictionary (Topological Sort)",
    description: "Given a sorted dictionary of an alien language of N words, return the count of distinct unique letters in the language.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] words = new String[n];
        for (int i = 0; i < n; i++) words[i] = sc.next();

        // TODO: Count and print the total number of distinct characters in the alien language
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char words[100][100];
    for (int i = 0; i < n; i++) scanf("%s", words[i]);

    // TODO: Count and print the total number of distinct characters in the alien language

    return 0;
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

    // TODO: Count and print the total number of distinct characters in the alien language

    return 0;
}`
    },
    testCases: [
      { input: "5\nwrt wrf er ett rftt", expectedOutput: "5", isPublic: true, weight: 1 },
      { input: "3\nz x z", expectedOutput: "2", isPublic: true, weight: 1 }
    ]
  },
  // 21. Graph Valid Tree
  {
    title: "Graph Valid Tree",
    description: "Given `n` nodes labeled from `0` to `n - 1` and a list of `e` undirected edges, determine if these edges form a valid tree (connected and acyclic).",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int e = sc.nextInt();
        int[][] edges = new int[e][2];
        for (int i = 0; i < e; i++) {
            edges[i][0] = sc.nextInt();
            edges[i][1] = sc.nextInt();
        }

        // TODO: Print "true" if the graph is a valid tree (connected and acyclic), else "false"
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n, e;
    if (scanf("%d %d", &n, &e) != 2) return 0;
    int u[100], v[100];
    for (int i = 0; i < e; i++) scanf("%d %d", &u[i], &v[i]);

    // TODO: Print "true" if the graph is a valid tree (connected and acyclic), else "false"

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n, e;
    if (!(cin >> n >> e)) return 0;
    vector<pair<int, int>> edges(e);
    for (int i = 0; i < e; i++) cin >> edges[i].first >> edges[i].second;

    // TODO: Print "true" if the graph is a valid tree (connected and acyclic), else "false"

    return 0;
}`
    },
    testCases: [
      { input: "5 4\n0 1\n0 2\n0 3\n1 4", expectedOutput: "true", isPublic: true, weight: 1 },
      { input: "5 5\n0 1\n1 2\n2 3\n1 3\n1 4", expectedOutput: "false", isPublic: true, weight: 1 }
    ]
  },
  // 22. Number of Connected Components in an Undirected Graph
  {
    title: "Connected Components in Graph",
    description: "You have a graph of `n` nodes. You are given an integer `n` and an array `edges` where `edges[i] = [a_i, b_i]` indicates an edge between `a_i` and `b_i`. Return the number of connected components in the graph.",
    marks: 40,
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

        // TODO: Compute and print the number of connected components using Disjoint Set Union (DSU) or BFS/DFS
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    int u[100], v[100];
    for (int i = 0; i < m; i++) scanf("%d %d", &u[i], &v[i]);

    // TODO: Compute and print the number of connected components using Disjoint Set Union (DSU) or BFS/DFS

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<pair<int, int>> edges(m);
    for (int i = 0; i < m; i++) cin >> edges[i].first >> edges[i].second;

    // TODO: Compute and print the number of connected components using Disjoint Set Union (DSU) or BFS/DFS

    return 0;
}`
    },
    testCases: [
      { input: "5 4\n0 1\n1 2\n3 4\n2 0", expectedOutput: "2", isPublic: true, weight: 1 },
      { input: "5 2\n0 1\n1 2", expectedOutput: "3", isPublic: true, weight: 1 }
    ]
  },
  // 23. Set Matrix Zeroes
  {
    title: "Set Matrix Zeroes",
    description: "Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`'s in place. Print the modified matrix.",
    marks: 40,
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
            for (int j = 0; j < n; j++) matrix[i][j] = sc.nextInt();
        }

        // TODO: Set entire row and column to 0 if an element is 0 in place, and print the resulting matrix
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int matrix[100][100];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) scanf("%d", &matrix[i][j]);
    }

    // TODO: Set entire row and column to 0 if an element is 0 in place, and print the resulting matrix

    return 0;
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

    // TODO: Set entire row and column to 0 if an element is 0 in place, and print the resulting matrix

    return 0;
}`
    },
    testCases: [
      { input: "3 3\n1 1 1\n1 0 1\n1 1 1", expectedOutput: "1 0 1\n0 0 0\n1 0 1", isPublic: true, weight: 1 }
    ]
  },
  // 24. Spiral Matrix
  {
    title: "Spiral Matrix",
    description: "Given an `m x n` matrix, return all elements of the matrix in spiral order as space-separated integers.",
    marks: 40,
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
            for (int j = 0; j < n; j++) matrix[i][j] = sc.nextInt();
        }

        // TODO: Traverse and print all elements in spiral order space-separated
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int matrix[100][100];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) scanf("%d", &matrix[i][j]);
    }

    // TODO: Traverse and print all elements in spiral order space-separated

    return 0;
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

    // TODO: Traverse and print all elements in spiral order space-separated

    return 0;
}`
    },
    testCases: [
      { input: "3 3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "1 2 3 6 9 8 7 4 5", isPublic: true, weight: 1 }
    ]
  },
  // 25. Rotate Image (Matrix 90 Deg)
  {
    title: "Rotate Image (Matrix 90 Deg)",
    description: "You are given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise) in place.",
    marks: 40,
    starterCodes: {
      JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] matrix = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) matrix[i][j] = sc.nextInt();
        }

        // TODO: Rotate the matrix by 90 degrees clockwise in place and print it
        
    }
}`,
      C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int matrix[100][100];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) scanf("%d", &matrix[i][j]);
    }

    // TODO: Rotate the matrix by 90 degrees clockwise in place and print it

    return 0;
}`,
      CPP: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> matrix(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) cin >> matrix[i][j];
    }

    // TODO: Rotate the matrix by 90 degrees clockwise in place and print it

    return 0;
}`
    },
    testCases: [
      { input: "3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "7 4 1\n8 5 2\n9 6 3", isPublic: true, weight: 1 }
    ]
  }
];

async function seedBlind75Assessments() {
  console.log("================================================================================");
  console.log("   🚀 SEEDING 25 ASSESSMENTS COVERING ALL 75 TUF BLIND 75 PROBLEMS");
  console.log("   (Clean Problem Titles & Empty Starter Logic Skeletons for Students)");
  console.log("================================================================================\n");

  const totalAssessments = 25;

  for (let i = 0; i < totalAssessments; i++) {
    const num = i + 1;
    const code = `B75-${String(num).padStart(2, "0")}`;
    const title = `B75-${num}: TUF Blind 75 Assessment Set ${num}`;
    const probA = CATEGORY_A[i];
    const probB = CATEGORY_B[i];
    const probC = CATEGORY_C[i];

    console.log(`[Assessment ${num}/25] Creating '${title}' (Code: ${code})...`);
    console.log(`   -> Part A: ${probA.title}`);
    console.log(`   -> Part B: ${probB.title}`);
    console.log(`   -> Part C: ${probC.title}`);

    // Check if assessment already exists
    const existing = await prisma.assessment.findUnique({ where: { code } });
    if (existing) {
      console.log(`   ⚠️ Assessment ${code} already exists. Deleting and recreating fresh...`);
      await prisma.assessment.delete({ where: { id: existing.id } });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description: `Comprehensive 3-part coding assessment from the TUF Blind 75 curriculum covering Array/String/Binary, DP/Intervals/Data Structures, and Trees/Graphs/Matrix.`,
        code,
        durationMinutes: 60,
        startTime: new Date(),
        endTime: null,
        shuffleQuestions: false,
        requireSeb: false,
        sebQuitPassword: `exit${num}`,
        isReviewUnlocked: false,
      },
    });

    // Section 1: Part A
    const secA = await prisma.section.create({
      data: {
        assessmentId: assessment.id,
        title: "Part A: Array, String & Binary Manipulation",
        description: "Solve algorithmic challenges on arrays, strings, and bitwise logic.",
        order: 0,
      },
    });

    await prisma.question.create({
      data: {
        assessmentId: assessment.id,
        sectionId: secA.id,
        type: "CODING",
        title: probA.title,
        description: probA.description,
        marks: probA.marks,
        allowedLanguages: "JAVA,C,CPP",
        starterCodes: JSON.stringify(probA.starterCodes),
        starterCode: probA.starterCodes.JAVA,
        timeLimitSeconds: 3,
        memoryLimitMb: 256,
        order: 0,
        testCases: {
          create: probA.testCases.map((tc, idx) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isPublic: tc.isPublic,
            weight: tc.weight,
            order: idx,
          })),
        },
      },
    });

    // Section 2: Part B
    const secB = await prisma.section.create({
      data: {
        assessmentId: assessment.id,
        title: "Part B: Dynamic Programming, Intervals & Data Structures",
        description: "Solve problems involving DP states, intervals, linked lists, and priority heaps.",
        order: 1,
      },
    });

    await prisma.question.create({
      data: {
        assessmentId: assessment.id,
        sectionId: secB.id,
        type: "CODING",
        title: probB.title,
        description: probB.description,
        marks: probB.marks,
        allowedLanguages: "JAVA,C,CPP",
        starterCodes: JSON.stringify(probB.starterCodes),
        starterCode: probB.starterCodes.JAVA,
        timeLimitSeconds: 3,
        memoryLimitMb: 256,
        order: 1,
        testCases: {
          create: probB.testCases.map((tc, idx) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isPublic: tc.isPublic,
            weight: tc.weight,
            order: idx,
          })),
        },
      },
    });

    // Section 3: Part C
    const secC = await prisma.section.create({
      data: {
        assessmentId: assessment.id,
        title: "Part C: Trees, Graphs & Matrix Algorithms",
        description: "Solve problems on binary search trees, graph traversals, and matrix transformations.",
        order: 2,
      },
    });

    await prisma.question.create({
      data: {
        assessmentId: assessment.id,
        sectionId: secC.id,
        type: "CODING",
        title: probC.title,
        description: probC.description,
        marks: probC.marks,
        allowedLanguages: "JAVA,C,CPP",
        starterCodes: JSON.stringify(probC.starterCodes),
        starterCode: probC.starterCodes.JAVA,
        timeLimitSeconds: 3,
        memoryLimitMb: 256,
        order: 2,
        testCases: {
          create: probC.testCases.map((tc, idx) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isPublic: tc.isPublic,
            weight: tc.weight,
            order: idx,
          })),
        },
      },
    });

    console.log(`   ✅ Successfully seeded ${code} with clean problem titles & skeleton starters (Total 100 Marks)\n`);
  }

  console.log("================================================================================");
  console.log("   🎉 ALL 25 ASSESSMENTS RESEEDED WITH SKELETON CODE & CLEAN TITLES!");
  console.log("================================================================================");
}

seedBlind75Assessments()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
