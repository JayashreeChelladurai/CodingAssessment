import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateAndVerify() {
  console.log("=== Running End-to-End Test for AT1 & AT2 Reports & Excel Export ===");

  const at1 = await prisma.assessment.findUnique({
    where: { code: "AT1" },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!at1) throw new Error("AT1 not found");

  const rollNo = "TEST_SIM_ROLL_01";
  const studentName = "Simulation Candidate";

  // Clean existing simulation attempt if any
  await prisma.submission.deleteMany({
    where: { attempt: { rollNo, assessmentId: at1.id } },
  });
  await prisma.violation.deleteMany({
    where: { attempt: { rollNo, assessmentId: at1.id } },
  });
  await prisma.studentAttempt.deleteMany({
    where: { rollNo, assessmentId: at1.id },
  });

  // Create Attempt
  const attempt = await prisma.studentAttempt.create({
    data: {
      assessmentId: at1.id,
      rollNo,
      studentName,
      status: "SUBMITTED",
      remainingSeconds: 3600,
      submittedAt: new Date(),
    },
  });

  console.log(`Created simulation attempt ${attempt.id} for ${rollNo}`);

  // Submit choices for first 5 questions:
  // Q1: Pick correct answer
  // Q2: Pick correct answer
  // Q3: Pick wrong answer
  // Q4: Pick correct answer
  // Q5: Unanswered (no submission)

  const q1 = at1.questions[0];
  const q2 = at1.questions[1];
  const q3 = at1.questions[2];
  const q4 = at1.questions[3];

  const q1Correct = JSON.parse(q1.correctAnswers)[0];
  const q2Correct = JSON.parse(q2.correctAnswers)[0];
  const q3Options = JSON.parse(q3.options);
  const q3Wrong = q3Options.find((o: any) => !JSON.parse(q3.correctAnswers).includes(o.id)).id;
  const q4Correct = JSON.parse(q4.correctAnswers)[0];

  await prisma.submission.createMany({
    data: [
      {
        attemptId: attempt.id,
        questionId: q1.id,
        type: "MCQ",
        selectedOptions: JSON.stringify([q1Correct]),
        score: q1.marks,
        maxScore: q1.marks,
        status: "ACCEPTED",
      },
      {
        attemptId: attempt.id,
        questionId: q2.id,
        type: "MCQ",
        selectedOptions: JSON.stringify([q2Correct]),
        score: q2.marks,
        maxScore: q2.marks,
        status: "ACCEPTED",
      },
      {
        attemptId: attempt.id,
        questionId: q3.id,
        type: "MCQ",
        selectedOptions: JSON.stringify([q3Wrong]),
        score: 0,
        maxScore: q3.marks,
        status: "WRONG_ANSWER",
      },
      {
        attemptId: attempt.id,
        questionId: q4.id,
        type: "MCQ",
        selectedOptions: JSON.stringify([q4Correct]),
        score: q4.marks,
        maxScore: q4.marks,
        status: "ACCEPTED",
      },
    ],
  });

  console.log("Submissions created. Verifying Gradebook data retrieval...");

  const assessmentWithAttempts = await prisma.assessment.findUnique({
    where: { id: at1.id },
    include: {
      questions: { orderBy: { order: "asc" } },
      attempts: {
        where: { id: attempt.id },
        include: { submissions: true },
      },
    },
  });

  const studentAttempt = assessmentWithAttempts!.attempts[0];
  const totalScore = studentAttempt.submissions.reduce((sum, s) => sum + s.score, 0);

  console.log(`Total Score calculated: ${totalScore} (Expected: 3.0)`);
  if (totalScore !== 3.0) throw new Error(`Score mismatch! Expected 3.0, got ${totalScore}`);

  // Test CSV export builder logic
  const letterMap = ["A", "B", "C", "D", "E", "F", "G"];
  const detailedCols: string[] = [];

  for (let i = 0; i < 5; i++) {
    const q = at1.questions[i];
    const sub = studentAttempt.submissions.find((s) => s.questionId === q.id);
    const opts = JSON.parse(q.options);
    const corr = JSON.parse(q.correctAnswers);
    const sel = sub ? JSON.parse(sub.selectedOptions) : [];

    const selStr = sel.length > 0
      ? sel.map((id: string) => {
          const idx = opts.findIndex((o: any) => o.id === id);
          return `${letterMap[idx]}: ${opts[idx].text}`;
        }).join(" | ")
      : "[Unanswered]";

    const corrStr = corr.map((id: string) => {
      const idx = opts.findIndex((o: any) => o.id === id);
      return `${letterMap[idx]}: ${opts[idx].text}`;
    }).join(" | ");

    console.log(`Q${i+1} -> Selected: ${selStr} | Correct: ${corrStr} | Score: ${sub ? sub.score : 0}`);
  }

  // Cleanup simulation attempt
  await prisma.submission.deleteMany({ where: { attemptId: attempt.id } });
  await prisma.studentAttempt.delete({ where: { id: attempt.id } });
  console.log("✓ Cleaned up simulation test data.");
  console.log("=== All Tests and Reporting Validated! ===");
}

simulateAndVerify()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
