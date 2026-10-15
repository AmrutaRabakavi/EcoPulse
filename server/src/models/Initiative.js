import mongoose from 'mongoose';

const initiativeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Initiative title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    description: {
      type: String,
      required: [true, 'Initiative description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'TRANSPORT',
          'ENERGY',
          'WATER',
          'FOOD',
          'WASTE',
          'COMMUNITY',
          'TREES',
          'CAMPUS',
        ],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          if (!this.startDate || !value) return true;
          return new Date(value).getTime() >= new Date(this.startDate).getTime();
        },
        message: 'End date cannot be earlier than start date',
      },
    },

    registrationDeadline: {
      type: Date,
      default: null, // If null, defaults to startDate
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
      index: true,
    },

    points: {
      type: Number,
      default: 10,
      min: [0, 'Points cannot be negative'],
      max: [100, 'Points cannot exceed 100'],
    },

    status: {
      type: String,
      enum: {
        values: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        message: '{VALUE} is not a valid status',
      },
      default: 'UPCOMING',
      index: true,
    },

    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
      validate: {
        validator: function (val) {
          if (!Array.isArray(val)) return true;
          const ids = val.map((id) => (id ? id.toString() : ''));
          return new Set(ids).size === ids.length;
        },
        message: 'Duplicate participant detected in participants array',
      },
    },

    verifiedParticipants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to enforce endDate >= startDate on document validation
initiativeSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate) {
    if (new Date(this.endDate).getTime() < new Date(this.startDate).getTime()) {
      this.invalidate('endDate', 'End date cannot be earlier than start date');
    }
  }
  next();
});

// Helper instance method to prevent duplicate participants at application level
initiativeSchema.methods.addParticipant = function (userId) {
  const idStr = userId.toString();
  const alreadyJoined = this.participants.some(
    (p) => p && p.toString() === idStr
  );
  if (!alreadyJoined) {
    this.participants.push(userId);
    return true;
  }
  return false;
};

// Helper instance method to remove participant
initiativeSchema.methods.removeParticipant = function (userId) {
  const idStr = userId.toString();
  const initialLength = this.participants.length;
  this.participants = this.participants.filter(
    (p) => p && p.toString() !== idStr
  );
  return this.participants.length < initialLength;
};

// Helper instance method to check if user is a participant
initiativeSchema.methods.hasParticipant = function (userId) {
  const idStr = userId.toString();
  return this.participants.some((p) => p && p.toString() === idStr);
};

const Initiative = mongoose.model('Initiative', initiativeSchema);

export default Initiative;
