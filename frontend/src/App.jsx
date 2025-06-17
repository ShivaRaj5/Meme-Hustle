import { Route, Routes } from "react-router-dom";
import "./App.css";

// Import components
import Header from "./components/Header";
import MemeHub from "./components/MemeHub";
import MyMemes from "./components/MyMemes";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <Header />
            <Routes>
                <Route path="/" element={<MemeHub />} />
                <Route path="/my-memes" element={<MyMemes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
