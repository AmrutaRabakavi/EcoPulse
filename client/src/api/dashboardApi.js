import API from './authApi';

export const fetchDashboard = async () => {
  const response = await API.get('/dashboard');
  return response.data;
};

export const fetchActivities = async () => {
  const response = await API.get('/activities');
  return response.data;
};

export const fetchRecentActivities = async () => {
  const response = await API.get('/activities/recent');
  return response.data;
};

export const fetchPointsHistory = async () => {
  const response = await API.get('/points/history');
  return response.data;
};
