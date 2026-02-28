import ProfileAvatar from "../shared/ProfileAvatar";
import { formatDate } from "../../utils/formatters";

/**
 * Individual blog post card with likes, comments, and category tag
 */
const BlogCard = ({
    blog,
    user,
    isLast,
    hasLiked,
    showComments,
    commentInput,
    onToggleLike,
    onToggleComments,
    onCommentChange,
    onAddComment,
}) => {
    return (
        <div className="p-6 transition-all duration-300 hover:bg-gray-900/30 group">
            {/* Author Section */}
            <div className="flex items-center mb-4">
                <ProfileAvatar
                    user={blog.author}
                    isAnonymous={blog.isAnonymous}
                    size="w-12 h-12"
                    className="mr-3"
                />
                <div>
                    <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors duration-200 text-lg">
                        {blog.isAnonymous
                            ? "Anonymous"
                            : `${blog.author?.firstName || "Unknown"} ${blog.author?.lastName || ""
                            }`}
                    </h3>
                    <p className="text-gray-400 text-base">{formatDate(blog.createdAt)}</p>
                </div>
            </div>

            {/* Category Tag */}
            <div className="mb-3">
                <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${blog.category === "interview"
                            ? "bg-blue-500/20 text-blue-400"
                            : blog.category === "contest"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : blog.category === "career"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-500/20 text-gray-400"
                        }`}
                >
                    {blog.category?.charAt(0).toUpperCase() + blog.category?.slice(1)}
                </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors duration-200">
                {blog.title}
            </h2>
            <p className="text-gray-200 mb-6 whitespace-pre-line leading-relaxed text-lg">
                {blog.content}
            </p>

            {/* Like & Comment buttons */}
            <div className="flex space-x-4 text-gray-400 mb-4">
                <button
                    className="flex items-center hover:text-white hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all duration-200 group/like"
                    onClick={() => onToggleLike(blog._id)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 mr-2 transition-all duration-200 group-hover/like:scale-110 ${hasLiked ? "text-red-500" : ""
                            }`}
                        fill={hasLiked ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                    </svg>
                    <span className="font-medium text-base">
                        {blog.likes?.length || 0}
                    </span>
                </button>
                <button
                    className="flex items-center hover:text-white hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all duration-200 group/comment"
                    onClick={() => onToggleComments(blog._id)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2 transition-all duration-200 group-hover/comment:scale-110"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                    <span className="font-medium text-base">
                        {blog.comments?.length || 0}
                    </span>
                </button>
            </div>

            {/* Comment Section */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${showComments
                        ? "max-h-96 opacity-100 mt-6 pt-4 border-t border-gray-700/50"
                        : "max-h-0 opacity-0"
                    }`}
            >
                <div className="transform transition-all duration-300">
                    <div className="flex items-start mb-4">
                        <ProfileAvatar user={user} size="w-10 h-10" className="mr-3" />
                        <div className="flex-1">
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="bg-gray-800 text-white placeholder-gray-400 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-700 transition-all duration-200 text-base"
                                    value={commentInput || ""}
                                    onChange={(e) => onCommentChange(blog._id, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && commentInput?.trim()) {
                                            onAddComment(blog._id);
                                        }
                                    }}
                                />
                                <button
                                    className="bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30"
                                    onClick={() => onAddComment(blog._id)}
                                    disabled={!commentInput?.trim()}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Comments */}
                    {blog.comments?.slice(0, 3).map((comment, idx) => (
                        <div
                            key={`${blog._id}-comment-${idx}`}
                            className="flex mt-4 group/comment-item"
                        >
                            <ProfileAvatar
                                user={comment.user}
                                size="w-9 h-9"
                                className="mr-3"
                            />
                            <div className="bg-gray-800 rounded-lg px-4 py-3 flex-1 group-hover/comment-item:bg-gray-750 transition-colors duration-200">
                                <div className="font-medium text-white text-base">
                                    {comment.user?.firstName || "Unknown"}{" "}
                                    {comment.user?.lastName || ""}
                                </div>
                                <div className="text-gray-200 text-base mt-1">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Divider */}
            {!isLast && (
                <div className="flex justify-center mt-8">
                    <div
                        className="w-5/6 h-px"
                        style={{ backgroundColor: "oklch(1 0 0 / 0.25)" }}
                    />
                </div>
            )}
        </div>
    );
};

export default BlogCard;
