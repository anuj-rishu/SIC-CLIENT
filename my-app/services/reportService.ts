import axios from 'axios';
import { getCookie } from 'cookies-next';

// Use environment variable for the reports API URL
const REPORT_API_URL = process.env.NEXT_PUBLIC_REPORTS_API_URL

export const reportService = {
  getReports: async () => {
    const token = getCookie('token') as string;
    return axios.get(REPORT_API_URL, {
      headers: {
        token: token,
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  deleteReport: async (id: string) => {
    const token = getCookie('token') as string;
    return axios.delete(`${REPORT_API_URL}/${id}`, {
      headers: {
        token: token,
        Authorization: `Bearer ${token}`
      }
    });
  }
};
