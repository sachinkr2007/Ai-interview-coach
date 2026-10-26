import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Result from "./pages/Result";
import Interview from "./pages/Interview";
import InterviewSetup from "./pages/InterviewSetup";
import History from "./pages/History";
import AuthModal from "./components/AuthModal";
import HowItWorksModal from "./components/HowItWorksModal";
import "./App.css";

function Navbar({ onOpenAuth, currentUser, onLogout, onOpenHowItWorks }) {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">🤖</span> AI Interview Coach
      </Link>

      <div className="nav-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>
        <Link to="/setup" className={location.pathname === "/setup" ? "active" : ""}>
          Practice
        </Link>
        <Link to="/history" className={location.pathname === "/history" ? "active" : ""}>
          History
        </Link>
        <button type="button" className="nav-link-btn" onClick={onOpenHowItWorks}>
          How It Works
        </button>
      </div>

      <div className="nav-right">
        {currentUser ? (
          <div className="user-profile-menu">
            <button
              className="user-pill-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="user-avatar">👤</span>
              <span className="user-name">{currentUser.name}</span>
              <span className="dropdown-arrow">▾</span>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown" onClick={() => setDropdownOpen(false)}>
                <div className="dropdown-user-info">
                  <strong>{currentUser.name}</strong>
                  <p>{currentUser.email}</p>
                  {currentUser.college && <span>🎓 {currentUser.college}</span>}
                </div>
                <hr />
                <Link to="/history">📊 My History</Link>
                <Link to="/setup">🎯 Quick Practice</Link>
                <hr />
                <button className="logout-btn" onClick={onLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={onOpenAuth}>
            Sign In / Register
          </button>
        )}
      </div>
    </nav>
  );
}

function Home({ onOpenHowItWorks }) {
  const [stats, setStats] = useState({ count: 0, avg: 0 });

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("interviewHistory") || "[]");
      if (history.length > 0) {
        const allScores = history.flatMap((h) =>
          (h.answers || []).map((a) => a.evaluation?.score).filter((s) => typeof s === "number")
        );
        const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
        setStats({ count: history.length, avg });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <main className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <p className="tagline">🎓 REAL-WORLD COMPANY INTERVIEWS & VIDEO PROCTORING</p>

          <h1>
            Practice Real Interviews.
            <br />
            <span>From Your Resume & Camera.</span>
          </h1>

          <p className="description">
            Experience authentic company hiring rounds with live camera proctoring and questions calibrated directly
            from your college projects & resume skills. Get detailed breakdown of where mistakes happened and model answers.
          </p>

          <div className="buttons">
            <Link to="/setup">
              <button className="primary-btn">Start Company Video Interview →</button>
            </Link>

            <button className="secondary-btn" onClick={onOpenHowItWorks}>
              How It Works
            </button>
          </div>

          {stats.count > 0 && (
            <div className="home-quick-stats">
              <span>📊 You have completed <strong>{stats.count} mock interviews</strong></span>
              <span>Avg Score: <strong>{stats.avg}%</strong></span>
              <Link to="/history" className="history-quick-link">View History →</Link>
            </div>
          )}
        </div>

        {/* HERO CARD PREVIEW */}
        <div className="hero-card">
          <div className="card-header">
            <span>📷</span>
            <div>
              <h3>AI Proctor & Interviewer</h3>
              <p>Resume Placement Round</p>
            </div>
            <span className="live-pill">● Camera Active</span>
          </div>

          <div className="question">
            <p>Question 02 • Project Deep-Dive</p>
            <h2>In your project 'AI Interview Coach', how did you implement real-time speech and video proctoring?</h2>
          </div>

          <div className="answer-box">
            <span>👁️</span>
            <p>Monitoring eye contact: 92% • Listening to spoken response...</p>
          </div>

          <div className="score-preview">
            <div>
              <span>Technical</span>
              <strong>88%</strong>
            </div>
            <div>
              <span>Mistakes Found</span>
              <strong>2 Gaps</strong>
            </div>
            <div>
              <span>Presence</span>
              <strong>High</strong>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-title-wrap">
          <span className="section-badge">FEATURES</span>
          <h2>Everything You Need to Ace Your Placement Drives</h2>
          <p>Designed specifically for engineering students and freshers preparing for on-campus and off-campus placements.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Resume-Based Questioning</h3>
            <p>Upload your resume or paste skills & projects. The AI extracts your exact background to ask in-depth project architecture & core skill questions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📷</div>
            <h3>Live Camera & Video Proctoring</h3>
            <p>Conduct mock interviews with live webcam feed, real-time eye contact tracking, posture status, and non-verbal confidence evaluation.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3>Mistakes Analysis (कहाँ गलती हुई)</h3>
            <p>Get pinpoint diagnostic showing exact conceptual gaps, missing points, what company interviewers look for, and ideal model answers.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎙️</div>
            <h3>Real-Time Voice Recognition</h3>
            <p>Speak naturally into your microphone just like in an actual technical or HR round. Speech is transcribed automatically in real-time.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔀</div>
            <h3>On-Demand Question Swapping</h3>
            <p>Easily swap any question during the interview with a fresh, randomized question calibrated to your domain or resume in one click.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Company Calibrated Formats</h3>
            <p>Select from Product Tech Rounds (Google/Amazon style), IT Campus Services (TCS/Infosys style), or Fast-Paced Startups.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <h2>Ready to Test Your Interview Skills?</h2>
        <p>Start practicing with your AI coach today and walk into your next interview with complete confidence.</p>
        <Link to="/setup">
          <button className="primary-btn cta-btn">Start Practicing Now →</button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <p>© 2026 AI Interview Coach • Built for College Students & Placement Aspirants</p>
      </footer>
    </main>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("interviewCoachUser") || "null");
      if (savedUser) setCurrentUser(savedUser);
    } catch (e) {
      console.error("User reading error:", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("interviewCoachUser");
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        />

        <Routes>
          <Route path="/" element={<Home onOpenHowItWorks={() => setIsHowItWorksOpen(true)} />} />
          <Route path="/setup" element={<InterviewSetup />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
        </Routes>

        {/* AUTH MODAL */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(user) => setCurrentUser(user)}
        />

        {/* HOW IT WORKS MODAL */}
        <HowItWorksModal
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;