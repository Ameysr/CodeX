import BlogCard from "./BlogCard";

/**
 * Blog feed with search, filters, loading skeleton, and blog cards
 */
const BlogFeed = ({
    blogs,
    filteredBlogs,
    blogLoading,
    searchTerm,
    onSearchChange,
    activeFilter,
    onFilterChange,
    user,
    hasLiked,
    showComments,
    commentInputs,
    onToggleLike,
    onToggleComments,
    onCommentChange,
    onAddComment,
}) => {
    const filters = ["All", "Interview", "Contest", "Career"];

    return (
        <div className="w-full md:w-2/3 md:pr-6 mb-8 md:mb-0">
            {/* Search & Filters */}
            <div className="mb-8 bg-[#131516] p-6 rounded-xl border border-gray-700/50">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search blogs, interviews, contests..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 text-white placeholder-gray-400 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => onFilterChange(filter)}
                                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${activeFilter === filter
                                        ? "bg-gray-600 text-white border border-gray-500"
                                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-gray-700"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Blog Posts */}
            <div className="space-y-0">
                {blogLoading ? (
                    // Loading skeleton
                    [1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="p-6 border-b"
                            style={{ borderBottomColor: "oklch(1 0 0 / 0.3)" }}
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 animate-pulse" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-2 animate-pulse" />
                                    <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse" />
                                </div>
                            </div>
                            <div className="h-5 bg-gray-700 rounded w-3/4 mb-3 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-700 rounded animate-pulse" />
                                <div className="h-3 bg-gray-700 rounded w-5/6 animate-pulse" />
                                <div className="h-3 bg-gray-700 rounded w-4/5 animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : blogs.length > 0 ? (
                    filteredBlogs.map((blog, index) => (
                        <BlogCard
                            key={blog._id}
                            blog={blog}
                            user={user}
                            isLast={index === filteredBlogs.length - 1}
                            hasLiked={hasLiked(blog)}
                            showComments={showComments[blog._id]}
                            commentInput={commentInputs[blog._id]}
                            onToggleLike={onToggleLike}
                            onToggleComments={onToggleComments}
                            onCommentChange={onCommentChange}
                            onAddComment={onAddComment}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">✍️</div>
                        <p className="text-lg font-medium text-white mb-2">
                            No blogs found
                        </p>
                        <p className="text-gray-400">
                            Be the first to share your insights!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogFeed;
