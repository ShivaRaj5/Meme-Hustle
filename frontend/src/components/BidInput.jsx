import { useState } from "react";

const BidInput = ({ onBid, memeId }) => {
    const [localBidAmount, setLocalBidAmount] = useState("");

    const handleBid = () => {
        if (!localBidAmount) {
            alert("Please enter a bid amount");
            return;
        }
        onBid(memeId, Number(localBidAmount));
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Allow empty input
        if (value === "") {
            setLocalBidAmount("");
            return;
        }
        // Remove leading zeros and convert to number
        const numValue = value.replace(/^0+/, "");
        // Only update if it's a valid number
        if (!isNaN(numValue)) {
            setLocalBidAmount(numValue);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-2">
            <input
                type="text"
                value={localBidAmount}
                onChange={handleInputChange}
                placeholder="Enter bid amount"
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

export default BidInput; 