# MongoDB Installation Required

## ⚠️ Important: MongoDB Not Installed

The application requires MongoDB to run. Here's how to install it:

## Windows Installation

### Option 1: MongoDB Community Edition (Recommended)

1. **Download MongoDB:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows
   - Version: 7.0 or latest
   - Package: MSI

2. **Run the Installer:**
   - Double-click the downloaded .msi file
   - Choose "Complete" installation
   - **Important:** Check "Install MongoDB as a Service"
   - **Important:** Check "Install MongoDB Compass" (optional GUI)

3. **Verify Installation:**
   ```powershell
   mongod --version
   ```

4. **The service should start automatically**
   - If not, start it manually:
   ```powershell
   net start MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

If you don't want to install MongoDB locally, use the cloud version:

1. **Create Account:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create Cluster:**
   - Choose FREE tier (M0)
   - Select region closest to you
   - Create cluster (takes 1-3 minutes)

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update server/.env:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/transaction-audit-system
   ```

## After Installing MongoDB

1. **Verify MongoDB is running:**
   ```powershell
   # Check if service is running
   Get-Service MongoDB
   
   # Or try to connect
   mongosh
   # Type 'exit' to quit
   ```

2. **Seed the database:**
   ```bash
   cd server
   npm run seed
   ```
   
   This creates demo users:
   - alice@demo.com / password123 ($5000)
   - bob@demo.com / password123 ($3000)
   - charlie@demo.com / password123 ($7500)
   - diana@demo.com / password123 ($2000)

3. **Start the backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   You should see:
   ```
   ✅ MongoDB Connected: localhost
   📊 Database: transaction-audit-system
   🚀 Server running on port 5000
   ```

4. **Start the frontend (in another terminal):**
   ```bash
   cd client
   npm run dev
   ```

5. **Access the app:**
   - Open: http://localhost:5173
   - Login with: alice@demo.com / password123

## Troubleshooting

### "MongoDB service not found"
This means MongoDB wasn't installed as a service. Run manually:
```powershell
mongod
```

### "Connection refused"
MongoDB service isn't running. Start it:
```powershell
net start MongoDB
```

### "Port 27017 already in use"
Another MongoDB instance is running. Stop it first:
```powershell
net stop MongoDB
```

## Next Steps

1. **Install MongoDB** using one of the options above
2. **Verify it's running**
3. **Run the seed script** to create demo users
4. **Restart both servers**
5. **Login with demo credentials**

---

**Need help?** The application is fully built and ready to run - it just needs MongoDB installed!
