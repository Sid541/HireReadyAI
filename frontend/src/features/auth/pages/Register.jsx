import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import axios from "axios";

const Register = () => {

    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:3000/api/auth/register", // ✅ backend
                {
                   username,
                    email,
                    password
                },
                { withCredentials: true }
            );

            console.log("Register success:", res.data);

            // optional: auto-login after register
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }

            navigate('/'); // or navigate('/login')

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Registration failed");
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

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter email address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className='button primary-button'>
                        Register
                    </button>

                </form>

                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    )
}

export default Register;