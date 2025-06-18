# MemeHustle Backend API

A real-time, cyberpunk-themed meme marketplace backend built with Node.js, Express, Socket.IO, Supabase, and Google Gemini AI.

## 🚀 Features

- **Real-time Bidding System** - Live auction-style bidding with Socket.IO
- **AI-Powered Captions** - Google Gemini AI generates funny captions and vibes
- **Voting System** - Upvote/downvote memes with real-time updates
- **Leaderboards** - Trending memes, most bid, highest bids, and user rankings
- **JWT Authentication** - Secure user authentication and authorization
- **Credit System** - Virtual currency for bidding on memes
- **Real-time Updates** - Live notifications for bids, votes, and meme actions

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **Supabase** - Database and authentication
- **Google Gemini AI** - AI caption and vibe generation
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project
- Google Gemini API key

## 🔧 Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

4. Fill in your environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Database Setup

Create the following tables in your Supabase project:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Memes Table
```sql
CREATE TABLE memes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  vibe VARCHAR(100),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Bids Table
```sql
CREATE TABLE bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meme_id, user_id)
);
```

### Votes Table
```sql
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meme_id, user_id)
);
```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/credits` - Update user credits

### Memes
- `GET /api/memes` - Get all memes
- `GET /api/memes/:id` - Get meme by ID
- `POST /api/memes` - Create new meme
- `PUT /api/memes/:id` - Update meme
- `DELETE /api/memes/:id` - Delete meme
- `POST /api/memes/:id/caption` - Generate new AI caption

### Bidding
- `GET /api/bids/meme/:memeId` - Get all bids for a meme
- `GET /api/bids/meme/:memeId/highest` - Get highest bid for a meme
- `POST /api/bids/meme/:memeId` - Place a bid
- `GET /api/bids/user` - Get user's bids
- `DELETE /api/bids/:bidId` - Cancel a bid

### Voting
- `GET /api/votes/meme/:memeId` - Get votes for a meme
- `POST /api/votes/meme/:memeId` - Vote on a meme
- `GET /api/votes/meme/:memeId/user` - Get user's vote on a meme
- `GET /api/votes/user` - Get user's voting history

### Leaderboards
- `GET /api/leaderboard/trending` - Get trending memes
- `GET /api/leaderboard/most-bid` - Get most bid on memes
- `GET /api/leaderboard/highest-bids` - Get highest bid memes
- `GET /api/leaderboard/recent` - Get recent memes
- `GET /api/leaderboard/overall` - Get overall leaderboard
- `GET /api/leaderboard/users` - Get user leaderboard

## 🔌 Socket.IO Events

### Client to Server
- `connection` - Client connects
- `disconnect` - Client disconnects

### Server to Client
- `meme_created` - New meme created
- `meme_updated` - Meme updated
- `meme_deleted` - Meme deleted
- `meme_caption_updated` - Meme caption updated
- `bid_placed` - New bid placed
- `bid_cancelled` - Bid cancelled
- `vote_updated` - Vote updated
- `credits_updated` - User credits updated

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🤖 AI Features

The backend uses Google Gemini AI to:
- Generate funny captions for memes based on title and tags
- Create vibe descriptions for memes
- Fallback to hardcoded responses if AI fails

## 🎯 Real-time Features

- Live bidding updates across all connected clients
- Real-time vote count updates
- Instant credit balance updates
- Live meme creation notifications

## 🚨 Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message"
}
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## 🧪 Testing

```bash
npm test
```

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Issues

Report bugs and feature requests in the GitHub issues section. 