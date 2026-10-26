/**
 * Normalizes speech-to-text transcripts by correcting commonly misheard
 * technical terms and acronyms, especially in Indian English accents.
 */
export function normalizeTechnicalTerms(rawText, questionText = "") {
  if (!rawText || typeof rawText !== "string") return "";

  let text = rawText;

  // 1. Core Technical Acronyms (Acoustic mishearings)
  const techMap = [
    // HTML (Often misheard as HDM, HTM, etc.)
    { regex: /\b(hdm|htm|ht\s*ml|h\s*t\s*m\s*l|htnl|hml)\b/gi, fix: "HTML" },
    // CSS (Often misheard as CFS, see ss, etc.)
    { regex: /\b(cfs|see\s*ss|c\s*s\s*s|cs\s*s)\b/gi, fix: "CSS" },
    // JavaScript / JS
    { regex: /\b(j\s*s)\b/gi, fix: "JS" },
    { regex: /\b(java\s*script)\b/gi, fix: "JavaScript" },
    { regex: /\b(type\s*script)\b/gi, fix: "TypeScript" },
    // JSON (Often misheard as Jason, J-son)
    { regex: /\b(jason|j\s*son|jay\s*son)\b/gi, fix: "JSON" },
    // SQL (Often misheard as sequel, scale, s q l)
    { regex: /\b(sq\s*l|s\s*q\s*l|sequel)\b/gi, fix: "SQL" },
    // API (Often misheard as a pie, ap i)
    { regex: /\b(a\s*p\s*i|ap\s*i|a\s+pie)\b/gi, fix: "API" },
    // DOM (Document Object Model)
    { regex: /\b(d\s*o\s*m)\b/gi, fix: "DOM" },
    // React / Redux
    { regex: /\b(riact|re\s*act)\b/gi, fix: "React" },
    { regex: /\b(red\s*x|re\s*ducks)\b/gi, fix: "Redux" },
    // Node.js
    { regex: /\b(node\s*js|node\s*j\s*s|noade)\b/gi, fix: "Node.js" },
    // Database / DBMS
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

  // 2. Question-Aware Context Correction
  if (questionText) {
    const qLower = questionText.toLowerCase();

    if (qLower.includes("html")) {
      text = text.replace(/\b(hdm|htm|htnl|hml)\b/gi, "HTML");
    }
    if (qLower.includes("css")) {
      text = text.replace(/\b(cfs|cs\s*s)\b/gi, "CSS");
    }
    if (qLower.includes("component")) {
      text = text.replace(/\b(compnent|componet|compunent)\b/gi, "component");
    }
    if (qLower.includes("variable") || qLower.includes("let") || qLower.includes("const")) {
      text = text.replace(/\blet\s*and\s*constant\b/gi, "let and const");
      text = text.replace(/\bconstant\b/gi, "const");
    }
    if (qLower.includes("database")) {
      text = text.replace(/\bdata\s*base\b/gi, "database");
    }
    if (qLower.includes("react")) {
      text = text.replace(/\b(riact|re\s*act)\b/gi, "React");
    }
  }

  return text;
}
