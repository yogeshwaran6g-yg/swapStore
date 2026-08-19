import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js"



export const authService = {
    login: async (data) => {
        try {
            const res = await apiClient.post(endpoints.AUTH.LOGIN, data);
            return res
        } catch (error) {
            console.log("err from auth service client ", error.message);
            throw error;
        }
    },
    profile: async () => {
        try {
            const res = await apiClient.get(endpoints.AUTH.PROFILE);
            return res
        } catch (err) {
            console.log("err from auth service client ", err.message);
            throw err;
        }
    },


};