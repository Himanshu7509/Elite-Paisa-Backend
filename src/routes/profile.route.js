import express from "express";
const router = express.Router();

import { createOrUpdateProfile, getProfile, getAllProfiles, getUserProfileById, updateProfile, deleteProfile, uploadProfilePic, upload } from "../controllers/profile.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

router.route("/").post(protect, createOrUpdateProfile).get(protect, getProfile).put(protect, updateProfile);
router.route("/:id").put(protect, adminOnly, updateAnyProfile);
router.route("/:id").delete(protect, deleteProfile);

// Profile picture upload route
router.route("/upload/profile-pic").post(protect, upload.single('profilePic'), uploadProfilePic);

// Admin routes
router.route("/all").get(protect, adminOnly, getAllProfiles);
router.route("/detail/:id").get(protect, getUserProfileById);

export default router;