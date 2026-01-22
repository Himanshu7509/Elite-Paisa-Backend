import LoanApplication from "../models/LoanApplication.js";
import Profile from "../models/profile.model.js";
import LoanType from "../models/LoanType.js";
import s3 from "../config/s3.js";
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure multer with memory storage
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload document to AWS S3
const uploadToS3 = async (file, folder, subfolder) => {
  const fileKey = `elite-paisa/${folder}/${subfolder}/${uuidv4()}-${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploaded = await s3.upload(params).promise();
  return uploaded.Location; // Return public URL
};

// Helper function to delete document from S3
const deleteDocumentFromS3 = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract key from URL
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(3).join('/'); // Remove https://bucket-name.s3.region.amazonaws.com/
    
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();
  } catch (error) {
    console.error('Error deleting document from S3:', error);
  }
};

// @desc    Upload loan application documents
// @route   POST /api/loan-applications/upload/:documentType
// @access  Private/Client
export const uploadLoanDocument = async (req, res) => {
  try {
    // Check if user is client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Client rights required."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Determine document type and subfolder
    const documentType = req.params.documentType;
    const validDocumentTypes = ['pan', 'aadhaar', 'bank-statement', 'salary-slip', 'property-document', 'business-document'];
    
    if (!validDocumentTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Valid types: ${validDocumentTypes.join(', ')}`
      });
    }

    // Upload document to S3
    const documentUrl = await uploadToS3(req.file, 'loan-documents', documentType);

    res.status(200).json({
      success: true,
      message: `${documentType} document uploaded successfully`,
      data: {
        documentUrl
      }
    });
  } catch (error) {
    console.error('Error uploading loan document:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading loan document',
      error: error.message
    });
  }
};

// @desc    Apply for a loan
// @route   POST /api/loan-applications/apply
// @access  Private/Client
export const applyForLoan = async (req, res) => {
  try {
    // Check if user is client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Client rights required."
      });
    }

    const { loanTypeId, loanAmount, tenure, purpose, monthlyIncome, existingEMI, creditScore, documents } = req.body;

    // Validate profile exists for authId
    const profile = await Profile.findOne({ authId: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please complete your profile first."
      });
    }

    // Validate loan type exists and is active
    const loanType = await LoanType.findById(loanTypeId);
    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: "Loan type not found"
      });
    }

    if (loanType.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Selected loan type is not active"
      });
    }

    // Validate loan amount is within range
    if (loanAmount < loanType.minAmount || loanAmount > loanType.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Loan amount must be between ${loanType.minAmount} and ${loanType.maxAmount}`
      });
    }

    // Validate tenure is within range
    if (tenure < loanType.tenure.minMonths || tenure > loanType.tenure.maxMonths) {
      return res.status(400).json({
        success: false,
        message: `Tenure must be between ${loanType.tenure.minMonths} and ${loanType.tenure.maxMonths} months`
      });
    }

    // Create loan application
    const loanApplicationData = {
      authId: req.user.id,
      profileId: profile._id,
      loanTypeId,
      loanAmount,
      tenure,
      purpose,
      monthlyIncome,
      existingEMI: existingEMI || 0,
      creditScore,
      documents: documents || {}
    };

    const loanApplication = await LoanApplication.create(loanApplicationData);

    // Populate related data
    const populatedApplication = await LoanApplication.findById(loanApplication._id)
      .populate('authId', 'fullName email phoneNo')
      .populate('profileId', 'fullName panNo adharNo')
      .populate('loanTypeId', 'loanName loanCategory loanSubcategory minAmount maxAmount');

    res.status(201).json({
      success: true,
      message: "Loan application submitted successfully",
      loanApplication: populatedApplication
    });
  } catch (error) {
    console.error("Error applying for loan:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get my loan applications
// @route   GET /api/loan-applications/my
// @access  Private/Client
export const getMyLoanApplications = async (req, res) => {
  try {
    // Check if user is client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Client rights required."
      });
    }

    const { status, loanType, loanSubcategory } = req.query;
    
    // Build filter object
    const filter = { authId: req.user.id };
    if (status) filter.applicationStatus = status;
    if (loanType) filter.loanTypeId = loanType;
    if (loanSubcategory) {
      // Filter by loan subcategory by joining with LoanType collection
      const loanTypesWithSubcategory = await LoanType.find({ loanSubcategory }).select('_id');
      const loanTypeIds = loanTypesWithSubcategory.map(type => type._id);
      if (loanTypeIds.length > 0) {
        filter.loanTypeId = { $in: loanTypeIds };
      }
    }

    const loanApplications = await LoanApplication.find(filter)
      .populate('authId', 'fullName email')
      .populate('profileId', 'fullName')
      .populate('loanTypeId', 'loanName loanCategory loanSubcategory')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: loanApplications.length,
      loanApplications
    });
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get all loan applications
// @route   GET /api/loan-applications
// @access  Private/Admin
export const getAllLoanApplications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const { status, loanType, loanSubcategory } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.applicationStatus = status;
    if (loanType) filter.loanTypeId = loanType;
    if (loanSubcategory) {
      // Filter by loan subcategory by joining with LoanType collection
      const loanTypesWithSubcategory = await LoanType.find({ loanSubcategory }).select('_id');
      const loanTypeIds = loanTypesWithSubcategory.map(type => type._id);
      if (loanTypeIds.length > 0) {
        filter.loanTypeId = { $in: loanTypeIds };
      }
    }

    const loanApplications = await LoanApplication.find(filter)
      .populate('authId', 'fullName email phoneNo')
      .populate('profileId', 'fullName panNo adharNo')
      .populate('loanTypeId', 'loanName loanCategory loanSubcategory')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: loanApplications.length,
      loanApplications
    });
  } catch (error) {
    console.error("Error fetching all loan applications:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get loan application by ID
// @route   GET /api/loan-applications/:id
// @access  Private/Admin/Client
export const getLoanApplicationById = async (req, res) => {
  try {
    const loanApplication = await LoanApplication.findById(req.params.id)
      .populate('authId', 'fullName email phoneNo')
      .populate('profileId', 'fullName panNo adharNo address')
      .populate('loanTypeId', 'loanName loanCategory loanSubcategory minAmount maxAmount interestRate tenure');

    if (!loanApplication) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found"
      });
    }

    // Check authorization - admin can access all, client can access only own
    if (req.user.role === 'client' && loanApplication.authId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own applications."
      });
    }

    res.status(200).json({
      success: true,
      loanApplication
    });
  } catch (error) {
    console.error("Error fetching loan application:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid loan application ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/loan-applications/:id/status
// @access  Private/Admin
export const updateApplicationStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // Validate status value
    const validStatuses = ['pending', 'approved', 'rejected', 'disbursed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updateData = {
      applicationStatus: status
    };

    if (remarks) {
      updateData.adminRemarks = remarks;
    }

    const loanApplication = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('authId', 'fullName email phoneNo')
    .populate('profileId', 'fullName panNo adharNo')
    .populate('loanTypeId', 'loanName loanCategory loanSubcategory');

    if (!loanApplication) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Loan application status updated successfully",
      loanApplication
    });
  } catch (error) {
    console.error("Error updating loan application status:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid loan application ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};