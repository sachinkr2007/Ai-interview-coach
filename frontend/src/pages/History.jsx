import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./History.css";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterDomain, setFilterDomain] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [speakingKey, setSpeakingKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    loadHistory();
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (text, key) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingKey === key) {
      window.speechSynthesis.cancel();
      setSpeakingKey(null);
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);
    setSpeakingKey(key);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const loadHistory = () => {
    try {
      const data = JSON.parse(localStorage.getItem("interviewHistory") || "[]");
      setHistory(data);
    } catch (err) {
      console.error("Failed to load interview history:", err);
      setHistory([]);
    }
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this interview record?")) {
      const updated = history.filter((item) => item.id !== id);
      setHistory(updated);
      localStorage.setItem("interviewHistory", JSON.stringify(updated));
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all interview history? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem("interviewHistory");
      setSelectedSession(null);
    }
  };

  const handleRetake = (session) => {
    navigate("/interview", {
      state: {
        interviewData: {
          mode: session.mode || "domain",
          role: session.role || "Frontend Developer",
          type: session.type || "Technical",
          difficulty: session.difficulty || "Medium",
          questions: session.answers?.length || 5,
          companyStyle: session.companyStyle || null,
          enableCamera: session.cameraEnabled !== false,
        },
      },
    });
  };

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchDomain = filterDomain === "All" || item.role === filterDomain;
    const matchDiff = filterDifficulty === "All" || item.difficulty === filterDifficulty;
    return matchDomain && matchDiff;
  });

  // Unique domains in history for filter
  const uniqueDomains = ["All", ...new Set(history.map((h) => h.role).filter(Boolean))];

  // Stats calculation
  const totalInterviews = history.length;
  const allScores = history.flatMap((h) =>
    (h.answers || []).map((a) => a.evaluation?.score).filter((s) => typeof s === "number")
  );
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const totalQuestionsAnswered = history.reduce((sum, h) => sum + (h.answers?.length || 0), 0);

  // Find top domain
  const domainCounts = {};
  history.forEach((h) => {
    domainCounts[h.role] = (domainCounts[h.role] || 0) + 1;
  });
  const topDomain = Object.keys(domainCounts).sort((a, b) => domainCounts[b] - domainCounts[a])[0] || "None";

  return (
    <div className="history-page">
      {/* HEADER */}
      <div className="history-header">
        <div>
          <p className="history-tag">PERFORMANCE TRACKER</p>
          <h1>Your Interview History</h1>
          <p className="history-subtitle">
            Review past voice & camera interviews, track your progress, and analyze where mistakes occurred.
          </p>
        </div>

        <div className="history-header-actions">
          {history.length > 0 && (
            <button className="clear-btn" onClick={handleClearAll} title="Clear all past interview records">
              🗑️ Clear All
            </button>
          )}
          <Link to="/setup">
            <button className="new-practice-btn">Start New Practice →</button>
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="history-stats-grid">
        <div className="stat-box">
          <div className="stat-icon">📊</div>
          <div>
            <h3>{totalInterviews}</h3>
            <p>Total Interviews</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🎯</div>
          <div>
            <h3>{avgScore}%</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">💬</div>
          <div>
            <h3>{totalQuestionsAnswered}</h3>
            <p>Questions Spoken</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🏆</div>
          <div>
            <h3>{topDomain}</h3>
            <p>Top Practiced Area</p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      {history.length > 0 && (
        <div className="history-filters">
          <div className="filter-group">
            <label>Filter by Domain:</label>
            <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Difficulty:</label>
            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <span className="results-count">
            Showing {filteredHistory.length} of {history.length} records
          </span>
        </div>
      )}

      {/* HISTORY LIST */}
      {history.length === 0 ? (
        <div className="history-empty">
          <div className="empty-icon">🎙️</div>
          <h2>No Interview History Yet</h2>
          <p>
            You haven't practiced any interviews yet. Start your first AI mock interview with camera & resume analysis to see detailed scores,
            mistakes breakdown, and model answers here!
          </p>
          <Link to="/setup">
            <button className="primary-btn">Practice Your First Interview →</button>
          </Link>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="history-empty">
          <h2>No matching interviews found</h2>
          <p>Try changing your filter options above.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map((item) => {
            const sessionAvg =
              item.answers?.length > 0
                ? Math.round(
                    item.answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / item.answers.length
                  )
                : 0;

            const isExpanded = selectedSession?.id === item.id;

            return (
              <div
                key={item.id}
                className={`history-card ${isExpanded ? "expanded" : ""}`}
                onClick={() => setSelectedSession(isExpanded ? null : item)}
              >
                <div className="history-card-top">
                  <div className="card-domain-info">
                    <span className="session-icon">{item.mode === "resume" ? "📄" : "🤖"}</span>
                    <div>
                      <div className="session-title-row">
                        <h3>{item.role || "Placement Interview"}</h3>
                        {item.mode === "resume" && (
                          <span className="resume-badge-small">📄 Resume-Based</span>
                        )}
                        {item.cameraEnabled && (
                          <span className="camera-badge-small">📷 Video Proctored</span>
                        )}
                      </div>
                      <p className="session-meta">
                        📅 {item.date || "Recent"} • {item.difficulty || "Medium"} •{" "}
                        {item.answers?.length || 0} Questions
                        {item.companyStyle && ` • ${item.companyStyle}`}
                      </p>
                    </div>
                  </div>

                  <div className="card-right-group">
                    <div className="session-score-pill">
                      <span>Score</span>
                      <strong>{sessionAvg}%</strong>
                    </div>

                    <div className="session-card-buttons">
                      <button
                        className="card-retake-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetake(item);
                        }}
                        title="Practice this same interview setup again"
                      >
                        🔄 Retake
                      </button>

                      <button
                        className="card-delete-btn"
                        onClick={(e) => handleDeleteSession(item.id, e)}
                        title="Delete this interview"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="session-details-expanded" onClick={(e) => e.stopPropagation()}>
                    <h4>Detailed Question Breakdown & Mistakes ({item.answers?.length || 0} Questions)</h4>

                    <div className="answers-review-list">
                      {item.answers?.map((ans, idx) => (
                        <div key={idx} className="review-question-block">
                          <div className="review-q-header">
                            <span className="q-badge">Q{idx + 1}</span>
                            <h5>{ans.question}</h5>
                            <span className="q-score-tag">
                              Score: {ans.evaluation?.score ?? "N/A"}%
                            </span>
                          </div>

                          <div className="review-answer-transcript">
                            <strong>Your Spoken Response (आपने क्या बोला):</strong>
                            <p>{ans.answer || "No voice response recorded."}</p>
                          </div>

                          {/* 💡 WHAT YOU SHOULD SAY - SIMPLE 2-3 SENTENCE AI ANSWER */}
                          {(() => {
                            const idealAns = ans.evaluation?.idealAnswer?.trim()?.replace(/^["']|["']$/g, "") ||
                              `In simple terms, ${ans.question ? ans.question.replace(/[?"']/g, "").trim() : "this concept"} is a core building block that keeps code modular, readable, and easy to maintain. In interviews, explain its basic purpose first, then give one short practical example.`;
                            const ansKey = `${item.id || item.timestamp}-${idx}`;
                            return (
                              <div className="history-ideal-answer-card">
                                <div className="history-ideal-header">
                                  <div className="history-ideal-title">
                                    <span className="badge-icon">💡</span>
                                    <strong>What You Should Say (बोलना क्या था):</strong>
                                    <span className="simple-pill">⚡ 2–3 Simple Sentences</span>
                                  </div>
                                  <div className="history-ideal-actions">
                                    <button
                                      type="button"
                                      className={`h-speak-btn ${speakingKey === ansKey ? "playing" : ""}`}
                                      onClick={() => handleSpeak(idealAns, ansKey)}
                                      title="Listen to how to speak this answer"
                                    >
                                      {speakingKey === ansKey ? "⏹️ Stop" : "🔊 Listen"}
                                    </button>
                                    <button
                                      type="button"
                                      className={`h-copy-btn ${copiedKey === ansKey ? "copied" : ""}`}
                                      onClick={() => handleCopy(idealAns, ansKey)}
                                      title="Copy answer"
                                    >
                                      {copiedKey === ansKey ? "✓ Copied!" : "📋 Copy"}
                                    </button>
                                  </div>
                                </div>
                                <p className="history-ideal-text">"{idealAns}"</p>
                              </div>
                            );
                          })()}

                          {ans.evaluation && (
                            <div className="review-eval-box">
                              <p className="feedback-text">
                                💡 <strong>AI Feedback:</strong> {ans.evaluation.feedback}
                              </p>

                              {/* MISTAKES IDENTIFIED */}
                              {ans.evaluation.mistakes?.length > 0 && (
                                <div className="history-mistakes-block">
                                  <strong>❌ Where Mistakes Happened (कहाँ गलती हुई):</strong>
                                  <ul>
                                    {ans.evaluation.mistakes.map((m, mi) => (
                                      <li key={mi}>{m}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {ans.evaluation.corrections?.length > 0 && (
                                <div className="history-corrections-block">
                                  <strong>🛠️ Correction:</strong>
                                  <ul>
                                    {ans.evaluation.corrections.map((c, ci) => (
                                      <li key={ci}>{c}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
