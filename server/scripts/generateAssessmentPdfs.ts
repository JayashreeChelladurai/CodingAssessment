import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const prisma = new PrismaClient();

const OUTPUT_DIR = path.resolve(process.cwd(), "..", "generated_pdfs");

interface QuestionData {
  order: number;
  title: string;
  description: string;
  options: Array<{ id: string; text: string }>;
  correctAnswers: string[];
  explanation: string;
  marks: number;
}

function buildHtml(
  assessmentTitle: string,
  assessmentCode: string,
  questions: QuestionData[],
  includeAnswers: boolean
): string {
  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  const questionsHtml = questions
    .map((q, idx) => {
      const qNum = idx + 1;
      const opts = q.options;
      const correctIds = q.correctAnswers;

      const optionsHtml = opts
        .map((opt, optIdx) => {
          const letter = optionLetters[optIdx] || `${optIdx + 1}`;
          const isCorrect = correctIds.includes(opt.id);

          if (includeAnswers && isCorrect) {
            return `
              <div class="option-item correct-option">
                <span class="option-letter correct-letter">${letter}</span>
                <span class="option-text">${escapeHtml(opt.text)}</span>
                <span class="correct-badge">&#10003; Correct Answer</span>
              </div>
            `;
          }

          return `
            <div class="option-item">
              <span class="option-letter">${letter}</span>
              <span class="option-text">${escapeHtml(opt.text)}</span>
            </div>
          `;
        })
        .join("");

      const explanationHtml =
        includeAnswers && q.explanation
          ? `
            <div class="explanation-box">
              <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
            </div>
          `
          : "";

      return `
        <div class="question-card">
          <div class="question-header">
            <span class="question-number">Question ${qNum}</span>
            <span class="question-marks">[${q.marks} Mark]</span>
          </div>
          <div class="question-text">${escapeHtml(q.description)}</div>
          <div class="options-grid">
            ${optionsHtml}
          </div>
          ${explanationHtml}
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(assessmentTitle)} - ${includeAnswers ? "Solutions Key" : "Question Paper"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 14mm 14mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header-container {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    .header-left h2 {
      font-size: 11pt;
      font-weight: 600;
      color: ${includeAnswers ? "#047857" : "#3b82f6"};
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-left p {
      font-size: 9pt;
      color: #64748b;
      margin: 0;
    }
    .header-right {
      text-align: right;
      font-size: 9.5pt;
      color: #334155;
      line-height: 1.4;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .badge-solutions {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    .badge-paper {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .student-info-bar {
      display: ${includeAnswers ? "none" : "flex"};
      justify-content: space-between;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 16px;
      font-size: 9pt;
      color: #475569;
    }
    .student-field {
      border-bottom: 1px solid #94a3b8;
      display: inline-block;
      min-width: 140px;
      height: 14px;
    }
    .question-card {
      page-break-inside: avoid;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .question-number {
      font-weight: 700;
      font-size: 10pt;
      color: #0f172a;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .question-marks {
      font-size: 8.5pt;
      font-weight: 600;
      color: #64748b;
    }
    .question-text {
      font-size: 10pt;
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 8px;
      white-space: pre-wrap;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      margin-bottom: 4px;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 8px;
      border-radius: 5px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 9pt;
    }
    .option-letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      font-size: 8pt;
      shrink: 0;
    }
    .option-text {
      flex: 1;
      color: #334155;
    }
    .correct-option {
      background: #ecfdf5;
      border-color: #10b981;
    }
    .correct-letter {
      background: #10b981;
      color: #ffffff;
    }
    .correct-badge {
      font-size: 7.5pt;
      font-weight: 700;
      color: #047857;
      background: #a7f3d0;
      padding: 1px 6px;
      border-radius: 3px;
      margin-left: auto;
    }
    .explanation-box {
      margin-top: 8px;
      padding: 6px 10px;
      border-radius: 5px;
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      font-size: 8.5pt;
      color: #166534;
      line-height: 1.4;
    }
    .explanation-box strong {
      color: #15803d;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div class="header-left">
      <h1>${escapeHtml(assessmentTitle)}</h1>
      <h2>${includeAnswers ? "Official Answer Key & Detailed Solutions" : "Assessment Question Paper"}</h2>
      <p>Test Code: <strong>${escapeHtml(assessmentCode)}</strong> &bull; Total Questions: <strong>${questions.length}</strong> &bull; Max Marks: <strong>${questions.length}</strong></p>
    </div>
    <div class="header-right">
      <span class="badge ${includeAnswers ? "badge-solutions" : "badge-paper"}">
        ${includeAnswers ? "TEACHER / INSTRUCTOR COPY" : "STUDENT COPY"}
      </span>
      <div>Duration: <strong>90 Minutes</strong></div>
      <div>Format: <strong>Multiple Choice Questions</strong></div>
    </div>
  </div>

  <div class="student-info-bar">
    <div>Student Name: <span class="student-field"></span></div>
    <div>Roll Number: <span class="student-field"></span></div>
    <div>Date: <span class="student-field" style="min-width: 90px;"></span></div>
    <div>Score: <span class="student-field" style="min-width: 60px;"></span> / ${questions.length}</div>
  </div>

  <div class="questions-container">
    ${questionsHtml}
  </div>

  <div class="footer">
    ${escapeHtml(assessmentTitle)} &bull; ${includeAnswers ? "Solution Key" : "Question Paper"} &bull; Page End
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function exportPdfs() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

  const assessments = ["AT1", "AT2"];

  for (const code of assessments) {
    const assessment = await prisma.assessment.findUnique({
      where: { code },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });

    if (!assessment) {
      console.error(`Assessment ${code} not found!`);
      continue;
    }

    const parsedQuestions: QuestionData[] = assessment.questions.map((q) => ({
      order: q.order,
      title: q.title,
      description: q.description,
      options: JSON.parse(q.options || "[]"),
      correctAnswers: JSON.parse(q.correctAnswers || "[]"),
      explanation: q.explanation || "",
      marks: q.marks,
    }));

    // 1. Without Answers (Student Question Paper)
    const htmlNoAns = buildHtml(assessment.title, assessment.code, parsedQuestions, false);
    const htmlNoAnsPath = path.join(OUTPUT_DIR, `${code}_Question_Paper.html`);
    const pdfNoAnsPath = path.join(OUTPUT_DIR, `${code}_Aptitude_Assessment_Question_Paper_Final.pdf`);
    const pdfNoAnsPathOrig = path.join(OUTPUT_DIR, `${code}_Aptitude_Assessment_Question_Paper.pdf`);
    fs.writeFileSync(htmlNoAnsPath, htmlNoAns, "utf8");

    console.log(`Generating PDF for ${code} (Question Paper without answers)...`);
    execSync(
      `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfNoAnsPath}" "file:///${htmlNoAnsPath.replace(/\\/g, "/")}"`
    );
    try {
      fs.copyFileSync(pdfNoAnsPath, pdfNoAnsPathOrig);
    } catch (e) {
      // Ignored if original is open
    }
    console.log(`✓ Generated: ${pdfNoAnsPath}`);

    // 2. With Answers (Teacher / Solution Key)
    const htmlWithAns = buildHtml(assessment.title, assessment.code, parsedQuestions, true);
    const htmlWithAnsPath = path.join(OUTPUT_DIR, `${code}_With_Solutions.html`);
    const pdfWithAnsPath = path.join(OUTPUT_DIR, `${code}_Aptitude_Assessment_With_Solutions_Final.pdf`);
    const pdfWithAnsPathOrig = path.join(OUTPUT_DIR, `${code}_Aptitude_Assessment_With_Solutions.pdf`);
    fs.writeFileSync(htmlWithAnsPath, htmlWithAns, "utf8");

    console.log(`Generating PDF for ${code} (With Solutions & Answer Key)...`);
    execSync(
      `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfWithAnsPath}" "file:///${htmlWithAnsPath.replace(/\\/g, "/")}"`
    );
    try {
      fs.copyFileSync(pdfWithAnsPath, pdfWithAnsPathOrig);
    } catch (e) {
      // Ignored if original is open
    }
    console.log(`✓ Generated: ${pdfWithAnsPath}`);
  }

  console.log("=== All 4 Assessment PDFs successfully generated! ===");
}

exportPdfs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
