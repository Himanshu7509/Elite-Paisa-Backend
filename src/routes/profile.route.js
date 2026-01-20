import express from "express";
const router = express.Router();

import { createOrUpdateProfile, getProfile, getAllProfiles, getUserProfileById, uploadProfilePic, upload } from "../controllers/profile.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

router.route("/").post(protect, createOrUpdateProfile).get(protect, getProfile);

// Profile picture upload route
router.route("/upload/profile-pic").post(protect, upload.single('profilePic'), uploadProfilePic);

// Admin routes
router.route("/all").get(protect, adminOnly, getAllProfiles);
router.route("/:id").get(protect, adminOnly, getUserProfileById);

export default router;