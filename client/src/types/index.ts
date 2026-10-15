export interface TestCase {
  id?: string;
  title?: string;
  input?: string;
  expectedOutput?: string;
  seedData?: string;
  orderSensitive?: boolean | null;
  isPublic: boolean;
  weight?: number;
  order?: number;
}

export interface McqOption {
  id: string;
  text: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isPk?: boolean;
  nullable?: boolean;
}

export interface TableSchemaInfo {
  tableName: string;
  columns: ColumnInfo[];
  sampleRows: Record<string, any>[];
}

export interface FibBlank {
  id: string;
  label?: string;
  acceptedAnswers: string[];
}

export interface Question {
  id: string;
  sectionId?: string | null;
  type: "CODING" | "MCQ" | "SQL" | "FIB";
  title: string;
  description: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  marks: number;
  negativeMarks?: number;
  order: number;
  
  // MCQ & FIB fields
  mcqType?: "SINGLE" | "MULTIPLE";
  options?: string; // JSON: McqOption[] or FibBlank[]
  correctAnswers?: string; // JSON: string[] or string[][] (accepted answers)
  explanation?: string; // (only in review mode)

  // Coding fields
  allowedLanguages?: string; // e.g. "JAVA,C,CPP"
  starterCodes?: string; // JSON: { "JAVA": "...", "C": "...", "CPP": "..." }
  starterCode?: string;
  timeLimitSeconds?: number;
  memoryLimitMb?: number;

  // SQL fields
  schemaDdl?: string;
  solutionSql?: string;
  orderSensitive?: boolean;
  schemaOverview?: TableSchemaInfo[];

  testCases?: TestCase[];

  // Random question generation from Question Bank folder
  isRandom?: boolean;
  randomFolderId?: string | null;
  randomDifficulty?: "ANY" | "EASY" | "MEDIUM" | "HARD";
  randomType?: "ANY" | "CODING" | "MCQ" | "SQL" | "FIB";
  templateQuestionId?: string | null;
  bankQuestionId?: string | null;
  randomFolder?: {
    id: string;
    name: string;
    parentId?: string | null;
  };
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
  isRandomized?: boolean;
  randomConfig?: string;
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
  ipAddress?: string | null;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string | null;
}

export interface Submission {
  id: string;
  attemptId: string;
  questionId: string;
  type: "CODING" | "MCQ" | "SQL" | "FIB";
  language?: string;
  code?: string;
  selectedOptions?: string; // JSON: string[] (MCQ option IDs, or FIB student answers per blank)
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
  ipAddress?: string | null;
  deviceInfo?: string | null;
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

export interface QuestionFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    questions: number;
  };
}

export interface BankQuestion {
  id: string;
  folderId?: string | null;
  folder?: {
    id: string;
    name: string;
    parentId?: string | null;
  };
  type: "CODING" | "MCQ" | "SQL" | "FIB";
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags?: string;
  marks: number;
  negativeMarks?: number;
  order: number;

  // MCQ fields
  mcqType?: "SINGLE" | "MULTIPLE";
  options?: string; // JSON: McqOption[]
  correctAnswers?: string; // JSON: string[]
  explanation?: string;

  // Coding fields
  allowedLanguages?: string;
  starterCodes?: string;
  starterCode?: string;
  timeLimitSeconds?: number;
  memoryLimitMb?: number;

  // SQL fields
  schemaDdl?: string;
  solutionSql?: string;
  orderSensitive?: boolean;

  testCases?: TestCase[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ComparisonDiff {
  status: "PASSED" | "FAILED";
  reason?: string;
  columnMismatch?: { expected: string[]; actual: string[] };
  rowCountMismatch?: { expected: number; actual: number };
  cellMismatches?: {
    rowIdx: number;
    colIdx: number;
    columnName: string;
    expected: any;
    actual: any;
  }[];
}

export interface TestCaseEvaluation {
  testCaseId: string;
  title: string;
  isPublic: boolean;
  order: number;
  status: "PASSED" | "FAILED" | "ERROR";
  errorMessage: string | null;
  executionTimeMs: number;
  actualColumns: string[];
  expectedColumns: string[];
  actualRows: any[][];
  expectedRows: any[][];
  actualRowCount: number;
  expectedRowCount: number;
  diff: ComparisonDiff;
}

export interface QuestionGradingResult {
  questionId: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "SQL_SYNTAX_ERROR";
  score: number;
  totalScore?: number;
  maxScore: number;
  passedTestCases: number;
  totalTestCases: number;
  executionTimeMs: number;
  testCaseResults: TestCaseEvaluation[];
  results?: TestCaseEvaluation[];
  submissionId?: string;
  submittedAt?: string;
}
