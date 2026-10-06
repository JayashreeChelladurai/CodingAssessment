import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const prisma = new PrismaClient();

const OUTPUT_DIR = path.resolve(process.cwd(), "..", "generated_pdfs");
const DOWNLOADS_DIR = "C:\\Users\\Admin\\Downloads";

interface QuestionData {
  order: number;
  title: string;
  description: string;
  options: Array<{ id: string; text: string }>;
  correctAnswers: string[];
  explanation: string;
  marks: number;
  negativeMarks: number;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(
  assessmentTitle: string,
  assessmentCode: string,
  questions: QuestionData[],
  includeAnswers: boolean
): string {
  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  // Generate Quick Answer Key Matrix for Answer Key PDF
  let answerKeyTableHtml = "";
  if (includeAnswers) {
    const tableCells = questions.map((q, idx) => {
      const qNum = idx + 1;
      const correctIdx = q.options.findIndex((opt) => q.correctAnswers.includes(opt.id));
      const letter = correctIdx >= 0 ? optionLetters[correctIdx] : "-";
      return `<div class="key-cell"><span class="key-q">Q${qNum}</span><span class="key-ans">${letter}</span></div>`;
    }).join("");

    answerKeyTableHtml = `
      <div class="answer-key-card">
        <div class="answer-key-title">⚡ Quick Reference Answer Key (Questions 1 – 60)</div>
        <div class="key-grid">
          ${tableCells}
        </div>
      </div>
    `;
  }

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
              <strong>Step-by-Step Solution:</strong> ${escapeHtml(q.explanation)}
            </div>
          `
          : "";

      return `
        <div class="question-card">
          <div class="question-header">
            <span class="question-number">Question ${qNum}</span>
            <span class="question-marks">[+1 Mark, -1 Negative Mark]</span>
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
      margin: 12mm 14mm 12mm 14mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header-container {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .college-header {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .dept-header {
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 4px;
    }
    .header-left h1 {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px 0;
      letter-spacing: -0.5px;
    }
    .header-left h2 {
      font-size: 10pt;
      font-weight: 700;
      color: ${includeAnswers ? "#047857" : "#2563eb"};
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-right {
      text-align: right;
      font-size: 9pt;
      color: #334155;
      line-height: 1.35;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8pt;
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
    .answer-key-card {
      page-break-inside: avoid;
      background: #f8fafc;
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    .answer-key-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .key-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 4px;
    }
    .key-cell {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 3px 2px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .key-q {
      font-size: 7.5pt;
      font-weight: 600;
      color: #64748b;
    }
    .key-ans {
      font-size: 9pt;
      font-weight: 800;
      color: #047857;
    }
    .student-info-bar {
      display: ${includeAnswers ? "none" : "flex"};
      justify-content: space-between;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 6px 12px;
      margin-bottom: 12px;
      font-size: 8.5pt;
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
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 9px;
    }
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .question-number {
      font-weight: 700;
      font-size: 9pt;
      color: #0f172a;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .question-marks {
      font-size: 8pt;
      font-weight: 600;
      color: #dc2626;
    }
    .question-text {
      font-size: 9.5pt;
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 6px;
      white-space: pre-wrap;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 10px;
      margin-bottom: 4px;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 8.5pt;
    }
    .option-letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 3px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      font-size: 7.5pt;
      flex-shrink: 0;
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
      font-size: 7pt;
      font-weight: 700;
      color: #059669;
      background: #ffffff;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #a7f3d0;
      white-space: nowrap;
    }
    .explanation-box {
      margin-top: 6px;
      padding: 6px 10px;
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      border-radius: 0 4px 4px 0;
      font-size: 8.5pt;
      color: #166534;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div class="header-left">
      <div class="college-header">Dr. Mahalingam College of Engineering and Technology</div>
      <div class="dept-header">Department of Career Planning and Guidance</div>
      <h1>${escapeHtml(assessmentTitle)}</h1>
      <h2>${includeAnswers ? "Official Solution Key & Explanations" : "Candidate Question Paper"}</h2>
    </div>
    <div class="header-right">
      <span class="badge ${includeAnswers ? "badge-solutions" : "badge-paper"}">
        ${includeAnswers ? "OFFICIAL ANSWER KEY" : "EXAMINATION COPY"}
      </span><br>
      <strong>Assessment Code:</strong> ${escapeHtml(assessmentCode)}<br>
      <strong>Duration:</strong> 60 Minutes<br>
      <strong>Total Questions:</strong> 60 MCQs<br>
      <strong>Marking:</strong> +1.0 Mark | -1.0 Negative Mark
    </div>
  </div>

  <div class="student-info-bar">
    <div><strong>Student Name:</strong> <span class="student-field"></span></div>
    <div><strong>Roll Number:</strong> <span class="student-field"></span></div>
    <div><strong>Date:</strong> <span class="student-field" style="min-width: 90px;"></span></div>
  </div>

  ${answerKeyTableHtml}

  <div class="questions-container">
    ${questionsHtml}
  </div>
</body>
</html>`;
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

  const assessment = await prisma.assessment.findUnique({
    where: { code: "APT60" },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!assessment) {
    throw new Error("Assessment APT60 not found!");
  }

  const parsedQuestions: QuestionData[] = assessment.questions.map((q) => ({
    order: q.order,
    title: q.title,
    description: q.description,
    options: JSON.parse(q.options || "[]"),
    correctAnswers: JSON.parse(q.correctAnswers || "[]"),
    explanation: q.explanation || "",
    marks: q.marks,
    negativeMarks: q.negativeMarks,
  }));

  console.log(`Generating PDFs for ${assessment.code} (${parsedQuestions.length} Questions)...`);

  // 1. Solution Key PDF
  const htmlWithAns = buildHtml(assessment.title, assessment.code, parsedQuestions, true);
  const htmlWithAnsPath = path.join(OUTPUT_DIR, "APT60_Aptitude_Assessment_With_Answer_Key.html");
  const pdfWithAnsPath = path.join(OUTPUT_DIR, "APT60_Aptitude_Assessment_With_Answer_Key.pdf");
  const pdfWithAnsFinalPath = path.join(OUTPUT_DIR, "APT60_Aptitude_Assessment_With_Answer_Key_Final.pdf");
  fs.writeFileSync(htmlWithAnsPath, htmlWithAns, "utf8");

  console.log("Compiling PDF with Edge headless: APT60_Aptitude_Assessment_With_Answer_Key_Final.pdf...");
  execSync(
    `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfWithAnsFinalPath}" "file:///${htmlWithAnsPath.replace(/\\/g, "/")}"`
  );
  console.log(`✓ Generated: ${pdfWithAnsFinalPath}`);

  try {
    fs.copyFileSync(pdfWithAnsFinalPath, pdfWithAnsPath);
    console.log(`✓ Updated: ${pdfWithAnsPath}`);
  } catch (e: any) {
    console.log(`Note: Original ${pdfWithAnsPath} is open in viewer; ${pdfWithAnsFinalPath} is fresh.`);
  }

  // Copy to Downloads folder as well for instant access
  try {
    const downloadsCopyFinal = path.join(DOWNLOADS_DIR, "APT60_Aptitude_Assessment_With_Answer_Key_Final.pdf");
    fs.copyFileSync(pdfWithAnsFinalPath, downloadsCopyFinal);
    console.log(`✓ Copied to: ${downloadsCopyFinal}`);
    const downloadsCopy = path.join(DOWNLOADS_DIR, "APT60_Aptitude_Assessment_With_Answer_Key.pdf");
    try {
      fs.copyFileSync(pdfWithAnsFinalPath, downloadsCopy);
    } catch {}
  } catch (err: any) {
    console.warn("Could not copy to Downloads folder:", err.message);
  }

  // 2. Question Paper Only PDF
  const htmlNoAns = buildHtml(assessment.title, assessment.code, parsedQuestions, false);
  const htmlNoAnsPath = path.join(OUTPUT_DIR, "APT60_Aptitude_Assessment_Question_Paper.html");
  const pdfNoAnsPath = path.join(OUTPUT_DIR, "APT60_Aptitude_Assessment_Question_Paper.pdf");
  fs.writeFileSync(htmlNoAnsPath, htmlNoAns, "utf8");

  console.log("Compiling PDF with Edge headless: APT60_Aptitude_Assessment_Question_Paper.pdf...");
  execSync(
    `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfNoAnsPath}" "file:///${htmlNoAnsPath.replace(/\\/g, "/")}"`
  );
  console.log(`✓ Generated: ${pdfNoAnsPath}`);

  console.log("=== PDFs generated successfully! ===");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
