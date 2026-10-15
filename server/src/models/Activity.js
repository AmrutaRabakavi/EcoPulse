import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'recycling',
        'transport',
        'energy',
        'water',
        'conservation',
        'food',
        'other',
      ],
      default: 'other',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    points: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    verificationMethod: {
      type: String,
      enum: ['QR', 'MANUAL', 'IOT', 'ADMIN', 'SEED'],
      default: 'MANUAL',
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
