import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

// Import components
import Header from "./components/Header";
import MemeHub from "./components/MemeHub";
import MyMemes from "./components/MyMemes";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
    const [memes, setMemes] = useState([]);
    const [bids, setBids] = useState({});
    const [votes, setVotes] = useState({});
    const [captions, setCaptions] = useState({});
    const [vibes, setVibes] = useState({});
    const [typingText, setTypingText] = useState("");
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedMemes = localStorage.getItem("memes");
        const storedBids = localStorage.getItem("bids");
        const storedVotes = localStorage.getItem("votes");
        const storedCaptions = localStorage.getItem("captions");
        const storedVibes = localStorage.getItem("vibes");
        const storedUser = localStorage.getItem("user");
        if (storedMemes) setMemes(JSON.parse(storedMemes));
        if (storedBids) setBids(JSON.parse(storedBids));
        if (storedVotes) setVotes(JSON.parse(storedVotes));
        if (storedCaptions) setCaptions(JSON.parse(storedCaptions));
        if (storedVibes) setVibes(JSON.parse(storedVibes));
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }

        // Fake terminal typing effect
        const text = "Welcome to MemeHustle...";
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                setTypingText(text.substring(0, i + 1));
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        typeWriter();
    }, []);

    const handleBid = (memeId, amount) => {
        if (!isLoggedIn) return;

        // Check if user has enough credits
        if (user.credits < amount) {
            alert("You don't have enough credits!");
            return;
        }

        const currentBids = bids[memeId] || [];
        const highestBid =
            currentBids.length > 0
                ? Math.max(...currentBids.map((bid) => bid.amount))
                : 0;

        // Only allow bidding if the new bid is higher than the current highest bid
        if (amount <= highestBid) {
            alert("Your bid must be higher than the current highest bid!");
            return;
        }

        const newBid = {
            userId: user.id,
            userName: user.name,
            amount: amount,
            timestamp: new Date().toISOString(),
        };

        // Check if user already has a bid
        const existingBidIndex = currentBids.findIndex(
            (bid) => bid.userId === user.id
        );

        let updatedBids;
        if (existingBidIndex !== -1) {
            // Update existing bid
            const updatedBidsArray = [...currentBids];
            updatedBidsArray[existingBidIndex] = newBid;
            updatedBids = {
                ...bids,
                [memeId]: updatedBidsArray,
            };
        } else {
            // Add new bid
            updatedBids = {
                ...bids,
                [memeId]: [...currentBids, newBid],
            };
        }

        // Update user's credits
        const updatedUser = {
            ...user,
            credits: user.credits - amount,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update users list in localStorage
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const updatedUsers = storedUsers.map((u) =>
            u.id === user.id ? updatedUser : u
        );
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        setBids(updatedBids);
        localStorage.setItem("bids", JSON.stringify(updatedBids));

        // Show bid confirmation
        alert(
            `${user.name} bid ${amount} credits! Remaining credits: ${updatedUser.credits}`
        );
    };

    const getHighestBid = (memeId) => {
        const memeBids = bids[memeId] || [];
        if (memeBids.length === 0) return null;

        // Find the highest bid
        const highestBid = memeBids.reduce(
            (highest, current) =>
                current.amount > highest.amount ? current : highest,
            memeBids[0]
        );

        return {
            amount: highestBid.amount,
            bidder: highestBid.userName,
        };
    };

    const handleVote = (memeId, type) => {
        if (!isLoggedIn) return;

        const currentVotes = votes[memeId] || { upvotes: [], downvotes: [] };
        const userId = user.id;

        let newVotes = { ...currentVotes };

        if (type === "up") {
            // If user has already upvoted, remove the upvote
            if (currentVotes.upvotes.includes(userId)) {
                newVotes.upvotes = currentVotes.upvotes.filter(
                    (id) => id !== userId
                );
            } else {
                // Add upvote and remove from downvotes if exists
                newVotes.upvotes = [...currentVotes.upvotes, userId];
                newVotes.downvotes = currentVotes.downvotes.filter(
                    (id) => id !== userId
                );
            }
        } else {
            // If user has already downvoted, remove the downvote
            if (currentVotes.downvotes.includes(userId)) {
                newVotes.downvotes = currentVotes.downvotes.filter(
                    (id) => id !== userId
                );
            } else {
                // Add downvote and remove from upvotes if exists
                newVotes.downvotes = [...currentVotes.downvotes, userId];
                newVotes.upvotes = currentVotes.upvotes.filter(
                    (id) => id !== userId
                );
            }
        }

        const updatedVotes = { ...votes, [memeId]: newVotes };
        setVotes(updatedVotes);
        localStorage.setItem("votes", JSON.stringify(updatedVotes));
    };

    const getVoteCounts = (memeId) => {
        const memeVotes = votes[memeId] || { upvotes: [], downvotes: [] };
        return {
            upvotes: memeVotes.upvotes.length,
            downvotes: memeVotes.downvotes.length,
        };
    };

    const hasUserVoted = (memeId, type) => {
        if (!isLoggedIn) return false;
        const memeVotes = votes[memeId] || { upvotes: [], downvotes: [] };
        return type === "up"
            ? memeVotes.upvotes.includes(user.id)
            : memeVotes.downvotes.includes(user.id);
    };

    const handleDelete = (memeId) => {
        const updatedMemes = memes.filter((meme) => meme.id !== memeId);
        setMemes(updatedMemes);
        localStorage.setItem("memes", JSON.stringify(updatedMemes));
    };

    const handleLogin = (email, password) => {
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const user = storedUsers.find(
            (u) => u.email === email && u.password === password
        );
        if (user) {
            setUser(user);
            setIsLoggedIn(true);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/");
        } else {
            alert("Invalid credentials");
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            <Header
                user={user}
                isLoggedIn={isLoggedIn}
                handleLogout={handleLogout}
            />
            <Routes>
                <Route
                    path="/"
                    element={
                        <MemeHub
                            memes={memes}
                            typingText={typingText}
                            isLoggedIn={isLoggedIn}
                            user={user}
                            bids={bids}
                            captions={captions}
                            vibes={vibes}
                            handleBid={handleBid}
                            getHighestBid={getHighestBid}
                            handleVote={handleVote}
                            hasUserVoted={hasUserVoted}
                            getVoteCounts={getVoteCounts}
                            handleDelete={handleDelete}
                        />
                    }
                />
                <Route
                    path="/my-memes"
                    element={
                        <MyMemes
                            user={user}
                            memes={memes}
                            setMemes={setMemes}
                            captions={captions}
                            setCaptions={setCaptions}
                            vibes={vibes}
                            setVibes={setVibes}
                            bids={bids}
                            getHighestBid={getHighestBid}
                            handleVote={handleVote}
                            hasUserVoted={hasUserVoted}
                            getVoteCounts={getVoteCounts}
                            handleDelete={handleDelete}
                            handleBid={handleBid}
                            isLoggedIn={isLoggedIn}
                        />
                    }
                />
                <Route
                    path="/login"
                    element={<Login handleLogin={handleLogin} />}
                />
                <Route
                    path="/signup"
                    element={<Signup handleLogin={handleLogin} />}
                />
            </Routes>
        </>
    );
}

export default App;
