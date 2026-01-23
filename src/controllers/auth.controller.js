import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";
import Profile from "../models/profile.model.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_jwt_secret_key_for_development", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { fullName, email, phoneNo, password, role } = req.body;

    // Validate role if provided
    if (role && !['admin', 'client'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either admin or client'
      });
    }

    // Prevent users from signing up as admin directly
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin registration is not allowed. Admin access is controlled via environment variables.'
      });
    }

    // Check if user already exists
    const userExists = await Auth.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user with specified role (or default to client)
    const user = await Auth.create({
      fullName,
      email,
      phoneNo,
      password,
      role: role || 'client'
    });

    try {
      const profileData = {
        authId: user._id,
        fullName,  // Populated from signup
        email,     // Populated from signup
        phoneNo,   // Populated from signup
        // All other fields are optional, only include the signup data
      };
      
      // Automatically create profile for the user with minimal required data
      const profile = await Profile.create(profileData);
      
      if (user) {
        const token = generateToken(user._id);
        
        res.status(201).json({
          success: true,
          message: "User registered successfully. Please update your profile with complete information.",
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNo: user.phoneNo,
            role: user.role
          },
          profile: {
            id: profile._id,
            authId: profile.authId,
            fullName: profile.fullName,
            email: profile.email,
            phoneNo: profile.phoneNo,
            panNo: profile.panNo,
            adharNo: profile.adharNo
          }
        });
      }
    } catch (profileError) {
      // If profile creation fails, delete the user we just created
      await Auth.findByIdAndDelete(user._id);
      
      return res.status(500).json({
        success: false,
        message: "User registration failed due to profile creation error",
        error: profileError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's admin login
    const envAdminEmail = process.env.ADMIN_EMAIL?.replace(/"/g, '');
    const envAdminPassword = process.env.ADMIN_PASSWORD?.replace(/"/g, '');
    
    if (email === envAdminEmail && password === envAdminPassword) {
      // Check if admin user exists in database, if not create it
      let adminUser = await Auth.findOne({ email: envAdminEmail });
      
      if (!adminUser) {
        // Create admin user if not exists
        adminUser = new Auth({
          fullName: 'Admin User',
          email: envAdminEmail,
          phoneNo: '0000000000',
          password: envAdminPassword,
          role: 'admin'
        });
        await adminUser.save();
      } else if (adminUser.role !== 'admin') {
        // Update role to admin if needed
        adminUser.role = 'admin';
        await adminUser.save();
      }

      const token = generateToken(adminUser._id);

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: adminUser._id,
          fullName: adminUser.fullName,
          email: adminUser.email,
          phoneNo: adminUser.phoneNo,
          role: adminUser.role,
        }
      });
    }

    // Regular user login
    const user = await Auth.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check for password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
      },
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

