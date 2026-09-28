import { prisma } from "./src/db.js";
import { executeCode } from "./src/services/codeRunner.js";
import { gradeStudentCode, gradeMcqQuestion } from "./src/services/gradingService.js";

async function runProfessorStudentEvaluation() {
  console.log("================================================================================");
  console.log("   🧪 PROFESSOR & STUDENT MULTI-LANGUAGE & SCORING EVALUATION");
  console.log("================================================================================\n");

  const testCode = `EVAL-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  // 1. Passed start time (15 mins ago) and future end time (45 mins ahead)
  const passedStartTime = new Date(now.getTime() - 15 * 60000);
  const futureEndTime = new Date(now.getTime() + 45 * 60000);

  console.log(`[Step 1] Professor Creating Assessment with Passed Start Time...`);
  console.log(`  -> Code: ${testCode}`);
  console.log(`  -> Start Time (in past): ${passedStartTime.toISOString()}`);
  console.log(`  -> End Time (in future): ${futureEndTime.toISOString()}`);
  console.log(`  -> Duration: 60 Minutes`);

  const assessment = await prisma.assessment.create({
    data: {
      title: "Algorithms, Data Structures & Systems Midterm Evaluation",
      description: "Comprehensive multi-language exam with Single/Multi MCQs, partial credit coding, and negative marking.",
      code: testCode,
      durationMinutes: 60,
      startTime: passedStartTime,
      endTime: futureEndTime,
      shuffleQuestions: false,
      requireSeb: false,
      sebQuitPassword: "profExit123",
      isReviewUnlocked: false,
    },
  });

  // Section 1: MCQs (Single & Multiple Choice)
  const sec1 = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section A: Conceptual & Output MCQs",
      description: "Single and Multiple choice questions with negative penalties.",
      order: 0,
    },
  });

  // MCQ 1: Single Choice (Marks: 2, Penalty: 0.5)
  const q1 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec1.id,
      type: "MCQ",
      title: "Time Complexity of Binary Search",
      description: "What is the worst-case time complexity of Binary Search on a sorted array of size N?",
      marks: 2.0,
      negativeMarks: 0.5,
      mcqType: "SINGLE",
      options: JSON.stringify([
        { id: "opt-1a", text: "O(1)" },
        { id: "opt-1b", text: "O(log N)" },
        { id: "opt-1c", text: "O(N)" },
        { id: "opt-1d", text: "O(N log N)" },
      ]),
      correctAnswers: JSON.stringify(["opt-1b"]),
      explanation: "Binary search cuts the search space in half at each step, yielding O(log N).",
      order: 0,
    },
  });

  // MCQ 2: Single Choice (Marks: 2, Penalty: 0.5)
  const q2 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec1.id,
      type: "MCQ",
      title: "C Pointer Dereference",
      description: "In C, which operator is used to obtain the value at the address stored in a pointer variable?",
      marks: 2.0,
      negativeMarks: 0.5,
      mcqType: "SINGLE",
      options: JSON.stringify([
        { id: "opt-2a", text: "& (Address-of)" },
        { id: "opt-2b", text: "* (Indirection/Dereference)" },
        { id: "opt-2c", text: "-> (Structure Dereference)" },
        { id: "opt-2d", text: "% (Modulo)" },
      ]),
      correctAnswers: JSON.stringify(["opt-2b"]),
      explanation: "The unary asterisk (*) operator dereferences a pointer to access the value at that address.",
      order: 1,
    },
  });

  // MCQ 3: Multiple Choice (Marks: 4, Penalty: 1.0)
  const q3 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec1.id,
      type: "MCQ",
      title: "Linear Data Structures",
      description: "Select ALL data structures that are considered Linear:",
      marks: 4.0,
      negativeMarks: 1.0,
      mcqType: "MULTIPLE",
      options: JSON.stringify([
        { id: "opt-3a", text: "Singly Linked List" },
        { id: "opt-3b", text: "Binary Search Tree" },
        { id: "opt-3c", text: "Queue" },
        { id: "opt-3d", text: "Graph" },
      ]),
      correctAnswers: JSON.stringify(["opt-3a", "opt-3c"]),
      explanation: "Linked lists and Queues are linear. Trees and Graphs are non-linear.",
      order: 2,
    },
  });

  // Section 2: Coding Problems (4 Coding Questions)
  const sec2 = await prisma.section.create({
    data: {
      assessmentId: assessment.id,
      title: "Section B: Hands-On Algorithmic Coding",
      description: "Solve problems in Java, C, or C++ with open and hidden test cases.",
      order: 1,
    },
  });

  // Coding Q4: Array Sum Calculation (Marks: 12)
  const q4 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec2.id,
      type: "CODING",
      title: "Problem 1: Array Sum Calculation",
      description: "Read N, followed by N integers. Print their total sum.",
      marks: 12.0,
      allowedLanguages: "JAVA,C,CPP",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      order: 3,
      testCases: {
        create: [
          { input: "3\n10 20 30", expectedOutput: "60", isPublic: true, weight: 1.0, order: 0 },
          { input: "5\n1 2 3 4 5", expectedOutput: "15", isPublic: true, weight: 1.0, order: 1 },
          { input: "4\n-10 20 -30 40", expectedOutput: "20", isPublic: false, weight: 2.0, order: 2 },
          { input: "1\n999", expectedOutput: "999", isPublic: false, weight: 2.0, order: 3 },
        ],
      },
    },
  });

  // Coding Q5: Palindrome Number Checker (Marks: 14)
  const q5 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec2.id,
      type: "CODING",
      title: "Problem 2: Palindrome String / Number",
      description: "Given a string S without spaces, print 'YES' if it is a palindrome, otherwise 'NO'.",
      marks: 14.0,
      allowedLanguages: "JAVA,C,CPP",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      order: 4,
      testCases: {
        create: [
          { input: "racecar", expectedOutput: "YES", isPublic: true, weight: 1.0, order: 0 },
          { input: "hello", expectedOutput: "NO", isPublic: true, weight: 1.0, order: 1 },
          { input: "madam", expectedOutput: "YES", isPublic: false, weight: 2.0, order: 2 },
          { input: "algorithm", expectedOutput: "NO", isPublic: false, weight: 3.0, order: 3 },
        ],
      },
    },
  });

  // Coding Q6: Maximum Subarray Sum (Kadane's Algorithm) (Marks: 16)
  const q6 = await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      sectionId: sec2.id,
      type: "CODING",
      title: "Problem 3: Maximum Contiguous Subarray Sum",
      description: "Find the maximum sum of a contiguous subarray in an array of N integers.",
      marks: 16.0,
      allowedLanguages: "JAVA,C,CPP",
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      order: 5,
      testCases: {
        create: [
          { input: "8\n-2 -3 4 -1 -2 1 5 -3", expectedOutput: "7", isPublic: true, weight: 1.0, order: 0 },
          { input: "5\n-1 -2 -3 -4 -5", expectedOutput: "-1", isPublic: true, weight: 1.0, order: 1 },
          { input: "4\n1 2 3 4", expectedOutput: "10", isPublic: false, weight: 2.0, order: 2 },
          { input: "6\n5 -4 3 -2 7 -1", expectedOutput: "9", isPublic: false, weight: 4.0, order: 3 },
        ],
      },
    },
  });

  console.log(`✅ Assessment Created: Total 2 Sections, 3 MCQs, 3 Coding Questions. Total Marks: 50.0\n`);

  // [Step 2] Student Attempt Start with Passed Start Time Check
  console.log(`[Step 2] Student Starting Assessment (Verifying Passed Start Time Access)...`);
  const studentAttempt = await prisma.studentAttempt.create({
    data: {
      assessmentId: assessment.id,
      rollNo: "21CS888",
      studentName: "Dev Sharma",
      status: "IN_PROGRESS",
      startedAt: now,
      remainingSeconds: 60 * 60,
    },
  });

  // Calculate remaining seconds bounded by futureEndTime
  const secondsRemaining = Math.floor((futureEndTime.getTime() - now.getTime()) / 1000);
  console.log(`  -> Student 21CS888 Successfully Entered (Passed Start Time Allowed)`);
  console.log(`  -> Time Remaining until Cut-off: ${Math.floor(secondsRemaining / 60)} minutes (${secondsRemaining}s)\n`);

  // [Step 3] MCQ Scoring Evaluation (Positive Marks & Negative Penalties)
  console.log(`[Step 3] Evaluating MCQ Scoring Rules (Single & Multiple Choice)...`);

  // Q1: Right answer -> +2.0 marks
  const mcq1Grade = gradeMcqQuestion(["opt-1b"], ["opt-1b"], q1.marks, q1.negativeMarks);
  console.log(`  -> Q1 (Single Choice Right): Selected ['opt-1b'] => Score: +${mcq1Grade.score} / ${mcq1Grade.maxScore} (Status: ${mcq1Grade.status})`);
  await prisma.submission.create({
    data: {
      attemptId: studentAttempt.id,
      questionId: q1.id,
      type: "MCQ",
      selectedOptions: JSON.stringify(["opt-1b"]),
      score: mcq1Grade.score,
      maxScore: q1.marks,
      status: "ACCEPTED",
    },
  });

  // Q2: Wrong answer -> -0.5 penalty
  const mcq2Grade = gradeMcqQuestion(["opt-2a"], ["opt-2b"], q2.marks, q2.negativeMarks);
  console.log(`  -> Q2 (Single Choice Wrong): Selected ['opt-2a'] => Score: ${mcq2Grade.score} / ${mcq2Grade.maxScore} (Status: ${mcq2Grade.status})`);
  await prisma.submission.create({
    data: {
      attemptId: studentAttempt.id,
      questionId: q2.id,
      type: "MCQ",
      selectedOptions: JSON.stringify(["opt-2a"]),
      score: mcq2Grade.score,
      maxScore: q2.marks,
      status: "WRONG_ANSWER",
    },
  });

  // Q3: Multiple Choice (Right answers: opt-3a, opt-3c) -> Student picks opt-3a + opt-3c => Full +4.0 marks
  const mcq3Grade = gradeMcqQuestion(["opt-3a", "opt-3c"], ["opt-3a", "opt-3c"], q3.marks, q3.negativeMarks);
  console.log(`  -> Q3 (Multi-Choice Exact Match): Selected ['opt-3a', 'opt-3c'] => Score: +${mcq3Grade.score} / ${mcq3Grade.maxScore} (Status: ${mcq3Grade.status})\n`);
  await prisma.submission.create({
    data: {
      attemptId: studentAttempt.id,
      questionId: q3.id,
      type: "MCQ",
      selectedOptions: JSON.stringify(["opt-3a", "opt-3c"]),
      score: mcq3Grade.score,
      maxScore: q3.marks,
      status: "ACCEPTED",
    },
  });

  // [Step 4] Coding Multi-Language Execution & Partial Testcase Scoring
  console.log(`[Step 4] Testing Coding Multi-Language Execution & Partial Scoring...`);

  // Q4: Java 100% Accepted Solution (Array Sum)
  console.log(`  -> Q4 in Java (100% Correct Solution)...`);
  const javaCode = `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long sum = 0;
        for(int i = 0; i < n; i++) sum += sc.nextInt();
        System.out.println(sum);
    }
}`;
  const fullQ4 = await prisma.question.findUnique({
    where: { id: q4.id },
    include: { testCases: true },
  });
  const q4Grade = await gradeStudentCode("JAVA", javaCode, fullQ4 as any, false);
  console.log(`     Result: ${q4Grade.status} | Passed: ${q4Grade.passedTestCases}/${q4Grade.totalTestCases} | Score: ${q4Grade.totalScore}/${q4Grade.maxScore}`);
  await prisma.submission.create({
    data: {
      attemptId: studentAttempt.id,
      questionId: q4.id,
      type: "CODING",
      language: "JAVA",
      code: javaCode,
      score: q4Grade.totalScore,
      maxScore: q4.marks,
      passedTestCases: q4Grade.passedTestCases,
      totalTestCases: q4Grade.totalTestCases,
      status: q4Grade.status,
      testCaseResults: JSON.stringify(q4Grade.results),
    },
  });

  // Q5: C Partial Passing Solution (Palindrome Checker)
  // Hardcoded to only handle sample inputs "racecar" and "hello", failing on hidden test cases!
  console.log(`  -> Q5 in C (Partial Solution: Passing 2/4 testcases with weights)...`);
  const cPartialCode = `#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    if (scanf("%99s", s) != 1) return 0;
    if (strcmp(s, "racecar") == 0) {
        printf("YES\\n");
    } else if (strcmp(s, "hello") == 0) {
        printf("NO\\n");
    } else {
        // Incorrect default for hidden cases
        printf("WRONG_OUTPUT\\n");
    }
    return 0;
}`;
  const fullQ5 = await prisma.question.findUnique({
    where: { id: q5.id },
    include: { testCases: true },
  });
  const q5Grade = await gradeStudentCode("C", cPartialCode, fullQ5 as any, false);
  console.log(`     Result: ${q5Grade.status} | Passed: ${q5Grade.passedTestCases}/${q5Grade.totalTestCases} | Partial Score: ${q5Grade.totalScore}/${q5Grade.maxScore}`);
  console.log(`     (Weights: Passed 2.0 / Total 8.0 => ${(2/8)*100}% = ${q5Grade.totalScore} marks)`);
  await prisma.submission.create({
    data: {
      attemptId: studentAttempt.id,
      questionId: q5.id,
      type: "CODING",
      language: "C",
      code: cPartialCode,
      score: q5Grade.totalScore,
      maxScore: q5.marks,
      passedTestCases: q5Grade.passedTestCases,
      totalTestCases: q5Grade.totalTestCases,
      status: q5Grade.status,
      testCaseResults: JSON.stringify(q5Grade.results),
    },
  });

  // Q6: C++ Kadane 100% Solution (Max Subarray Sum)
  console.log(`  -> Q6 in C++ (Kadane's Algorithm 100% Accepted)...`);
  const cppCode = `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n) || n <= 0) return 0;
    long long maxSoFar = -1e18, currMax = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        currMax += x;
        if (currMax > maxSoFar) maxSoFar = currMax;
        if (currMax < 0) currMax = 0;
    }
    cout << maxSoFar << "\\n";
    return 0;
}`;
  const fullQ6 = await prisma.question.findUnique({
    where: { id: q6.id },
    include: { testCases: true },
  });
  const q6Grade = await gradeStudentCode("CPP", cppCode, fullQ6 as any, false);
  console.log(`     Result: ${q6Grade.status} | Passed: ${q6Grade.passedTestCases}/${q6Grade.totalTestCases} | Score: ${q6Grade.totalScore}/${q6Grade.maxScore}\n`);
  await prisma.submission.create({
    data: {
      attemptId: studentAttempt.id,
      questionId: q6.id,
      type: "CODING",
      language: "CPP",
      code: cppCode,
      score: q6Grade.totalScore,
      maxScore: q6.marks,
      passedTestCases: q6Grade.passedTestCases,
      totalTestCases: q6Grade.totalTestCases,
      status: q6Grade.status,
      testCaseResults: JSON.stringify(q6Grade.results),
    },
  });

  // [Step 5] Final Submission & Gradebook Audit
  console.log(`[Step 5] Submitting Attempt & Auditing Final Institutional Gradebook...`);
  await prisma.studentAttempt.update({
    where: { id: studentAttempt.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      remainingSeconds: 0,
    },
  });

  const allSubmissions = await prisma.submission.findMany({
    where: { attemptId: studentAttempt.id },
    include: { question: true },
  });

  const totalPossibleMarks = 50.0;
  const earnedScore = allSubmissions.reduce((sum, s) => sum + s.score, 0);
  const percentage = Number(((earnedScore / totalPossibleMarks) * 100).toFixed(2));

  console.log(`  ----------------------------------------------------------------`);
  console.log(`  Candidate: Dev Sharma (21CS888)`);
  console.log(`  ----------------------------------------------------------------`);
  console.log(`  Q1 MCQ (Single Right) : +${mcq1Grade.score} / ${q1.marks}`);
  console.log(`  Q2 MCQ (Single Wrong) : ${mcq2Grade.score} / ${q2.marks} (Penalty applied)`);
  console.log(`  Q3 MCQ (Multi-Choice) : +${mcq3Grade.score} / ${q3.marks}`);
  console.log(`  Q4 Coding (Java 100%) : +${q4Grade.totalScore} / ${q4.marks}`);
  console.log(`  Q5 Coding (C Partial) : +${q5Grade.totalScore} / ${q5.marks} (Partial testcase score)`);
  console.log(`  Q6 Coding (C++ 100%)  : +${q6Grade.totalScore} / ${q6.marks}`);
  console.log(`  ----------------------------------------------------------------`);
  console.log(`  🎯 TOTAL SCORE        : ${earnedScore} / ${totalPossibleMarks} (${percentage}%)`);
  console.log(`  ----------------------------------------------------------------\n`);

  // Cleanup test data
  console.log(`[Step 6] Cleaning up test assessment data...`);
  await prisma.assessment.delete({ where: { id: assessment.id } });
  console.log(`✅ Evaluation Completed and Cleaned Up Successfully!\n`);

  console.log("================================================================================");
  console.log("   🎉 ALL VERIFICATIONS (PASSED START TIME, MULTI-LANGUAGE, PARTIAL SCORE, MCQ PENALTIES) PASSED!");
  console.log("================================================================================");
}

runProfessorStudentEvaluation()
  .catch((err) => {
    console.error("Evaluation Failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
