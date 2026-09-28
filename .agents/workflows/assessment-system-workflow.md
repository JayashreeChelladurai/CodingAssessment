---
name: assessment-system-workflow
description: Complete operational workflows, architecture knowledge, question authoring standards, execution pipelines, student lifecycle procedures, and troubleshooting runbooks for the Online Assessment Platform.
---

# 🚀 Assessment Platform – Complete System Knowledge & Operational Workflow

Welcome to the definitive system knowledge base and workflow manual for the **Online Coding & MCQ Assessment Platform**. This document provides an exhaustive, end-to-end guide covering system architecture, user journeys, instructor operations, student flows, code execution engine internals, security guardrails, content seeding, and deployment runbooks.

---

## 📑 Table of Contents

1. [System Architecture & Technology Stack](#1-system-architecture--technology-stack)
2. [Data Model & Entity Relationships](#2-data-model--entity-relationships)
3. [Workflow A: Professor / Instructor Operations](#3-workflow-a-professor--instructor-operations)
   - [3.1 Authentication & Security](#31-authentication--security)
   - [3.2 Creating & Authoring Assessments](#32-creating--authoring-assessments)
   - [3.3 MCQ Authoring Standards](#33-mcq-authoring-standards)
   - [3.4 Coding Question Authoring Standards (10-Testcase Rule)](#34-coding-question-authoring-standards-10-testcase-rule)
   - [3.5 Pre-Save Form Validation & Auto-Scroll](#35-pre-save-form-validation--auto-scroll)
   - [3.6 Live Monitoring & Proctoring Dashboard](#36-live-monitoring--proctoring-dashboard)
   - [3.7 Results, Evaluation & Gradebook](#37-results-evaluation--gradebook)
   - [3.8 Secure Logout SOP](#38-secure-logout-sop)
4. [Workflow B: Student Candidate Assessment Journey](#4-workflow-b-student-candidate-assessment-journey)
   - [4.1 Authentication & Access Code Entry](#41-authentication--access-code-entry)
   - [4.2 Assessment Overview & Instructions](#42-assessment-overview--instructions)
   - [4.3 Proctoring, Fullscreen & Focus Tracking](#43-proctoring-fullscreen--focus-tracking)
   - [4.4 Navigation & Question Palette](#44-navigation--question-palette)
   - [4.5 Attempting MCQ Questions](#45-attempting-mcq-questions)
   - [4.6 Attempting Coding Questions (Monaco & Fallback)](#46-attempting-coding-questions-monaco--fallback)
   - [4.7 Multi-Language Switching & Skeleton Code](#47-multi-language-switching--skeleton-code)
   - [4.8 Compiling, Running & Submitting Code](#48-compiling-running--submitting-code)
   - [4.9 Timer Stages & Critical Urgency Alerts](#49-timer-stages--critical-urgency-alerts)
   - [4.10 Auto-Save, Network Resilience & Final Submission](#410-auto-save-network-resilience--final-submission)
5. [Workflow C: Code Compilation & Sandboxed Grading Engine](#5-workflow-c-code-compilation--sandboxed-grading-engine)
   - [5.1 Sandbox Execution Pipeline](#51-sandbox-execution-pipeline)
   - [5.2 Compiler Specifications & Flags](#52-compiler-specifications--flags)
   - [5.3 Process Isolation & Security Sandboxing](#53-process-isolation--security-sandboxing)
   - [5.4 Output Normalization & Scoring Formulas](#54-output-normalization--scoring-formulas)
   - [5.5 Execution Status Taxonomy](#55-execution-status-taxonomy)
6. [Workflow D: Content Generation & Database Seeding Runbook](#6-workflow-d-content-generation--database-seeding-runbook)
   - [6.1 Seed Script Architecture](#61-seed-script-architecture)
   - [6.2 Blind 75 Assessment Suite](#62-blind-75-assessment-suite)
   - [6.3 Custom Test Suites (Test1, Test2)](#63-custom-test-suites-test1-test2)
   - [6.4 Step-by-Step Guide for Creating New Seed Scripts](#64-step-by-step-guide-for-creating-new-seed-scripts)
7. [Workflow E: Platform Guardrails & UX Fail-Safes](#7-workflow-e-platform-guardrails--ux-fail-safes)
   - [7.1 Offline Monaco Bundling & 2.5s Instant Fallback](#71-offline-monaco-bundling--25s-instant-fallback)
   - [7.2 Monaco Undo/Redo Isolation](#72-monaco-undoredo-isolation)
   - [7.3 Pure Single-Click Item Additions](#73-pure-single-click-item-additions)
   - [7.4 Intra-Section Question Shuffling](#74-intra-section-question-shuffling)
   - [7.5 Terminal Console Auto-Reset](#75-terminal-console-auto-reset)
8. [Workflow F: Deployment, Maintenance & Troubleshooting](#8-workflow-f-deployment-maintenance--troubleshooting)
   - [8.1 Development & Production Startup](#81-development--production-startup)
   - [8.2 Database Migrations & Maintenance](#82-database-migrations--maintenance)
   - [8.3 Lab Air-Gapped Deployment](#83-lab-air-gapped-deployment)
   - [8.4 Troubleshooting Matrix](#84-troubleshooting-matrix)
