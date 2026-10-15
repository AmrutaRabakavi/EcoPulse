import CarbonLog from '../models/CarbonLog.js';
import { calculateFootprint } from '../services/carbonCalculatorService.js';

/**
 * @desc    Submit questionnaire, calculate emissions, and persist log
 * @route   POST /api/carbon-footprint/calculate
 * @access  Private (JWT)
 */
export const calculateAndSaveFootprint = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const inputs = req.body;

    // 1. Calculate deterministic footprint
    const calcResult = calculateFootprint(inputs);

    // 2. Query previous log for historical comparison
    const previousLog = await CarbonLog.findOne({ studentId }).sort({
      calculatedAt: -1,
    });

    let comparison = null;
    if (previousLog) {
      const prevTotal = previousLog.totalWeeklyKgCO2e;
      const diff = Number((calcResult.totalWeeklyKgCO2e - prevTotal).toFixed(2));
      const pct =
        prevTotal > 0
          ? Number(((diff / prevTotal) * 100).toFixed(1))
          : 0;

      comparison = {
        previousFootprint: prevTotal,
        previousDate: previousLog.calculatedAt,
        difference: diff,
        percentageChange: pct,
        isReduction: diff < 0,
      };
    }

    // 3. Persist new calculation record
    const newLog = await CarbonLog.create({
      studentId,
      totalWeeklyKgCO2e: calcResult.totalWeeklyKgCO2e,
      annualEstimateKgCO2e: calcResult.annualEstimateKgCO2e,
      breakdown: calcResult.breakdown,
      percentages: calcResult.percentages,
      highestImpactCategory: calcResult.highestImpactCategory,
      inputSnapshot: inputs,
      methodologyVersion: calcResult.methodologyVersion,
      calculatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Estimated carbon footprint calculated successfully',
      data: {
        id: newLog._id,
        totalWeeklyKgCO2e: calcResult.totalWeeklyKgCO2e,
        annualEstimateKgCO2e: calcResult.annualEstimateKgCO2e,
        breakdown: calcResult.breakdown,
        percentages: calcResult.percentages,
        highestImpactCategory: calcResult.highestImpactCategory,
        suggestions: calcResult.suggestions,
        comparison,
        inputSnapshot: inputs,
        calculatedAt: newLog.calculatedAt,
        methodologyVersion: calcResult.methodologyVersion,
        disclaimer: calcResult.disclaimer,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get the latest carbon footprint calculation for the logged-in student
 * @route   GET /api/carbon-footprint/current
 * @access  Private (JWT)
 */
export const getCurrentFootprint = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const latest = await CarbonLog.findOne({ studentId }).sort({
      calculatedAt: -1,
    });

    if (!latest) {
      return res.json({
        success: true,
        data: null,
        message: 'No carbon footprint calculated yet',
      });
    }

    // Check if there is a previous log to provide comparison
    const previous = await CarbonLog.findOne({
      studentId,
      _id: { $ne: latest._id },
    }).sort({ calculatedAt: -1 });

    let comparison = null;
    if (previous) {
      const diff = Number((latest.totalWeeklyKgCO2e - previous.totalWeeklyKgCO2e).toFixed(2));
      const pct =
        previous.totalWeeklyKgCO2e > 0
          ? Number(((diff / previous.totalWeeklyKgCO2e) * 100).toFixed(1))
          : 0;

      comparison = {
        previousFootprint: previous.totalWeeklyKgCO2e,
        previousDate: previous.calculatedAt,
        difference: diff,
        percentageChange: pct,
        isReduction: diff < 0,
      };
    }

    return res.json({
      success: true,
      data: {
        id: latest._id,
        totalWeeklyKgCO2e: latest.totalWeeklyKgCO2e,
        annualEstimateKgCO2e: latest.annualEstimateKgCO2e,
        breakdown: latest.breakdown,
        percentages: latest.percentages,
        highestImpactCategory: latest.highestImpactCategory,
        inputSnapshot: latest.inputSnapshot,
        comparison,
        calculatedAt: latest.calculatedAt,
        methodologyVersion: latest.methodologyVersion,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get complete historical calculation records for logged-in student
 * @route   GET /api/carbon-footprint/history
 * @access  Private (JWT)
 */
export const getFootprintHistory = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const history = await CarbonLog.find({ studentId })
      .sort({ calculatedAt: -1 })
      .select('-__v');

    // Attach historical delta for each entry relative to the one before it
    const enhancedHistory = history.map((item, idx) => {
      const nextOlder = history[idx + 1];
      let delta = null;
      let percentChange = null;

      if (nextOlder && nextOlder.totalWeeklyKgCO2e > 0) {
        delta = Number((item.totalWeeklyKgCO2e - nextOlder.totalWeeklyKgCO2e).toFixed(2));
        percentChange = Number(
          (((item.totalWeeklyKgCO2e - nextOlder.totalWeeklyKgCO2e) / nextOlder.totalWeeklyKgCO2e) * 100).toFixed(1)
        );
      }

      return {
        id: item._id,
        totalWeeklyKgCO2e: item.totalWeeklyKgCO2e,
        annualEstimateKgCO2e: item.annualEstimateKgCO2e,
        breakdown: item.breakdown,
        percentages: item.percentages,
        highestImpactCategory: item.highestImpactCategory,
        delta,
        percentChange,
        calculatedAt: item.calculatedAt,
      };
    });

    return res.json({
      success: true,
      count: enhancedHistory.length,
      history: enhancedHistory,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single calculation record by ID (with ownership check)
 * @route   GET /api/carbon-footprint/:id
 * @access  Private (JWT)
 */
export const getFootprintById = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { id } = req.params;

    const log = await CarbonLog.findById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Carbon footprint record not found',
      });
    }

    // Ensure strict ownership
    if (log.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this carbon record',
      });
    }

    return res.json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
};
