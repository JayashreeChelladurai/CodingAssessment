import { prisma } from "../src/db.js";
import { generateExpectedOutput } from "../src/services/sqlRunner.js";

const commonSchemaDdl = `CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    dept_name TEXT NOT NULL,
    location TEXT NOT NULL
);

CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY,
    emp_name TEXT NOT NULL,
    dept_id INTEGER,
    job_title TEXT NOT NULL,
    salary REAL NOT NULL,
    hire_date TEXT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE projects (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    budget REAL NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE project_assignments (
    assignment_id INTEGER PRIMARY KEY,
    emp_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    hours_worked INTEGER NOT NULL,
    role TEXT NOT NULL,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);`;

// Public Sample Seed Data (shown in sample runs & schema previews)
const seedDataPublic = `INSERT INTO departments (dept_id, dept_name, location) VALUES
(101, 'Engineering', 'Building A'),
(102, 'Marketing', 'Building B'),
(103, 'Finance', 'Building A'),
(104, 'Human Resources', 'Building C'),
(105, 'Research & Development', 'Building D');

INSERT INTO employees (emp_id, emp_name, dept_id, job_title, salary, hire_date) VALUES
(1, 'Alice Smith', 101, 'Senior Engineer', 95000.00, '2021-03-15'),
(2, 'Bob Jones', 101, 'Software Engineer', 80000.00, '2022-06-01'),
(3, 'Charlie Brown', 101, 'DevOps Specialist', 85000.00, '2020-11-20'),
(4, 'Diana Prince', 102, 'Marketing Director', 90000.00, '2019-08-10'),
(5, 'Evan Wright', 102, 'Content Strategist', 55000.00, '2023-01-15'),
(6, 'Fiona Gallagher', 103, 'Financial Analyst', 72000.00, '2021-09-01'),
(7, 'George Clark', 103, 'Senior Accountant', 88000.00, '2018-04-25'),
(8, 'Hannah Abbott', 104, 'HR Coordinator', 50000.00, '2022-10-10');

INSERT INTO projects (project_id, project_name, budget, status) VALUES
(201, 'Cloud Migration', 250000.00, 'Active'),
(202, 'Brand Redesign', 75000.00, 'Active'),
(203, 'Financial Audit Suite', 120000.00, 'Completed'),
(204, 'Quantum Computing AI', 500000.00, 'Active');

INSERT INTO project_assignments (assignment_id, emp_id, project_id, hours_worked, role) VALUES
(1, 1, 201, 120, 'Lead Architect'),
(2, 1, 204, 80, 'Research Advisor'),
(3, 2, 201, 160, 'Backend Developer'),
(4, 3, 201, 140, 'DevOps Lead'),
(5, 3, 204, 60, 'Infrastructure Support'),
(6, 4, 202, 90, 'Project Sponsor'),
(7, 5, 202, 110, 'Campaign Lead'),
(8, 6, 203, 100, 'Lead Auditor'),
(9, 7, 203, 130, 'Compliance Reviewer'),
(10, 2, 204, 75, 'Algorithm Developer');`;

// Hidden Verification Seed Data (different records to prevent hardcoding)
const seedDataPrivate = `INSERT INTO departments (dept_id, dept_name, location) VALUES
(101, 'Engineering', 'West Campus'),
(102, 'Marketing', 'East Campus'),
(103, 'Finance', 'West Campus'),
(104, 'Human Resources', 'North Campus'),
(105, 'Legal & Compliance', 'South Campus');

INSERT INTO employees (emp_id, emp_name, dept_id, job_title, salary, hire_date) VALUES
(11, 'Kevin Bacon', 101, 'Principal Architect', 120000.00, '2020-01-10'),
(12, 'Laura Croft', 101, 'Systems Engineer', 92000.00, '2021-05-12'),
(13, 'Michael Scott', 102, 'Regional Director', 75000.00, '2019-02-01'),
(14, 'Nancy Drew', 103, 'Forensic Auditor', 82000.00, '2022-03-15'),
(15, 'Oscar Martinez', 103, 'Senior Accountant', 79000.00, '2021-07-20'),
(16, 'Pam Beesly', 104, 'Office Manager', 48000.00, '2023-04-01');

INSERT INTO projects (project_id, project_name, budget, status) VALUES
(301, 'Data Lake Platform', 400000.00, 'Active'),
(302, 'Customer CRM Refresh', 150000.00, 'Active'),
(303, 'Annual Tax Consolidation', 90000.00, 'Active');

INSERT INTO project_assignments (assignment_id, emp_id, project_id, hours_worked, role) VALUES
(11, 11, 301, 200, 'Tech Lead'),
(12, 11, 302, 50, 'Consultant'),
(13, 12, 301, 180, 'Core Engineer'),
(14, 13, 302, 140, 'Project Manager'),
(15, 14, 303, 110, 'Auditor'),
(16, 15, 303, 125, 'Accountant'),
(17, 12, 302, 60, 'Integration Engineer');`;

interface QueryQuestionSpec {
  title: string;
  description: string;
  marks: number;
  order: number;
  solutionSql: string;
}

const sqlQuestions: QueryQuestionSpec[] = [
  {
    title: "1. Department Salary & Headcount Analytics (INNER JOIN & Aggregates)",
    description: `### Problem Description
Write an SQL query to calculate salary statistics for all departments that currently have assigned employees.

For each department, return:
- **\`dept_name\`**: Name of the department
- **\`employee_count\`**: Total count of employees assigned to this department
- **\`avg_salary\`**: Average employee salary in this department, rounded to **2 decimal places** (\`ROUND(AVG(salary), 2)\`)
- **\`min_salary\`**: Minimum salary among employees in this department
- **\`max_salary\`**: Maximum salary among employees in this department

### Requirements
- Use an **\`INNER JOIN\`** between \`departments\` and \`employees\`.
- Group by department.
- Order results by **\`avg_salary\` descending**.`,
    marks: 20,
    order: 0,
    solutionSql: `SELECT 
    d.dept_name,
    COUNT(e.emp_id) AS employee_count,
    ROUND(AVG(e.salary), 2) AS avg_salary,
    MIN(e.salary) AS min_salary,
    MAX(e.salary) AS max_salary
FROM departments d
INNER JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id, d.dept_name
ORDER BY avg_salary DESC;`,
  },
  {
    title: "2. High-Payroll Departments with Aggregate Filtering (JOIN & HAVING)",
    description: `### Problem Description
Write an SQL query to identify departments whose total employee payroll expenditure strictly exceeds **$150,000**.

For each qualifying department, return:
- **\`dept_name\`**: Name of the department
- **\`location\`**: Location / building of the department
- **\`total_payroll\`**: Sum of salaries of all employees in this department (\`SUM(salary)\`)
- **\`staff_count\`**: Count of employees in this department

### Requirements
- Use an **\`INNER JOIN\`** between \`departments\` and \`employees\`.
- Filter groups using a **\`HAVING\`** clause on \`SUM(salary) > 150000\`.
- Order results by **\`total_payroll\` descending**.`,
    marks: 20,
    order: 1,
    solutionSql: `SELECT 
    d.dept_name,
    d.location,
    SUM(e.salary) AS total_payroll,
    COUNT(e.emp_id) AS staff_count
FROM departments d
INNER JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id, d.dept_name, d.location
HAVING SUM(e.salary) > 150000
ORDER BY total_payroll DESC;`,
  },
  {
    title: "3. Project Staffing and Total Effort Analysis (3-Table JOIN & Aggregates)",
    description: `### Problem Description
Write an SQL query to analyze workload across all projects that currently have assigned staff.

For each active project with assignments, return:
- **\`project_name\`**: Name of the project
- **\`status\`**: Current status of the project
- **\`assigned_members\`**: Count of **distinct** employees assigned to the project (\`COUNT(DISTINCT emp_id)\`)
- **\`total_hours\`**: Total sum of hours worked on the project across all assignments (\`SUM(hours_worked)\`)

### Requirements
- Join \`projects\` with \`project_assignments\`.
- Group by project.
- Order results by **\`total_hours\` descending**.`,
    marks: 20,
    order: 2,
    solutionSql: `SELECT 
    p.project_name,
    p.status,
    COUNT(DISTINCT pa.emp_id) AS assigned_members,
    SUM(pa.hours_worked) AS total_hours
FROM projects p
INNER JOIN project_assignments pa ON p.project_id = pa.project_id
GROUP BY p.project_id, p.project_name, p.status
ORDER BY total_hours DESC;`,
  },
  {
    title: "4. All Departments Headcount & Compensation Audit (LEFT OUTER JOIN)",
    description: `### Problem Description
Write an SQL query to produce a complete audit report of **all** departments in the company, including departments that currently have **zero employees**.

For each department, return:
- **\`dept_name\`**: Name of the department
- **\`location\`**: Location of the department
- **\`total_employees\`**: Number of employees in the department (must show **0** if no employees exist)
- **\`avg_salary\`**: Average salary rounded to 2 decimal places. If a department has no employees, return **0** using \`COALESCE(ROUND(AVG(salary), 2), 0)\`.

### Requirements
- Use a **\`LEFT JOIN\`** from \`departments\` to \`employees\` so that vacant departments are not dropped.
- Use \`COUNT(e.emp_id)\` instead of \`COUNT(*)\` so unstaffed departments evaluate to 0.
- Order results by **\`total_employees\` descending**, then by **\`dept_name\` ascending**.`,
    marks: 20,
    order: 3,
    solutionSql: `SELECT 
    d.dept_name,
    d.location,
    COUNT(e.emp_id) AS total_employees,
    COALESCE(ROUND(AVG(e.salary), 2), 0) AS avg_salary
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id, d.dept_name, d.location
ORDER BY total_employees DESC, d.dept_name ASC;`,
  },
  {
    title: "5. Multi-Project Contributors and Workload (Multi-Table JOIN, HAVING & Aggregates)",
    description: `### Problem Description
Write an SQL query to find all dedicated employees who are contributing to **at least 2 distinct projects** (\`>= 2\`).

For each matching employee, return:
- **\`emp_name\`**: Name of the employee
- **\`job_title\`**: Job title of the employee
- **\`salary\`**: Employee annual salary
- **\`project_count\`**: Count of distinct projects the employee is assigned to (\`COUNT(DISTINCT pa.project_id)\`)
- **\`total_hours_logged\`**: Total sum of hours worked across all assigned projects (\`SUM(pa.hours_worked)\`)

### Requirements
- Join \`employees\` with \`project_assignments\`.
- Group by employee.
- Filter using a **\`HAVING\`** clause where \`COUNT(DISTINCT pa.project_id) >= 2\`.
- Order results by **\`total_hours_logged\` descending**, then by **\`emp_name\` ascending**.`,
    marks: 20,
    order: 4,
    solutionSql: `SELECT 
    e.emp_name,
    e.job_title,
    e.salary,
    COUNT(DISTINCT pa.project_id) AS project_count,
    SUM(pa.hours_worked) AS total_hours_logged
FROM employees e
INNER JOIN project_assignments pa ON e.emp_id = pa.emp_id
GROUP BY e.emp_id, e.emp_name, e.job_title, e.salary
HAVING COUNT(DISTINCT pa.project_id) >= 2
ORDER BY total_hours_logged DESC, e.emp_name ASC;`,
  },
];

async function main() {
  console.log("=================================================");
  console.log("🚀 CREATING & SEEDING ASSESSMENT: SQL-1");
  console.log("=================================================");

  // 1. Upsert Assessment
  let assessment = await prisma.assessment.findUnique({
    where: { code: "SQL-1" },
    include: { sections: true, questions: true },
  });

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        code: "SQL-1",
        title: "SQL-1: Aggregate Functions & Joins Assessment",
        description: "Comprehensive 30-minute SQL assessment featuring 5 query problems testing Joins (INNER, LEFT, Multi-Table) and Aggregate Functions (COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING). Strict Safe Exam Browser (SEB) enforcement enabled.",
        durationMinutes: 30,
        requireSeb: true,
        sebQuitPassword: "exit123",
        isRandomized: false,
        shuffleQuestions: false,
      },
      include: { sections: true, questions: true },
    });
    console.log(`✅ Created assessment SQL-1 (ID: ${assessment.id})`);
  } else {
    assessment = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        title: "SQL-1: Aggregate Functions & Joins Assessment",
        description: "Comprehensive 30-minute SQL assessment featuring 5 query problems testing Joins (INNER, LEFT, Multi-Table) and Aggregate Functions (COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING). Strict Safe Exam Browser (SEB) enforcement enabled.",
        durationMinutes: 30,
        requireSeb: true,
        sebQuitPassword: "exit123",
        isRandomized: false,
        shuffleQuestions: false,
      },
      include: { sections: true, questions: true },
    });
    console.log(`✅ Updated existing assessment SQL-1 (ID: ${assessment.id})`);
  }

  // 2. Upsert Section
  let section = assessment.sections.find((s) => s.order === 0);
  if (!section) {
    section = await prisma.section.create({
      data: {
        assessmentId: assessment.id,
        title: "Section A: SQL Queries",
        description: "Solve the 5 SQL queries against the TechCorp database schema. You can run and test your query with sample output before final submission.",
        order: 0,
      },
    });
    console.log(`✅ Created Section A (ID: ${section.id})`);
  }

  // 3. Delete existing questions if any to cleanly re-create all 5 queries and test cases
  const existingQuestions = await prisma.question.findMany({
    where: { assessmentId: assessment.id },
    select: { id: true },
  });
  if (existingQuestions.length > 0) {
    await prisma.question.deleteMany({
      where: { assessmentId: assessment.id },
    });
    console.log(`🧹 Cleaned up ${existingQuestions.length} prior questions in SQL-1.`);
  }

  // 4. Create all 5 SQL Questions with Pre-computed Canonical Outputs
  for (const qSpec of sqlQuestions) {
    console.log(`\n⚙️ Preparing Question #${qSpec.order + 1}: ${qSpec.title}...`);

    // Pre-calculate canonical expected outputs
    const expPublic = generateExpectedOutput(commonSchemaDdl, seedDataPublic, qSpec.solutionSql);
    const expPrivate = generateExpectedOutput(commonSchemaDdl, seedDataPrivate, qSpec.solutionSql);

    const question = await prisma.question.create({
      data: {
        assessmentId: assessment.id,
        sectionId: section.id,
        type: "SQL",
        title: qSpec.title,
        description: qSpec.description,
        marks: qSpec.marks,
        negativeMarks: 0,
        order: qSpec.order,
        allowedLanguages: "SQL",
        starterCode: `-- Write your SQL query below to solve: ${qSpec.title}\nSELECT \n`,
        schemaDdl: commonSchemaDdl,
        solutionSql: qSpec.solutionSql,
        orderSensitive: true,
        testCases: {
          create: [
            {
              title: "Public Test Case (Sample Data)",
              seedData: seedDataPublic,
              expectedOutput: JSON.stringify(expPublic),
              isPublic: true,
              weight: 1.0,
              order: 0,
            },
            {
              title: "Hidden Test Case (Verification Data)",
              seedData: seedDataPrivate,
              expectedOutput: JSON.stringify(expPrivate),
              isPublic: false,
              weight: 1.0,
              order: 1,
            },
          ],
        },
      },
      include: { testCases: true },
    });

    console.log(`   - Created Question (ID: ${question.id}, Marks: ${question.marks}m) with ${question.testCases.length} test cases.`);
  }

  console.log("\n=================================================");
  console.log("🎉 ASSESSMENT SQL-1 CONFIGURATION COMPLETE");
  console.log("=================================================");
  console.log(`- Code: ${assessment.code}`);
  console.log(`- Title: ${assessment.title}`);
  console.log(`- Duration: ${assessment.durationMinutes} Minutes`);
  console.log(`- Total Questions: ${sqlQuestions.length}`);
  console.log(`- Total Marks: ${sqlQuestions.reduce((sum, q) => sum + q.marks, 0)} Marks`);
  console.log(`- SEB Required: ${assessment.requireSeb} (Quit Password: ${assessment.sebQuitPassword})`);
}

main()
  .catch((err) => {
    console.error("Error seeding SQL-1:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
