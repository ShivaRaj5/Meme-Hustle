import { Link } from "react-router-dom";
import BidInput from "./BidInput";

const MemeHub = ({
    memes,
    typingText,
    isLoggedIn,
    user,
    bids,
    captions,
    vibes,
    handleBid,
    getHighestBid,
    handleVote,
    hasUserVoted,
    getVoteCounts,
    handleDelete,
}) => {
    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4 text-pink-500">
                <span className="text-shadow-neon">{typingText}</span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memes.map((meme) => (
                    <div
                        key={meme.id}
                        className="border p-4 rounded bg-gray-800 glitch-hover"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">{meme.title}</h2>
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
                            {isLoggedIn ? (
                                <BidInput onBid={handleBid} memeId={meme.id} />
                            ) : (
                                <div className="text-yellow-500">
                                    Please{" "}
                                    <Link
                                        to="/login"
                                        className="text-blue-500 underline"
                                    >
                                        login
                                    </Link>{" "}
                                    to bid on memes
                                </div>
                            )}
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
                                        onClick={() => handleVote(meme.id, "up")}
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
                                        onClick={() => handleVote(meme.id, "down")}
                                        className={`bg-green-500 text-white p-2 rounded mr-2 neon-glow ${
                                            hasUserVoted(meme.id, "down")
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        disabled={hasUserVoted(meme.id, "down")}
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
                        {isLoggedIn && meme.userId === user?.id && (
                            <button
                                onClick={() => handleDelete(meme.id)}
                                className="bg-red-500 text-white p-2 rounded mt-2 neon-glow"
                            >
                                Delete Meme
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemeHub; 