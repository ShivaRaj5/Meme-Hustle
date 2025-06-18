import { useState } from "react";

const BidInput = ({ onBid, memeId, userCredits }) => {
    const [bidAmount, setBidAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        const amount = parseInt(bidAmount);
        if (amount > 0 && amount <= userCredits) {
            setIsLoading(true);
            try {
                await onBid(memeId, amount);
                setBidAmount("");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Only allow positive numbers
        if (value === "" || /^[1-9]\d*$/.test(value)) {
            setBidAmount(value);
        }
    };

    return (
        <form onSubmit={handleBidSubmit} className="space-y-3">
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={bidAmount}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        placeholder="Enter bid amount"
                        min="1"
                        max={userCredits}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        credits
                    </span>
                </div>
                <button
                    type="submit"
                    disabled={!bidAmount || parseInt(bidAmount) > userCredits || isLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center space-x-2 ${
                        bidAmount && parseInt(bidAmount) <= userCredits && !isLoading
                            ? "bg-pink-500 hover:bg-pink-600 text-white cursor-pointer"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    {isLoading && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    <span>{isLoading ? "Bidding..." : "Bid"}</span>
                </button>
            </div>
            <p className="text-xs text-gray-400">
                Available credits: {userCredits}
            </p>
        </form>
    );
};

export default BidInput; 