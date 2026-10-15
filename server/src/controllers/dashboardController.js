import User from '../models/User.js';
import Activity from '../models/Activity.js';
import CarbonLog from '../models/CarbonLog.js';
import { calculateGreenScore } from '../utils/greenScoreCalculator.js';
import { seedInitialActivitiesIfEmpty } from '../utils/activitySeeder.js';

/**
 * @desc    Get complete dashboard summary for authenticated student
 * @route   GET /api/dashboard
 * @access  Private (JWT)
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Fetch refreshed user record
    const user = await User.findById(studentId);

    // Fetch all student activities
    const allActivities = await Activity.find({ studentId }).sort({
      timestamp: -1,
    });

    const verifiedActivities = allActivities.filter((act) => act.verified);

    // Timeframe filters for points
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const pointsThisWeek = verifiedActivities
      .filter((a) => new Date(a.timestamp) >= sevenDaysAgo)
      .reduce((sum, a) => sum + a.points, 0);

    const pointsThisMonth = verifiedActivities
      .filter((a) => new Date(a.timestamp) >= thirtyDaysAgo)
      .reduce((sum, a) => sum + a.points, 0);

    // Calculate Green Score (0 - 100)
    const greenScoreResult = calculateGreenScore(
      verifiedActivities,
      user.ecoPoints
    );

    // Fetch carbon footprint logs for student
    const carbonLogs = await CarbonLog.find({ studentId })
      .sort({ calculatedAt: -1 })
      .limit(2);

    let carbonSummary = null;

    if (carbonLogs && carbonLogs.length > 0) {
      const currentLog = carbonLogs[0];
      const previousLog = carbonLogs.length > 1 ? carbonLogs[1] : null;

      const currentFootprint = currentLog.totalWeeklyKgCO2e;
      const previousFootprint = previousLog
        ? previousLog.totalWeeklyKgCO2e
        : null;

      let difference = null;
      let percentageChange = null;

      if (previousFootprint !== null && previousFootprint > 0) {
        difference = Number((currentFootprint - previousFootprint).toFixed(2));
        percentageChange = Number(
          (((currentFootprint - previousFootprint) / previousFootprint) * 100).toFixed(1)
        );
      }

      carbonSummary = {
        currentFootprint,
        previousFootprint,
        difference,
        percentageChange,
        breakdown: currentLog.breakdown || {},
        lastCalculated: currentLog.calculatedAt,
      };
    }

    return res.json({
      success: true,
      student: {
        id: user._id,
        fullName: user.fullName,
        collegeId: user.collegeId,
        department: user.department,
        role: user.role,
        createdAt: user.createdAt,
      },
      ecoPoints: {
        current: user.ecoPoints,
        thisWeek: pointsThisWeek,
        thisMonth: pointsThisMonth,
        total: user.ecoPoints,
      },
      greenScore: greenScoreResult,
      activityStats: {
        totalActivities: allActivities.length,
        verifiedActivities: verifiedActivities.length,
        unverifiedActivities: allActivities.length - verifiedActivities.length,
      },
      carbonSummary, // null when no calculation exists
      recentActivities: allActivities.slice(0, 5),
      badges: user.badges || [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all activities for authenticated student
 * @route   GET /api/activities
 * @access  Private (JWT)
 */
export const getStudentActivities = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const activities = await Activity.find({ studentId }).sort({
      timestamp: -1,
    });

    return res.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get recent activities (limit 5)
 * @route   GET /api/activities/recent
 * @access  Private (JWT)
 */
export const getRecentActivities = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const recent = await Activity.find({ studentId })
      .sort({ timestamp: -1 })
      .limit(5);

    return res.json({
      success: true,
      recent,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get student points ledger / history
 * @route   GET /api/points/history
 * @access  Private (JWT)
 */
export const getPointsHistory = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const user = await User.findById(studentId);
    const verifiedActivities = await Activity.find({
      studentId,
      verified: true,
    }).sort({ timestamp: -1 });

    // Build timeline items
    const history = [];

    // 1. Initial registration welcome bonus
    history.push({
      id: 'welcome_bonus',
      title: 'Welcome to EcoPulse Campus Platform',
      source: 'Welcome Bonus',
      points: 50,
      type: 'bonus',
      date: user.createdAt,
    });

    // 2. Verified activity points
    for (const act of verifiedActivities) {
      history.push({
        id: act._id,
        title: act.title,
        source: act.verificationMethod + ' Verified Activity',
        points: act.points,
        type: 'activity',
        activityType: act.activityType,
        date: act.timestamp,
      });
    }

    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json({
      success: true,
      currentPoints: user.ecoPoints,
      history,
    });
  } catch (err) {
    next(err);
  }
};
