import LoanApplication from "../models/LoanApplication.js";
import Profile from "../models/profile.model.js";
import LoanType from "../models/LoanType.js";
import Auth from "../models/auth.model.js";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Only admin can access dashboard stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    // Get various statistics
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalClients,
      totalLoanTypes
    ] = await Promise.all([
      LoanApplication.countDocuments(),
      LoanApplication.countDocuments({ applicationStatus: 'pending' }),
      LoanApplication.countDocuments({ applicationStatus: 'approved' }),
      LoanApplication.countDocuments({ applicationStatus: 'rejected' }),
      Auth.countDocuments({ role: 'client' }),
      LoanType.countDocuments()
    ]);

    const stats = {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalClients,
      totalLoanTypes
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get recent loan applications
// @route   GET /api/dashboard/recent-applications
// @access  Private/Admin
export const getRecentApplications = async (req, res) => {
  try {
    // Only admin can access recent applications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const { limit = 5 } = req.query;

    const recentApplications = await LoanApplication.find()
      .populate('authId', 'fullName email phoneNo')
      .populate('profileId', 'fullName')
      .populate('loanTypeId', 'loanName loanCategory')
      .sort({ appliedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: recentApplications.length,
      recentApplications
    });
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get applications by status
// @route   GET /api/dashboard/applications-by-status
// @access  Private/Admin
export const getApplicationsByStatus = async (req, res) => {
  try {
    // Only admin can access application status data
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const statusCounts = await LoanApplication.aggregate([
      {
        $group: {
          _id: '$applicationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStatusCounts = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      statusCounts: formattedStatusCounts
    });
  } catch (error) {
    console.error("Error fetching applications by status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get applications by loan type
// @route   GET /api/dashboard/applications-by-loan-type
// @access  Private/Admin
export const getApplicationsByLoanType = async (req, res) => {
  try {
    // Only admin can access application loan type data
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const applicationsByLoanType = await LoanApplication.aggregate([
      {
        $lookup: {
          from: 'loantypes',
          localField: 'loanTypeId',
          foreignField: '_id',
          as: 'loanType'
        }
      },
      {
        $unwind: '$loanType'
      },
      {
        $group: {
          _id: '$loanType.loanName',
          count: { $sum: 1 },
          loanCategory: { $first: '$loanType.loanCategory' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      applicationsByLoanType
    });
  } catch (error) {
    console.error("Error fetching applications by loan type:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get monthly trends
// @route   GET /api/dashboard/monthly-trends
// @access  Private/Admin
export const getMonthlyTrends = async (req, res) => {
  try {
    // Only admin can access monthly trend data
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required."
      });
    }

    const { months = 6 } = req.query;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - parseInt(months));

    const monthlyTrends = await LoanApplication.aggregate([
      {
        $match: {
          appliedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$loanAmount' },
          approvedCount: {
            $sum: {
              $cond: [{ $eq: ['$applicationStatus', 'approved'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          totalAmount: 1,
          approvedCount: 1,
          monthName: {
            $arrayElemAt: [
              [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ],
              { $subtract: ['$month', 1] }
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      monthlyTrends
    });
  } catch (error) {
    console.error("Error fetching monthly trends:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};