import { useState } from "react";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [college, setCollege] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    // Try finding registered user or fallback to standard profile
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    const userObj = existingUser || {
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      email: email,
      college: "Campus Placement Candidate",
      targetRole: "Frontend Developer",
    };

    localStorage.setItem("interviewCoachUser", JSON.stringify(userObj));
    onAuthSuccess(userObj);
    onClose();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please enter your name, email, and password.");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      college: college.trim() || "College Student",
      targetRole: targetRole,
    };

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    const updated = [...registeredUsers.filter((u) => u.email !== email), newUser];
    localStorage.setItem("registeredUsers", JSON.stringify(updated));
    localStorage.setItem("interviewCoachUser", JSON.stringify(newUser));

    onAuthSuccess(newUser);
    onClose();
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: "Sachin Kumar",
      email: "sachin@student.college.edu",
      college: "B.Tech Computer Science",
      targetRole: "Full Stack Developer",
    };

    localStorage.setItem("interviewCoachUser", JSON.stringify(demoUser));
    onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="auth-header">
          <div className="auth-icon">🎓</div>
          <h2>AI Interview Coach</h2>
          <p>Login or create an account to save your interview performance and history.</p>
        </div>

        {/* TAB SWITCHER */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            className={`auth-tab-btn ${tab === "signup" ? "active" : ""}`}
            onClick={() => {
              setTab("signup");
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {/* LOGIN FORM */}
        {tab === "login" ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign In →
            </button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Sachin Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>College / University Name</label>
              <input
                type="text"
                placeholder="e.g. National Institute of Tech"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Target Placement Domain</label>
              <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="C++ Developer">C++ Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Create Free Account →
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" className="auth-demo-btn" onClick={handleDemoLogin}>
          🚀 Instant Demo Login (1-Click)
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
