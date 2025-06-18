# MemeHustle Frontend

A React-based frontend for the MemeHustle cyberpunk AI meme marketplace, featuring real-time updates, AI-generated captions, and a modern cyberpunk UI.

## 🚀 Features

- **Real-time Updates** - Live notifications for bids, votes, and meme actions via Socket.IO
- **AI-Powered Captions** - Automatic caption and vibe generation for memes
- **Bidding System** - Real-time auction-style bidding with credit management
- **Voting System** - Upvote/downvote memes with live updates
- **User Authentication** - JWT-based authentication with persistent sessions
- **Responsive Design** - Cyberpunk-themed UI that works on all devices
- **Real-time Leaderboards** - Live rankings and trending memes

## 🛠️ Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **React Toastify** - Toast notifications
- **JWT** - Token-based authentication

## 📋 Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:5000`
- Supabase database configured

## 🔧 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3001`

## 🔌 Backend Integration

The frontend is fully integrated with the backend API. All data operations use the backend instead of localStorage:

### API Endpoints Used

- **Authentication**: `/api/auth/*`
- **Memes**: `/api/memes/*`
- **Bidding**: `/api/bids/*`
- **Voting**: `/api/votes/*`
- **Leaderboards**: `/api/leaderboard/*`

### Real-time Features

Socket.IO is used for real-time updates:
- New meme notifications
- Live bid updates
- Real-time vote counts
- Credit balance updates

## 🎨 UI Components

### Core Components
- **MemeHub** - Main meme feed with real-time updates
- **MyMemes** - User's created memes with management
- **CreateMeme** - Meme creation form with AI integration
- **Leaderboard** - Various ranking views
- **Header** - Navigation and user info
- **BidInput** - Bidding interface

### Authentication
- **Login** - User login form
- **Signup** - User registration form
- **AuthContext** - Global authentication state

## 🔐 Authentication Flow

1. **Signup**: Creates new user account with 500 starting credits
2. **Login**: Authenticates user and stores JWT token
3. **Token Management**: Automatic token refresh and validation
4. **Protected Routes**: Routes requiring authentication

## 💰 Credit System

- Users start with 500 credits
- Credits are spent when bidding on memes
- Real-time credit balance updates
- Insufficient credit validation

## 🎯 Real-time Features

### Socket.IO Events
- `meme_created` - New meme notifications
- `meme_updated` - Meme content updates
- `meme_deleted` - Meme removal notifications
- `bid_placed` - New bid notifications
- `bid_cancelled` - Bid cancellation updates
- `vote_updated` - Vote count changes
- `credits_updated` - User credit balance updates

### Live Updates
- Meme feed updates automatically
- Bid amounts update in real-time
- Vote counts refresh instantly
- User credits update immediately

## 🧪 Testing

### Backend Connection Test
Run this in the browser console to test backend connectivity:

```javascript
// Test backend endpoints
testBackendConnection();

// Test Socket.IO connection
testSocketConnection();
```

### Manual Testing
1. Create a new user account
2. Create a meme with AI-generated caption
3. Place bids on memes
4. Vote on memes
5. Check real-time updates
6. View leaderboards

## 🚀 Production Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🔧 Configuration

### Environment Variables
The frontend connects to the backend at `http://localhost:5000` by default. To change this:

1. Update `API_BASE_URL` in `src/services/api.js`
2. Update `SOCKET_URL` in `src/services/socket.js`

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001`

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend server is running on port 5000
   - Check CORS configuration in backend

2. **Socket.IO Connection Issues**
   - Verify backend Socket.IO server is running
   - Check network connectivity

3. **Authentication Errors**
   - Clear localStorage and re-login
   - Check JWT token expiration

4. **Real-time Updates Not Working**
   - Check Socket.IO connection status
   - Verify event listeners are properly set up

### Debug Mode
Enable debug logging by opening browser console and running:

```javascript
localStorage.setItem('debug', 'true');
```

## 📱 Responsive Design

The frontend is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🎨 Cyberpunk Theme

The UI features:
- Dark color scheme with neon accents
- Glitch effects and animations
- Typing animations
- Neon glow effects
- Cyberpunk typography

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the MemeHustle application.
