import React from 'react'
import { useNavigate, useLocation } from 'react-router'
// Import premium modern icons from lucide-react
import { Zap, LogOut } from 'lucide-react'
import "./Navbar.scss"

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isLoggedIn = location.state?.isLoggedIn

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        if (typeof showToast !== 'undefined') {
            showToast("Logged out successfully. See you soon!", "success")
        }
        setTimeout(() => {
            navigate("/login", { state: { isLoggedIn: false } })
        }, 1500)
    }

    return (
        <nav className='home-navbar'>
            <div className='home-navbar__brand' onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                {/* Brand Icon */}
                <Zap className="brand-logo-icon" size={20} fill="currentColor" />
                <span>HireReadyAI</span>
            </div>

            <div className='home-navbar__actions'>
                {isLoggedIn ? (
                    <>
                        {/* Dynamic AI Portal Navigation Trigger Button */}
                        <button onClick={() => navigate('/interview')} className='home-navbar__ai-portal-btn'>
                            <div className='ai-glow-pulse-wrapper'>
                                {/* Lucide Spark/Zap Icon with our custom moving CSS classes */}
                                <Zap className="moving-spark-icon" size={16} fill="currentColor" />
                            </div>
                            AI Interview
                        </button>

                        <button onClick={handleLogout} className='home-navbar__logout'>
                            <LogOut size={16} style={{ marginRight: '8px' }} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate('/login')} className='home-navbar__login'>Log in</button>
                        <button onClick={() => navigate('/register')} className='home-navbar__signup'>Sign up</button>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar