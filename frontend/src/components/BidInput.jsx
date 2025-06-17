import { useState } from "react";

const BidInput = ({ onBid, memeId, userCredits }) => {
    const [bidAmount, setBidAmount] = useState("");

    const handleBidSubmit = (e) => {
        e.preventDefault();
        const amount = parseInt(bidAmount);
        if (amount > 0 && amount <= userCredits) {
            onBid(memeId, amount);
            setBidAmount("");
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
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200"
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
                    disabled={!bidAmount || parseInt(bidAmount) > userCredits}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                        bidAmount && parseInt(bidAmount) <= userCredits
                            ? "bg-pink-500 hover:bg-pink-600 text-white cursor-pointer"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    Bid
                </button>
            </div>
            <p className="text-xs text-gray-400">
                Available credits: {userCredits}
            </p>
        </form>
    );
};

export default BidInput; 