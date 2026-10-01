import { StarterDefinition } from "./linkedListStarters";

export const dpStarters: StarterDefinition[] = [
  {
    title: "Climbing Stairs",
    starterCode: `import java.util.*;

public class Solution {
    public int climbStairs(int n) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.climbStairs(n);
        System.out.println(res);
    }
}`,
    testSolution: `        if (n <= 2) return n;
        int first = 1, second = 2;
        for (int i = 3; i <= n; i++) {
            int third = first + second;
            first = second;
            second = third;
        }
        return second;`,
  },
  {
    title: "Coin Change",
    starterCode: `import java.util.*;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        // Write your logic here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) coins[i] = sc.nextInt();
        if (!sc.hasNextInt()) return;
        int amount = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.coinChange(coins, amount);
        System.out.println(res);
    }
}`,
    testSolution: `        int max = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, max);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];`,
  },
  {
    title: "Combination Sum",
    starterCode: `import java.util.*;

public class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        // Write your logic here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] candidates = new int[n];
        for (int i = 0; i < n; i++) candidates[i] = sc.nextInt();
        Solution sol = new Solution();
        List<List<Integer>> res = sol.combinationSum(candidates, target);
        if (res.isEmpty()) {
            System.out.println("empty");
            return;
        }
        for (List<Integer> combo : res) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < combo.size(); i++) {
                if (i > 0) sb.append(" ");
                sb.append(combo.get(i));
            }
            System.out.println(sb.toString());
        }
    }
}`,
    testSolution: `        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] candidates, int remain, int start, List<Integer> current, List<List<Integer>> result) {
        if (remain == 0) {
            result.add(new ArrayList<>(current));
            return;
        }
        if (remain < 0) return;
        for (int i = start; i < candidates.length; i++) {
            current.add(candidates[i]);
            backtrack(candidates, remain - candidates[i], i, current, result);
            current.remove(current.size() - 1);
        }`,
  },
  {
    title: "Decode Ways",
    starterCode: `import java.util.*;

public class Solution {
    public int numDecodings(String s) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Solution sol = new Solution();
        int res = sol.numDecodings(s);
        System.out.println(res);
    }
}`,
    testSolution: `        if (s == null || s.length() == 0 || s.charAt(0) == '0') return 0;
        int n = s.length();
        int[] dp = new int[n + 1];
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            int oneDigit = Integer.parseInt(s.substring(i - 1, i));
            int twoDigits = Integer.parseInt(s.substring(i - 2, i));
            if (oneDigit >= 1) dp[i] += dp[i - 1];
            if (twoDigits >= 10 && twoDigits <= 26) dp[i] += dp[i - 2];
        }
        return dp[n];`,
  },
  {
    title: "House Robber",
    starterCode: `import java.util.*;

public class Solution {
    public int rob(int[] nums) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.rob(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        if (nums == null || nums.length == 0) return 0;
        if (nums.length == 1) return nums[0];
        int prev2 = 0, prev1 = 0;
        for (int num : nums) {
            int temp = Math.max(prev1, prev2 + num);
            prev2 = prev1;
            prev1 = temp;
        }
        return prev1;`,
  },
  {
    title: "House Robber II",
    starterCode: `import java.util.*;

public class Solution {
    public int rob(int[] nums) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.rob(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        if (nums == null || nums.length == 0) return 0;
        if (nums.length == 1) return nums[0];
        return Math.max(robLinear(nums, 0, nums.length - 2), robLinear(nums, 1, nums.length - 1));
    }

    private int robLinear(int[] nums, int start, int end) {
        int prev2 = 0, prev1 = 0;
        for (int i = start; i <= end; i++) {
            int temp = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = temp;
        }
        return prev1;`,
  },
  {
    title: "Jump Game",
    starterCode: `import java.util.*;

public class Solution {
    public boolean canJump(int[] nums) {
        // Write your logic here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        boolean res = sol.canJump(nums);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        int lastPos = nums.length - 1;
        for (int i = nums.length - 1; i >= 0; i--) {
            if (i + nums[i] >= lastPos) {
                lastPos = i;
            }
        }
        return lastPos == 0;`,
  },
  {
    title: "Longest Common Subsequence",
    starterCode: `import java.util.*;

public class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String text1 = sc.next();
        if (!sc.hasNext()) return;
        String text2 = sc.next();
        Solution sol = new Solution();
        int res = sol.longestCommonSubsequence(text1, text2);
        System.out.println(res);
    }
}`,
    testSolution: `        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    dp[i][j] = 1 + dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];`,
  },
  {
    title: "Longest Increasing Subsequence",
    starterCode: `import java.util.*;

public class Solution {
    public int lengthOfLIS(int[] nums) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.lengthOfLIS(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        if (nums == null || nums.length == 0) return 0;
        int[] dp = new int[nums.length];
        Arrays.fill(dp, 1);
        int max = 1;
        for (int i = 1; i < nums.length; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[i] > nums[j]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            max = Math.max(max, dp[i]);
        }
        return max;`,
  },
  {
    title: "Unique Paths",
    starterCode: `import java.util.*;

public class Solution {
    public int uniquePaths(int m, int n) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.uniquePaths(m, n);
        System.out.println(res);
    }
}`,
    testSolution: `        int[][] dp = new int[m][n];
        for (int i = 0; i < m; i++) dp[i][0] = 1;
        for (int j = 0; j < n; j++) dp[0][j] = 1;
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
        return dp[m - 1][n - 1];`,
  },
  {
    title: "Word Break",
    starterCode: `import java.util.*;

public class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        // Write your logic here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        List<String> wordDict = new ArrayList<>();
        for (int i = 0; i < n; i++) wordDict.add(sc.next());
        Solution sol = new Solution();
        boolean res = sol.wordBreak(s, wordDict);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        Set<String> wordDictSet = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && wordDictSet.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.length()];`,
  },
  {
    title: "Fibonacci Number",
    starterCode: `import java.util.*;

public class Solution {
    public int fib(int n) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.fib(n);
        System.out.println(res);
    }
}`,
    testSolution: `        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;`,
  },
];
