import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const user = storedUsers.find(
            (u) => u.email === email && u.password === password
        );
        if (user) {
            login(user);
            navigate("/");
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4 text-pink-500">Login</h1>
            <form onSubmit={handleLoginSubmit} className="mb-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white p-2 mt-4 rounded neon-glow"
                >
                    Login
                </button>
            </form>
            <p className="mt-2">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-500">
                    Create one
                </Link>
                .
            </p>
        </div>
    );
};

export default Login; 