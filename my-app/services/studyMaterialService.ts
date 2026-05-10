import axios from 'axios';
import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_MAIN_BACKEND_URL;

const getAuthHeaders = () => {
    let token = getCookie('token');
    if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const studyMaterialService = {
    getPendingMaterials: async () => {
        const response = await axios.get(`${API_URL}/admin/pending`, getAuthHeaders());
        return response.data;
    },
    approveMaterial: async (id: string) => {
        const response = await axios.post(`${API_URL}/admin/approve/${id}`, {}, getAuthHeaders());
        return response.data;
    },
    rejectMaterial: async (id: string, comment: string) => {
        const response = await axios.post(`${API_URL}/admin/reject/${id}`, { comment }, getAuthHeaders());
        return response.data;
    },
    getWithdrawalRequests: async () => {
        const response = await axios.get(`${API_URL}/admin/withdrawals`, getAuthHeaders());
        return response.data;
    },
    updateWithdrawalStatus: async (id: string, status: string, adminComment: string) => {
        const response = await axios.post(`${API_URL}/admin/withdrawals/${id}`, { status, adminComment }, getAuthHeaders());
        return response.data;
    },
    getCoupons: async () => {
        const response = await axios.get(`${API_URL}/admin/coupons`, getAuthHeaders());
        return response.data;
    },
    createCoupon: async (data: any) => {
        const response = await axios.post(`${API_URL}/admin/coupon`, data, getAuthHeaders());
        return response.data;
    },
    deleteCoupon: async (id: string) => {
        const response = await axios.delete(`${API_URL}/admin/coupon/${id}`, getAuthHeaders());
        return response.data;
    },
    getMaterialRequests: async () => {
        const response = await axios.get(`${API_URL}/admin/requests`, getAuthHeaders());
        return response.data;
    },
    deleteMaterialRequest: async (id: string) => {
        const response = await axios.delete(`${API_URL}/admin/requests/${id}`, getAuthHeaders());
        return response.data;
    },
    adminUploadMaterial: async (formData: FormData) => {
        const response = await axios.post(`${API_URL}/admin/upload`, formData, getAuthHeaders());
        return response.data;
    }
};
