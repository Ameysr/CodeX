import axiosClient from "../utils/axiosClient";

/**
 * Fetch problems with pagination
 */
export const fetchProblems = async (page, limit) => {
    const response = await axiosClient.get("/problem/getAllProblem", {
        params: { page, limit },
    });
    return response.data;
};

/**
 * Fetch a single problem by ID
 */
export const fetchProblemById = async (problemId) => {
    const response = await axiosClient.get(`/problem/problemById/${problemId}`);
    return response.data;
};

/**
 * Run code against visible test cases
 */
export const runCode = async (problemId, code, language) => {
    const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language,
    });
    return response.data;
};

/**
 * Submit code for full evaluation
 */
export const submitCode = async (problemId, code, language) => {
    const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language,
    });
    return response.data;
};

/**
 * Get AI analysis of submitted code
 */
export const getAIAnalysis = async (code, language) => {
    const response = await axiosClient.post("/analysis/ai", {
        code,
        language,
    });
    return response.data;
};
