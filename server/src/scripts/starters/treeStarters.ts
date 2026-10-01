import { StarterDefinition } from "./linkedListStarters";

const TREE_BUILDER_AND_PRINTER = `
    public static TreeNode buildTree(String[] tokens) {
        if (tokens == null || tokens.length == 0 || tokens[0].equals("null") || tokens[0].equals("")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(tokens[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        int i = 1;
        while (!queue.isEmpty() && i < tokens.length) {
            TreeNode curr = queue.poll();
            if (i < tokens.length) {
                if (!tokens[i].equals("null") && !tokens[i].equals("")) {
                    curr.left = new TreeNode(Integer.parseInt(tokens[i]));
                    queue.add(curr.left);
                }
                i++;
            }
            if (i < tokens.length) {
                if (!tokens[i].equals("null") && !tokens[i].equals("")) {
                    curr.right = new TreeNode(Integer.parseInt(tokens[i]));
                    queue.add(curr.right);
                }
                i++;
            }
        }
        return root;
    }

    public static void printTree(TreeNode root) {
        if (root == null) {
            System.out.println("null");
            return;
        }
        List<String> list = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            TreeNode curr = queue.poll();
            if (curr != null) {
                list.add(String.valueOf(curr.val));
                queue.add(curr.left);
                queue.add(curr.right);
            } else {
                list.add("null");
            }
        }
        int last = list.size() - 1;
        while (last >= 0 && list.get(last).equals("null")) last--;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i <= last; i++) {
            if (i > 0) sb.append(" ");
            sb.append(list.get(i));
        }
        System.out.println(sb.toString());
    }
`;

export const treeStarters: StarterDefinition[] = [
  {
    title: "Maximum Depth of Binary Tree",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public int maxDepth(TreeNode root) {
        // Write your logic here
        return 0;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println(0);
            return;
        }
        List<String> list = new ArrayList<>();
        while (sc.hasNext()) list.add(sc.next());
        TreeNode root = buildTree(list.toArray(new String[0]));
        Solution sol = new Solution();
        int res = sol.maxDepth(root);
        System.out.println(res);
    }
}`,
    testSolution: `        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));`,
  },
  {
    title: "Same Tree",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        // Write your logic here
        return false;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] tokens1 = new String[n];
        for (int i = 0; i < n; i++) tokens1[i] = sc.next();
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        String[] tokens2 = new String[m];
        for (int i = 0; i < m; i++) tokens2[i] = sc.next();
        TreeNode p = buildTree(tokens1);
        TreeNode q = buildTree(tokens2);
        Solution sol = new Solution();
        boolean res = sol.isSameTree(p, q);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        if (p == null && q == null) return true;
        if (p == null || q == null || p.val != q.val) return false;
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);`,
  },
  {
    title: "Invert Binary Tree",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public TreeNode invertTree(TreeNode root) {
        // Write your logic here
        return null;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println("empty");
            return;
        }
        List<String> list = new ArrayList<>();
        while (sc.hasNext()) list.add(sc.next());
        TreeNode root = buildTree(list.toArray(new String[0]));
        Solution sol = new Solution();
        TreeNode res = sol.invertTree(root);
        printTree(res);
    }
}`,
    testSolution: `        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;`,
  },
  {
    title: "Binary Tree Maximum Path Sum",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    private int maxSum = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        // Write your logic here
        return 0;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        List<String> list = new ArrayList<>();
        while (sc.hasNext()) list.add(sc.next());
        TreeNode root = buildTree(list.toArray(new String[0]));
        Solution sol = new Solution();
        int res = sol.maxPathSum(root);
        System.out.println(res);
    }
}`,
    testSolution: `        maxSum = Integer.MIN_VALUE;
        maxGain(root);
        return maxSum;
    }

    private int maxGain(TreeNode node) {
        if (node == null) return 0;
        int leftGain = Math.max(maxGain(node.left), 0);
        int rightGain = Math.max(maxGain(node.right), 0);
        int priceNewPath = node.val + leftGain + rightGain;
        maxSum = Math.max(maxSum, priceNewPath);
        return node.val + Math.max(leftGain, rightGain);`,
  },
  {
    title: "Binary Tree Level Order Traversal",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // Write your logic here
        return new ArrayList<>();
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println("empty");
            return;
        }
        List<String> list = new ArrayList<>();
        for (int i = 0; i < n; i++) list.add(sc.next());
        TreeNode root = buildTree(list.toArray(new String[0]));
        Solution sol = new Solution();
        List<List<Integer>> res = sol.levelOrder(root);
        if (res.isEmpty()) {
            System.out.println("empty");
            return;
        }
        for (List<Integer> level : res) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < level.size(); i++) {
                if (i > 0) sb.append(" ");
                sb.append(level.get(i));
            }
            System.out.println(sb.toString());
        }
    }
}`,
    testSolution: `        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> currentLevel = new ArrayList<>();
            for (int i = 0; i < levelSize; i++) {
                TreeNode curr = queue.poll();
                currentLevel.add(curr.val);
                if (curr.left != null) queue.add(curr.left);
                if (curr.right != null) queue.add(curr.right);
            }
            result.add(currentLevel);
        }
        return result;`,
  },
  {
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        // Write your logic here
        return null;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] preorder = new int[n];
        for (int i = 0; i < n; i++) preorder[i] = sc.nextInt();
        int[] inorder = new int[n];
        for (int i = 0; i < n; i++) inorder[i] = sc.nextInt();
        Solution sol = new Solution();
        TreeNode root = sol.buildTree(preorder, inorder);
        printTree(root);
    }
}`,
    testSolution: `        Map<Integer, Integer> inMap = new HashMap<>();
        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);
        return helper(preorder, 0, preorder.length - 1, 0, inorder.length - 1, inMap);
    }

    private TreeNode helper(int[] preorder, int preStart, int preEnd, int inStart, int inEnd, Map<Integer, Integer> inMap) {
        if (preStart > preEnd || inStart > inEnd) return null;
        TreeNode root = new TreeNode(preorder[preStart]);
        int inRoot = inMap.get(root.val);
        int numsLeft = inRoot - inStart;
        root.left = helper(preorder, preStart + 1, preStart + numsLeft, inStart, inRoot - 1, inMap);
        root.right = helper(preorder, preStart + numsLeft + 1, preEnd, inRoot + 1, inEnd, inMap);
        return root;`,
  },
  {
    title: "Validate Binary Search Tree",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public boolean isValidBST(TreeNode root) {
        // Write your logic here
        return false;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        List<String> list = new ArrayList<>();
        while (sc.hasNext()) list.add(sc.next());
        TreeNode root = buildTree(list.toArray(new String[0]));
        Solution sol = new Solution();
        boolean res = sol.isValidBST(root);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        return validate(root, null, null);
    }

    private boolean validate(TreeNode node, Integer low, Integer high) {
        if (node == null) return true;
        if ((low != null && node.val <= low) || (high != null && node.val >= high)) return false;
        return validate(node.left, low, node.val) && validate(node.right, node.val, high);`,
  },
  {
    title: "Kth Smallest Element in a BST",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public int kthSmallest(TreeNode root, int k) {
        // Write your logic here
        return 0;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        List<String> list = new ArrayList<>();
        while (sc.hasNext()) list.add(sc.next());
        TreeNode root = buildTree(list.toArray(new String[0]));
        Solution sol = new Solution();
        int res = sol.kthSmallest(root, k);
        System.out.println(res);
    }
}`,
    testSolution: `        Stack<TreeNode> stack = new Stack<>();
        TreeNode curr = root;
        while (curr != null || !stack.isEmpty()) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.left;
            }
            curr = stack.pop();
            if (--k == 0) return curr.val;
            curr = curr.right;
        }
        return -1;`,
  },
  {
    title: "Lowest Common Ancestor of a BST",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        // Write your logic here
        return null;
    }
${TREE_BUILDER_AND_PRINTER}
    public static TreeNode findNode(TreeNode root, int val) {
        if (root == null) return null;
        if (root.val == val) return root;
        TreeNode left = findNode(root.left, val);
        if (left != null) return left;
        return findNode(root.right, val);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int valP = sc.nextInt();
        int valQ = sc.nextInt();
        List<String> list = new ArrayList<>();
        while (sc.hasNext()) list.add(sc.next());
        TreeNode root = buildTree(list.toArray(new String[0]));
        TreeNode p = findNode(root, valP);
        TreeNode q = findNode(root, valQ);
        Solution sol = new Solution();
        TreeNode res = sol.lowestCommonAncestor(root, p, q);
        System.out.println(res != null ? res.val : "null");
    }
}`,
    testSolution: `        if (root == null || p == null || q == null) return root;
        if (p.val < root.val && q.val < root.val) {
            return lowestCommonAncestor(root.left, p, q);
        } else if (p.val > root.val && q.val > root.val) {
            return lowestCommonAncestor(root.right, p, q);
        } else {
            return root;
        }`,
  },
  {
    title: "Subtree of Another Tree",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    public boolean isSubtree(TreeNode root, TreeNode subRoot) {
        // Write your logic here
        return false;
    }
${TREE_BUILDER_AND_PRINTER}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] tokens1 = new String[n];
        for (int i = 0; i < n; i++) tokens1[i] = sc.next();
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        String[] tokens2 = new String[m];
        for (int i = 0; i < m; i++) tokens2[i] = sc.next();
        TreeNode root = buildTree(tokens1);
        TreeNode subRoot = buildTree(tokens2);
        Solution sol = new Solution();
        boolean res = sol.isSubtree(root, subRoot);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        if (root == null) return false;
        if (isSame(root, subRoot)) return true;
        return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
    }

    private boolean isSame(TreeNode s, TreeNode t) {
        if (s == null && t == null) return true;
        if (s == null || t == null || s.val != t.val) return false;
        return isSame(s.left, t.left) && isSame(s.right, t.right);`,
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    starterCode: `import java.util.*;

// Definition for a binary tree node.
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution {
    // Encodes a tree to a single string.
    public String serialize(TreeNode root) {
        // Write your logic here
        return "";
    }

    // Decodes your encoded data to tree.
    public TreeNode deserialize(String data) {
        // Write your deserialize logic here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        if (line.isEmpty()) return;
        Solution sol = new Solution();
        TreeNode root = sol.deserialize(line);
        String res = sol.serialize(root);
        System.out.println(res);
    }
}`,
    testSolution: `        if (root == null) return "null";
        StringBuilder sb = new StringBuilder();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode node = q.poll();
            if (node == null) {
                sb.append("null ");
                continue;
            }
            sb.append(node.val).append(" ");
            q.add(node.left);
            q.add(node.right);
        }
        String s = sb.toString().trim();
        String[] parts = s.split(" ");
        int last = parts.length - 1;
        while (last >= 0 && parts[last].equals("null")) last--;
        StringBuilder clean = new StringBuilder();
        for (int i = 0; i <= last; i++) {
            if (i > 0) clean.append(" ");
            clean.append(parts[i]);
        }
        return clean.toString();`,
    testSolution2: `        if (data == null || data.trim().isEmpty() || data.trim().equals("null")) return null;
        String[] parts = data.trim().split("\\\\s+");
        TreeNode root = new TreeNode(Integer.parseInt(parts[0]));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < parts.length) {
            TreeNode curr = q.poll();
            if (i < parts.length && !parts[i].equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(parts[i]));
                q.add(curr.left);
            }
            i++;
            if (i < parts.length && !parts[i].equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(parts[i]));
                q.add(curr.right);
            }
            i++;
        }
        return root;`,
  } as any,
];
