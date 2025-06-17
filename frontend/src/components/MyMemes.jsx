import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BidInput from "./BidInput";
import { useAuth } from "../context/AuthContext";
import noMemeImage from "../assets/nomemeimage.jpeg";

const MyMemes = () => {
    const { user } = useAuth();
    const [memes, setMemes] = useState([]);
    const [bids, setBids] = useState({});
    const [votes, setVotes] = useState({});
    const [captions, setCaptions] = useState({});
    const [vibes, setVibes] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        const storedMemes = localStorage.getItem("memes");
        const storedBids = localStorage.getItem("bids");
        const storedVotes = localStorage.getItem("votes");
        const storedCaptions = localStorage.getItem("captions");
        const storedVibes = localStorage.getItem("vibes");
        if (storedMemes) setMemes(JSON.parse(storedMemes));
        if (storedBids) setBids(JSON.parse(storedBids));
        if (storedVotes) setVotes(JSON.parse(storedVotes));
        if (storedCaptions) setCaptions(JSON.parse(storedCaptions));
        if (storedVibes) setVibes(JSON.parse(storedVibes));
    }, []);

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newMeme = {
            id: Date.now(),
            title,
            imageUrl: imageUrl.trim() || noMemeImage,
            tags,
            userId: user.id,
            userName: user.name,
            createdAt: new Date().toISOString(),
        };

        const updatedMemes = [...memes, newMeme];
        setMemes(updatedMemes);
        localStorage.setItem("memes", JSON.stringify(updatedMemes));

        // Generate mock caption and vibe
        const mockCaptions = [
            "When the code finally works",
            "Debugging be like",
            "That moment when...",
            "Me trying to understand the documentation",
        ];
        const mockVibes = ["Coding", "Funny", "Relatable", "Tech"];

        const newCaptions = {
            ...captions,
            [newMeme.id]:
                mockCaptions[Math.floor(Math.random() * mockCaptions.length)],
        };
        const newVibes = {
            ...vibes,
            [newMeme.id]:
                mockVibes[Math.floor(Math.random() * mockVibes.length)],
        };

        setCaptions(newCaptions);
        setVibes(newVibes);
        localStorage.setItem("captions", JSON.stringify(newCaptions));
        localStorage.setItem("vibes", JSON.stringify(newVibes));

        // Reset form
        setTitle("");
        setImageUrl("");
        setTags([]);
        setShowModal(false);
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
        const memeVotes = votes[memeId] || { upvotes: [], downvotes: [] };
        return {
            upvotes: memeVotes.upvotes.length,
            downvotes: memeVotes.downvotes.length,
        };
    };

    const handleDelete = (memeId) => {
        const updatedMemes = memes.filter((meme) => meme.id !== memeId);
        setMemes(updatedMemes);
        localStorage.setItem("memes", JSON.stringify(updatedMemes));
    };

    const handleImageError = (e) => {
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = noMemeImage;
    };

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
                                        <div className="flex space-x-2">
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
                                                className="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 text-white"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveTag(tag)
                                                        }
                                                        className="ml-2 text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!title.trim()}
                                        className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                            title.trim()
                                                ? "bg-pink-500 hover:bg-pink-600 cursor-pointer"
                                                : "bg-gray-600 cursor-not-allowed"
                                        }`}
                                    >
                                        Create Meme
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Memes Grid */}
                {memes.filter((meme) => meme.userId === user?.id).length === 0 ? (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-bold text-pink-500 mb-4">No Memes Created Yet!</h2>
                        <p className="text-gray-300 mb-6">Start your meme journey by creating your first meme.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                        >
                            Create Your First Meme
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {memes
                            .filter((meme) => meme.userId === user?.id)
                            .map((meme) => (
                                <div
                                    key={meme.id}
                                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className="text-xl font-bold text-pink-500">
                                                {meme.title}
                                            </h2>
                                        </div>
                                        <div className="relative aspect-video mb-4">
                                            <img
                                                src={meme.imageUrl || noMemeImage}
                                                alt={meme.title}
                                                onError={handleImageError}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-300">
                                                Tags: {meme.tags.join(", ")}
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
                                                                getHighestBid(
                                                                    meme.id
                                                                ).userName
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
                                                <span className="text-sm text-gray-300">
                                                    ↑{" "}
                                                    {getVoteCounts(meme.id).upvotes}
                                                </span>
                                                <span className="text-sm text-gray-300">
                                                    ↓{" "}
                                                    {
                                                        getVoteCounts(meme.id)
                                                            .downvotes
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(meme.id)}
                                            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 cursor-pointer"
                                        >
                                            Delete Meme
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
