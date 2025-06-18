const API_BASE_URL = 'https://meme-hustle-x9w1.onrender.com/api';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API calls
export const authAPI = {
    signup: (userData) => apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    
    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    
    getProfile: () => apiCall('/auth/profile'),
    
    updateCredits: (credits) => apiCall('/auth/credits', {
        method: 'PUT',
        body: JSON.stringify({ credits }),
    }),
};

// Memes API calls
export const memesAPI = {
    getAll: () => apiCall('/memes'),
    
    getById: (id) => apiCall(`/memes/${id}`),
    
    create: (memeData) => apiCall('/memes', {
        method: 'POST',
        body: JSON.stringify(memeData),
    }),
    
    update: (id, memeData) => apiCall(`/memes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(memeData),
    }),
    
    delete: (id) => apiCall(`/memes/${id}`, {
        method: 'DELETE',
    }),
    
    generateCaption: (id) => apiCall(`/memes/${id}/caption`, {
        method: 'POST',
    }),
};

// Bids API calls
export const bidsAPI = {
    getByMeme: (memeId) => apiCall(`/bids/meme/${memeId}`),
    
    getHighestByMeme: (memeId) => apiCall(`/bids/meme/${memeId}/highest`),
    
    place: (memeId, amount) => apiCall(`/bids/meme/${memeId}`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
    }),
    
    getUserBids: () => apiCall('/bids/user'),
    
    cancel: (bidId) => apiCall(`/bids/${bidId}`, {
        method: 'DELETE',
    }),
};

// Votes API calls
export const votesAPI = {
    getByMeme: (memeId) => apiCall(`/votes/meme/${memeId}`),
    
    vote: (memeId, type) => apiCall(`/votes/meme/${memeId}`, {
        method: 'POST',
        body: JSON.stringify({ type }),
    }),
    
    getUserVote: (memeId) => apiCall(`/votes/meme/${memeId}/user`),
    
    getUserVotes: () => apiCall('/votes/user'),
};

// Leaderboard API calls
export const leaderboardAPI = {
    getTrending: (limit = 10) => apiCall(`/leaderboard/trending?limit=${limit}`),
    
    getMostBid: (limit = 10) => apiCall(`/leaderboard/most-bid?limit=${limit}`),
    
    getHighestBids: (limit = 10) => apiCall(`/leaderboard/highest-bids?limit=${limit}`),
    
    getRecent: (limit = 10) => apiCall(`/leaderboard/recent?limit=${limit}`),
    
    getOverall: (limit = 10) => apiCall(`/leaderboard/overall?limit=${limit}`),
    
    getUsers: (limit = 10) => apiCall(`/leaderboard/users?limit=${limit}`),
};

// Health check
export const healthCheck = () => apiCall('/health'); 