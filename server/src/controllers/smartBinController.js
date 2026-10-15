import crypto from 'crypto';
import WasteDeposit from '../models/WasteDeposit.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const CAMPUS_BINS = [
  {
    binId: 'BIN-IT-01',
    buildingId: 'it_block',
    buildingName: 'IT Block',
    name: 'IT Block Smart Bin',
    location: 'IT Block, Main Entrance Foyer',
    supportedWaste: ['plastic', 'paper', 'metal', 'general'],
    baseFillPercent: 28,
    binCount: 3,
  },
  {
    binId: 'BIN-MAIN-02',
    buildingId: 'main_building',
    buildingName: 'Main Building',
    name: 'Main Building Smart Bin',
    location: 'Main Building, Administrative Foyer',
    supportedWaste: ['plastic', 'paper', 'metal', 'general'],
    baseFillPercent: 35,
    binCount: 4,
  },
  {
    binId: 'BIN-LIB-01',
    buildingId: 'library',
    buildingName: 'Library',
    name: 'Library Eco Hub',
    location: 'Central Library, Reading Hall Lobby',
    supportedWaste: ['paper', 'plastic', 'general'],
    baseFillPercent: 42,
    binCount: 5,
  },
  {
    binId: 'BIN-GRD-04',
    buildingId: 'ground',
    buildingName: 'College Ground',
    name: 'College Ground Smart Recycler',
    location: 'College Ground, Sports Pavilion',
    supportedWaste: ['plastic', 'general'],
    baseFillPercent: 19,
    binCount: 2,
  },
  {
    binId: 'BIN-TMP-05',
    buildingId: 'near_temple',
    buildingName: 'Near Temple',
    name: 'Near Temple Clean Station',
    location: 'Near Temple, Heritage Pathway',
    supportedWaste: ['organic', 'paper', 'general'],
    baseFillPercent: 15,
    binCount: 2,
  },
];

const WASTE_POINTS_MAP = {
  plastic: 25,
  metal: 30,
  paper: 20,
  organic: 15,
  general: 10,
};

const EXPIRATION_SECONDS = 60;

/**
 * @desc    Get list of registered campus smart dustbins
 * @route   GET /api/smart-bin/list
 * @access  Public
 */
export async function getCampusBins(req, res) {
  return res.status(200).json({
    success: true,
    bins: CAMPUS_BINS,
  });
}

/**
 * @desc    Simulate or ingest waste detection from Smart Dustbin sensor
 *          Generates a single-use dynamic QR code expiring in 60s
 * @route   POST /api/smart-bin/detect-waste
 * @access  Public (called by IoT Bin hardware / kiosk)
 */
export async function detectWaste(req, res) {
  try {
    const { binId, wasteType = 'plastic' } = req.body || {};

    const matchedBin = CAMPUS_BINS.find((b) => b.binId === binId) || {
      binId: binId || 'BIN-IT-01',
      name: 'Campus Smart Dustbin',
      buildingId: 'it_block',
      buildingName: 'IT Block',
    };

    const validWasteType = [
      'plastic',
      'paper',
      'organic',
      'metal',
      'general',
    ].includes(wasteType)
      ? wasteType
      : 'plastic';

    const points = WASTE_POINTS_MAP[validWasteType] || 25;
    const rawCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const depositCode = `ECO-${rawCode}`;
    const token = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EXPIRATION_SECONDS * 1000);

    const deposit = await WasteDeposit.create({
      depositCode,
      token,
      binId: matchedBin.binId,
      binName: matchedBin.name,
      buildingId: matchedBin.buildingId || 'it_block',
      buildingName: matchedBin.buildingName || matchedBin.name,
      wasteType: validWasteType,
      points,
      status: 'PENDING',
      expiresAt,
    });

    const qrPayload = JSON.stringify({
      app: 'ECOPULSE',
      action: 'CLAIM_WASTE_POINTS',
      code: depositCode,
      token,
      points,
      binName: matchedBin.name,
      buildingId: matchedBin.buildingId || 'it_block',
      buildingName: matchedBin.buildingName || matchedBin.name,
    });

    const directClaimUrl = `/qr-scan?code=${depositCode}&token=${token}`;

    return res.status(201).json({
      success: true,
      message: 'Waste detected! Scan QR code to claim points.',
      deposit: {
        id: deposit._id,
        depositCode,
        token,
        binId: matchedBin.binId,
        binName: matchedBin.name,
        buildingId: matchedBin.buildingId || 'it_block',
        buildingName: matchedBin.buildingName || matchedBin.name,
        wasteType: validWasteType,
        points,
        expiresAt,
        durationSeconds: EXPIRATION_SECONDS,
        qrPayload,
        directClaimUrl,
      },
    });
  } catch (err) {
    console.error('Failed to detect waste:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record waste deposit event.',
    });
  }
}

/**
 * @desc    Check status of a generated QR deposit (for Kiosk live feedback)
 * @route   GET /api/smart-bin/status/:identifier
 * @access  Public
 */
export async function getDepositStatus(req, res) {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Identifier is required.',
      });
    }

    const deposit = await WasteDeposit.findOne({
      $or: [{ token: identifier }, { depositCode: identifier.toUpperCase() }],
    }).populate('claimedBy', 'fullName collegeId');

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit record not found.',
      });
    }

    const now = new Date();
    let effectiveStatus = deposit.status;

    if (effectiveStatus === 'PENDING' && now > deposit.expiresAt) {
      effectiveStatus = 'EXPIRED';
      deposit.status = 'EXPIRED';
      await deposit.save();
    }

    const secondsRemaining = Math.max(
      0,
      Math.round((deposit.expiresAt.getTime() - now.getTime()) / 1000)
    );

    return res.status(200).json({
      success: true,
      status: effectiveStatus,
      points: deposit.points,
      wasteType: deposit.wasteType,
      binName: deposit.binName,
      secondsRemaining,
      claimedBy: deposit.claimedBy
        ? {
            fullName: deposit.claimedBy.fullName,
            collegeId: deposit.claimedBy.collegeId,
          }
        : null,
      claimedAt: deposit.claimedAt,
    });
  } catch (err) {
    console.error('Failed to get deposit status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to check deposit status.',
    });
  }
}

/**
 * @desc    Claim points for a scanned waste QR code or manual code
 * @route   POST /api/smart-bin/claim
 * @access  Private (Authenticated student)
 */
export async function claimWastePoints(req, res) {
  try {
    const { token, code } = req.body || {};

    if (!token && !code) {
      return res.status(400).json({
        success: false,
        message: 'QR token or deposit code is required.',
      });
    }

    const query = token
      ? { token: token.trim() }
      : { depositCode: code.trim().toUpperCase() };

    const now = new Date();

    // Concurrency Lock: Atomically claim the deposit ONLY if it is currently PENDING
    // This strictly prevents race conditions if 2 students submit the same code at the exact same millisecond
    const deposit = await WasteDeposit.findOneAndUpdate(
      {
        ...query,
        status: 'PENDING',
        expiresAt: { $gt: now },
      },
      {
        $set: {
          status: 'CLAIMED',
          claimedBy: req.user._id,
          claimedAt: now,
        },
      },
      { new: true }
    );

    // If atomic update returned null, find out why to provide a friendly, exact error message
    if (!deposit) {
      const existing = await WasteDeposit.findOne(query);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Invalid code. No corresponding waste deposit found.',
        });
      }

      if (existing.status === 'CLAIMED') {
        return res.status(400).json({
          success: false,
          message:
            'This code has already been claimed! Each waste deposit can only be claimed once.',
        });
      }

      if (existing.status === 'EXPIRED' || now > existing.expiresAt) {
        return res.status(400).json({
          success: false,
          message:
            'This code has expired! Points must be claimed within 60 seconds of disposal.',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Unable to claim this deposit code.',
      });
    }

    // Increment user EcoPoints
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { ecoPoints: deposit.points } },
      { new: true }
    );

    // Record verified Activity log
    const activity = await Activity.create({
      studentId: req.user._id,
      activityType: 'recycling',
      title: `Smart Bin: ${deposit.wasteType.toUpperCase()} Disposed`,
      description: `Disposed of ${deposit.wasteType} waste responsibly at ${deposit.binName}. Verified via Smart Dustbin sensor.`,
      points: deposit.points,
      verificationMethod: 'IOT',
      verified: true,
      metadata: {
        binId: deposit.binId,
        depositId: deposit._id,
        wasteType: deposit.wasteType,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Awesome! You earned +${deposit.points} EcoPoints!`,
      pointsAwarded: deposit.points,
      totalEcoPoints: updatedUser?.ecoPoints ?? deposit.points,
      wasteType: deposit.wasteType,
      binName: deposit.binName,
      activityId: activity._id,
    });
  } catch (err) {
    console.error('Failed to claim waste points:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to claim waste deposit points.',
    });
  }
}

/**
 * @desc    Get live smart bin telemetry aggregated per campus building
 * @route   GET /api/smart-bin/building-telemetry
 * @access  Public
 */
export async function getBuildingTelemetry(req, res) {
  try {
    const telemetry = {};

    for (const bin of CAMPUS_BINS) {
      // Find deposits corresponding to this building
      const depositsCount = await WasteDeposit.countDocuments({
        buildingId: bin.buildingId,
      });

      const recentDeposit = await WasteDeposit.findOne({
        buildingId: bin.buildingId,
      }).sort({ createdAt: -1 });

      // Dynamic fill calculation: baseFillPercent + (deposits * 2) capped at 95%
      const currentFill = Math.min(
        95,
        bin.baseFillPercent + Math.min(50, depositsCount * 2)
      );

      telemetry[bin.buildingId] = {
        buildingId: bin.buildingId,
        buildingName: bin.buildingName,
        binId: bin.binId,
        binName: bin.name,
        binCount: bin.binCount || 3,
        fillLevel: currentFill,
        totalDeposits: depositsCount,
        recentWasteType: recentDeposit ? recentDeposit.wasteType : null,
        binStatus: `${bin.binCount || 3} Smart Bins • ${currentFill}% Fill`,
      };
    }

    return res.status(200).json({
      success: true,
      telemetry,
    });
  } catch (err) {
    console.error('Failed to get building telemetry:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate building telemetry.',
    });
  }
}

