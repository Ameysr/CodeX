import axiosClient from "../utils/axiosClient";

/**
 * Fetch all blogs
 */
export const fetchBlogs = async () => {
    const response = await axiosClient.get("/blog");
    const blogsData = response.data.data || response.data;
    return Array.isArray(blogsData) ? blogsData : [];
};

/**
 * Create a new blog post
 */
export const createBlog = async ({ title, content, isAnonymous, category }) => {
    const response = await axiosClient.post("/blog", {
        title,
        content,
        isAnonymous,
        category,
    });
    return response.data.data || response.data;
};

/**
 * Add a comment to a blog
 */
export const addComment = async (blogId, text) => {
    const response = await axiosClient.post(`/blog/${blogId}/comments`, { text });
    return response.data.data || response.data;
};

/**
 * Toggle like on a blog
 */
export const toggleLike = async (blogId) => {
    const response = await axiosClient.post(`/blog/${blogId}/like`);
    return response.data.data || response.data;
};
