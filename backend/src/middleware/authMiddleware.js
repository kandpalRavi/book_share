const { Clerk } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Initialize Clerk
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware to verify Clerk session
exports.requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Clerk
    const session = await clerk.sessions.verifyToken(token);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    // Get user from database
    const user = await User.findOne({ clerkId: session.sub });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized: Authentication failed', error: error.message });
  }
};

// Middleware to get current user (optional auth)
exports.getCurrentUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Clerk
    const session = await clerk.sessions.verifyToken(token);
    
    if (!session) {
      req.user = null;
      return next();
    }
    
    // Get user from database
    const user = await User.findOne({ clerkId: session.sub });
    
    // Attach user to request object
    req.user = user || null;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    req.user = null;
    next();
  }
}; 