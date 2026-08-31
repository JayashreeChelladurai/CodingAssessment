export interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  weight?: number;
  order?: number;
}

export interface McqOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  sectionId?: string | null;
  type: "CODING" | "MCQ";
  title: string;
  description: string;
  marks: number;
  negativeMarks?: number;
  order: number;
  
  // MCQ fields
  mcqType?: "SINGLE" | "MULTIPLE";
  options?: string; // JSON: McqOption[]
  correctAnswers?: string; // JSON: string[] (only in review mode)
  explanation?: string; // (only in review mode)

  // Coding fields
  allowedLanguages?: string; // e.g. "JAVA,C,CPP"
  starterCodes?: string; // JSON: { "JAVA": "...", "C": "...", "CPP": "..." }
  starterCode?: string;
  timeLimitSeconds?: number;
  memoryLimitMb?: number;
  testCases?: TestCase[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions?: Question[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  code: string;
  durationMinutes: number;
  startTime?: string | null;
  endTime?: string | null;
  shuffleQuestions?: boolean;
  requireSeb?: boolean;
  sebQuitPassword?: string;
  isReviewUnlocked?: boolean;
  reviewUnlockTime?: string | null;
  sections?: Section[];
  questions?: Question[];
  attempts?: StudentAttempt[];
  totalQuestions?: number;
  totalMarks?: number;
  createdAt?: string;
}

export interface Violation {
  id: string;
  attemptId: string;
  violationType: string;
  details?: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string | null;
}

export interface Submission {
  id: string;
  attemptId: string;
  questionId: string;
  type: "CODING" | "MCQ";
  language?: string;
  code?: string;
  selectedOptions?: string; // JSON: string[]
  score: number;
  maxScore: number;
  passedTestCases?: number;
  totalTestCases?: number;
  status: string;
  testCaseResults?: string; // JSON
  submittedAt: string;
}

export interface StudentAttempt {
  id: string;
  assessmentId: string;
  rollNo: string;
  studentName: string;
  status: "IN_PROGRESS" | "LOCKED_OUT" | "SUBMITTED" | "TIME_EXPIRED";
  startedAt: string;
  submittedAt?: string | null;
  remainingSeconds: number;
  lastHeartbeat?: string;
  questionOrder?: string; // JSON: string[]
  optionOrders?: string; // JSON: { [questionId: string]: string[] }
  flaggedQuestions?: string; // JSON: string[]
  mcqResponses?: string; // JSON: { [questionId: string]: string[] }
  drafts?: string; // JSON map { questionId: code }
  violationCount: number;
  violations?: Violation[];
  submissions?: Submission[];
}

export interface TestCaseEvaluationResult {
  testCaseId?: string;
  isPublic: boolean;
  input: string;
  expectedOutput: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR";
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  passed: boolean;
  scoreAwarded: number;
  weight: number;
  compilationError?: string;
}

export interface CodingGradingResponse {
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR";
  totalScore: number;
  maxScore: number;
  passedTestCases: number;
  totalTestCases: number;
  compilationError?: string;
  results: TestCaseEvaluationResult[];
}
