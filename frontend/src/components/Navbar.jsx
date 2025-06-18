import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <span className="text-white font-bold text-xl">MemeHustle</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-gray-300 hover:text-white transition-colors duration-200"
                        >
                            Home
                        </Link>
                        <Link
                            to="/leaderboard"
                            className="text-gray-300 hover:text-white transition-colors duration-200"
                        >
                            Leaderboard
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center space-x-2 text-sm">
                                    <span className="text-gray-300">Welcome,</span>
                                    <span className="text-white font-medium">{user.name}</span>
                                    <span className="text-purple-400">({user.credits} credits)</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 