import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const badgeSchema = new mongoose.Schema(
  {
    badgeId: { type: String, required: true },
    title: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
    icon: { type: String, default: 'Award' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    collegeId: {
      type: String,
      required: [true, 'College ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Do not return passwordHash in queries by default
    },
    department: {
      type: String,
      default: 'General Engineering',
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },
    ecoPoints: {
      type: Number,
      default: 0,
      min: [0, 'Eco-points cannot be negative'],
    },
    badges: {
      type: [badgeSchema],
      default: [
        {
          badgeId: 'eco_starter',
          title: 'Eco Pioneer',
          earnedAt: new Date(),
          icon: 'Sparkles',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Return safe user representation
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

// Safe JSON transform fallback
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
