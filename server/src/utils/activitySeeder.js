import Activity from '../models/Activity.js';
import User from '../models/User.js';

export const seedInitialActivitiesIfEmpty = async (studentId) => {
  const existingCount = await Activity.countDocuments({ studentId });
  if (existingCount > 0) {
    return;
  }

  const now = new Date();
  const dayAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const initialActivities = [
    {
      studentId,
      activityType: 'conservation',
      title: 'Tree Plantation at Campus Quad',
      description: 'Planted a native sapling during the campus green drive.',
      points: 40,
      verificationMethod: 'ADMIN',
      verified: true,
      timestamp: dayAgo(1),
      metadata: { coordinator: 'EcoClub Campus Drive', treeSpecies: 'Neem' },
    },
    {
      studentId,
      activityType: 'recycling',
      title: 'Plastic Segregation at Canteen Station',
      description: 'Deposited sorted clean plastic bottles in the smart recycling zone.',
      points: 25,
      verificationMethod: 'QR',
      verified: true,
      timestamp: dayAgo(3),
      metadata: { stationCode: 'RECYCLE-CANTEEN-01' },
    },
    {
      studentId,
      activityType: 'transport',
      title: 'Public Bus & Bicycle Commute',
      description: 'Used public metro & campus bicycle rack instead of personal motorized vehicle.',
      points: 20,
      verificationMethod: 'QR',
      verified: true,
      timestamp: dayAgo(5),
      metadata: { stationCode: 'BIKE-RACK-NORTH' },
    },
    {
      studentId,
      activityType: 'water',
      title: 'Refilled Water Bottle at Library Depot',
      description: 'Avoided buying disposable plastic water bottle.',
      points: 15,
      verificationMethod: 'QR',
      verified: true,
      timestamp: dayAgo(6),
      metadata: { stationCode: 'WATER-LIBRARY-01' },
    },
    {
      studentId,
      activityType: 'energy',
      title: 'Dorm Air Conditioner Turned Off (Self-Logged)',
      description: 'Kept AC switched off during peak morning campus hours.',
      points: 15,
      verificationMethod: 'MANUAL',
      verified: false, // Unverified self-report
      timestamp: dayAgo(2),
      metadata: { note: 'Awaiting student council peer-verification' },
    },
  ];

  await Activity.insertMany(initialActivities);

  // Calculate sum of verified seed points
  const verifiedPoints = initialActivities
    .filter((a) => a.verified)
    .reduce((sum, a) => sum + a.points, 0);

  // Update student's ecoPoints (50 baseline bonus + 100 verified activities = 150)
  await User.findByIdAndUpdate(studentId, {
    $inc: { ecoPoints: verifiedPoints },
  });
};
