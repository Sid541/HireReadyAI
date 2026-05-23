import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router'; // Used for route isolation transitions
import axios from 'axios';
import { 
    Briefcase, 
    Layers, 
    Video, 
    VideoOff, 
    Mic, 
    Square, 
    ChevronRight, 
    Sparkles, 
    Loader2, 
    AlertCircle,
    ArrowLeft // ◄ Added ArrowLeft icon for the back button
} from 'lucide-react';
import "./AllInterview.scss";
const VITE_API_URL = import.meta.env.VITE_API_URL

// ── Inline Toast Component ───────────────────────────────────────────────────
const Toast = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [onClose, duration]);

    return (
        <div className={`toast toast--${type}`}>
            <span className='toast__icon'>
                {type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                )}
            </span>
            <span className='toast__message'>{message}</span>
            <button className='toast__close' onClick={onClose} aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <span className='toast__progress' style={{ animationDuration: `${duration}ms` }} />
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────────────────────
const AIInterview = () => {
    const navigate = useNavigate();
    
    // Stage Lifecycle Tracker: 'setup' | 'live' | 'processing'
    const [stage, setStage] = useState('setup');
    const [jobRole, setJobRole] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Live Assessment States
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [transcriptLog, setTranscriptLog] = useState([]);
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef(null);
    const recognitionRef = useRef(null);
    const streamRef = useRef(null);

    const showToast = (message, type = 'success') => setToast({ message, type });
    const closeToast = useCallback(() => setToast(null), []);

    const getAuthHeaders = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        withCredentials: true
    });

    // Mount Speech-to-Text Drivers
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = false;
            rec.lang = 'en-US';

            rec.onresult = (event) => {
                const text = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setCurrentAnswer(prev => prev + ' ' + text);
            };

            rec.onerror = (e) => console.error("STT Context Failure:", e);
            recognitionRef.current = rec;
        }
    }, []);

    // Text-To-Speech Audio Reader Loop
    useEffect(() => {
        if (stage === 'live' && questions.length > 0) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(questions[currentIndex].text);
                utterance.rate = 1.0;
                window.speechSynthesis.speak(utterance);
            }
        }
    }, [stage, currentIndex, questions]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            console.warn("Media channels missing.", err);
            showToast("Webcam feed restricted. Continuing with audio only channels.", "error");
        }
    };

    const handleStartSetup = async (e) => {
        e.preventDefault();
        if (!jobRole.trim()) return;
        setLoading(true);

        try {
            const res = await axios.post(
                `${VITE_API_URL}/api/interview/start`,
                { jobRole, difficulty },
                getAuthHeaders()
            );

            setQuestions(res.data.questions);
            setStage('live');
            setTimeout(startCamera, 100);
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || "Failed to initialize environment.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRecording = () => {
        if (!recognitionRef.current) {
            showToast("Speech synthesis engine missing on this browser environment.", "error");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleNextQuestion = () => {
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        const updatedHistory = [
            ...transcriptLog,
            {
                question: questions[currentIndex].text,
                answer: currentAnswer.trim() || "[Candidate skipped verbal response execution]",
                proctorFlags: 0
            }
        ];

        setTranscriptLog(updatedHistory);
        setCurrentAnswer('');

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            submitForEvaluation(updatedHistory);
        }
    };

    const submitForEvaluation = async (finalTranscript) => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setStage('processing');

        try {
            const res = await axios.post(
                `${VITE_API_URL}/api/interview/evaluate`,
                { jobRole, difficulty, transcript: finalTranscript },
                getAuthHeaders()
            );

            // Redirect to a dedicated standalone report view, pushing state values safely
            navigate('/interview/report', { 
                state: { 
                    reportData: res.data, 
                    meta: { jobRole, difficulty } 
                } 
            });
        } catch (err) {
            console.error(err);
            showToast("Error grading interview parameters.", "error");
            setStage('setup');
        }
    };

    return (
        <main className="dashboard-layout">
            <div className='toast-wrapper'>
                {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
            </div>

            {/* ◄ BACK BUTTON CONTAINER LINKED TO ROUTE ISOLATION ROOT */}
            <div className="back-navigation-container">
                <button 
                    onClick={() => navigate('/')} 
                    className="back-to-home-btn"
                    aria-label="Navigate Back to Home Screen"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </button>
            </div>

            {/* STAGE A: PREMIUM CONFIGURATION CONTROL CENTER */}
            {stage === 'setup' && (
                <div className="setup-hero-wrapper">
                    <div className="text-section">
                        <span className="badge"><Sparkles size={14} /> Driven by Gemini AI 2.5</span>
                        <h1>Refine Your Technical <br />Interview <span>Presence.</span></h1>
                        <p>Simulate realistic real-time tech assessments. Get deep evaluations, question analytics scorecards, and custom PDF metrics reports instantaneously.</p>
                    </div>

                    <div className="form-card-container">
                        <h2>Configure Session</h2>
                        <form onSubmit={handleStartSetup}>
                            <div className="input-group">
                                <label><Briefcase size={16} /> Target Job Designation</label>
                                <input 
                                    type="text" 
                                    value={jobRole} 
                                    onChange={(e) => setJobRole(e.target.value)} 
                                    placeholder="e.g. Senior Backend Engineer" 
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label><Layers size={16} /> Difficulty Level</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                    <option value="easy">Easy (Syntactic Fundamentals)</option>
                                    <option value="medium">Medium (Architectural Applications)</option>
                                    <option value="hard">Hard (Distributed Infrastructure)</option>
                                </select>
                            </div>
                            <button className="button primary-button" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="spinner" size={18} />
                                        <span>Assembling Workspace...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Start Your Interview</span>
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* STAGE B: PREMIUM ASSESSMENT SIMULATION LAYER */}
            {stage === 'live' && questions.length > 0 && (
                <div className="live-workspace-grid">
                    <div className="left-stream-deck">
                        <div className="video-card">
                            <video ref={videoRef} autoPlay playsInline muted />
                            {!cameraActive && (
                                <div className="video-placeholder">
                                    <VideoOff size={32} />
                                    <span>Webcam stream inactive</span>
                                </div>
                            )}
                            <div className="proctor-badge">
                                <span className="pulse-dot" />
                                <span>PROCTOR FEED ACTIVE</span>
                            </div>
                        </div>

                        <div className="instruction-card">
                            <h3><AlertCircle size={16} /> Simulator Guidelines</h3>
                            <ul>
                                <li>The current question is read aloud automatically via synthesis.</li>
                                <li>Toggle the microphone state indicator to dictate your tech solutions.</li>
                                <li>Review your transcript buffer window before selecting forward progression.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="right-input-deck">
                        <div className="assessment-card">
                            <div className="card-header">
                                <span className="step-count">Question {currentIndex + 1} of {questions.length}</span>
                                <div className="progress-bar-track">
                                    <div className="fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                                </div>
                            </div>

                            <h2 className="live-question-text">{questions[currentIndex].text}</h2>

                            <div className="dictation-control-zone">
                                <button 
                                    type="button" 
                                    className={`action-mic-trigger ${isRecording ? 'active' : ''}`} 
                                    onClick={handleToggleRecording}
                                >
                                    {isRecording ? <Square size={20} fill="white" /> : <Mic size={20} />}
                                </button>
                                <span className="pulse-text">
                                    {isRecording ? "Speech diagnostics running live..." : "Microphone dormant. Click to initialize voice capture."}
                                </span>
                            </div>

                            <div className="transcript-preview-box">
                                <label>Real-time Dictation Text Stream Output</label>
                                <p className={currentAnswer ? 'filled' : 'empty'}>
                                    {currentAnswer || "Your verbal articulation log captures and populates data structures here..."}
                                </p>
                            </div>

                            <div className="card-footer">
                                <button className="button primary-button" onClick={handleNextQuestion}>
                                    <span>{currentIndex === questions.length - 1 ? "Finalize & Grade Loop" : "Commit & Proceed"}</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE C: PREMIUM BACKEND PROCESSING INTERFACE */}
            {stage === 'processing' && (
                <div className="processing-container">
                    <div className="radar-loader">
                        <div className="circle core" />
                        <div className="circle wave-1" />
                        <div className="circle wave-2" />
                    </div>
                    <h2>Compiling Engineering Report Matrix</h2>
                    <p>Gemini AI is auditing technical syntactic structures, analyzing semantic conceptual coverage, and formatting performance diagnostics score sheets...</p>
                </div>
            )}
        </main>
    );
};

export default AIInterview;