import { useState, useEffect, useRef } from "react";
import {
    BrowserRouter as Router,
    Route,
    Link,
    Navigate,
    Routes,
    useNavigate,
} from "react-router-dom";
import "./App.css";

function App() {
    const [memes, setMemes] = useState([]);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [bids, setBids] = useState({});
    const [votes, setVotes] = useState({});
    const [captions, setCaptions] = useState({});
    const [vibes, setVibes] = useState({});
    const [typingText, setTypingText] = useState("");
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [bidAmount, setBidAmount] = useState(100);

    useEffect(() => {
        const storedMemes = localStorage.getItem("memes");
        const storedBids = localStorage.getItem("bids");
        const storedVotes = localStorage.getItem("votes");
        const storedCaptions = localStorage.getItem("captions");
        const storedVibes = localStorage.getItem("vibes");
        const storedUser = localStorage.getItem("user");
        if (storedMemes) setMemes(JSON.parse(storedMemes));
        if (storedBids) setBids(JSON.parse(storedBids));
        if (storedVotes) setVotes(JSON.parse(storedVotes));
        if (storedCaptions) setCaptions(JSON.parse(storedCaptions));
        if (storedVibes) setVibes(JSON.parse(storedVibes));
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }

        // Fake terminal typing effect
        const text = "Welcome to MemeHustle...";
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                setTypingText(text.substring(0, i + 1));
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        typeWriter();
    }, []);

    const handleBid = (memeId, amount) => {
        if (!isLoggedIn) return;

        const currentBids = bids[memeId] || [];
        const highestBid =
            currentBids.length > 0
                ? Math.max(...currentBids.map((bid) => bid.amount))
                : 0;

        // Only allow bidding if the new bid is higher than the current highest bid
        if (amount <= highestBid) {
            alert("Your bid must be higher than the current highest bid!");
            return;
        }

        const newBid = {
            userId: user.id,
            userName: user.name,
            amount: amount,
            timestamp: new Date().toISOString(),
        };

        // Check if user already has a bid
        const existingBidIndex = currentBids.findIndex(
            (bid) => bid.userId === user.id
        );

        let updatedBids;
        if (existingBidIndex !== -1) {
            // Update existing bid
            const updatedBidsArray = [...currentBids];
            updatedBidsArray[existingBidIndex] = newBid;
            updatedBids = {
                ...bids,
                [memeId]: updatedBidsArray,
            };
        } else {
            // Add new bid
            updatedBids = {
                ...bids,
                [memeId]: [...currentBids, newBid],
            };
        }

        setBids(updatedBids);
        localStorage.setItem("bids", JSON.stringify(updatedBids));

        // Show bid confirmation
        alert(`${user.name} bid ${amount} credits!`);
    };

    const getHighestBid = (memeId) => {
        const memeBids = bids[memeId] || [];
        if (memeBids.length === 0) return null;

        // Find the highest bid
        const highestBid = memeBids.reduce(
            (highest, current) =>
                current.amount > highest.amount ? current : highest,
            memeBids[0]
        );

        return {
            amount: highestBid.amount,
            bidder: highestBid.userName,
        };
    };

    const handleVote = (memeId, type) => {
        if (!isLoggedIn) return;

        const currentVotes = votes[memeId] || { upvotes: [], downvotes: [] };
        const userId = user.id;

        let newVotes = { ...currentVotes };

        if (type === "up") {
            // If user has already upvoted, remove the upvote
            if (currentVotes.upvotes.includes(userId)) {
                newVotes.upvotes = currentVotes.upvotes.filter(
                    (id) => id !== userId
                );
            } else {
                // Add upvote and remove from downvotes if exists
                newVotes.upvotes = [...currentVotes.upvotes, userId];
                newVotes.downvotes = currentVotes.downvotes.filter(
                    (id) => id !== userId
                );
            }
        } else {
            // If user has already downvoted, remove the downvote
            if (currentVotes.downvotes.includes(userId)) {
                newVotes.downvotes = currentVotes.downvotes.filter(
                    (id) => id !== userId
                );
            } else {
                // Add downvote and remove from upvotes if exists
                newVotes.downvotes = [...currentVotes.downvotes, userId];
                newVotes.upvotes = currentVotes.upvotes.filter(
                    (id) => id !== userId
                );
            }
        }

        const updatedVotes = { ...votes, [memeId]: newVotes };
        setVotes(updatedVotes);
        localStorage.setItem("votes", JSON.stringify(updatedVotes));
    };

    const getVoteCounts = (memeId) => {
        const memeVotes = votes[memeId] || { upvotes: [], downvotes: [] };
        return {
            upvotes: memeVotes.upvotes.length,
            downvotes: memeVotes.downvotes.length,
        };
    };

    const hasUserVoted = (memeId, type) => {
        if (!isLoggedIn) return false;
        const memeVotes = votes[memeId] || { upvotes: [], downvotes: [] };
        return type === "up"
            ? memeVotes.upvotes.includes(user.id)
            : memeVotes.downvotes.includes(user.id);
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleDelete = (memeId) => {
        const updatedMemes = memes.filter((meme) => meme.id !== memeId);
        setMemes(updatedMemes);
        localStorage.setItem("memes", JSON.stringify(updatedMemes));
    };

    const handleLogin = (name, email, password) => {
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const user = storedUsers.find(
            (u) => u.email === email && u.password === password
        );
        if (user) {
            setUser(user);
            setIsLoggedIn(true);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/");
        } else {
            alert("Invalid credentials");
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("user");
        navigate("/login");
    };

    const BidInput = ({ onBid, memeId }) => {
        const [localBidAmount, setLocalBidAmount] = useState(100);

        const handleBid = () => {
            onBid(memeId, localBidAmount);
        };

        return (
            <div className="flex items-center justify-center space-x-2">
                <input
                    type="number"
                    value={localBidAmount}
                    onChange={(e) => setLocalBidAmount(Number(e.target.value))}
                    min="1"
                    className="w-24 bg-gray-700 text-white p-2 rounded"
                />
                <button
                    onClick={handleBid}
                    className="bg-green-500 text-white p-2 rounded neon-glow"
                >
                    Bid Credits
                </button>
            </div>
        );
    };

    const MemeHub = () => (
        <div className="container mx-auto p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4 text-pink-500">
                <span className="text-shadow-neon">{typingText}</span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memes.map((meme) => (
                    <div
                        key={meme.id}
                        className="border p-4 rounded bg-gray-800 glitch-hover"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">{meme.title}</h2>
                            <span className="text-sm text-gray-400">
                                Posted by {meme.postedBy}
                            </span>
                        </div>
                        <img
                            src={meme.imageUrl}
                            alt={meme.title}
                            className="w-full h-48 object-cover"
                        />
                        <p className="mt-2">Tags: {meme.tags.join(", ")}</p>
                        <p className="mt-2">Caption: {captions[meme.id]}</p>
                        <p className="mt-2">Vibe: {vibes[meme.id]}</p>
                        <div className="mt-2">
                            {isLoggedIn ? (
                                <BidInput onBid={handleBid} memeId={meme.id} />
                            ) : (
                                <div className="text-yellow-500">
                                    Please{" "}
                                    <Link
                                        to="/login"
                                        className="text-blue-500 underline"
                                    >
                                        login
                                    </Link>{" "}
                                    to bid on memes
                                </div>
                            )}
                            <div className="mt-2">
                                {bids[meme.id]?.length > 0 ? (
                                    <div className="text-sm">
                                        <p className="font-bold">
                                            Highest Bid:{" "}
                                            {getHighestBid(meme.id).amount}
                                        </p>
                                        <p className="font-bold">
                                            Bidder Name:{" "}
                                            {getHighestBid(meme.id).bidder}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        No bids yet
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-2">
                            {isLoggedIn ? (
                                <>
                                    <button
                                        onClick={() =>
                                            handleVote(meme.id, "up")
                                        }
                                        className={`bg-green-500 text-white p-2 rounded mr-2 neon-glow ${
                                            hasUserVoted(meme.id, "up")
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        disabled={hasUserVoted(meme.id, "up")}
                                    >
                                        Upvote
                                    </button>
                                    <span className="mr-4">
                                        ↑ {getVoteCounts(meme.id).upvotes}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleVote(meme.id, "down")
                                        }
                                        className={`bg-green-500 text-white p-2 rounded mr-2 neon-glow ${
                                            hasUserVoted(meme.id, "down")
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        disabled={hasUserVoted(meme.id, "down")}
                                    >
                                        Downvote
                                    </button>
                                    <span>
                                        ↓ {getVoteCounts(meme.id).downvotes}
                                    </span>
                                </>
                            ) : (
                                <div className="text-yellow-500">
                                    Please{" "}
                                    <Link
                                        to="/login"
                                        className="text-blue-500 underline"
                                    >
                                        login
                                    </Link>{" "}
                                    to vote on memes
                                </div>
                            )}
                        </div>
                        {isLoggedIn && meme.userId === user?.id && (
                            <button
                                onClick={() => handleDelete(meme.id)}
                                className="bg-red-500 text-white p-2 rounded mt-2 neon-glow"
                            >
                                Delete Meme
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const MyMemes = () => {
        const [title, setTitle] = useState("");
        const [imageUrl, setImageUrl] = useState("");
        const [tags, setTags] = useState([]);
        const [tagInput, setTagInput] = useState("");

        const handleSubmit = (e) => {
            e.preventDefault();
            const newMeme = {
                id: Date.now(),
                title,
                imageUrl: imageUrl || "https://picsum.photos/200",
                tags,
                userId: user.id,
                postedBy: user.name,
                createdAt: new Date().toISOString(),
            };
            const updatedMemes = [...memes, newMeme];
            setMemes(updatedMemes);
            localStorage.setItem("memes", JSON.stringify(updatedMemes));
            setTitle("");
            setImageUrl("");
            setTags([]);
            setTagInput("");
            // Mock AI caption and vibe
            const mockCaption = `"${newMeme.title} to the moon!"`;
            const mockVibe = `"Neon ${newMeme.tags[0]} Vibes"`;
            setCaptions({ ...captions, [newMeme.id]: mockCaption });
            setVibes({ ...vibes, [newMeme.id]: mockVibe });
            localStorage.setItem(
                "captions",
                JSON.stringify({ ...captions, [newMeme.id]: mockCaption })
            );
            localStorage.setItem(
                "vibes",
                JSON.stringify({ ...vibes, [newMeme.id]: mockVibe })
            );
        };

        const handleTagInputKeyDown = (e) => {
            if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
            }
        };

        const removeTag = (index) => {
            setTags(tags.filter((_, i) => i !== index));
        };

        return (
            <div className="container mx-auto p-4 bg-gray-900 text-white">
                <h1 className="text-3xl font-bold mb-4 text-pink-500">
                    My Memes
                </h1>
                <form onSubmit={handleSubmit} className="mb-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                    />
                    <div className="flex flex-wrap mt-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-blue-500 text-white p-2 rounded mr-2 mb-2"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="ml-2 text-white"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 text-white p-2 mt-4 rounded neon-glow"
                    >
                        Create Meme
                    </button>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memes
                        .filter((meme) => meme.userId === user.id)
                        .map((meme) => (
                            <div
                                key={meme.id}
                                className="border p-4 rounded bg-gray-800 glitch-hover"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-bold">
                                        {meme.title}
                                    </h2>
                                    <span className="text-sm text-gray-400">
                                        Posted by {meme.postedBy}
                                    </span>
                                </div>
                                <img
                                    src={meme.imageUrl}
                                    alt={meme.title}
                                    className="w-full h-48 object-cover"
                                />
                                <p className="mt-2">
                                    Tags: {meme.tags.join(", ")}
                                </p>
                                <p className="mt-2">
                                    Caption: {captions[meme.id]}
                                </p>
                                <p className="mt-2">Vibe: {vibes[meme.id]}</p>

                                <div className="mt-2">
                                    <div className="mt-2">
                                        {bids[meme.id]?.length > 0 ? (
                                            <div className="text-sm">
                                                <p className="font-bold">
                                                    Highest Bid:{" "}
                                                    {
                                                        getHighestBid(meme.id)
                                                            .amount
                                                    }
                                                </p>
                                                <p className="font-bold">
                                                    Bidder Name:{" "}
                                                    {
                                                        getHighestBid(meme.id)
                                                            .bidder
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">
                                                No bids yet
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    {isLoggedIn ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleVote(meme.id, "up")
                                                }
                                                className={`bg-green-500 text-white p-2 rounded mr-2 neon-glow ${
                                                    hasUserVoted(meme.id, "up")
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                                disabled={hasUserVoted(
                                                    meme.id,
                                                    "up"
                                                )}
                                            >
                                                Upvote
                                            </button>
                                            <span className="mr-4">
                                                ↑{" "}
                                                {getVoteCounts(meme.id).upvotes}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleVote(meme.id, "down")
                                                }
                                                className={`bg-green-500 text-white p-2 rounded mr-2 neon-glow ${
                                                    hasUserVoted(
                                                        meme.id,
                                                        "down"
                                                    )
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                                disabled={hasUserVoted(
                                                    meme.id,
                                                    "down"
                                                )}
                                            >
                                                Downvote
                                            </button>
                                            <span>
                                                ↓{" "}
                                                {
                                                    getVoteCounts(meme.id)
                                                        .downvotes
                                                }
                                            </span>
                                        </>
                                    ) : (
                                        <div className="text-yellow-500">
                                            Please{" "}
                                            <Link
                                                to="/login"
                                                className="text-blue-500 underline"
                                            >
                                                login
                                            </Link>{" "}
                                            to vote on memes
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(meme.id)}
                                    className="bg-red-500 text-white p-2 rounded mt-2 neon-glow"
                                >
                                    Delete Meme
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        );
    };

    const Signup = () => {
        const [name, setName] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        const handleSignupSubmit = (e) => {
            e.preventDefault();
            const storedUsers = JSON.parse(
                localStorage.getItem("users") || "[]"
            );
            const existingUser = storedUsers.find((u) => u.email === email);
            if (existingUser) {
                alert("User already exists");
            } else {
                const newUser = { id: Date.now(), name, email, password };
                storedUsers.push(newUser);
                localStorage.setItem("users", JSON.stringify(storedUsers));
                handleLogin(name, email, password);
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

    const Login = () => {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        const handleLoginSubmit = (e) => {
            e.preventDefault();
            handleLogin(null, email, password);
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

    const Header = () => {
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
                        <div
                            className="relative inline-block"
                            ref={dropdownRef}
                        >
                            <button
                                className="text-white flex items-center"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {user.name}
                                <span className="ml-1">▼</span>
                            </button>
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

    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<MemeHub />} />
                <Route path="/my-memes" element={<MyMemes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </>
    );
}

export default App;
