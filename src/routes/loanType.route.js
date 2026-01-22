import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { 
  createLoanType,
  getAllLoanTypes,
  getLoanTypeById,
  updateLoanType,
  deleteLoanType
} from "../controllers/loanType.controller.js";

const router = express.Router();

// Route: POST /api/loan-types (admin only)
router.route("/")
  .post(protect, requireRole('admin'), createLoanType)
  .get(getAllLoanTypes); // Public access

// Route: GET /api/loan-types/:id
router.route("/:id")
  .get(getLoanTypeById) // Public access
  .put(protect, requireRole('admin'), updateLoanType)
  .delete(protect, requireRole('admin'), deleteLoanType);

export default router;