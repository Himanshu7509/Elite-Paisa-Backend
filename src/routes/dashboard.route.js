import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { 
  getDashboardStats,
  getRecentApplications,
  getApplicationsByStatus,
  getApplicationsByLoanType,
  getMonthlyTrends
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// Dashboard routes - admin only
router.route("/stats")
  .get(protect, adminOnly, getDashboardStats);

router.route("/recent-applications")
  .get(protect, adminOnly, getRecentApplications);

router.route("/applications-by-status")
  .get(protect, adminOnly, getApplicationsByStatus);

router.route("/applications-by-loan-type")
  .get(protect, adminOnly, getApplicationsByLoanType);

router.route("/monthly-trends")
  .get(protect, adminOnly, getMonthlyTrends);

export default router;