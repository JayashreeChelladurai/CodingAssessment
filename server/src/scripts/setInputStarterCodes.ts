import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface QuestionStarters {
  JAVA: string;
  CPP: string;
  C: string;
}

const STARTERS_BY_TITLE: Record<string, QuestionStarters> = {
  // -------------------------------------------------------------
  // ARRAY
  // -------------------------------------------------------------
  "Two Sum": {
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
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;

    // Write your logic here

    return 0;
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
    int target;
    scanf("%d", &target);

    // Write your logic here

    free(nums);
    return 0;
}`,
  },

  "Best Time to Buy and Sell Stock": {
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

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> prices(n);
    for (int i = 0; i < n; i++) {
        cin >> prices[i];
    }

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *prices = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &prices[i]);
    }

    // Write your logic here

    free(prices);
    return 0;
}`,
  },

  "Contains Duplicate": {
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
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
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

    // Write your logic here

    free(nums);
    return 0;
}`,
  },

  "Maximum Subarray": {
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
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
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

    // Write your logic here

    free(nums);
    return 0;
}`,
  },

  // -------------------------------------------------------------
  // BINARY
  // -------------------------------------------------------------
  "Number of 1 Bits": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLong()) return;
        long n = sc.nextLong();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
using namespace std;

int main() {
    unsigned long long n;
    if (!(cin >> n)) return 0;

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    unsigned long long n;
    if (scanf("%llu", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
  },

  "Counting Bits": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

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

  "Missing Number": {
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
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
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

    // Write your logic here

    free(nums);
    return 0;
}`,
  },

  "Reverse Bits": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLong()) return;
        long n = sc.nextLong();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
using namespace std;

int main() {
    unsigned int n;
    if (!(cin >> n)) return 0;

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    unsigned int n;
    if (scanf("%u", &n) != 1) return 0;

    // Write your logic here

    return 0;
}`,
  },

  // -------------------------------------------------------------
  // HEAP
  // -------------------------------------------------------------
  "Kth Largest Element in an Array": {
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
        int k = sc.nextInt();

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
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int k;
    cin >> k;

    // Write your logic here

    return 0;
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
    int k;
    scanf("%d", &k);

    // Write your logic here

    free(nums);
    return 0;
}`,
  },

  "Top K Frequent Elements": {
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
        int k = sc.nextInt();

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
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int k;
    cin >> k;

    // Write your logic here

    return 0;
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
    int k;
    scanf("%d", &k);

    // Write your logic here

    free(nums);
    return 0;
}`,
  },

  // -------------------------------------------------------------
  // STRING
  // -------------------------------------------------------------
  "Longest Substring Without Repeating Characters": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[60000];
    if (!fgets(s, sizeof(s), stdin)) return 0;
    int len = strlen(s);
    if (len > 0 && s[len - 1] == '\\n') s[--len] = '\\0';

    // Write your logic here

    return 0;
}`,
  },

  "Valid Anagram": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String t = sc.next();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    char s[60000], t[60000];
    if (scanf("%s %s", s, t) != 2) return 0;

    // Write your logic here

    return 0;
}`,
  },

  "Valid Palindrome": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <string.h>

int main() {
    char s[200005];
    if (!fgets(s, sizeof(s), stdin)) return 0;
    int len = strlen(s);
    if (len > 0 && s[len - 1] == '\\n') s[--len] = '\\0';

    // Write your logic here

    return 0;
}`,
  },

  // -------------------------------------------------------------
  // LINKED LIST
  // -------------------------------------------------------------
  "Reverse Linked List": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *arr = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

    // Write your logic here

    free(arr);
    return 0;
}`,
  },

  "Merge Two Sorted Lists": {
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
        int m = sc.nextInt();
        int[] b = new int[m];
        for (int i = 0; i < m; i++) {
            b[i] = sc.nextInt();
        }

        // Write your logic here
        
    }
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

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *a = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int m;
    scanf("%d", &m);
    int *b = (int *)malloc(m * sizeof(int));
    for (int i = 0; i < m; i++) scanf("%d", &b[i]);

    // Write your logic here

    free(a);
    free(b);
    return 0;
}`,
  },

  // -------------------------------------------------------------
  // INTERVALS
  // -------------------------------------------------------------
  "Merge Intervals": {
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

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; i++) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <stdlib.h>

typedef struct { int start, end; } Interval;

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    Interval *arr = (Interval *)malloc(n * sizeof(Interval));
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &arr[i].start, &arr[i].end);
    }

    // Write your logic here

    free(arr);
    return 0;
}`,
  },

  // -------------------------------------------------------------
  // TREE
  // -------------------------------------------------------------
  "Maximum Depth of Binary Tree": {
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
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char nodes[10005][20];
    for (int i = 0; i < n; i++) {
        scanf("%s", nodes[i]);
    }

    // Write your logic here

    return 0;
}`,
  },

  "Same Tree": {
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
    vector<string> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int m;
    cin >> m;
    vector<string> b(m);
    for (int i = 0; i < m; i++) cin >> b[i];

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char a[105][20];
    for (int i = 0; i < n; i++) scanf("%s", a[i]);
    int m;
    scanf("%d", &m);
    char b[105][20];
    for (int i = 0; i < m; i++) scanf("%s", b[i]);

    // Write your logic here

    return 0;
}`,
  },

  // -------------------------------------------------------------
  // DP
  // -------------------------------------------------------------
  "Coin Change": {
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

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <vector>
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

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *coins = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &coins[i]);
    }
    int amount;
    scanf("%d", &amount);

    // Write your logic here

    free(coins);
    return 0;
}`,
  },

  "Longest Increasing Subsequence": {
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
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your logic here

    return 0;
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

    // Write your logic here

    free(nums);
    return 0;
}`,
  },

  "Climbing Stairs": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

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

  "Longest Common Subsequence": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String text1 = sc.next();
        String text2 = sc.next();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string text1, text2;
    if (!(cin >> text1 >> text2)) return 0;

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    char text1[1005], text2[1005];
    if (scanf("%s %s", text1, text2) != 2) return 0;

    // Write your logic here

    return 0;
}`,
  },

  "Unique Paths": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;

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

  // -------------------------------------------------------------
  // GRAPH
  // -------------------------------------------------------------
  "Number of Islands": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        char[][] grid = new char[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = sc.next().charAt(0);
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
    vector<vector<char>> grid(m, vector<char>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> grid[i][j];
        }
    }

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    char grid[305][305];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            char ch[4];
            scanf("%s", ch);
            grid[i][j] = ch[0];
        }
    }

    // Write your logic here

    return 0;
}`,
  },

  "Course Schedule": {
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

        // Write your logic here
        
    }
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

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int numCourses, m;
    if (scanf("%d %d", &numCourses, &m) != 2) return 0;
    int prerequisites[5005][2];
    for (int i = 0; i < m; i++) {
        scanf("%d %d", &prerequisites[i][0], &prerequisites[i][1]);
    }

    // Write your logic here

    return 0;
}`,
  },

  // -------------------------------------------------------------
  // MATRIX
  // -------------------------------------------------------------
  "Set Matrix Zeroes": {
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
        for (int j = 0; j < n; j++) {
            cin >> matrix[i][j];
        }
    }

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int matrix[205][205];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &matrix[i][j]);
        }
    }

    // Write your logic here

    return 0;
}`,
  },

  "Spiral Matrix": {
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
        for (int j = 0; j < n; j++) {
            cin >> matrix[i][j];
        }
    }

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int matrix[25][25];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &matrix[i][j]);
        }
    }

    // Write your logic here

    return 0;
}`,
  },

  "Rotate Image": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] matrix = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                matrix[i][j] = sc.nextInt();
            }
        }

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<vector<int>> matrix(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> matrix[i][j];
        }
    }

    // Write your logic here

    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int matrix[25][25];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &matrix[i][j]);
        }
    }

    // Write your logic here

    return 0;
}`,
  },

  "Fibonacci Number": {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // Write your logic here
        
    }
}`,
    CPP: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

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
};

async function main() {
  console.log("Updating starter codes to include input-parsing boilerplate only...");

  const allQuestions = await prisma.bankQuestion.findMany({
    where: { type: "CODING" },
  });

  let count = 0;
  for (const q of allQuestions) {
    const starters = STARTERS_BY_TITLE[q.title];
    if (starters) {
      await prisma.bankQuestion.update({
        where: { id: q.id },
        data: {
          starterCodes: JSON.stringify(starters),
          starterCode: starters.JAVA,
        },
      });
      console.log(`Updated input starter code for: "${q.title}"`);
      count++;
    }
  }

  console.log(`Finished: ${count} of ${allQuestions.length} questions updated with input-reading boilerplate.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
