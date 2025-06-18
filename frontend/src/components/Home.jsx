import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { memesAPI } from "../services/api";
import MemeCard from "./MemeCard";
import CreateMeme from "./CreateMeme";
import { toast } from "react-toastify";

const Home = () => {
    const { user } = useAuth();
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        loadMemes();
    }, []);

    const loadMemes = async () => {
        try {
            setLoading(true);
            const { memes } = await memesAPI.getAll();
            setMemes(memes);
        } catch (error) {
            console.error("Failed to load memes:", error);
            toast.error("Failed to load memes");
        } finally {
            setLoading(false);
        }
    };

    const handleMemeCreated = (newMeme) => {
        setMemes(prev => [newMeme, ...prev]);
        setShowCreateForm(false);
    };

    const handleMemeUpdate = (updatedMeme) => {
        setMemes(prev => prev.map(meme => 
            meme.id === updatedMeme.id ? updatedMeme : meme
        ));
    };

    const handleMemeDelete = (memeId) => {
        setMemes(prev => prev.filter(meme => meme.id !== memeId));
    };

    const filteredMemes = memes.filter(meme => {
        if (filter === "all") return true;
        if (filter === "my-memes" && user) {
            return meme.user_id === user.id;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading memes...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            MemeHustle
                        </h1>
                        <p className="text-gray-400">
                            The cyberpunk meme marketplace where memes become currency
                        </p>
                    </div>
                    
                    {user && (
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="text-right">
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-purple-400 text-sm">{user.credits} credits</p>
                            </div>
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                            >
                                {showCreateForm ? "Cancel" : "Create Meme"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Meme Form */}
                {showCreateForm && (
                    <div className="mb-8">
                        <CreateMeme onMemeCreated={handleMemeCreated} />
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            filter === "all"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                        All Memes
                    </button>
                    {user && (
                        <button
                            onClick={() => setFilter("my-memes")}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                filter === "my-memes"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            My Memes
                        </button>
                    )}
                </div>

                {/* Memes Grid */}
                {filteredMemes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-xl mb-4">
                            {filter === "my-memes" ? "You haven't created any memes yet" : "No memes found"}
                        </div>
                        {filter === "my-memes" && user && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                            >
                                Create Your First Meme
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMemes.map((meme) => (
                            <MemeCard
                                key={meme.id}
                                meme={meme}
                                onUpdate={handleMemeUpdate}
                                onDelete={handleMemeDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home; 