import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-gray-800 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-pink-500">MemeHustle</h1>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:block">
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
                                    <span className="ml-1 transition-transform duration-200">
                                        {showDropdown ? "▲" : "▼"}
                                    </span>
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

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-white focus:outline-none"
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
            >
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        to="/"
                        className={`block px-3 py-2 ${getLinkClass("/")}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        MemeHub
                    </Link>
                    {isLoggedIn && (
                        <Link
                            to="/my-memes"
                            className={`block px-3 py-2 ${getLinkClass("/my-memes")}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            My Memes
                        </Link>
                    )}
                    {isLoggedIn ? (
                        <>
                            <div className="px-3 py-2 text-green-400">
                                Credits: {user.credits}
                            </div>
                            <div className="px-3 py-2 text-white">
                                {user.name}
                            </div>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 text-white hover:text-pink-500"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`block px-3 py-2 ${getLinkClass("/login")}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className={`block px-3 py-2 ${getLinkClass("/signup")}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header; 