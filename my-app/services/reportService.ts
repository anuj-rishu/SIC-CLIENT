import axios from 'axios';
import { getCookie } from 'cookies-next';

// Use environment variable for the reports API URL
const REPORT_API_URL = process.env.NEXT_PUBLIC_REPORTS_API_URL

export const reportService = {
  getReports: async () => {
    const token = getCookie('token');
    return axios.get(REPORT_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  deleteReport: async (id: string) => {
    const token = getCookie('token');
    return axios.delete(`${REPORT_API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
