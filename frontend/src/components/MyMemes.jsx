import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BidInput from "./BidInput";

const MyMemes = () => {
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [memes, setMemes] = useState([]);
    const [bids, setBids] = useState({});
    const [votes, setVotes] = useState({});
    const [captions, setCaptions] = useState({});
    const [vibes, setVibes] = useState({});
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert("Please login to create memes");
            return;
        }

        const newMeme = {
            id: Date.now(),
            title,
            imageUrl,
            tags,
            userId: user.id,
            userName: user.name,
        };

        const updatedMemes = [...memes, newMeme];
        setMemes(updatedMemes);
        localStorage.setItem("memes", JSON.stringify(updatedMemes));

        // Generate mock caption and vibe
        const mockCaption = `"${title}" - ${user.name}`;
        const mockVibe = "🔥 Lit AF";
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

        // Reset form
        setTitle("");
        setImageUrl("");
        setTags([]);
        setTagInput("");
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleBid = (memeId, amount) => {
        if (!isLoggedIn) return;

        // Check if user has enough credits
        if (user.credits < amount) {
            alert("You don't have enough credits!");
            return;
        }

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

        // Update user's credits
        const updatedUser = {
            ...user,
            credits: user.credits - amount,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update users list in localStorage
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const updatedUsers = storedUsers.map((u) =>
            u.id === user.id ? updatedUser : u
        );
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        setBids(updatedBids);
        localStorage.setItem("bids", JSON.stringify(updatedBids));

        // Show bid confirmation
        alert(
            `${user.name} bid ${amount} credits! Remaining credits: ${updatedUser.credits}`
        );
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

    const handleDelete = (memeId) => {
        const updatedMemes = memes.filter((meme) => meme.id !== memeId);
        setMemes(updatedMemes);
        localStorage.setItem("memes", JSON.stringify(updatedMemes));
    };

    // Filter memes to show only the user's memes
    const userMemes = memes.filter((meme) => meme.userId === user?.id);

    return (
        <div className="w-full p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4 text-pink-500">My Memes</h1>
            {isLoggedIn ? (
                <>
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Meme Title"
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
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Add Tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="bg-blue-500 text-white p-2 rounded neon-glow"
                            >
                                Add Tag
                            </button>
                        </div>
                        <div className="mb-4">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-gray-700 text-white px-2 py-1 rounded mr-2"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-2 text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="bg-green-500 text-white p-2 rounded neon-glow"
                        >
                            Create Meme
                        </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userMemes.map((meme) => (
                            <div
                                key={meme.id}
                                className="border p-4 rounded bg-gray-800 glitch-hover"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-bold">
                                        {meme.title}
                                    </h2>
                                </div>
                                <img
                                    src={meme.imageUrl}
                                    alt={meme.title}
                                    className="w-full h-48 object-cover"
                                />
                                <p className="mt-2">Tags: {meme.tags.join(", ")}</p>
                                <p className="mt-2">
                                    Caption: {captions[meme.id]}
                                </p>
                                <p className="mt-2">Vibe: {vibes[meme.id]}</p>
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
                                <div className="mt-2">
                                    <button
                                        onClick={() => handleVote(meme.id, "up")}
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
                                        onClick={() => handleVote(meme.id, "down")}
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
                </>
            ) : (
                <div className="text-center">
                    <p className="text-yellow-500 mb-4">
                        Please login to view and create memes
                    </p>
                    <Link
                        to="/login"
                        className="bg-green-500 text-white p-2 rounded neon-glow"
                    >
                        Login
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyMemes;
