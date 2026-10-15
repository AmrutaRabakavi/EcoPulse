import mongoose from 'mongoose';
import Initiative from '../models/Initiative.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Challenge from '../models/Challenge.js';
import CarbonLog from '../models/CarbonLog.js';

const VALID_CATEGORIES = [
  'TRANSPORT',
  'ENERGY',
  'WATER',
  'FOOD',
  'WASTE',
  'COMMUNITY',
  'TREES',
  'CAMPUS',
];

const VALID_STATUSES = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

/**
 * @desc    List initiatives with optional category and status filters
 * @route   GET /api/initiatives
 * @access  Private (Authenticated students & staff)
 */
export async function getInitiatives(req, res, next) {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category) {
      const normalizedCat = String(category).trim().toUpperCase();
      if (!VALID_CATEGORIES.includes(normalizedCat)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category filter: ${category}. Allowed categories: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
      filter.category = normalizedCat;
    }

    if (status) {
      const normalizedStatus = String(status).trim().toUpperCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter: ${status}. Allowed statuses: ${VALID_STATUSES.join(', ')}`,
        });
      }
      filter.status = normalizedStatus;
    }

    const initiatives = await Initiative.find(filter)
      .populate('organizer', 'fullName email department')
      .sort({ startDate: 1, createdAt: -1 });

    const currentUserId = req.user?._id ? req.user._id.toString() : null;

    const formattedInitiatives = initiatives.map((doc) => {
      const obj = doc.toObject();
      const participants = doc.participants || [];
      const hasJoined = currentUserId
        ? participants.some((p) => (p._id || p).toString() === currentUserId)
        : false;

      return {
        ...obj,
        participantCount: participants.length,
        hasJoined,
      };
    });

    return res.json({
      success: true,
      count: formattedInitiatives.length,
      initiatives: formattedInitiatives,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single initiative details by ID
 * @route   GET /api/initiatives/:id
 * @access  Private (Authenticated students & staff)
 */
export async function getInitiativeById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid initiative ID format',
      });
    }

    const initiative = await Initiative.findById(id)
      .populate('organizer', 'fullName email department')
      .populate('participants', 'fullName email collegeId department ecoPoints')
      .populate('verifiedParticipants', 'fullName email collegeId');

    if (!initiative) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found',
      });
    }

    const obj = initiative.toObject();
    const currentUserId = req.user?._id ? req.user._id.toString() : null;
    const participants = initiative.participants || [];
    const hasJoined = currentUserId
      ? participants.some((p) => (p._id || p).toString() === currentUserId)
      : false;

    return res.json({
      success: true,
      initiative: {
        ...obj,
        participantCount: participants.length,
        hasJoined,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Join an eligible campus initiative
 * @route   POST /api/initiatives/:id/join
 * @access  Private (Authenticated students)
 */
export async function joinInitiative(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid initiative ID format',
      });
    }

    const initiative = await Initiative.findById(id);

    if (!initiative) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found',
      });
    }

    // Status and lifecycle checks
    if (initiative.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join a cancelled initiative',
      });
    }

    if (initiative.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join a completed initiative',
      });
    }

    if (new Date(initiative.endDate).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join an initiative that has already ended',
      });
    }

    // Joining Deadline Check: If registrationDeadline is specified, close joining once deadline passes
    const joiningDeadline = initiative.registrationDeadline
      ? new Date(initiative.registrationDeadline)
      : new Date(initiative.startDate);

    if (Date.now() > joiningDeadline.getTime()) {
      return res.status(400).json({
        success: false,
        message: `Registration is closed for this initiative. Joining deadline was ${joiningDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,
      });
    }

    // Allow joining for both UPCOMING (pre-registration) and ACTIVE initiatives
    if (initiative.status !== 'ACTIVE' && initiative.status !== 'UPCOMING') {
      return res.status(400).json({
        success: false,
        message: `Cannot join initiative with status ${initiative.status}.`,
      });
    }

    // Check duplicate join
    const userId = req.user._id;
    if (initiative.hasParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this initiative',
      });
    }

    // Join initiative
    initiative.addParticipant(userId);
    await initiative.save();

    return res.json({
      success: true,
      message: 'Successfully joined initiative',
      initiative: {
        _id: initiative._id,
        title: initiative.title,
        participantCount: initiative.participants.length,
        hasJoined: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Leave an eligible campus initiative
 * @route   POST /api/initiatives/:id/leave
 * @access  Private (Authenticated students)
 */
export async function leaveInitiative(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid initiative ID format',
      });
    }

    const initiative = await Initiative.findById(id);

    if (!initiative) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found',
      });
    }

    // Lifecycle checks
    if (initiative.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave a cancelled initiative',
      });
    }

    if (initiative.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave an initiative that is already completed',
      });
    }

    if (new Date(initiative.endDate).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave an initiative that has already ended',
      });
    }

    const userId = req.user._id;
    if (!initiative.hasParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have not joined this initiative',
      });
    }

    initiative.removeParticipant(userId);
    await initiative.save();

    return res.json({
      success: true,
      message: 'Successfully left initiative',
      initiative: {
        _id: initiative._id,
        title: initiative.title,
        participantCount: initiative.participants.length,
        hasJoined: false,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create a new campus initiative
 * @route   POST /api/initiatives
 * @access  Admin only
 */
export async function createInitiative(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      registrationDeadline,
      points,
      status,
    } = req.body;

    // Validate required fields
    if (
      title === undefined ||
      description === undefined ||
      category === undefined ||
      location === undefined ||
      startDate === undefined ||
      endDate === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: title, description, category, location, startDate, and endDate are required',
      });
    }

    const trimmedTitle = String(title).trim();
    if (!trimmedTitle || trimmedTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Title must be non-empty and at most 150 characters',
      });
    }

    const trimmedDesc = String(description).trim();
    if (!trimmedDesc || trimmedDesc.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be non-empty and at most 2000 characters',
      });
    }

    const trimmedLocation = String(location).trim();
    if (!trimmedLocation) {
      return res.status(400).json({
        success: false,
        message: 'Location is required',
      });
    }

    const normalizedCategory = String(category).trim().toUpperCase();
    if (!VALID_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed categories: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      isNaN(parsedStartDate.getTime()) ||
      isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate or endDate format',
      });
    }

    if (parsedEndDate.getTime() < parsedStartDate.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Parse registrationDeadline (optional, defaults to startDate if not given)
    let parsedRegistrationDeadline = null;
    if (registrationDeadline) {
      const parsedDeadline = new Date(registrationDeadline);
      if (!isNaN(parsedDeadline.getTime())) {
        if (parsedDeadline.getTime() > parsedEndDate.getTime()) {
          return res.status(400).json({
            success: false,
            message: 'Joining deadline cannot be later than the event end date',
          });
        }
        parsedRegistrationDeadline = parsedDeadline;
      }
    }

    let initiativePoints = 10;
    if (points !== undefined) {
      const numPoints = Number(points);
      if (isNaN(numPoints) || numPoints < 0 || numPoints > 100) {
        return res.status(400).json({
          success: false,
          message: 'Points must be a number between 0 and 100',
        });
      }
      initiativePoints = numPoints;
    }

    let initiativeStatus = 'UPCOMING';
    if (status !== undefined) {
      const normalizedStatus = String(status).trim().toUpperCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed statuses: ${VALID_STATUSES.join(', ')}`,
        });
      }
      initiativeStatus = normalizedStatus;
    }

    // Always use the authenticated admin user's ID as the organizer
    const initiative = await Initiative.create({
      title: trimmedTitle,
      description: trimmedDesc,
      category: normalizedCategory,
      location: trimmedLocation,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      registrationDeadline: parsedRegistrationDeadline,
      points: initiativePoints,
      status: initiativeStatus,
      organizer: req.user._id,
      participants: [],
    });

    return res.status(201).json({
      success: true,
      message: 'Initiative created successfully',
      initiative,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update initiative details and status
 * @route   PATCH /api/initiatives/:id
 * @access  Admin only
 */
export async function updateInitiative(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid initiative ID format',
      });
    }

    const initiative = await Initiative.findById(id);

    if (!initiative) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found',
      });
    }

    const {
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      points,
      status,
    } = req.body;

    if (title !== undefined) {
      const trimmedTitle = String(title).trim();
      if (!trimmedTitle || trimmedTitle.length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Title must be non-empty and at most 150 characters',
        });
      }
      initiative.title = trimmedTitle;
    }

    if (description !== undefined) {
      const trimmedDesc = String(description).trim();
      if (!trimmedDesc || trimmedDesc.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Description must be non-empty and at most 2000 characters',
        });
      }
      initiative.description = trimmedDesc;
    }

    if (location !== undefined) {
      const trimmedLoc = String(location).trim();
      if (!trimmedLoc) {
        return res.status(400).json({
          success: false,
          message: 'Location cannot be empty',
        });
      }
      initiative.location = trimmedLoc;
    }

    if (category !== undefined) {
      const normalizedCat = String(category).trim().toUpperCase();
      if (!VALID_CATEGORIES.includes(normalizedCat)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
      initiative.category = normalizedCat;
    }

    // Date updates
    if (startDate !== undefined || endDate !== undefined) {
      const newStart =
        startDate !== undefined ? new Date(startDate) : initiative.startDate;
      const newEnd =
        endDate !== undefined ? new Date(endDate) : initiative.endDate;

      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate or endDate format',
        });
      }

      if (newEnd.getTime() < newStart.getTime()) {
        return res.status(400).json({
          success: false,
          message: 'End date cannot be earlier than start date',
        });
      }

      if (startDate !== undefined) initiative.startDate = newStart;
      if (endDate !== undefined) initiative.endDate = newEnd;
    }

    if (req.body.registrationDeadline !== undefined) {
      if (!req.body.registrationDeadline) {
        initiative.registrationDeadline = null;
      } else {
        const parsed = new Date(req.body.registrationDeadline);
        if (!isNaN(parsed.getTime())) {
          initiative.registrationDeadline = parsed;
        }
      }
    }

    if (points !== undefined) {
      const numPoints = Number(points);
      if (isNaN(numPoints) || numPoints < 0 || numPoints > 100) {
        return res.status(400).json({
          success: false,
          message: 'Points must be a number between 0 and 100',
        });
      }
      initiative.points = numPoints;
    }

    if (status !== undefined) {
      const normalizedStatus = String(status).trim().toUpperCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed statuses: ${VALID_STATUSES.join(', ')}`,
        });
      }
      initiative.status = normalizedStatus;
    }

    await initiative.save();

    return res.json({
      success: true,
      message: 'Initiative updated successfully',
      initiative,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete an initiative if it has no participants
 * @route   DELETE /api/initiatives/:id
 * @access  Admin only
 */
export async function deleteInitiative(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid initiative ID format',
      });
    }

    const initiative = await Initiative.findById(id);

    if (!initiative) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found',
      });
    }

    // Safety check: protect existing participation records from destruction
    if (initiative.participants && initiative.participants.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot delete initiative with existing participants. Please cancel or complete the initiative instead.',
        participantCount: initiative.participants.length,
      });
    }

    await Initiative.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Initiative deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Verify initiative completion and award points to participating students
 * @route   POST /api/initiatives/:id/verify
 * @access  Admin only
 */
export async function verifyInitiativeCompletion(req, res, next) {
  try {
    const { id } = req.params;
    const { studentIds } = req.body; // Array of student IDs to award, or empty for all registered participants

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid initiative ID format',
      });
    }

    const initiative = await Initiative.findById(id).populate('participants', 'fullName email collegeId department');

    if (!initiative) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found',
      });
    }

    // Enforce creator ownership: only the administrator who created the initiative can verify it
    const organizerIdStr = (initiative.organizer?._id || initiative.organizer)?.toString();
    const currentAdminIdStr = req.user._id.toString();

    if (organizerIdStr && organizerIdStr !== currentAdminIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the administrator who created this initiative can verify its completion and award points.',
      });
    }

    // Auto mark initiative status as COMPLETED
    initiative.status = 'COMPLETED';

    const participantsList = initiative.participants || [];
    if (participantsList.length === 0) {
      await initiative.save();
      return res.json({
        success: true,
        message: 'Initiative marked as COMPLETED. No student participants were enrolled.',
        verifiedCount: 0,
        awardedPoints: initiative.points,
        initiative,
      });
    }

    // Determine target students
    let targetStudentIds = [];
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      targetStudentIds = studentIds.map((sid) => sid.toString());
    } else {
      // Award all registered participants
      targetStudentIds = participantsList.map((p) => (p._id || p).toString());
    }

    const categoryMap = {
      TREES: 'conservation',
      WASTE: 'recycling',
      TRANSPORT: 'transport',
      ENERGY: 'energy',
      WATER: 'water',
      FOOD: 'food',
      COMMUNITY: 'conservation',
      CAMPUS: 'conservation',
    };
    const mappedType = categoryMap[initiative.category] || 'other';

    let verifiedCount = 0;
    const awardedStudents = [];

    for (const studentId of targetStudentIds) {
      // Check if already verified for this initiative
      const alreadyVerified = (initiative.verifiedParticipants || []).some(
        (vp) => vp.toString() === studentId
      );

      if (alreadyVerified) {
        continue;
      }

      // 1. Increment student ecoPoints
      const studentUser = await User.findById(studentId);
      if (studentUser) {
        studentUser.ecoPoints = (studentUser.ecoPoints || 0) + (initiative.points || 10);
        await studentUser.save();

        // 2. Log verified Activity record with ADMIN verification method
        await Activity.create({
          studentId: studentUser._id,
          activityType: mappedType,
          title: initiative.title,
          description: `Participated in and completed campus initiative: ${initiative.title} (${initiative.location})`,
          points: initiative.points || 10,
          verificationMethod: 'ADMIN',
          verified: true,
          timestamp: new Date(),
          metadata: {
            initiativeId: initiative._id,
            category: initiative.category,
            location: initiative.location,
            verifiedBy: req.user.fullName || 'Campus Administrator',
          },
        });

        // Add to verifiedParticipants
        if (!initiative.verifiedParticipants) {
          initiative.verifiedParticipants = [];
        }
        initiative.verifiedParticipants.push(studentUser._id);

        verifiedCount++;
        awardedStudents.push({
          id: studentUser._id,
          name: studentUser.fullName,
          newBalance: studentUser.ecoPoints,
        });
      }
    }

    await initiative.save();

    return res.json({
      success: true,
      message: `Initiative completed! Successfully verified and awarded +${initiative.points} EcoPoints to ${verifiedCount} student(s).`,
      verifiedCount,
      awardedPoints: initiative.points,
      awardedStudents,
      initiative,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Aggregate campus-wide sustainability impact metrics
 * @route   GET /api/initiatives/metrics
 * @access  Private (Authenticated students & staff)
 */
export async function getCampusImpactMetrics(req, res, next) {
  try {
    // 1. Initiative counts by status and category
    const totalInitiatives = await Initiative.countDocuments();
    const statusCountsRaw = await Initiative.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const initiativesByStatus = {
      ACTIVE: 0,
      UPCOMING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    statusCountsRaw.forEach((item) => {
      if (item._id && initiativesByStatus[item._id] !== undefined) {
        initiativesByStatus[item._id] = item.count;
      }
    });

    const categoryCountsRaw = await Initiative.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const initiativesByCategory = {};
    categoryCountsRaw.forEach((item) => {
      if (item._id) initiativesByCategory[item._id] = item.count;
    });

    // 2. Initiative total and unique student participations
    const participationAgg = await Initiative.aggregate([
      {
        $project: {
          participantCount: { $size: { $ifNull: ['$participants', []] } },
        },
      },
      {
        $group: {
          _id: null,
          totalParticipations: { $sum: '$participantCount' },
        },
      },
    ]);
    const totalParticipations = participationAgg[0]?.totalParticipations || 0;

    const uniqueStudents = await Initiative.distinct('participants');
    const uniqueParticipants = Array.isArray(uniqueStudents)
      ? uniqueStudents.length
      : 0;

    // 3. Verified sustainability activities and point rewards
    const totalActivities = await Activity.countDocuments();
    const totalVerifiedActivities = await Activity.countDocuments({
      verified: true,
    });
    const activitiesByTypeRaw = await Activity.aggregate([
      { $match: { verified: true } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
        },
      },
    ]);
    const verifiedActivitiesByType = {};
    let pointsFromVerifiedActivities = 0;
    activitiesByTypeRaw.forEach((item) => {
      if (item._id) {
        verifiedActivitiesByType[item._id] = item.count;
        pointsFromVerifiedActivities += item.totalPoints || 0;
      }
    });

    // 4. Campus-wide EcoPoints pool — students only to avoid inflating with admin/faculty test accounts
    const userPointsAgg = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: null,
          totalEcoPoints: { $sum: '$ecoPoints' },
          totalStudents: { $sum: 1 },
        },
      },
    ]);
    const totalCampusEcoPoints = userPointsAgg[0]?.totalEcoPoints || 0;
    const totalRegisteredStudents = userPointsAgg[0]?.totalStudents || 0;

    // 5. Environmental impact & CO2 reduction from verified completed challenges
    const challengeImpactAgg = await Challenge.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          totalCO2AvoidedKg: { $sum: '$estimatedCO2Reduction' },
          completedChallenges: { $sum: 1 },
        },
      },
    ]);
    const co2AvoidedFromChallengesKg = Number(
      (challengeImpactAgg[0]?.totalCO2AvoidedKg || 0).toFixed(2)
    );
    const totalCompletedChallenges =
      challengeImpactAgg[0]?.completedChallenges || 0;

    // 6. Average weekly carbon footprint across calculated students
    const carbonLogAgg = await CarbonLog.aggregate([
      { $sort: { calculatedAt: -1 } },
      {
        $group: {
          _id: '$studentId',
          latestWeeklyKgCO2e: { $first: '$totalWeeklyKgCO2e' },
        },
      },
      {
        $group: {
          _id: null,
          avgWeeklyFootprintKg: { $avg: '$latestWeeklyKgCO2e' },
          studentsWithCalculation: { $sum: 1 },
        },
      },
    ]);
    const avgWeeklyFootprintKgCO2e = carbonLogAgg[0]?.avgWeeklyFootprintKg
      ? Number(carbonLogAgg[0].avgWeeklyFootprintKg.toFixed(2))
      : null;
    const studentsWithFootprint =
      carbonLogAgg[0]?.studentsWithCalculation || 0;

    return res.json({
      success: true,
      data: {
        initiatives: {
          total: totalInitiatives,
          byStatus: initiativesByStatus,
          byCategory: initiativesByCategory,
        },
        participation: {
          totalParticipations,
          uniqueParticipants,
        },
        activities: {
          totalRecorded: totalActivities,
          totalVerified: totalVerifiedActivities,
          verifiedByType: verifiedActivitiesByType,
          pointsFromVerifiedActivities,
        },
        ecoPoints: {
          totalCampusPool: totalCampusEcoPoints,
          totalRegisteredStudents,
        },
        environmentalImpact: {
          co2AvoidedFromChallengesKg,
          totalCompletedChallenges,
          avgWeeklyFootprintKgCO2e,
          studentsWithFootprint,
          methodologyNote:
            'CO2 reductions are tracked strictly from completed daily challenges and deterministic carbon calculations. No unverified campus-wide extrapolations are applied.',
        },
        privacy: {
          isAggregated: true,
          containsPII: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
