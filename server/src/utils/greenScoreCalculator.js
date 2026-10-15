/**
 * Green Score Engine (0 - 100)
 * 
 * Formula:
 * - Verified Activities: 15 points per verified activity (capped at 60)
 * - Eco-Points: 1 point per 10 eco-points (capped at 30)
 * - Activity Diversity Bonus: 2.5 points per unique category engaged in (capped at 10)
 * 
 * Total = min(100, VerifiedContribution + PointsContribution + DiversityBonus)
 */
export const calculateGreenScore = (verifiedActivities = [], ecoPoints = 0) => {
  const verifiedCount = verifiedActivities.length;

  // 1. Contribution from verified activities (max 60)
  const verifiedContribution = Math.min(60, verifiedCount * 15);

  // 2. Contribution from accumulated eco-points (max 30)
  const pointsContribution = Math.min(30, Math.floor((ecoPoints || 0) / 10));

  // 3. Contribution from diversity of green activities (max 10)
  const uniqueCategories = new Set(
    verifiedActivities.map((act) => act.activityType)
  ).size;
  const diversityBonus = Math.min(10, Math.round(uniqueCategories * 2.5));

  // Base score ensures new signups start at minimum baseline
  const rawScore = verifiedContribution + pointsContribution + diversityBonus;
  const score = Math.min(100, Math.max(0, rawScore));

  let tier = 'Seedling';
  if (score >= 80) tier = 'Planet Guardian (Platinum)';
  else if (score >= 60) tier = 'Eco Champion (Gold)';
  else if (score >= 35) tier = 'Green Advocate (Silver)';
  else if (score >= 15) tier = 'Eco Pioneer (Bronze)';

  return {
    score,
    tier,
    breakdown: {
      verifiedActivitiesContribution: verifiedContribution,
      pointsContribution,
      diversityBonus,
      uniqueCategoriesCount: uniqueCategories,
    },
    formula: 'min(100, (verifiedActivities * 15) + floor(ecoPoints / 10) + (uniqueCategories * 2.5))',
  };
};
