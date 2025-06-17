import { useState } from "react";
import { Link } from "react-router-dom";
import BidInput from "./BidInput";

const MyMemes = ({
    user,
    memes,
    setMemes,
    captions,
    setCaptions,
    vibes,
    setVibes,
    bids,
    getHighestBid,
    handleVote,
    hasUserVoted,
    getVoteCounts,
    handleDelete,
    handleBid,
    isLoggedIn,
}) => {
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const newMeme = {
            id: Date.now(),
            title,
            imageUrl: imageUrl || "https://picsum.photos/200",
            tags,
            userId: user.id,
            userName: user.name,
            createdAt: new Date().toISOString(),
        };
        const updatedMemes = [...memes, newMeme];
        setMemes(updatedMemes);
        localStorage.setItem("memes", JSON.stringify(updatedMemes));
        setTitle("");
        setImageUrl("");
        setTags([]);
        setTagInput("");
        // Mock AI caption and vibe
        const mockCaption = `"${newMeme.title} to the moon!"`;
        const mockVibe = `"Neon ${newMeme.tags[0]} Vibes"`;
        setCaptions({ ...captions, [newMeme.id]: mockCaption });
        setVibes({ ...vibes, [newMeme.id]: mockVibe });
        localStorage.setItem(
            "captions",
            JSON.stringify({ ...captions, [newMeme.id]: mockCaption })
        );
        localStorage.setItem(
            "vibes",
            JSON.stringify({ ...vibes, [newMeme.id]: mockVibe })
        );
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4 text-pink-500">
                My Memes
            </h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="border p-2 mr-2 bg-gray-800 text-white rounded-lg"
                />
                <div className="flex flex-wrap mt-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-blue-500 text-white p-2 rounded mr-2 mb-2"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-2 text-white"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <button
                    type="submit"
                    className="bg-green-500 text-white p-2 mt-4 rounded neon-glow"
                >
                    Create Meme
                </button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memes
                    .filter((meme) => meme.userId === user.id)
                    .map((meme) => (
                        <div
                            key={meme.id}
                            className="border p-4 rounded bg-gray-800 glitch-hover"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold">
                                    {meme.title}
                                </h2>
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
                                            onClick={() =>
                                                handleVote(meme.id, "up")
                                            }
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
                                            onClick={() =>
                                                handleVote(meme.id, "down")
                                            }
                                            className={`bg-green-500 text-white p-2 rounded mr-2 neon-glow ${
                                                hasUserVoted(meme.id, "down")
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            disabled={hasUserVoted(
                                                meme.id,
                                                "down"
                                            )}
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
                            <button
                                onClick={() => handleDelete(meme.id)}
                                className="bg-red-500 text-white p-2 rounded mt-2 neon-glow"
                            >
                                Delete Meme
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default MyMemes; 