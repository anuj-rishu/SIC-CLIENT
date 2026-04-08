import axios from 'axios';
import { getCookie } from 'cookies-next';

// Use environment variable for the clubs API URL
const CLUBS_API_URL = process.env.NEXT_PUBLIC_CLUBS_API_URL || 'https://4qfrcj97vl.execute-api.ap-south-1.amazonaws.com/api/admin';

export const clubService = {
  getPendingClubs: async () => {
    const token = getCookie('token') as string;
    return axios.get(`${CLUBS_API_URL}/pending-clubs`, {
      headers: {
        token: token,
        Authorization: `Bearer ${token}`
      }
    });
  },

  approveClub: async (id: string) => {
    const token = getCookie('token') as string;
    // Changing to PATCH as GET returned 404
    return axios.patch(`${CLUBS_API_URL}/approve-club/${id}`, {}, {
      headers: {
        token: token,
        Authorization: `Bearer ${token}`
      }
    });
  }
};
