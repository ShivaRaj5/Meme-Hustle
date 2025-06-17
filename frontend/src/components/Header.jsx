import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Header = ({ user, isLoggedIn, handleLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-pink-500">MemeHustle</h1>
            <nav>
                <Link to="/" className="text-white mr-4">
                    MemeHub
                </Link>
                {isLoggedIn && (
                    <Link to="/my-memes" className="text-white mr-4">
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
                        <Link to="/login" className="text-white mr-4">
                            Login
                        </Link>
                        <Link to="/signup" className="text-white">
                            Signup
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header; 