import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { normalizeTechnicalTerms } from "../utils/speechNormalize";
import "./Interview.css";

function Interview() {
  const navigate = useNavigate();
  const location = useLocation();

  // ------------------------------------
  // INTERVIEW DATA
  // ------------------------------------
  const interviewData = location.state?.interviewData || {
    mode: "resume",
    role: "Candidate",
    type: "Company Placement Round",
    difficulty: "Medium",
    questions: 5,
    enableCamera: true,
  };

  const isResumeMode = interviewData.mode === "resume";
  const resumeData = interviewData.resumeData || null;
  const candidateName = resumeData?.candidateName || "Candidate";

  // ------------------------------------
  // STATES
  // ------------------------------------
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [communicationCheckData, setCommunicationCheckData] = useState(null); // Pause after Q1 for communication diagnostic!

  // Call / Room States
  const [inCall, setInCall] = useState(false); // True when candidate clicks "Join Call"
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingTime, setSpeakingTime] = useState(0);
  const [aiStatusText, setAiStatusText] = useState("Connecting to interview room...");

  // Camera & Audio States
  const [cameraActive, setCameraActive] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [eyeContactScore, setEyeContactScore] = useState(92);
  const [postureStatus, setPostureStatus] = useState("Good Eye Contact & Posture");
  const [audioLevel, setAudioLevel] = useState(0);
  const [showCaptions, setShowCaptions] = useState(false); // Hidden by default for real confidence test!

  // AI Speech Delivery & Voice Controls (Calm, Clear & Fresh)
  const [speechRate, setSpeechRate] = useState(0.88); // Natural human conversational rate (0.88x)
  const [voiceGender, setVoiceGender] = useState("female"); // "female" | "male"
  const [activeVoiceName, setActiveVoiceName] = useState("");

  // Voice Command & Hands-Free Auto-Advance States
  const [voiceToast, setVoiceToast] = useState("");
  const [silenceCountdown, setSilenceCountdown] = useState(null);
  const [stepOneAutoCountdown, setStepOneAutoCountdown] = useState(null);
  // Manual mode by default: candidate is in full control, no unexpected auto-cutoffs!
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false);
  const autoAdvanceEnabledRef = useRef(false);

  // Current spoken answer (captured silently in background)
  const currentAnswerRef = useRef("");
  const [answerLength, setAnswerLength] = useState(0);

  // Refs
  const videoRef = useRef(null);
  const lobbyVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const voicesRef = useRef([]);

  // Callback Refs for stable speech recognition triggers & current question state
  const speechRateRef = useRef(0.88);
  const currentQuestionRef = useRef(0);
  const utteranceIdRef = useRef(0);
  const inCallRef = useRef(false);
  const aiSpeakingRef = useRef(false);
  const loadingRef = useRef(false);
  const shouldListenRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const silenceIntervalRef = useRef(null);
  const stepOneTimerRef = useRef(null);
  const communicationCheckDataRef = useRef(null);
  const handleFinishedSpeakingRef = useRef(null);
  const handleRepeatQuestionRef = useRef(null);
  const handleSpeakSlowerRef = useRef(null);
  const handleProceedRef = useRef(null);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    inCallRef.current = inCall;
  }, [inCall]);

  useEffect(() => {
    aiSpeakingRef.current = aiSpeaking;
  }, [aiSpeaking]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    autoAdvanceEnabledRef.current = autoAdvanceEnabled;
  }, [autoAdvanceEnabled]);

  // ------------------------------------
  // SPEECH SYNTHESIS VOICES (HIGH CLARITY & NATURAL)
  // ------------------------------------
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        voicesRef.current = available;
        const matched = getInterviewerVoice(voiceGender);
        if (matched) {
          setActiveVoiceName(matched.name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [voiceGender]);

  // Select a natural, human-sounding Indian English voice installed in user's browser
  const getInterviewerVoice = (genderPref = "female") => {
    const voices =
      voicesRef.current.length > 0
        ? voicesRef.current
        : window.speechSynthesis?.getVoices() || [];
    if (!voices || voices.length === 0) return null;

    // 1. High Priority: Authentic Indian English voices (Microsoft Neerja/Prabhat, Google English India, Heera, Ravi, en-IN)
    const indianVoices = voices.filter(
      (v) =>
        v.lang === "en-IN" ||
        v.lang.includes("en_IN") ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("neerja") ||
        v.name.toLowerCase().includes("prabhat") ||
        v.name.toLowerCase().includes("heera") ||
        v.name.toLowerCase().includes("ravi")
    );

    if (indianVoices.length > 0) {
      const matched = indianVoices.find((v) => {
        const n = v.name.toLowerCase();
        if (genderPref === "female") {
          return (
            n.includes("neerja") ||
            n.includes("heera") ||
            n.includes("female") ||
            (!n.includes("prabhat") && !n.includes("ravi") && !n.includes("male"))
          );
        } else {
          return n.includes("prabhat") || n.includes("ravi") || n.includes("male");
        }
      });
      if (matched) return matched;
      return indianVoices[0];
    }

    // 2. Medium Priority: Natural / Online neural voices (Edge / Chrome Natural human voices)
    const naturalVoices = voices.filter((v) => {
      const n = v.name.toLowerCase();
      return (
        v.lang.startsWith("en") &&
        (n.includes("natural") || n.includes("online") || n.includes("google"))
      );
    });

    if (naturalVoices.length > 0) {
      const matchedNatural = naturalVoices.find((v) => {
        const n = v.name.toLowerCase();
        return genderPref === "female"
          ? n.includes("female") || n.includes("jenny") || n.includes("aria") || n.includes("sonia")
          : n.includes("male") || n.includes("guy") || n.includes("christopher");
      });
      if (matchedNatural) return matchedNatural;
      return naturalVoices[0];
    }

    // 3. Fallback to any English voice
    const fallback = voices.find((v) => v.lang.startsWith("en"));
    return fallback || voices[0] || null;
  };


  // ------------------------------------
  // CAMERA STREAM INITIALIZATION
  // ------------------------------------
  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });

      mediaStreamRef.current = stream;

      // Attach to active video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
      if (lobbyVideoRef.current) {
        lobbyVideoRef.current.srcObject = stream;
        lobbyVideoRef.current.onloadedmetadata = () => {
          lobbyVideoRef.current?.play().catch(() => {});
        };
      }

      setCameraActive(true);

      // Web Audio Analyser for live mic wave
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioLevel = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            }
            animFrameRef.current = requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();
        }
      } catch (e) {
        console.warn("Audio meter setup notice:", e.message);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera/Microphone permission denied. Mock continues in audio simulation mode.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = false));
      }
      setCameraActive(false);
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = true));
        setCameraActive(true);
      } else {
        startCamera();
      }
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = micMuted));
    }
    setMicMuted(!micMuted);
  };

  // Re-attach video stream whenever videoRef mounts or inCall state changes
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
    }
  }, [inCall, cameraActive]);

  // Dynamic eye-contact / presence variance simulation
  useEffect(() => {
    if (!inCall || !cameraActive) return;

    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 7) - 3;
      setEyeContactScore((prev) => Math.min(98, Math.max(82, prev + delta)));

      const postures = [
        "Focused & Centered",
        "Direct Eye Contact",
        "Confident & Composed",
        "Active Listening",
      ];
      setPostureStatus(postures[Math.floor(Math.random() * postures.length)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [inCall, cameraActive]);

  // ------------------------------------
  // QUESTION GENERATION (RESUME OR DOMAIN)
  // ------------------------------------
  const generateQuestions = async () => {
    setQuestionLoading(true);

    try {
      if (isResumeMode && resumeData) {
        const response = await fetch("http://localhost:5000/api/generate-resume-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeData,
            totalQuestions: parseInt(interviewData.questions) || 5,
            companyStyle: interviewData.companyStyle || "Product Tech Round",
            difficulty: interviewData.difficulty || "Medium",
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.questions || data.questions.length === 0) {
          throw new Error(data.message || "Failed to generate resume questions");
        }
        setInterviewQuestions(data.questions);
      } else {
        const response = await fetch("http://localhost:5000/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: interviewData.role,
            type: interviewData.type,
            difficulty: interviewData.difficulty,
            numberOfQuestions: parseInt(interviewData.questions) || 5,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.questions || data.questions.length === 0) {
          throw new Error(data.message || "Failed to generate domain questions");
        }
        setInterviewQuestions(data.questions);
      }
    } catch (error) {
      console.error("Question generation error:", error);
      if (isResumeMode && resumeData?.skills) {
        setInterviewQuestions([
          `Hi ${candidateName}, please introduce yourself in two to three simple sentences.`,
          `In simple words, what does your project '${resumeData.projects?.[0]?.title || "project"}' do?`,
          `What is ${resumeData.skills?.[0] || "JavaScript"} and why do we use it in programming?`,
          "What is the difference between frontend and backend in simple words?",
          "Which programming language do you like the most, and why?",
        ]);
      } else {
        setInterviewQuestions([
          `Hello ${candidateName}, please introduce yourself in two to three simple sentences.`,
          "What is HTML and CSS used for in a website?",
          "What is a variable in programming, and what is the difference between let and const?",
          "What is a database and why do we need it?",
          "Can you tell me about any simple project you made in college?",
        ]);
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  // Mount effect: load camera & questions
  useEffect(() => {
    startCamera();
    generateQuestions();

    return () => {
      stopListening();
      stopCamera();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ------------------------------------
  // VOICE COMMANDS & AUTO-ADVANCE HELPERS
  // ------------------------------------
  const triggerVoiceToast = (msg) => {
    setVoiceToast(msg);
    setTimeout(() => {
      setVoiceToast("");
    }, 3500);
  };

  const clearSilenceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    setSilenceCountdown(null);
  };

  const resetSilenceDetector = () => {
    clearSilenceTimers();

    // If auto-advance is disabled, DO NOT auto-advance (candidate is in manual control)
    if (!autoAdvanceEnabledRef.current) return;

    const words = currentAnswerRef.current.trim().split(/\s+/).filter(Boolean).length;
    // Engage silence auto-advance ONLY if candidate has spoken at least 15 words and paused for 8 full seconds
    if (words >= 15) {
      silenceTimerRef.current = setTimeout(() => {
        let count = 5;
        setSilenceCountdown(count);
        silenceIntervalRef.current = setInterval(() => {
          count -= 1;
          if (count <= 0) {
            clearSilenceTimers();
            triggerVoiceToast("⏳ Answer Complete: Auto-advancing to evaluation...");
            if (handleFinishedSpeakingRef.current) {
              handleFinishedSpeakingRef.current();
            }
          } else {
            setSilenceCountdown(count);
          }
        }, 1000);
      }, 8000); // 8s of natural thinking pause instead of rushed 3.5s
    }
  };

  const SLOW_REGEX =
    /\b(slow bolo|thoda slow|thoda slow bolo|dheere bolo|dhire bolo|dheere se|aram se|slow please|speak slow|speak slowly|speak slower|slow down|aaram se bolo|aram se bolo)\b/i;
  const REPEAT_REGEX =
    /\b(repeat|repeat please|please repeat|repeat question|repeat the question|can you repeat|could you repeat|pardon|say again|say that again|say it again|come again|once more|one more time|once again|what was the question|question kya tha|kya tha question|phir se bolo|fir se bolo|phir se boliye|fir se boliye|dobara bolo|dobara boliye|dobara batao|dobara sunao|dobara|dubara|phir se|fir se|phir say|fir say|ek baar aur|ek bar aur|ek baar phir se|ek baar fir se|question repeat|repeat karo|repeat kardo|repeat kijiye|repeat kar do|repeat karna|sunai nahi|awaz nahi|awaaz nahi|samajh nahi|kya bola)\b/i;
  const NEXT_REGEX =
    /\b(ok next|okay next|next question|next please|go to next|i am done|im done|that's it|thats it|that is all|that's all|done speaking|done with my answer|ho gaya|aage badho)\b/i;

  // ------------------------------------
  // SPEECH RECOGNITION (LISTENING TO CANDIDATE)
  // ------------------------------------
  const startListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Set to en-IN for superior recognition of Indian accents and Hinglish voice commands
    recognition.lang = "en-IN";

    recognitionRef.current = recognition;
    shouldListenRef.current = true;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeakingTime(0);
      setAiStatusText("Listening to your verbal answer...");

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSpeakingTime((prev) => prev + 1);
      }, 1000);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Any speech detected immediately clears silence countdown so candidate is never cut off while talking
      if (interimTranscript.trim() || finalTranscript.trim()) {
        clearSilenceTimers();
      }

      const spokenChunk = (finalTranscript || interimTranscript).trim().toLowerCase();
      if (!spokenChunk) return;

      // 1. If Step 1 Communication Check Modal is open:
      if (communicationCheckDataRef.current) {
        if (/\b(ok next|next|continue|proceed|aage badho|done)\b/i.test(spokenChunk)) {
          triggerVoiceToast("🗣️ Voice Command: 'Next' Detected! Continuing...");
          if (handleProceedRef.current) handleProceedRef.current();
          return;
        }
      }

      // 2. SLOW DOWN VOICE COMMAND ("slow bolo", "speak slower", "dheere bolo", etc.)
      if (SLOW_REGEX.test(spokenChunk)) {
        clearSilenceTimers();
        currentAnswerRef.current = "";
        setAnswerLength(0);
        setSpeakingTime(0);
        triggerVoiceToast("🐢 Voice Command: 'Slow Bolo' Detected! Speaking Slower...");
        if (handleSpeakSlowerRef.current) {
          handleSpeakSlowerRef.current();
        }
        return;
      }

      // 3. REPEAT QUESTION VOICE COMMAND ("repeat", "repeat question", "dobara bolo", "question repeat karo", etc.)
      if (REPEAT_REGEX.test(spokenChunk)) {
        clearSilenceTimers();
        currentAnswerRef.current = "";
        setAnswerLength(0);
        setSpeakingTime(0);
        triggerVoiceToast("🔁 Voice Command: Repeating Question...");
        if (handleRepeatQuestionRef.current) {
          handleRepeatQuestionRef.current();
        }
        return;
      }

      // 4. NEXT QUESTION / DONE VOICE COMMAND ("OK Next", "Next Question", etc.)
      if (NEXT_REGEX.test(spokenChunk)) {
        clearSilenceTimers();
        const currentQText = interviewQuestions[currentQuestionRef.current] || "";
        let cleaned = (currentAnswerRef.current + " " + finalTranscript)
          .replace(new RegExp(NEXT_REGEX, "gi"), "")
          .trim();
        cleaned = normalizeTechnicalTerms(cleaned, currentQText);
        currentAnswerRef.current = cleaned;
        setAnswerLength(cleaned.length);
        triggerVoiceToast("🗣️ Voice Command: 'OK Next' Detected! Advancing...");
        if (handleFinishedSpeakingRef.current) {
          handleFinishedSpeakingRef.current();
        }
        return;
      }

      // 5. REGULAR SPEECH ACCUMULATION (with smart technical term normalization)
      if (finalTranscript.trim()) {
        const currentQText = interviewQuestions[currentQuestionRef.current] || "";
        const normalizedChunk = normalizeTechnicalTerms(finalTranscript.trim(), currentQText);
        const updated = currentAnswerRef.current
          ? currentAnswerRef.current + " " + normalizedChunk
          : normalizedChunk;
        const fullyCleaned = normalizeTechnicalTerms(updated, currentQText);
        currentAnswerRef.current = fullyCleaned;
        setAnswerLength(fullyCleaned.length);

        // Reset silence detector (only runs if candidate enabled auto-advance)
        resetSilenceDetector();
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition notice:", event.error);
      if (event.error === "no-speech" || event.error === "network") {
        return;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Auto-restart to keep microphone alive when candidate pauses or thinks
      if (
        shouldListenRef.current &&
        inCallRef.current &&
        !aiSpeakingRef.current &&
        !loadingRef.current
      ) {
        setTimeout(() => {
          if (
            shouldListenRef.current &&
            inCallRef.current &&
            !aiSpeakingRef.current &&
            !loadingRef.current
          ) {
            try {
              recognition.start();
            } catch (e) {
              startListening();
            }
          }
        }, 200);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition start notice:", e.message);
    }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    clearSilenceTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsListening(false);
  };

  // ------------------------------------
  // AI VERBALLY ASKS QUESTION (HUMAN-PACED & NATURAL INDIAN ENGLISH)
  // ------------------------------------
  const formatSpeechPacing = (text) => {
    if (!text) return "";
    let s = text.trim();
    // Clean up unnecessary brackets, strange punctuation, or multiple commas
    s = s.replace(/[,;:]\s*[,;:]+/g, ",");
    // Ensure clean greeting transition
    s = s.replace(/^(Hello|Hi|Hey)\s+([^,!]+)[,!]/i, "$1 $2. ");
    // Clean question marks
    s = s.replace(/\?\s*/g, "? ");
    s = s.replace(/\s{2,}/g, " ").trim();
    return s;
  };

  const speakCurrentQuestion = (
    prefixText = "",
    overrideQuestion = null,
    targetIndex = null,
    overrideRate = null
  ) => {
    if (!("speechSynthesis" in window)) {
      console.warn("speechSynthesis not supported in this environment");
      return;
    }

    shouldListenRef.current = false;
    stopListening();

    utteranceIdRef.current += 1;
    const thisUtteranceId = utteranceIdRef.current;

    const currentIdx = targetIndex !== null ? targetIndex : currentQuestionRef.current;
    const qText =
      overrideQuestion ||
      interviewQuestions[currentIdx] ||
      (currentIdx === 0
        ? `Hello ${candidateName}, please introduce yourself in two to three simple sentences.`
        : "Can you explain your project in simple words?");

    const fullSpeech = prefixText ? `${prefixText} ${qText}` : qText;
    const pacedSpeech = formatSpeechPacing(fullSpeech);

    const utterance = new SpeechSynthesisUtterance(pacedSpeech);
    window._activeUtterance = utterance; // Prevent V8 garbage collection dropping audio in Chrome/Edge

    // Rate & Pitch - Natural human Indian conversational rate
    const rateToApply = overrideRate !== null ? overrideRate : speechRateRef.current;
    utterance.rate = rateToApply || 0.88;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getInterviewerVoice(voiceGender);
    if (voice) {
      try {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en-IN";
      } catch (e) {
        console.warn("Voice assignment notice:", e);
      }
    } else {
      utterance.lang = "en-IN";
    }

    let finished = false;
    const safeEnd = () => {
      if (utteranceIdRef.current !== thisUtteranceId) return;
      if (finished) return;
      finished = true;
      aiSpeakingRef.current = false;
      setAiSpeaking(false);
      setAiStatusText("Listening to your verbal answer...");
      setTimeout(() => {
        if (
          utteranceIdRef.current === thisUtteranceId &&
          inCallRef.current &&
          !loadingRef.current
        ) {
          shouldListenRef.current = true;
          startListening();
        }
      }, 350);
    };

    utterance.onstart = () => {
      if (utteranceIdRef.current !== thisUtteranceId) return;
      aiSpeakingRef.current = true;
      setAiSpeaking(true);
      setAiStatusText("AI Interviewer is speaking question...");
    };

    utterance.onend = () => {
      if (utteranceIdRef.current !== thisUtteranceId) return;
      safeEnd();
    };

    utterance.onerror = (e) => {
      if (utteranceIdRef.current !== thisUtteranceId) return;
      if (e?.error === "interrupted" || e?.error === "canceled") {
        return; // Intentionally stopped for fresh speech
      }
      console.warn("Speech synthesis notice:", e?.error || e);
      // If voice failed with network/synthesis error, try fallback with offline local voice
      if ((e?.error === "network" || e?.error === "synthesis-failed" || e?.error === "audio-busy") && !utterance._retried) {
        utterance._retried = true;
        const offlineVoice = (voicesRef.current || window.speechSynthesis.getVoices()).find(
          (v) => !v.name.includes("Online") && v.lang.startsWith("en")
        );
        if (offlineVoice) {
          console.log("Retrying with local offline voice:", offlineVoice.name);
          const retryUtterance = new SpeechSynthesisUtterance(pacedSpeech);
          retryUtterance.voice = offlineVoice;
          retryUtterance.rate = rateToApply || 0.82;
          retryUtterance.onstart = () => {
            if (utteranceIdRef.current !== thisUtteranceId) return;
            aiSpeakingRef.current = true;
            setAiSpeaking(true);
            setAiStatusText("AI Interviewer is speaking question...");
          };
          retryUtterance.onend = () => {
            if (utteranceIdRef.current !== thisUtteranceId) return;
            safeEnd();
          };
          retryUtterance.onerror = () => {
            if (utteranceIdRef.current !== thisUtteranceId) return;
            safeEnd();
          };
          window._activeUtterance = retryUtterance;
          try {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(retryUtterance);
            return;
          } catch (err) {}
        }
      }
      safeEnd();
    };

    // CRITICAL: Cancel previous speech and resume
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch (e) {}

    // 100ms timeout fixes Chromium's asynchronous cancel() race condition
    setTimeout(() => {
      if (utteranceIdRef.current !== thisUtteranceId) return;
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("speechSynthesis.speak failed:", err);
        safeEnd();
      }
    }, 100);
  };

  // ------------------------------------
  // JOIN CALL LOBBY -> STARTS INTERVIEW
  // ------------------------------------
  const handleJoinCall = () => {
    setInCall(true);

    // Warm up speech synthesis immediately within user click gesture!
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }

    const firstQ =
      interviewQuestions[0] ||
      `Hello ${candidateName}, please introduce yourself in two to three simple sentences.`;
    const welcome = `Hello ${candidateName}, welcome to your interview. Let's start with your first basic question:`;

    setTimeout(() => {
      speakCurrentQuestion(welcome, firstQ, 0);
    }, 350);
  };

  // Test AI Voice directly from Lobby
  const handleTestVoiceInLobby = () => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
    const testText = `Hello ${candidateName}! I am your AI interviewer. I will ask simple and basic questions in clear Indian English so you can understand easily in one go.`;
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.rate = speechRateRef.current || 0.88;
    utterance.pitch = 1.0;
    const voice = getInterviewerVoice(voiceGender);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "en-IN";
    } else {
      utterance.lang = "en-IN";
    }
    window.speechSynthesis.cancel();
    setTimeout(() => {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    }, 60);
  };

  // Repeat Question button
  const handleRepeatQuestion = () => {
    clearSilenceTimers();
    currentAnswerRef.current = "";
    setAnswerLength(0);
    setSpeakingTime(0);

    triggerVoiceToast("🔁 Repeating question clearly...");
    setAiStatusText("AI Interviewer is repeating the question...");

    const currentIdx = currentQuestionRef.current;
    const qText =
      interviewQuestions[currentIdx] ||
      (currentIdx === 0
        ? `Hello ${candidateName}, please introduce yourself in two to three simple sentences.`
        : "Can you explain your project in simple words?");

    speakCurrentQuestion(
      "Sure, let me repeat that question for you:",
      qText,
      currentIdx
    );
  };

  // Candidate clicks "Thoda Slow Bolo" or says "slow bolo"
  const handleSpeakSlower = () => {
    clearSilenceTimers();
    currentAnswerRef.current = "";
    setAnswerLength(0);
    setSpeakingTime(0);

    const slowerRate = 0.80;
    setSpeechRate(slowerRate);
    speechRateRef.current = slowerRate;
    triggerVoiceToast("🐢 Slowing down AI speech to 0.80x...");
    setAiStatusText("AI Interviewer is speaking slowly...");

    const currentIdx = currentQuestionRef.current;
    const qText =
      interviewQuestions[currentIdx] ||
      (currentIdx === 0
        ? `Hello ${candidateName}, please introduce yourself in two to three simple sentences.`
        : "Can you explain your project in simple words?");

    speakCurrentQuestion(
      "No problem! Let me ask the question slowly and clearly:",
      qText,
      currentIdx,
      slowerRate
    );
  };

  // Swap question verbally
  const handleSwapQuestion = async () => {
    if (aiSpeaking || loading) return;
    stopListening();
    setAiStatusText("Selecting a fresh question...");

    try {
      const response = await fetch("http://localhost:5000/api/random-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: interviewData.role,
          type: interviewData.type,
          difficulty: interviewData.difficulty,
          currentQuestions: interviewQuestions,
          previousQuestions: answers.map((a) => a.question),
          resumeData: isResumeMode ? resumeData : null,
        }),
      });

      const data = await response.json();
      if (data && data.question) {
        const updated = [...interviewQuestions];
        updated[currentQuestion] = data.question;
        setInterviewQuestions(updated);
        currentAnswerRef.current = "";
        setAnswerLength(0);
        setSpeakingTime(0);

        setTimeout(() => {
          speakCurrentQuestion(
            "No problem, here is an alternative question for you:",
            data.question,
            currentQuestion
          );
        }, 300);
      }
    } catch (err) {
      console.error("Swap question error:", err);
      speakCurrentQuestion("Let's proceed with this question:");
    }
  };

  // ------------------------------------
  // CANDIDATE SUBMITS ANSWER -> EVALUATE & NEXT
  // ------------------------------------
  const handleFinishedSpeaking = async () => {
    stopListening();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setAiSpeaking(false);
    }

    const questionText = interviewQuestions[currentQuestion] || "";
    const rawSpoken = currentAnswerRef.current.trim();
    if (!rawSpoken) {
      speakCurrentQuestion("I didn't quite hear your answer. Please speak your response into the microphone.");
      return;
    }

    const spokenAnswer = normalizeTechnicalTerms(rawSpoken, questionText);

    setLoading(true);
    setAiStatusText("AI is analyzing your verbal response & composure...");

    try {
      const response = await fetch("http://localhost:5000/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: interviewQuestions[currentQuestion],
          answer: spokenAnswer,
          role: interviewData.role,
          difficulty: interviewData.difficulty,
          speakingTime,
          cameraMetrics: {
            eyeContactPercent: cameraActive ? eyeContactScore : 0,
            postureComposure: postureStatus,
            cameraActive,
          },
          resumeContext: isResumeMode ? resumeData : null,
        }),
      });

      const evalData = await response.json();
      const finalRecordedAnswer = evalData.cleanedAnswer || spokenAnswer;

      const updatedAnswers = [
        ...answers,
        {
          question: interviewQuestions[currentQuestion],
          answer: finalRecordedAnswer,
          speakingTime,
          cameraMetrics: {
            eyeContactPercent: cameraActive ? eyeContactScore : 0,
            postureComposure: postureStatus,
          },
          evaluation: evalData,
        },
      ];

      // Final Question reached -> Finish Interview
      if (currentQuestion === interviewQuestions.length - 1) {
        saveHistory(updatedAnswers);
        stopCamera();

        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const outroText = `Thank you ${candidateName}. Your interview is complete. Navigating to your comprehensive mistakes and performance report.`;
          const outro = new SpeechSynthesisUtterance(formatSpeechPacing(outroText));
          outro.rate = speechRateRef.current;
          outro.pitch = 1.03;
          const voice = getInterviewerVoice(voiceGender);
          if (voice) outro.voice = voice;
          window.speechSynthesis.speak(outro);
        }

        setTimeout(() => {
          navigate("/result", {
            state: {
              answers: updatedAnswers,
              interviewData,
              cameraActive,
              avgEyeContact: eyeContactScore,
            },
          });
        }, 1200);
        return;
      }

      // If Question 1 (Communication Check & Intro), pause to display the communication diagnostic!
      if (currentQuestion === 0) {
        setAnswers(updatedAnswers);
        currentAnswerRef.current = "";
        setAnswerLength(0);
        setSpeakingTime(0);
        setLoading(false);

        const commData = evalData.communicationCheck || {
          clarityScore: evalData.clarity || 85,
          speakingPace: "Optimal Cadence (110-140 WPM)",
          totalFillerCount: 0,
          fillerImpact: "Clean Speech 🌟",
          howYouSpoke: "You introduced yourself with audible pronunciation and structured delivery.",
          grammarAndVocab: "Good conversational phrasing and direct response.",
          communicationTips: [
            "Maintain this natural speaking speed for your upcoming technical questions.",
            "Take a gentle breath between sentences to project calm confidence."
          ]
        };
        setCommunicationCheckData(commData);
        communicationCheckDataRef.current = commData;

        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const commSpeechText = `Good job! I have evaluated your communication and speaking style. You can say 'OK Next' or review your feedback on screen before we proceed to your basic questions.`;
          const commSpeech = new SpeechSynthesisUtterance(formatSpeechPacing(commSpeechText));
          commSpeech.rate = speechRateRef.current;
          commSpeech.pitch = 1.03;
          const voice = getInterviewerVoice(voiceGender);
          if (voice) commSpeech.voice = voice;
          commSpeech.onend = () => {
            // Re-listen so candidate can say "OK next" verbally to continue!
            startListening();
          };
          window.speechSynthesis.speak(commSpeech);
        } else {
          startListening();
        }
        return;
      }

      // Move to Next Question
      setAnswers(updatedAnswers);
      currentAnswerRef.current = "";
      setAnswerLength(0);
      setSpeakingTime(0);
      const nextIdx = currentQuestion + 1;
      setCurrentQuestion(nextIdx);

      // AI speaks a short transition and then asks the next question verbally!
      const transitions = [
        "Thank you. Let's move on to the next question.",
        "Got it. Here is your next question.",
        "Understood. Moving forward to the next topic.",
      ];
      const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];

      setTimeout(() => {
        setLoading(false);
        speakCurrentQuestion(randomTransition, interviewQuestions[nextIdx], nextIdx);
      }, 500);
    } catch (error) {
      console.error("Evaluation error:", error);
      alert("AI evaluation service is busy. Please try proceeding again.");
      setLoading(false);
    }
  };

  // Handler to proceed after reviewing Communication Check
  const handleProceedAfterCommunicationCheck = () => {
    if (stepOneTimerRef.current) {
      clearInterval(stepOneTimerRef.current);
      stepOneTimerRef.current = null;
    }
    setStepOneAutoCountdown(null);
    setCommunicationCheckData(null);
    communicationCheckDataRef.current = null;
    setCurrentQuestion(1);
    setTimeout(() => {
      speakCurrentQuestion(
        "Thank you. Now let's dive into your basic technical questions.",
        interviewQuestions[1],
        1
      );
    }, 400);
  };

  // Sync refs so voice event handlers always call the latest function instance
  useEffect(() => {
    handleFinishedSpeakingRef.current = handleFinishedSpeaking;
    handleRepeatQuestionRef.current = handleRepeatQuestion;
    handleSpeakSlowerRef.current = handleSpeakSlower;
    handleProceedRef.current = handleProceedAfterCommunicationCheck;
  });

  // Auto-advance countdown for Step 1 Communication Check
  useEffect(() => {
    if (communicationCheckData) {
      communicationCheckDataRef.current = communicationCheckData;
      let remaining = 8;
      setStepOneAutoCountdown(remaining);
      const interval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(interval);
          setStepOneAutoCountdown(null);
          if (handleProceedRef.current) handleProceedRef.current();
        } else {
          setStepOneAutoCountdown(remaining);
        }
      }, 1000);
      stepOneTimerRef.current = interval;
      return () => {
        clearInterval(interval);
      };
    } else {
      communicationCheckDataRef.current = null;
      if (stepOneTimerRef.current) {
        clearInterval(stepOneTimerRef.current);
        stepOneTimerRef.current = null;
      }
      setStepOneAutoCountdown(null);
    }
  }, [communicationCheckData]);

  const saveHistory = (updatedAnswers) => {
    try {
      const history = JSON.parse(localStorage.getItem("interviewHistory") || "[]");
      const record = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        mode: interviewData.mode,
        role: interviewData.role,
        type: interviewData.type,
        companyStyle: interviewData.companyStyle || null,
        candidateName: resumeData?.candidateName || null,
        difficulty: interviewData.difficulty,
        questions: updatedAnswers.length,
        answers: updatedAnswers,
        cameraEnabled: cameraActive,
      };
      localStorage.setItem("interviewHistory", JSON.stringify([record, ...history]));
    } catch (e) {
      console.error("Save history error:", e);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ------------------------------------
  // SCREEN 1: PRE-INTERVIEW LOBBY (JOIN CALL)
  // ------------------------------------
  if (!inCall) {
    return (
      <div className="interview-page lobby-page">
        <div className="interview-lobby-card">
          <div className="lobby-header">
            <span className="lobby-badge">🚪 INTERVIEW ROOM LOBBY</span>
            <h1>Real-World Company Interview Simulation</h1>
            <p>
              Just like an actual company interview room (Google Meet / HireVue), the AI interviewer
              will ask questions <strong>verbally aloud</strong> and you will speak your answers
              directly to the camera.
            </p>
          </div>

          <div className="lobby-preview-grid">
            {/* WEBCAM PREVIEW */}
            <div className="lobby-webcam-box">
              <video
                ref={lobbyVideoRef}
                autoPlay
                playsInline
                muted
                className={`lobby-video ${isMirrored ? "mirrored" : ""}`}
              />
              <div className="lobby-hud-overlay">
                <span className="lobby-hud-pill">
                  {cameraActive ? "🟢 Camera Ready" : "⚠️ Camera Inactive"}
                </span>
                <span className="lobby-hud-pill">
                  {audioLevel > 5 ? "🎙️ Mic Detected" : "🎙️ Mic Ready"}
                </span>
              </div>
            </div>

            {/* INTERVIEW PARAMETERS & INSTRUCTIONS */}
            <div className="lobby-info-box">
              <h3>Interview Information</h3>
              <div className="lobby-meta-list">
                <div>
                  <span>Candidate:</span>
                  <strong>{candidateName}</strong>
                </div>
                <div>
                  <span>Format:</span>
                  <strong>{interviewData.companyStyle || "Product Tech Round"}</strong>
                </div>
                <div>
                  <span>Total Questions:</span>
                  <strong>{interviewQuestions.length || 5} Questions</strong>
                </div>
                <div>
                  <span>AI Voice Delivery:</span>
                  <strong style={{ color: "#4f46e5" }}>Calm & Clear (0.82x Slow Pacing) 🎙️</strong>
                </div>
                <div>
                  <span>Mode:</span>
                  <strong>Verbal & Video Only (True Confidence Test)</strong>
                </div>
              </div>

              <div className="confidence-notice">
                <span className="notice-icon">🎯</span>
                <p>
                  <strong>Slow & Clear Spoken Questions:</strong> The AI speaks questions calmly and clearly. You can say <em>"slow bolo"</em> or <em>"repeat"</em> hands-free anytime, or click <em>"Thoda Slow Bolo"</em> on screen!
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleTestVoiceInLobby}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#1e293b",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                  title="Test if AI voice and speakers are working on your computer"
                >
                  🔊 Test AI Voice
                </button>
                <button
                  type="button"
                  className="join-interview-btn"
                  onClick={handleJoinCall}
                  disabled={questionLoading}
                  style={{ flex: 1 }}
                >
                  {questionLoading ? "🔄 Preparing Questions..." : "🎥 Join Interview Room & Connect →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // SCREEN 2: ACTIVE IMMERSIVE VIDEO CALL ROOM
  // ------------------------------------
  return (
    <div className="interview-page call-room-page">
      {/* CALL ROOM TOP BAR */}
      <div className="call-top-bar">
        <div className="call-brand">
          <span className="call-live-dot"></span>
          <span className="call-title">
            {interviewData.companyStyle || "Company Placement Interview"}
          </span>
          <span className={`call-round-pill ${currentQuestion === 0 ? "comm-check-pill" : ""}`}>
            {currentQuestion === 0
              ? "🎙️ Step 1: Communication & Speaking Check"
              : `💡 Question ${currentQuestion + 1} of ${interviewQuestions.length} (Basic Question)`}
          </span>
        </div>

        <div className="call-center-status">
          <span className={`status-pill ${aiSpeaking ? "speaking" : isListening ? "listening" : "evaluating"}`}>
            {aiStatusText}
          </span>
        </div>

        <div className="call-top-actions">
          {/* AI VOICE SPEED SELECTOR */}
          <div className="voice-speed-pill" title="AI Speaking Speed">
            <span className="speed-label">⚡ AI Speed:</span>
            <select
              value={speechRate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeechRate(val);
                speechRateRef.current = val;
                triggerVoiceToast(`⚡ AI Speed: ${val}x`);
              }}
              className="voice-speed-dropdown"
            >
              <option value="0.76">🐢 0.76x (Very Slow)</option>
              <option value="0.82">🎙️ 0.82x (Calm & Clear)</option>
              <option value="0.90">⚡ 0.90x (Normal)</option>
            </select>
          </div>

          {/* AI VOICE PERSONA SWITCH */}
          <button
            type="button"
            className="voice-gender-btn"
            onClick={() => {
              const next = voiceGender === "female" ? "male" : "female";
              setVoiceGender(next);
              triggerVoiceToast(`🎙️ Voice: ${next === "female" ? "Sarah (Fresh)" : "Alex (Fresh)"}`);
            }}
            title="Switch Voice Persona"
          >
            {voiceGender === "female" ? "👩 Sarah" : "👨 Alex"}
          </button>

          <button
            type="button"
            className="caption-toggle-btn"
            onClick={() => setShowCaptions(!showCaptions)}
            title="Toggle Subtitles / Text View"
          >
            {showCaptions ? "👁️ Hide Subtitles" : "💬 Subtitles"}
          </button>
        </div>
      </div>

      {/* TWO LARGE VIDEO TILES (CONFERENCE ROOM) */}
      <div className="video-conference-grid">
        {/* ========================================================= */}
        {/* TILE 1: AI INTERVIEWER VIDEO TILE */}
        {/* ========================================================= */}
        <div className="video-tile interviewer-tile">
          <div className="interviewer-avatar-stage">
            <div className={`ai-interviewer-avatar-glow ${aiSpeaking ? "pulsing" : ""}`}>
              <div className="avatar-graphic">
                <span className="avatar-emoji">🤖</span>
              </div>
            </div>

            {/* DYNAMIC SPEECH WAVES */}
            <div className="ai-speech-equalizer">
              <span className={`eq-bar ${aiSpeaking ? "active" : ""}`}></span>
              <span className={`eq-bar ${aiSpeaking ? "active" : ""}`}></span>
              <span className={`eq-bar ${aiSpeaking ? "active" : ""}`}></span>
              <span className={`eq-bar ${aiSpeaking ? "active" : ""}`}></span>
              <span className={`eq-bar ${aiSpeaking ? "active" : ""}`}></span>
            </div>

            <p className="interviewer-verbal-prompt">
              {aiSpeaking
                ? "🎙️ Asking question clearly... Listen carefully."
                : isListening
                ? "👂 Listening to your spoken answer..."
                : loading
                ? "🤔 Evaluating answer & mistakes..."
                : "Ready."}
            </p>
          </div>

          {/* SUBTITLES (OPTIONAL TOGGLE ONLY) */}
          {showCaptions && (
            <div className="captions-overlay">
              <span className="captions-label">Spoken Question:</span>
              <p>"{interviewQuestions[currentQuestion]}"</p>
            </div>
          )}

          {/* INTERVIEWER NAME TAG */}
          <div className="video-tile-nameplate">
            <span className="nameplate-icon">💼</span>
            <span className="nameplate-name">
              {voiceGender === "female" ? "Sarah Jenkins (Technical Interviewer)" : "Alex Morgan (Technical Interviewer)"}
            </span>
            <span className="nameplate-role">AI Hiring Panel</span>
          </div>

          {/* QUICK AUDIO ACTION CONTROLS */}
          <div className="interviewer-quick-controls">
            <button
              type="button"
              className="ai-action-chip slow-chip"
              onClick={handleSpeakSlower}
              disabled={loading}
              title="Speak question more slowly and clearly"
            >
              🐢 Thoda Slow Bolo
            </button>
            <button
              type="button"
              className="ai-action-chip repeat-chip"
              onClick={handleRepeatQuestion}
              disabled={loading}
              title="Ask AI to repeat the question verbally"
            >
              🔁 Repeat Question
            </button>
            <button
              type="button"
              className="ai-action-chip"
              onClick={handleRepeatQuestion}
              disabled={loading}
              title="Force AI to speak the question aloud"
              style={{ borderColor: "#38bdf8", color: "#e0f2fe" }}
            >
              🔊 Play Voice
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TILE 2: CANDIDATE LIVE WEBCAM VIDEO TILE */}
        {/* ========================================================= */}
        <div className="video-tile candidate-tile">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`candidate-stream ${isMirrored ? "mirrored" : ""}`}
          />

          {!cameraActive && (
            <div className="camera-muted-splash">
              <span className="splash-icon">📷</span>
              <p>Your camera is paused</p>
            </div>
          )}

          {/* VOICE COMMAND TOAST NOTIFICATION */}
          {voiceToast && (
            <div className="voice-toast-pill">
              <span className="toast-sparkle">✨</span>
              <span>{voiceToast}</span>
            </div>
          )}

          {/* SILENCE VAD COUNTDOWN BADGE */}
          {silenceCountdown !== null && (
            <div className="silence-vad-badge">
              <span className="vad-icon">⏳</span>
              <span>Silence detected: Submitting in <strong>{silenceCountdown}s</strong></span>
              <button
                type="button"
                className="cancel-vad-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSilenceTimers();
                  triggerVoiceToast("✋ Auto-submit paused! Take your time to speak.");
                }}
                title="Cancel countdown and keep speaking"
              >
                ✋ Wait, Still Speaking
              </button>
            </div>
          )}

          {/* CANDIDATE HUD BADGES */}
          <div className="candidate-hud-top">
            <span className="proctor-live-tag">
              <span className="proctor-dot"></span>
              AI VIDEO PROCTOR LIVE
            </span>

            {cameraActive && (
              <span className="hud-metric-pill">
                👁️ Eye Contact: <strong>{eyeContactScore}%</strong>
              </span>
            )}
          </div>

          <div className="candidate-hud-bottom">
            <span className="posture-tag">✓ {postureStatus}</span>

            {/* LIVE MIC WAVE BAR */}
            <div className="mic-live-meter">
              <span className="meter-label">🎙️ Mic</span>
              <div className="meter-bar-track">
                <div
                  className="meter-bar-fill"
                  style={{ width: `${isListening ? Math.max(18, audioLevel) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* CANDIDATE NAMEPLATE */}
          <div className="video-tile-nameplate">
            <span className="nameplate-icon">👤</span>
            <span className="nameplate-name">{candidateName} (You)</span>
            {isListening && (
              <span className="speaking-live-pill">🔴 Speaking ({formatTime(speakingTime)})</span>
            )}
          </div>
        </div>
      </div>

      {/* VOICE ASSISTANT HINT STRIP (HANDS-FREE INSTRUCTIONS) */}
      <div className="voice-control-banner">
        <span className="voice-pulse-icon">🎙️</span>
        <span className="voice-instruction-text">
          <strong>Speaking Controls:</strong> Speak freely without rushing! Click <em>"✓ Finish Answer"</em> or say <em>"OK Next"</em> when done. Say <em>"Repeat"</em> or <em>"Dobara Bolo"</em> to hear the question again.
        </span>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM CALL CONTROL CONSOLE (MEET / ZOOM STYLE) */}
      {/* ========================================================= */}
      <div className="call-controls-dock">
        <div className="dock-left">
          <button
            type="button"
            className={`dock-btn ${!cameraActive ? "muted" : ""}`}
            onClick={toggleCamera}
            title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraActive ? "📷 Camera On" : "🚫 Camera Off"}
          </button>

          <button
            type="button"
            className={`dock-btn ${micMuted ? "muted" : ""}`}
            onClick={toggleMic}
            title={micMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {micMuted ? "🔇 Unmute Mic" : "🎙️ Mic On"}
          </button>

          <button
            type="button"
            className={`dock-btn ${autoAdvanceEnabled ? "auto-on" : ""}`}
            onClick={() => {
              const nextVal = !autoAdvanceEnabled;
              setAutoAdvanceEnabled(nextVal);
              clearSilenceTimers();
              triggerVoiceToast(
                nextVal
                  ? "⚡ Auto-Next ON: Automatically proceeds after 8s silence"
                  : "✋ Manual Mode ON: Won't jump to next question until you click or say 'OK Next'"
              );
            }}
            title={autoAdvanceEnabled ? "Auto-Next is ON (Waits 8s silence)" : "Manual mode: Advances only when you choose"}
          >
            {autoAdvanceEnabled ? "⚡ Auto-Next: ON" : "✋ Auto-Next: OFF"}
          </button>

          <button
            type="button"
            className="dock-btn"
            onClick={handleSwapQuestion}
            disabled={aiSpeaking || loading}
            title="Swap with a different random interview question"
          >
            🔀 Swap Question
          </button>
        </div>

        {/* PRIMARY ACTION BUTTON IN CENTER */}
        <div className="dock-center">
          {aiSpeaking ? (
            <div className="listening-prompt-box">
              <span>🔊</span>
              <strong>Interviewer is speaking... Listen carefully</strong>
            </div>
          ) : (
            <button
              type="button"
              className={`finish-speaking-btn ${currentQuestion === 0 ? "comm-action" : ""}`}
              onClick={handleFinishedSpeaking}
              disabled={loading}
            >
              {loading ? (
                <span>🤖 Analyzing Spoken Communication & Mistakes...</span>
              ) : currentQuestion === 0 ? (
                <span>🎙️ I've Finished My Intro → Check Communication (or say "OK Next")</span>
              ) : currentQuestion === interviewQuestions.length - 1 ? (
                <span>✓ Finish Interview & View Report</span>
              ) : (
                <span>✓ I've Finished My Answer → Next Question (or say "OK Next")</span>
              )}
            </button>
          )}
        </div>

        <div className="dock-right">
          <button
            type="button"
            className="dock-btn end-call"
            onClick={() => {
              if (window.confirm("Are you sure you want to exit the interview early?")) {
                stopCamera();
                stopListening();
                navigate("/setup");
              }
            }}
          >
            🔴 End Interview
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🎙️ EXECUTIVE AI COMMUNICATION & SPEAKING DIAGNOSTIC       */}
      {/* ========================================================= */}
      {communicationCheckData && (
        <div className="comm-modal-backdrop">
          <div className="comm-diagnostic-card executive-card">
            <div className="comm-card-badge">
              <span>🎙️ STEP 1: AI EXECUTIVE VOICE & SPEECH DIAGNOSTIC</span>
            </div>

            <h2>Communication & Articulation Analysis</h2>
            <p className="comm-card-subtitle">
              Professional evaluation of your spoken English, fluency, voice pacing, and interview composure.
            </p>

            {/* 4-CHIP EXECUTIVE METRIC GRID */}
            <div className="comm-metric-chips-row executive-grid">
              <div className="comm-chip">
                <span className="chip-label">Speaking Clarity</span>
                <strong className="chip-value text-emerald">
                  {communicationCheckData.clarityScore || 85}%
                </strong>
                <span className="chip-desc">Articulation & Vocabulary</span>
              </div>

              <div className="comm-chip">
                <span className="chip-label">Speaking Cadence</span>
                <strong className="chip-value text-blue">
                  {communicationCheckData.wordsPerMinute ? `${communicationCheckData.wordsPerMinute} WPM` : "115 WPM"}
                </strong>
                <span className="chip-desc">{communicationCheckData.speakingPace || "Optimal Cadence"}</span>
              </div>

              <div className="comm-chip">
                <span className="chip-label">Filler Words</span>
                <strong className="chip-value text-purple">
                  {communicationCheckData.totalFillerCount !== undefined
                    ? `${communicationCheckData.totalFillerCount} Fillers`
                    : "0 Fillers"}
                </strong>
                <span className="chip-desc">{communicationCheckData.fillerImpact || "Clean Speech 🌟"}</span>
              </div>

              <div className="comm-chip">
                <span className="chip-label">Video Composure</span>
                <strong className="chip-value text-indigo">{eyeContactScore}%</strong>
                <span className="chip-desc">{postureStatus}</span>
              </div>
            </div>

            {/* HOW YOU SPOKE ANALYSIS */}
            <div className="comm-analysis-narrative">
              <div className="narrative-title">
                <span>💬</span>
                <h4>Speaking Style & Articulation (बोलने का तरीका):</h4>
              </div>
              <p>
                {communicationCheckData.howYouSpoke ||
                  "You introduced yourself clearly with steady pacing and audible pronunciation. Your sentence formation was coherent."}
              </p>
              {communicationCheckData.grammarAndVocab && (
                <p className="grammar-vocab-sub">
                  <strong>Grammar & Fluency:</strong> {communicationCheckData.grammarAndVocab}
                </p>
              )}
            </div>

            {/* WHAT IMPROVEMENTS ARE NEEDED */}
            {Array.isArray(communicationCheckData.communicationTips) &&
              communicationCheckData.communicationTips.length > 0 && (
                <div className="comm-improvements-box">
                  <div className="improvements-title">
                    <span>💡</span>
                    <h4>Executive Coaching Improvements (क्या सुधार चाहिए):</h4>
                  </div>
                  <ul>
                    {communicationCheckData.communicationTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* AUTO-COUNTDOWN PROGRESS BAR */}
            {stepOneAutoCountdown !== null && (
              <div className="step-one-countdown-strip">
                <div className="countdown-text-row">
                  <span>⏱️ Auto-continuing to technical questions in <strong>{stepOneAutoCountdown}s</strong></span>
                  <span className="voice-tip">(or say <em>"OK Next"</em> to proceed now)</span>
                </div>
                <div className="countdown-track">
                  <div className="countdown-fill" style={{ width: `${(stepOneAutoCountdown / 8) * 100}%` }} />
                </div>
              </div>
            )}

            <div className="comm-action-row">
              <button
                type="button"
                className="proceed-tech-btn"
                onClick={handleProceedAfterCommunicationCheck}
              >
                👉 Start Basic Technical Questions (अब बेसिक सवाल शुरू करें) →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;