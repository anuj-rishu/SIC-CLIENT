import axios from 'axios';
import { getCookie } from 'cookies-next';

// Since this is a different domain, we create a specialized axios instance or use direct calls
const REPORT_API_URL = 'https://4qfrcj97vl.execute-api.ap-south-1.amazonaws.com/api/admin/reports';

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
