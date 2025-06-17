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
        <div className="w-full min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-pink-500/20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-pink-500 mb-2 animate-fade-in">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors duration-200"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors duration-200"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                        Sign In
                    </button>
                </form>
                <div className="text-center">
                    <p className="text-gray-400">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-pink-500 hover:text-pink-400 font-medium transition-colors duration-200"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 