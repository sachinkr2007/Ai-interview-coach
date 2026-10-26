import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (text, idx) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text, idx) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const answers = location.state?.answers || [];
  const cameraActive = location.state?.cameraActive !== false;

  const interviewData = location.state?.interviewData || {
    mode: "resume",
    role: "Candidate",
    type: "Company Placement Round",
    difficulty: "Medium",
  };

  const isResumeMode = interviewData.mode === "resume";
  const resumeData = interviewData.resumeData || null;
  const totalQuestions = answers.length;

  // Calculate Aggregated Real Scores from AI Evaluations
  const overallScore =
    answers.length > 0
      ? Math.round(
          answers.reduce((sum, item) => sum + (item.evaluation?.score || 0), 0) /
            answers.length
        )
      : 0;

  const technicalScore =
    answers.length > 0
      ? Math.round(
          answers.reduce(
            (sum, item) => sum + (item.evaluation?.technicalAccuracy || 0),
            0
          ) / answers.length
        )
      : 0;

  const communicationScore =
    answers.length > 0
      ? Math.round(
          answers.reduce(
            (sum, item) => sum + (item.evaluation?.communication || 0),
            0
          ) / answers.length
        )
      : 0;

  const confidenceScore =
    answers.length > 0
      ? Math.round(
          answers.reduce(
            (sum, item) => sum + (item.evaluation?.confidence || 0),
            0
          ) / answers.length
        )
      : 0;

  // Camera presence / eye contact average
  const eyeContactScore =
    answers.length > 0
      ? Math.round(
          answers.reduce(
            (sum, item) =>
              sum +
              (item.cameraMetrics?.eyeContactPercent ||
                item.evaluation?.cameraMetrics?.eyeContactPercent ||
                85),
            0
          ) / answers.length
        )
      : 85;

  // Collect all unique strengths
  const strengths = [
    ...new Set(answers.flatMap((item) => item.evaluation?.strengths || [])),
  ];

  // Collect all unique improvements
  const improvements = [
    ...new Set(answers.flatMap((item) => item.evaluation?.improvements || [])),
  ];

  // Extract communication check diagnostic from interview answers
  const firstCommCheck =
    answers.find((a) => a.evaluation?.communicationCheck)?.evaluation?.communicationCheck || {};

  // Calculate total filler words across all responses
  const totalFillers = answers.reduce((sum, item) => {
    return sum + (item.evaluation?.communicationCheck?.totalFillerCount || 0);
  }, 0);

  // Collect all critical mistakes identified across the interview
  const allMistakes = [
    ...new Set(answers.flatMap((item) => item.evaluation?.mistakes || [])),
  ];

  // Company Placement Verdict
  const getCompanyVerdict = () => {
    if (overallScore >= 80) {
      return {
        title: "STRONG HIRE 🎉",
        badgeClass: "strong-hire",
        description:
          "Outstanding performance! You showed strong conceptual clarity, direct project ownership, and articulate communication. You are well prepared for top company placement drives.",
      };
    }
    if (overallScore >= 65) {
      return {
        title: "SELECTED / RECOMMENDED 👍",
        badgeClass: "hire",
        description:
          "Good performance! You demonstrated solid foundational skills and answered most questions accurately. With minor polish on edge cases and deeper technical trade-offs, you will excel.",
      };
    }
    if (overallScore >= 45) {
      return {
        title: "BORDERLINE FIT ⚠️",
        badgeClass: "borderline",
        description:
          "Fair performance. You have basic knowledge but missed key technical specifics and structured explanations. Review the mistakes below to convert your next interview into an offer.",
      };
    }
    return {
      title: "NEEDS PREPARATION 💡",
      badgeClass: "needs-work",
      description:
        "Requires further practice. Several questions had gaps in technical terminology or lacked depth. Practice speaking model answers aloud before attending campus interviews.",
    };
  };

  const verdict = getCompanyVerdict();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="result-page">
      {/* HEADER CARD */}
      <div className="result-header-card">
        <div className="result-meta-row">
          <span className="result-tag-pill">CAMPUS PLACEMENT ASSESSMENT REPORT</span>
          <span className="date-stamp">{new Date().toLocaleDateString()}</span>
        </div>

        <div className="candidate-headline">
          <h1>
            {resumeData?.candidateName
              ? `${resumeData.candidateName}'s Interview Assessment`
              : "Company Mock Interview Evaluation"}
          </h1>
          <p className="headline-sub">
            {isResumeMode
              ? `📄 Resume-Based Placement Drive • ${interviewData.companyStyle || "Product Round"} • ${interviewData.difficulty} Level`
              : `🎯 ${interviewData.role} • ${interviewData.type} • ${interviewData.difficulty} Level`}
          </p>
        </div>

        {/* VERDICT BANNER */}
        <div className={`verdict-banner ${verdict.badgeClass}`}>
          <div className="verdict-left">
            <span className="verdict-label">CAMPUS HIRING VERDICT</span>
            <h2>{verdict.title}</h2>
            <p>{verdict.description}</p>
          </div>

          <div className="verdict-score-circle">
            <strong>{overallScore}%</strong>
            <span>Placement Score</span>
          </div>
        </div>
      </div>

      {/* MULTI-METRIC PERFORMANCE OVERVIEW */}
      <div className="metrics-summary-grid">
        <div className="metric-box">
          <div className="metric-header">
            <span>💻 Technical Knowledge</span>
            <strong>{technicalScore}%</strong>
          </div>
          <div className="metric-bar-track">
            <div className="metric-bar-fill tech" style={{ width: `${technicalScore}%` }} />
          </div>
          <p>Accuracy of answers and depth of tech concepts.</p>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span>💬 Verbal Clarity</span>
            <strong>{communicationScore}%</strong>
          </div>
          <div className="metric-bar-track">
            <div className="metric-bar-fill comm" style={{ width: `${communicationScore}%` }} />
          </div>
          <p>Structure, articulation, and pacing of delivery.</p>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span>🎯 Confidence & Demeanor</span>
            <strong>{confidenceScore}%</strong>
          </div>
          <div className="metric-bar-track">
            <div className="metric-bar-fill conf" style={{ width: `${confidenceScore}%` }} />
          </div>
          <p>Confidence reflected in tone and response flow.</p>
        </div>

        {/* CAMERA & VIDEO PROCTORING SCORE */}
        <div className="metric-box video-metric-box">
          <div className="metric-header">
            <span>🎥 Video Presence & Eye Contact</span>
            <strong>{cameraActive ? `${eyeContactScore}%` : "Audio Mode"}</strong>
          </div>
          <div className="metric-bar-track">
            <div
              className="metric-bar-fill video"
              style={{ width: `${cameraActive ? eyeContactScore : 75}%` }}
            />
          </div>
          <p>
            {cameraActive
              ? "Steady camera eye contact and composed posture throughout."
              : "Audio-only session. Enable camera for video evaluation."}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🎙️ DEDICATED SPOKEN COMMUNICATION & DELIVERY ANALYSIS     */}
      {/* ========================================================= */}
      <section className="comm-results-section">
        <div className="section-header-block">
          <div className="section-badge blue">
            <span>🎙️ COMMUNICATION & SPOKEN ENGLISH CHECK</span>
          </div>
          <h2>Communication Analysis (बोलने का तरीका और सुधार)</h2>
          <p>
            Detailed analysis of how fluently, clearly, and confidently you spoke your verbal responses during this mock interview.
          </p>
        </div>

        <div className="comm-results-card executive-report-card">
          <div className="comm-results-top-grid executive-stats-grid">
            <div className="comm-result-stat">
              <span>Speech Clarity & Fluency</span>
              <strong className="text-emerald">{communicationScore}%</strong>
              <p>Articulation & vocabulary clarity</p>
            </div>

            <div className="comm-result-stat">
              <span>Speaking Speed / Pacing</span>
              <strong className="text-blue">
                {firstCommCheck.wordsPerMinute
                  ? `${firstCommCheck.wordsPerMinute} WPM`
                  : "115 WPM"}
              </strong>
              <p>{firstCommCheck.speakingPace || "Optimal Cadence (110-140 WPM)"}</p>
            </div>

            <div className="comm-result-stat">
              <span>Filler Word Control</span>
              <strong className="text-purple">
                {totalFillers === 0 ? "0 Fillers" : `${totalFillers} Fillers`}
              </strong>
              <p>{totalFillers === 0 ? "Clean Speech (0 Fillers) 🌟" : "Minimal filler occurrences"}</p>
            </div>

            <div className="comm-result-stat">
              <span>Non-Verbal Demeanor</span>
              <strong className="text-indigo">{eyeContactScore}% Focus</strong>
              <p>Steady eye contact and calm posture</p>
            </div>
          </div>

          <div className="comm-results-feedback">
            <div className="comm-feedback-title">
              <span>💬</span>
              <h4>How You Spoke (बोलने का तरीका):</h4>
            </div>
            <p>
              {firstCommCheck.howYouSpoke ||
                "You articulated your thoughts clearly and maintained a calm, steady conversational tone. Your sentence structure conveyed the essential ideas."}
            </p>
            {firstCommCheck.grammarAndVocab && (
              <p className="comm-grammar-note">
                <strong>Grammar & Fluency:</strong> {firstCommCheck.grammarAndVocab}
              </p>
            )}
          </div>

          <div className="comm-results-tips">
            <div className="comm-tips-title">
              <span>💡</span>
              <h4>Recommended Communication Improvements (बोलने में क्या सुधार चाहिए):</h4>
            </div>
            <ul>
              {(firstCommCheck.communicationTips || [
                "Structure spoken answers: start with a direct definition, then mention your project context.",
                "Take brief natural pauses between sentences instead of using filler sounds like 'um' or 'uh'."
              ]).map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ⭐ STAR SECTION: DETAILED MISTAKES ANALYSIS (कहाँ गलती हुई) */}
      {/* ========================================================= */}
      <section className="mistakes-master-section">
        <div className="section-header-block">
          <div className="section-badge red">
            <span>⚠️ CRITICAL PLACEMENT DIAGNOSTIC</span>
          </div>
          <h2>Detailed Mistakes Analysis (कहाँ गलती हुई)</h2>
          <p>
            Real-world company interviewers look for specific technical depth, project ownership,
            and structured explanations. Here is exactly where your answers fell short and how to
            answer correctly in actual company drives.
          </p>
        </div>

        <div className="mistakes-questions-list">
          {answers.map((item, index) => {
            const evalItem = item.evaluation || {};
            const itemMistakes = evalItem.mistakes || [];
            const itemCorrections = evalItem.corrections || [];
            const companyTip = evalItem.realWorldCompanyTip || "";

            const getSimpleIdealAnswer = (evalObj, questionText) => {
              if (evalObj?.idealAnswer && evalObj.idealAnswer.trim().length > 10) {
                return evalObj.idealAnswer.trim().replace(/^["']|["']$/g, "");
              }
              const cleanQ = questionText ? questionText.replace(/[?"']/g, "").trim() : "this concept";
              return `In simple words, ${cleanQ} is a core foundation designed to make code clean, reusable, and easy to maintain. In practical terms, it allows developers to build independent modules that easily scale without introducing bugs.`;
            };

            const idealAnswer = getSimpleIdealAnswer(evalItem, item.question);

            return (
              <div key={index} className="question-analysis-card">
                {/* QUESTION TOP BAR */}
                <div className="q-card-top">
                  <div className="q-number-pill">
                    Question 0{index + 1}
                  </div>
                  <div className="q-scores-pills">
                    <span className="q-score-pill">
                      Score: <strong>{evalItem.score || 0}%</strong>
                    </span>
                    <span className="q-verdict-pill">
                      {evalItem.verdict || (evalItem.score >= 60 ? "Pass" : "Needs Polish")}
                    </span>
                    <span className="q-time-pill">
                      ⏱️ {item.speakingTime || 0}s spoken
                    </span>
                  </div>
                </div>

                {/* QUESTION ASKED */}
                <h3 className="question-text">
                  "{item.question}"
                </h3>

                {/* CANDIDATE'S SPOKEN ANSWER */}
                <div className="candidate-spoken-block">
                  <span className="block-label">Your Spoken Answer (आपने क्या बोला):</span>
                  <p className="spoken-text">
                    {item.answer ? `"${item.answer}"` : "No answer provided."}
                  </p>
                </div>

                {/* 💡 WHAT YOU SHOULD SAY - SIMPLE 2-3 SENTENCE AI ANSWER (बोलना क्या था) */}
                <div className="ai-spoken-ideal-card">
                  <div className="ai-spoken-header-row">
                    <div className="ai-spoken-title-group">
                      <div className="ai-spoken-badge">
                        <span className="ai-sparkle-icon">💡</span>
                        <strong>What You Should Say (बोलना क्या था):</strong>
                      </div>
                      <span className="ai-spoken-simple-pill">
                        ⚡ 2–3 Simple Sentences
                      </span>
                    </div>

                    <div className="ai-spoken-action-btns">
                      <button
                        type="button"
                        className={`ai-speak-btn ${speakingIdx === index ? "playing" : ""}`}
                        onClick={() => handleSpeak(idealAnswer, index)}
                        title="Listen to how to pronounce & speak this response"
                      >
                        {speakingIdx === index ? "⏹️ Stop" : "🔊 Listen (सुनें)"}
                      </button>
                      <button
                        type="button"
                        className={`ai-copy-btn ${copiedIdx === index ? "copied" : ""}`}
                        onClick={() => handleCopy(idealAnswer, index)}
                        title="Copy simple answer to clipboard"
                      >
                        {copiedIdx === index ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="ai-spoken-body-box">
                    <p className="ai-spoken-ideal-text">
                      "{idealAnswer}"
                    </p>
                  </div>

                  <div className="ai-spoken-footer-note">
                    <span className="ai-tip-icon">🗣️</span>
                    <span>
                      <strong>Interview Speaking Tip:</strong> Is answer ko simple English me calmly 15–20 seconds me bolein. Concept directly clear hoga aur interview panel impress hoga!
                    </span>
                  </div>
                </div>

                {/* 🏷️ TECHNICAL KEYWORDS ANALYSIS */}
                <div className="keywords-analysis-row">
                  <div className="kw-group covered">
                    <span className="kw-label">✓ Key Terms Covered:</span>
                    <div className="kw-tags">
                      {(evalItem.keyTermsCovered && evalItem.keyTermsCovered.length > 0
                        ? evalItem.keyTermsCovered
                        : ["Core Concept", "Basic Definition"]
                      ).map((kw, kIdx) => (
                        <span key={kIdx} className="kw-tag covered-tag">{kw}</span>
                      ))}
                    </div>
                  </div>

                  <div className="kw-group missing">
                    <span className="kw-label">⚠️ Missing Industry Terms:</span>
                    <div className="kw-tags">
                      {(evalItem.missingIndustryKeywords && evalItem.missingIndustryKeywords.length > 0
                        ? evalItem.missingIndustryKeywords
                        : ["Production Context", "Technical Depth"]
                      ).map((kw, kIdx) => (
                        <span key={kIdx} className="kw-tag missing-tag">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ❌ WHERE MISTAKES HAPPENED (कहाँ गलती हुई) */}
                <div className="mistakes-callout-box">
                  <div className="box-title-row red">
                    <span className="box-icon">❌</span>
                    <h4>Where You Made Mistakes & What Was Missing (कहाँ गलती हुई):</h4>
                  </div>
                  {itemMistakes.length > 0 ? (
                    <ul className="mistakes-list">
                      {itemMistakes.map((mistake, mIdx) => (
                        <li key={mIdx}>
                          <strong>Gap #{mIdx + 1}:</strong> {mistake}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="clean-note">
                      ✓ No major conceptual errors detected. Good foundational explanation!
                    </p>
                  )}
                </div>

                {/* 🛠️ STEP-BY-STEP CORRECTIONS */}
                {itemCorrections.length > 0 && (
                  <div className="corrections-callout-box">
                    <div className="box-title-row green">
                      <span className="box-icon">🛠️</span>
                      <h4>How to Correct These Mistakes (सही करने का तरीका):</h4>
                    </div>
                    <ul className="corrections-list">
                      {itemCorrections.map((corr, cIdx) => (
                        <li key={cIdx}>{corr}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 💼 WHAT COMPANY INTERVIEWERS EXPECT */}
                {companyTip && (
                  <div className="company-expectation-box">
                    <div className="box-title-row blue">
                      <span className="box-icon">🏢</span>
                      <h4>What Top Company Interviewers Expect (कंपनी इंटरव्यू की वास्तविक अपेक्षा):</h4>
                    </div>
                    <p>{companyTip}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* TOP MISTAKES SUMMARY BOX */}
      {allMistakes.length > 0 && (
        <div className="top-mistakes-action-card">
          <div className="action-card-header">
            <span className="action-icon">🎯</span>
            <div>
              <h3>Top 3 Mistakes to Eliminate Before Your Next Placement Drive</h3>
              <p>Master these core adjustments to boost your selection odds significantly:</p>
            </div>
          </div>
          <ol className="action-items-list">
            {allMistakes.slice(0, 3).map((m, idx) => (
              <li key={idx}>
                <strong>Focus Area {idx + 1}:</strong> {m}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* STRENGTHS & IMPROVEMENTS DUAL GRID */}
      <div className="strengths-improvements-grid">
        <div className="feedback-column strengths">
          <div className="col-header">
            <span>✅</span>
            <h3>Key Strengths Observed</h3>
          </div>
          <ul>
            {strengths.length > 0 ? (
              strengths.slice(0, 5).map((s, idx) => <li key={idx}>{s}</li>)
            ) : (
              <li>Solid effort attempting all interview questions verbally.</li>
            )}
          </ul>
        </div>

        <div className="feedback-column improvements">
          <div className="col-header">
            <span>⚡</span>
            <h3>Recommended High-Priority Growth Areas</h3>
          </div>
          <ul>
            {improvements.length > 0 ? (
              improvements.slice(0, 5).map((imp, idx) => <li key={idx}>{imp}</li>)
            ) : (
              <li>Practice speaking complete project architectures with the STAR method.</li>
            )}
          </ul>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="result-footer-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/setup")}
        >
          🔄 Practice Another Round →
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={handlePrint}
        >
          🖨️ Save / Print Assessment
        </button>

        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/history")}
        >
          📊 View Performance History
        </button>

        <button
          type="button"
          className="btn-text"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Result;