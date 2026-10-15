import API from './authApi';

export const submitCarbonCalculation = async (inputs) => {
  const response = await API.post('/carbon-footprint/calculate', inputs);
  return response.data;
};

export const fetchCurrentFootprint = async () => {
  const response = await API.get('/carbon-footprint/current');
  return response.data;
};

export const fetchFootprintHistory = async () => {
  const response = await API.get('/carbon-footprint/history');
  return response.data;
};

export const fetchFootprintById = async (id) => {
  const response = await API.get(`/carbon-footprint/${id}`);
  return response.data;
};
