import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import BidInput from "./BidInput";
import { useAuth } from "../context/AuthContext";
import { memesAPI, bidsAPI, votesAPI } from "../services/api";
import { toast } from "react-toastify";
import socketService from "../services/socket";
import noMemeImage from "../assets/nomemeimage.jpeg";

const MyMemes = () => {
    const { user } = useAuth();
    const userRef = useRef(user);
    const [memes, setMemes] = useState([]);
    const [bids, setBids] = useState({});
    const [votes, setVotes] = useState({});
    const [userVotes, setUserVotes] = useState({});
    const [captions, setCaptions] = useState({});
    const [vibes, setVibes] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [creatingMeme, setCreatingMeme] = useState(false);
    const [deletingStates, setDeletingStates] = useState({});
    const [votingStates, setVotingStates] = useState({});

    // Update ref when user changes
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        loadMyMemes();
    }, [user]);

    useEffect(() => {
        // Set up Socket.IO listeners
        setupSocketListeners();

        // Cleanup on unmount
        return () => {
            socketService.removeAllListeners();
        };
    }, []); // Socket.IO setup only runs once

    const setupSocketListeners = () => {
        // Listen for new memes (only if they belong to current user)
        socketService.onMemeCreated(({ meme }) => {
            const currentUser = userRef.current;
            if (meme.user_id === currentUser?.id) {
                setMemes(prevMemes => {
                    // Check if meme already exists to prevent duplication
                    const exists = prevMemes.some(m => m.id === meme.id);
                    if (!exists) {
                        return [meme, ...prevMemes];
                    }
                    return prevMemes;
                });
                if (meme.caption) {
                    setCaptions(prev => ({ ...prev, [meme.id]: meme.caption }));
                }
                if (meme.vibe) {
                    setVibes(prev => ({ ...prev, [meme.id]: meme.vibe }));
                }
            }
        });

        // Listen for meme updates (only if they belong to current user)
        socketService.onMemeUpdated(({ meme }) => {
            const currentUser = userRef.current;
            if (meme.user_id === currentUser?.id) {
                setMemes(prevMemes => 
                    prevMemes.map(m => m.id === meme.id ? meme : m)
                );
                if (meme.caption) {
                    setCaptions(prev => ({ ...prev, [meme.id]: meme.caption }));
                }
                if (meme.vibe) {
                    setVibes(prev => ({ ...prev, [meme.id]: meme.vibe }));
                }
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

        // Listen for new bids on user's memes
        socketService.onBidPlaced(({ memeId, bid }) => {
            setBids(prevBids => ({
                ...prevBids,
                [memeId]: [...(prevBids[memeId] || []).filter(b => b.user_id !== bid.user_id), bid]
            }));
        });

        // Listen for bid cancellations on user's memes
        socketService.onBidCancelled(({ memeId, bidId }) => {
            setBids(prevBids => ({
                ...prevBids,
                [memeId]: (prevBids[memeId] || []).filter(b => b.id !== bidId)
            }));
        });

        // Listen for vote updates on user's memes
        socketService.onVoteUpdated(({ memeId, meme }) => {
            setVotes(prevVotes => ({
                ...prevVotes,
                [memeId]: { upvotes: meme.upvotes, downvotes: meme.downvotes }
            }));
        });
    };

    const loadMyMemes = async () => {
        try {
            setLoading(true);
            // Get all memes and filter by current user
            const { memes: allMemes } = await memesAPI.getAll();
            const myMemes = allMemes.filter(meme => meme.user_id === user?.id);
            setMemes(myMemes);
            
            // Load captions and vibes from memes
            const captionsData = {};
            const vibesData = {};
            myMemes.forEach(meme => {
                if (meme.caption) captionsData[meme.id] = meme.caption;
                if (meme.vibe) vibesData[meme.id] = meme.vibe;
            });
            setCaptions(captionsData);
            setVibes(vibesData);
            
            // Load bids and votes for each meme
            await loadBidsAndVotes(myMemes);
            await loadUserVotes(myMemes);
        } catch (error) {
            console.error("Failed to load my memes:", error);
            toast.error("Failed to load your memes");
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

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setCreatingMeme(true);
        try {
            const { meme } = await memesAPI.create({
                title,
                imageUrl: imageUrl.trim() || noMemeImage,
                tags
            });

            toast.success("Meme created successfully!");
            
            // Add meme to state as fallback after a small delay (in case Socket.IO event is delayed)
            setTimeout(() => {
                setMemes(prevMemes => {
                    // Check if meme already exists to prevent duplication
                    const exists = prevMemes.some(m => m.id === meme.id);
                    if (!exists) {
                        console.log('Adding meme via fallback (Socket.IO event may not have arrived)');
                        return [meme, ...prevMemes];
                    }
                    return prevMemes;
                });
                
                // Add caption and vibe as fallback
                if (meme.caption) {
                    setCaptions(prev => ({ ...prev, [meme.id]: meme.caption }));
                }
                if (meme.vibe) {
                    setVibes(prev => ({ ...prev, [meme.id]: meme.vibe }));
                }
            }, 500); // 500ms delay
            
            // Reset form
            setTitle("");
            setImageUrl("");
            setTags([]);
            setShowModal(false);
        } catch (error) {
            toast.error(error.message || "Failed to create meme");
        } finally {
            setCreatingMeme(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (
                e.target.type === "text" &&
                e.target.placeholder === "Add a tag"
            ) {
                handleAddTag();
            }
        }
    };

    const getHighestBid = (memeId) => {
        const memeBids = bids[memeId] || [];
        if (memeBids.length === 0) return null;

        return memeBids.reduce(
            (highest, current) =>
                current.amount > highest.amount ? current : highest,
            memeBids[0]
        );
    };

    const getVoteCounts = (memeId) => {
        const memeVotes = votes[memeId] || { upvotes: 0, downvotes: 0 };
        return {
            upvotes: memeVotes.upvotes,
            downvotes: memeVotes.downvotes,
        };
    };

    const handleVote = async (memeId, type) => {
        if (!user) return;

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

    if (loading) {
        return (
            <div className="w-full bg-gray-900 text-white flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading your memes...</div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-pink-500 animate-fade-in">
                        My Memes
                    </h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                    >
                        + Create
                    </button>
                </div>

                {/* Create Meme Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-300">
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-pink-500">
                                        Create New Meme
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            onKeyPress={handleKeyPress}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors duration-200"
                                            placeholder="Enter meme title"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) =>
                                                setImageUrl(e.target.value)
                                            }
                                            onKeyPress={handleKeyPress}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors duration-200"
                                            placeholder="Enter image URL"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Tags
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) =>
                                                    setTagInput(e.target.value)
                                                }
                                                onKeyPress={handleKeyPress}
                                                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors duration-200"
                                                placeholder="Add a tag"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddTag}
                                                className="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors duration-200"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveTag(tag)
                                                            }
                                                            className="hover:text-red-300 transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={creatingMeme}
                                            className="flex-1 py-3 px-4 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-pink-500/50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {creatingMeme && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            <span>{creatingMeme ? "Creating..." : "Create Meme"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            disabled={creatingMeme}
                                            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-600/50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Memes Grid */}
                {memes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-bold text-pink-500 mb-4">No Memes Yet!</h2>
                        <p className="text-gray-300 mb-6">Create your first meme and start sharing with the community.</p>
                        <button
                            onClick={() => setShowModal(true)}
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
                                            Posted by {meme.user_name || "You"}
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
                                        <div className="text-sm">
                                            {bids[meme.id]?.length > 0 ? (
                                                <div className="bg-gray-700 p-2 rounded">
                                                    <p className="font-medium">
                                                        Highest Bid:{" "}
                                                        <span className="text-green-400">
                                                            {getHighestBid(meme.id)?.amount}
                                                        </span>
                                                    </p>
                                                    <p className="text-gray-300">
                                                        by{" "}
                                                        {getHighestBid(meme.id)?.user_name}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 italic">
                                                    No bids yet
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4">
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
                                        </div>
                                    </div>
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyMemes;
