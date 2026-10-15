import API from './authApi';

/**
 * Fetch registered campus smart dustbins
 */
export const getCampusBins = async () => {
  const response = await API.get('/smart-bin/list');
  return response.data;
};

/**
 * Trigger waste detection event from Smart Dustbin sensor
 * @param {string} binId
 * @param {string} wasteType - 'plastic' | 'paper' | 'organic' | 'metal' | 'general'
 */
export const detectWaste = async (binId, wasteType = 'plastic') => {
  const response = await API.post('/smart-bin/detect-waste', {
    binId,
    wasteType,
  });
  return response.data;
};

/**
 * Check live status of an active deposit QR code
 * @param {string} identifier - token or depositCode
 */
export const getDepositStatus = async (identifier) => {
  const response = await API.get(`/smart-bin/status/${identifier}`);
  return response.data;
};

/**
 * Claim EcoPoints for a scanned waste deposit
 * @param {Object} payload - { token?: string, code?: string }
 */
export const claimWastePoints = async (payload) => {
  const response = await API.post('/smart-bin/claim', payload);
  return response.data;
};

/**
 * Fetch live smart bin telemetry aggregated by campus building
 */
export const getBuildingTelemetry = async () => {
  const response = await API.get('/smart-bin/building-telemetry');
  return response.data;
};

