import { StarterDefinition } from "./linkedListStarters";

export const heapStarters: StarterDefinition[] = [
  {
    title: "Kth Largest Element in an Array",
    starterCode: `import java.util.*;

public class Solution {
    public int findKthLargest(int[] nums, int k) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        if (!sc.hasNextInt()) return;
        int k = sc.nextInt();
        Solution sol = new Solution();
        int res = sol.findKthLargest(nums, k);
        System.out.println(res);
    }
}`,
    testSolution: `        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) minHeap.poll();
        }
        return minHeap.peek();`,
  },
  {
    title: "Top K Frequent Elements",
    starterCode: `import java.util.*;

public class Solution {
    public int[] topKFrequent(int[] nums, int k) {
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
        int k = sc.nextInt();
        Solution sol = new Solution();
        int[] res = sol.topKFrequent(nums, k);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < res.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(res[i]);
        }
        System.out.println(sb.toString().trim());
    }
}`,
    testSolution: `        Map<Integer, Integer> count = new HashMap<>();
        for (int n : nums) count.put(n, count.getOrDefault(n, 0) + 1);
        PriorityQueue<Integer> heap = new PriorityQueue<>((n1, n2) -> count.get(n1) - count.get(n2));
        for (int n : count.keySet()) {
            heap.add(n);
            if (heap.size() > k) heap.poll();
        }
        int[] top = new int[k];
        for (int i = k - 1; i >= 0; --i) {
            top[i] = heap.poll();
        }
        return top;`,
  },
  {
    title: "Find Median from Data Stream",
    starterCode: `import java.util.*;

class MedianFinder {
    private PriorityQueue<Integer> small;
    private PriorityQueue<Integer> large;

    public MedianFinder() {
        // Write your logic here
        small = new PriorityQueue<>(Collections.reverseOrder());
        large = new PriorityQueue<>();
    }

    public void addNum(int num) {
        // Write your addNum logic here
    }

    public double findMedian() {
        // Write your findMedian logic here
        return 0.0;
    }
}

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        MedianFinder mf = new MedianFinder();
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            mf.addNum(val);
            double med = mf.findMedian();
            if (med == (long) med) {
                System.out.printf(Locale.US, "%.1f\\n", med);
            } else {
                System.out.printf(Locale.US, "%.1f\\n", med);
            }
        }
    }
}`,
    testSolution: `        small = new PriorityQueue<>(Collections.reverseOrder());
        large = new PriorityQueue<>();`,
    testSolution2: `        small.offer(num);
        large.offer(small.poll());
        if (small.size() < large.size()) {
            small.offer(large.poll());
        }`,
    testSolution3: `        if (small.size() > large.size()) {
            return small.peek();
        } else {
            return (small.peek() + large.peek()) / 2.0;
        }`,
  } as any,
  {
    title: "Merge K Sorted Lists",
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
    public ListNode mergeKLists(ListNode[] lists) {
        // Write your logic here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int k = sc.nextInt();
        if (k == 0) {
            System.out.println("empty");
            return;
        }
        ListNode[] lists = new ListNode[k];
        for (int i = 0; i < k; i++) {
            int len = sc.nextInt();
            ListNode dummy = new ListNode(0);
            ListNode curr = dummy;
            for (int j = 0; j < len; j++) {
                curr.next = new ListNode(sc.nextInt());
                curr = curr.next;
            }
            lists[i] = dummy.next;
        }
        Solution sol = new Solution();
        ListNode res = sol.mergeKLists(lists);
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
    testSolution: `        if (lists == null || lists.length == 0) return null;
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode node : lists) {
            if (node != null) pq.offer(node);
        }
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            curr.next = node;
            curr = curr.next;
            if (node.next != null) pq.offer(node.next);
        }
        return dummy.next;`,
  },
];

export const intervalStarters: StarterDefinition[] = [
  {
    title: "Merge Intervals",
    starterCode: `import java.util.*;

public class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your logic here
        return new int[0][0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        Solution sol = new Solution();
        int[][] res = sol.merge(intervals);
        for (int[] interval : res) {
            System.out.println(interval[0] + " " + interval[1]);
        }
    }
}`,
    testSolution: `        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] newInterval = intervals[0];
        result.add(newInterval);
        for (int[] interval : intervals) {
            if (interval[0] <= newInterval[1]) {
                newInterval[1] = Math.max(newInterval[1], interval[1]);
            } else {
                newInterval = interval;
                result.add(newInterval);
            }
        }
        return result.toArray(new int[result.size()][]);`,
  },
  {
    title: "Insert Interval",
    starterCode: `import java.util.*;

public class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        // Write your logic here
        return new int[0][0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        int[] newInterval = new int[2];
        newInterval[0] = sc.nextInt();
        newInterval[1] = sc.nextInt();
        Solution sol = new Solution();
        int[][] res = sol.insert(intervals, newInterval);
        for (int[] interval : res) {
            System.out.println(interval[0] + " " + interval[1]);
        }
    }
}`,
    testSolution: `        List<int[]> result = new ArrayList<>();
        int i = 0, n = intervals.length;
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.add(intervals[i++]);
        }
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.add(newInterval);
        while (i < n) {
            result.add(intervals[i++]);
        }
        return result.toArray(new int[result.size()][]);`,
  },
  {
    title: "Non-overlapping Intervals",
    starterCode: `import java.util.*;

public class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        Solution sol = new Solution();
        int res = sol.eraseOverlapIntervals(intervals);
        System.out.println(res);
    }
}`,
    testSolution: `        if (intervals.length == 0) return 0;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
        int count = 0;
        int prevEnd = intervals[0][1];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < prevEnd) {
                count++;
            } else {
                prevEnd = intervals[i][1];
            }
        }
        return count;`,
  },
  {
    title: "Meeting Rooms",
    starterCode: `import java.util.*;

public class Solution {
    public boolean canAttendMeetings(int[][] intervals) {
        // Write your logic here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        Solution sol = new Solution();
        boolean res = sol.canAttendMeetings(intervals);
        System.out.println(res ? "true" : "false");
    }
}`,
    testSolution: `        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        for (int i = 0; i < intervals.length - 1; i++) {
            if (intervals[i][1] > intervals[i + 1][0]) return false;
        }
        return true;`,
  },
  {
    title: "Meeting Rooms II",
    starterCode: `import java.util.*;

public class Solution {
    public int minMeetingRooms(int[][] intervals) {
        // Write your logic here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        Solution sol = new Solution();
        int res = sol.minMeetingRooms(intervals);
        System.out.println(res);
    }
}`,
    testSolution: `        if (intervals.length == 0) return 0;
        int[] starts = new int[intervals.length];
        int[] ends = new int[intervals.length];
        for (int i = 0; i < intervals.length; i++) {
            starts[i] = intervals[i][0];
            ends[i] = intervals[i][1];
        }
        Arrays.sort(starts);
        Arrays.sort(ends);
        int rooms = 0, endsItr = 0;
        for (int i = 0; i < starts.length; i++) {
            if (starts[i] < ends[endsItr]) {
                rooms++;
            } else {
                endsItr++;
            }
        }
        return rooms;`,
  },
];
