import Profile from "../models/profile.model.js";
import Auth from "../models/auth.model.js";
import s3 from "../config/s3.js";
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure multer with memory storage
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload image to AWS S3
const uploadToS3 = async (file, folder) => {
  const fileKey = `elite-paisa/${folder}/${uuidv4()}-${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploaded = await s3.upload(params).promise();
  return uploaded.Location; // Return public URL
};

// Helper function to delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract key from URL
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(3).join('/'); // Remove https://bucket-name.s3.region.amazonaws.com/
    
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();
  } catch (error) {
    console.error('Error deleting image from S3:', error);
  }
};

// @desc    Create or Update user profile
// @route   POST /api/profile
// @access  Private
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      fullName,
      panNo,
      adharNo,
      phoneNo,
      phoneNo2,
      email,
      address,
      age,
      employmentDetails,
      bankDetails,
      profilePic
    } = req.body;

    // Check if profile already exists for this user
    let profile = await Profile.findOne({ authId: req.user.id });

    if (profile) {
      // Update existing profile
      const updateData = { 
        fullName,
        panNo,
        adharNo,
        phoneNo,
        phoneNo2,
        email,
        address,
        age,
        employmentDetails,
        bankDetails
      };
      
      // Add profilePic if provided
      if (profilePic) {
        updateData.profilePic = profilePic;
      }
      
      profile = await Profile.findOneAndUpdate(
        { authId: req.user.id },
        updateData,
        {
          new: true,
          runValidators: true
        }
      );
      
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    } else {
      // Create new profile
      const profileData = {
        authId: req.user.id,
        fullName,
        panNo,
        adharNo,
        phoneNo,
        phoneNo2,
        email,
        address,
        age,
        employmentDetails,
        bankDetails
      };
      
      // Add profilePic if provided
      if (profilePic) {
        profileData.profilePic = profilePic;
      }
      
      profile = await Profile.create(profileData);
      
      res.status(201).json({
        success: true,
        message: "Profile created successfully",
        profile,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ authId: req.user.id }).populate('authId', 'fullName email phoneNo role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('=== PROFILE ERROR ===');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all user profiles
// @route   GET /api/profile/all
// @access  Private/Admin
export const getAllProfiles = async (req, res) => {
  try {
    // Only admin can access all profiles
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }
    
    const profiles = await Profile.find().populate('authId', 'fullName email phoneNo role');

    res.status(200).json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get a specific user profile by ID
// @route   GET /api/profile/:id
// @access  Private (Admin can access any, Client can access own)
export const getUserProfileById = async (req, res) => {
  try {
    const requestedId = req.params.id;
    
    // For clients, only allow access to their own profile
    if (req.user.role === 'client' && requestedId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own profile."
      });
    }
    
    // Admin can access any profile, client can access their own
    const profile = await Profile.findOne({ authId: requestedId }).populate('authId', 'fullName email phoneNo role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      panNo,
      adharNo,
      phoneNo,
      phoneNo2,
      email,
      address,
      age,
      employmentDetails,
      bankDetails,
      profilePic
    } = req.body;

    // Check if profile exists for this user
    const profile = await Profile.findOne({ authId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Prepare update data
    const updateData = { 
      fullName,
      panNo,
      adharNo,
      phoneNo,
      phoneNo2,
      email,
      address,
      age,
      employmentDetails,
      bankDetails
    };
    
    // Add profilePic if provided
    if (profilePic) {
      updateData.profilePic = profilePic;
    }
    
    const updatedProfile = await Profile.findOneAndUpdate(
      { authId: req.user.id },
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('authId', 'fullName email phoneNo role');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profile
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    // Check if profile exists for this user
    const profile = await Profile.findOne({ authId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Delete profile picture from S3 if it exists
    if (profile.profilePic) {
      await deleteImageFromS3(profile.profilePic);
    }

    // Delete the profile from database
    await Profile.findOneAndDelete({ authId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload/profile-pic
// @access  Private
export const uploadProfilePic = async (req, res) => {
  try {
    console.log('Upload profile pic request received');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload image to S3
    const imageUrl = await uploadToS3(req.file, 'profile-pics');

    // Get current profile to check for existing image
    const currentProfile = await Profile.findOne({ authId: req.user.id });
    
    if (!currentProfile) {
      // If profile doesn't exist, we'll return the image URL so it can be used when creating the profile
      return res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profilePic: imageUrl
        }
      });
    }

    // Delete old image if it exists
    if (currentProfile.profilePic) {
      await deleteImageFromS3(currentProfile.profilePic);
    }

    // Update profile with new image URL
    const profile = await Profile.findOneAndUpdate(
      { authId: req.user.id },
      { profilePic: imageUrl },
      { new: true }
    ).populate('authId', 'fullName email phoneNo role');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePic: imageUrl
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};