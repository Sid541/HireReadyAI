import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import axios from "axios";

const Login = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:3000/api/auth/login", // ✅ fixed
                { email, password },
                { withCredentials: true }
                
            );
            

            console.log("Login success:", res.data);

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }

            navigate("/", {
    state: {
        isLoggedIn: true
    }
});

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main>
                <h1>Loading.......</h1>
            </main>
        );
    }

   // Inside the return statement of Login.jsx
// Replace the return statement in Login.jsx with this:
return (
    <main>
        <div className="form-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Email</label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="Enter email address"
                    />
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        placeholder="Enter password"
                    />
                </div>

                <button 
                    className='button primary-button' 
                    disabled={loading}
                >
                    {loading ? "Authenticating..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    </main>
)
}

export default Login;