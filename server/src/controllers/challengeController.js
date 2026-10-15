import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import CarbonLog from '../models/CarbonLog.js';
import {
  generateFallbackChallenge,
  validateChallenge,
} from '../services/challengeGeneratorService.js';

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function getHighestImpactCategory(carbonLog) {
  if (!carbonLog) return null;

  // Phase 4 stores carbon values inside `breakdown`.
  const breakdown = carbonLog.breakdown || {};

  const values = {
    TRANSPORT: Number(breakdown.transport || 0),
    ENERGY: Number(breakdown.electricity || 0),
    WATER: Number(breakdown.water || 0),
    FOOD: Number(breakdown.food || 0),
    WASTE: Number(breakdown.waste || 0),
  };

  const entries = Object.entries(values);

  if (!entries.length) return null;

  entries.sort((a, b) => b[1] - a[1]);

  return entries[0][1] > 0 ? entries[0][0] : null;
}

function mapChallengeCategoryToActivityType(category) {
  const mapping = {
    TRANSPORT: 'transport',
    ENERGY: 'energy',
    WATER: 'water',
    FOOD: 'food',
    WASTE: 'recycling',
    COMMUNITY: 'other',
    TREES: 'conservation',
    CAMPUS: 'other',
  };

  return mapping[category] || 'other';
}

async function getStudentContext(studentId) {
  const [user, recentActivities, carbonLog] = await Promise.all([
    User.findById(studentId).lean(),

    Activity.find({
      studentId,
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(),

    CarbonLog.findOne({
      studentId,
    })
      .sort({ calculatedAt: -1, createdAt: -1 })
      .lean(),
  ]);

  if (!user) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const recentCategories = recentActivities
    .map((activity) => {
      const type = String(activity.activityType || '').toUpperCase();

      const aliases = {
        TRANSPORT: 'TRANSPORT',
        ENERGY: 'ENERGY',
        WATER: 'WATER',
        FOOD: 'FOOD',
        RECYCLING: 'WASTE',
        WASTE: 'WASTE',
        CONSERVATION: 'CAMPUS',
        OTHER: 'CAMPUS',
      };

      return aliases[type] || null;
    })
    .filter(Boolean);

  return {
    user,
    recentActivities,
    carbonLog,
    highestImpactCategory:
      getHighestImpactCategory(carbonLog) ||
      (carbonLog?.highestImpactCategory
        ? String(carbonLog.highestImpactCategory).toUpperCase()
        : null),
    recentCategories,
  };
}

export async function getTodayChallenge(req, res, next) {
  try {
    const studentId = req.user._id;

    let challenge = await Challenge.findOne({
      studentId,
      date: {
        $gte: startOfToday(),
        $lte: endOfToday(),
      },
    }).lean();

    if (!challenge) {
      const context = await getStudentContext(studentId);

      const generated = generateFallbackChallenge({
        highestImpactCategory: context.highestImpactCategory,
        recentCategories: context.recentCategories,
      });

      if (!validateChallenge(generated)) {
        return res.status(500).json({
          success: false,
          message: 'Generated challenge failed validation',
        });
      }

      challenge = await Challenge.create({
        studentId,
        ...generated,
        date: startOfToday(),
      });

      challenge = challenge.toObject();
    }

    return res.json({
      success: true,
      challenge,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateChallenge(req, res, next) {
  try {
    const studentId = req.user._id;

    const existing = await Challenge.findOne({
      studentId,
      date: {
        $gte: startOfToday(),
        $lte: endOfToday(),
      },
    }).lean();

    if (existing) {
      return res.json({
        success: true,
        challenge: existing,
        alreadyExists: true,
      });
    }

    const context = await getStudentContext(studentId);

    const generated = generateFallbackChallenge({
      highestImpactCategory: context.highestImpactCategory,
      recentCategories: context.recentCategories,
    });

    if (!validateChallenge(generated)) {
      return res.status(500).json({
        success: false,
        message: 'Generated challenge failed validation',
      });
    }

    const challenge = await Challenge.create({
      studentId,
      ...generated,
      date: startOfToday(),
    });

    return res.status(201).json({
      success: true,
      challenge,
      alreadyExists: false,
    });
  } catch (error) {
    next(error);
  }
}

export async function getChallengeHistory(req, res, next) {
  try {
    const challenges = await Challenge.find({
      studentId: req.user._id,
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(30)
      .lean();

    return res.json({
      success: true,
      challenges,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeChallenge(req, res, next) {
  try {
    const studentId = req.user._id;
    const { id } = req.params;

    const challenge = await Challenge.findOne({
      _id: id,
      studentId,
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    if (challenge.status === 'COMPLETED') {
      return res.status(409).json({
        success: false,
        message: 'Challenge has already been completed',
      });
    }

    if (challenge.status === 'EXPIRED') {
      return res.status(400).json({
        success: false,
        message: 'Challenge has expired',
      });
    }

    // Mark the challenge complete first.
    // This prevents a second completion from awarding points again.
    challenge.status = 'COMPLETED';
    challenge.completedAt = new Date();

    await challenge.save();

    const activity = await Activity.create({
      studentId,
      activityType: mapChallengeCategoryToActivityType(
        challenge.category
      ),
      title: challenge.title,
      description: challenge.description,
      points: challenge.points,
      verificationMethod: 'MANUAL',
      verified: false,
      timestamp: new Date(),
      metadata: {
        source: 'CHALLENGE',
        challengeId: challenge._id,
        challengeCategory: challenge.category,
        estimatedCO2Reduction:
          challenge.estimatedCO2Reduction,
      },
    });

    await User.findByIdAndUpdate(studentId, {
      $inc: {
        ecoPoints: challenge.points,
      },
    });

    return res.json({
      success: true,
      message: 'Challenge completed successfully',
      challenge,
      activity,
      pointsAwarded: challenge.points,
    });
  } catch (error) {
    next(error);
  }
}