import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { votesAPI, bidsAPI } from "../services/api";
import { toast } from "react-toastify";

const MemeCard = ({ meme, onUpdate }) => {
    const { user } = useAuth();
    const [votes, setVotes] = useState({ upvotes: meme.upvotes || 0, downvotes: meme.downvotes || 0 });
    const [userVote, setUserVote] = useState(null);
    const [bids, setBids] = useState([]);
    const [highestBid, setHighestBid] = useState(null);
    const [userBid, setUserBid] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [votingStates, setVotingStates] = useState({});
    const [cancellingBid, setCancellingBid] = useState(false);

    useEffect(() => {
        loadVotes();
        loadBids();
        if (user) {
            loadUserVote();
            loadUserBid();
        }
    }, [meme.id, user]);

    const loadVotes = async () => {
        try {
            const { upvotes, downvotes } = await votesAPI.getByMeme(meme.id);
            setVotes({ upvotes, downvotes });
        } catch (error) {
            console.error("Failed to load votes:", error);
        }
    };

    const loadUserVote = async () => {
        try {
            const { voteType } = await votesAPI.getUserVote(meme.id);
            setUserVote(voteType);
        } catch (error) {
            console.error("Failed to load user vote:", error);
        }
    };

    const loadBids = async () => {
        try {
            const { bids } = await bidsAPI.getByMeme(meme.id);
            setBids(bids);
            
            const { highestBid } = await bidsAPI.getHighestByMeme(meme.id);
            setHighestBid(highestBid);
        } catch (error) {
            console.error("Failed to load bids:", error);
        }
    };

    const loadUserBid = async () => {
        try {
            const { bids } = await bidsAPI.getUserBids();
            const userBidOnMeme = bids.find(bid => bid.meme_id === meme.id);
            setUserBid(userBidOnMeme);
        } catch (error) {
            console.error("Failed to load user bid:", error);
        }
    };

    const handleVote = async (type) => {
        if (!user) {
            toast.error("Please login to vote");
            return;
        }

        // Set loading state for this specific vote
        setVotingStates(prev => ({ ...prev, [type]: true }));

        try {
            const { meme: updatedMeme } = await votesAPI.vote(meme.id, type);
            setVotes({ upvotes: updatedMeme.upvotes, downvotes: updatedMeme.downvotes });
            setUserVote(updatedMeme.voteType);
            
            if (onUpdate) {
                onUpdate(updatedMeme);
            }
        } catch (error) {
            toast.error(error.message || "Failed to vote");
        } finally {
            // Clear loading state
            setVotingStates(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleBid = async () => {
        if (!user) {
            toast.error("Please login to bid");
            return;
        }

        const amount = parseInt(bidAmount);
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid bid amount");
            return;
        }

        if (amount > user.credits) {
            toast.error("Insufficient credits");
            return;
        }

        if (highestBid && amount <= highestBid.amount) {
            toast.error("Bid must be higher than current highest bid");
            return;
        }

        setIsLoading(true);
        try {
            const { bid, remainingCredits } = await bidsAPI.place(meme.id, amount);
            
            // Update local state
            setBids(prev => [...prev.filter(b => b.user_id !== user.id), bid]);
            setHighestBid(bid);
            setUserBid(bid);
            setBidAmount("");
            
            // Update user credits in context
            // This will be handled by the real-time update from socket
            toast.success(`Bid placed successfully! Remaining credits: ${remainingCredits}`);
        } catch (error) {
            toast.error(error.message || "Failed to place bid");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelBid = async () => {
        if (!userBid) return;

        setCancellingBid(true);
        try {
            const { refundedCredits } = await bidsAPI.cancel(userBid.id);
            
            // Update local state
            setBids(prev => prev.filter(b => b.id !== userBid.id));
            setUserBid(null);
            
            // Reload highest bid
            const { highestBid: newHighest } = await bidsAPI.getHighestByMeme(meme.id);
            setHighestBid(newHighest);
            
            toast.success(`Bid cancelled! Refunded ${refundedCredits} credits`);
        } catch (error) {
            toast.error(error.message || "Failed to cancel bid");
        } finally {
            setCancellingBid(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <div className="relative">
                <img
                    src={meme.image_url}
                    alt={meme.title}
                    className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white">
                    {meme.vibe}
                </div>
            </div>
            
            <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{meme.title}</h3>
                <p className="text-gray-300 text-sm mb-3 italic">"{meme.caption}"</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                    {meme.tags?.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-purple-600 text-white text-xs px-2 py-1 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Voting Section */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleVote('up')}
                            disabled={votingStates['up']}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                                userVote === 'up' || votingStates['up']
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <span>👍</span>
                            <span>{votes.upvotes}</span>
                            {votingStates['up'] && (
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={() => handleVote('down')}
                            disabled={votingStates['down']}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                                userVote === 'down' || votingStates['down']
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <span>👎</span>
                            <span>{votes.downvotes}</span>
                            {votingStates['down'] && (
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Bidding Section */}
                <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">
                            Highest Bid: {highestBid ? `${highestBid.amount} credits` : 'No bids yet'}
                        </span>
                        <span className="text-gray-300 text-sm">
                            Total Bids: {bids.length}
                        </span>
                    </div>

                    {user && (
                        <div className="space-y-2">
                            {userBid ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-green-400 text-sm">
                                        Your bid: {userBid.amount} credits
                                    </span>
                                    <button
                                        onClick={handleCancelBid}
                                        disabled={cancellingBid}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:bg-red-600/50 disabled:cursor-not-allowed flex items-center space-x-1"
                                    >
                                        {cancellingBid && (
                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        <span>{cancellingBid ? "Cancelling..." : "Cancel Bid"}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder="Enter bid amount"
                                        disabled={isLoading}
                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        min="1"
                                        max={user.credits}
                                    />
                                    <button
                                        onClick={handleBid}
                                        disabled={isLoading || !bidAmount}
                                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {isLoading && (
                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        <span>{isLoading ? "Bidding..." : "Bid"}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bid History */}
                    {bids.length > 0 && (
                        <div className="mt-3">
                            <h4 className="text-gray-300 text-sm font-medium mb-2">Recent Bids:</h4>
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                                {bids.slice(0, 3).map((bid) => (
                                    <div key={bid.id} className="flex justify-between text-xs text-gray-400">
                                        <span>{bid.user_name}</span>
                                        <span>{bid.amount} credits</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>By {meme.user_name}</span>
                        <span>{new Date(meme.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemeCard; 