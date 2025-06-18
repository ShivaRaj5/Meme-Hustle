import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BidInput from "./BidInput";
import noMemeImage from "../assets/nomemeimage.jpeg";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { memesAPI, bidsAPI, votesAPI } from "../services/api";
import socketService from "../services/socket";

const MemeHub = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [memes, setMemes] = useState([]);
    const [bids, setBids] = useState({});
    const [votes, setVotes] = useState({});
    const [userVotes, setUserVotes] = useState({});
    const [captions, setCaptions] = useState({});
    const [vibes, setVibes] = useState({});
    const [typingText, setTypingText] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [votingStates, setVotingStates] = useState({});
    const [deletingStates, setDeletingStates] = useState({});

    useEffect(() => {
        loadMemes();
    }, []);

    useEffect(() => {
        setIsLoggedIn(!!user);
    }, [user]);

    // Load user votes when user state changes
    useEffect(() => {
        if (user && memes.length > 0) {
            loadUserVotes(memes);
        }
    }, [user, memes]);

    // Fake terminal typing effect
    useEffect(() => {
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

    // Set up Socket.IO listeners
    useEffect(() => {
        setupSocketListeners();

        // Cleanup on unmount
        return () => {
            socketService.removeAllListeners();
        };
    }, []);

    const setupSocketListeners = () => {
        // Listen for new memes
        socketService.onMemeCreated(({ meme }) => {
            setMemes(prevMemes => [meme, ...prevMemes]);
            if (meme.caption) {
                setCaptions(prev => ({ ...prev, [meme.id]: meme.caption }));
            }
            if (meme.vibe) {
                setVibes(prev => ({ ...prev, [meme.id]: meme.vibe }));
            }
            toast.success(`New meme created: ${meme.title}`);
        });

        // Listen for meme updates
        socketService.onMemeUpdated(({ meme }) => {
            setMemes(prevMemes => 
                prevMemes.map(m => m.id === meme.id ? meme : m)
            );
            if (meme.caption) {
                setCaptions(prev => ({ ...prev, [meme.id]: meme.caption }));
            }
            if (meme.vibe) {
                setVibes(prev => ({ ...prev, [meme.id]: meme.vibe }));
            }
        });

        // Listen for meme deletions
        socketService.onMemeDeleted(({ memeId }) => {
            setMemes(prevMemes => prevMemes.filter(m => m.id !== memeId));
            setCaptions(prev => {
                const newCaptions = { ...prev };
                delete newCaptions[memeId];
                return newCaptions;
            });
            setVibes(prev => {
                const newVibes = { ...prev };
                delete newVibes[memeId];
                return newVibes;
            });
        });

        // Listen for new bids
        socketService.onBidPlaced(({ memeId, bid, userCredits }) => {
            setBids(prevBids => ({
                ...prevBids,
                [memeId]: [...(prevBids[memeId] || []).filter(b => b.user_id !== bid.user_id), bid]
            }));
            
            // Update user credits if it's the current user
            if (user && bid.user_id === user.id) {
                refreshUser();
            }
        });

        // Listen for bid cancellations
        socketService.onBidCancelled(({ memeId, bidId, userCredits }) => {
            setBids(prevBids => ({
                ...prevBids,
                [memeId]: (prevBids[memeId] || []).filter(b => b.id !== bidId)
            }));
            
            // Update user credits if it's the current user
            if (user && userCredits !== undefined) {
                refreshUser();
            }
        });

        // Listen for vote updates
        socketService.onVoteUpdated(({ memeId, meme }) => {
            setVotes(prevVotes => ({
                ...prevVotes,
                [memeId]: { upvotes: meme.upvotes, downvotes: meme.downvotes }
            }));
        });

        // Listen for credit updates
        socketService.onCreditsUpdated(({ userId, credits }) => {
            if (user && userId === user.id) {
                refreshUser();
            }
        });
    };

    const loadMemes = async () => {
        try {
            setLoading(true);
            const { memes } = await memesAPI.getAll();
            setMemes(memes);
            
            // Load captions and vibes from memes
            const captionsData = {};
            const vibesData = {};
            memes.forEach(meme => {
                if (meme.caption) captionsData[meme.id] = meme.caption;
                if (meme.vibe) vibesData[meme.id] = meme.vibe;
            });
            setCaptions(captionsData);
            setVibes(vibesData);
            
            // Load bids and votes for each meme
            await loadBidsAndVotes(memes);
            await loadUserVotes(memes);
        } catch (error) {
            console.error("Failed to load memes:", error);
            toast.error("Failed to load memes");
        } finally {
            setLoading(false);
        }
    };

    const loadBidsAndVotes = async (memesList) => {
        try {
            const bidsData = {};
            const votesData = {};
            
            for (const meme of memesList) {
                // Load bids
                try {
                    const { bids } = await bidsAPI.getByMeme(meme.id);
                    bidsData[meme.id] = bids;
                } catch (error) {
                    console.error(`Failed to load bids for meme ${meme.id}:`, error);
                    bidsData[meme.id] = [];
                }
                
                // Load votes
                try {
                    const { upvotes, downvotes } = await votesAPI.getByMeme(meme.id);
                    votesData[meme.id] = { upvotes: upvotes, downvotes: downvotes };
                } catch (error) {
                    console.error(`Failed to load votes for meme ${meme.id}:`, error);
                    votesData[meme.id] = { upvotes: 0, downvotes: 0 };
                }
            }
            
            setBids(bidsData);
            setVotes(votesData);
        } catch (error) {
            console.error("Failed to load bids and votes:", error);
        }
    };

    const loadUserVotes = async (memesList) => {
        if (!user) return;
        
        try {
            const userVotesData = {};
            
            for (const meme of memesList) {
                try {
                    const { voteType } = await votesAPI.getUserVote(meme.id);
                    userVotesData[meme.id] = voteType;
                } catch (error) {
                    console.error(`Failed to load user vote for meme ${meme.id}:`, error);
                    userVotesData[meme.id] = null;
                }
            }
            
            setUserVotes(userVotesData);
        } catch (error) {
            console.error("Failed to load user votes:", error);
        }
    };

    const handleBid = async (memeId, amount) => {
        if (!isLoggedIn) return;

        // Check if user has enough credits
        if (user.credits < amount) {
            toast.error("You don't have enough credits!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        const currentBids = bids[memeId] || [];
        const highestBid =
            currentBids.length > 0
                ? Math.max(...currentBids.map((bid) => bid.amount))
                : 0;

        // Only allow bidding if the new bid is higher than the current highest bid
        if (amount <= highestBid) {
            toast.error(
                "Your bid must be higher than the current highest bid!",
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );
            return;
        }

        try {
            const { bid, remainingCredits } = await bidsAPI.place(memeId, amount);
            
            // Update local state
            const updatedBids = {
                ...bids,
                [memeId]: [...(bids[memeId] || []).filter(b => b.user_id !== user.id), bid]
            };
            setBids(updatedBids);
            
            // Refresh user credits
            await refreshUser();

            // Show bid confirmation
            toast.success(
                `${user.name} bid ${amount} credits! Remaining credits: ${remainingCredits}`,
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );
        } catch (error) {
            toast.error(error.message || "Failed to place bid", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
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
            bidder: highestBid.user_name,
        };
    };

    const handleVote = async (memeId, type) => {
        if (!isLoggedIn) return;

        // Set loading state for this specific vote
        setVotingStates(prev => ({ ...prev, [`${memeId}-${type}`]: true }));

        try {
            const { meme: updatedMeme, voteType, action } = await votesAPI.vote(memeId, type);
            
            // Update local votes state
            const updatedVotes = {
                ...votes,
                [memeId]: { upvotes: updatedMeme.upvotes, downvotes: updatedMeme.downvotes }
            };
            setVotes(updatedVotes);
            
            // Update user vote state
            const updatedUserVotes = { ...userVotes };
            if (action === 'removed') {
                // Vote was removed
                updatedUserVotes[memeId] = null;
            } else if (action === 'changed') {
                // Vote type was changed
                updatedUserVotes[memeId] = voteType;
            } else if (action === 'added') {
                // New vote was added
                updatedUserVotes[memeId] = voteType;
            }
            setUserVotes(updatedUserVotes);
        } catch (error) {
            toast.error(error.message || "Failed to vote", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } finally {
            // Clear loading state
            setVotingStates(prev => ({ ...prev, [`${memeId}-${type}`]: false }));
        }
    };

    const getVoteCounts = (memeId) => {
        const memeVotes = votes[memeId] || { upvotes: 0, downvotes: 0 };
        return {
            upvotes: memeVotes.upvotes,
            downvotes: memeVotes.downvotes,
        };
    };

    const hasUserVoted = (memeId, type) => {
        if (!isLoggedIn) return false;
        return userVotes[memeId] === type;
    };

    const handleDelete = async (memeId) => {
        // Set loading state for this specific delete
        setDeletingStates(prev => ({ ...prev, [memeId]: true }));

        try {
            await memesAPI.delete(memeId);
            const updatedMemes = memes.filter((meme) => meme.id !== memeId);
            setMemes(updatedMemes);
            toast.success("Meme deleted successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to delete meme");
        } finally {
            // Clear loading state
            setDeletingStates(prev => ({ ...prev, [memeId]: false }));
        }
    };

    const handleImageError = (e) => {
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = noMemeImage;
    };

    const handleCreateMeme = () => {
        if (isLoggedIn) {
            navigate('/my-memes');
        } else {
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-gray-900 text-white flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading memes...</div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-pink-500 animate-fade-in">
                    <span className="text-shadow-neon">{typingText}</span>
                </h1>
                {memes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-bold text-pink-500 mb-4">No Memes Yet!</h2>
                        <p className="text-gray-300 mb-6">Be the first to create and share your memes with the community.</p>
                        <button
                            onClick={handleCreateMeme}
                            className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                        >
                            Create Your First Meme
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {memes.map((meme) => (
                            <div
                                key={meme.id}
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-xl font-bold text-pink-500">
                                            {meme.title}
                                        </h2>
                                        <span className="text-sm text-gray-400">
                                            Posted by {meme.user_name || "Anonymous"}
                                        </span>
                                    </div>
                                    <div className="relative aspect-video mb-4">
                                        <img
                                            src={meme.image_url}
                                            alt={meme.title}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-300">
                                            Tags: {meme.tags?.join(", ") || "No tags"}
                                        </p>
                                        <p className="text-sm italic text-gray-400">
                                            {captions[meme.id]}
                                        </p>
                                        <p className="text-sm font-medium text-pink-500">
                                            {vibes[meme.id]}
                                        </p>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {isLoggedIn ? (
                                            <BidInput
                                                onBid={handleBid}
                                                memeId={meme.id}
                                                userCredits={user.credits}
                                            />
                                        ) : (
                                            <div className="text-yellow-500 text-sm">
                                                Please{" "}
                                                <Link
                                                    to="/login"
                                                    className="text-blue-500 underline hover:text-blue-400 transition-colors"
                                                >
                                                    login
                                                </Link>{" "}
                                                to bid on memes
                                            </div>
                                        )}
                                        <div className="text-sm">
                                            {bids[meme.id]?.length > 0 ? (
                                                <div className="bg-gray-700 p-2 rounded">
                                                    <p className="font-medium">
                                                        Highest Bid:{" "}
                                                        <span className="text-green-400">
                                                            {
                                                                getHighestBid(
                                                                    meme.id
                                                                ).amount
                                                            }
                                                        </span>
                                                    </p>
                                                    <p className="text-gray-300">
                                                        by{" "}
                                                        {
                                                            getHighestBid(meme.id)
                                                                .bidder
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 italic">
                                                    No bids yet
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            {isLoggedIn ? (
                                                <>
                                                    <button
                                                        onClick={() => handleVote(meme.id, "up")}
                                                        disabled={userVotes[meme.id] === "up" || votingStates[`${meme.id}-up`]}
                                                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                                            userVotes[meme.id] === "up" || votingStates[`${meme.id}-up`]
                                                                ? "bg-green-500/50 cursor-not-allowed"
                                                                : "bg-green-500 hover:bg-green-600"
                                                        }`}
                                                    >
                                                        <span>↑</span>
                                                        <span>{getVoteCounts(meme.id).upvotes}</span>
                                                        {votingStates[`${meme.id}-up`] && (
                                                            <svg className="animate-spin h-3 w-3 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleVote(meme.id, "down")}
                                                        disabled={userVotes[meme.id] === "down" || votingStates[`${meme.id}-down`]}
                                                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                                            userVotes[meme.id] === "down" || votingStates[`${meme.id}-down`]
                                                                ? "bg-red-500/50 cursor-not-allowed"
                                                                : "bg-red-500 hover:bg-red-600"
                                                        }`}
                                                    >
                                                        <span>↓</span>
                                                        <span>{getVoteCounts(meme.id).downvotes}</span>
                                                        {votingStates[`${meme.id}-down`] && (
                                                            <svg className="animate-spin h-3 w-3 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        )}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-yellow-500 text-sm">
                                                    Please{" "}
                                                    <Link
                                                        to="/login"
                                                        className="text-blue-500 underline hover:text-blue-400 transition-colors"
                                                    >
                                                        login
                                                    </Link>{" "}
                                                    to vote
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isLoggedIn && meme.user_id === user?.id && (
                                        <button
                                            onClick={() => handleDelete(meme.id)}
                                            disabled={deletingStates[meme.id]}
                                            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:bg-red-500/50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {deletingStates[meme.id] && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            <span>{deletingStates[meme.id] ? "Deleting..." : "Delete Meme"}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemeHub;
