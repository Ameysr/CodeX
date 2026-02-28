import { useState, useEffect, useCallback } from "react";
import * as blogService from "../services/blogService";

/**
 * Custom hook for blog CRUD, comments, and likes
 */
const useBlogs = (userId) => {
    const [blogs, setBlogs] = useState([]);
    const [blogLoading, setBlogLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [newBlog, setNewBlog] = useState({
        title: "",
        content: "",
        isAnonymous: false,
        category: "interview",
    });
    const [commentInputs, setCommentInputs] = useState({});
    const [showComments, setShowComments] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    // Fetch blogs on mount
    useEffect(() => {
        const loadBlogs = async () => {
            try {
                setBlogLoading(true);
                const data = await blogService.fetchBlogs();
                setBlogs(data);
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setBlogLoading(false);
            }
        };
        loadBlogs();
    }, []);

    // Filter blogs based on search and category
    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch =
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (blog.author?.firstName + " " + blog.author?.lastName)
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        if (activeFilter === "All") return matchesSearch;
        return matchesSearch && blog.category === activeFilter.toLowerCase();
    });

    const handleBlogChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setNewBlog((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }, []);

    const handleCommentChange = useCallback((blogId, value) => {
        setCommentInputs((prev) => ({ ...prev, [blogId]: value }));
    }, []);

    const toggleCommentSection = useCallback((blogId) => {
        setShowComments((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
    }, []);

    const createBlogPost = useCallback(async () => {
        try {
            const newBlogData = await blogService.createBlog(newBlog);
            setBlogs((prev) => [newBlogData, ...prev]);
            setNewBlog({ title: "", content: "", isAnonymous: false, category: "interview" });
            setShowEditor(false);
        } catch (error) {
            console.error("Failed to create blog:", error);
            alert("Failed to create blog: " + (error.response?.data?.error || error.message));
        }
    }, [newBlog]);

    const addCommentToBlog = useCallback(
        async (blogId) => {
            const text = commentInputs[blogId]?.trim();
            if (!text) return;
            try {
                const updatedBlog = await blogService.addComment(blogId, text);
                setBlogs((prev) => prev.map((b) => (b._id === blogId ? updatedBlog : b)));
                handleCommentChange(blogId, "");
            } catch (error) {
                console.error("Failed to add comment:", error);
            }
        },
        [commentInputs, handleCommentChange]
    );

    const toggleLikeBlog = useCallback(async (blogId) => {
        try {
            const updatedBlog = await blogService.toggleLike(blogId);
            setBlogs((prev) => prev.map((b) => (b._id === blogId ? updatedBlog : b)));
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    }, []);

    const hasLiked = useCallback(
        (blog) => {
            if (!userId || !blog.likes) return false;
            return blog.likes.some((like) => {
                const likeId = typeof like === "object" ? like._id : like;
                return likeId === userId;
            });
        },
        [userId]
    );

    return {
        blogs,
        filteredBlogs,
        blogLoading,
        showEditor,
        setShowEditor,
        newBlog,
        handleBlogChange,
        commentInputs,
        handleCommentChange,
        showComments,
        toggleCommentSection,
        searchTerm,
        setSearchTerm,
        activeFilter,
        setActiveFilter,
        createBlogPost,
        addCommentToBlog,
        toggleLikeBlog,
        hasLiked,
    };
};

export default useBlogs;
