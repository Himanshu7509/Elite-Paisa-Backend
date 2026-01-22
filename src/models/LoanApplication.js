import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  pan: {
    type: String,
    trim: true
  },
  aadhaar: {
    type: String,
    trim: true
  },
  bankStatement: {
    type: String,
    trim: true
  },
  salarySlip: {
    type: String,
    trim: true
  }
}, {
  _id: false // Disable _id for subdocuments
});

const loanApplicationSchema = new mongoose.Schema({
  authId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: [true, "Auth ID is required"]
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: [true, "Profile ID is required"]
  },
  loanTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LoanType",
    required: [true, "Loan Type ID is required"]
  },
  loanAmount: {
    type: Number,
    required: [true, "Loan amount is required"],
    min: [0, "Loan amount cannot be negative"]
  },
  tenure: {
    type: Number,
    required: [true, "Tenure is required"],
    min: [1, "Tenure must be at least 1 month"]
  },
  purpose: {
    type: String,
    trim: true
  },
  monthlyIncome: {
    type: Number,
    min: [0, "Monthly income cannot be negative"]
  },
  existingEMI: {
    type: Number,
    default: 0,
    min: [0, "Existing EMI cannot be negative"]
  },
  creditScore: {
    type: Number,
    min: [300, "Credit score must be between 300 and 900"],
    max: [900, "Credit score must be between 300 and 900"]
  },
  documents: documentSchema,
  applicationStatus: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'disbursed'],
      message: 'Application status must be one of: pending, approved, rejected, disbursed'
    },
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
loanApplicationSchema.index({ authId: 1 });
loanApplicationSchema.index({ loanTypeId: 1 });
loanApplicationSchema.index({ applicationStatus: 1 });
loanApplicationSchema.index({ appliedAt: -1 });

// Middleware to update updatedAt field
loanApplicationSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

loanApplicationSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

const LoanApplication = mongoose.model("LoanApplication", loanApplicationSchema);

export default LoanApplication;