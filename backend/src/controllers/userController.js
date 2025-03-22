const User = require('../models/User');

// Get current user profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    // Get Clerk ID from request headers or query params
    const clerkId = req.headers['x-clerk-user-id'] || req.query.clerkId;
    
    if (!clerkId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: No user ID provided' 
      });
    }
    
    console.log('Looking up user with Clerk ID:', clerkId);
    
    // Find user by Clerk ID
    const user = await User.findOne({ clerkId })
      .populate('booksShared')
      .populate('booksBorrowed');
    
    if (!user) {
      console.log('User not found with Clerk ID:', clerkId);
      
      // Return a structured response for missing users
      return res.status(404).json({ 
        success: false,
        message: 'User not found in database. Please create a profile via the Clerk webhook endpoint.',
        clerkId: clerkId
      });
    }
    
    // Return successful response
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting current user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('booksShared')
      .populate('booksBorrowed');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, location, interests, phoneNumber } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (interests) user.interests = interests;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    await user.save();
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's shared books
exports.getUserSharedBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('booksShared');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.booksShared);
  } catch (error) {
    console.error('Error getting user shared books:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's borrowed books
exports.getUserBorrowedBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('booksBorrowed');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.booksBorrowed);
  } catch (error) {
    console.error('Error getting user borrowed books:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create or update user from Clerk webhook
exports.createOrUpdateUser = async (req, res) => {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ clerkId: id });
    
    if (user) {
      // Update existing user
      user.email = email_addresses[0].email_address;
      user.firstName = first_name;
      user.lastName = last_name;
      user.profileImage = image_url;
      
      await user.save();
      return res.status(200).json(user);
    }
    
    // Create new user
    user = new User({
      clerkId: id,
      email: email_addresses[0].email_address,
      firstName: first_name,
      lastName: last_name,
      profileImage: image_url
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by Clerk ID
exports.getUserByClerkId = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 