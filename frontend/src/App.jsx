import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MemeHub from "./components/MemeHub";
import MyMemes from "./components/MyMemes";
import Header from "./components/Header";

const App = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-900">
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                <div className="fixed top-0 left-0 right-0 z-50">
                    <Header />
                </div>
                <main className="pt-16">
                    <Routes>
                        <Route path="/" element={<MemeHub />} />
                        <Route path="/my-memes" element={<MyMemes />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                    </Routes>
                </main>
            </div>
        </AuthProvider>
    );
};

export default App;
