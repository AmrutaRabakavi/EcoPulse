import API from './authApi';

export const fetchTodayChallenge = async () => {
  const response = await API.get('/challenges/today');
  return response.data;
};

export const generateChallenge = async () => {
  const response = await API.post('/challenges/generate');
  return response.data;
};

export const fetchChallengeHistory = async () => {
  const response = await API.get('/challenges');
  return response.data;
};

export const completeChallenge = async (challengeId) => {
  const response = await API.post(
    `/challenges/${challengeId}/complete`
  );
  return response.data;
};