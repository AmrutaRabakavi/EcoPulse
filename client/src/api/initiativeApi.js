import API from './authApi';

/**
 * Fetch list of campus initiatives with optional category and status filters
 * @param {Object} filters - { category?: string, status?: string }
 */
export const fetchInitiatives = async (filters = {}) => {
  const params = {};
  if (filters.category && filters.category !== 'ALL') {
    params.category = filters.category;
  }
  if (filters.status && filters.status !== 'ALL') {
    params.status = filters.status;
  }

  const response = await API.get('/initiatives', { params });
  return response.data;
};

/**
 * Fetch detailed view of a single initiative by ID
 * @param {string} id
 */
export const fetchInitiativeById = async (id) => {
  const response = await API.get(`/initiatives/${id}`);
  return response.data;
};

/**
 * Join an active campus initiative
 * @param {string} id
 */
export const joinInitiative = async (id) => {
  const response = await API.post(`/initiatives/${id}/join`);
  return response.data;
};

/**
 * Leave a campus initiative
 * @param {string} id
 */
export const leaveInitiative = async (id) => {
  const response = await API.post(`/initiatives/${id}/leave`);
  return response.data;
};

/**
 * Fetch campus-wide sustainability impact metrics
 */
export const fetchCampusImpactMetrics = async () => {
  const response = await API.get('/initiatives/metrics');
  return response.data;
};

/**
 * Create a new campus initiative (admin only)
 * @param {Object} data - { title, description, category, location, startDate, endDate, points?, status? }
 */
export const createInitiative = async (data) => {
  const response = await API.post('/initiatives', data);
  return response.data;
};

/**
 * Update an existing initiative (admin only)
 * @param {string} id
 * @param {Object} data - partial fields to update
 */
export const updateInitiative = async (id, data) => {
  const response = await API.patch(`/initiatives/${id}`, data);
  return response.data;
};

/**
 * Delete an initiative (admin only, blocked if participants exist)
 * @param {string} id
 */
export const deleteInitiative = async (id) => {
  const response = await API.delete(`/initiatives/${id}`);
  return response.data;
};

/**
 * Verify completed initiative and award EcoPoints to enrolled student participants (admin only)
 * @param {string} id
 * @param {Array<string>} studentIds - Optional subset of student IDs to award
 */
export const verifyInitiativeCompletion = async (id, studentIds = []) => {
  const response = await API.post(`/initiatives/${id}/verify`, { studentIds });
  return response.data;
};

