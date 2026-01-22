import LoanType from "../models/LoanType.js";
import Auth from "../models/auth.model.js";

// @desc    Create a new loan type
// @route   POST /api/loan-types
// @access  Private/Admin
export const createLoanType = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    // Add createdBy field with current user ID
    const loanTypeData = {
      ...req.body,
      createdBy: req.user.id
    };

    const loanType = await LoanType.create(loanTypeData);

    res.status(201).json({
      success: true,
      message: "Loan type created successfully",
      loanType
    });
  } catch (error) {
    console.error("Error creating loan type:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get all loan types
// @route   GET /api/loan-types
// @access  Public
export const getAllLoanTypes = async (req, res) => {
  try {
    const { loanCategory, loanSubcategory, status } = req.query;
    
    // Build filter object
    const filter = {};
    if (loanCategory) filter.loanCategory = loanCategory;
    if (loanSubcategory) filter.loanSubcategory = loanSubcategory;
    if (status) filter.status = status;

    const loanTypes = await LoanType.find(filter)
      .populate('createdBy', 'fullName email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: loanTypes.length,
      loanTypes
    });
  } catch (error) {
    console.error("Error fetching loan types:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get loan type by ID
// @route   GET /api/loan-types/:id
// @access  Public
export const getLoanTypeById = async (req, res) => {
  try {
    const loanType = await LoanType.findById(req.params.id)
      .populate('createdBy', 'fullName email role');

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: "Loan type not found"
      });
    }

    res.status(200).json({
      success: true,
      loanType
    });
  } catch (error) {
    console.error("Error fetching loan type:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid loan type ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update loan type
// @route   PUT /api/loan-types/:id
// @access  Private/Admin
export const updateLoanType = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const loanType = await LoanType.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'fullName email role');

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: "Loan type not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Loan type updated successfully",
      loanType
    });
  } catch (error) {
    console.error("Error updating loan type:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid loan type ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Delete loan type
// @route   DELETE /api/loan-types/:id
// @access  Private/Admin
export const deleteLoanType = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const loanType = await LoanType.findByIdAndDelete(req.params.id);

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: "Loan type not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Loan type deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting loan type:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid loan type ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};