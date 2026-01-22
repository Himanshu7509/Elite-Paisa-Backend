import mongoose from "mongoose";

const loanTypeSchema = new mongoose.Schema({
  loanName: {
    type: String,
    required: [true, "Loan name is required"],
    trim: true
  },
  loanCategory: {
    type: String,
    enum: {
      values: ['personal', 'home', 'vehicle', 'business', 'education', 'agriculture', 'gold', 'other'],
      message: 'Loan category must be one of: personal, home, vehicle, business, education, agriculture, gold, other'
    },
    required: [true, "Loan category is required"]
  },
  loanSubcategory: {
    type: String,
    enum: {
      values: [
        // Personal Loan Subcategories
        'personal', 'instant-personal', 'short-term', 'emergency', 'wedding', 'travel', 'medical',
        // Home & Property Loan Subcategories
        'home', 'home-construction', 'home-renovation', 'land-plot', 'loan-against-property',
        // Vehicle Loan Subcategories
        'car-new', 'car-used', 'two-wheeler', 'commercial-vehicle',
        // Business Loan Subcategories
        'business', 'startup', 'msme-sme', 'working-capital', 'machinery', 'invoice-bill-discounting', 'merchant-cash-advance',
        // Education Loan Subcategories
        'education-india', 'education-abroad', 'skill-development',
        // Agriculture Loan Subcategories
        'crop', 'equipment-tractor', 'irrigation', 'kisan-credit-card',
        // Gold & Secured Loan Subcategories
        'gold', 'fixed-deposit', 'loan-against-shares-mutual-funds'
      ],
      message: 'Invalid loan subcategory'
    },
    required: [true, "Loan subcategory is required"]
  },
  minAmount: {
    type: Number,
    required: [true, "Minimum amount is required"],
    min: [0, "Minimum amount cannot be negative"]
  },
  maxAmount: {
    type: Number,
    required: [true, "Maximum amount is required"],
    min: [0, "Maximum amount cannot be negative"]
  },
  interestRate: {
    min: {
      type: Number,
      min: [0, "Interest rate minimum cannot be negative"]
    },
    max: {
      type: Number,
      min: [0, "Interest rate maximum cannot be negative"]
    }
  },
  tenure: {
    minMonths: {
      type: Number,
      min: [1, "Minimum tenure must be at least 1 month"]
    },
    maxMonths: {
      type: Number,
      min: [1, "Maximum tenure must be at least 1 month"]
    }
  },
  processingFee: {
    type: String,
    trim: true
  },
  eligibilityCriteria: {
    type: String,
    trim: true
  },
  requiredDocuments: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be either active or inactive'
    },
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: [true, "Created by is required"]
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
loanTypeSchema.index({ loanCategory: 1 });
loanTypeSchema.index({ status: 1 });
loanTypeSchema.index({ createdBy: 1 });

const LoanType = mongoose.model("LoanType", loanTypeSchema);

export default LoanType;