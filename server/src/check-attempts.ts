import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const attempts = await prisma.studentAttempt.findMany({
    include: {
      assessment: true,
      violations: true,
      submissions: true,
    },
    orderBy: { startedAt: "desc" },
  });

  console.log("================================================================================");
  console.log(`TOTAL ATTEMPTS IN DB: ${attempts.length}`);
  console.log("================================================================================");

  for (const a of attempts) {
    console.log(`\nAttempt ID: ${a.id}`);
    console.log(`Assessment: ${a.assessment?.title} (${a.assessment?.code})`);
    console.log(`Student: ${a.studentName} (${a.rollNo})`);
    console.log(`Status: ${a.status}`);
    console.log(`Remaining Seconds: ${a.remainingSeconds}`);
    console.log(`Violation Count: ${a.violationCount}`);
    console.log(`Violations: ${JSON.stringify(a.violations)}`);
    console.log(`Submissions Count: ${a.submissions.length}`);
  }
}

main().finally(() => prisma.$disconnect());
