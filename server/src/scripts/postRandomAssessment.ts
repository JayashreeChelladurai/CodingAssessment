import { PrismaClient } from "@prisma/client";
import { hashStudentPassword } from "../services/auth.js";

const prisma = new PrismaClient();

async function main() {
  console.log("=== POSTING RANDOMIZED QUESTION BANK ASSESSMENT ===");

  // 1. Locate the source folder "Coding"
  const codingFolder = await prisma.questionFolder.findFirst({
    where: { name: "Coding" },
  });

  if (!codingFolder) {
    console.error("Source folder 'Coding' not found in database! Please check Question Bank.");
    process.exit(1);
  }

  console.log(`Found Source Folder: "${codingFolder.name}" (ID: ${codingFolder.id})`);

  // 2. Assessment Details
  const assessmentCode = "BLIND75-RANDOM";
  const assessmentTitle = "Blind 75 Coding Assessment (Randomized)";
  const assessmentDescription =
    "Dynamic assessment allocating 3 distinct coding challenges per student (1 Easy, 1 Medium, 1 Hard) randomly from the Blind 75 Question Bank folder. Starter code includes input parsing up to '// Write your logic here'.";

  const randomConfig = JSON.stringify({
    sourceFolderId: codingFolder.id,
    sourceFolderName: "Coding",
    easyCount: 1,
    mediumCount: 1,
    hardCount: 1,
    easyMarks: 25,
    mediumMarks: 35,
    hardMarks: 40,
  });

  // Upsert the assessment
  let assessment = await prisma.assessment.findUnique({
    where: { code: assessmentCode },
  });

  if (assessment) {
    console.log(`Assessment with code '${assessmentCode}' already exists. Updating...`);
    assessment = await prisma.assessment.update({
      where: { code: assessmentCode },
      data: {
        title: assessmentTitle,
        description: assessmentDescription,
        durationMinutes: 90,
        shuffleQuestions: true,
        requireSeb: true,
        isReviewUnlocked: true,
        isRandomized: true,
        randomConfig,
      },
    });
  } else {
    console.log(`Creating new assessment '${assessmentCode}'...`);
    assessment = await prisma.assessment.create({
      data: {
        title: assessmentTitle,
        description: assessmentDescription,
        code: assessmentCode,
        durationMinutes: 90,
        shuffleQuestions: true,
        requireSeb: true,
        isReviewUnlocked: true,
        isRandomized: true,
        randomConfig,
      },
    });
  }

  // Clear any past test attempts for a pristine state
  await prisma.studentAttempt.deleteMany({
    where: { assessmentId: assessment.id },
  });
  console.log(`   • Title: ${assessment.title}`);
  console.log(`   • Assessment Code: ${assessment.code}`);
  console.log(`   • Duration: ${assessment.durationMinutes} minutes`);
  console.log(`   • Safe Exam Browser: ${assessment.requireSeb ? "Required" : "Optional / Disabled (Web Browser Allowed)"}`);
  console.log(`   • Randomized from Question Bank: ${assessment.isRandomized ? "YES" : "NO"}`);
  console.log(`   • Configuration: 1 Easy (25m) + 1 Medium (35m) + 1 Hard (40m) = 3 Questions (100 Marks total)`);

  // 3. Ensure test students exist for easy testing
  const testStudents = [
    { rollNo: "21CS001", name: "Alice Smith", password: "password123" },
    { rollNo: "21CS002", name: "Bob Johnson", password: "password123" },
    { rollNo: "21CS003", name: "Charlie Brown", password: "password123" },
  ];

  for (const st of testStudents) {
    const existing = await prisma.student.findUnique({ where: { rollNo: st.rollNo } });
    if (!existing) {
      await prisma.student.create({
        data: {
          rollNo: st.rollNo,
          name: st.name,
          password: hashStudentPassword(st.password),
        },
      });
      console.log(`Created test student: ${st.rollNo} (${st.name})`);
    } else {
      console.log(`Test student already registered: ${st.rollNo} (${st.name})`);
    }
  }

  console.log("\nReady! Assessment code:", assessmentCode);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
