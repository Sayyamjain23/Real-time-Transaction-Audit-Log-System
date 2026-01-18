# Quick Setup Guide

## Prerequisites

Before running the application, you need to install MongoDB:

### Windows
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Service (recommended)
5. Install MongoDB Compass (optional GUI tool)

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Verify MongoDB Installation

```bash
mongosh
# Should connect to MongoDB shell
# Type 'exit' to quit
```

## Run the Application

### 1. Install Dependencies (if not already done)

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

### 2. Start MongoDB (if not running as service)

Windows:
```bash
# MongoDB usually runs as a service automatically
# If not, run: mongod
```

macOS/Linux:
```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates 4 demo users with the password `password123`:
- alice@demo.com (Balance: $5000)
- bob@demo.com (Balance: $3000)
- charlie@demo.com (Balance: $7500)  
- diana@demo.com (Balance: $2000)

### 4. Start Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
✅ MongoDB Connected: localhost
📊 Database: transaction-audit-system
🚀 Server running on port 5000
```

### 5. Start Frontend (New Terminal)

```bash
cd client
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

### 6. Open Application

Visit: **http://localhost:5173**

Login with:
- Email: alice@demo.com
- Password: password123

## Test the Application

1. **Login** with demo credentials
2. **View your balance** on the dashboard
3. **Transfer funds** to another user (e.g., bob@demo.com)
4. **Watch real-time updates** - balance and history update instantly
5. **Sort the table** by clicking column headers
6. **Logout and login** as the recipient to see received funds

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS settings in server/server.js
- Verify .env file exists in client directory

## Project Structure

```
task/
├── server/          # Backend (Express + MongoDB)
│   ├── config/      # Database connection
│   ├── controllers/ # API logic
│   ├── middleware/  # Authentication
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API routes
│   ├── scripts/     # Database seeder
│   └── services/    # Audit logging
│
├── client/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route pages
│   │   ├── store/       # Zustand state
│   │   └── utils/       # API client
│   └── public/
│
└── README.md
```

## Features to Test

✅ **User Registration** - Create new account with initial balance  
✅ **User Login** - JWT authentication with cookies  
✅ **Fund Transfer** - Atomic transactions with rollback  
✅ **Real-time Updates** - Balance and history update instantly  
✅ **Sortable Table** - Click headers to sort by date/amount  
✅ **Audit Logging** - Immutable transaction records  
✅ **Input Validation** - Comprehensive error handling  
✅ **Insufficient Balance** - Proper error messages  

## API Endpoints

### Authentication
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user

### Transactions
- POST `/api/transfer` - Transfer funds
- GET `/api/transactions` - Get history
- GET `/api/transactions/stats` - Get statistics

For detailed API documentation, see [README.md](file:///c:/Users/sayya/OneDrive/Documents/task/README.md)
