import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { createRequire } from "module";
import { GoogleGenAI } from "@google/genai";
import {
  getRandomSubtopics,
  getRandomQuestionsFromBank,
  DOMAIN_SUBTOPICS,
  shuffleArray,
} from "./questionsData.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Configure Multer for file uploads (stored in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// HELPER - MULTI-MODEL FALLBACK CALLER
// =====================================================

async function callGemini({ prompt, temperature = 0.8, isJson = true }) {
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const config = {
        temperature,
        thinkingConfig: {
          thinkingLevel: "minimal",
        },
      };

      if (isJson) {
        config.responseMimeType = "application/json";
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`[Gemini Model Note] ${model} unavailable: ${err.message}. Trying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models were unavailable.");
}

// =====================================================
// HELPER - PARSE AI JSON
// =====================================================

function parseAIResponse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .trim();

    return JSON.parse(cleaned);
  }
}

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "AI Interview Coach Backend is running!",
    features: [
      "Live Video & Camera Proctoring",
      "Dynamic Question Generation",
      "Resume-Based Placement Interviews",
      "Mistake & Gaps Analysis (Kahan Galti Hui)",
    ],
  });
});

// =====================================================
// RESUME PARSING - EXTRACT SKILLS, PROJECTS & BACKGROUND
// =====================================================

app.post("/api/parse-resume", upload.single("resumeFile"), async (req, res) => {
  const startTime = Date.now();
  console.log("\n================================");
  console.log("PARSING CANDIDATE RESUME FOR INTERVIEW");

  try {
    let rawText = "";

    // 1. Extract raw text from file upload
    if (req.file) {
      console.log("Uploaded file:", req.file.originalname, "Mime:", req.file.mimetype);
      if (
        req.file.mimetype === "application/pdf" ||
        req.file.originalname.toLowerCase().endsWith(".pdf")
      ) {
        try {
          const parseFn = typeof pdfParse === "function" ? pdfParse : (pdfParse.default || pdfParse);
          if (typeof parseFn === "function") {
            const pdfData = await parseFn(req.file.buffer);
            rawText = pdfData.text || "";
          } else {
            rawText = req.file.buffer.toString("utf-8");
          }
        } catch (pdfErr) {
          console.warn("pdfParse note, fallback to buffer text:", pdfErr.message);
          rawText = req.file.buffer.toString("utf-8");
        }
      } else {
        rawText = req.file.buffer.toString("utf-8");
      }
    } else if (req.body.resumeText) {
      rawText = String(req.body.resumeText);
    }

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        message: "No valid resume text found. Please upload a PDF or paste resume text.",
      });
    }

    const trimmedText = rawText.slice(0, 10000); // keep reasonable prompt size

    const prompt = `
You are an expert HR and Technical Recruiter at a top IT/Software company.
Extract key candidate information from the following resume text for a campus placement / fresher interview.

RESUME CONTENT:
"""
${trimmedText}
"""

Extract structured information into valid JSON with this exact schema:
{
  "candidateName": "Full name or Fresher Candidate",
  "education": "Degree, Major, College name if found (e.g. B.Tech Computer Science, ABC College)",
  "skills": ["Array of technical skills and programming languages (e.g. React, JavaScript, Node.js, Python, SQL)"],
  "projects": [
    {
      "title": "Project Name (e.g. E-Commerce Platform)",
      "description": "Short 1-2 sentence description of what the project does",
      "techStack": ["Technologies used"]
    }
  ],
  "experience": "Internships or 'Fresher / College Projects'",
  "summary": "Short 2-line summary of candidate profile and strengths"
}

CRITICAL RULES:
1. Ensure 'skills' contains 4-10 distinct technologies mentioned in the resume.
2. Ensure 'projects' contains 1-3 distinct projects mentioned in the resume. If no project is explicitly named, create 1-2 based on the technologies found (e.g. "Full Stack Web Application").
3. Return ONLY valid JSON format.
`;

    let parsedResult = null;

    try {
      const aiResponseText = await callGemini({
        prompt,
        temperature: 0.2,
        isJson: true,
      });
      parsedResult = parseAIResponse(aiResponseText);
    } catch (aiErr) {
      console.warn("AI resume parsing fallback used:", aiErr.message);
    }

    // Heuristic Fallback if AI didn't return proper structure
    if (!parsedResult || !Array.isArray(parsedResult.skills) || parsedResult.skills.length === 0) {
      const commonSkills = [
        "React", "JavaScript", "Node.js", "Express", "HTML", "CSS", "Python",
        "Java", "C++", "SQL", "MongoDB", "Git", "GitHub", "REST API", "Data Structures"
      ];
      const detectedSkills = commonSkills.filter((s) => {
        const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`, "i").test(trimmedText);
      });

      parsedResult = {
        candidateName: "Fresher Candidate",
        education: "B.Tech in Computer Science / Engineering",
        skills: detectedSkills.length > 0 ? detectedSkills : ["JavaScript", "React", "Node.js", "SQL", "Git"],
        projects: [
          {
            title: "Web Application Project",
            description: "Full stack responsive web application built during college coursework.",
            techStack: detectedSkills.slice(0, 3)
          }
        ],
        experience: "College Projects & Academic Coursework",
        summary: "Enthusiastic computer science graduate with solid foundational knowledge.",
      };
    }

    console.log("Parsed Name:", parsedResult.candidateName);
    console.log("Extracted Skills:", parsedResult.skills?.join(", "));
    console.log("Projects Count:", parsedResult.projects?.length || 0);
    console.log("Time Taken:", ((Date.now() - startTime) / 1000).toFixed(2), "s");
    console.log("================================\n");

    res.json({
      success: true,
      resumeData: parsedResult,
      rawLength: rawText.length,
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    res.status(500).json({
      message: "Failed to parse resume: " + error.message,
    });
  }
});

// =====================================================
// AI RESUME-BASED INTERVIEW QUESTIONS GENERATION
// Real-world company placement format (Intro -> Projects -> Skills -> HR)
// =====================================================

app.post("/api/generate-resume-questions", async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      resumeData = {},
      totalQuestions = 5,
      companyStyle = "Top Product Company", // "Top Product Company" | "IT Services (TCS/Infosys)" | "Startup"
      difficulty = "Medium",
    } = req.body;

    const count = Math.min(Math.max(parseInt(totalQuestions) || 5, 3), 10);

    const skillsList = Array.isArray(resumeData.skills) && resumeData.skills.length > 0
      ? resumeData.skills.join(", ")
      : "React, JavaScript, Node.js, SQL";

    const projectsList = Array.isArray(resumeData.projects) && resumeData.projects.length > 0
      ? resumeData.projects.map((p, i) => `${i + 1}. ${p.title} (${(p.techStack || []).join(", ")}) - ${p.description || ""}`).join("\n")
      : "1. Full Stack Web Application (React, Node.js, MongoDB)";

    console.log("\n================================");
    console.log("GENERATING REAL-WORLD RESUME-BASED INTERVIEW QUESTIONS");
    console.log("Candidate:", resumeData.candidateName || "Candidate");
    console.log("Company Style:", companyStyle);
    console.log("Skills:", skillsList);
    console.log("Target Count:", count);

    const prompt = `
You are a warm, supportive interviewer conducting an entry-level interview for a college student / fresher.
IMPORTANT: The questions must be SUPER BASIC, SIMPLE, SHORT, AND FRIENDLY (under 12 to 15 words each). Ask fundamental concepts in simple, everyday conversational Indian English that the candidate can easily understand in ONE single listen.

CANDIDATE RESUME SUMMARY:
- Name: ${resumeData.candidateName || "Candidate"}
- Education: ${resumeData.education || "B.Tech Computer Science"}
- Technical Skills: ${skillsList}
- College Projects:
${projectsList}
- Experience: ${resumeData.experience || "Fresher"}

QUESTION SEQUENCE (Total exactly ${count} short, basic questions):
1. Question 1 (Intro): "Hi ${resumeData.candidateName || "there"}, please introduce yourself in two to three simple sentences."
2. Question 2 (Basic Project Overview): "In simple words, what does your project '${resumeData.projects?.[0]?.title || "project"}' do?"
3. Question 3 (Super Basic Concept): "What is ${skillsList.split(",")[0]?.trim() || "programming"} and why do we use it?"
4. Question 4 (Simple Practical Question): "What is the difference between frontend and backend in simple words?"
5. Question 5 (Friendly HR Question): "Which programming language do you like the most, and why?"

CRITICAL RULES:
1. TARGET AUDIENCE: College beginner / Fresher.
2. DIFFICULTY: SUPER BASIC & FUNDAMENTAL. Ask simple definitions, differences, or concepts that can be understood in ONE listen.
3. Every question must be 1 short sentence (under 12 to 14 words).
4. Use simple, natural conversational Indian English phrasing. NO complicated words, NO complex multi-clause sentences, NO architecture or production jargon.
5. Return ONLY valid JSON format:
{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}
`;

    let generatedQuestions = [];

    try {
      const responseText = await callGemini({
        prompt,
        temperature: 0.7,
        isJson: true,
      });

      const parsed = parseAIResponse(responseText);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        generatedQuestions = parsed.questions
          .filter((q) => typeof q === "string" && q.trim().length > 10)
          .map((q) => q.trim());
      }
    } catch (aiErr) {
      console.warn("AI resume question generation fallback:", aiErr.message);
    }

    // Intelligent Fallback Synthesis if AI was unavailable
    if (generatedQuestions.length < count) {
      const firstProj = resumeData.projects?.[0]?.title || "your college project";
      const topSkill = resumeData.skills?.[0] || "JavaScript";

      const fallbackList = [
        `Hi ${resumeData.candidateName || "there"}, please introduce yourself in two to three simple sentences.`,
        `In simple words, what does your project '${firstProj}' do?`,
        `What is ${topSkill} and why do we use it in programming?`,
        `What is the difference between frontend and backend in simple words?`,
        `Which programming language do you like the most, and why?`,
      ];

      generatedQuestions = fallbackList.slice(0, count);
    }

    const finalQuestions = generatedQuestions.slice(0, count);

    console.log("Generated Questions Count:", finalQuestions.length);
    console.log("Time Taken:", ((Date.now() - startTime) / 1000).toFixed(2), "s");
    console.log("================================\n");

    res.json({ questions: finalQuestions });
  } catch (error) {
    console.error("Resume question generation error:", error);
    res.status(500).json({
      message: "Failed to generate resume interview questions",
      questions: [
        "Please introduce yourself in two to three simple sentences.",
        "In simple words, what does your college project do?",
        "What is the difference between frontend and backend?",
        "Which programming language do you like the most, and why?",
        "What is a database and why do we use it in a project?",
      ],
    });
  }
});

// =====================================================
// AI QUESTION GENERATION (BATCH) - DOMAIN OR RESUME
// =====================================================

app.post("/api/generate-questions", async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      role = "Frontend Developer",
      type = "Technical",
      difficulty = "Medium",
      questionCount,
      count,
      numberOfQuestions,
      previousQuestions = [],
      resumeData,
    } = req.body;

    const requestedCount =
      parseInt(numberOfQuestions || questionCount || count) || 5;
    const totalQuestions = Math.min(Math.max(requestedCount, 1), 20);

    // If resume data is provided, forward to resume questions logic
    if (resumeData && (resumeData.skills?.length > 0 || resumeData.projects?.length > 0)) {
      return res.redirect(307, "/api/generate-resume-questions");
    }

    const randomSubtopics = getRandomSubtopics(role, 3);

    console.log("\n================================");
    console.log("GENERATING CAMPUS-CALIBRATED INTERVIEW QUESTIONS");
    console.log("Role / Domain:", role);
    console.log("Type:", type);
    console.log("Difficulty:", difficulty);
    console.log("Questions Count:", totalQuestions);
    console.log("Focus Subtopics:", randomSubtopics.join(" | "));

    let difficultyInstruction = `
DIFFICULTY: SUPER BASIC & BEGINNER LEVEL (College fresher / 1st-2nd year student level)
- The questions MUST be extremely simple, basic, direct, and short (under 12 to 15 words each).
- Ask fundamental definitions and beginner concepts that a fresher in India can understand in ONE single listen.
  - Examples for Frontend: "What is HTML and why do we use it?", "What is the difference between let and const in JavaScript?", "What is CSS used for on a website?", "What is a function in JavaScript?", "What is React used for?"
  - Examples for Backend: "What is an API in simple words?", "What is the difference between GET and POST?", "What is a database?", "What is a primary key in SQL?", "What is Node.js?"
  - Examples for Python: "What is a list in Python?", "What is the difference between list and tuple?", "What is a function in Python?", "What are variables in programming?"
  - Examples for Java: "What is a class and an object in Java?", "What is the difference between int and String?", "What is inheritance in simple words?"
- Absolutely NO complicated architecture, NO advanced design patterns, NO tricky edge cases, NO difficult algorithms.
- Use plain, natural Indian conversational English that is crystal clear when spoken.
`;

    let typeInstruction = "";
    if (type === "Technical") {
      typeInstruction = `Focus on super basic technical fundamentals, programming definitions, and simple concepts for ${role}.`;
    } else if (type === "HR") {
      typeInstruction = `Focus on very simple HR questions for freshers: short intro, favorite programming language, why they want to work in tech.`;
    } else if (type === "Technical + HR") {
      typeInstruction = `Create a mix: basic technical questions for ${role} and friendly HR questions.`;
    } else if (type === "Project Based") {
      typeInstruction = `Focus on college projects in simple terms: what the project does, which programming language was used, and favorite feature.`;
    }

    const previousText =
      Array.isArray(previousQuestions) && previousQuestions.length > 0
        ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")
        : "None.";

    const prompt = `
You are a friendly technical interviewer conducting a college campus placement interview for a fresher / entry-level candidate.

Generate exactly ${totalQuestions} randomized interview questions.

Candidate Domain / Role: ${role}
Interview Type: ${type}
Target Difficulty: ${difficulty}
Number of Questions: ${totalQuestions}

${difficultyInstruction}

${typeInstruction}

QUESTION SEQUENCE:
1. Question 1 (Communication Check & Intro): "Hello, please introduce yourself in two to three simple sentences."
2. Questions 2 to ${totalQuestions} (Super Basic Fundamental Questions): Very short, 1-sentence basic definition and concept questions under 14 words each.

Subtopics to draw inspiration from:
${randomSubtopics.map((t) => `- ${t}`).join("\n")}

EXCLUDE THESE PREVIOUS QUESTIONS:
${previousText}

CRITICAL RULES:
1. TARGET AUDIENCE: College students & freshers. Keep questions SUPER BASIC, friendly, and simple.
2. Every question must be concise (1 short sentence, under 14 words) and easily answerable verbally in 1-2 minutes.
3. Return ONLY valid JSON format:
{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}
`;

    let generatedQuestions = [];

    try {
      const responseText = await callGemini({
        prompt,
        temperature: 0.9,
        isJson: true,
      });

      const result = parseAIResponse(responseText);
      if (result && Array.isArray(result.questions)) {
        generatedQuestions = result.questions
          .filter((q) => typeof q === "string" && q.trim().length > 5)
          .map((q) => q.trim());
      }
    } catch (aiErr) {
      console.warn("Gemini API note: backfilling with campus question bank:", aiErr.message);
    }

    const previousSet = new Set(
      Array.isArray(previousQuestions)
        ? previousQuestions.map((q) => String(q).trim().toLowerCase())
        : []
    );

    let uniqueQuestions = [
      ...new Set(
        generatedQuestions.filter((q) => !previousSet.has(q.toLowerCase()))
      ),
    ];

    if (uniqueQuestions.length < totalQuestions) {
      const neededCount = totalQuestions - uniqueQuestions.length;
      const bankFallback = getRandomQuestionsFromBank({
        role,
        type,
        difficulty,
        count: neededCount,
        excludeQuestions: [...previousQuestions, ...uniqueQuestions],
      });
      uniqueQuestions = [...uniqueQuestions, ...bankFallback];
    }

    // Ensure Question 1 is always the friendly Communication & Introduction Check
    const introQ = `Hello, please introduce yourself in two to three simple sentences.`;
    if (!uniqueQuestions[0] || !uniqueQuestions[0].toLowerCase().includes("introduce")) {
      uniqueQuestions.unshift(introQ);
    }

    const finalQuestions = uniqueQuestions.slice(0, totalQuestions);

    console.log("Prepared Questions Count:", finalQuestions.length);
    console.log("Time:", ((Date.now() - startTime) / 1000).toFixed(2), "s");
    console.log("================================\n");

    res.json({ questions: finalQuestions });
  } catch (error) {
    console.error("Question Generation Error:", error);

    const fallbackQuestions = getRandomQuestionsFromBank({
      role: req.body?.role || "Frontend Developer",
      type: req.body?.type || "Technical",
      difficulty: "Easy",
      count: parseInt(req.body?.numberOfQuestions || req.body?.count) || 5,
      excludeQuestions: req.body?.previousQuestions || [],
    });

    const fallbackIntro = `Hello, please introduce yourself in two to three simple sentences.`;
    if (!fallbackQuestions[0] || !fallbackQuestions[0].toLowerCase().includes("introduce")) {
      fallbackQuestions.unshift(fallbackIntro);
    }

    res.json({ questions: fallbackQuestions.slice(0, parseInt(req.body?.numberOfQuestions || req.body?.count) || 5) });
  }
});

// =====================================================
// AI SINGLE RANDOM QUESTION GENERATION (SWAPPING)
// Supports both resume-based and domain-based swapping
// =====================================================

app.post("/api/random-question", async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      role = "Frontend Developer",
      type = "Technical",
      difficulty = "Medium",
      currentQuestions = [],
      previousQuestions = [],
      resumeData,
    } = req.body;

    const excludedList = [
      ...(Array.isArray(currentQuestions) ? currentQuestions : []),
      ...(Array.isArray(previousQuestions) ? previousQuestions : []),
    ];

    const previousText =
      excludedList.length > 0
        ? excludedList.slice(-10).map((q, i) => `${i + 1}. ${q}`).join("\n")
        : "None.";

    let prompt = "";

    // If resume context is present, generate a resume question swap
    if (resumeData && (resumeData.skills?.length > 0 || resumeData.projects?.length > 0)) {
      const skillsStr = (resumeData.skills || []).join(", ");
      const projectsStr = (resumeData.projects || []).map((p) => p.title).join(", ");

      prompt = `
You are a friendly interviewer conducting a basic interview for a college student.
Generate ONE single SUPER BASIC replacement question based on the candidate's skills: ${skillsStr}.
Keep it under 12 words in simple conversational Indian English (e.g. "What is ${skillsStr.split(",")[0] || "coding"} and why do we use it?").

DO NOT DUPLICATE THESE ALREADY ASKED QUESTIONS:
${previousText}

Return ONLY valid JSON:
{
  "question": "Your single replacement question here"
}
`;
    } else {
      const randomSubtopics = getRandomSubtopics(role, 2);
      const randomTopic = randomSubtopics[0] || "Core Concepts";

      prompt = `
You are a friendly campus interviewer conducting an interview for a college fresher.
Generate ONE single SUPER BASIC, short fundamental interview question for ${role} on ${randomTopic}.
Keep it under 12 words in simple conversational Indian English (e.g. "What is HTML?", "What is a variable?").

DO NOT DUPLICATE:
${previousText}

Return ONLY valid JSON:
{
  "question": "Your single question here"
}
`;
    }

    let newQuestion = "";

    try {
      const responseText = await callGemini({
        prompt,
        temperature: 0.95,
        isJson: true,
      });

      const result = parseAIResponse(responseText);
      if (result && result.question && typeof result.question === "string") {
        newQuestion = result.question.trim();
      }
    } catch (aiErr) {
      console.warn("Single question AI error, using fallback:", aiErr.message);
    }

    const excludeSet = new Set(
      excludedList.map((q) => String(q).trim().toLowerCase())
    );

    if (!newQuestion || excludeSet.has(newQuestion.toLowerCase())) {
      if (resumeData?.skills?.length > 0) {
        const randomSkill = resumeData.skills[Math.floor(Math.random() * resumeData.skills.length)];
        newQuestion = `Can you explain how you worked with ${randomSkill} and what best practices you followed?`;
      } else {
        const bankResult = getRandomQuestionsFromBank({
          role,
          type,
          difficulty,
          count: 1,
          excludeQuestions: excludedList,
        });
        newQuestion = bankResult[0] || `Explain what you understand by core concepts in ${role}.`;
      }
    }

    res.json({ question: newQuestion });
  } catch (err) {
    console.error("Error in /api/random-question:", err);

    const bankResult = getRandomQuestionsFromBank({
      role: req.body?.role || "Frontend Developer",
      type: req.body?.type || "Technical",
      difficulty: req.body?.difficulty || "Medium",
      count: 1,
      excludeQuestions: req.body?.currentQuestions || [],
    });

    res.json({
      question: bankResult[0] || "What is a project you enjoyed building in college?",
    });
  }
});

// =====================================================
// AI ANSWER EVALUATION & MISTAKE ANALYSIS (KAHAN GALTI HUI)
// Identifies candidate mistakes, missing points & real company guidance
// =====================================================

// Technical term speech transcript normalizer for speech-to-text artifacts
function normalizeTechnicalTerms(rawText, questionText = "") {
  if (!rawText || typeof rawText !== "string") return "";
  let text = rawText;

  const techMap = [
    { regex: /\b(hdm|htm|ht\s*ml|h\s*t\s*m\s*l|htnl|hml)\b/gi, fix: "HTML" },
    { regex: /\b(cfs|see\s*ss|c\s*s\s*s|cs\s*s)\b/gi, fix: "CSS" },
    { regex: /\b(j\s*s)\b/gi, fix: "JS" },
    { regex: /\b(java\s*script)\b/gi, fix: "JavaScript" },
    { regex: /\b(type\s*script)\b/gi, fix: "TypeScript" },
    { regex: /\b(jason|j\s*son|jay\s*son)\b/gi, fix: "JSON" },
    { regex: /\b(sq\s*l|s\s*q\s*l|sequel)\b/gi, fix: "SQL" },
    { regex: /\b(a\s*p\s*i|ap\s*i|a\s+pie)\b/gi, fix: "API" },
    { regex: /\b(d\s*o\s*m)\b/gi, fix: "DOM" },
    { regex: /\b(riact|re\s*act)\b/gi, fix: "React" },
    { regex: /\b(red\s*x|re\s*ducks)\b/gi, fix: "Redux" },
    { regex: /\b(node\s*js|node\s*j\s*s|noade)\b/gi, fix: "Node.js" },
    { regex: /\b(dbms|d\s*b\s*m\s*s)\b/gi, fix: "DBMS" },
    { regex: /\b(mango\s*db|mongo\s*db)\b/gi, fix: "MongoDB" },
    { regex: /\b(git\s*hub|get\s*hub)\b/gi, fix: "GitHub" },
    { regex: /\b(c\s*plus\s*plus|c\s*\+\s*\+)\b/gi, fix: "C++" },
    { regex: /\b(oops?|o\s*o\s*p\s*s?)\b/gi, fix: "OOP" },
    { regex: /\b(http)\b/gi, fix: "HTTP" },
    { regex: /\b(https)\b/gi, fix: "HTTPS" },
    { regex: /\b(ui|u\s*i)\b/gi, fix: "UI" },
    { regex: /\b(ux|u\s*x)\b/gi, fix: "UX" },
    { regex: /\b(rest\s*api|restful)\b/gi, fix: "REST API" },
  ];

  for (const { regex, fix } of techMap) {
    text = text.replace(regex, fix);
  }

  if (questionText) {
    const qLower = questionText.toLowerCase();
    if (qLower.includes("html")) text = text.replace(/\b(hdm|htm|htnl|hml)\b/gi, "HTML");
    if (qLower.includes("css")) text = text.replace(/\b(cfs|cs\s*s)\b/gi, "CSS");
    if (qLower.includes("component")) text = text.replace(/\b(compnent|componet|compunent)\b/gi, "component");
    if (qLower.includes("variable") || qLower.includes("let") || qLower.includes("const")) {
      text = text.replace(/\blet\s*and\s*constant\b/gi, "let and const");
      text = text.replace(/\bconstant\b/gi, "const");
    }
    if (qLower.includes("database")) text = text.replace(/\bdata\s*base\b/gi, "database");
    if (qLower.includes("react")) text = text.replace(/\b(riact|re\s*act)\b/gi, "React");
  }

  return text;
}

app.post("/api/evaluate", async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      question,
      answer,
      role = "Candidate",
      difficulty = "Medium",
      speakingTime = 0,
      cameraMetrics = {},
      resumeContext,
    } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        message: "Question and answer are required.",
      });
    }

    const cleanedAnswer = normalizeTechnicalTerms(answer, question);

    console.log("\n================================");
    console.log("EVALUATING INTERVIEW ANSWER & MISTAKES");
    console.log("Question:", question);
    console.log("Original Answer:", answer);
    console.log("Cleaned Answer:", cleanedAnswer);
    console.log("Speaking Time:", speakingTime, "seconds");

    const prompt = `
You are an executive Technical Hiring Manager and Campus Placement Coach at a top Tier-1 technology firm (Google / Microsoft / TCS / Infosys panel).
Conduct an in-depth, professional evaluation of this college fresher candidate's spoken interview response.
Give specific, concrete, highly professional feedback that will genuinely help them get hired.

CRITICAL SPEECH-TO-TEXT ACCURACY NOTICE:
The candidate's response was spoken into a microphone and transcribed via browser Web Speech API.
Automated microphone speech recognition frequently produces phonetic artifacts (e.g. hearing "HTML" as "HDM", "SQL" as "sequel", "JSON" as "Jason").
- NEVER penalize or create "Mispronounced acronym" gaps for microphone Speech-To-Text phonetic glitches!
- When a candidate says "HTML is used for..." or "HDM stand for Hypertext Markup Language", recognize that they are explaining HTML accurately and evaluate their true conceptual understanding and technical definitions.
- Judge them on what they intended and explained, NOT on microphone transcription artifacts.

QUESTION ASKED: "${question}"
CANDIDATE'S SPOKEN ANSWER: "${cleanedAnswer}"
SPEAKING TIME: ${speakingTime} seconds
ROLE / DOMAIN: ${role}
DIFFICULTY: ${difficulty}

EVALUATION RUBRIC:
1. TECHNICAL CORE: Did they answer accurately? What concepts did they cover vs omit?
2. VOCAL ARTICULATION & DELIVERY: How was their verbal clarity, tone, pronunciation, and structure?
3. MISTAKES & SEVERITY (कहाँ गलती हुई): Be specific about technical gaps or missing definitions with severity tags [HIGH IMPACT] or [MEDIUM IMPACT].
4. CORPORATE BENCHMARK: What do technical recruiters from companies like TCS, Infosys, and top tech companies expect for this exact question?
5. IDEAL ANSWER (bolna kya hai): Exactly 2-3 very simple, conversational spoken English sentences that directly answer the question. Avoid convoluted jargon or complicated phrases. It should be written so naturally that any fresher can speak it aloud smoothly and confidently in 15-20 seconds.

ALL NUMERICAL SCORES MUST BE 0-100 (e.g. 82, 78, 90).

Return ONLY valid JSON matching this schema:
{
  "score": 82,
  "technicalAccuracy": 80,
  "clarity": 85,
  "confidence": 84,
  "communication": 85,
  "verdict": "Strong Hire | Recommended | Borderline | Needs Polish",
  "executiveSummary": "1-sentence executive recruiter summary of their response.",
  "keyTermsCovered": ["Term 1", "Term 2"],
  "missingIndustryKeywords": ["Missing Keyword 1", "Missing Keyword 2"],
  "communicationCheck": {
    "clarityScore": 85,
    "speakingPace": "Optimal Cadence (110-140 WPM)",
    "toneAndDelivery": "Calm, Professional & Audible",
    "howYouSpoke": "2-3 sentences evaluating how the candidate spoke: articulation, sentence formation, voice modulation, and presence.",
    "grammarAndVocab": "1-2 sentences assessing technical vocabulary usage and grammatical fluency.",
    "communicationTips": [
      "Concrete actionable tip 1 for corporate interview delivery",
      "Concrete actionable tip 2 to project more executive presence and clarity"
    ]
  },
  "feedback": "2-3 sentences summarizing their technical clarity and strengths.",
  "mistakes": [
    "[HIGH IMPACT] Specific technical omission or flaw",
    "[MEDIUM IMPACT] Specific conceptual or delivery gap"
  ],
  "corrections": [
    "Step-by-step fix 1 to address the high impact mistake",
    "Step-by-step fix 2 to elevate the response"
  ],
  "realWorldCompanyTip": "What company placement panels (TCS/Infosys/Product Startups) specifically listen for in this question.",
  "idealAnswer": "A crystal-clear, super simple 2-3 sentence spoken answer in conversational English so the candidate knows exactly what to say out loud.",
  "strengths": [
    "Strong point 1",
    "Strong point 2"
  ],
  "improvements": [
    "Priority improvement 1",
    "Priority improvement 2"
  ]
}
`;

    let result = null;

    try {
      const responseText = await callGemini({
        prompt,
        temperature: 0.7,
        isJson: true,
      });
      result = parseAIResponse(responseText);
    } catch (aiErr) {
      console.warn("AI evaluation call note:", aiErr.message);
    }

    const clampScore = (value) => {
      let number = Number(value);
      if (Number.isNaN(number)) return 50;
      // If AI returns a score out of 10 (e.g. 8 or 8.5), scale it to percentage (80 or 85)
      if (number > 0 && number <= 10) {
        number = number * 10;
      }
      return Math.min(100, Math.max(0, Math.round(number)));
    };

    if (!result) {
      // Fallback evaluation if AI service timed out
      const wordCount = answer.trim().split(/\s+/).length;
      const baseScore = wordCount > 25 ? 75 : wordCount > 10 ? 55 : 30;

      result = {
        score: baseScore,
        technicalAccuracy: baseScore - 5,
        clarity: baseScore,
        confidence: baseScore + 5,
        communication: baseScore,
        verdict: baseScore >= 70 ? "Recommended" : "Needs Polish",
        executiveSummary: "Candidate responded directly to the question with basic clarity.",
        keyTermsCovered: ["Fundamental Concept", "Core Explanation"],
        missingIndustryKeywords: ["Production Trade-offs", "Edge Cases"],
        communicationCheck: {
          clarityScore: baseScore,
          speakingPace: speakingTime > 0 && wordCount / (speakingTime / 60) > 160 ? "Rapid Delivery" : "Optimal Cadence (110-140 WPM)",
          toneAndDelivery: "Audible & Steady",
          howYouSpoke: "You communicated your ideas clearly. Your voice was audible and sentence structure was easy to follow.",
          grammarAndVocab: "Good conversational grammar with clear foundational terminology.",
          communicationTips: [
            "Maintain a steady pace and pause naturally after key points.",
            "Speak with more energy to show enthusiasm."
          ]
        },
        feedback: "Your response addressed the question, but could be enhanced with more technical depth and structured examples.",
        mistakes: [
          "[MEDIUM IMPACT] Answer could include more specific technical terminology.",
          "[SUGGESTION] Explanation was slightly brief; could benefit from mentioning a small example.",
        ],
        corrections: [
          "Define the concept briefly, state its main benefit, and give a short example.",
        ],
        idealAnswer: `In simple words, ${question ? question.replace(/[?"']/g, "").trim() : "this concept"} is a core building block that keeps code modular and maintainable. For example, it allows developers to build independent, reusable parts of an application. Using it makes software easier to understand and debug.`,
        strengths: ["Clear spoken articulation", "Attempted to cover the core topic"],
        improvements: ["Add concrete technical depth", "Elaborate on real-world application"],
      };
    }

    // Precise filler word scanner
    const candidateLower = ` ${answer.toLowerCase()} `;
    const fillerPatterns = [
      { word: "um", regex: /\bum+\b/g },
      { word: "uh", regex: /\buh+\b/g },
      { word: "like", regex: /\blike\b/g },
      { word: "actually", regex: /\bactually\b/g },
      { word: "basically", regex: /\bbasically\b/g },
      { word: "you know", regex: /\byou know\b/g },
      { word: "literally", regex: /\bliterally\b/g },
      { word: "sort of", regex: /\bsort of\b/g },
      { word: "i mean", regex: /\bi mean\b/g },
    ];

    let totalFillerCount = 0;
    const detectedFillers = [];
    fillerPatterns.forEach(({ word, regex }) => {
      const matches = candidateLower.match(regex);
      if (matches && matches.length > 0) {
        totalFillerCount += matches.length;
        detectedFillers.push({ word, count: matches.length });
      }
    });

    const fillerImpact = totalFillerCount === 0
      ? "Clean Speech (Zero Fillers Detected) 🌟"
      : totalFillerCount <= 2
      ? `Minimal Fillers (${totalFillerCount} detected)`
      : `Elevated Fillers (${totalFillerCount} detected - Needs Polish)`;

    // Calculate words per minute
    const words = answer.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(speakingTime / 60, 0.1);
    const wpm = Math.round(words / minutes);

    let paceLabel = "Optimal Cadence (110-140 WPM)";
    if (wpm > 155) paceLabel = `Rapid Delivery (${wpm} WPM - Slow down slightly)`;
    else if (wpm < 85) paceLabel = `Deliberate / Hesitant (${wpm} WPM - Increase momentum)`;
    else paceLabel = `Optimal Cadence (${wpm} WPM - Natural & Clear)`;

    if (!result.communicationCheck) {
      result.communicationCheck = {
        clarityScore: clampScore(result.communication || 80),
        speakingPace: paceLabel,
        toneAndDelivery: "Audible & Steady",
        howYouSpoke: "Spoke clearly with decent volume and understandable pronunciation.",
        grammarAndVocab: "Conversational grammar with standard technical terms.",
        communicationTips: [
          "Practice answering without hesitation.",
          "Structure your response with clear beginning and conclusion."
        ]
      };
    }

    result.communicationCheck.wordsPerMinute = wpm;
    result.communicationCheck.wordsSpoken = words;
    result.communicationCheck.totalFillerCount = totalFillerCount;
    result.communicationCheck.detectedFillers = detectedFillers;
    result.communicationCheck.fillerImpact = fillerImpact;
    result.communicationCheck.speakingPace = paceLabel;

    result.score = clampScore(result.score);
    result.technicalAccuracy = clampScore(result.technicalAccuracy);
    result.clarity = clampScore(result.clarity);
    result.confidence = clampScore(result.confidence);
    result.communication = clampScore(result.communication);
    if (result.communicationCheck) {
      result.communicationCheck.clarityScore = clampScore(
        result.communicationCheck.clarityScore || result.clarity || 80
      );
    }

    if (!Array.isArray(result.keyTermsCovered) || result.keyTermsCovered.length === 0) {
      result.keyTermsCovered = ["Core Concept", "Basic Principle"];
    }
    if (!Array.isArray(result.missingIndustryKeywords) || result.missingIndustryKeywords.length === 0) {
      result.missingIndustryKeywords = ["Industry Standard Term", "Practical Implementation"];
    }

    // Safety guardrail: Remove any false STT phonetic misinterpretation mistakes
    if (Array.isArray(result.mistakes)) {
      result.mistakes = result.mistakes.filter(
        (m) => !/mispronounced.*(hdm|acronym|pronounc)/i.test(m)
      );
    }

    if (!Array.isArray(result.mistakes) || result.mistakes.length === 0) {
      result.mistakes = [
        "[MEDIUM IMPACT] Could give a more direct definition rather than a high-level summary.",
        "[SUGGESTION] Could highlight practical use in simple terms.",
      ];
    }

    result.cleanedAnswer = cleanedAnswer;

    if (!Array.isArray(result.corrections)) {
      result.corrections = [
        "State the core definition clearly, followed by why it is used.",
      ];
    }

    if (!Array.isArray(result.strengths)) result.strengths = [];
    if (!Array.isArray(result.improvements)) result.improvements = [];

    // Add camera presence metrics if available
    result.cameraMetrics = {
      eyeContactPercent: cameraMetrics.eyeContactPercent || 85,
      postureComposure: cameraMetrics.postureComposure || "Good & Centered",
      confidenceIndicator: cameraMetrics.confidenceIndicator || "Confident",
    };

    console.log("Evaluation Score:", result.score);
    console.log("Mistakes Found:", result.mistakes.length);
    console.log("Time Taken:", ((Date.now() - startTime) / 1000).toFixed(2), "s");
    console.log("================================\n");

    res.json(result);
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    res.status(503).json({
      message: "AI evaluation service is temporarily busy. Please try again.",
    });
  }
});

// =====================================================
// START SERVER
// =====================================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});