import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Attempts to connect to MongoDB Atlas first, falls back to local MongoDB if available
 */
export async function connectToDatabase() {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    console.log('Connecting to MongoDB...');
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      // Retry connection up to 3 times
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    };
    
    await mongoose.connect(mongoURI, options);
    console.log('✅ Connected to MongoDB successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
    
    // Display helpful error message for IP whitelist issues
    if (error.message.includes('whitelist') || error.name === 'MongooseServerSelectionError') {
      console.error('\nMONGODB CONNECTION ERROR: IP Whitelist Issue');
      console.error('----------------------------------------------');
      console.error('Your current IP address is not whitelisted in MongoDB Atlas.');
      console.error('\nTo fix this issue:');
      console.error('1. Go to MongoDB Atlas dashboard: https://cloud.mongodb.com');
      console.error('2. Select your cluster');
      console.error('3. Go to Network Access under Security');
      console.error('4. Click "Add IP Address" button');
      console.error('5. Add your current IP or use "Allow Access from Anywhere" (0.0.0.0/0)');
      console.error('6. Click "Confirm" and wait for the changes to apply\n');
      
      // Try to connect to local MongoDB as fallback
      try {
        console.log('Attempting to connect to local MongoDB instance as fallback...');
        await mongoose.connect('mongodb://localhost:27017/restaurant-service', options);
        console.log('✅ Connected to local MongoDB successfully');
        return mongoose.connection;
      } catch (localError) {
        console.error('❌ Failed to connect to local MongoDB:', localError.message);
        console.error('\nPlease ensure either:');
        console.error('- Your IP is whitelisted in MongoDB Atlas, or');
        console.error('- You have a local MongoDB instance running on port 27017');
        throw new Error('Database connection failed');
      }
    }
    
    throw error;
  }
}
