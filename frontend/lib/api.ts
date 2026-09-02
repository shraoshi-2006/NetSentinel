import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchScans = async () => {
  const response = await api.get('/scans/');
  return response.data;
};

export const fetchScan = async (id: number) => {
  const response = await api.get(`/scans/${id}`);
  return response.data;
};

export const createScan = async (target: string, scanType: string = 'full') => {
  const response = await api.post('/scans/', {
    target,
    scan_type: scanType,
  });
  return response.data;
};
