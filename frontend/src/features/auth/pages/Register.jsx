import React, { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import axios from "axios";
const VITE_API_URL = import.meta.env.VITE_API_URL

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

// ── Register ──────────────────────────────────────────────────────────────────
const Register = () => {
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null) // { message, type }

    const showToast = (message, type = 'success') => setToast({ message, type })
    const closeToast = useCallback(() => setToast(null), [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                `${VITE_API_URL}/api/auth/register`,
                { username, email, password },
                { withCredentials: true }
            );

            console.log("Register success:", res.data);

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }

            showToast("Account created successfully! Redirecting...", "success")

            setTimeout(() => {
                navigate("/login");
            }, 1500)

        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || "Registration failed. Please try again.", "error")
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            {/* Toast portal */}
            <div className='toast-wrapper'>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={closeToast}
                    />
                )}
            </div>

            <div className="form-container">
                <div className="brand-header">
                    <span className="brand-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83"/>
                            <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                    </span>
                    <h1>HireReady <span>AI</span></h1>
                </div>
                <p className="subtitle">Create your account to get started</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            placeholder="Create secure password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className='button primary-button' disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="switch-auth">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    )
}

export default Register;