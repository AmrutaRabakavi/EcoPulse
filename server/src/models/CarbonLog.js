import mongoose from 'mongoose';

const carbonLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    totalWeeklyKgCO2e: {
      type: Number,
      required: true,
      min: 0,
    },
    annualEstimateKgCO2e: {
      type: Number,
      default: 0,
    },
    breakdown: {
      transport: { type: Number, default: 0 },
      electricity: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      waste: { type: Number, default: 0 },
    },
    percentages: {
      transport: { type: Number, default: 0 },
      electricity: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      waste: { type: Number, default: 0 },
    },
    highestImpactCategory: {
      type: String,
      default: 'food',
    },
    inputSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    methodologyVersion: {
      type: String,
      default: 'v1.0-DEFRA-EPA-2026',
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const CarbonLog = mongoose.model('CarbonLog', carbonLogSchema);

export default CarbonLog;
