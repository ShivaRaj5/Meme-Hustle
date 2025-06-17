import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSignupSubmit = (e) => {
        e.preventDefault();
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const existingUser = storedUsers.find((u) => u.email === email);
        if (existingUser) {
            alert("User already exists");
        } else {
            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                credits: 500, // Add initial credits
            };
            storedUsers.push(newUser);
            localStorage.setItem("users", JSON.stringify(storedUsers));
            login(newUser); // Use the login function from AuthContext
            navigate("/");
        }
    };

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4 text-pink-500">
                Signup
            </h1>
            <form onSubmit={handleSignupSubmit} className="mb-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                />
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
                    Signup
                </button>
            </form>
            <p className="mt-2">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500">
                    Login here
                </Link>
                .
            </p>
        </div>
    );
};

export default Signup; 