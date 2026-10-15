import mongoose from 'mongoose';

const wasteDepositSchema = new mongoose.Schema(
  {
    depositCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    binId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    binName: {
      type: String,
      required: true,
      trim: true,
      default: 'Campus Smart Dustbin',
    },
    buildingId: {
      type: String,
      enum: ['it_block', 'main_building', 'library', 'ground', 'near_temple', 'general'],
      default: 'it_block',
      index: true,
    },
    buildingName: {
      type: String,
      default: 'IT Block',
    },
    wasteType: {
      type: String,
      enum: ['plastic', 'paper', 'organic', 'metal', 'general'],
      default: 'plastic',
    },
    points: {
      type: Number,
      required: true,
      default: 25,
      min: 1,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CLAIMED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if token is still valid for claiming
wasteDepositSchema.methods.isValidForClaim = function () {
  return this.status === 'PENDING' && new Date() < this.expiresAt;
};

const WasteDeposit = mongoose.model('WasteDeposit', wasteDepositSchema);

export default WasteDeposit;
