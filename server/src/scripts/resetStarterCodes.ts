import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLEAN_STARTER_CODES = {
  JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
  C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your solution here
    return 0;
}`,
  CPP: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
};

async function main() {
  console.log("Updating all Bank Questions to clean starter code (removing full solutions)...");

  const starterCodesJson = JSON.stringify(CLEAN_STARTER_CODES);

  const updated = await prisma.bankQuestion.updateMany({
    where: { type: "CODING" },
    data: {
      starterCodes: starterCodesJson,
      starterCode: CLEAN_STARTER_CODES.JAVA,
    },
  });

  console.log(`Successfully updated ${updated.count} coding question(s) in Question Bank with clean starter code.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
