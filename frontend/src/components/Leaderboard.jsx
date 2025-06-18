import { useState, useEffect } from "react";
import { leaderboardAPI } from "../services/api";
import { toast } from "react-toastify";

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState("trending");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboardData();
    }, [activeTab]);

    const loadLeaderboardData = async () => {
        try {
            setLoading(true);
            let response;
            
            switch (activeTab) {
                case "trending":
                    response = await leaderboardAPI.getTrending();
                    break;
                case "most-bid":
                    response = await leaderboardAPI.getMostBid();
                    break;
                case "highest-bids":
                    response = await leaderboardAPI.getHighestBids();
                    break;
                case "recent":
                    response = await leaderboardAPI.getRecent();
                    break;
                case "overall":
                    response = await leaderboardAPI.getOverall();
                    break;
                case "users":
                    response = await leaderboardAPI.getUsers();
                    break;
                default:
                    response = await leaderboardAPI.getTrending();
            }
            
            setData(response.memes || response.users || []);
        } catch (error) {
            console.error("Failed to load leaderboard data:", error);
            toast.error("Failed to load leaderboard data");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "trending", label: "Trending", icon: "🔥" },
        { id: "most-bid", label: "Most Bid", icon: "💰" },
        { id: "highest-bids", label: "Highest Bids", icon: "💎" },
        { id: "recent", label: "Recent", icon: "🕒" },
        { id: "overall", label: "Overall", icon: "🏆" },
        { id: "users", label: "Top Users", icon: "👥" }
    ];

    const renderMemeCard = (meme, index) => (
        <div key={meme.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        #{index + 1}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold truncate">{meme.title}</h3>
                        <span className="text-purple-400 text-sm">{meme.vibe}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 italic">"{meme.caption}"</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>👍 {meme.upvotes}</span>
                        <span>👎 {meme.downvotes}</span>
                        <span>By {meme.user_name}</span>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <img
                        src={meme.image_url}
                        alt={meme.title}
                        className="w-20 h-20 object-cover rounded-lg"
                    />
                </div>
            </div>
        </div>
    );

    const renderUserCard = (user, index) => (
        <div key={user.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        #{index + 1}
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold">{user.name}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                        <span>Memes: {user.memes?.length || 0}</span>
                        <span>Total Upvotes: {user.memes?.reduce((sum, meme) => sum + (meme.upvotes || 0), 0) || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
                    <p className="text-gray-400">See who's dominating the meme marketplace</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                                activeTab === tab.id
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {data.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-xl">No data available</div>
                        </div>
                    ) : (
                        data.map((item, index) => 
                            activeTab === "users" 
                                ? renderUserCard(item, index)
                                : renderMemeCard(item, index)
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard; 