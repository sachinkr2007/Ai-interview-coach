import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewSetup.css";

const SAMPLE_FRESHER_RESUME = `
Candidate Name: Sachin Sharma
Email: sachin.sharma@example.com | Phone: +91 98765 43210
Education: B.Tech in Computer Science & Engineering (2022 - 2026), GPA: 8.4/10

TECHNICAL SKILLS:
- Languages: JavaScript (ES6+), Python, SQL, HTML5, CSS3
- Frameworks & Libraries: React.js, Node.js, Express.js, Tailwind CSS
- Databases: MongoDB, MySQL
- Developer Tools: Git, GitHub, Postman, VS Code, Vite

PROJECTS:
1. AI Interview Coach (React, Node.js, Express, Gemini API)
- Developed an interactive AI mock interview platform featuring real-time speech recognition and video proctoring.
- Implemented campus-calibrated question generation and instant feedback scoring with model answers.
- Integrated camera monitoring for candidate eye contact and confidence tracking.

2. Campus Placement Management System (React, MongoDB, Express)
- Built a role-based portal for students and TPO coordinators to manage job applications and drive schedules.
- Designed REST APIs with JWT authentication, protecting student sensitive records and resume links.
- Decreased manual verification time by 40% with automated eligibility checks.

COURSEWORK & INTERESTS:
- Data Structures & Algorithms, Object-Oriented Programming (OOPs), Database Management Systems (DBMS), Web Development.
`.trim();

function InterviewSetup() {
  const navigate = useNavigate();

  // Mode: "resume" or "domain"
  const [activeTab, setActiveTab] = useState("resume");

  // Domain Mode States
  const [role, setRole] = useState("Frontend Developer");
  const [type, setType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questions, setQuestions] = useState("5");

  // Resume Mode States
  const [resumeText, setResumeText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [companyStyle, setCompanyStyle] = useState("Campus Placement Round");
  const [enableCamera, setEnableCamera] = useState(true);
  const [cameraPreviewActive, setCameraPreviewActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("interviewCoachUser") || "null"
      );
      if (savedUser?.targetRole) {
        setRole(savedUser.targetRole);
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      stopCameraPreview();
    };
  }, []);

  // Stop camera preview
  const stopCameraPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraPreviewActive(false);
  };

  // Toggle Camera Test
  const toggleCameraPreview = async () => {
    if (cameraPreviewActive) {
      stopCameraPreview();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPreviewActive(true);
      setCameraPermissionGranted(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraPermissionGranted(false);
      alert(
        "Could not access camera/microphone. Please ensure camera permissions are allowed in your browser settings."
      );
    }
  };

  // Handle File Upload (.pdf, .txt, .docx)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError("");
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("resumeFile", file);

      const response = await fetch("http://localhost:5000/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to parse resume file");
      }

      setParsedData(data.resumeData);
    } catch (err) {
      console.error("Resume upload error:", err);
      setParseError(err.message || "Failed to process resume file. You can paste the text manually.");
    } finally {
      setIsParsing(false);
    }
  };

  // Parse Text Directly
  const handleParseText = async (textToParse = resumeText) => {
    if (!textToParse.trim()) {
      setParseError("Please paste your resume text or load the sample resume.");
      return;
    }

    setParseError("");
    setIsParsing(true);

    try {
      const response = await fetch("http://localhost:5000/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: textToParse }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to extract resume details");
      }

      setParsedData(data.resumeData);
    } catch (err) {
      console.error("Parse text error:", err);
      setParseError(err.message || "Failed to analyze resume text.");
    } finally {
      setIsParsing(false);
    }
  };

  // Load Sample Fresher Resume for instant testing
  const handleLoadSampleResume = () => {
    setResumeText(SAMPLE_FRESHER_RESUME);
    handleParseText(SAMPLE_FRESHER_RESUME);
  };

  // Add a skill tag manually
  const handleAddSkill = (skill) => {
    if (!skill.trim() || !parsedData) return;
    if (parsedData.skills.includes(skill.trim())) return;
    setParsedData({
      ...parsedData,
      skills: [...parsedData.skills, skill.trim()],
    });
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      skills: parsedData.skills.filter((s) => s !== skillToRemove),
    });
  };

  // Start Interview
  const handleStartInterview = () => {
    stopCameraPreview();

    if (activeTab === "resume") {
      if (!parsedData) {
        alert("Please upload or extract your resume first so the AI can craft company-specific questions.");
        return;
      }

      navigate("/interview", {
        state: {
          interviewData: {
            mode: "resume",
            role: parsedData.skills?.[0] ? `${parsedData.skills[0]} Developer` : "Software Engineer",
            type: "Real-World Company Placement Round",
            difficulty,
            questions: Number(questions),
            companyStyle,
            resumeData: parsedData,
            enableCamera,
          },
        },
      });
    } else {
      navigate("/interview", {
        state: {
          interviewData: {
            mode: "domain",
            role,
            type,
            difficulty,
            questions: Number(questions),
            enableCamera,
          },
        },
      });
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        {/* HEADER */}
        <div className="setup-header">
          <div className="setup-badge">
            <span>🎓 CAMPUS PLACEMENT & COMPANY INTERVIEW SIMULATOR</span>
          </div>
          <h1>Configure Your Mock Interview</h1>
          <p>
            Experience realistic hiring rounds with camera video proctoring, AI presence tracking,
            and questions calibrated directly from your resume.
          </p>
        </div>

        {/* TAB TOGGLE: RESUME VS DOMAIN */}
        <div className="setup-tab-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === "resume" ? "active" : ""}`}
            onClick={() => setActiveTab("resume")}
          >
            <span className="tab-icon">📄</span>
            <span className="tab-label">Resume-Based Company Round</span>
            <span className="tab-badge">Recommended</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "domain" ? "active" : ""}`}
            onClick={() => setActiveTab("domain")}
          >
            <span className="tab-icon">🎯</span>
            <span className="tab-label">Domain Topic Practice</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: RESUME-BASED INTERVIEW */}
        {/* ========================================================= */}
        {activeTab === "resume" && (
          <div className="setup-content-card">
            <div className="card-top-alert">
              <span className="alert-icon">✨</span>
              <p>
                <strong>Real-World Company Flow:</strong> The AI will ask a tailored icebreaker intro,
                deep-dive into your listed projects, test your core resume skills, and analyze where mistakes happen.
              </p>
            </div>

            {/* RESUME INPUT SECTION */}
            {!parsedData ? (
              <div className="resume-input-section">
                <div className="resume-upload-box">
                  <div className="upload-header">
                    <h3>1. Provide Your Resume</h3>
                    <button
                      type="button"
                      className="sample-resume-btn"
                      onClick={handleLoadSampleResume}
                    >
                      ⚡ Quick Test: Load Sample Fresher Resume
                    </button>
                  </div>

                  {/* DROPZONE / FILE SELECT */}
                  <div
                    className="file-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept=".pdf,.txt,.docx"
                      onChange={handleFileUpload}
                    />
                    <div className="dropzone-icon">📁</div>
                    <h4>Click to Upload Resume PDF or Text File</h4>
                    <p>Supports .PDF, .TXT (Max 10MB)</p>
                  </div>

                  <div className="or-divider">
                    <span>OR PASTE RESUME TEXT DIRECTLY</span>
                  </div>

                  {/* TEXT AREA */}
                  <textarea
                    className="resume-textarea"
                    rows="6"
                    placeholder="Paste your resume content, skills, projects, and education here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />

                  {parseError && (
                    <div className="setup-error-msg">⚠️ {parseError}</div>
                  )}

                  <button
                    type="button"
                    className="parse-btn"
                    onClick={() => handleParseText()}
                    disabled={isParsing || !resumeText.trim()}
                  >
                    {isParsing ? (
                      <span>🔄 AI is analyzing your resume & projects...</span>
                    ) : (
                      <span>✨ Extract & Calibrate Resume Details →</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* PARSED RESUME PREVIEW */
              <div className="parsed-resume-card">
                <div className="parsed-card-header">
                  <div>
                    <span className="success-pill">✓ Resume Analyzed by AI</span>
                    <h2>{parsedData.candidateName || "Candidate Profile"}</h2>
                    <p className="education-sub">
                      🎓 {parsedData.education || "Fresher Computer Science"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="re-upload-btn"
                    onClick={() => {
                      setParsedData(null);
                      setResumeText("");
                    }}
                  >
                    Upload Different Resume
                  </button>
                </div>

                {parsedData.summary && (
                  <p className="recruiter-summary">
                    <strong>Recruiter Note:</strong> {parsedData.summary}
                  </p>
                )}

                {/* SKILLS DETECTED */}
                <div className="resume-skills-block">
                  <label>Extracted Technical Skills for Interview:</label>
                  <div className="skills-pill-wrap">
                    {(parsedData.skills || []).map((skill, index) => (
                      <span key={index} className="skill-pill">
                        {skill}
                        <button
                          type="button"
                          className="remove-skill-btn"
                          onClick={() => handleRemoveSkill(skill)}
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* PROJECTS DETECTED */}
                <div className="resume-projects-block">
                  <label>Identified College / Personal Projects:</label>
                  <div className="projects-list">
                    {(parsedData.projects || []).map((proj, idx) => (
                      <div key={idx} className="project-item-card">
                        <div className="project-title-row">
                          <h4>
                            {idx + 1}. {proj.title}
                          </h4>
                        </div>
                        {proj.description && <p>{proj.description}</p>}
                        {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                          <div className="project-tech-tags">
                            {proj.techStack.map((tech, tIdx) => (
                              <span key={tIdx} className="tech-tag">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMPANY INTERVIEW PARAMETERS */}
            <div className="interview-config-grid">
              <div className="form-group">
                <label>Target Company Interview Format</label>
                <select
                  value={companyStyle}
                  onChange={(e) => setCompanyStyle(e.target.value)}
                >
                  <option value="Campus Placement Round">
                    🎓 Basic Campus Placement (TCS / Infosys / Wipro / Freshers - Very Basic & Friendly)
                  </option>
                  <option value="Product Tech Round">
                    🏢 Product Tech Round (Google / Microsoft / Amazon Style - In-Depth Architecture)
                  </option>
                  <option value="High-Growth Startup">
                    🚀 Fast-Paced Startup (Hands-on Implementation & Ownership)
                  </option>
                </select>
              </div>

              <div className="form-row-compact">
                <div className="form-group">
                  <label>Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">🌟 Very Basic & Easy (Beginner / Fresher Friendly)</option>
                    <option value="Medium">Medium (Standard Placement Level)</option>
                    <option value="Hard">Hard (In-Depth Problem Solving)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Questions Count</label>
                  <select
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                  >
                    <option value="5">5 Questions (Intro + 2 Projects + 2 Skills)</option>
                    <option value="6">6 Questions (Full Placement Round with Behavioral)</option>
                    <option value="8">8 Questions (Deep Comprehensive Mock)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DOMAIN-BASED PRACTICE */}
        {/* ========================================================= */}
        {activeTab === "domain" && (
          <div className="setup-content-card">
            <div className="form-group">
              <label>Target Technical Role / Domain</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Frontend Developer">Frontend Developer (HTML/CSS/JS/React)</option>
                <option value="Backend Developer">Backend Developer (APIs/Databases/Node)</option>
                <option value="Full Stack Developer">Full Stack Developer (MERN / Full Web)</option>
                <option value="Python Developer">Python Developer (Core Python / OOPs)</option>
                <option value="Java Developer">Java Developer (Core Java / Spring)</option>
                <option value="C++ Developer">C++ Developer (Data Structures / OOPs)</option>
                <option value="Data Analyst">Data Analyst (SQL / Excel / Python)</option>
                <option value="AI/ML Engineer">AI/ML Engineer (ML Basics / Algorithms)</option>
                <option value="DevOps Engineer">DevOps Engineer (Git / Docker / Linux)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Round Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Technical">Technical Round (Core Domain Concepts)</option>
                <option value="HR">HR / Behavioral Round (Campus Fitment & Soft Skills)</option>
                <option value="Technical + HR">Technical + HR Mix (Comprehensive)</option>
                <option value="Project Based">Project-Based Round (College Project Discussion)</option>
              </select>
            </div>

            <div className="form-row-compact">
              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">🌟 Very Basic & Easy (Beginner / Fresher Friendly)</option>
                  <option value="Medium">Medium (Standard Campus Level)</option>
                  <option value="Hard">Hard (Moderate Problem Solving)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Number of Questions</label>
                <select
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                >
                  <option value="5">5 Questions (Quick Practice)</option>
                  <option value="10">10 Questions (Standard Mock)</option>
                  <option value="15">15 Questions (Deep Practice)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CAMERA & MIC PROCTORING PRE-CHECK CARD */}
        {/* ========================================================= */}
        <div className="camera-precheck-card">
          <div className="camera-header-row">
            <div className="camera-title-wrap">
              <span className="camera-icon">📷</span>
              <div>
                <h3>Camera & Video Proctoring Simulator</h3>
                <p>
                  Experience real video interviews just like company hiring portals (HireVue, Google Meet).
                  AI will evaluate eye-contact and non-verbal confidence.
                </p>
              </div>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={enableCamera}
                onChange={(e) => {
                  setEnableCamera(e.target.checked);
                  if (!e.target.checked) stopCameraPreview();
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {enableCamera && (
            <div className="camera-test-section">
              <div className="camera-preview-row">
                <button
                  type="button"
                  className={`test-cam-btn ${cameraPreviewActive ? "active" : ""}`}
                  onClick={toggleCameraPreview}
                >
                  {cameraPreviewActive ? "⏹️ Close Camera Preview" : "🔍 Test Webcam & Microphone Now"}
                </button>

                {cameraPermissionGranted === true && (
                  <span className="permission-status ok">✓ Camera & Mic Ready</span>
                )}
                {cameraPermissionGranted === false && (
                  <span className="permission-status error">⚠️ Permission Required</span>
                )}
              </div>

              {cameraPreviewActive && (
                <div className="webcam-preview-box">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="preview-video-stream"
                  />
                  <div className="preview-overlay-badge">
                    <span>🟢 LIVE PREVIEW READY</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* START BUTTON */}
        <div className="start-action-row">
          <button
            type="button"
            className="launch-interview-btn"
            onClick={handleStartInterview}
          >
            <span>
              {activeTab === "resume"
                ? "Start Real-World Company Video Interview →"
                : "Start Domain Practice Interview →"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup;