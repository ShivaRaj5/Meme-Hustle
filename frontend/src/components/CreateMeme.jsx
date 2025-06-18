import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { memesAPI } from "../services/api";
import { toast } from "react-toastify";

const CreateMeme = ({ onMemeCreated }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        tags: []
    });
    const [tagInput, setTagInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
                });
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error("Please login to create memes");
            return;
        }

        if (!formData.title.trim() || !formData.imageUrl.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const { meme } = await memesAPI.create({
                title: formData.title,
                imageUrl: formData.imageUrl,
                tags: formData.tags
            });

            toast.success("Meme created successfully!");
            
            // Reset form
            setFormData({
                title: "",
                imageUrl: "",
                tags: []
            });
            setTagInput("");

            // Notify parent component
            if (onMemeCreated) {
                onMemeCreated(meme);
            }
        } catch (error) {
            toast.error(error.message || "Failed to create meme");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Meme</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Meme Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white transition-colors duration-200"
                        placeholder="Enter a catchy title for your meme"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image URL *
                    </label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white transition-colors duration-200"
                        placeholder="https://example.com/meme-image.jpg"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags
                    </label>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagInputKeyDown}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white transition-colors duration-200"
                            placeholder="Type a tag and press Enter"
                        />
                        
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-red-300 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? "Creating Meme..." : "Create Meme"}
                </button>
            </form>
        </div>
    );
};

export default CreateMeme; 