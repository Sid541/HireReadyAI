import React, { useState, useRef, useCallback } from 'react'
import "./Home.scss"
import axios from "axios"
import { useNavigate } from 'react-router'
import { useLocation } from 'react-router';
import Navbar from './components/Navbar';

// ── Inline Toast Component ────────────────────────────────────────────────────
const Toast = ({ message, type, onClose, duration = 3000 }) => {
    React.useEffect(() => {
        const t = setTimeout(onClose, duration)
        return () => clearTimeout(t)
    }, [onClose, duration])

    return (
        <div className={`toast toast--${type}`}>
            <span className='toast__icon'>
                {type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                )}
            </span>
            <span className='toast__message'>{message}</span>
            <button className='toast__close' onClick={onClose} aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <span className='toast__progress' style={{ animationDuration: `${duration}ms` }} />
        </div>
    )
}

// ── Home ──────────────────────────────────────────────────────────────────────
const Home = () => {
    const [loading, setLoading] = useState(false)
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [reports, setReports] = useState([])
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSuccessMessage, setUploadSuccessMessage] = useState("")
    const [toast, setToast] = useState(null) // { message, type }

    const resumeInputRef = useRef()
    const navigate = useNavigate()
    const location = useLocation()
    const isLoggedIn = location.state?.isLoggedIn

    const showToast = (message, type = 'success') => setToast({ message, type })
    const closeToast = useCallback(() => setToast(null), [])

    const handleGenerateReport = async () => {
        try {
            if (!jobDescription) {
                showToast("Job Description is required", "error")
                return
            }

            const resumeFile = resumeInputRef.current.files[0]

            if (!resumeFile && !selfDescription) {
                showToast("Please upload a resume or add a self description", "error")
                return
            }

            setUploadProgress(0)
            setUploadSuccessMessage("")
            setLoading(true)

            const formData = new FormData()
            formData.append("jobDescription", jobDescription)
            formData.append("selfDescription", selfDescription)
            if (resumeFile) formData.append("resumeFile", resumeFile)

            const response = await axios.post(
                "http://localhost:3000/api/interview",
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        setUploadProgress(percentCompleted)
                        if (percentCompleted === 100) {
                            setUploadSuccessMessage("🎉 Your resume uploaded successfully!")
                        }
                    },
                }
            )

            setLoading(false)
            setUploadProgress(0)

            if (response.data?._id) {
                navigate(`/interview/${response.data._id}`)
            }

        } catch (error) {
            setLoading(false)
            setUploadProgress(0)
            setUploadSuccessMessage("")
            showToast(error.response?.data?.message || "Failed to generate report. Please try again.", "error")
            console.error("Error generating report:", error.response?.data || error.message)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        showToast("Logged out successfully. See you soon!", "success")
        setTimeout(() => {
            navigate("/login", { state: { isLoggedIn: false } })
        }, 1500)
    }

    return (
        <div className='home-page'>

            {/* Toast */}
            <div className='toast-wrapper'>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={closeToast}
                    />
                )}
            </div>

            {/* Navbar */}
           <Navbar/>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here... e.g. 'Senior Frontend Engineer...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>

                            <label className='dropzone' htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="16 16 12 12 8 16" />
                                        <line x1="12" y1="12" x2="12" y2="21" />
                                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                    </svg>
                                </span>
                                <p className='dropzone__title'>Click to upload or drag & drop</p>
                                <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resumeFile'
                                    accept='.pdf,.docx'
                                />
                            </label>

                            {uploadProgress > 0 && (
                                <div className="upload-progress-container" style={{ marginTop: '15px' }}>
                                    <div className="progress-bar-bg" style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                        <div className="progress-bar-fill" style={{
                                            width: `${uploadProgress}%`,
                                            backgroundColor: uploadProgress === 100 ? '#22c55e' : '#3b82f6',
                                            height: '100%',
                                            transition: 'width 0.1s ease-out'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                        Uploading resume: {uploadProgress}%
                                    </span>
                                </div>
                            )}

                            {uploadSuccessMessage && (
                                <p className="upload-success-alert" style={{ color: '#16a34a', fontWeight: '500', fontSize: '14px', marginTop: '10px' }}>
                                    {uploadSuccessMessage}
                                </p>
                            )}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Self Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation • Approx 30s</span>
                    <button
                        onClick={handleGenerateReport}
                        className={`generate-btn${loading && uploadProgress === 100 ? ' generate-btn--processing' : ''}`}
                        disabled={loading}
                    >
                        {loading && uploadProgress < 100 ? (
                            `Uploading (${uploadProgress}%)`
                        ) : loading && uploadProgress === 100 ? (
                            <>
                                <span className='generate-btn__spinner' />
                                Analyzing your profile...
                            </>
                        ) : (
                            "Generate My Interview Strategy"
                        )}
                    </button>
                </div>
            </div>

            {/* Recent Reports */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map((report) => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                    Match Score: {report.matchScore}%
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home;