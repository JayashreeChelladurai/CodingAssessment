import { prisma } from "../src/db.js";

async function getDescendantFolderIds(rootFolderId: string): Promise<string[]> {
  const result: string[] = [rootFolderId];
  const children = await prisma.questionFolder.findMany({
    where: { parentId: rootFolderId },
    select: { id: true },
  });
  for (const child of children) {
    const descendants = await getDescendantFolderIds(child.id);
    result.push(...descendants);
  }
  return result;
}

async function main() {
  console.log("=== CREATING / SEEDING ASSESSMENT B75-R2 ===");

  const codingFolder = await prisma.questionFolder.findFirst({
    where: { name: "Coding" },
  });

  if (!codingFolder) {
    throw new Error("Could not find Question Bank folder 'Coding'!");
  }

  const descendantFolderIds = await getDescendantFolderIds(codingFolder.id);
  console.log(`Found 'Coding' Question Bank folder: ${codingFolder.id} with ${descendantFolderIds.length} descendant folder categories.`);

  // Count available questions in Coding folder hierarchy
  const easyCount = await prisma.bankQuestion.count({
    where: { folderId: { in: descendantFolderIds }, difficulty: "EASY" },
  });
  const mediumCount = await prisma.bankQuestion.count({
    where: { folderId: { in: descendantFolderIds }, difficulty: "MEDIUM" },
  });
  const hardCount = await prisma.bankQuestion.count({
    where: { folderId: { in: descendantFolderIds }, difficulty: "HARD" },
  });

  console.log(`Coding Folder Pool: ${easyCount} Easy, ${mediumCount} Medium, ${hardCount} Hard questions.`);

  const randomConfigObj = {
    sourceFolderId: codingFolder.id,
    sourceFolderName: codingFolder.name,
    easyCount: 1,
    mediumCount: 1,
    hardCount: 1,
    easyMarks: 25,
    mediumMarks: 35,
    hardMarks: 40,
  };

  // Upsert Assessment B75-R2
  let assessment = await prisma.assessment.findUnique({
    where: { code: "B75-R2" },
    include: { sections: true, questions: true },
  });

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        code: "B75-R2",
        title: "Blind 75 Round 2 Assessment (Randomized)",
        description: "Round 2 coding assessment featuring 3 random problems (1 Easy, 1 Medium, 1 Hard) dynamically allocated per student, strictly excluding any problems seen in Round 1 (BLIND75-RANDOM).",
        durationMinutes: 90,
        requireSeb: true,
        sebQuitPassword: "exit123",
        isRandomized: true,
        randomConfig: JSON.stringify(randomConfigObj),
        shuffleQuestions: true,
      },
      include: { sections: true, questions: true },
    });
    console.log(`Created new assessment B75-R2: ${assessment.id}`);
  } else {
    assessment = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        title: "Blind 75 Round 2 Assessment (Randomized)",
        description: "Round 2 coding assessment featuring 3 random problems (1 Easy, 1 Medium, 1 Hard) dynamically allocated per student, strictly excluding any problems seen in Round 1 (BLIND75-RANDOM).",
        durationMinutes: 90,
        requireSeb: true,
        sebQuitPassword: "exit123",
        isRandomized: true,
        randomConfig: JSON.stringify(randomConfigObj),
        shuffleQuestions: true,
      },
      include: { sections: true, questions: true },
    });
    console.log(`Updated existing assessment B75-R2: ${assessment.id}`);
  }

  // Ensure Section A exists
  let section = assessment.sections.find((s) => s.order === 0);
  if (!section) {
    section = await prisma.section.create({
      data: {
        assessmentId: assessment.id,
        title: "Section A: Coding Problems",
        description: "Solve the 3 randomized DSA problems. Starter code is non-editable. Submit each problem before time expires.",
        order: 0,
      },
    });
    console.log(`Created Section A: ${section.id}`);
  }

  // Ensure the 3 Question Slots exist for Section A
  const templateSlots = [
    {
      title: "Random Easy Problem (Slot 1)",
      description: "A randomly allocated Easy problem from the Blind 75 question bank.",
      marks: 25,
      order: 0,
      randomDifficulty: "EASY",
      randomType: "CODING",
      randomFolderId: codingFolder.id,
      isRandom: true,
      type: "CODING",
    },
    {
      title: "Random Medium Problem (Slot 2)",
      description: "A randomly allocated Medium problem from the Blind 75 question bank.",
      marks: 35,
      order: 1,
      randomDifficulty: "MEDIUM",
      randomType: "CODING",
      randomFolderId: codingFolder.id,
      isRandom: true,
      type: "CODING",
    },
    {
      title: "Random Hard Problem (Slot 3)",
      description: "A randomly allocated Hard problem from the Blind 75 question bank.",
      marks: 40,
      order: 2,
      randomDifficulty: "HARD",
      randomType: "CODING",
      randomFolderId: codingFolder.id,
      isRandom: true,
      type: "CODING",
    },
  ];

  for (const slot of templateSlots) {
    const existingSlot = await prisma.question.findFirst({
      where: {
        assessmentId: assessment.id,
        templateQuestionId: null,
        order: slot.order,
      },
    });

    if (!existingSlot) {
      const createdSlot = await prisma.question.create({
        data: {
          assessmentId: assessment.id,
          sectionId: section.id,
          title: slot.title,
          description: slot.description,
          marks: slot.marks,
          order: slot.order,
          type: slot.type,
          isRandom: true,
          randomDifficulty: slot.randomDifficulty,
          randomType: slot.randomType,
          randomFolderId: slot.randomFolderId,
          allowedLanguages: JSON.stringify(["JAVA", "PYTHON", "CPP", "JAVASCRIPT"]),
        },
      });
      console.log(`Created slot #${slot.order + 1} (${slot.randomDifficulty}, ${slot.marks}m): ${createdSlot.id}`);
    } else {
      const updatedSlot = await prisma.question.update({
        where: { id: existingSlot.id },
        data: {
          sectionId: section.id,
          title: slot.title,
          description: slot.description,
          marks: slot.marks,
          isRandom: true,
          randomDifficulty: slot.randomDifficulty,
          randomType: slot.randomType,
          randomFolderId: slot.randomFolderId,
        },
      });
      console.log(`Updated slot #${slot.order + 1} (${slot.randomDifficulty}, ${slot.marks}m): ${updatedSlot.id}`);
    }
  }

  console.log("\n=== ASSESSMENT B75-R2 CONFIGURATION SUMMARY ===");
  console.log(`Assessment ID: ${assessment.id}`);
  console.log(`Assessment Code: ${assessment.code}`);
  console.log(`Title: ${assessment.title}`);
  console.log(`Duration: ${assessment.durationMinutes} Minutes`);
  console.log(`SEB Required: ${assessment.requireSeb} (Quit Password: ${assessment.sebQuitPassword})`);
  console.log(`Total Marks: 100 Marks (Easy: 25m, Medium: 35m, Hard: 40m)`);
  console.log(`Random Question Bank: '${codingFolder.name}' (${codingFolder.id})`);
  console.log("=== B75-R2 SEEDING COMPLETE ===");
}

main()
  .catch((err) => {
    console.error("Error seeding B75-R2:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
