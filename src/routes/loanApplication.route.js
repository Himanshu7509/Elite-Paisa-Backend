import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { 
  applyForLoan,
  getMyLoanApplications,
  getAllLoanApplications,
  getLoanApplicationById,
  updateApplicationStatus,
  uploadLoanDocument,
  upload as loanAppUpload
} from "../controllers/loanApplication.controller.js";

const router = express.Router();

// Route: POST /api/loan-applications/apply (client only)
router.post("/apply", protect, requireRole('client'), applyForLoan);

// Route: GET /api/loan-applications/my (client only)
router.get("/my", protect, requireRole('client'), getMyLoanApplications);

// Route: GET /api/loan-applications (admin only)
router.get("/", protect, requireRole('admin'), getAllLoanApplications);

// Route: GET /api/loan-applications/:id (admin/client - client can access only own)
router.get("/:id", protect, getLoanApplicationById);

// Route: POST /api/loan-applications/upload/:documentType (client only)
router.post("/upload/:documentType", protect, requireRole('client'), loanAppUpload.single('document'), uploadLoanDocument);

// Route: PATCH /api/loan-applications/:id/status (admin only)
router.patch("/:id/status", protect, requireRole('admin'), updateApplicationStatus);

export default router;