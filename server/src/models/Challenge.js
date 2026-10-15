import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        'TRANSPORT',
        'ENERGY',
        'WATER',
        'FOOD',
        'WASTE',
        'COMMUNITY',
        'TREES',
        'CAMPUS',
      ],
      index: true,
    },

    difficulty: {
      type: String,
      required: true,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'EASY',
    },

    points: {
      type: Number,
      required: true,
      min: 5,
      max: 50,
    },

    estimatedCO2Reduction: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
      default: 10,
    },

    status: {
      type: String,
      enum: ['AVAILABLE', 'COMPLETED', 'EXPIRED'],
      default: 'AVAILABLE',
      index: true,
    },

    generatedBy: {
      type: String,
      enum: ['AI', 'FALLBACK'],
      default: 'FALLBACK',
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate daily challenges for the same student.
// Multiple different challenges can still exist on different dates.
challengeSchema.index(
  { studentId: 1, date: 1 },
  { unique: true }
);

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;