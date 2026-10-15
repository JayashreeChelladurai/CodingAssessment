import { prisma } from "../src/db.js";

async function main() {
  console.log("🚀 Seeding C Programming Fill-in-the-Blanks Assessment (C-FIB-10)...");

  // 1. Create or Find Question Folder
  let folder = await prisma.questionFolder.findFirst({
    where: { name: "C Programming FIB" },
  });

  if (!folder) {
    folder = await prisma.questionFolder.create({
      data: {
        name: "C Programming FIB",
        description: "Fill in the Blanks questions covering C pointers, macros, preprocessor, and memory models.",
      },
    });
    console.log(`📁 Created Question Folder: "${folder.name}" (${folder.id})`);
  }

  // 2. Define the 10 Questions
  const fibQuestions = [
    {
      order: 0,
      title: "Pointer Arithmetic & Byte Manipulation with 511",
      difficulty: "MEDIUM" as const,
      marks: 10,
      description: `Predict the output of the following C program:

\`\`\`c
void main()
{
   int a = 511, b;
   char * cp;
   cp = (char*)&a;
   b = *cp;
   *cp = 10;
   printf("%d %d %d\\n", a, b, *cp);
}
\`\`\`

Enter the exact output printed by the \`printf\` statement (separated by spaces).`,
      blanks: [
        {
          id: "q1-b1",
          label: "printf output (a b *cp)",
          acceptedAnswers: ["266 -1 10", "266 255 10"],
        },
      ],
      explanation:
        "511 in hexadecimal is 0x01FF. In little-endian representation, the least significant byte is 0xFF. Since char is signed on standard x86 systems, 0xFF represents -1 (or 255 if unsigned char), so b = -1. When *cp = 10, the lowest byte becomes 0x0A (10), while the higher byte remains 0x01 (256). Thus, a becomes 256 + 10 = 266, and *cp is 10. The output printed is '266 -1 10'.",
    },
    {
      order: 1,
      title: "Pointer Array Iteration & Double Pointer Dereferencing",
      difficulty: "HARD" as const,
      marks: 10,
      description: `Predict the output of the following C program:

\`\`\`c
void main()
{
   int a[] = {4, 14, 24, 34}, b[] = {6, 16 ,26, 36}, c[] = {9, 19, 29, 39};
   int *p[3], **ptr, i;
   p[0] = a; p[1] = b; p[2] = c;
   ptr = p;
   for(i = 1; i <= 3; i++)
   {
      *ptr = *ptr + i;
      **ptr = **ptr + i;
      ++ptr;
   }
   --ptr;
   printf("%d", **ptr);
}
\`\`\`

Enter the integer value printed by the \`printf\` statement.`,
      blanks: [
        {
          id: "q2-b1",
          label: "Value of **ptr",
          acceptedAnswers: ["42"],
        },
      ],
      explanation:
        "For i = 1: *ptr is p[0], advanced to a+1 (&a[1]), and **ptr is incremented: 14 + 1 = 15. ptr advances to &p[1]. For i = 2: *ptr is p[1], advanced to b+2 (&b[2]), and **ptr is incremented: 26 + 2 = 28. ptr advances to &p[2]. For i = 3: *ptr is p[2], advanced to c+3 (&c[3]), and **ptr is incremented: 39 + 3 = 42. ptr advances to p+3. After loop, --ptr moves back to &p[2]. **ptr evaluates to c[3], which is 42.",
    },
    {
      order: 2,
      title: "Macro Token-Pasting Operator (##)",
      difficulty: "EASY" as const,
      marks: 10,
      description: `Predict the output of the following C program:

\`\`\`c
#define cat(x,y)   x##y
void main()
{
   printf("%d", cat(0x1, 2));
}
\`\`\`

Enter the integer value printed by \`printf\`.`,
      blanks: [
        {
          id: "q3-b1",
          label: "Output printed",
          acceptedAnswers: ["18"],
        },
      ],
      explanation:
        "The preprocessor token-pasting operator ## concatenates the tokens 0x1 and 2 to form 0x12. In hexadecimal, 0x12 equals (1 * 16) + 2 = 18 in decimal. Thus printf(\"%d\", ...) prints 18.",
    },
    {
      order: 3,
      title: "Nested Macro Expansion Precedence",
      difficulty: "MEDIUM" as const,
      marks: 10,
      description: `Predict the output of the following C program:

\`\`\`c
#define f1(n)   n*n-1
#define f2(n)   f1(n-1)*n-1
void main()
{
   printf("%d", f2(8 - 1));
}
\`\`\`

Enter the value printed by \`printf\`.`,
      blanks: [
        {
          id: "q4-b1",
          label: "Evaluated result",
          acceptedAnswers: ["-13", "28"],
        },
      ],
      explanation:
        "The macro expansions lack parentheses. f2(8 - 1) expands to f1(8 - 1-1)*8 - 1-1. Then f1(8 - 1-1) expands to 8 - 1-1 * 8 - 1-1 - 1. Together, the full expression is 8 - 1 - 1*8 - 1 - 1 - 1*8 - 1 - 1. Multiplying first: 1*8 = 8 and 1*8 = 8. Then evaluating left-to-right: 8 - 1 - 8 - 1 - 1 - 8 - 1 - 1 = -13.",
    },
    {
      order: 4,
      title: "Function Pointer Array Invocation",
      difficulty: "MEDIUM" as const,
      marks: 10,
      description: `Given the code below:

\`\`\`c
typedef void (*fun)();
void f1(){printf("hi");}
void f2(){printf("hello");}
void f3(){printf("byts");}
void main()
{
   static fun p1[] = {f1, f2, f3};
   /* line 1 : */
}
\`\`\`

At line 1, write the statement to invoke and print **hello** using \`p1\` (or write \`error\` if not possible).`,
      blanks: [
        {
          id: "q5-b1",
          label: "Statement at line 1",
          acceptedAnswers: [
            "p1[1]();",
            "(*p1[1])();",
            "(*(p1+1))();",
            "p1[1]()",
            "(*p1[1])()",
            "(*(p1 + 1))()",
            "(*(p1 + 1))();",
          ],
        },
      ],
      explanation:
        "p1 is an array of function pointers. f2 prints 'hello' and is stored at index 1: p1[1]. To call f2 through the function pointer array, we write p1[1](); or (*p1[1])();.",
    },
    {
      order: 5,
      title: "Logical Operators & Short-Circuit Evaluation",
      difficulty: "HARD" as const,
      marks: 10,
      description: `Consider the following C code with short-circuit logical operators:

\`\`\`c
int a = 3, b = 0, c = 1, d = -1, e = 5, f = 6, g = 0, h;
h = a++ && b++ || c++ && ++d && ++e || ++f && g++;
printf("%d %d %d %d %d %d %d %d", a, b, c, d, e, f, g, h);
\`\`\`

Enter the exact output printed by the \`printf\` statement (space-separated values).`,
      blanks: [
        {
          id: "q6-b1",
          label: "Output (a b c d e f g h)",
          acceptedAnswers: ["4 1 2 0 5 7 1 0"],
        },
      ],
      explanation:
        "1) a++ && b++: a++ is 3 (true, a becomes 4), b++ is 0 (false, b becomes 1). Result is false (0).\n2) c++ && ++d && ++e: c++ is 1 (true, c becomes 2). ++d increments d from -1 to 0 (false). Because ++d is 0, ++e is short-circuited and not evaluated (e remains 5). Result is false (0).\n3) ++f && g++: ++f increments f from 6 to 7 (true). g++ is 0 (false, g becomes 1). Result is false (0).\nOverall, h = 0. Final values: a=4, b=1, c=2, d=0, e=5, f=7, g=1, h=0.",
    },
    {
      order: 6,
      title: "Extern Storage Class & Linkage Error",
      difficulty: "EASY" as const,
      marks: 10,
      description: `Predict the compilation/execution behavior of the following program:

\`\`\`c
void main()
{ 
   extern int i;
   i = 20;
   printf("%d", i);
}
\`\`\`

What occurs during build or execution? (Enter Linker Error, Compile Error, or output if any)`,
      blanks: [
        {
          id: "q7-b1",
          label: "Result / Error",
          acceptedAnswers: [
            "Linker Error",
            "Error",
            "Undefined symbol",
            "Compile Error",
            "Compilation Error",
            "undefined reference to i",
          ],
        },
      ],
      explanation:
        "extern int i; declares i as an external variable defined elsewhere. Since no definition (memory allocation) exists for i in any translation unit, the compiler generates an unresolved external reference, causing a Linker Error ('undefined reference to i').",
    },
    {
      order: 7,
      title: "Character Pointer Type Punning & Hex Output",
      difficulty: "MEDIUM" as const,
      marks: 10,
      description: `Predict the output of the following C program on a standard 32-bit little-endian system:

\`\`\`c
void main()
{
   int a = 0;
   char *cp;
   cp = (char*)&a;
   *cp = 'A';
   ++cp;
   *cp = 'B';
   printf("%x", a);
}
\`\`\`

Enter the hexadecimal output printed by \`printf("%x", a)\`.`,
      blanks: [
        {
          id: "q8-b1",
          label: "Hex output",
          acceptedAnswers: ["4241", "0x4241"],
        },
      ],
      explanation:
        "In ASCII, 'A' = 0x41 and 'B' = 0x42. On a little-endian machine, the byte at cp points to the lowest byte of a (0x41), and ++cp points to the next byte (0x42). Together in the integer, the two lowest bytes form 0x4241. Printed with %x, the leading zeroes are omitted, producing 4241.",
    },
    {
      order: 8,
      title: "Struct Pointers & Multi-Level Pointer Dereferencing",
      difficulty: "HARD" as const,
      marks: 10,
      description: `Given the structure and variable definitions:

\`\`\`c
struct A
{
   int i;
   char ch[20];
};
struct A a = {515, "byts"};
void main()
{
   struct A *pa = &a;
   // line 1 : using pa print 't' as the output
   struct A **ppa = &pa;
   // line 2 : using ppa print 3 as the output
}
\`\`\`

Provide the code statement for Line 1 and Line 2:`,
      blanks: [
        {
          id: "q9-b1",
          label: "Line 1 (print 't' using pa)",
          acceptedAnswers: [
            "printf(\"%c\", pa->ch[2]);",
            "printf(\"%c\", (*pa).ch[2]);",
            "pa->ch[2]",
            "printf(\"%c\", *(pa->ch + 2));",
            "putchar(pa->ch[2]);",
          ],
        },
        {
          id: "q9-b2",
          label: "Line 2 (print 3 using ppa)",
          acceptedAnswers: [
            "printf(\"%d\", *(char*)(*ppa));",
            "printf(\"%d\", *(char*)&((*ppa)->i));",
            "printf(\"%d\", (*ppa)->i % 256);",
            "printf(\"%d\", (*ppa)->i & 3);",
            "*(char*)(*ppa)",
            "(*ppa)->i % 256",
            "printf(\"%d\", (*ppa)->i % 512);",
          ],
        },
      ],
      explanation:
        "In a.ch = 'byts', ch[0]='b', ch[1]='y', ch[2]='t'. To print 't' using pa, we write printf(\"%c\", pa->ch[2]);. For line 2, 515 in little-endian is 0x0203 (first byte is 0x03 = 3). Since i is the first field of struct A, *(char*)(*ppa) dereferences the first byte, yielding 3, so printf(\"%d\", *(char*)(*ppa)); prints 3.",
    },
    {
      order: 9,
      title: "Static vs Auto Storage Scope & Recursive Calls",
      difficulty: "HARD" as const,
      marks: 10,
      description: `Predict the output of the recursive static and auto variable interactions:

\`\`\`c
int g;
void test()
{
  auto int l;
  static int s;
  l = ++s; ++g;
  printf("%d %d %d\\n", l, s, g);
  if(l <= 2)
     test();
  printf("%d %d %d\\n", l, s, g);
}
void abc()
{
   auto int al;
   static int as;
   al = ++as; ++g;
   printf("%d %d %d\\n", al, as, g);
   test();
   if(al <= 2)
         abc();
   printf("%d %d %d\\n", al, as, g);
}
void main()
{
   abc();
}
\`\`\`

What is the **final line** printed before the program terminates? (Enter the 3 numbers separated by spaces)`,
      blanks: [
        {
          id: "q10-b1",
          label: "Final line printed (al as g)",
          acceptedAnswers: ["1 3 8", "1  3  8"],
        },
      ],
      explanation:
        "static int as persists across calls to abc(), while auto int al is pushed on each stack frame. Similarly, static int s persists across test(), while auto int l is on each stack frame. Global int g increments on every call. When unwinding the recursion at the very end of abc(), the first invocation of abc() (where al was 1) prints: al as g -> 1 3 8.",
    },
  ];

  // 3. Save Questions to Question Bank
  console.log("💾 Seeding questions to Question Bank...");
  for (const q of fibQuestions) {
    const existing = await prisma.bankQuestion.findFirst({
      where: { title: q.title, folderId: folder.id },
    });

    const payload = {
      folderId: folder.id,
      type: "FIB",
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      marks: q.marks,
      negativeMarks: 0,
      tags: "C, Pointers, Memory, FIB, Assessment",
      options: JSON.stringify(q.blanks),
      correctAnswers: JSON.stringify(q.blanks.map((b) => b.acceptedAnswers)),
      explanation: q.explanation,
    };

    if (existing) {
      await prisma.bankQuestion.update({
        where: { id: existing.id },
        data: payload,
      });
      console.log(`   ✓ Updated Bank Question: "${q.title}"`);
    } else {
      await prisma.bankQuestion.create({
        data: payload,
      });
      console.log(`   + Created Bank Question: "${q.title}"`);
    }
  }

  // 4. Create or Update Assessment C-FIB-10
  console.log("\n📦 Setting up Assessment: C-FIB-10...");
  let assessment = await prisma.assessment.findUnique({
    where: { code: "C-FIB-10" },
    include: { sections: true },
  });

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        code: "C-FIB-10",
        title: "C Programming - Fill in the Blanks Assessment",
        description:
          "Comprehensive 10-question Fill in the Blanks evaluation on C pointer arithmetic, macro expansions, storage classes, struct memory layout, and recursion.",
        durationMinutes: 45,
        shuffleQuestions: false,
        requireSeb: false,
        isReviewUnlocked: true,
      },
      include: { sections: true },
    });
    console.log(`✅ Created Assessment: "${assessment.title}" (${assessment.code})`);
  } else {
    assessment = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        title: "C Programming - Fill in the Blanks Assessment",
        description:
          "Comprehensive 10-question Fill in the Blanks evaluation on C pointer arithmetic, macro expansions, storage classes, struct memory layout, and recursion.",
        durationMinutes: 45,
        shuffleQuestions: false,
        requireSeb: false,
        isReviewUnlocked: true,
      },
      include: { sections: true },
    });
    console.log(`✅ Updated Assessment: "${assessment.title}" (${assessment.code})`);
  }

  // 5. Ensure Section Exists
  let section = assessment.sections[0];
  if (!section) {
    section = await prisma.section.create({
      data: {
        assessmentId: assessment.id,
        title: "Fill in the Blanks - C Programming",
        description: "Answer all 10 Fill in the Blanks questions.",
        order: 0,
      },
    });
    console.log(`📂 Created Section: "${section.title}"`);
  }

  // 6. Delete old questions for this assessment
  await prisma.question.deleteMany({
    where: { assessmentId: assessment.id },
  });

  // 7. Insert the 10 FIB questions into the Assessment
  console.log("\n📝 Inserting 10 FIB Questions into Assessment...");
  for (const q of fibQuestions) {
    const createdQ = await prisma.question.create({
      data: {
        assessmentId: assessment.id,
        sectionId: section.id,
        type: "FIB",
        title: q.title,
        description: q.description,
        marks: q.marks,
        negativeMarks: 0,
        order: q.order,
        options: JSON.stringify(q.blanks),
        correctAnswers: JSON.stringify(q.blanks.map((b) => b.acceptedAnswers)),
        explanation: q.explanation,
      },
    });
    console.log(`   [Q${q.order + 1}] Created Question: "${createdQ.title}" (${createdQ.marks} marks)`);
  }

  console.log("\n=================================================");
  console.log("🎉 C-FIB-10 ASSESSMENT CREATION COMPLETE!");
  console.log("=================================================");
  console.log(`- Code: ${assessment.code}`);
  console.log(`- Title: ${assessment.title}`);
  console.log(`- Questions: ${fibQuestions.length}`);
  console.log(`- Total Marks: ${fibQuestions.length * 10}`);
  console.log(`- Time: ${assessment.durationMinutes} mins`);
  console.log("=================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
