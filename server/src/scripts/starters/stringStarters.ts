import { StarterDefinition } from "./linkedListStarters";

export const stringStarters: StarterDefinition[] = [
  {
    title: "Longest Substring Without Repeating Characters",
    starterCode: `import java.util.*;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        Solution sol = new Solution();
        int res = sol.lengthOfLongestSubstring(s);
        System.out.println(res);
    }
}`,
    testSolution: `        int n = s.length(), ans = 0;
        Map<Character, Integer> map = new HashMap<>();
        for (int j = 0, i = 0; j < n; j++) {
            if (map.containsKey(s.charAt(j))) {
                i = Math.max(map.get(s.charAt(j)), i);
            }
            ans = Math.max(ans, j - i + 1);
            map.put(s.charAt(j), j + 1);
        }
        return ans;`,
  },
  {
    title: "Longest Repeating Character Replacement",
    starterCode: `import java.util.*;

public class Solution {
    public int characterReplacement(String s, int k) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        if (!sc.hasNextInt()) return;
        int k = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.characterReplacement(s, k);
        System.out.println(res);
    }
}`,
    testSolution: `        int len = s.length();
        int[] count = new int[26];
        int start = 0, maxCount = 0, maxLength = 0;
        for (int end = 0; end < len; end++) {
            maxCount = Math.max(maxCount, ++count[s.charAt(end) - 'A']);
            while (end - start + 1 - maxCount > k) {
                count[s.charAt(start) - 'A']--;
                start++;
            }
            maxLength = Math.max(maxLength, end - start + 1);
        }
        return maxLength;`,
  },
  {
    title: "Minimum Window Substring",
    starterCode: `import java.util.*;

public class Solution {
    public String minWindow(String s, String t) {
        // Write your logic here
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        if (!sc.hasNext()) return;
        String t = sc.next();
        Solution sol = new Solution();
        String res = sol.minWindow(s, t);
        System.out.println(res.isEmpty() ? "empty" : res);
    }
}`,
    testSolution: `        if (s.length() == 0 || t.length() == 0) return "";
        Map<Character, Integer> dictT = new HashMap<>();
        for (int i = 0; i < t.length(); i++) {
            int count = dictT.getOrDefault(t.charAt(i), 0);
            dictT.put(t.charAt(i), count + 1);
        }
        int required = dictT.size();
        int l = 0, r = 0, formed = 0;
        Map<Character, Integer> windowCounts = new HashMap<>();
        int[] ans = { -1, 0, 0 };
        while (r < s.length()) {
            char c = s.charAt(r);
            int count = windowCounts.getOrDefault(c, 0);
            windowCounts.put(c, count + 1);
            if (dictT.containsKey(c) && windowCounts.get(c).intValue() == dictT.get(c).intValue()) {
                formed++;
            }
            while (l <= r && formed == required) {
                c = s.charAt(l);
                if (ans[0] == -1 || r - l + 1 < ans[0]) {
                    ans[0] = r - l + 1;
                    ans[1] = l;
                    ans[2] = r;
                }
                windowCounts.put(c, windowCounts.get(c) - 1);
                if (dictT.containsKey(c) && windowCounts.get(c).intValue() < dictT.get(c).intValue()) {
                    formed--;
                }
                l++;
            }
            r++;
        }
        return ans[0] == -1 ? "" : s.substring(ans[1], ans[2] + 1);`,
  },
  {
    title: "Valid Anagram",
    starterCode: `import java.util.*;

public class Solution {
    public boolean isAnagram(String s, String t) {
        // Write your logic here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        if (!sc.hasNext()) return;
        String t = sc.next();
        Solution sol = new Solution();
        boolean res = sol.isAnagram(s, t);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        if (s.length() != t.length()) return false;
        int[] table = new int[26];
        for (int i = 0; i < s.length(); i++) {
            table[s.charAt(i) - 'a']++;
        }
        for (int i = 0; i < t.length(); i++) {
            table[t.charAt(i) - 'a']--;
            if (table[t.charAt(i) - 'a'] < 0) return false;
        }
        return true;`,
  },
  {
    title: "Group Anagrams",
    starterCode: `import java.util.*;

public class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Write your logic here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] strs = new String[n];
        for (int i = 0; i < n; i++) strs[i] = sc.next();
        Solution sol = new Solution();
        List<List<String>> res = sol.groupAnagrams(strs);
        for (List<String> group : res) {
            Collections.sort(group);
        }
        res.sort((a, b) -> {
            if (a.size() != b.size()) return a.size() - b.size();
            if (a.isEmpty() && b.isEmpty()) return 0;
            if (a.isEmpty()) return -1;
            if (b.isEmpty()) return 1;
            return a.get(0).compareTo(b.get(0));
        });
        for (List<String> group : res) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < group.size(); i++) {
                if (i > 0) sb.append(" ");
                sb.append(group.get(i));
            }
            System.out.println(sb.toString());
        }
    }
}`,
    testSolution: `        if (strs == null || strs.length == 0) return new ArrayList<>();
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] ca = s.toCharArray();
            Arrays.sort(ca);
            String keyStr = String.valueOf(ca);
            if (!map.containsKey(keyStr)) map.put(keyStr, new ArrayList<>());
            map.get(keyStr).add(s);
        }
        return new ArrayList<>(map.values());`,
  },
  {
    title: "Valid Parentheses",
    starterCode: `import java.util.*;

public class Solution {
    public boolean isValid(String s) {
        // Write your logic here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNext() ? sc.next() : "";
        Solution sol = new Solution();
        boolean res = sol.isValid(s);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();`,
  },
  {
    title: "Valid Palindrome",
    starterCode: `import java.util.*;

public class Solution {
    public boolean isPalindrome(String s) {
        // Write your logic here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        Solution sol = new Solution();
        boolean res = sol.isPalindrome(s);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        int i = 0, j = s.length() - 1;
        while (i < j) {
            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
            i++;
            j--;
        }
        return true;`,
  },
  {
    title: "Longest Palindromic Substring",
    starterCode: `import java.util.*;

public class Solution {
    public String longestPalindrome(String s) {
        // Write your logic here
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Solution sol = new Solution();
        String res = sol.longestPalindrome(s);
        System.out.println(res);
    }
}`,
    testSolution: `        if (s == null || s.length() < 1) return "";
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            int len1 = expandAroundCenter(s, i, i);
            int len2 = expandAroundCenter(s, i, i + 1);
            int len = Math.max(len1, len2);
            if (len > end - start + 1) {
                start = i - (len - 1) / 2;
                end = i + len / 2;
            }
        }
        return s.substring(start, end + 1);
    }

    private int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;`,
  },
  {
    title: "Palindromic Substrings",
    starterCode: `import java.util.*;

public class Solution {
    public int countSubstrings(String s) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Solution sol = new Solution();
        int res = sol.countSubstrings(s);
        System.out.println(res);
    }
}`,
    testSolution: `        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            count += countPalindromes(s, i, i);
            count += countPalindromes(s, i, i + 1);
        }
        return count;
    }

    private int countPalindromes(String s, int left, int right) {
        int count = 0;
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            count++;
            left--;
            right++;
        }
        return count;`,
  },
  {
    title: "Encode and Decode Strings",
    starterCode: `import java.util.*;

public class Solution {
    // Encodes a list of strings to a single string.
    public String encode(List<String> strs) {
        // Write your logic here
        return "";
    }

    // Decodes a single string to a list of strings.
    public List<String> decode(String s) {
        // Write your decode logic here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        sc.nextLine(); // consume newline
        List<String> strs = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if (sc.hasNextLine()) strs.add(sc.nextLine());
        }
        Solution sol = new Solution();
        String encoded = sol.encode(strs);
        List<String> decoded = sol.decode(encoded);
        for (String str : decoded) {
            System.out.println(str);
        }
    }
}`,
    testSolution: `        StringBuilder sb = new StringBuilder();
        for (String str : strs) {
            sb.append(str.length()).append('/').append(str);
        }
        return sb.toString();`,
    testSolution2: `        List<String> decoded = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            int slash = s.indexOf('/', i);
            int len = Integer.parseInt(s.substring(i, slash));
            i = slash + 1 + len;
            decoded.add(s.substring(slash + 1, i));
        }
        return decoded;`,
  } as any,
];
