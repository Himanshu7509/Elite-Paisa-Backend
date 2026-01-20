import Auth from '../models/auth.model.js';
import resend from '../config/email.js';
import bcrypt from 'bcryptjs';

// Forgot password - send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Find user by email
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration time (5 minutes from now)
    const otpExpires = Date.now() + 5 * 60 * 1000;

    console.log('Generated OTP for', email, ':', otp);
    console.log('OTP Expires at:', new Date(otpExpires));

    // Save OTP and expiration to user document without triggering password hash
    await Auth.findByIdAndUpdate(user._id, {
      resetPasswordToken: otp,
      resetPasswordExpires: otpExpires
    }, { new: true });

    // Send OTP via email using Resend with enhanced template
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@eliteassociate.in',
        to: email,
        subject: 'Password Reset OTP - Elite Paisa',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 30px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">Elite Paisa</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; text-align: center; font-size: 16px;">Financial Management Platform</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Hello,</h2>
                        
                        <div style="color: #555; line-height: 1.6; font-size: 16px;">
                          <p style="margin: 0 0 15px 0;">You have requested to reset your password for your Elite Paisa account.</p>
                          <p style="margin: 0 0 15px 0;">Please use the following One-Time Password (OTP) to proceed with resetting your password:</p>
                          
                          <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; padding: 15px 25px; background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px;">
                              <h3 style="color: #667eea; margin: 0; font-size: 24px; letter-spacing: 3px;">${otp}</h3>
                            </div>
                          </div>
                          
                          <p style="margin: 0 0 15px 0;">This OTP will expire in <strong>5 minutes</strong>. If you did not request this password reset, please ignore this email or contact our support team.</p>
                          
                          <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                            <p style="margin: 0; color: #856404; font-weight: bold;">Security Notice:</p>
                            <p style="margin: 5px 0 0 0; color: #856404;">Never share this OTP with anyone. Elite Paisa support will never ask for your OTP.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                        <div style="text-align: center; color: #666; font-size: 14px;">
                          <p style="margin: 0 0 10px 0;">
                            <strong>Need Help?</strong> Contact our support team
                          </p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                          <p style="margin: 0;">
                            © ${new Date().getFullYear()} Elite Paisa. All rights reserved.
                          </p>
                          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                            This email was sent to ${email} regarding your Elite Paisa account.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email address'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user by email
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Debug logging
    console.log('=== OTP VERIFICATION DEBUG ===');
    console.log('Email:', email);
    console.log('Provided OTP:', otp);
    console.log('Stored OTP from initial query:', user.resetPasswordToken);
    console.log('OTP Expires:', user.resetPasswordExpires);
    console.log('Current Time:', Date.now());
    console.log('Is Expired:', user.resetPasswordExpires < Date.now());
    
    // Fetch user again to ensure we have latest data
    const freshUser = await Auth.findOne({ email });
    console.log('Fresh user data:');
    console.log('- Reset Token:', freshUser.resetPasswordToken);
    console.log('- Reset Expires:', freshUser.resetPasswordExpires);
    console.log('- Match Result:', freshUser.resetPasswordToken === otp);
    console.log('===============================');

    // Check if OTP is valid and not expired
    if (user.resetPasswordToken !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, new password, and confirm password'
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    // Check password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by email
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if OTP is valid and not expired
    if (user.resetPasswordToken !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update password and clear reset tokens
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await Auth.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    }, { new: true });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Find user by email
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration time (5 minutes from now)
    const otpExpires = Date.now() + 5 * 60 * 1000;

    // Save OTP and expiration to user document without triggering password hash
    await Auth.findByIdAndUpdate(user._id, {
      resetPasswordToken: otp,
      resetPasswordExpires: otpExpires
    }, { new: true });

    // Send OTP via email using Resend
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@eliteassociate.in',
        to: email,
        subject: 'Password Reset OTP - Elite Paisa (Resend)',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 30px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">Elite Paisa</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; text-align: center; font-size: 16px;">Financial Management Platform</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Hello,</h2>
                        
                        <div style="color: #555; line-height: 1.6; font-size: 16px;">
                          <p style="margin: 0 0 15px 0;">You have requested to resend the OTP for resetting your password for your Elite Paisa account.</p>
                          <p style="margin: 0 0 15px 0;">Please use the following One-Time Password (OTP) to proceed with resetting your password:</p>
                          
                          <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; padding: 15px 25px; background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px;">
                              <h3 style="color: #667eea; margin: 0; font-size: 24px; letter-spacing: 3px;">${otp}</h3>
                            </div>
                          </div>
                          
                          <p style="margin: 0 0 15px 0;">This OTP will expire in <strong>5 minutes</strong>. If you did not request this password reset, please ignore this email or contact our support team.</p>
                          
                          <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                            <p style="margin: 0; color: #856404; font-weight: bold;">Security Notice:</p>
                            <p style="margin: 5px 0 0 0; color: #856404;">Never share this OTP with anyone. Elite Paisa support will never ask for your OTP.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                        <div style="text-align: center; color: #666; font-size: 14px;">
                          <p style="margin: 0 0 10px 0;">
                            <strong>Need Help?</strong> Contact our support team
                          </p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                          <p style="margin: 0;">
                            © ${new Date().getFullYear()} Elite Paisa. All rights reserved.
                          </p>
                          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                            This email was sent to ${email} regarding your Elite Paisa account.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });

      res.status(200).json({
        success: true,
        message: 'OTP resent to your email address'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export { forgotPassword, verifyOTP, resetPassword, resendOTP };