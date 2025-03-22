const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
exports.uploadImage = async (filePath, folder = 'book_sharing') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

module.exports = cloudinary; 