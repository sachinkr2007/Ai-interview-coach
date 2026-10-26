import "./HowItWorksModal.css";

function HowItWorksModal({ isOpen, onClose, onStartPractice }) {
  if (!isOpen) return null;

  return (
    <div className="hiw-overlay" onClick={onClose}>
      <div className="hiw-modal" onClick={(e) => e.stopPropagation()}>
        <button className="hiw-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="hiw-header">
          <span className="hiw-pill">HOW IT WORKS</span>
          <h2>4 Simple Steps to Ace Your Interviews</h2>
          <p>Practice realistic technical and HR interviews with AI feedback built for college campus placements.</p>
        </div>

        <div className="hiw-steps-grid">
          {/* STEP 1 */}
          <div className="hiw-step-card">
            <div className="step-number">1</div>
            <div className="step-icon">📄</div>
            <h3>Upload Resume or Pick Domain</h3>
            <p>Upload your resume (or load our 1-click sample fresher resume). AI extracts your projects, degree, and skills to create company-calibrated questions.</p>
          </div>

          {/* STEP 2 */}
          <div className="hiw-step-card">
            <div className="step-number">2</div>
            <div className="step-icon">📷</div>
            <h3>Live Camera Video Proctoring</h3>
            <p>Enter the real-world video room with your webcam active. AI monitors eye-contact, presence, and vocal composure just like in top company drives.</p>
          </div>

          {/* STEP 3 */}
          <div className="hiw-step-card">
            <div className="step-number">3</div>
            <div className="step-icon">🎙️</div>
            <h3>Speak Answers & Swap Questions</h3>
            <p>Listen to questions read aloud, speak naturally into your microphone, or swap any question on-demand with one click.</p>
          </div>

          {/* STEP 4 */}
          <div className="hiw-step-card">
            <div className="step-number">4</div>
            <div className="step-icon">⚠️</div>
            <h3>Mistakes Analysis (कहाँ गलती हुई)</h3>
            <p>Get a comprehensive placement report showing exact mistakes, step-by-step corrections, company expectations, and ideal model answers.</p>
          </div>
        </div>

        <div className="hiw-footer">
          <button
            className="hiw-start-btn"
            onClick={() => {
              onClose();
              if (onStartPractice) onStartPractice();
            }}
          >
            Start Practicing Now →
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksModal;
