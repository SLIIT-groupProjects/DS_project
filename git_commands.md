# Git Commands for GitHub and Server Setup

## Initial Git Setup (if not already done)
```bash
# Navigate to your project directory
cd "d:\3rd 2nd\Distributed System\Restaurant Management Service"

# Initialize git repository
git init

# Add remote repository URL (replace with your repository URL)
git remote add origin https://github.com/yourusername/restaurant-management-service.git
```

## Git Push Process
```bash
# Check the status of your files
git status

# Add all files to staging
git add .

# Create a commit with a message
git commit -m "Your commit message here"

# Push the code to GitHub (main branch)
git push origin main

# If you're pushing to a different branch
git push origin your-branch-name

# If it's your first push and the remote branch doesn't exist yet
git push -u origin main
```

## Fixing Server Connection Issues

The ECONNREFUSED error indicates that the client can't connect to the server. To fix this:

1. **Start the server first**:
```bash
# Navigate to the server directory
cd "d:\3rd 2nd\Distributed System\Restaurant Management Service\server"

# Install dependencies (if you haven't already)
npm install

# Start the server in development mode
npm run dev
# OR
node server.js
```

2. **Verify the server is running** - You should see:
```
Connected to MongoDB
Server running on port 5002
```

3. **Start the client in a new terminal window**:
```bash
# Navigate to the client directory
cd "d:\3rd 2nd\Distributed System\Restaurant Management Service\client"

# Install dependencies (if you haven't already)
npm install

# Start the development server
npm run dev
```

4. **Check for any errors** in the server terminal when requests are made.

## Troubleshooting ECONNREFUSED Errors

If you're getting ECONNREFUSED errors like:
```
Error: connect ECONNREFUSED 127.0.0.1:5002
```

Try these troubleshooting steps:

1. **Check if the server is actually running**:
```bash
# On Windows
netstat -ano | findstr :5002

# On Mac/Linux
lsof -i :5002
```

2. **Ensure MongoDB is accessible**:
   - Check your MongoDB connection string in `.env` file
   - Verify you can connect to MongoDB Atlas or your local MongoDB instance

3. **Check for port conflicts**:
   - Another application might be using port 5002
   - Try changing the port in the server's `.env` file:
     ```
     PORT=5003
     ```
   - If you change the server port, update the proxy in `client/vite.config.js`:
     ```js
     proxy: {
       '/api': {
         target: 'http://localhost:5003',
         // ...
       }
     }
     ```

4. **Restart both client and server**:
   - Stop both applications (Ctrl+C in both terminals)
   - Start the server first, then the client

5. **Clear browser cache**:
   - Open developer tools (F12)
   - Hold the refresh button and select "Empty Cache and Hard Reload"

6. **Check firewall settings**:
   - Ensure your firewall allows connections on the server port

## Additional Git Commands
```bash
# Create and switch to a new branch
git checkout -b new-branch-name

# Switch to existing branch
git checkout branch-name

# View commit history
git log

# Pull latest changes from remote
git pull origin main
```
