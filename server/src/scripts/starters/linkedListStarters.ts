export interface StarterDefinition {
  title: string;
  starterCode: string;
  testSolution: string;
}

export const linkedListStarters: StarterDefinition[] = [
  {
    title: "Reverse Linked List",
    starterCode: `import java.util.*;

// Definition for singly-linked list.
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your logic here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println("empty");
            return;
        }
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int i = 0; i < n; i++) {
            curr.next = new ListNode(sc.nextInt());
            curr = curr.next;
        }
        Solution sol = new Solution();
        ListNode res = sol.reverseList(dummy.next);
        if (res == null) {
            System.out.println("empty");
            return;
        }
        StringBuilder sb = new StringBuilder();
        while (res != null) {
            sb.append(res.val).append(" ");
            res = res.next;
        }
        System.out.println(sb.toString().trim());
    }
}`,
    testSolution: `        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;`,
  },
  {
    title: "Merge Two Sorted Lists",
    starterCode: `import java.util.*;

// Definition for singly-linked list.
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your logic here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        ListNode dummy1 = new ListNode(0);
        ListNode curr1 = dummy1;
        for (int i = 0; i < n; i++) {
            curr1.next = new ListNode(sc.nextInt());
            curr1 = curr1.next;
        }
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        ListNode dummy2 = new ListNode(0);
        ListNode curr2 = dummy2;
        for (int i = 0; i < m; i++) {
            curr2.next = new ListNode(sc.nextInt());
            curr2 = curr2.next;
        }
        Solution sol = new Solution();
        ListNode res = sol.mergeTwoLists(dummy1.next, dummy2.next);
        if (res == null) {
            System.out.println("empty");
            return;
        }
        StringBuilder sb = new StringBuilder();
        while (res != null) {
            sb.append(res.val).append(" ");
            res = res.next;
        }
        System.out.println(sb.toString().trim());
    }
}`,
    testSolution: `        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                curr.next = list1;
                list1 = list1.next;
            } else {
                curr.next = list2;
                list2 = list2.next;
            }
            curr = curr.next;
        }
        if (list1 != null) curr.next = list1;
        if (list2 != null) curr.next = list2;
        return dummy.next;`,
  },
  {
    title: "Linked List Cycle",
    starterCode: `import java.util.*;

// Definition for singly-linked list.
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Solution {
    public boolean hasCycle(ListNode head) {
        // Write your logic here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int pos = sc.nextInt();
        if (n == 0) {
            System.out.println("false");
            return;
        }
        ListNode[] nodes = new ListNode[n];
        for (int i = 0; i < n; i++) {
            nodes[i] = new ListNode(sc.nextInt());
            if (i > 0) nodes[i - 1].next = nodes[i];
        }
        if (pos >= 0 && pos < n) {
            nodes[n - 1].next = nodes[pos];
        }
        Solution sol = new Solution();
        boolean res = sol.hasCycle(nodes[0]);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        if (head == null) return false;
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;`,
  },
  {
    title: "Remove Nth Node From End of List",
    starterCode: `import java.util.*;

// Definition for singly-linked list.
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        // Write your logic here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int len = sc.nextInt();
        int n = sc.nextInt();
        if (len == 0) {
            System.out.println("empty");
            return;
        }
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int i = 0; i < len; i++) {
            curr.next = new ListNode(sc.nextInt());
            curr = curr.next;
        }
        Solution sol = new Solution();
        ListNode res = sol.removeNthFromEnd(dummy.next, n);
        if (res == null) {
            System.out.println("empty");
            return;
        }
        StringBuilder sb = new StringBuilder();
        while (res != null) {
            sb.append(res.val).append(" ");
            res = res.next;
        }
        System.out.println(sb.toString().trim());
    }
}`,
    testSolution: `        ListNode dummy = new ListNode(0, head);
        ListNode first = dummy;
        ListNode second = dummy;
        for (int i = 0; i <= n; i++) {
            first = first.next;
        }
        while (first != null) {
            first = first.next;
            second = second.next;
        }
        second.next = second.next.next;
        return dummy.next;`,
  },
  {
    title: "Reorder List",
    starterCode: `import java.util.*;

// Definition for singly-linked list.
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Solution {
    public void reorderList(ListNode head) {
        // Write your logic here
        
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println("empty");
            return;
        }
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int i = 0; i < n; i++) {
            curr.next = new ListNode(sc.nextInt());
            curr = curr.next;
        }
        Solution sol = new Solution();
        sol.reorderList(dummy.next);
        ListNode res = dummy.next;
        if (res == null) {
            System.out.println("empty");
            return;
        }
        StringBuilder sb = new StringBuilder();
        while (res != null) {
            sb.append(res.val).append(" ");
            res = res.next;
        }
        System.out.println(sb.toString().trim());
    }
}`,
    testSolution: `        if (head == null || head.next == null) return;
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode second = slow.next;
        slow.next = null;
        ListNode prev = null, curr = second;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        ListNode first = head;
        second = prev;
        while (second != null) {
            ListNode t1 = first.next, t2 = second.next;
            first.next = second;
            second.next = t1;
            first = t1;
            second = t2;
        }`,
  },
];
