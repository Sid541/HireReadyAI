import React, { useState, useRef } from 'react'
import "./Home.scss"
import axios from "axios"
import { useNavigate } from 'react-router'
import { useLocation } from 'react-router';

const Home = () => {

    const [loading, setLoading] = useState(false)
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [reports, setReports] = useState([])

    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const location = useLocation();

    const isLoggedIn = location.state?.isLoggedIn;


    const handleGenerateReport = async () => {

        try {

            if (!jobDescription) {
                alert("Job Description is required")
                return
            }

            const resumeFile = resumeInputRef.current.files[0]

            if (!resumeFile && !selfDescription) {
                alert("Please upload resume or add self description")
                return
            }

            setLoading(true)

            // Create FormData
            const formData = new FormData()

            formData.append("jobDescription", jobDescription)
            formData.append("selfDescription", selfDescription)

            if (resumeFile) {
                formData.append("resumeFile", resumeFile)
            }

            // Axios API Call
            const response = await axios.post(
                "http://localhost:3000/api/interview",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            console.log(response.data)

            setLoading(false)

            // Navigate
            if (response.data?._id) {
                navigate(`/interview/${response.data._id}`)
            }

        } catch (error) {

            setLoading(false)

            console.error(
                "Error generating report:",
                error.response?.data || error.message
            )
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }
 console.log(isLoggedIn);
 
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Optional: if using cookies, you might need an axios call to clear them
        navigate("/login", {
            state: {
                isLoggedIn: false
            }
        });
    };

    return (
        <div className='home-page'>

            {/* Navbar */}
            <nav className='home-navbar'>
                <div className='home-navbar__brand'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span>InterviewAI</span>
                </div>

                <div className='home-navbar__actions'>
                    {isLoggedIn ? (
                        /* Show Logout if token exists */
                        <button onClick={handleLogout} className='home-navbar__logout'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </button>
                    ) : (
                        /* Show Login/Signup if no token */
                        <>
                            <button onClick={() => navigate('/login')} className='home-navbar__login'>
                                Log in
                            </button>
                            <button onClick={() => navigate('/register')} className='home-navbar__signup'>
                                Sign up
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>

                <p>
                    Let our AI analyze the job requirements and your unique profile
                    to build a winning strategy.
                </p>
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

                            <span className='badge badge--required'>
                                Required
                            </span>

                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...
e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />

                        <div className='char-counter'>
                            {jobDescription.length} / 5000 chars
                        </div>

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

                                <span className='badge badge--best'>
                                    Best Results
                                </span>
                            </label>

                            <label className='dropzone' htmlFor='resume'>

                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="16 16 12 12 8 16" />
                                        <line x1="12" y1="12" x2="12" y2="21" />
                                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                    </svg>
                                </span>

                                <p className='dropzone__title'>
                                    Click to upload or drag & drop
                                </p>

                                <p className='dropzone__subtitle'>
                                    PDF or DOCX (Max 5MB)
                                </p>

                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resumeFile'     // matches uploadResume.single("resumeFile")
                                    accept='.pdf,.docx'
                                />

                            </label>

                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'>
                            <span>OR</span>
                        </div>

                        {/* Self Description */}
                        <div className='self-description'>

                            <label
                                className='section-label'
                                htmlFor='selfDescription'
                            >
                                Quick Self-Description
                            </label>

                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience..."
                            />

                        </div>

                        {/* Info Box */}
                        <div className='info-box'>

                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            </span>

                            <p>
                                Either a <strong>Resume</strong> or a
                                <strong> Self Description</strong> is required.
                            </p>

                        </div>

                    </div>

                </div>

                {/* Footer */}
                <div className='interview-card__footer'>

                    <span className='footer-info'>
                        AI-Powered Strategy Generation • Approx 30s
                    </span>

                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                    >
                        Generate My Interview Strategy
                    </button>

                </div>

            </div>

            {/* Reports */}
            {reports.length > 0 && (
                <section className='recent-reports'>

                    <h2>My Recent Interview Plans</h2>

                    <ul className='reports-list'>

                        {reports.map((report) => (

                            <li
                                key={report._id}
                                className='report-item'
                                onClick={() =>
                                    navigate(`/interview/${report._id}`)
                                }
                            >

                                <h3>
                                    {report.title || 'Untitled Position'}
                                </h3>

                                <p className='report-meta'>
                                    Generated on{" "}
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </p>

                                <p
                                    className={`match-score ${report.matchScore >= 80
                                        ? 'score--high'
                                        : report.matchScore >= 60
                                            ? 'score--mid'
                                            : 'score--low'
                                        }`}
                                >
                                    Match Score: {report.matchScore}%
                                </p>

                            </li>

                        ))}

                    </ul>

                </section>
            )}

            {/* Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>

        </div>
    )
}

export default Home;








