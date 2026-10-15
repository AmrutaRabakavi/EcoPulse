const CHALLENGE_TEMPLATES = [
  {
    category: 'TRANSPORT',
    difficulty: 'EASY',
    title: 'Choose a greener commute',
    description:
      'Walk, cycle, carpool, or use public transport for one campus trip today.',
    points: 15,
    estimatedCO2Reduction: 1.2,
    duration: 20,
  },
  {
    category: 'ENERGY',
    difficulty: 'EASY',
    title: 'Power down before you leave',
    description:
      'Switch off lights, fans, and other non-essential electrical devices before leaving your room or classroom.',
    points: 10,
    estimatedCO2Reduction: 0.5,
    duration: 10,
  },
  {
    category: 'WATER',
    difficulty: 'EASY',
    title: 'Save water today',
    description:
      'Take a shorter shower or avoid unnecessary water use during washing and cleaning.',
    points: 10,
    estimatedCO2Reduction: 0.3,
    duration: 10,
  },
  {
    category: 'FOOD',
    difficulty: 'MEDIUM',
    title: 'Choose a lower-carbon meal',
    description:
      'Choose a meal with more plant-based ingredients and avoid unnecessary food waste today.',
    points: 20,
    estimatedCO2Reduction: 1.5,
    duration: 20,
  },
  {
    category: 'WASTE',
    difficulty: 'EASY',
    title: 'Sort your waste correctly',
    description:
      'Separate recyclable, compostable, and general waste correctly at your campus disposal point.',
    points: 15,
    estimatedCO2Reduction: 0.8,
    duration: 15,
  },
  {
    category: 'COMMUNITY',
    difficulty: 'MEDIUM',
    title: 'Help a classmate go green',
    description:
      'Share one practical sustainability tip with a classmate and encourage them to try it today.',
    points: 15,
    estimatedCO2Reduction: 0.4,
    duration: 15,
  },
  {
    category: 'TREES',
    difficulty: 'MEDIUM',
    title: 'Care for campus greenery',
    description:
      'Spend a few minutes caring for an existing campus plant, garden, or green space.',
    points: 20,
    estimatedCO2Reduction: 0.6,
    duration: 20,
  },
  {
    category: 'CAMPUS',
    difficulty: 'EASY',
    title: 'Find one sustainability improvement',
    description:
      'Identify one practical sustainability improvement that could be made on your campus.',
    points: 10,
    estimatedCO2Reduction: 0.2,
    duration: 15,
  },
];

function normalizeCategory(category) {
  if (!category) return null;

  const normalized = String(category).trim().toUpperCase();

  const aliases = {
    TRANSPORTATION: 'TRANSPORT',
    TRANSIT: 'TRANSPORT',
    ELECTRICITY: 'ENERGY',
    FOOD: 'FOOD',
    DIET: 'FOOD',
    WASTE: 'WASTE',
    WATER: 'WATER',
    COMMUNITY: 'COMMUNITY',
    TREES: 'TREES',
    CAMPUS: 'CAMPUS',
  };

  return aliases[normalized] || normalized;
}

function getCategoryTemplate(category) {
  const normalizedCategory = normalizeCategory(category);

  if (!normalizedCategory) return null;

  return (
    CHALLENGE_TEMPLATES.find(
      (template) => template.category === normalizedCategory
    ) || null
  );
}

function generateFallbackChallenge({
  highestImpactCategory = null,
  recentCategories = [],
}) {
  const preferredCategory = normalizeCategory(highestImpactCategory);

  // First preference: address the student's highest-impact carbon category.
  if (preferredCategory) {
    const preferredTemplate = getCategoryTemplate(preferredCategory);

    if (preferredTemplate) {
      return {
        ...preferredTemplate,
        generatedBy: 'FALLBACK',
      };
    }
  }

  // Second preference: choose a category the student has not recently used.
  const recent = new Set(
    recentCategories
      .map(normalizeCategory)
      .filter(Boolean)
  );

  const unusedTemplate = CHALLENGE_TEMPLATES.find(
    (template) => !recent.has(template.category)
  );

  if (unusedTemplate) {
    return {
      ...unusedTemplate,
      generatedBy: 'FALLBACK',
    };
  }

  // Final deterministic fallback.
  const template =
    CHALLENGE_TEMPLATES[
      new Date().getDate() % CHALLENGE_TEMPLATES.length
    ];

  return {
    ...template,
    generatedBy: 'FALLBACK',
  };
}

function validateChallenge(challenge) {
  if (!challenge || typeof challenge !== 'object') {
    return false;
  }

  const validCategories = [
    'TRANSPORT',
    'ENERGY',
    'WATER',
    'FOOD',
    'WASTE',
    'COMMUNITY',
    'TREES',
    'CAMPUS',
  ];

  const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];

  if (
    typeof challenge.title !== 'string' ||
    challenge.title.trim().length < 5
  ) {
    return false;
  }

  if (
    typeof challenge.description !== 'string' ||
    challenge.description.trim().length < 5
  ) {
    return false;
  }

  if (!validCategories.includes(challenge.category)) {
    return false;
  }

  if (!validDifficulties.includes(challenge.difficulty)) {
    return false;
  }

  if (
    typeof challenge.points !== 'number' ||
    challenge.points < 5 ||
    challenge.points > 50
  ) {
    return false;
  }

  if (
    typeof challenge.estimatedCO2Reduction !== 'number' ||
    challenge.estimatedCO2Reduction < 0
  ) {
    return false;
  }

  if (
    typeof challenge.duration !== 'number' ||
    challenge.duration < 1 ||
    challenge.duration > 1440
  ) {
    return false;
  }

  return true;
}

export {
  CHALLENGE_TEMPLATES,
  generateFallbackChallenge,
  validateChallenge,
};