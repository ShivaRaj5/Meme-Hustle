import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BidInput from "./BidInput";

const MemeHub = () => {
    const [memes, setMemes] = useState([]);
    const [bids, setBids] = useState({});
    const [votes, setVotes] = useState({});
    const [captions, setCaptions] = useState({});
    const [vibes, setVibes] = useState({});
    const [typingText, setTypingText] = useState("");
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

    return (
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
                                postedby {meme.userName}
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
};

export default MemeHub; 