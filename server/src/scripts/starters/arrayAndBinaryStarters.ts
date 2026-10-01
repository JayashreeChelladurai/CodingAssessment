import { StarterDefinition } from "./linkedListStarters";

export const binaryStarters: StarterDefinition[] = [
  {
    title: "Number of 1 Bits",
    starterCode: `import java.util.*;

public class Solution {
    public int hammingWeight(int n) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        int n;
        if (s.startsWith("0b") || s.startsWith("0B")) {
            n = (int) Long.parseLong(s.substring(2), 2);
        } else {
            n = (int) Long.parseLong(s);
        }
        Solution sol = new Solution();
        int res = sol.hammingWeight(n);
        System.out.println(res);
    }
}`,
    testSolution: `        int count = 0;
        while (n != 0) {
            count += (n & 1);
            n >>>= 1;
        }
        return count;`,
  },
  {
    title: "Counting Bits",
    starterCode: `import java.util.*;

public class Solution {
    public int[] countBits(int n) {
        // Write your logic here
        return new int[0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Solution sol = new Solution();
        int[] res = sol.countBits(n);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < res.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(res[i]);
        }
        System.out.println(sb.toString());
    }
}`,
    testSolution: `        int[] ans = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            ans[i] = ans[i >> 1] + (i & 1);
        }
        return ans;`,
  },
  {
    title: "Missing Number",
    starterCode: `import java.util.*;

public class Solution {
    public int missingNumber(int[] nums) {
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
        int res = sol.missingNumber(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        int missing = nums.length;
        for (int i = 0; i < nums.length; i++) {
            missing ^= i ^ nums[i];
        }
        return missing;`,
  },
  {
    title: "Reverse Bits",
    starterCode: `import java.util.*;

public class Solution {
    public int reverseBits(int n) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        int n;
        if (s.startsWith("0b") || s.startsWith("0B")) {
            n = (int) Long.parseLong(s.substring(2), 2);
        } else {
            n = (int) Long.parseLong(s);
        }
        Solution sol = new Solution();
        int res = sol.reverseBits(n);
        System.out.println(Integer.toUnsignedString(res));
    }
}`,
    testSolution: `        int result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1);
            n >>>= 1;
        }
        return result;`,
  },
  {
    title: "Sum of Two Integers",
    starterCode: `import java.util.*;

public class Solution {
    public int getSum(int a, int b) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int a = sc.nextInt();
        int b = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.getSum(a, b);
        System.out.println(res);
    }
}`,
    testSolution: `        while (b != 0) {
            int carry = (a & b) << 1;
            a = a ^ b;
            b = carry;
        }
        return a;`,
  },
];

export const arrayStarters: StarterDefinition[] = [
  {
    title: "Two Sum",
    starterCode: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your logic here
        return new int[0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        Solution sol = new Solution();
        int[] res = sol.twoSum(nums, target);
        if (res.length == 2) {
            System.out.println(res[0] + " " + res[1]);
        }
    }
}`,
    testSolution: `        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];`,
  },
  {
    title: "Best Time to Buy and Sell Stock",
    starterCode: `import java.util.*;

public class Solution {
    public int maxProfit(int[] prices) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] prices = new int[n];
        for (int i = 0; i < n; i++) prices[i] = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.maxProfit(prices);
        System.out.println(res);
    }
}`,
    testSolution: `        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) minPrice = price;
            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
        }
        return maxProfit;`,
  },
  {
    title: "Contains Duplicate",
    starterCode: `import java.util.*;

public class Solution {
    public boolean containsDuplicate(int[] nums) {
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
        boolean res = sol.containsDuplicate(nums);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        Set<Integer> set = new HashSet<>();
        for (int num : nums) {
            if (!set.add(num)) return true;
        }
        return false;`,
  },
  {
    title: "Maximum Subarray",
    starterCode: `import java.util.*;

public class Solution {
    public int maxSubArray(int[] nums) {
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
        int res = sol.maxSubArray(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;`,
  },
  {
    title: "Product of Array Except Self",
    starterCode: `import java.util.*;

public class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Write your logic here
        return new int[0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        int[] res = sol.productExceptSelf(nums);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < res.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(res[i]);
        }
        System.out.println(sb.toString());
    }
}`,
    testSolution: `        int n = nums.length;
        int[] ans = new int[n];
        ans[0] = 1;
        for (int i = 1; i < n; i++) {
            ans[i] = ans[i - 1] * nums[i - 1];
        }
        int R = 1;
        for (int i = n - 1; i >= 0; i--) {
            ans[i] = ans[i] * R;
            R *= nums[i];
        }
        return ans;`,
  },
  {
    title: "Maximum Product Subarray",
    starterCode: `import java.util.*;

public class Solution {
    public int maxProduct(int[] nums) {
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
        int res = sol.maxProduct(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        if (nums.length == 0) return 0;
        int maxSoFar = nums[0];
        int minSoFar = nums[0];
        int result = maxSoFar;
        for (int i = 1; i < nums.length; i++) {
            int curr = nums[i];
            int tempMax = Math.max(curr, Math.max(maxSoFar * curr, minSoFar * curr));
            minSoFar = Math.min(curr, Math.min(maxSoFar * curr, minSoFar * curr));
            maxSoFar = tempMax;
            result = Math.max(maxSoFar, result);
        }
        return result;`,
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    starterCode: `import java.util.*;

public class Solution {
    public int findMin(int[] nums) {
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
        int res = sol.findMin(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];`,
  },
  {
    title: "Search in Rotated Sorted Array",
    starterCode: `import java.util.*;

public class Solution {
    public int search(int[] nums, int target) {
        // Write your logic here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.search(nums, target);
        System.out.println(res);
    }
}`,
    testSolution: `        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                else left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;`,
  },
  {
    title: "3Sum",
    starterCode: `import java.util.*;

public class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your logic here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Solution sol = new Solution();
        List<List<Integer>> res = sol.threeSum(nums);
        if (res.isEmpty()) {
            System.out.println("none");
            return;
        }
        for (List<Integer> triplet : res) {
            System.out.println(triplet.get(0) + " " + triplet.get(1) + " " + triplet.get(2));
        }
    }
}`,
    testSolution: `        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++;
                    r--;
                } else if (sum < 0) {
                    l++;
                } else {
                    r--;
                }
            }
        }
        return res;`,
  },
  {
    title: "Container With Most Water",
    starterCode: `import java.util.*;

public class Solution {
    public int maxArea(int[] height) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] height = new int[n];
        for (int i = 0; i < n; i++) height[i] = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.maxArea(height);
        System.out.println(res);
    }
}`,
    testSolution: `        int maxArea = 0;
        int left = 0, right = height.length - 1;
        while (left < right) {
            int width = right - left;
            maxArea = Math.max(maxArea, Math.min(height[left], height[right]) * width);
            if (height[left] <= height[right]) left++;
            else right--;
        }
        return maxArea;`,
  },
];
