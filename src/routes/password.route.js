import express from 'express';
import { forgotPassword, verifyOTP, resetPassword, resendOTP } from '../controllers/password.controller.js';

const router = express.Router();

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

export default router;