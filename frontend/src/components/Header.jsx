import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const getLinkClass = (path) => {
        return `mr-4 transition-colors ${
            isActive(path)
                ? "text-pink-500 border-b-2 border-pink-500"
                : "text-white hover:text-pink-500"
        }`;
    };

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-pink-500">MemeHustle</h1>
            <nav>
                <Link to="/" className={getLinkClass("/")}>
                    MemeHub
                </Link>
                {isLoggedIn && (
                    <Link to="/my-memes" className={getLinkClass("/my-memes")}>
                        My Memes
                    </Link>
                )}
                {isLoggedIn ? (
                    <div className="relative inline-block" ref={dropdownRef}>
                        <div className="flex items-center">
                            <span className="text-green-400 mr-4">
                                Credits: {user.credits}
                            </span>
                            <button
                                className="text-white flex items-center"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {user.name}
                                <span className="ml-1">▼</span>
                            </button>
                        </div>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-10">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setShowDropdown(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link to="/login" className={getLinkClass("/login")}>
                            Login
                        </Link>
                        <Link to="/signup" className={getLinkClass("/signup")}>
                            Signup
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header; 