import axiosClient from "../utils/axiosClient";

/**
 * Fetch active promotions
 */
export const fetchActivePromos = async () => {
    const response = await axiosClient.get("/userPromo/active");

    if (response.data.success) {
        return {
            promos: response.data.promos || [],
            totalActivePromos: response.data.totalActivePromos || 0,
            availableSlots: response.data.availableSlots || 0,
            maxSlots: response.data.maxSlots || 3,
        };
    }

    // Fallback for different response structure
    const promos = Array.isArray(response.data) ? response.data : [];
    return {
        promos,
        totalActivePromos: promos.length,
        availableSlots: 3 - promos.length,
        maxSlots: 3,
    };
};

/**
 * Record a promo click
 */
export const recordPromoClick = async (promoId) => {
    const response = await axiosClient.get(`/userPromo/click/${promoId}`);
    return response.data;
};
