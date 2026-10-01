import { StarterDefinition } from "./linkedListStarters";

export const graphStarters: StarterDefinition[] = [
  {
    title: "Number of Islands",
    starterCode: `import java.util.*;

public class Solution {
    public int numIslands(char[][] grid) {
        // Write your logic here
        return 0;
    }

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
        Solution sol = new Solution();
        int res = sol.numIslands(grid);
        System.out.println(res);
    }
}`,
    testSolution: `        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    dfs(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }

    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);`,
  },
  {
    title: "Clone Graph",
    starterCode: `import java.util.*;

// Definition for a Node.
class Node {
    public int val;
    public List<Node> neighbors;
    public Node() {
        val = 0;
        neighbors = new ArrayList<Node>();
    }
    public Node(int _val) {
        val = _val;
        neighbors = new ArrayList<Node>();
    }
    public Node(int _val, ArrayList<Node> _neighbors) {
        val = _val;
        neighbors = _neighbors;
    }
}

public class Solution {
    public Node cloneGraph(Node node) {
        // Write your logic here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        sc.nextLine(); // consume newline
        if (n == 0) {
            System.out.println("empty");
            return;
        }
        Node[] nodes = new Node[n + 1];
        for (int i = 1; i <= n; i++) nodes[i] = new Node(i);
        boolean hasNeighbors = false;
        for (int i = 1; i <= n; i++) {
            if (sc.hasNextLine()) {
                String line = sc.nextLine().trim();
                if (!line.isEmpty()) {
                    String[] parts = line.split("\\\\s+");
                    for (String p : parts) {
                        if (!p.isEmpty()) {
                            int neighborVal = Integer.parseInt(p);
                            nodes[i].neighbors.add(nodes[neighborVal]);
                            hasNeighbors = true;
                        }
                    }
                }
            }
        }
        if (n == 1 && !hasNeighbors) {
            System.out.println("empty");
            return;
        }
        Solution sol = new Solution();
        Node clone = sol.cloneGraph(nodes[1]);
        if (clone == null) {
            System.out.println("empty");
            return;
        }
        Map<Integer, Node> map = new HashMap<>();
        Queue<Node> q = new LinkedList<>();
        q.add(clone);
        map.put(clone.val, clone);
        while (!q.isEmpty()) {
            Node curr = q.poll();
            for (Node neighbor : curr.neighbors) {
                if (!map.containsKey(neighbor.val)) {
                    map.put(neighbor.val, neighbor);
                    q.add(neighbor);
                }
            }
        }
        for (int i = 1; i <= n; i++) {
            Node curr = map.get(i);
            if (curr != null) {
                StringBuilder sb = new StringBuilder();
                for (int j = 0; j < curr.neighbors.size(); j++) {
                    if (j > 0) sb.append(" ");
                    sb.append(curr.neighbors.get(j).val);
                }
                System.out.println(sb.toString());
            }
        }
    }
}`,
    testSolution: `        if (node == null) return null;
        Map<Node, Node> map = new HashMap<>();
        Queue<Node> queue = new LinkedList<>();
        queue.add(node);
        map.put(node, new Node(node.val));
        while (!queue.isEmpty()) {
            Node curr = queue.poll();
            for (Node neighbor : curr.neighbors) {
                if (!map.containsKey(neighbor)) {
                    map.put(neighbor, new Node(neighbor.val));
                    queue.add(neighbor);
                }
                map.get(curr).neighbors.add(map.get(neighbor));
            }
        }
        return map.get(node);`,
  },
  {
    title: "Course Schedule",
    starterCode: `import java.util.*;

public class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Write your logic here
        return false;
    }

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
        Solution sol = new Solution();
        boolean res = sol.canFinish(numCourses, prerequisites);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        int[] inDegree = new int[numCourses];
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) queue.add(i);
        }
        int count = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            count++;
            for (int nextCourse : adj.get(course)) {
                inDegree[nextCourse]--;
                if (inDegree[nextCourse] == 0) queue.add(nextCourse);
            }
        }
        return count == numCourses;`,
  },
  {
    title: "Pacific Atlantic Water Flow",
    starterCode: `import java.util.*;

public class Solution {
    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        // Write your logic here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] heights = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                heights[i][j] = sc.nextInt();
            }
        }
        Solution sol = new Solution();
        List<List<Integer>> res = sol.pacificAtlantic(heights);
        for (List<Integer> coord : res) {
            System.out.println(coord.get(0) + " " + coord.get(1));
        }
    }
}`,
    testSolution: `        List<List<Integer>> result = new ArrayList<>();
        if (heights == null || heights.length == 0 || heights[0].length == 0) return result;
        int m = heights.length, n = heights[0].length;
        boolean[][] pacific = new boolean[m][n];
        boolean[][] atlantic = new boolean[m][n];
        for (int i = 0; i < m; i++) {
            dfs(heights, pacific, Integer.MIN_VALUE, i, 0);
            dfs(heights, atlantic, Integer.MIN_VALUE, i, n - 1);
        }
        for (int j = 0; j < n; j++) {
            dfs(heights, pacific, Integer.MIN_VALUE, 0, j);
            dfs(heights, atlantic, Integer.MIN_VALUE, m - 1, j);
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (pacific[i][j] && atlantic[i][j]) {
                    result.add(Arrays.asList(i, j));
                }
            }
        }
        return result;
    }

    private void dfs(int[][] matrix, boolean[][] visited, int height, int r, int c) {
        int m = matrix.length, n = matrix[0].length;
        if (r < 0 || r >= m || c < 0 || c >= n || visited[r][c] || matrix[r][c] < height) return;
        visited[r][c] = true;
        dfs(matrix, visited, matrix[r][c], r + 1, c);
        dfs(matrix, visited, matrix[r][c], r - 1, c);
        dfs(matrix, visited, matrix[r][c], r, c + 1);
        dfs(matrix, visited, matrix[r][c], r, c - 1);`,
  },
  {
    title: "Longest Consecutive Sequence",
    starterCode: `import java.util.*;

public class Solution {
    public int longestConsecutive(int[] nums) {
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
        int res = sol.longestConsecutive(nums);
        System.out.println(res);
    }
}`,
    testSolution: `        Set<Integer> numSet = new HashSet<>();
        for (int num : nums) numSet.add(num);
        int longestStreak = 0;
        for (int num : numSet) {
            if (!numSet.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                while (numSet.contains(currentNum + 1)) {
                    currentNum += 1;
                    currentStreak += 1;
                }
                longestStreak = Math.max(longestStreak, currentStreak);
            }
        }
        return longestStreak;`,
  },
  {
    title: "Alien Dictionary",
    starterCode: `import java.util.*;

public class Solution {
    public String alienOrder(String[] words) {
        // Write your logic here
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        sc.next(); // consume count
        List<String> list = new ArrayList<>();
        while (sc.hasNext()) list.add(sc.next());
        String[] words = list.toArray(new String[0]);
        Solution sol = new Solution();
        String res = sol.alienOrder(words);
        System.out.println(res.isEmpty() ? "empty" : res);
    }
}`,
    testSolution: `        Map<Character, Set<Character>> adj = new HashMap<>();
        Map<Character, Integer> inDegree = new HashMap<>();
        for (String word : words) {
            for (char c : word.toCharArray()) {
                inDegree.put(c, 0);
                adj.putIfAbsent(c, new HashSet<>());
            }
        }
        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i], w2 = words[i + 1];
            if (w1.length() > w2.length() && w1.startsWith(w2)) return "";
            for (int j = 0; j < Math.min(w1.length(), w2.length()); j++) {
                char parent = w1.charAt(j), child = w2.charAt(j);
                if (parent != child) {
                    if (!adj.get(parent).contains(child)) {
                        adj.get(parent).add(child);
                        inDegree.put(child, inDegree.get(child) + 1);
                    }
                    break;
                }
            }
        }
        Queue<Character> queue = new LinkedList<>();
        for (char c : inDegree.keySet()) {
            if (inDegree.get(c) == 0) queue.add(c);
        }
        StringBuilder sb = new StringBuilder();
        while (!queue.isEmpty()) {
            char c = queue.poll();
            sb.append(c);
            for (char next : adj.get(c)) {
                inDegree.put(next, inDegree.get(next) - 1);
                if (inDegree.get(next) == 0) queue.add(next);
            }
        }
        if (sb.length() < inDegree.size()) return "";
        return sb.toString();`,
  },
  {
    title: "Graph Valid Tree",
    starterCode: `import java.util.*;

public class Solution {
    public boolean validTree(int n, int[][] edges) {
        // Write your logic here
        return false;
    }

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
        Solution sol = new Solution();
        boolean res = sol.validTree(n, edges);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        if (edges.length != n - 1) return false;
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int[] edge : edges) {
            int root1 = find(parent, edge[0]);
            int root2 = find(parent, edge[1]);
            if (root1 == root2) return false;
            parent[root1] = root2;
        }
        return true;
    }

    private int find(int[] parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]);`,
  },
  {
    title: "Number of Connected Components in an Undirected Graph",
    starterCode: `import java.util.*;

public class Solution {
    public int countComponents(int n, int[][] edges) {
        // Write your logic here
        return 0;
    }

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
        Solution sol = new Solution();
        int res = sol.countComponents(n, edges);
        System.out.println(res);
    }
}`,
    testSolution: `        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int count = n;
        for (int[] edge : edges) {
            int root1 = find(parent, edge[0]);
            int root2 = find(parent, edge[1]);
            if (root1 != root2) {
                parent[root1] = root2;
                count--;
            }
        }
        return count;
    }

    private int find(int[] parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]);`,
  },
];

export const matrixStarters: StarterDefinition[] = [
  {
    title: "Set Matrix Zeroes",
    starterCode: `import java.util.*;

public class Solution {
    public void setZeroes(int[][] matrix) {
        // Write your logic here
        
    }

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
        Solution sol = new Solution();
        sol.setZeroes(matrix);
        for (int i = 0; i < m; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < n; j++) {
                if (j > 0) sb.append(" ");
                sb.append(matrix[i][j]);
            }
            System.out.println(sb.toString());
        }
    }
}`,
    testSolution: `        boolean isCol = false;
        int R = matrix.length, C = matrix[0].length;
        for (int i = 0; i < R; i++) {
            if (matrix[i][0] == 0) isCol = true;
            for (int j = 1; j < C; j++) {
                if (matrix[i][j] == 0) {
                    matrix[0][j] = 0;
                    matrix[i][0] = 0;
                }
            }
        }
        for (int i = 1; i < R; i++) {
            for (int j = 1; j < C; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }
        if (matrix[0][0] == 0) {
            for (int j = 0; j < C; j++) matrix[0][j] = 0;
        }
        if (isCol) {
            for (int i = 0; i < R; i++) matrix[i][0] = 0;
        }`,
  },
  {
    title: "Spiral Matrix",
    starterCode: `import java.util.*;

public class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        // Write your logic here
        return new ArrayList<>();
    }

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
        Solution sol = new Solution();
        List<Integer> res = sol.spiralOrder(matrix);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < res.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(res.get(i));
        }
        System.out.println(sb.toString());
    }
}`,
    testSolution: `        List<Integer> result = new ArrayList<>();
        if (matrix == null || matrix.length == 0) return result;
        int top = 0, bottom = matrix.length - 1;
        int left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) result.add(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) result.add(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
                left++;
            }
        }
        return result;`,
  },
  {
    title: "Rotate Image",
    starterCode: `import java.util.*;

public class Solution {
    public void rotate(int[][] matrix) {
        // Write your logic here
        
    }

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
        Solution sol = new Solution();
        sol.rotate(matrix);
        for (int i = 0; i < n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < n; j++) {
                if (j > 0) sb.append(" ");
                sb.append(matrix[i][j]);
            }
            System.out.println(sb.toString());
        }
    }
}`,
    testSolution: `        int n = matrix.length;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n / 2; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[i][n - 1 - j];
                matrix[i][n - 1 - j] = temp;
            }
        }`,
  },
  {
    title: "Word Search",
    starterCode: `import java.util.*;

public class Solution {
    public boolean exist(char[][] board, String word) {
        // Write your logic here
        return false;
    }

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
        Solution sol = new Solution();
        boolean res = sol.exist(board, word);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                if (dfs(board, word, i, j, 0)) return true;
            }
        }
        return false;
    }

    private boolean dfs(char[][] board, String word, int r, int c, int idx) {
        if (idx == word.length()) return true;
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || board[r][c] != word.charAt(idx)) return false;
        char temp = board[r][c];
        board[r][c] = '#';
        boolean found = dfs(board, word, r + 1, c, idx + 1)
                     || dfs(board, word, r - 1, c, idx + 1)
                     || dfs(board, word, r, c + 1, idx + 1)
                     || dfs(board, word, r, c - 1, idx + 1);
        board[r][c] = temp;
        return found;`,
  },
  {
    title: "Search a 2D Matrix",
    starterCode: `import java.util.*;

public class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        // Write your logic here
        return false;
    }

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
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        Solution sol = new Solution();
        boolean res = sol.searchMatrix(matrix, target);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        if (matrix == null || matrix.length == 0) return false;
        int m = matrix.length, n = matrix[0].length;
        int low = 0, high = m * n - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midVal = matrix[mid / n][mid % n];
            if (midVal == target) return true;
            else if (midVal < target) low = mid + 1;
            else high = mid - 1;
        }
        return false;`,
  },
  {
    title: "Surrounded Regions",
    starterCode: `import java.util.*;

public class Solution {
    public void solve(char[][] board) {
        // Write your logic here
        
    }

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
        Solution sol = new Solution();
        sol.solve(board);
        for (int i = 0; i < m; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < n; j++) {
                if (j > 0) sb.append(" ");
                sb.append(board[i][j]);
            }
            System.out.println(sb.toString());
        }
    }
}`,
    testSolution: `        if (board == null || board.length == 0) return;
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++) {
            if (board[i][0] == 'O') dfs(board, i, 0);
            if (board[i][n - 1] == 'O') dfs(board, i, n - 1);
        }
        for (int j = 0; j < n; j++) {
            if (board[0][j] == 'O') dfs(board, 0, j);
            if (board[m - 1][j] == 'O') dfs(board, m - 1, j);
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (board[i][j] == 'O') board[i][j] = 'X';
                else if (board[i][j] == 'E') board[i][j] = 'O';
            }
        }
    }

    private void dfs(char[][] board, int r, int c) {
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || board[r][c] != 'O') return;
        board[r][c] = 'E';
        dfs(board, r + 1, c);
        dfs(board, r - 1, c);
        dfs(board, r, c + 1);
        dfs(board, r, c - 1);`,
  },
];
